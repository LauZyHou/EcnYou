// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//todo 设置过期时间
//todo 设置尝试次数

// 云函数入口函数
exports.main = async(event, context) => {
  //获取调用此函数的用户的openID
  const wxContext = cloud.getWXContext();
  let user_openid = wxContext.OPENID;

  //获取用户发送来的验证码
  let code = event.code;

  //todo 检查codes集合中<openid,code,时间,错误尝试次数>中code一致
  //并且时间不超过过期时间,并且错误尝试次数<最大尝试次数

  //如果时间超了

  //如果错误尝试次数超了

  //如果code不一致,增加过期尝试次数

  //如果接受,写入users集合

  return {
    msg: "收" + code
  }
}