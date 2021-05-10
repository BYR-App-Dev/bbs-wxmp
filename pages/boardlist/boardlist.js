// pages/boardlist/boardlist.js
const NForumServices = require("../../utils/nforum_services.js");
const app = getApp();
Page({
  data: {
    backpage: null,
    subsection: [],
    board: [],
    sectionName: "",
  },
  onTapSubsection(e) {
    const eventChannel = this.getOpenerEventChannel();
    const wts = this;
    wx.navigateTo({
      url: `/pages/boardlist/boardlist?sec=${e.currentTarget.dataset.subsectionname}`,
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
  onTapBoard(e) {
    const eventChannel = this.getOpenerEventChannel();
    const wts = this;
    let ps = getCurrentPages();
    if (eventChannel && eventChannel.on) {
      eventChannel.emit('acceptSelectedBoard', { boardname: e.currentTarget.dataset.boardname, desc: e.currentTarget.dataset.description });
    }
    if (wts.data.backpage && wts.data.backpage.finalfun) {
      wts.data.backpage.finalfun(e.currentTarget.dataset.boardname);
    }
  },
  onLoad: function (options) {
    if (app.globalData.accessToken) {
      wx.setNavigationBarTitle({
        title: "版面列表"
      });
      const wts = this;
      wts.data.sectionName = options.sec;
      const eventChannel = wts.getOpenerEventChannel();
      if (eventChannel && eventChannel.on) {
        eventChannel.on('acceptBackPage', function (data) {
          wts.data.backpage = data;
        });
      }
      NForumServices.getSection(wts.data.sectionName, (res) => {
        wts.setData({
          subsection: res.data.sub_section.map((v) => {
            return { "name": v };
          }),
          board: res.data.board,
        });
      });
    } else {
      wx.redirectTo({
        url: `/pages/login/login`
      });
    }
  },
})