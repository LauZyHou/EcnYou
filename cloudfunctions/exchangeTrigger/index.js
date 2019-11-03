// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//[触发器顺序=2]交换AB表先后地位
//将交换改放到所有触发器的最前面,否则查看到的学术报告在更新后仍然是旧的,直到下次更新
//交换metaData中的lastTable和nextTable,以在下个周期收到新的邮件
exports.main = async (event, context) => {
  const db = cloud.database();
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;
  let lastTab = metadata.data.lastTable;

  await db.collection('metaData').doc('1').update({
    data: {
      lastTable: nextTab,
      nextTable: lastTab
    }
  });

  return {
    ok: true
  }
}