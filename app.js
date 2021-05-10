// app.js
App({
  onLaunch() {
    const token = wx.getStorageSync('accesstoken')
    if(token) {
      this.globalData.accessToken = token;
    }

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    wx.setNavigationBarTitle({
      title: "北邮人论坛"
    });
  },
  globalData: {
    userInfo: null,
    accessToken: null
  }
})
