// pages/board/board.js
const NForumServices = require("../../utils/nforum_services.js");
const NForumTextParser = require("../../utils/nforum_text_parser.js");
const app = getApp();
Page({
  data: {
    boardName: "",
    boardDescription: "",
    page: 1,
    boardArticles: [],
    objCodes: null,
  },
  bindCellTap(event) {
    const articleId = event.currentTarget.dataset.articleid;
    const boardName = event.currentTarget.dataset.boardname;
    wx.navigateTo({
      url: `../thread/thread?boardName=${boardName}&articleId=${articleId}`
    });
  },
  onGetData() {
    const wts = this;
    NForumServices.getBoard(wts.data.boardName, wts.data.page, null, null, (res) => {
      let d = res.data;
      for (const i of d.article) {
        let k = i;
        k.title = i.title;
        let datetime = new Date(k.post_time * 1000);
        k.dateTime = NForumTextParser.getTimeString(datetime);
        k.objCode = "boardArticles/" + k.board_name + "/" + k.id;
        if (wts.data.objCodes.has(k.objCode)) {

        } else {
          wts.data.objCodes.add(k.objCode);
          wts.data.boardArticles.push(k);
        }
      }
      wts.setData({
        boardArticles: wts.data.boardArticles,
      });
      wx.stopPullDownRefresh();
    })
  },
  onLoad(options) {
    const wts = this;
    if (app.globalData.accessToken) {
      wts.data.boardName = options.boardName;
      wts.data.boardDescription = options.boardDescription;
      wx.setNavigationBarTitle({
        title: options.boardDescription ? options.boardDescription : "版面"
      });
      wts.data.objCodes = new Set();
      wts.onGetData();
    } else {
      wx.redirectTo({
        url: `/pages/login/login`
      });
    }
  },
  onPullDownRefresh: function () {
    this.onGetData();
  },
  onReachBottom: function () {
    const wts = this;
    ++wts.data.page;
    wts.onGetData();
  },
})