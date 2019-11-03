// 云函数入口文件
const cloud = require('wx-server-sdk');

var MAX_TRY = 3;
var p = 'ABCDEFGHKMNPQRSTUVWXYZ1234567890';

cloud.init();

//todo 设置过期时间

// 云函数入口函数
exports.main = async(event, context) => {
  //获取调用此函数的用户的openID
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;

  //获取用户发送来的验证码
  let code = event.code;

  console.log(code);

  //检查codes集合中<openid,code,时间,错误尝试次数>中code一致
  //并且时间不超过过期时间,并且错误尝试次数<最大尝试次数

  const db = cloud.database();

  let item = await db.collection('codes').where({
    _openid: user_openid
  }).get();
  //用户在发送邮件生成codes中的记录前可能先点击[提交验证码]
  if (item.data.length == 0) {
    return {
      icon: 'none',
      msg: "请先生成验证码"
    }
  }
  let record = item.data[0]; //取出这条记录
  console.log(record);

  //如果用户已经绑定过了,提示
  let item_user = await db.collection('users').where({
    _openid: user_openid
  }).get();
  if (item_user.data.length > 0) { //存在用户
    let old_email = item_user.data[0].email;
    if (old_email != null && old_email.length > 0) //且邮箱不是null或"",这里约定""是用户解绑了
      return {
        icon: 'none',
        msg: "你已经绑定过了"
      }
  }

  //todo 如果时间超了

  //如果错误尝试次数超了
  if (record.try_num > MAX_TRY) {
    return {
      icon: 'none',
      msg: "尝试次数用完"
    }
  }

  //如果code不一致,增加过期尝试次数
  if (code != record.code) {
    await db.collection('codes').where({
      _openid: user_openid
    }).update({
      data: {
        try_num: record.try_num + 1
      }
    });
    return {
      icon: 'none',
      msg: "验证码错误!"
    }
  }

  //运行至此,接受,写入users集合
  let num = await db.collection('users').where({
    _openid: user_openid
  }).count();
  if (num.total == 0) { //新用户,加入
    //[feature]添加用户uid为当前表中用户数
    let unum = await db.collection('users').count();
    await db.collection('users').add({
      data: {
        "_openid": user_openid,
        "email": record.email,
        "dy1": 0,
        "dy2": 0,
        "uid": unum.total
      }
    });
  } else { //老用户,更新
    await db.collection('users').where({
      "_openid": user_openid
    }).update({
      data: {
        "email": record.email
      }
    });
  }

  //因为接受了这个验证码,不能让用户又用此验证码做其它事情,这里直接将这个验证码换掉
  //虽然尝试次数还在,但不能保证其它地方用的验证码尝试次数上限和这里一样
  let nonce = '';
  for (var i = 0; i < 4; i++) { // 生成4个字符
    nonce += p.charAt(Math.random() * p.length | 0);
  }
  await db.collection('codes').where({
    "_openid": user_openid
  }).update({
    data: {
      code: nonce
    }
  });

  return {
    icon: 'success',
    msg: "绑定成功!",
    email: record.email //这个返回回去给用户界面上绑定邮箱
  }
}