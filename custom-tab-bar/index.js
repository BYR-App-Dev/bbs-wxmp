const app = getApp();

Component({
  data: {
    showSelector: false,
    selected: 0,
    color: "#858585",
    selectedColor: "#000000",
    list: [
      {
        tabtype: 0,
        pagePath: "/pages/topten/topten",
        icon: "home",
        iconColor: "#22aa66",
        text: "今日十大"
      },
      {
        tabtype: 0,
        pagePath: "/pages/timeline/timeline",
        icon: "discover",
        iconColor: "#00aaff",
        text: "时间线"
      },
      {
        tabtype: 1,
        pagePath: "/pages/post/post",
        icon: "pencil",
        iconColor: "black",
        text: "发帖"
      },
      {
        tabtype: 2,
        pagePath: "/pages/sectionlist/sectionlist",
        icon: "pad",
        iconColor: "purple",
        text: "版面"
      },
      {
        tabtype: 3,
        pagePath: "/pages/login/login",
        icon: "previous",
        iconColor: "red",
        text: "登出"
      }
    ]
  },
  attached() {
  },
  methods: {
    toggleTab(e) {
      this.setData({
        showSelector: !this.data.showSelector
      })
    },
    switchTab(e) {
      const data = e.currentTarget.dataset;
      if (data.tabtype == 0) {
        const url = data.path;
        wx.switchTab({ url });
      } else if (data.tabtype == 1) {
        const url = data.path;
        wx.navigateTo({
          url: url
        });
      } else if (data.tabtype == 2) {
        const url = data.path;
        wx.navigateTo({
          url: url,
          events: {
            acceptSelectedBoard: function (data) {
            },
          },
          success: function (res) {
            res.eventChannel.emit('acceptBackPage', {
              finalfun: (bname) => {
                if (bname) {
                  wx.navigateTo({
                    url: `/pages/board/board?boardName=${bname}`,
                  });
                }
              }
            });
          }
        });
      } else if (data.tabtype == 3) {
        const url = data.path;
        wx.setStorageSync('accesstoken', null);
        app.globalData.accessToken = null;
        wx.redirectTo({
          url: url
        });
      }
      this.setData({
        showSelector: false,
        selected: data.index
      })
    }
  }
})