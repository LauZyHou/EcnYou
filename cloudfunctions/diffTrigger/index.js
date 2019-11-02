// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数,从新旧集合生成每个学院的更新HTML
exports.main = async(event, context) => {
  const db = cloud.database();
  const _ = db.command;

  //获取新旧集合名字
  let metadata = await db.collection('metaData').doc('1').get();
  let nextTab = metadata.data.nextTable;
  let lastTab = metadata.data.lastTable;

  let xys = dy1.concat(dy2);
  // console.log(xys);
  let xy2url = {};
  let xy2html = {};
  //对每个学院
  for (let xy of xys) {
    //形成到Url的映射
    let xydata = await db.collection('academy').where({
      xyId: xy
    }).get();
    // console.log(xy);
    xy2url[xy] = xydata.data[0].xyUrl;
    //查询新旧表中该学院的tit,新表中还要形成hash映射tit->href
    xy2html[xy] = "";
    //旧
    let old_tit_data = await db.collection(lastTab).where({
      xyId: xy
    }).get();
    old_tit_data = old_tit_data.data;
    let otd = new Set();
    for (let i = 0; i < old_tit_data.length; i++)
      otd.add(old_tit_data[i].title);
    //新
    let new_tit_data = await db.collection(nextTab).where({
      xyId: xy
    }).get();
    new_tit_data = new_tit_data.data;
    let ntd = new Set();
    for (let i = 0; i < new_tit_data.length; i++)
      ntd.add(new_tit_data[i].title);
    let tit2href = {};
    for (let i = 0; i < new_tit_data.length; i++) {
      tit2href[new_tit_data[i].title] = new_tit_data[i].href;
    }

    //差集
    let diffSet = difference(ntd, otd);
    //遍历差集中的新标题,构成本xy的html
    for (let d of diffSet) {
      xy2html[xy] += d + '<br>' + xy2url[xy] + tit2href[d] + '<br><br>';
    }
    //保存到集合
    db.collection('diffMsg').doc(xy).set({
      data: {
        html: xy2html[xy]
      }
    });
  }
  // console.log(xy2url);

  return xy2html
}

//----------------------------------------------------------

//集合差集
function difference(setA, setB) {
  var _difference = new Set(setA);
  for (var elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

//----------------------------------------------------------

//从setDataOrigin中复制一份
//订阅标识,因为整数最多32位,这里每个数组最多长32
const dy1 = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clpm', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud'];
const dy2 = ['dx'];

//解析dy1和dy2,返回订阅字符串数组
function getDyArray(num1, num2) {
  //生成订阅字符串集合
  let dy_st = new Set();
  //for dy1
  let idx = 0;
  while (num1 != 0 && idx < dy1.length) {
    if ((num1 & 1) == 1) {
      dy_st.add(dy1[idx]);
    }
    idx++;
    num1 >>= 1;
  }
  //for dy2
  idx = 0;
  while (num2 != 0 && idx < dy2.length) {
    if ((num2 & 1) == 1) {
      dy_st.add(dy2[idx]);
    }
    idx++;
    num2 >>= 1;
  }

  return Array.from(dy_st);
}

//----------------------------------------------------------

//日期格式化
function dateFormat(fmt, date) {
  let ret;
  let opt = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

//----------------------------------------------------------