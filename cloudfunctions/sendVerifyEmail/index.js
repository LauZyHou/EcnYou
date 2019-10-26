// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  //获取调用此函数的用户的openID
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;

  //获取用户发送来的邮件
  let email = event.email;

  //todo 检查codes集合,<openid,code,时间>,当前时间-时间>10s,如果太短了,返回时间太短

  //todo 随机生成code

  //todo 更新code集合<openid,code,当前时间>

  //todo 向event.email发送邮件,内容是code

  return {
    msg: "收" + email
  }
}