// miniprogram/pages/academic-report/academic-report.js

var xy_ids = ['sei', 'cs', 'ed', 'dedu', 'kcx', 'iase', 'dxb', 'geo', 'sees', 'urban', 'sklec', 'fem', 'stat', 'aebs', 'zhwx', 'history', 'philo', 'dp', 'law', 'soci', 'psy', 'comm', 'math', 'phy', 'lps', 'clpm', 'gccp', 'life', 'biomed', 'sbg', 'si-mian', 'iud', 'dx'];
var acas = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,
    index: 0,
    xy_names: ['软件工程学院', '计算机科学与技术学院', '教育学部', '教育学系', '课程与教学系', '教育高等研究院', '地球科学学部', '地理科学学院', '生态与环境科学学院', '城市与区域科学学院', '河口海岸学国家重点实验室', '经济与管理学部', '统计学院', '亚欧商学院', '中国语言文学系', '历史学系', '哲学系', '政治学系', '法学院', '社会发展学院', '心理与认知科学学院', '传播学院', '数学科学学院', '物理与电子科学学院', '精密光谱科学与技术国家重点实验室', '极化材料与器件教育部重点实验室', '上海市绿色化学与化工过程绿色化重点实验室', '生命科学学院', '生命医学研究所(上海市调控生物学重点实验室)', '脑功能基因组学教育部重点实验室', '思勉人文高等研究院', '城市发展研究院', '大夏书院'],
    data_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //调用云函数获取学院讲座信息
    wx.cloud.callFunction({
      name: 'getAcademy',
      data: {},
      success: res => {
        // console.log(res);
        acas = res.result;
        //从本地数据缓存取得用户上次访问的下标
        wx.getStorage({
          key: 'myindex',
          success: function(res) { //成功获取时,设置为上次访问
            that.setData({
              index: res.data,
              loaded: true,
              data_list: acas[xy_ids[res.data]]
            });
          },
          fail: function(err) { //获取失败时,使用默认的软件学院
            that.setData({
              loaded: true,
              data_list: acas[xy_ids[0]]
            });
          }
        });
      },
      fail: err => { //获取讲座信息失败
        console.error(err);
      }
    });
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

  //----------------------------------------------------------

  //本地数据缓存
  _stodata: function() {
    wx.setStorage({
      key: 'myindex',
      data: this.data.index,
    });
  },

  //----------------------------------------------------------

  //[点击]某一项进行复制
  copyBtn: function(e) {
    // console.log(e);
    // console.log(e.currentTarget.id);
    let idx = e.currentTarget.id;
    let that = this;
    wx.setClipboardData({
      data: that.data.data_list[idx]['url'],
      success: function(res) {
        wx.showToast({
          title: '链接复制成功',
        });
      }
    });
  },

  //[完成]学院选择
  bindChange: function(e) {
    this.setData({
      index: e.detail.value,
      data_list: acas[xy_ids[e.detail.value]]
    });
    this._stodata();
  }
})