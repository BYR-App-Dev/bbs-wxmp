# 北邮人论坛微信小程序

## 结构

- ```custom-tab-bar```: 切换首页各页面
- ```pages/login```: 登录页面
- ```pages/timeline```: 时间线页面
- ```pages/topten```: 十大页面
- ```pages/thread```: 帖子页面
- ```pages/post```: 发帖页面
- ```pages/board```: 版面页面
- ```pages/boardlist```: 分区页面
- ```pages/sectionlist```: 分区选择页面
- ```utils/nforum_services```: api请求
- ```utils/nforum_text_parser```: 帖子内容布局相关
- ```app```: 程序入口

## 页面事件

有些页面的```navigateTo```跳转会带有事件，如分区和版面选择页面，在```custom-tab-bar/index```中```success```回调时会触发```acceptBackPage```事件，这样下一层页面如```sectionlist```会收到最终页面一层(```board```)被点击时的行为。```pages/post```同样会跳转到```sectionlist```，但带有不同的```acceptBackPage```参数，所以最终页面选择时的结果是返回给```post```页面版面名，而不是打开该版面的页面

## 登录
使用论坛api登录的话需配置```utils/secrets```。更合理的做法应该是使用论坛和微信的认证。