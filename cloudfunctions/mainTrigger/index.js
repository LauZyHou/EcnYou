// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数,比较新旧数据,形成邮件并按订阅发给用户
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //获取新旧集合名字
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;
  let lastTab = metadata.data.lastTable;

  //后续将按照标题查询,这里按照标题分出新集合中旧集合没有的内容
  let oldSet = new Set();
  let newSet = new Set();
  let oldData = await db.collection(lastTab).get();
  for (let i = 0; i < oldData.data.length; i++)
    oldSet.add(oldData.data[i]['title']);
  let newData = await db.collection(nextTab).get();
  for (let i = 0; i < newData.data.length; i++)
    newSet.add(newData.data[i]['title']);

  // console.log(difference(newSet,oldSet));
  let diffSet = difference(newSet, oldSet);

  //查询这些标题对应讲座的信息
  let useData = await db.collection(nextTab).where({
    title: _.in(Array.from(diffSet))
  }).get();
  useData = useData.data;
  // console.log(useData);

  //对这些学院去重
  let useOriginSet = new Set();
  for (let i = 0; i < useData.length; i++)
    useOriginSet.add(useData[i]['xyId']);
  //查询这些学院的详细信息,形成{xyId:xyURL1,...}
  let xyData = await db.collection('academy').where({
    xyId: _.in(Array.from(useOriginSet))
  }).get();
  xyData = xyData.data;
  xyHash = {};
  for (let i = 0; i < xyData.length; i++)
    xyHash[xyData[i]['xyId']] = xyData[i]['xyUrl'];
  // console.log(xyHash);

  /*
  //构成{xyId:[{title:"xxx",url:"xxx"},...],...}的报告json结构
  let origin2 = {};
  for (let x of useData) { //对每个具体的新讲座信息
    let xy = x['xyId'];
    if (origin2[xy] == undefined)
      origin2[xy] = new Array();
    origin2[xy].push({
      title: x['title'],
      url: xyHash[xy] + x['href']
    });
  }
  // console.log(origin2);
  */

  //构成{xyId:"title+<br>+xyUrl+href+<br><br>",...}的报告html结构
  let htmls = {};
  for (let x of useData) { //对每个具体的新讲座信息
    let xy = x['xyId'];
    if (htmls[xy] == undefined)
      htmls[xy] = "";
    htmls[xy] += x['title'] + '<br>' + xyHash[xy] + x['href'] + '<br><br>';
  }
  console.log(htmls);


  return {
    ok: true
  }
}


//集合差集
function difference(setA, setB) {
  var _difference = new Set(setA);
  for (var elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}