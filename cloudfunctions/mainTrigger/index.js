// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数,比较新旧数据,形成邮件并按订阅发给用户
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //获取新旧集合名字
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;
  let lastTab = metadata.data.lastTable;

  //后续将按照标题查询,这里按照标题分出新集合中旧集合没有的内容
  let oldSet = new Set();
  let newSet = new Set();
  let oldData = await db.collection(lastTab).get();
  for (let i = 0; i < oldData.data.length; i++)
    oldSet.add(oldData.data[i]['title']);
  let newData = await db.collection(nextTab).get();
  for (let i = 0; i < newData.data.length; i++)
    newSet.add(newData.data[i]['title']);

  // console.log(difference(newSet,oldSet));
  let diffSet = difference(newSet, oldSet);

  //查询这些标题对应讲座的信息
  let useData = await db.collection(nextTab).where({
    title: _.in(Array.from(diffSet))
  }).get();
  useData = useData.data;
  // console.log(useData);

  //对这些学院去重
  let useOriginSet = new Set();
  for (let i = 0; i < useData.length; i++)
    useOriginSet.add(useData[i]['xyId']);
  //查询这些学院的详细信息,形成{xyId:xyURL1,...}
  let xyData = await db.collection('academy').where({
    xyId: _.in(Array.from(useOriginSet))
  }).get();
  xyData = xyData.data;
  xyHash = {};
  for (let i = 0; i < xyData.length; i++)
    xyHash[xyData[i]['xyId']] = xyData[i]['xyUrl'];
  // console.log(xyHash);

  /*
  //构成{xyId:[{title:"xxx",url:"xxx"},...],...}的报告json结构
  let origin2 = {};
  for (let x of useData) { //对每个具体的新讲座信息
    let xy = x['xyId'];
    if (origin2[xy] == undefined)
      origin2[xy] = new Array();
    origin2[xy].push({
      title: x['title'],
      url: xyHash[xy] + x['href']
    });
  }
  // console.log(origin2);
  */

  //构成{xyId:"title+<br>+xyUrl+href+<br><br>",...}的报告html结构
  let htmls = {};
  for (let x of useData) { //对每个具体的新讲座信息
    let xy = x['xyId'];
    if (htmls[xy] == undefined)
      htmls[xy] = "";
    htmls[xy] += x['title'] + '<br>' + xyHash[xy] + x['href'] + '<br><br>';
  }
  // console.log(htmls);

  //保存报表(同步删除,异步添加)
  //删除全部
  await db.collection('diffMsg').where({
    _id: _.neq(0)
  }).remove();
  //添加一条时间记录,以在没有新讲座时仍知道此触发器触发了
  await db.collection('diffMsg').add({
    data: {
      add_time: dateFormat("YYYY-mm-dd HH:MM", new Date())
    }
  });
  //添加若干的新讲座记录
  for (let xy of useOriginSet) {
    await db.collection('diffMsg').add({
      data: {
        xyId: xy,
        html: htmls[xy]
      }
    });
  }

  //邮件标题
  let em_title = "【EcnYou】讲座更新通知 " + dateFormat("YYYY-mm-dd", new Date()) + "期";
  //对每个用户发送订阅邮件
  let userData = await db.collection('users').get();
  userData = userData.data;
  for (let i = 0; i < userData.length; i++) {
    if (userData[i]['email'] == null || userData[i]['email'].length == 0)
      continue;
    //解析用户的dy1和dy2
    let dy_array = getDyArray(userData[i]['dy1'], userData[i]['dy2']);
    let em_html = "";
    //遍历用户的所有订阅,找当前有更新的订阅,连接HTML
    for (let dy of dy_array) {
      if (useOriginSet.has(dy)) {
        em_html += htmls[dy];
      }
    }
    //只要结果不为"",就说明用户的订阅有更新,向用户发送邮件
    if (em_html.length > 0) {
      await cloud.callFunction({
        name: 'sendEmail2',
        data: {
          subject: em_title,
          to: userData[i]['email'],
          html: em_html
        }
      });
    }
  }

  //交换metaData中的lastTable和nextTable,以在下个周期收到新的邮件
  await db.collection('metaData').doc('1').update({
    data: {
      lastTable: nextTab,
      nextTable: lastTab
    }
  });

  return {
    ok: true
  }
}

//----------------------------------------------------------

//集合差集
function difference(setA, setB) {
  var _difference = new Set(setA);
  for (var elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

//----------------------------------------------------------

//从setDataOrigin中复制一份
//订阅标识,因为整数最多32位,这里每个数组最多长32
const dy1 = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clmp', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud'];
const dy2 = ['dx'];

//解析dy1和dy2,返回订阅字符串数组
function getDyArray(num1, num2) {
  //生成订阅字符串集合
  let dy_st = new Set();
  //for dy1
  let idx = 0;
  while (num1 != 0 && idx < dy1.length) {
    if ((num1 & 1) == 1) {
      dy_st.add(dy1[idx]);
    }
    idx++;
    num1 >>= 1;
  }
  //for dy2
  idx = 0;
  while (num2 != 0 && idx < dy2.length) {
    if ((num2 & 1) == 1) {
      dy_st.add(dy2[idx]);
    }
    idx++;
    num2 >>= 1;
  }

  return Array.from(dy_st);
}

//----------------------------------------------------------

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

//----------------------------------------------------------