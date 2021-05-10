// pages/article/article.js
const NForumServices = require("../../utils/nforum_services.js");
const NForumTextParser = require("../../utils/nforum_text_parser.js");
const app = getApp();
Page({
  data: {
    page: 1,
    boardName: '',
    articleId: 0,
    articles: [],
    likeArticles: [],
    subject: null,
    objCodes: null,
    hasSubject: true,
  },
  onGetData() {
    const wts = this;
    NForumServices.getThread(wts.data.boardName, wts.data.articleId, wts.data.page, (res) => {
      let d = res.data;
      for (const i of d.article) {
        let k = i;
        k.content = k.content.replace(/\n+--\n/g, "");
        k.parsedContent = NForumTextParser.parseText(k);
        let datetime = new Date(k.post_time * 1000);
        k.dateTime = NForumTextParser.getTimeString(datetime);
        k.objCode = "threadArticle/" + wts.data.boardName + "/" + k.id;
        if (wts.data.objCodes.has(k.objCode)) {

        } else {
          if (k.is_subject) {
            wts.data.subject = k;
          } else {
            wts.data.objCodes.add(k.objCode);
            wts.data.articles.push(k);
          }
        }
      }

      if (d.like_articles) {
        for (const i of d.like_articles) {
          let k = i;
          k.content = k.content.replace(/\n+--\n/g, "");
          k.parsedContent = NForumTextParser.parseText(k);
          let datetime = new Date(k.post_time * 1000);
          k.dateTime = NForumTextParser.getTimeString(datetime);
          k.objCode = "threadLikeArticle/" + wts.data.boardName + "/" + k.id;
          if (wts.data.objCodes.has(k.objCode)) {

          } else {
            wts.data.objCodes.add(k.objCode);
            wts.data.likeArticles.push(k);
          }
        }
      }

      let hasSubject = wts.data.subject != null;
      wts.setData({
        articles: wts.data.articles,
        likeArticles: wts.data.likeArticles,
        subject: wts.data.subject,
        hasSubject: hasSubject,
      });
      wx.stopPullDownRefresh();
    })
  },
  onTapLike: function (event) {
    const wts = this;
    const idtoLike = event.currentTarget.dataset.idtor;
    const idx = event.currentTarget.dataset.idx;
    const celltype = event.currentTarget.dataset.celltype;
    if(celltype == 1) {
      if(wts.data.likeArticles[idx].is_liked == true) {

      }else {
        NForumServices.likeArticle(wts.data.boardName, idtoLike, (res) => {
          wts.data.likeArticles[idx].is_liked = true;
          wts.data.likeArticles[idx].like_sum = parseInt(wts.data.likeArticles[idx].like_sum) + 1;
          wts.setData({likeArticles: wts.data.likeArticles});
        });
      }
    }else {
      let articleForCell;
      if(celltype == 0) {
        articleForCell = wts.data.subject;
      }else {
        articleForCell = wts.data.articles[idx];
      }
      if(articleForCell.is_liked == true) {

      }else {
        NForumServices.likeArticle(wts.data.boardName, idtoLike, (res) => {
          if(articleForCell.is_votedown == true) {
            articleForCell.is_votedown = false;
            articleForCell.votedown_sum = parseInt(articleForCell.votedown_sum) - 1;
          }
          articleForCell.is_liked = true;
          articleForCell.like_sum = parseInt(articleForCell.like_sum) + 1;
          if(celltype == 0) {
            wts.setData({subject: wts.data.subject});
          }else {
            wts.setData({articles: wts.data.articles});
          }
        });
      }
    }
  },
  onTapVotedown: function (event) {
    const wts = this;
    const idtoVd = event.currentTarget.dataset.idtor;
    const idx = event.currentTarget.dataset.idx;
    const celltype = event.currentTarget.dataset.celltype;
    if(celltype == 1) {

    }else {
      let articleForCell;
      if(celltype == 0) {
        articleForCell = wts.data.subject;
      }else {
        articleForCell = wts.data.articles[idx];
      }
      if(articleForCell.is_votedown == true) {

      }else {
        NForumServices.votedownArticle(wts.data.boardName, idtoVd, (res) => {
          if(articleForCell.is_liked == true) {
            articleForCell.is_liked = false;
            articleForCell.like_sum = parseInt(articleForCell.like_sum) - 1;
          }
          articleForCell.is_votedown = true;
          articleForCell.votedown_sum = parseInt(articleForCell.votedown_sum) + 1;
          if(celltype == 0) {
            wts.setData({subject: wts.data.subject});
          }else {
            wts.setData({articles: wts.data.articles});
          }
        });
      }
    }
  },
  onTapReply: function (event) {
    const idtoReply = event.currentTarget.dataset.idtor;
    const boardName = event.currentTarget.dataset.boardname;
    const boardDescription = event.currentTarget.dataset.boarddesc;
    const aut = event.currentTarget.dataset.author;
    const content = "【 在 " + aut + " 的大作中提到: 】\n" + NForumTextParser.removeQuote(event.currentTarget.dataset.content);
    const tail = (content.substring(0, 220) + (content.length > 220 ? "\n......" : ""))
      .replace(/\n+/g, '\n')
      .replace(/\n$/g, '')
      .replace(/\n/g, '\n: ')
      + '\n';
    wx.navigateTo({
      url: `../post/post?boardDescription=${boardDescription}&boardName=${boardName}&idtoReply=${idtoReply}&tail=${escape(tail)}`
    });
  },
  onLoad: function (options) {
    const wts = this;
    if (app.globalData.accessToken) {
      wx.setNavigationBarTitle({
        title: "浏览帖子"
      });
      wts.data.objCodes = new Set();
      wts.data.boardName = options.boardName;
      wts.data.articleId = options.articleId;
      this.onGetData();
    } else {
      const boardName = options.boardName;
      const articleId = options.articleId;
      const url = escape(`/pages/thread/thread?boardname=${boardName}&articleId=${articleId}`);
      wx.redirectTo({
        url: `/pages/login/login?rt=${url}`
      });
    }
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {
    const wts = this;
    wts.data.objCodes.clear();
    wts.data.page = 1;
    wts.data.articles = [];
    wts.data.likeArticles = [];
    wts.onGetData();
  },
  onReachBottom: function () {
    const wts = this;
    ++wts.data.page;
    wts.onGetData();
  },
  onShareAppMessage: function () {
    const wts = this;
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: wts.data.subject ? wts.data.subject.title : "北邮人论坛"
        })
      }, 500)
    })
    return {
      title: "北邮人论坛",
      path: `/page/thread/thread?boardName=${wts.data.boardName}&articleId=${wts.data.articleId}`,
      promise
    }
  }
})