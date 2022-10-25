const chatDisplayID = "chatDisplay";

function chatAddSysMsg(text) {
    var textElement = document.createElement("p");
    var textNode = document.createTextNode(text);
    textElement.classList.add("chatSysMsg");
    textElement.appendChild(textNode);
}