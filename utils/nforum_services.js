const Secrets = require("./secrets");
const CryptoJS = require("crypto-js");
const app = getApp();

module.exports = {
  getWelcomeInfo(onSuccess) {
    return wx.request({
      url: Secrets.openUrl + 'welcomeimg.json',
      data: {
      },
      success: onSuccess
    });
  },
  postLoginInfo(username, password, onSuccess) {
    let date = Date.now() / 1000;
    let dateStr = Math.round(date).toString();
    let sourceStr = dateStr + Secrets.identifier;
    let digest = CryptoJS.MD5(Secrets.clientID + Secrets.appleID + Secrets.bundleID + dateStr).toString();
    let appKey = digest;
    let body = {
      'appkey': appKey,
      'source': sourceStr,
      'username': CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(username)).toString(),
      'password': CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(password)).toString(),
    };
    return wx.request({
      url: 'https://bbs.byr.cn/' + Secrets.tokenDir,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: body,
      success: onSuccess
    });
  },
  getTopten(onSuccess) {
    return wx.request({
      url: Secrets.openUrl + 'widget/topten.json',
      data: {
        oauth_token: app.globalData.accessToken
      },
      success: onSuccess
    });
  },
  getTimeline(page, onSuccess) {
    return wx.request({
      url: Secrets.openUrl + 'favorpost.json',
      data: {
        oauth_token: app.globalData.accessToken,
        page: page
      },
      success: onSuccess
    });
  },
  getThread(boardname, artid, page, onSuccess) {
    return wx.request({
      url: Secrets.openUrl + `threads/${boardname}/${artid}.json`,
      data: {
        oauth_token: app.globalData.accessToken,
        page: page,
        count: 20
      },
      success: onSuccess
    });
  },
  likeArticle(boardname, artid, onSuccess) {
    return wx.request({
      url: Secrets.openUrl + `article/${boardname}/like/${artid}.json`,
      data: {
        oauth_token: app.globalData.accessToken,
      },
      success: onSuccess
    });
  },
  votedownArticle(boardname, artid, onSuccess) {
    return wx.request({
      url: Secrets.openUrl + `article/${boardname}/votedown/${artid}.json`,
      data: {
        oauth_token: app.globalData.accessToken,
      },
      success: onSuccess
    });
  },
  getSectionList(onSuccess) {
    return wx.request({
      url: Secrets.openUrl + `section.json`,
      data: {
        oauth_token: app.globalData.accessToken,
      },
      success: onSuccess
    });
  },
  getSection(sectionName, onSuccess) {
    return wx.request({
      url: Secrets.openUrl + `section/${sectionName}.json`,
      data: {
        oauth_token: app.globalData.accessToken,
      },
      success: onSuccess
    });
  },
  getBoard(boardName, page, count, content, onSuccess) {
    let obj = {
      oauth_token: app.globalData.accessToken,
      page: page,
      count: count ? count : 30,
      content: content,
    };
    return wx.request({
      url: Secrets.openUrl + `board/${boardName}.json`,
      data: Object.keys(obj)
      .filter((k) => (obj[k] != null))
      .reduce((a, k) => ({ ...a, [k]: obj[k] }), {}),
      success: onSuccess
    });
  },
  postArticle(boardName, title, content, reid, anony, onSuccess) {
    let obj = {
      oauth_token: app.globalData.accessToken,
      title: title,
      content: content,
      reid: reid,
      anonymous: anony ? 1 : 0,
    };
    return wx.request({
      url: Secrets.openUrl + `article/${boardName}/post.json`,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: Object.keys(obj)
      .filter((k) => (obj[k] != null))
      .reduce((a, k) => ({ ...a, [k]: obj[k] }), {}),
      success: onSuccess
    });
  },
};