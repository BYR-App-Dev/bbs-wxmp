// index.js
const app = getApp();
const NForumServices = require("../../utils/nforum_services.js");
const NForumTextParser = require("../../utils/nforum_text_parser.js");
Component({
  data: {
    topten: [],
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
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
      NForumServices.getTopten((res) => {
        let d = res.data;
        let articles = [];
        for (const i of d.article) {
          let k = i;
          k.title = i.title.substring(0, i.title.length - i.id_count.length - 2);
          k.objCode = "topten/" + k.board_name + "/" + k.id;
          k.content = NForumTextParser.stripText(NForumTextParser.parseEmojiBBCodeString(i.content.replace(/\n+--\n/g, "").replace(/[\r\n]/g, " ")));
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
          articles.push(k);
        }
        wts.setData({
          topten: articles
        });
        wx.stopPullDownRefresh();
      })
    },
    onLoad() {
      if (app.globalData.accessToken) {
        wx.setNavigationBarTitle({
          title: "今日十大"
        });
        let wts = this;
        this.onGetData();
      } else {
        wx.redirectTo({
          url: `/pages/login/login`
        });
      }
    },
    onPullDownRefresh: function () {
      this.onGetData();
    },
  },
})
