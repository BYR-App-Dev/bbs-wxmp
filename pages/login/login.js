const NForumServices = require("../../utils/nforum_services.js");
const app = getApp();
let afterlogin = `/pages/topten/topten`;
Page({
  data: {
    loading: true,
    idTxt: "",
    pwdTxt: "",
    warningTxt: "",
    welUrl: "",
  },
  idInput(e) {
    this.setData({ idTxt: e.detail.value });
  },
  pwdInput(e) {
    this.setData({ pwdTxt: e.detail.value });
  },
  loginTap(e) {
    const wts = this;
    if (this.data.pwdTxt && this.data.idTxt) {
      NForumServices.postLoginInfo(this.data.idTxt, this.data.pwdTxt, (r) => {
        if (r.data.code) {
          wts.setData({
            warningTxt: "登录失败，请重试"
          });
        } else {
          wx.setStorageSync('accesstoken', r.data.access_token);
          app.globalData.accessToken = r.data.access_token;
          if (afterlogin == `/pages/topten/topten`) {
            wx.switchTab({
              url: `/pages/topten/topten`
            });
          } else {
            wx.redirectTo({
              url: afterlogin
            });
          }
        }
      });
    }
  },
  onLoad: function (options) {
    const wts = this;
    wts.setData({
      loading: true,
    });
    NForumServices.getWelcomeInfo((res) => {
      wts.setData({
        loading: true,
        welUrl: res.data.url
      });
    });
    afterlogin = options.rt ? unescape(options.rt) : `/pages/topten/topten`;
    wx.setNavigationBarTitle({
      title: "登录"
    });
    if (app.globalData.accessToken) {
      wx.switchTab({
        url: `/pages/topten/topten`
      });
    }
    this.setData({
      loading: false
    });
  },

  onUnload: function () {
    afterlogin = `/pages/topten/topten`;
  }
})