// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

//触发器测试函数

// 云函数入口函数
exports.main = async(event, context) => {
  const db = cloud.database();

  let old_dt = await db.collection('counters').doc("a2d88fa25db1b154001a2cfa26e1e2cc").get();

  await db.collection('counters').doc("a2d88fa25db1b154001a2cfa26e1e2cc").update({
    data: {
      count: old_dt.data.count + 1
    }
  });

  return {
    ok: true
  }
}