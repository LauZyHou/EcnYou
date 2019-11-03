// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

//每次调用此触发器,处理的用户uid区间长度
//实际上uid可能重复,区间里不一定仅这么多用户
var max_num = 5;

//[触发器顺序=5]从diffMsg中取出HTML,并按订阅发邮件给用户
exports.main = async(event, context) => {
  //从metaData中取出数字
  const db = cloud.database();
  const _ = db.command;
  let metadata = await db.collection('metaData').doc('1').get();
  let email_num = metadata.data.email_num; //当前发送到的用户序号

  //邮件标题
  let em_title = "【EcnYou】讲座更新通知 " + dateFormat("YYYY-mm-dd", new Date()) + "期";

  //只搜索[email_num,email_num+max_num)左闭右开区间的用户
  let userData = await db.collection('users').where({
    uid: _.lt(email_num + max_num),
    uid: _.gte(email_num)
  }).get();
  userData = userData.data;
  if (userData.length == 0) //区间里已经没有用户,提早结束
    return {
      ok: true
    }

  //取出diffMsg中的更新信息
  let diffData = await db.collection('diffMsg').get();
  diffData = diffData.data;
  htmls = {}
  for (let i = 0; i < diffData.length; i++)
    htmls[diffData[i]._id] = diffData[i].html;

  //对每个用户发送订阅邮件
  for (let i = 0; i < userData.length; i++) {
    //没有邮箱,跳过
    if (userData[i]['email'] == null || userData[i]['email'].length == 0)
      continue;
    //解析用户的dy1和dy2
    let dy_array = getDyArray(userData[i]['dy1'], userData[i]['dy2']);
    let em_html = "";
    //遍历用户的所有订阅,找当前有更新的订阅,连接HTML
    for (let dy of dy_array) {
      if (htmls[dy].length > 0) {
        em_html += htmls[dy];
      }
    }
    //[异步]只要结果不为"",就说明用户的订阅有更新,向用户发送邮件
    if (em_html.length > 0) {
      cloud.callFunction({
        name: 'sendEmail2',
        data: {
          subject: em_title,
          to: userData[i]['email'],
          html: em_html
        }
      });
    }
  }

  //这一组完成后,设置email_num,本触发器多次执行,email_num是公共资源,这里不能异步
  await db.collection('metaData').doc('1').update({
    data: {
      email_num: email_num + max_num
    }
  });

  return {
    ok: true
  }
}

//----------------------------------------------------------

//从setDataOrigin中复制一份
//订阅标识,因为整数最多32位,这里每个数组最多长32
const dy1 = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clpm', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud'];
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
