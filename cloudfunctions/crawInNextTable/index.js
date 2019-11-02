// 云函数入口文件
const cloud = require('wx-server-sdk');
const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const superagent = require("superagent");
const cheerio = require("cheerio");

cloud.init();

// 云函数入口函数,爬取数据并写入next集合
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //获取所有数据源信息和当前的next表名
  let aca = await db.collection('academy').get();
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;
  let lastTab = metadata.data.lastTable;
  // console.log(newTab);

  // console.log(aca.data);
  // console.log(nextTab);

  //将交换改放到此触发器的最前面,否则查看到的学术报告在更新后仍然是旧的,直到下次更新
  //交换metaData中的lastTable和nextTable,以在下个周期收到新的邮件
  await db.collection('metaData').doc('1').update({
    data: {
      lastTable: nextTab,
      nextTable: lastTab
    }
  });
  //在变量里也要做交换,主要是此触发器需要使用当前正确的nextTable名
  let t = nextTab;
  nextTab = lastTab;
  lastTab = t;

  //删除next表中所有内容
  /*
  await db.collection(nextTab).where({
    _id: _.neq(0)
  }).remove();
  */

  //遍历每个数据源,爬取信息写入next表
  for (let i = 0; i < aca.data.length; i++) {
    let item = aca.data[i];
    let xyId = item['xyId']; //学院的字母缩写表示
    let xyUrl = item['xyUrl']; //学院前缀
    let suffix = item['suffix']; //要爬取的URL后缀
    let title_style = item['title_style']; //标题格式
    let titPath = item['titPath']; //标题css selector
    let timePath = item['timePath']; //发布时间css selector
    // console.log(craw_url);
    // console.log(title_style);

    //获取页面文档数据
    let content = await superagent
      .get(xyUrl + suffix)
      .then(res => {
        return res.text;
      });

    //cheerio也就是nodejs下的jQuery,将整个文档包装成一个集合,定义一个变量$接收
    let $ = cheerio.load(content);
    //定义空数组,用来接收数据
    let titles = new Array();
    let hrefs = new Array();
    let times = new Array();
    //当前时间
    let nowtime = dateFormat("YYYY-mm-dd HH:MM", new Date());
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
      titles.push(mytitle);
      hrefs.push(myhref);
    });
    //2 时间元素
    if (timePath.length > 0) {
      $(timePath).each((index, value) => {
        let time = $(value)[0].children[0].data;
        time = time.replace(/(^\s*)|(\s*$)/g, "");
        times.push(time);
      });
    } else {
      //即便没有时间,也要保持长度一致,这里放入""
      for (let i = 0; i < titles.length; i++)
        times.push("");
    }
    // console.log(titles);
    // console.log(hrefs);
    // console.log(times);
    for (let i = 0; i < titles.length; i++) {
      try {
        //只更新没有的记录,防止过多次写入数据库导致超时
        db.collection(nextTab).where({
          xyId: xyId,
          href: hrefs[i],
        }).count().then(res => {
          if (res.total == 0) {
            db.collection(nextTab).add({
              data: {
                xyId: xyId,
                title: titles[i],
                href: hrefs[i], //不保存URL前缀,前端读下来再拼上
                publish_time: times[i], //注意这是发布时间,不是报告的时间
                add_time: nowtime //在数据库中添加条目的时间
              }
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
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