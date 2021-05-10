// pages/board_selector/board_selector.js
const NForumServices = require("../../utils/nforum_services.js");
const app = getApp();
Page({
  data: {
    backpage: null,
    sections: [],
  },
  onTapSection: function (e) {
    const wts = this;
    const eventChannel = this.getOpenerEventChannel();
    wx.navigateTo({
      url: `/pages/boardlist/boardlist?sec=${e.currentTarget.dataset.sectionname}`,
      events: {
        acceptSelectedBoard: function (data) {
          eventChannel.emit('acceptSelectedBoard', data);
        },
      },
      success: function (res) {
        res.eventChannel.emit('acceptBackPage', wts.data.backpage);
      }
    })
  },
  onLoad: function (options) {
    if (app.globalData.accessToken) {
      wx.setNavigationBarTitle({
        title: "分区列表"
      });
      const wts = this;
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel && eventChannel.on) {
        eventChannel.on('acceptBackPage', function (data) {
          wts.data.backpage = data;
        });
      }
      NForumServices.getSectionList((res) => {
        let d = res.data;
        wts.setData({
          sections: d.section
        });
      });
    } else {
      wx.redirectTo({
        url: `/pages/login/login`
      });
    }
  },
})