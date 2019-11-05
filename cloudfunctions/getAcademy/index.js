// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数,获取新表中学院id->[{name:"讲座标题",url:"完整url"},...]的映射信息
exports.main = async(event, context) => {
  const db = cloud.database();

  //获取新表名
  let xb = await db.collection('metaData').doc('1').get();
  xb = xb.data.nextTable;
  // console.log(xb);

  //获取学院信息
  let xyMsg = await db.collection('academy').get();
  xyMsg = xyMsg.data;

  //从新表中获取所有信息(因为一次最多100条这里搞不了)
  // let newTab = await db.collection(xb).get();
  // newTab = newTab.data;
  // console.log(newTab);

  //对每个学院,合成学院id->[{name:"讲座标题",url:"完整url"},...]的映射信息
  let ret = {};
  for (let i = 0; i < xyMsg.length; i++) {
    let xyUrl = xyMsg[i].xyUrl;
    let xyId = xyMsg[i].xyId;
    ret[xyId] = new Array();
    //对该学院的每个讲座
    let aca = await db.collection(xb).where({
      xyId: xyId
    }).orderBy('publish_time', 'desc').orderBy('add_time', 'desc').orderBy('title', 'desc').get();
    aca = aca.data;
    for (let j = 0; j < aca.length; j++) {
      ret[xyId].push({
        name: aca[j].title,
        url: xyUrl + aca[j].href
      });
    }
  }

  return ret;
}