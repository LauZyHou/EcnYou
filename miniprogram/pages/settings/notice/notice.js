// miniprogram/pages/settings/notice/notice.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    verify: true,
    email: null,
    code: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取email
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

  // [点击]发送电子邮件
  clk_send: function(e) {
    //调用云函数发送邮件
    wx.cloud.callFunction({
      name: 'sendVerifyEmail',
      data: {
        email: this.data.email
      },
      success: res => {
        //todo 区分是不是太频繁(恶意调用)
        wx.showToast({
          title: res.result.msg
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: "sendVerifyEmail出错！请反馈"
        });
        console.error(err);
      }
    });
  },

  // [点击]发送验证码
  clk_verify: function(e) {
    //调用云函数发送验证码
    wx.cloud.callFunction({
      name: 'sendVerifyCode',
      data: {
        code: this.data.code
      },
      success: res => {
        //todo 区分是否不接受,这里不是出错
        wx.showToast({
          title: res.result.msg
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: "sendVerifyCode出错！请反馈"
        });
        console.error(err);
      }
    });
  },

  //----------------------------------------------------------

  // 键入内容绑定到email
  bind_email: function(e) {
    this.setData({
      email: e.detail.value
    });
  },

  // 键入内容绑定到code
  bind_code: function(e) {
    this.setData({
      code: e.detail.value
    });
  }

});