<p align="center"><a href="https://neshouse.com" target="_blank"><img src="https://postimg.aliavv.com/mbp2021/nbyiy.png" width="400"></a></p>

[README](readme.md)|[中文介绍](readme.zh.md)

# NESHouse 
An open source implementation of [clubhouse](https://www.joinclubhouse.com/)

NesHouse is a front-end project built on Agora, LeanCloud service, using Alpine.js, Bulma Css, NES.css. This project implements a set of [clubhouse](https://www.joinclubhouse.com/) based on NES style, you can use NESHouse to create your own online live room, you can use NESHouse to create your ostart live room, or share it and invite others to join the discussion.

## Features

1. multi-chat live room support
2. administrator privileges
3. multiple hosts speaking at the same time
4. audience application to speak
5. administrator ban anchor
6. generate sharing links

## ScreenShots

| Administrator Interface - Chat Room                                                  | Administrator - Create Chat Room                                                  |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| ![Administrator Interface - Chat Room](https://postimg.aliavv.com/mbp2021/l0zr6.jpg) | ![Administrator - Create Chat Room](https://postimg.aliavv.com/mbp2021/uyp2e.png) |

## Demo

- Create Chat Room: https://neshouse.com/admin.html
- Defeault Page: https://neshouse.com/admin.html

## Demo Flow of use

1. Enter the room name & user nickname in the domain/admin.html to create a new room
2. Click **Log in to chat room as Administrator** below to log in to the room as an administrator
3. Copy the link in the input box and share it with your friends to invite them to join the room.

## Dependency Services

1. [LeanCloud Gloabl](https://console.leancloud.app/)
2. [Agora.io](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB)
3. （non-essential）[Vercel](https://vercel.com/) 

## How to use

### Flow of use

1. Register a [LeanCloud International Account](https://console.leancloud.app/) and create a project for subsequent project configuration
2. Register an [Agora Sound Network account](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB) and create a project to get the AppID. **Please select debug mode when creating project, only APPID authentication**
3. Find **AppID** and **AppKey** from LeanCloud's **App Backend** - **Apps you use** - **Settings** - **App Keys**, and record them for later use.
4. Enable **Live Query** from LeanCloud's **App Backend** - **Apps You Use** - **Storage** - **Service Settings**
5. In LeanCloud's **Application Backend** - **Application you use** - **Storage** - **Structured Data** and create a Class named **RoomUser**.
6. Fill in the application AppID of SoundCloud recorded above and the AppID and APPkey of LeanCloud into the configuration at the top of `js/app.js` and `js/admin.js`.
7. Deploy the modified files to your own server and configure the domain name to point to.

### Configuration file description

**js/app.js**
```js
const AVAPPID = "" // LeanCloud AppID
const AVAPPKEY = "" // LeanCloud AppKey
const BASEURL = "" // The path where the final page is located, the generated share link will be generated based on this address
const DEFAULT_TEXT = "Please contact <a href='mailto:bestony@linux.com'>bestony@linux.com</a> to Learn more" // Text displayed at the top of the page
const AGORAAPPID = "" // AppID for Agora
```


**js/admin.js**
```js
const AVAPPID = "" // LeanCloud AppID
const AVAPPKEY = "" // LeanCloud AppKey
const BASEURL = "" // The path where the final page is located, the generated share link will be generated based on this address
```

## Contribute to the project

If you are a user, you can participate in the discussion and ask your questions via [issue](https://github.com/bestony/neshouse/issues) or discussion above

If you are a developer, you can submit your changes directly via [Pull Request](https://github.com/bestony/neshouse/pulls). Note that your changes will be licensed to other developers under the GPLv3.

## Sponsors

[<img src="https://postimg.aliavv.com/mbp2021/5xzk6.png" width="300px">](https://leancloud.app/)
[<img src="https://postimg.aliavv.com/mbp2021/1wzcr.png" width="300px">](https://www.agora.io/cn/?utm_source=opensource&utm_medium=refferal&utm_campaign=clubhouseB)

## LICENSE 
[AGPLv3](LICENSE)

For commercial use, please contact email [bestony@linux.com](bestony@linux.com) or WeChat `ixiqin_com` for commercial licensing and standalone deployment versions

## Credits

 - [Alpine.js](https://github.com/alpinejs/alpine)
 - [NES.css](https://nostalgic-css.github.io/NES.css/)
 - [Bulma](http://bulma.io/)
