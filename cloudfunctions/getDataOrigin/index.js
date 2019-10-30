// 云函数入口文件
const cloud = require('wx-server-sdk')

//从setDataOrigin中复制一份
//订阅标识,因为整数最多32位,这里每个数组最多长32
const dy1 = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clmp', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud'];
const dy2 = ['dx'];


cloud.init();

// 云函数入口函数,获取数据源数字并解析成['sei','cs']的形式
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const user_openid = wxContext.OPENID;
  const db = cloud.database();

  //获取
  let num1 = 0;
  let num2 = 0;
  await db.collection('users').where({
    _openid: user_openid
  }).get().then(res => {
    console.log(res);
    if (res.data.length > 0) {
      num1 = res.data[0].dy1;
      num2 = res.data[0].dy2;
    }
  });

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

  return Array.from(dy_st); //无法返回Set对象,转为Array返回
}