// miniprogram/pages/settings/data-origin/data-origin.js

var selectedValue = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,
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
        checked: true
      },
      {
        name: '教育学系',
        value: 'dedu',
        checked: true
      },
      {
        name: '课程与教学系',
        value: 'kcx',
        checked: true
      },
      {
        name: '职业教育与成人教育研究所',
        value: 'vae',
        checked: true
      },
      {
        name: '国家教育宏观政策研究院',
        value: 'niepr',
        checked: true
      },
      {
        name: '教师教育学院',
        value: 'cte',
        checked: true
      },
      {
        name: '终身教育学院',
        value: 'smile',
        checked: true
      },
      {
        name: '教育高等研究院',
        value: 'iase',
        checked: true
      },
      {
        name: '数据科学与工程学院',
        value: 'dase',
        checked: true
      },
      {
        name: '地球科学学部',
        value: 'dxb',
        checked: true
      },
      {
        name: '地理科学学院',
        value: 'geo',
        checked: true
      },
      {
        name: '生态与环境科学学院',
        value: 'sees',
        checked: true
      },
      {
        name: '城市与区域科学学院',
        value: 'urban',
        checked: true
      },
      {
        name: '河口海岸学国家重点实验室',
        value: 'sklec',
        checked: true
      },
      {
        name: '经济与管理学部',
        value: 'fem',
        checked: true
      },
      {
        name: '统计学院',
        value: 'stat',
        checked: true
      },
      {
        name: '亚欧商学院',
        value: 'aebs',
        checked: true
      },
      {
        name: '中国语言文学系',
        value: 'zhwx',
        checked: true
      },
      {
        name: '历史学系',
        value: 'history',
        checked: true
      },
      {
        name: '哲学系',
        value: 'philo',
        checked: true
      },
      {
        name: '政治学系',
        value: 'dp',
        checked: true
      },
      {
        name: '马克思主义学院',
        value: 'mks',
        checked: true
      },
      {
        name: '法学院',
        value: 'law',
        checked: true
      },
      {
        name: '社会发展学院',
        value: 'soci',
        checked: true
      },
      {
        name: '外语学院',
        value: 'fl',
        checked: true
      },
      {
        name: '心理与认知科学学院',
        value: 'psy',
        checked: true
      },
      {
        name: '传播学院',
        value: 'comm',
        checked: true
      },
      {
        name: '音乐学院',
        value: 'music',
        checked: true
      },
      {
        name: '数学科学学院',
        value: 'math',
        checked: true
      },
      {
        name: '物理与电子科学学院',
        value: 'phy',
        checked: true
      },
      {
        name: '精密光谱科学与技术国家重点实验室',
        value: 'lps',
        checked: true
      },
      {
        name: '极化材料与器件教育部重点实验室',
        value: 'clmp',
        checked: true
      },
      {
        name: '化学与分子工程学院',
        value: 'chem',
        checked: true
      },
      {
        name: '上海市绿色化学与化工过程绿色化重点实验室',
        value: 'gccp',
        checked: true
      },
      {
        name: '生命科学学院',
        value: 'life',
        checked: true
      },
      {
        name: '生命医学研究所(上海市调控生物学重点实验室)',
        value: 'biomed',
        checked: true
      },
      {
        name: '脑功能基因组学教育部重点实验室',
        value: 'sbg',
        checked: true
      },
      {
        name: '思勉人文高等研究院',
        value: 'si-mian',
        checked: true
      },
      {
        name: '城市发展研究院',
        value: 'iud',
        checked: true
      },
      {
        name: '经管书院',
        value: 'cem',
        checked: true
      },
      {
        name: '大夏书院',
        value: 'dx',
        checked: true
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //获取到订阅数据,写入checked中
    wx.cloud.callFunction({
      name: 'getDataOrigin',
      data: {},
      success: res => {
        //将订阅数组转为Set,然后对每个array_origin中的项判断在不在其中,设置checked
        let dys = new Set(res.result);
        let aos = this.data.array_origin;
        for (let i = 0; i < aos.length; i++) {
          if (dys.has(aos[i]['value'])) {
            aos[i]['checked'] = true;
            // console.log(aos[i]);
          } else
            aos[i]['checked'] = false;
        }
        this.setData({
          array_origin: aos,
          loaded: true
        }); //这里不能和最后的setData合到一起,即使把上方的let定义拿出call也无法更新
      },
      fail: err => {
        console.error(err);
      }
    });
    // this.setData({
    //   loaded: true
    // });
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
  },

  //[点击]反选
  clk_fx: function(e) {
    let oldSelectedValue = new Set(selectedValue); //旧的选中项转为集合
    let newSelectedValue = new Set(); //反选后的选中项
    let aos = this.data.array_origin;
    for (let i = 0; i < aos.length; i++) {
      // aos[i]['checked'] = !aos[i]['checked'];
      // if (aos[i]['checked'] == true) {
      //   selectedValue.push(aos[i]['value']);
      // }
      //[bugfix]反选无法反选未保存的选项
      if (oldSelectedValue.has(aos[i]['value'])) { //如果之前是选中项
        aos[i]['checked'] = false; //将其选中状态设置为false
      } else { //如果之前是未选中项
        aos[i]['checked'] = true; //将其选中状态设置为true
        newSelectedValue.add(aos[i]['value']); //添加到新的选中项
      }
    }
    //更新全局选中数据和页面绑定数据
    selectedValue = Array.from(newSelectedValue);
    this.setData({
      array_origin: aos,
    });
  }
})