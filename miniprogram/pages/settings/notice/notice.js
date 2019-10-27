// miniprogram/pages/settings/notice/notice.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    verify: 0, //0等待,1显示验证页,2显示解绑页
    email: null,
    code: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (!app.globalData.openid) {
      console.error("没有openid!");
      return;
    }
    //如果用户已经绑定过了,设置verify为false
    const db = wx.cloud.database();

    //注意不在anync里不能用await,这里也不能直接把结果赋值,要用success回调
    db.collection('users').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        if (res.data.length > 0) { //存在用户
          let old_email = res.data[0].email;
          // console.log(old_email);
          //且邮箱不是null或"",这里约定""是用户解绑了
          if (old_email != null && old_email.length > 0) {
            this.setData({
              verify: 2,
              email: old_email
            });
            return; //!
          }
          // console.log(this.data.verify);//false
        }
        //不存在用户,或存在用户但邮箱没绑定
        this.setData({
          verify: 1
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
    //检查邮件格式
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (!reg.test(this.data.email)) {
      wx.showToast({
        icon: 'none',
        title: "格式错误"
      });
      return;
    }
    //调用云函数发送邮件
    wx.cloud.callFunction({
      name: 'sendVerifyEmail',
      data: {
        email: this.data.email
      },
      success: res => {
        //将传回的成功/失败信息显示
        wx.showToast({
          icon: res.result.icon, //图标格式也从云端传来,因为可能因为等待时间不足被禁止
          title: res.result.msg //直接输出提示信息
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: "出错!请反馈"
        });
        console.error(err);
      }
    });
    //todo 按钮变成待定状态
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
        //区分是否接受(这里不是出错),接受后设置为已绑定页面
        if (res.result.icon == 'success') {
          this.setData({
            verify: 2,
            email: res.result.email
          });
        }
        wx.showToast({
          icon: res.result.icon,
          title: res.result.msg
        });
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: "出错!请反馈"
        });
        console.error(err);
      }
    });
  },

  //[点击]解除绑定
  relieve: function(e) {
    let that = this;

    wx.showModal({
      title: '注意',
      content: '确定要解除邮箱绑定吗？',
      success: function(res) {
        if (res.confirm) {
          wx.cloud.callFunction({ //调用云函数解绑定
            name: 'breakBinding',
            data: {},
            success: res => {
              if (res.result.ok == true) { //解除绑定成功
                wx.showToast({
                  icon: 'success',
                  title: "成功解绑!"
                });
                that.setData({
                  verify: 1,
                  email: ''
                });
              } else {
                wx.showToast({
                  icon: 'none',
                  title: "update出错"
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
          })
        } else if (res.cancel) {}
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