// 云函数入口文件
const cloud = require('wx-server-sdk');
// 爬虫相关依赖包
const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const superagent = require("superagent");
const cheerio = require("cheerio");

cloud.init();

// 云函数入口函数,注意,本函数只在本地调试用,用于手动生成数据库信息
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;
  const db = cloud.database();

  let xyName = "课程与教学系";
  let xyId = "kcx";
  //学院网站前缀,带'/'符号
  let xyUrl = "http://www.kcx.ecnu.edu.cn/";
  //要爬取的页面的后缀
  let suffix = "News.aspx?infolb=16&flag=16";
  //要爬取标题和href的元素的path
  let titPath = "#form1 > div.showbox > div > div.ny_title > div.ny_font > table > tbody > tr > td:nth-child(1) > a";
  //要爬取时间元素的path,为""时表示没有时间
  let timePath = "#form1 > div.showbox > div > div.ny_title > div.ny_font > table > tbody > tr > td:nth-child(2)";
  //0:在里面
  //1:属性是title
  //2:在里面但还套了个标签(如span,font)
  //3:comm传播学院,专用,在里面(下标1)又套了个标签(下标0)
  let title_style = 0;

  //fixme 从数据库获取以上参数

  //Very Important!!!!!
  let bc = 2; //用于控制测试=0,保存学院信息=1,保存到A表=2,保存到B表=3
  switch (bc) {
    case 0:
      console.log("测试...");
      break;
    case 1:
      console.log("保存学院信息...");
      break;
    case 2:
      console.log("保存到A表...");
      break;
    case 3:
      console.log("保存到B表...");
      break;
    default:
      console.error("bc设定有错误!");
  }

  let titles = new Array();
  let hrefs = new Array();
  let times = new Array(); //注意这是发布时间,不是报告的时间

  //获取页面文档数据
  var content = await superagent
    .get(xyUrl + suffix)
    .then(res => {
      return res.text;
    }); //end of ".end((error, response) => {",不放在里面就总是会异步

  //cheerio也就是nodejs下的jQuery,将整个文档包装成一个集合,定义一个变量$接收
  var $ = cheerio.load(content);
  //定义一个空数组,用来接收数据
  var result = [];
  //分析文档结构,使用页面上讲座项的公共selector来获取到它们
  //1 标题和href
  $(titPath).each((index, value) => {
    let attr = $(value)[0].attribs;
    //取出的href去除xyURL头部(按照xyUrl划分,并取最后一项)
    let spList = attr.href.split(xyUrl);
    let myhref = spList[spList.length - 1];
    myhref = myhref.replace(/(^\s*)|(\s*$)/g, ""); //去除首尾空白
    //取出的title要看是内部的(0)还是以title标签的(1)
    let mytitle = attr.title; //(1)
    if (title_style == 0) { //(0)
      mytitle = $(value)[0].children[0].data;
    } else if (title_style == 2) { //(2)
      mytitle = $(value)[0].children[0].children[0].data;
    } else if (title_style == 3) { //(3)
      mytitle = $(value)[0].children[1].children[0].data;
    }
    mytitle = mytitle.replace(/(^\s*)|(\s*$)/g, "");
    if (bc == 0) {
      console.log(mytitle);
      console.log(myhref);
    }
    titles.push(mytitle);
    hrefs.push(myhref);
  });
  //2 时间元素
  if (timePath.length > 0) {
    $(timePath).each((index, value) => {
      let time = $(value)[0].children[0].data;
      time = time.replace(/(^\s*)|(\s*$)/g, "");
      if (bc == 0)
        console.log(time);
      times.push(time);
    });
  } else {
    //即便没有时间,也要保持长度一致,这里放入""
    for (let i = 0; i < titles.length; i++)
      times.push("");
  }

  //检查一下三个数组长度一样不
  if (bc == 0)
    console.log(titles.length, hrefs.length, times.length);

  //创建或者更新学院信息
  if (bc == 1) {
    let num = await db.collection('academy').where({
      xyId: xyId
    }).count();
    if (num.total == 0) { //保存时,保存全部信息
      await db.collection('academy').add({
        data: {
          xyName: xyName,
          xyId: xyId,
          xyUrl: xyUrl,
          suffix: suffix,
          titPath: titPath,
          timePath: timePath,
          title_style: title_style,
          isAlive: true
        }
      }).then(res => {
        console.log(res.errMsg);
      });
    } else { //更新时,不更新学院名/学院Id/是否可用
      await db.collection('academy').where({
        xyId: xyId
      }).update({
        data: {
          xyUrl: xyUrl,
          suffix: suffix,
          titPath: titPath,
          timePath: timePath,
          title_style: title_style
        }
      }).then(res => {
        console.log(res.errMsg);
      });
    }
  }

  //保存/更新到A表/B表
  let reportMsg = null;
  if (bc == 2) {
    reportMsg = "reportMsgA";
  } else if (bc == 3) {
    reportMsg = "reportMsgB";
  }
  if (reportMsg != null) {
    //判断是否存在条目
    let num = await db.collection(reportMsg).where({
      xyId: xyId
    }).count();
    //console.log(num);//仅当有await时Promise展开能取到total
    //没有条目时直接添加,有条目时全部删除再添加
    //全部删除
    if (num.total > 0) {
      await db.collection(reportMsg).where({
        xyId: xyId
      }).remove();
    }
    //添加
    for (let i = 0; i < titles.length; i++) {
      await db.collection(reportMsg).add({
        data: {
          xyId: xyId,
          title: titles[i],
          href: hrefs[i], //不保存URL前缀,前端读下来再拼上
          publish_time: times[i], //注意这是发布时间,不是报告的时间
          add_time: dateFormat("YYYY-mm-dd HH:MM", new Date()) //在数据库中添加条目的时间
        }
      });
    }
  }

  return {
    ok: true
  }
}

//日期格式化
function dateFormat(fmt, date) {
  let ret;
  let opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}