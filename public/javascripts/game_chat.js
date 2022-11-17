const chatDisplayID = "chatDisplay";

class ChatMessage {
    constructor(sender, message, timestamp){
        if (sender == -1) {
            this.type = "System";
        } else {
            this.type = "Player";
            this.sender = sender;
            this.name = gameSetup.players[sender].name;
            this.avatar = gameSetup.players[sender].avatar;
        }
        this.message = message;
        this.timestamp = timestamp;
    }
    _getHTML_SYS() {
        let sysHTML = '';
        sysHTML += '<div class="chatMsgSys"><p>'
            + this.message+'</p></div>';
        return sysHTML;
    }
    _getHTML_Player(){
        let playerHTML = '';
        playerHTML += '<div class="chatMsg card"><div class="chatMsgHeader"><div class="chatID"><div class="avatar avatar_'
            +this.avatar+'"></div><div class="chat_userName name_player'
            +(this.sender+1)+'">'
            +this.name+'</div></div><div class="chat_timeStamp">'
            +this.timestamp+'</div></div><p>'
            +this.message+'</p></div>';
        return playerHTML;
    }
    getHTML() {
        if (this.type === "Player") { return this._getHTML_Player(); }
        return this._getHTML_SYS();
    }
}

class ChatList {
    constructor() {
        this.messages = [];
        this.parentElement = document.getElementById("chatDisplay");
    }
    loadHTML() {
        let chatHTML = '';
        if (this.messages.length == 0) {
            chatHTML += '<div class="chatMsgSys"> <p>'
                + 'Welcome to Tock Game #'+gameSetup.gameID+'\n'
                + 'Feel free to chat with your fellow players here!\n'
                + '</p></div>';
        } else {
            for (let chatIndex=0; chatIndex < this.messages.length; chatIndex++) {
                chatHTML += this.messages[chatIndex].getHTML();
            } 
        }
        this.parentElement.innerHTML = chatHTML;
    }
    addSysMessage(message, timestamp){
        let ts = timestamp;
        if (ts === undefined) { ts = this.generateTimeStamp(); }
        this.messages.push(new ChatMessage(-1, message, ts));
        this.loadHTML();
    }
    addPlayerMessage(playerIndex, message, timestamp){
        let ts = timestamp;
        if (ts === undefined) { ts = this.generateTimeStamp(); }
        this.messages.push(new ChatMessage(playerIndex, message, ts));
        this.loadHTML();
    }
    generateTimeStamp(){
        let ts = new Date(Date.now());
        let hours = ts.getHours() -1;
        let time = "am";
        if (hours/12 === 1) {
            time = "pm";
        }
        hours = (hours % 12) + 1;
        return hours + ":" + ts.getMinutes() + time;
    }
}
let chatList;
function gcOnLoad() {
    chatList = new ChatList();
    chatList.loadHTML();
    if (gameSetup.gameID == -1) {
        testChats();
    }
}
window.addEventListener("load", gcOnLoad);

/* sendChat */
// Note: This function currently just sends the chat into the chatList.
// Once sockets are up, we need to modify it to send the message to the server.
function sendChat(){
    let inputElement = document.getElementById('chatInput');
    let data = {
        sender: curPlayer,
        message: document.getElementById('chatInput').value
    };
    inputElement.value = '';

    // Normally, we would send this to the server,
    // but we do not have sockets up, so instead,
    // we will just send it to our local chatList
    chatList.addPlayerMessage(data.sender, data.message);


}

/* Test Code */

function testChats() {
    let messages = [
        { time: 5000, sender: -1, message: "The game has begun!" },
        { time: 3000, sender: 0, message: "Finally!" },
        { time: 4000, sender: 2, message: "I am so happy to be here!" },
        { time: 8000, sender: 1, message: "I'd like to thank my mother for always being so supportive..." },
        { time: 5000, sender: 0, message: "Y'all ready to lose?" },
        { time: 5000, sender: -1, message: "Player 4 has left the game." },
        { time: 6500, sender: 0, message: "Seriously? This is the fifth game in a row that I have had someone concede right away. All I wanna do is play a game. Why is that so hard?" },
        { time: 5000, sender: -1, message: "The game has been cancelled." },
    ];
    let displayFunc = (message) => {
        if (message.sender === -1) {
            chatList.addSysMessage(message.message);
        } else {
            chatList.addPlayerMessage(message.sender, message.message);
        }
    };
    let toFunc = (index) => {
        if (index != messages.length) {
            setTimeout( ()=>{
                displayFunc(messages[index]);
                toFunc(index+1);
            }, messages[index].time);
        }
    };
    toFunc(0);
}