/**
 * LeanCloud Init
 */
AV.init({
    appId: AVAPPID,
    appKey: AVAPPKEY,
    serverURLs: AVAPPURL,
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
        await el.__x.getUnobservedData().deInit(false);
    });
});
window.addEventListener("unbeforeload", function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit(false);
    });
});
window.onbeforeunload = function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit(false);
    });
}

window.unload = function (event) {
    event.preventDefault();
    document.querySelectorAll('[x-data]').forEach(async (el) => {
        await el.__x.getUnobservedData().deInit(false);
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
        usernameExist: false,

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
        isShowUserControl: false,
        isShowRegsiter: false,
        isShowButton: false,
        hasApplication: false,

        // client
        rtcClient: null,
        rtcEnable: true,

        selectUser: {},

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
                    alert("We cannot find the room, please check if the room link is valid.")
                }
            }

            if (roomId && !username) {
                usrname = window.localStorage.getItem("username");
                if (usrname) {
                    this.usernameExist = true;
                } else {
                    this.usernameExist = false;
                }
                this._showInviteForm();
            }

        },
        async deInit(manual) {
            manual = manual || false;
            if (manual) {
                // 保留有权限的用户数据
                if (this.isAdmin) {
                    let roomQuery = new AV.Query("Room");
                    roomQuery.equalTo("objectId", this.routerParam.roomId);
                    let room = await roomQuery.find();
                    // 移除当前用户
                    await AV.Object.destroyAll(room);  
                    let roomUserQuery = new AV.Query("RoomUser");
                    roomUserQuery.equalTo("roomId", this.routerParam.roomId);
                    let roomUser = await roomUserQuery.find();
                    // 移除当前用户
                    await AV.Object.destroyAll(roomUser);
                }
            } else {
                if(this.isAdmin||this.isHost){
                    const user = AV.Object.createWithoutData('RoomUser', this.loginRecordId);
                    user.set('leave', true);
                    await user.save();
                }else{
                    const loginRecord = AV.Object.createWithoutData('RoomUser', this.loginRecordId);
                    await loginRecord.destroy();
                }
            }
            // 关闭声网通道
            await this.rtcClient.client.leave();
            // 关闭网页
            window.location.href = BASEURL;
        },

        // loginWithInviteAndUsername
        async loginWithInviteAndUsername() {
            let username = window.localStorage.getItem("username");
            if (!username) {
                if (!this.nickname) {
                    alert("You have to choose a nickname. :)")
                    return
                }
                username = Math.floor(Math.random() * 10000).toString(5) + Math.floor(Math.random() * 10000).toString(5);
                localStorage.setItem("username", username);
            }
            this._showProgress();
            await this._loginWithUsername(username, this.nickname);
            try {
                await this._joinRoom(this.routerParam.roomId, username);
                await this._fetchRoomUser(this.routerParam.roomId);
                await this._showUI();
            } catch (e) {
                alert("We cannot find the room, please check if the room link is valid.")
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
                alert("Can't generate the link for this room, please shoot an email to bestony@linux.com.");
                return;
            }
            navigator.permissions.query({ name: "clipboard-write" }).then(result => {
                if (result.state == "granted" || result.state == "prompt") {
                    navigator.clipboard.writeText(this._generateShareText())
                } else {
                    alert("Your browser forbids text copying. Please select and copy the text in the box yourself.")
                    console.log(result.state)
                }
            });

        },
        showForm() {
            this.isShowButton = false;
            this.isShowChatRoom = true;
        },
        createNewUser() {
            window.localStorage.removeItem("username");
            this.usernameExist = false;
        },
        async muteHost(item) {
            const user = AV.Object.createWithoutData('RoomUser', item.id);
            user.set('forceMute', !item.forceMute);
            await user.save();
            alert("OK");
        },

        async makeApplication() {
            const user = AV.Object.createWithoutData('RoomUser', this.loginRecordId);
            user.set('application', true);
            await user.save();
            this.hasApplication = true;
            alert("Request sent, please wait for the host's approval.");
        },
        async makePeopleBeHost(item) {
            const user = AV.Object.createWithoutData('RoomUser', item.id);
            if (item.role == "guest") {
                user.set("role", "host");
            } else {
                user.set("role", "guest");
            }
            await user.save();
            alert("OK");
        },
        async adminSwitch(item) {
            const user = AV.Object.createWithoutData('RoomUser', item.id);
            user.set("role", item.role != "admin" ? "admin" : "host");
            await user.save();
            let roomQuery = new AV.Query('Room');
            let room = await roomQuery.get(this.routerParam.roomId);
            let adminUsers = null;
            if (item.role != "admin") {
                if (room.get("adminUser").indexOf(",") == -1) {
                    adminUsers = [room.get("adminUser"), item.id]
                } else {
                    adminUsers = JSON.parse(room.get("adminUser")).push(item.id)
                }
            } else {
                if (room.get("adminUser").indexOf(",") == -1) {
                    adminUsers = [this.loginRecordId]
                } else {
                    nowAdminUsers = JSON.parse(room.get("adminUser"))
                    adminUsers = await nowAdminUsers.filter(object => {
                        return object != item.id;
                    })
                }
            }
            room.set("adminUser", JSON.stringify(adminUsers));
            await room.save();
            alert("OK");
        },
        userControl(item) {
            this.selectUser = {
                id: item.id,
                role: item.role,
                nickname: item.nickname,
                forceMute: item.forceMute || false,
            };
            this.isShowControl = true;
        },
        async kickUser(item) {
            let roomUserQuery = new AV.Query("RoomUser");
            roomUserQuery.equalTo("objectId", item.id);
            roomUserQuery.equalTo("roomId", this.routerParam.roomId);
            let roomUser = await roomUserQuery.find();
            // 移除当前用户
            await AV.Object.destroyAll(roomUser);
            alert("OK");
        },

        _isInWeChat() {
            return navigator.userAgent.indexOf("MicroMessenger") != -1
        },

        // generate share text
        _generateShareText() {
            text = "I've found a chat room on NESHouse. Copy & open the following link in your browser and let's chat! " + BASEURL + "?invite=" + this.routerParam.roomId;
            this.shareText = text;
            return text
        },

        _showProgress() {
            this.showProgress = true;
            this.subtitle = "Joining the room, please wait a moment. :D";
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
            if (username) {
                localStorage.setItem("username", username)
            } else {
                username = localStorage.getItem("user");
            }
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
            if (this._isInWeChat()) {
                this.isShowButton = true;
            } else {
                this.isShowChatRoom = true;
            }
        },
        // join room
        async _joinRoom(roomId, username) {
            // ensure can get user;
            let user = await this._loginWithUsername(username);
            let roomQuery = new AV.Query('Room');
            let room = await roomQuery.get(roomId);
            this.roomTitle = room.get("title");
            let roomUserQuery = new AV.Query("RoomUser");
            roomUserQuery.equalTo("userId", user.id);
            roomUserQuery.equalTo("roomId", roomId);
            let roomUser = await roomUserQuery.find();
            // 记录用户历史权限
            let role = null;
            if (roomUser.length != 0) {
                role = roomUser[0].get("role")
            }
            // 移除当前用户的历史用户
            await AV.Object.destroyAll(roomUser);

            // 如果用户是管理员，则设定管理员标志
            let adminUser = room.get("adminUser");
            if (adminUser.indexOf(",") == -1) {
                adminUser = adminUser;
            } else {
                adminUser = JSON.parse(adminUser);
            }
            if (adminUser.indexOf(user.id) != -1) {
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
            }
            if (role == "host") {
                this.isHost = true;
                // create room user record
                const host = new RoomUser();
                host.set("roomId", room.id);
                host.set("username", username);
                host.set("nickname", user.get("nickname"))
                host.set("userId", user.id);
                host.set("role", 'host');
                let res = await host.save();

                // loginRecordId
                this.loginRecordId = res.id;

                let rtc = await this._joinChat();
                rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                rtc.localAudioTrack.setEnabled(true);
                await rtc.client.publish([rtc.localAudioTrack]);
            }
            if (!this.isAdmin && !this.isHost) {
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
                        role: item.get("role"),
                        id: item.id,
                        userId: item.get("userId"),
                        status: false,
                    })
                }
                if ((item.get("role") == "admin" || item.get("role") == "host") && !item.get("leave")) {
                    hostsArray.push({
                        username: item.get("username"),
                        nickname: item.get("nickname"),
                        userId: item.get("userId"),
                        role: item.get("role"),
                        id: item.id,
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
                            role: guest.get("role"),
                            forceMute: guest.get("forceMute") || false,
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
                            role: guest.get("role"),
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
                        alert("You've been muted!")
                    }

                    if (updatedKeys[0] == 'forceMute'
                        && !object.get("forceMute")
                        && object.id == this.loginRecordId) {
                        rtc.localAudioTrack.setEnabled(true);
                        alert("You can speak now. :)")
                    }

                    if (this.isAdmin && updatedKeys[0] == 'forceMute') {
                        this.hosts.forEach(item => {
                            if (item.forceMute != object.get("forceMute") && item.id == object.id) {
                                item.forceMute = !item.forceMute;
                            }
                        })
                    }

                    if (this.isAdmin &&
                        object.get("application") &&
                        object.get("role") == "guest") {
                        this.applications = [...this.applications, {
                            username: object.get("username"),
                            nickname: object.get("nickname"),
                            role: object.get("role"),
                            userId: object.get("userId"),
                            id: object.id,
                            application: true,
                        }]
                    }

                    if (updatedKeys[0] == 'leave'
                        && object.get("leave")) {
                        newHost = this.hosts.filter(item => {
                            return item.id != object.id;
                        })
                        this.hosts = newHost;
                    }

                    if (this.isAdmin &&
                        object.get("application") &&
                        object.get("role") == "host") {
                        this.applications = this.applications.filter(item => {
                            return item.id != object.id;
                        })
                    }

                    // if someone be host
                    if (object.get("role") == "host" && updatedKeys[0] == 'role') {
                        // if current user is changed user ,enable local track
                        if (object.id == this.loginRecordId && this.isHost == false) {
                            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                            rtc.localAudioTrack.setEnabled(true);
                            await rtc.client.publish([rtc.localAudioTrack]);
                            this.isHost = true;
                            alert("You've become a speaker and let's talk!");
                        }
                        newHost = this.hosts.filter(item => {
                            return item.id != object.id;
                        })
                        this.hosts = newHost;
                        // change icon location
                        this.hosts = [...this.hosts, {
                            username: object.get("username"),
                            nickname: object.get("nickname"),
                            userId: object.get("userId"),
                            role: object.get("role"),
                            id: object.id,
                            forceMute: object.get("forceMute"),
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

                    if (object.get("role") == "guest" && updatedKeys[0] == 'role') {
                        if (object.id == this.loginRecordId) {
                            rtc.localAudioTrack.setEnabled(false);
                            this.isHost = false;
                            alert("You've become a guest!")
                        }
                        newHost = this.hosts.filter(item => {
                            return item.id != object.id;
                        })
                        this.hosts = newHost;
                        // change icon location
                        this.guests = [...this.guests, {
                            username: object.get("username"),
                            nickname: object.get("nickname"),
                            userId: object.get("userId"),
                            role: object.get("role"),
                            id: object.id,
                            forceMute: object.get("forceMute"),
                            status: false
                        }]
                    }

                    if (updatedKeys[0] == "role") {
                        if (object.id == this.loginRecordId && object.get("role") == 'admin') {
                            this.isAdmin = true;
                        }
                        if (object.id == this.loginRecordId && object.get("role") != 'admin') {
                            this.isAdmin = false;
                        }
                        this.hosts.forEach(item => {
                            if (item.role != object.get("role") && item.id == object.id) {
                                item.role = object.get("role");
                            }
                        })
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
                            alert("You have left the room.");
                        })
                    }

                });
            });
            this.rtcClient = rtc;
            return rtc;
        },

    }
}
