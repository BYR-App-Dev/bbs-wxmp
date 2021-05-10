// index.js
const app = getApp();
const NForumServices = require("../../utils/nforum_services.js");
const NForumTextParser = require("../../utils/nforum_text_parser.js");
Component({
  data: {
    page: 1,
    timeline: [],
    objCodes: null,
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  },
  methods: {
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs'
      });
    },
    bindCellTap(event) {
      const articleId = event.currentTarget.dataset.artid;
      const boardName = event.currentTarget.dataset.boardname;
      wx.navigateTo({
        url: `../thread/thread?boardName=${boardName}&articleId=${articleId}`
      });
    },
    onGetData() {
      let wts = this;
      NForumServices.getTimeline(wts.data.page, (res) => {
        let d = res.data;
        for (const i of d.article) {
          let k = i;
          k.title = i.title;
          k.objCode = "timeline/" + k.board_name + "/" + k.id;
          if (wts.data.objCodes.has(k.objCode)) {

          } else {
            k.content = NForumTextParser.stripText(NForumTextParser.parseEmojiBBCodeString(i.content.replace(/\n+--\n/g, "").replace(/[\r\n]/g, " ")));
            let datetime = new Date(k.post_time * 1000);
            k.dateTime = NForumTextParser.getTimeString(datetime);
            k.isImgShow = false;
            if (k.attachment.file) {
              for (const ff of k.attachment.file) {
                if (ff.name.match(/(jpg|png|gif)$/)) {
                  k.isImgShow = true;
                  k.imgHTML = `<img style='height:150rpx;width:150rpx;border-radius:20rpx' src=${NForumTextParser.appendOAuthToken(ff.thumbnail_small.replace('api', 'open') + "?")} ignore></img>`;
                  break;
                }
              }
            }
            wts.data.objCodes.add(k.objCode);
            wts.data.timeline.push(k);
          }
        }
        wts.setData({
          timeline: wts.data.timeline
        });
        wx.stopPullDownRefresh();
      })
    },
    onLoad() {
      if (app.globalData.accessToken) {
        wx.setNavigationBarTitle({
          title: "时间线"
        });
        let wts = this;
        wts.data.objCodes = new Set();
        wts.onGetData();
      } else {
        wx.redirectTo({
          url: `/pages/login/login`
        });
      }
    },
    onPullDownRefresh: function () {
      const wts = this;
      wts.data.objCodes.clear();
      wts.data.page = 1;
      wts.data.timeline = [];
      wts.onGetData();
    },
    onReachBottom: function () {
      const wts = this;
      ++wts.data.page;
      wts.onGetData();
    },
  },
})
