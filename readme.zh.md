<p align="center"><a href="https://neshouse.com" target="_blank"><img src="https://postimg.aliavv.com/mbp2021/nbyiy.png" width="400"></a></p>

[README](readme.md)|[中文介绍](readme.zh.md)

# NESHouse 
一个 [clubhouse](https://www.joinclubhouse.com/) 的开源实现

NesHouse 是一个基于 Agora、LeanCloud 服务，使用 Alpine.js 、Bulma Css、NES.css 构建的前端项目，这个项目实现了一套基于 NES 风格的 [clubhouse](https://www.joinclubhouse.com/)，你可以使用 NESHouse 来创建自己的线上直播间，也可以将其分享出去，邀请别人一起参与讨论。

## 特性

1. 多聊天直播间支持
2. 管理员权限
3. 多主播同时发言
4. 观众申请发言
5. 管理员禁言主播
6. 生成分享链接

## 截图

| 管理员界面 - 聊天室                                             | 管理员 - 创建页面                                                     |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| ![管理员聊天界面](https://postimg.aliavv.com/mbp2021/l0zr6.jpg) | ![管理员创建页面的界面](https://postimg.aliavv.com/mbp2021/uyp2e.png) |


## Demo

- 创建房间: https://neshouse.com/admin.html
- 默认主页: https://neshouse.com/admin.html

### Demo 使用流程

1. 在 域名/admin.html 中输入房间名 & 用户昵称，创建一个新的房间
2. 点击下方的 **Log in to chat room as Administrator** 以管理员身份登陆房间
3. 复制输入框内的链接，分享给你的朋友，邀请他们加入房间。

## 依赖服务

1. [LeanCloud 国际版](https://console.leancloud.app/)
2. [Agora.io 声网](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB)
3. （非必需）[Vercel](https://vercel.com/) 

## 如何使用

### 使用流程

1. 注册一个 [LeanCloud 国际账户](https://console.leancloud.app/)，并创建一个项目，用于后续的项目配置
2. 注册一个 [Agora 声网账号](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB)，并创建一个项目，获取 AppID。
3. 从 LeanCloud 的**应用后台** - **你使用的应用** - **设置** - **应用 Keys** 中找到 ****AppID** 和 **AppKey**，将其记录下来，以备后用。
4. 从 LeanCloud 的**应用后台** - **你使用的应用** - **存储** - **服务设置** 中启用 **Live Query**
5. 将上面记录的声网的应用 AppID 和 LeanCloud 的 AppID 和 APPkey 填写到 `js/app.js` 和 `js/admin.js` 顶部的配置中。
6. 将修改好的文件部署到你自己的服务器上，并配置域名指向。

### 配置说明

**js/app.js**
```js
const AVAPPID = "" // LeanCloud AppID
const AVAPPKEY = "" // LeanCloud AppKey
const BASEURL = "" // 最终网页所在的路径，生成的分享链接会基于这个地址产生
const DEFAULT_TEXT = "Please contact <a href='mailto:bestony@linux.com'>bestony@linux.com</a> to Learn more" // 页面顶部展示的文字
const AGORAAPPID = "" // 声网服务的 AppID
```


**js/admin.js**
```js
const AVAPPID = "" // LeanCloud AppID
const AVAPPKEY = "" // LeanCloud AppKey
const BASEURL = "" // 最终网页所在的路径，生成的分享链接会基于这个地址产生
```

## 贡献项目

如果你是用户，你可以通过上方的 [issue](https://github.com/bestony/neshouse/issues) 或 discussion 参与讨论，提出你的问题

如果你是开发者，你可以直接通过 [Pull Request](https://github.com/bestony/neshouse/pulls) 提交你的修改。需要注意的是，你的修改将会以 GPLv3 授权给其他开发者。

## 赞助商

[<img src="https://postimg.aliavv.com/mbp2021/5xzk6.png" width="300px">](https://leancloud.app/)
[<img src="https://postimg.aliavv.com/mbp2021/1wzcr.png" width="300px">](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB)

## LICENSE 
[AGPLv3](LICENSE)

如果希望商业使用，请联系邮箱 [bestony@linux.com](bestony@linux.com) 或微信 `ixiqin_com` 了解商业授权以及独立部署版本

## Credits

 - [Alpine.js](https://github.com/alpinejs/alpine)
 - [NES.css](https://nostalgic-css.github.io/NES.css/)
 - [Bulma](http://bulma.io/)
