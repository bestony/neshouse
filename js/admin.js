const AVAPPID = ""
const AVAPPKEY = ""
const BASEURL = "https://neshouse.com/"

AV.init({
    appId: AVAPPID,
    appKey: AVAPPKEY,
});

function admin() {
    return {
        // Control State
        isShowShareArea: false,
        // Info State
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
            // Generate Username 
            let username = localStorage.getItem("username");
            // Sign up a user 
            const user = new AV.User();
            let userObj = null;
            try {
                if (!username) {
                    if (!this.nickName) {
                        alert("Nickname cannot be empty")
                        return
                    }
                    username = Math.floor(Math.random() * 10000).toString(5) + Math.floor(Math.random() * 10000).toString(5);
                    localStorage.setItem("username", username);
                    user.setUsername(username);
                    user.setPassword(username);
                    user.set('nickname', this.nickName);
                    userObj = await user.signUp()
                } else {
                    user.setUsername(username);
                    user.setPassword(username);
                    user.set('nickname', this.nickName);
                    userObj = await AV.User.logIn(username, username);
                }
                // record user state
                this.userId = userObj.id;
                this.userName = username;
                try {
                    // Create Room and make currentUser as Admin
                    if (!this.roomName) {
                        alert("Room name cannot be empty")
                        return
                    }
                    const Room = AV.Object.extend('Room');
                    const room = new Room();
                    room.set("title", this.roomName);
                    room.set("adminUser", userObj.id);
                    let roomObj = await room.save();

                    // record Room State
                    this.roomId = roomObj.id;
                    console.log("roomID", roomObj.id);
                    // Show Share Area
                    this.isShowShareArea = true;
                    this.shareText = this.generateShareText();
                } catch (e) {
                    alert("can't create room,send email to bestony@linux.com");
                    console.log(e);
                }
            } catch (e) {
                alert("can't register account,send email to bestony@linux.com");
                console.log(e);
            }
        }
    }
}
