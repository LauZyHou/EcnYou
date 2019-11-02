// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

//触发器测试函数

// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database();


  return {
    ok: true
  }
}