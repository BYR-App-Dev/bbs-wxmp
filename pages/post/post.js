const NForumServices = require("../../utils/nforum_services");
const app = getApp();
// pages/post.js
Page({
  data: {
    selectedBoard: "",
    selectedBoardDesc: "",
    reid: null,
    anony: false,
    title: "",
    content: "",
    tail: "",
    focus: false,
    prevEmoticon: "",
    titlefixed: false,
    showEmoticon: false,
    emoticoncateselected: 'yoyocici',
    cursor: 0,
    yoyocici: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41],
    tuzki: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
    oniontou: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58],
  },
  onLoad: function(options) {
    if(app.globalData.accessToken) {
      const wts = this;
      wts.setData({
        selectedBoard: options.boardName,
        selectedBoardDesc: options.boardDescription,
        reid: options.idtoReply,
        tail: unescape(options.tail ? options.tail : ""),
        titlenotfixed: options.idtoReply ? false : true,
        title: options.idtoReply ? "RE" : "",
      });
      if(options.idtoReply) {
        wx.setNavigationBarTitle({
          title: "回复内容"
        });
      }
      else {
        wx.setNavigationBarTitle({
          title: "发表内容"
        });
      }
    }else {
      wx.redirectTo({
        url: `/pages/login/login`
      });
    }
  },
  emoticonCateTap: function(e) {
    const wts = this;
    wts.setData({emoticoncateselected: e.currentTarget.dataset.cate});
  },
  emoticonTap: function(e) {
    const wts = this;
    wts.setData({showEmoticon: !this.data.showEmoticon});
  },
  emoticonSelect: function(e) {
    const wts = this;
    if(this.data.focus) {
      wts.setData({content: [this.data.content.slice(0, this.data.cursor), `[em${e.currentTarget.dataset.cate}${e.currentTarget.dataset.item}]`, this.data.content.slice(this.data.cursor)].join('')});
      this.data.prevEmoticon = `[em${e.currentTarget.dataset.cate}${e.currentTarget.dataset.item}]`;
    }else {
      let prevEmoticon = `[em${e.currentTarget.dataset.cate}${e.currentTarget.dataset.item}]`;
      wts.setData({focus:true, cursor: wts.data.cursor + prevEmoticon.length, content: [wts.data.content.slice(0, wts.data.cursor), prevEmoticon, wts.data.content.slice(wts.data.cursor)].join('')});
    }
  },
  onTitleInput: function(e) {
    this.data.title = e.detail.value;
  },
  onContentInput: function(e) {
    this.data.content = e.detail.value;
  },
  onBlur: function(e) {
    const wts = this;
    wts.setData({focus:wts.data.prevEmoticon.length > 0, cursor: e.detail.cursor + wts.data.prevEmoticon.length, content: [e.detail.value.slice(0, e.detail.cursor), wts.data.prevEmoticon, e.detail.value.slice(e.detail.cursor)].join('')});
    wts.data.prevEmoticon = "";
  },
  onSelectBoard: function(e) {
    const wts = this;
    let ps = getCurrentPages();
    let currentp = ps[ps.length - 1];
    wx.navigateTo({
      url: '/pages/sectionlist/sectionlist',
      events: {
        acceptSelectedBoard: function(data) {
          wts.setData({
            selectedBoard: data.boardname,
            selectedBoardDesc: data.desc,
          });
        },
      },
      success: function(res) {
        res.eventChannel.emit('acceptBackPage', {finalfun: (bname) => {
          let ps = getCurrentPages();
          for (const [ii, pp] of ps.entries()) {
          if(pp == currentp) {
              wx.navigateBack({delta: ps.length - 1 - ii});
            }
          }
        }} );
      }
    });
  },
  bindFormSubmit: function(e) {
    if(this.data.selectedBoard && this.data.content && this.data.title) {
      NForumServices.postArticle(this.data.selectedBoard, this.data.title, this.data.content + "\n" + this.data.tail, this.data.reid, this.data.anony, (res) => {
        if(res.data.code) {

        }else {
          wx.navigateBack();
        }
      });
    }
  }
})