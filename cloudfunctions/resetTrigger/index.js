// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//[触发器顺序=1]每日重置逻辑
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //重置所有学院为未爬取(`crawed:false`),未diff(`diffed:false`),存活(`isAlive:true`)
  await db.collection('academy').where({
    _id: _.neq(0)
  }).update({
    data: {
      crawed: false,
      diffed: false,
      isAlive: true
    }
  });

  //重置metaData中邮件发送编号为0(`email_num: 0`),重置上次爬取数据的起始位置游标为-1
  await db.collection('metaData').doc('1').update({
    data: {
      email_num: 0,
      start: -1
    }
  })

  return {
    ok: true
  }
}