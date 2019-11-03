// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//[触发器顺序=1]每日重置逻辑
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //重置所有学院为未爬取(`crawed:false`),未diff(`diffed:false`)
  await db.collection('academy').where({
    _id: _.neq(0)
  }).update({
    data: {
      crawed: false,
      diffed: false
    }
  });

  //重置metaData中邮件发送编号为0(`email_num: 0`)
  await db.collection('metaData').doc('1').update({
    data: {
      email_num: 0
    }
  })

  return {
    ok: true
  }
}