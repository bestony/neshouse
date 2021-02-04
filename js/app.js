const AVAPPID = ""
const AVAPPKEY = ""
const BASEURL = "https://neshouse.com/"
const DEFAULT_TEXT = "Please contact <a href='mailto:bestony@linux.com'>bestony@linux.com</a> to Learn more"
const AGORAAPPID = ""

/**
 * LeanCloud Init
 */
AV.init({
    appId: AVAPPID,
    appKey: AVAPPKEY,
});
const Room = AV.Object.extend('Room');
const RoomUser = AV.Object.extend("RoomUser");

// Agora Init
var rtc = {
    // 用来放置本地客户端。
    client: null,
    // 用来放置本地音频轨道对象。
    localAudioTrack: null,
};

var options = {
    // 替换成你自己项目的 App ID。
    appId: AGORAAPPID,
    channel: "demo_channel_name",
    token: null,
};

window.addEventListener("unload", function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit();
    });
});
window.addEventListener("unbeforeload", function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit();
    });
});
window.onbeforeunload = function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit();
    });

}

window.unload = function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit();
    });

}

function index() {
    return {
        // meta
        roomTitle: null,
        routerParam: null,
        subtitle: DEFAULT_TEXT,

        // progress
        progress: 0,
        showProgress: false,

        // registerForm
        nickname: null,
        userId: null,

        // chatRoom
        hosts: [],
        guests: [],
        isShowControl: false,
        isAdmin: false,
        isShowShare: false,
        shareText: null,
        loginRecordId: null,
        applications: [],
        isHost: false,


        // control
        isShowChatRoom: false,
        isShowRegsiter: false,
        isShowButton: false,
        hasApplication: false,

        // client
        rtcClient: null,
        rtcEnable: true,


        async init() {

            const { roomId, username } = this._getParam();
            this.routerParam = { roomId, username }

            if (roomId && username) {
                this._showProgress()
                try {
                    await this._joinRoom(roomId, username);
                    await this._fetchRoomUser(roomId);
                    await this._showUI();
                } catch (e) {
                    alert("Room Invite Invalid, Pleask Check")
                }
            }

            if (roomId && !username) {
                this._showInviteForm();
            }

        },
        async deInit() {

            const loginRecord = AV.Object.createWithoutData('RoomUser', this.loginRecordId);
            await loginRecord.destroy();

            // 关闭声网通道
            await this.rtcClient.leave();
            // 关闭网页
            window.close();
        },

        // loginWithInviteAndUsername
        async loginWithInviteAndUsername() {
            let username = Math.floor(Math.random() * 10000).toString(5) + Math.floor(Math.random() * 10000).toString(5);
            this._showProgress();
            await this._loginWithUsername(username, this.nickname);
            try {
                await this._joinRoom(this.routerParam.roomId, username);
                await this._fetchRoomUser(this.routerParam.roomId);
                await this._showUI();
            } catch (e) {
                alert("Room Information is invalid, Please Check")
            }

        },
        muteMySelf() {
            if (this.rtcEnable) {
                this.rtcClient.localAudioTrack.setVolume(0)
            } else {
                this.rtcClient.localAudioTrack.setVolume(100)
            }
            this.rtcEnable = !this.rtcEnable
        },
        // 复制分享链接
        copyLink() {

            if (!this.routerParam.roomId || !this.userId) {
                alert("Can't generate for this room,send email to bestony@linux.com");
                return;
            }
            navigator.permissions.query({ name: "clipboard-write" }).then(result => {
                if (result.state == "granted" || result.state == "prompt") {
                    navigator.clipboard.writeText(this._generateShareText())
                } else {
                    alert("The browser prohibits copying, please copy the sharing information in the input box above by yourself")
                    console.log(result.state)
                }
            });

        },
        showForm() {
            this.isShowButton = false;
            this.isShowChatRoom = true;
        },
        async muteHost(item) {
            const user = AV.Object.createWithoutData('RoomUser', item.id);
            user.set('forceMute', true);
            await user.save();
            alert("Banned successfully");
        },

        async makeApplication() {
            const user = AV.Object.createWithoutData('RoomUser', this.loginRecordId);
            user.set('application', true);
            await user.save();
            this.hasApplication = true;
            alert("Application successful, waiting for review");
        },
        async makePeopleBeHost(item) {
            const user = AV.Object.createWithoutData('RoomUser', item.id);
            user.set("role", "host");
            await user.save();
            this.applications = this.applications.filter(obj => {
                return item.id != obj.id
            })
            alert("Application approved");
        },


        // generate share text
        _generateShareText() {
            text = "I found a room, copy the link to the browser to open, you can chat with me! " + BASEURL + "?invite=" + this.routerParam.roomId;
            this.shareText = text;
            return text
        },

        _showProgress() {
            this.showProgress = true;
            this.subtitle = "Joining the room, please wait patiently";
            var t = setInterval(() => {
                if (this.progress >= 98) {
                    clearInterval(t);
                }
                this.progress++
            }, 30);

        },
        _hideProgress() {
            this.showProgress = false;
            this.subtitle = "";
        },
        _getParam() {

            let urlParam = new URL(location.href).searchParams;
            let roomId = urlParam.get("invite")
            let username = urlParam.get("user")
            return {
                roomId,
                username
            }
        },
        _showInviteForm() {
            this.isShowRegsiter = true;
        },
        _showUI() {
            if (!this.hosts && !this.guests) {
                // 报错。无法进入
            }
            this._hideProgress();
            this.isShowRegsiter = false;
            this.isShowShare = true;
            if (this.isAdmin) {
                this.isShowControl = true;
            }
            this.isShowButton = true;
        },
        // join room
        async _joinRoom(roomId, username) {
            // ensure can get user;
            let user = await this._loginWithUsername(username);
            let roomQuery = new AV.Query('Room');
            let room = await roomQuery.get(roomId);
            this.roomTitle = room.get("title");

            // 移除当前用户的历史用户
            let roomUserQuery = new AV.Query("RoomUser");
            roomUserQuery.equalTo("userId", user.id);
            let roomUser = await roomUserQuery.find();
            AV.Object.destroyAll(roomUser);

            // 如果用户是管理员，则设定管理员标志
            if (user.id === room.get("adminUser")) {
                this.isAdmin = true;

                // create room user record
                const host = new RoomUser();
                host.set("roomId", room.id);
                host.set("username", username);
                host.set("nickname", user.get("nickname"))
                host.set("userId", user.id);
                host.set("role", 'admin');
                let res = await host.save();

                // loginRecordId
                this.loginRecordId = res.id;

                let rtc = await this._joinChat();
                rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                rtc.localAudioTrack.setEnabled(true);
                await rtc.client.publish([rtc.localAudioTrack]);

            } else {
                const guest = new RoomUser();
                guest.set("roomId", room.id);
                guest.set("username", username);
                guest.set("nickname", user.get("nickname"))
                guest.set("userId", user.id);
                guest.set("role", 'guest');
                let res = await guest.save();
                this.loginRecordId = res.id;
                await this._joinChat();
            }
        },
        // login with username, first try signup,then login
        async _loginWithUsername(username, nickname) {
            const user = new AV.User();
            user.setUsername(username);
            user.setPassword(username);
            try {
                user.set("nickname", nickname)
                let usr = await user.signUp()
                this.userId = usr.id;
                return usr;
            } catch (e) {
                let usr = await AV.User.logIn(username, username);
                this.userId = usr.id;
                return usr;
            }
        },
        // _fetchRoomUser
        async _fetchRoomUser(roomId) {
            const roomUserQuery = new AV.Query("RoomUser");
            roomUserQuery.equalTo("roomId", roomId);

            const users = await roomUserQuery.find();
            var guestsArray = []
            var hostsArray = []
            users.forEach(item => {
                if (item.get('role') == "guest") {
                    guestsArray.push({
                        username: item.get("username"),
                        nickname: item.get("nickname"),
                        userId: item.get("userId"),
                        status: false,
                    })
                }
                if (item.get("role") == "admin" || item.get("role") == "host") {
                    hostsArray.push({
                        username: item.get("username"),
                        nickname: item.get("nickname"),
                        userId: item.get("userId"),
                        status: false,
                    })
                }
            })
            this.guests = guestsArray;
            this.hosts = hostsArray;
        },

        async _joinChat() {

            // agora.io
            AgoraRTC.setLogLevel(4)

            rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

            await rtc.client.join(options.appId, this.routerParam.roomId, null, this.userId);

            // user-published
            rtc.client.on("user-published", async (user, mediaType) => {
                await rtc.client.subscribe(user, mediaType);
                if (mediaType === "audio") {
                    const remoteAudioTrack = user.audioTrack;
                    remoteAudioTrack.play();
                }
            });

            rtc.client.enableAudioVolumeIndicator();
            rtc.client.on("volume-indicator", volumes => {
                volumes.forEach((volume, index) => {
                    // 大于 5 + 麦克风，小于5 去掉麦克风
                    if (parseFloat(volume.level) > parseFloat(5)) {
                        this.hosts.forEach(host => {
                            if (host.userId == volume.uid) {
                                host.status = true;
                            }
                        })
                    } else {
                        this.hosts.forEach(host => {
                            if (host.userId == volume.uid) {
                                host.status = false;
                            }
                        })
                    }

                });
            })

            // leancloud.app
            const roomUserQuery = new AV.Query("RoomUser");
            roomUserQuery.equalTo("roomId", this.routerParam.roomId);
            roomUserQuery.subscribe().then((liveQuery) => {
                // new user in
                liveQuery.on('create', (guest) => {
                    // 有管理员加入
                    if (guest.get("role") == "admin" || guest.get("role") == "host") {
                        this.hosts = [...this.hosts, {
                            username: guest.get("username"),
                            nickname: guest.get("nickname"),
                            userId: guest.get("userId"),
                            id: guest.id,
                            status: false,
                        }]
                    }
                    // 有普通用户加入
                    if (guest.get("role") == "guest") {
                        this.guests = [...this.guests, {
                            username: guest.get("username"),
                            nickname: guest.get("nickname"),
                            userId: guest.get("userId"),
                            id: guest.id,
                        }]
                    }

                });
                // some user be host
                liveQuery.on('update', async (object, updatedKeys) => {
                    // is user forceMute
                    if (updatedKeys[0] == 'forceMute'
                        && object.get("forceMute")
                        && object.id == this.loginRecordId) {
                        rtc.localAudioTrack.setEnabled(false);
                        alert("Your has forbidden!")
                    }

                    if (this.isAdmin &&
                        object.get("application") &&
                        object.get("role") == "guest") {
                        this.applications = [...this.applications, {
                            username: object.get("username"),
                            nickname: object.get("nickname"),
                            userId: object.get("userId"),
                            id: object.id,
                            application: true,
                        }]
                    }

                    // if someone be host
                    if (object.get("role") == "host" && updatedKeys[0] == 'role') {
                        // if current user is changed user ,enable local track
                        if (object.id == this.loginRecordId) {
                            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                            rtc.localAudioTrack.setEnabled(true);
                            await rtc.client.publish([rtc.localAudioTrack]);
                            alert("You have become an host and can start speaking.");
                        }
                        // change icon location
                        this.hosts = [...this.hosts, {
                            username: object.get("username"),
                            nickname: object.get("nickname"),
                            userId: object.get("userId"),
                            id: object.id,
                            status: false
                        }]
                        newGuest = this.guests.filter(item => {
                            if (item.userId == object.get("userId")) {
                                return false;
                            }
                            return true;
                        })
                        this.guests = newGuest

                    }
                });
                // some user leave
                liveQuery.on('delete', (guest) => {

                    // 有用户离开
                    let role = guest.get("role");
                    let userId = guest.get("userId");
                    if (role == "guest") {
                        newGuest = this.guests.filter(item => {
                            if (item.userId == userId) {
                                return false;
                            }
                            return true;
                        })

                        this.guests = newGuest
                    }

                    if (role == "admin" || role == "host") {
                        newHost = this.hosts.filter(item => {
                            if (item.userId == userId) {
                                return false;
                            }
                            return true;
                        })
                        this.hosts = newHost
                    }

                    if (guest.id == this.loginRecordId) {
                        this.isShowChatRoom = false;
                        rtc.client.leave().then(() => {
                            liveQuery.unsubscribe();
                            alert("You have left the room");
                        })
                    }

                });
            });
            this.rtcClient = rtc;
            return rtc;
        },

    }
}
