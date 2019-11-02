// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;

  let aca = await db.collection('academy').get();
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;

  //todo

  return {
    ok: true
  }
}