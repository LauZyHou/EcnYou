// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数,解除绑定邮箱
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;
  //数据库
  const db = cloud.database();

  //从数据库中将邮箱更新为""
  var ok = false;
  await db.collection('users').where({
    _openid: user_openid
  }).update({
    data: {
      email: ''
    }
  }).then(res => {
    if (res.errMsg == "collection.update:ok")
      ok = true;
  });
  //云函数里success和fail不回调,要用Promise写法

  return {
    ok: ok
  }
}