// 云函数入口文件
const cloud = require('wx-server-sdk');

var p = 'ABCDEFGHKMNPQRSTUVWXYZ1234567890';

var TIME_DIFF = 40;

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

//------------------------------------------------------


// 云函数入口函数
exports.main = async(event, context) => {
  //获取调用此函数的用户的openID
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;
  //数据库
  const db = cloud.database();

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

  //获取用户发提交的邮件地址
  let email = event.email;

  //当前请求的秒级时间戳
  let now_time = Date.parse(new Date()) / 1000;

  //step-0 随机生成四位code,存在变量nonce里
  let nonce = '';
  for (var i = 0; i < 4; i++) { // 生成4个字符
    nonce += p.charAt(Math.random() * p.length | 0);
  }

  //step-1 检查,并将nonce,add_time添加到codes集合
  let nums = await db.collection('codes').where({
    _openid: user_openid
  }).count();
  //没有,说明是第一次访问,那么只要将随机生成的code,当前时间,email地址写入
  if (nums.total == 0) {
    await db.collection('codes').add({
      data: {
        _openid: user_openid,
        code: nonce,
        add_time: now_time,
        email: email,
        try_num: 0 //尝试次数,用于防止尝试验证码
      }
    });
  }
  //有,说明不是第一次访问,要检查当前时间-上次添加的时间>=TIME_DIFF
  else {
    let item = await db.collection('codes').where({
      _openid: user_openid
    }).get();
    let real_diff = now_time - item.data[0].add_time;
    if (real_diff < TIME_DIFF) { //时间未达标
      return {
        icon: 'none',
        msg: "再等" + String(TIME_DIFF - real_diff) + "秒!"
      }
    } else { //时间达标,重设code,当前时间,email地址
      await db.collection('codes').update({
        data: {
          code: nonce,
          add_time: now_time,
          email: email,
          try_num: 0 //不必判断上次是否也是这个邮箱,因为验证码已经改变
        }
      })
    }
  }

  //step-2 向event.email发送邮件,以将验证码提供给用户

  //调用云函数发送邮件
  await cloud.callFunction({
    name: 'sendEmail2',
    data: {
      subject: "【EcnYou】邮箱验证",
      to: email,
      html: "你的验证码是[" + nonce + "]，提交以完成邮箱绑定。<br><br>为了保证后续能收到EcnYou的推送邮件，请将本邮箱加入到你的通讯录中。"
    },
    success(res) {},
    fail(res) {}
  });

  return {
    icon: 'success',
    msg: "邮件已发送"
  }

}