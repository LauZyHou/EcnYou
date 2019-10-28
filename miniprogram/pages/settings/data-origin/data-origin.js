// miniprogram/pages/settings/data-origin/data-origin.js

var selectedValue = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    array_origin: [{
        name: '软件工程学院',
        value: 'sei',
        checked: true
      },
      {
        name: '计算机科学与技术学院',
        value: 'cs',
        checked: true
      },
      {
        name: '教育学部',
        value: 'ed',
        checked: false
      },
      {
        name: '教育学系',
        value: 'dedu',
        checked: false
      },
      {
        name: '课程与教学系',
        value: 'kcx',
        checked: false
      },
      {
        name: '职业教育与成人教育研究所',
        value: 'vae',
        checked: false
      },
      {
        name: '国家教育宏观政策研究院',
        value: 'niepr',
        checked: false
      },
      {
        name: '教师教育学院',
        value: 'cte',
        checked: false
      },
      {
        name: '终身教育学院',
        value: 'smile',
        checked: false
      },
      {
        name: '教育高等研究院',
        value: 'iase',
        checked: false
      },
      {
        name: '数据科学与工程学院',
        value: 'dase',
        checked: true
      },
      {
        name: '地球科学学部',
        value: 'dxb',
        checked: false
      },
      {
        name: '地理科学学院',
        value: 'geo',
        checked: false
      },
      {
        name: '生态与环境科学学院',
        value: 'sees',
        checked: false
      },
      {
        name: '城市与区域科学学院',
        value: 'urban',
        checked: false
      },
      {
        name: '河口海岸学国家重点实验室',
        value: 'sklec',
        checked: false
      },
      {
        name: '经济与管理学部',
        value: 'fem',
        checked: false
      },
      {
        name: '统计学院',
        value: 'stat',
        checked: false
      },
      {
        name: '亚欧商学院',
        value: 'aebs',
        checked: false
      },
      {
        name: '中国语言文学系',
        value: 'zhwx',
        checked: false
      },
      {
        name: '历史学系',
        value: 'history',
        checked: false
      },
      {
        name: '哲学系',
        value: 'philo',
        checked: false
      },
      {
        name: '政治学系',
        value: 'dp',
        checked: false
      },
      {
        name: '马克思主义学院',
        value: 'mks',
        checked: false
      },
      {
        name: '法学院',
        value: 'law',
        checked: false
      },
      {
        name: '社会发展学院',
        value: 'soci',
        checked: false
      },
      {
        name: '外语学院',
        value: 'fl',
        checked: false
      },
      {
        name: '心理与认知科学学院',
        value: 'psy',
        checked: false
      },
      {
        name: '传播学院',
        value: 'comm',
        checked: false
      },
      {
        name: '音乐学院',
        value: 'music',
        checked: false
      },
      {
        name: '数学科学学院',
        value: 'math',
        checked: false
      },
      {
        name: '物理与电子科学学院',
        value: 'phy',
        checked: false
      },
      {
        name: '精密光谱科学与技术国家重点实验室',
        value: 'lps',
        checked: false
      },
      {
        name: '极化材料与器件教育部重点实验室',
        value: 'clmp',
        checked: false
      },
      {
        name: '化学与分子工程学院',
        value: 'chem',
        checked: false
      },
      {
        name: '上海市绿色化学与化工过程绿色化重点实验室',
        value: 'gccp',
        checked: false
      },
      {
        name: '生命科学学院',
        value: 'life',
        checked: false
      },
      {
        name: '生命医学研究所(上海市调控生物学重点实验室)',
        value: 'biomed',
        checked: false
      },
      {
        name: '脑功能基因组学教育部重点实验室',
        value: 'sbg',
        checked: false
      },
      {
        name: '思勉人文高等研究院',
        value: 'si-mian',
        checked: false
      },
      {
        name: '城市发展研究院',
        value: 'iud',
        checked: false
      },
      {
        name: '经管书院',
        value: 'cem',
        checked: false
      },
      {
        name: '大夏书院',
        value: 'dx',
        checked: false
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  //选框变化时,在全局变量更新选中的那些数值
  checkboxChange: function(e) {
    // console.log(e.detail.value);
    selectedValue = e.detail.value;
  },

  //[点击]保存,上传所选内容
  clk_updateDataOrigin: function(e) {
    wx.cloud.callFunction({
      name: 'setDataOrigin',
      data: {
        selectedValue: selectedValue
      },
      success: res => {
        if (res.result.ok == true) { //保存成功
          wx.showToast({
            icon: 'success',
            title: "保存成功!"
          });
        } else {
          wx.showToast({
            icon: 'none',
            title: "出错!请反馈"
          });
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '云函数调用出错'
        });
        console.error(err);
      }
    });
  }
})