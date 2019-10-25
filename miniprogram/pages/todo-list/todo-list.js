// miniprogram/pages/todo-list/todo-list.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cond_db_yb: true, //false表示在"已办"导航条
    navDB: 'nav1',
    navYB: 'nav2',
    array_db: [],
    array_yb: [],
    cond_btn_area: true //true时展示按钮隐藏输入区域,false时反过来
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //从本地数据缓存取得待办和已办列表
    let that = this;
    wx.getStorage({
      key: 'db_and_yb',
      success: function(res) {
        that.setData({
          array_db: res.data[0],
          array_yb: res.data[1]
        });
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
    //本地数据缓存
    wx.setStorage({
      key: 'db_and_yb',
      data: [this.data.array_db, this.data.array_yb],
    })
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

  // [点击]待办
  clk_navDB: function(e) {
    this.setData({
      cond_db_yb: true,
      navDB: 'nav1',
      navYB: 'nav2',
      // cond_isInput: false
    });
  },

  // [点击]已办
  clk_navYB: function(e) {
    this.setData({
      cond_db_yb: false,
      navDB: 'nav2',
      navYB: 'nav1',
      // cond_isInput: false
    });
  },

  // 将某一事项从待办移动到已办
  clk_db2yb: function(e) {
    let id = e.target.id; //获取事件发生项的id(已经设置为array的index)
    let new_yb = this.data.array_db[id]; //这一项的内容
    let db = this.data.array_db;
    let yb = this.data.array_yb;
    db.splice(id, 1); //从待办中将其移除
    yb.push(new_yb); //写入已办项列表
    this.setData({
      array_db: db,
      array_yb: yb
    })
  },

  // 将某一事项从已办移动到待办
  clk_yb2db: function(e) {
    let id = e.target.id; //获取事件发生项的id(已经设置为array的index)
    let new_db = this.data.array_yb[id]; //这一项的内容
    let db = this.data.array_db;
    let yb = this.data.array_yb;
    yb.splice(id, 1); //从已办中将其移除
    db.push(new_db); //写入待办项列表
    this.setData({
      array_db: db,
      array_yb: yb
    })
  },

  // [点击]"添加新事项",要将输入框呼出
  clk_addDb: function(e) {
    this.setData({
      cond_btn_area: false
    });
  },

  // [完成]"添加新事项",要添加,然后将输入框隐藏
  inputed: function(e) {
    //去左右空格,去除后若无内容则不写入
    function trim(s) {
      return s.replace(/(^\s*)|(\s*$)/g, "");
    }
    let str = trim(e.detail.value);
    if (str.length == 0) {
      this.setData({
        cond_btn_area: true
      });
      return;
    }
    //添加
    let db = this.data.array_db;
    db.push(str);
    this.setData({
      array_db: db,
      cond_btn_area: true
    });
  },

  // [点击]清空待办
  // clk_clrDb: function(e) {
  //   this.setData({
  //     array_db: []
  //   });
  // },

  // [点击]清空已办
  clk_clrYb: function(e) {
    let that = this;
    wx.showModal({
      title: '注意',
      content: '确定要清空所有已办事项吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({
            array_yb: []
          });
        } else if (res.cancel) {}
      }
    });
  }

});