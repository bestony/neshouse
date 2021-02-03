const AVAPPID = ""
const AVAPPKEY = ""
const BASEURL = "https://neshouse.com/"

AV.init({
    appId: AVAPPID,
    appKey: AVAPPKEY,
});

function admin() {
    return {
        isShowShareArea: false,
        roomName: null,
        roomId: null,
        userId: null,
        shareText: "",
        nickName: null,
        userName: null,
        loginAsAdmin() {
            var win = window.open(BASEURL + "?invite=" + this.roomId + "&user=" + this.userName, '_blank');
            win.focus();
        },
        generateShareText() {
            return "I created a room, copy the link to the browser to open, you can chat with me!" + BASEURL + "?invite=" + this.roomId
        },
        copyLink() {
            if (!this.roomId || !this.userId) {
                alert("Room error, please regenerate!");
                return;
            }
            ;
            navigator.permissions.query({ name: "clipboard-write" }).then(result => {
                if (result.state == "granted" || result.state == "prompt") {
                    navigator.clipboard.writeText(this.generateShareText())
                } else {
                    alert("The browser forbids copying. Please copy the shared information in the input box above")
                    console.log(result.state)
                }
            });

        },

        async createRoom() {
            // 注册用户, 随机5位  + 随机5位
            let username = Math.floor(Math.random() * 10000).toString(5) + Math.floor(Math.random() * 10000).toString(5);
            try {
                const user = new AV.User();
                user.setUsername(username);
                user.setPassword(username);
                user.set('nickname', this.nickName);
                let userObj = await user.signUp()
                this.userId = userObj.id;
                this.userName = username;
                try {
                    // 创建房间，并指定当前用户为管理员
                    const Room = AV.Object.extend('Room');
                    const room = new Room();
                    room.set("title", this.roomName);
                    room.set("adminUser", userObj.id);
                    let roomObj = await room.save();
                    this.roomId = roomObj.id;
                    console.log("roomID", roomObj.id);
                    // 展示分享区域
                    this.isShowShareArea = true;
                    this.shareText = this.generateShareText();
                    // 从新的页面中打开分享页面
                } catch (e) {
                    alert("无法创建房间，请联系管理员");
                    console.log(e);
                }
            } catch (e) {
                alert("注册失败，请刷新网页重试");
                console.log(e);
            }
        }

    }
}
