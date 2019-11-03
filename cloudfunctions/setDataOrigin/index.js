// 云函数入口文件
const cloud = require('wx-server-sdk');

//订阅标识,因为整数最多32位,这里每个数组最多长32
const dy1 = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clpm', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud'];
const dy2 = ['dx'];

cloud.init();

//采用prototype原型实现方式，查找元素在数组中的索引值
Array.prototype.getArrayIndex = function(obj) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === obj) {
      return i;
    }
  }
  return -1;
}

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const user_openid = wxContext.OPENID;
  const db = cloud.database();


  // {
  //   "name": "软件工程学院",
  //   "value": "sei",
  //   "checked": true
  // }
  //生成几个数字,每个二进制位表示是否订阅了相应的学院
  let num1 = 0;
  let num2 = 0;
  let svs = event.selectedValue;
  let idx;
  console.log(svs);
  for (let i = 0; i < svs.length; i++) {
    //查找元素下标,更新数字
    idx = dy1.getArrayIndex(svs[i]);
    if (idx >= 0)
      num1 |= 1 << idx;
    idx = dy2.getArrayIndex(svs[i]);
    if (idx >= 0)
      num2 |= 1 << idx;
  }

  //判定是否创建了用户
  let cnt = await db.collection('users').where({
    _openid: user_openid
  }).count();

  let ok = false;
  //没有就直接创建
  if (cnt.total == 0) {
    //[feature]添加用户uid为当前表中用户数
    let unum = await db.collection('users').count();
    await db.collection('users').add({
      data: {
        _openid: user_openid,
        email: null,
        dy1: num1,
        dy2: num2,
        uid: unum.total
      }
    }).then(res => {
      if (res.errMsg == "collection.add:ok")
        ok = true;
    });
  }
  //有就更新
  else {
    await db.collection('users').where({
      _openid: user_openid
    }).update({
      data: {
        dy1: num1,
        dy2: num2
      }
    }).then(res => {
      if (res.errMsg == "collection.update:ok")
        ok = true;
    });
  }

  return {
    ok: ok
  }

}