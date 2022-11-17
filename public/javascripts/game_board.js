const gameContainerID = "gameContainer";
let cbSetting = false;
class tockEvent {
    constructor(id, cssClass, text){
        this.id = id;
        this.cssClass = cssClass;
        this.text = text;
        this.reversible = true;
    }
}
class Spot {
    constructor(player, area, index) {
        this.player = player;
        this.area = area;
        this.index = index;
        this.image = "empty";
        this.highlight = 0;
        this.id = "spot_" + this.player + "_" + this.getAreaText() + "_" + this.index; 
    }
    setImage(imageClass) {
        let element = document.getElementById(this.id);
        element.classList.remove(this.image);
        this.image = imageClass;
        element.classList.add(this.image);
    }
    setHighlight(newHighVal) {
        this.highlight = (newHighVal % 6);
    }
    getAreaText() { 
        if (this.area == 0) { return "start"; }
        else if (this.area == 1) { return "home"; }
        else { return "board"; }
    }
    getHTML() {
        let spotTag = this.getAreaText() + '_' + this.index;
        let htmlString = '<div class="tockSpot ' + this.image
            + " " + spotTag 
            + '" id="spot_'+this.player+'_'
            + spotTag + '">';
        if (this.highlight > 0) {
            htmlString += '<div class="tockspot tshl_' + this.highlight + '"></div>'; 
        }
        htmlString += '</div>';
        return htmlString;
    }
}
class Board {
    constructor(numPlayers, localPlayer) {
        this.numPlayers = numPlayers;
        this.localPlayer = localPlayer;
        this.playerClasses = ["Center", "Left", "Across", "Right"];
        let spots = [];
        for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
            let playerSpots = [];
            let startSpaces = [];
            let homeSpaces = [];
            let boardSpaces = [];
            for (let spotIndex = 0; spotIndex < 18; spotIndex++) {
                if (spotIndex < 4) {
                    startSpaces.push(new Spot(playerIndex, 0, spotIndex));
                    homeSpaces.push(new Spot(playerIndex, 1, spotIndex));
                }
                boardSpaces.push(new Spot(playerIndex, 2, spotIndex));
            }
            playerSpots.push(startSpaces);
            playerSpots.push(homeSpaces);
            playerSpots.push(boardSpaces);
            spots.push(playerSpots);
        }
        this.spots = spots;
    }
    copy() {
        let newBoard = new Board(this.numPlayers, this.localPlayer);
        for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
            for (let spotIndex = 0; spotIndex < 18; spotIndex++) {
                if (spotIndex < 4) {
                    newBoard.spots[playerIndex][0].image = this.spots[playerIndex][0].image;
                    newBoard.spots[playerIndex][1].image = this.spots[playerIndex][1].image;
                }
                newBoard.spots[playerIndex][2].image = this.spots[playerIndex][2].image;
            }
        }
        return newBoard;
    }
    placeMarbles(marbles) {


    }
    getPlayerClass(currentPlayer){
        let playerIndex = currentPlayer - this.localPlayer;
        if (playerIndex < 0) { playerIndex += this.numPlayers; }
        return this.playerClasses[playerIndex];
    }
    getDeco(playerIndex) {
        let decoHTML = ""
        // + '<div class="centerDeco"></div>'
        + '<div class="emptyDeco "></div>'
        + '<div class="startDeco decoPlayer_'+playerIndex+'"></div>'
        + '<div class="homeDeco decoPlayer_'+playerIndex+'"></div>'
        + '<div class="portalDeco decoPlayer_'+playerIndex+'"></div>'
        +'';
        return decoHTML;
    }
    AttachDivs() {
        let gbElement = document.getElementById("gameBoard");
        let boardHTML = '';
        let closeDiv = "</div>";
        let startOpen = '<div class="startArea">';
        let homeOpen = '<div class="homeArea">';
        let boardOpen = '<div class="boardArea">';

        for (let playerIndex=0; playerIndex<this.numPlayers; playerIndex++){
            let playerOpen =  '<div class="playerArea player'+(playerIndex+1)+'as'+this.getPlayerClass(playerIndex)+'">';
            let playerDeco = this.getDeco(playerIndex);
            let startSpots = "";
            let homeSpots = "";
            let boardSpots = "";

            for (let spotIndex=0; spotIndex<18; spotIndex++) {
                if (spotIndex < 4) {
                    startSpots += this.spots[playerIndex][0][spotIndex].getHTML();
                    homeSpots += this.spots[playerIndex][1][spotIndex].getHTML();
                }
                boardSpots += this.spots[playerIndex][2][spotIndex].getHTML();
            }

            boardHTML += playerOpen + playerDeco
                    + startOpen + startSpots + closeDiv
                    + homeOpen + homeSpots + closeDiv
                    + boardOpen + boardSpots + closeDiv
                    + closeDiv;
        }
        gbElement.innerHTML = boardHTML;
    }
}
let currentBoard;

let cardValueClasses = ["joker", "ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "jack", "queen", "king"];
let cardText = [
    (jokerColor) => { return "<p>"+jokerColor+" Joker</p><p>Start a marble, pulling it onto the board at the closest 18, or propel a marble 15 spaces. Then, draw a card and take another turn.</p>"; },
    (suite) => { return "<p>Ace of "+suite+"s</p><p>Start a marble, or propel a marble you control 1 space.</p>"; },
    (suite) => { return "<p>Two of "+suite+"s</p><p>Propel a marble you control 2 spaces.</p>"; },
    (suite) => { return "<p>Three of "+suite+"s</p><p>Propel a marble you control 3 spaces.</p>"; },
    (suite) => { return "<p>Four of "+suite+"s</p><p>Move a marble you control 4 spaces backwards without moving into any home spaces.</p>"; },
    (suite) => { return "<p>Five of "+suite+"s</p><p>Propel a marble you control 5 spaces.</p>"; },
    (suite) => { return "<p>Six of "+suite+"s</p><p>Propel a marble you control 6 spaces.</p>"; },
    (suite) => { return "<p>Seven of "+suite+"s</p><p>Propel any number of your marbles a total of 7 spaces.</p>"; },
    (suite) => { return "<p>Eight of "+suite+"s</p><p>Propel a marble you control 8 spaces.</p>"; },
    (suite) => { return "<p>Nine of "+suite+"s</p><p>Propel a marble you control 9 spaces.</p>"; },
    (suite) => { return "<p>Ten of "+suite+"s</p><p>Propel a marble you control 10 spaces.</p>"; },
    (suite) => { return "<p>Jack of "+suite+"s</p><p>Propel a marble you control 11 spaces, or swap it with any unprotected marble you do not control.</p>"; },
    (suite) => { return "<p>Queen of "+suite+"s</p><p>Propel a marble you control 12 spaces.</p>"; },
    (suite) => { return "<p>King of "+suite+"s</p><p>Start a marble, or propel a marble you control 13 spaces.</p>"; },
];
class CurrentHand {
    constructor(data) {
        this.cards = data;
        this.selected = this.cards.length -1;
        this.parent = document.getElementById("currentHand");
        this.text = document.getElementById("selectedCardText");
    }
    loadHTML() {
        let handHTML = '<div class="hHand">\n';
        this.map((index, card) => {
            let cardClasses = "tockCard ";
            cardClasses += card.category.toLocaleLowerCase() + " ";
            cardClasses += cardValueClasses[card.value];
            handHTML += '<div class="'+cardClasses+'" id="playerHand_'+(index+1)+'" onclick="currentHand.select('+index+');"></div>\n';
        });
        handHTML += "</div>\n";
        this.parent.innerHTML = handHTML;
        this.text.innerHTML = cardText[this.cards[this.selected].value](this.cards[this.selected].category);
    }
    map(mapFunction) {
        for (let cardIndex = 0; cardIndex < this.cards.length; cardIndex++) {
            mapFunction(cardIndex, this.cards[cardIndex]);
        }
    }
    getSelected() { return this.cards[this.selected]; }
    select(newSelection) {
        let newCards = [];
        let selectedCard;
        this.map( (index, card) => {
            if (index == newSelection) { selectedCard = card; }
            else { newCards.push(card); }
        });
        newCards.push(selectedCard);
        this.cards = newCards;
        this.loadHTML();
    }
}
let currentHand;

class OpponentHand {
    constructor(playerIndex, name, avatarClass, handCount, board){
        this.playerIndex = playerIndex;
        this.name = name;
        this.avatarClass = avatarClass;
        this.handCount = handCount;
        this.location = board.getPlayerClass(this.playerIndex);
        this.parentID = "opponent" + this.location;
        this.parentElement = document.getElementById(this.parentID);
    }
    loadHTML() {
        let htmlString = '<div class="d-flex flex-row justify-content-between"><div class="m-1 avatar ' 
            + this.avatarClass+'"></div><p class="name_player'
            + (this.playerIndex+1)+' m-1">'
            + this.name+'</p> </div> <div class="hHand">';
        for (let cardIndex=0; cardIndex < this.handCount; cardIndex++) {
            htmlString += '<div class="opponentCard" id="opponent'+this.location+'_'+(cardIndex+1)+'"></div>';
        }
        htmlString += '</div>';
        this.parentElement.innerHTML = htmlString;
        this.parentElement.classList.add("decoPlayer_" + this.playerIndex);
    }
}
let opponentHands = [];

class GameEvent {
    constructor(name, state, handler) {
        this.name = name;
        this.state = state;
        this.handler = handler;
    }
    show() {
        this.state.AttachDivs();
    }
    handle(props) {
        this.handler(props);
    }
}
class TockHistory {
    constructor(){}
}


function gbOnLoad() {
    currentBoard = new Board(gameSetup.numPlayers, gameSetup.curPlayer);
    currentBoard.AttachDivs();

    currentHand = new CurrentHand(gameSetup.curHand);
    currentHand.loadHTML();

    for (let playerIndex = 0; playerIndex< gameSetup.numPlayers; playerIndex++){
        if (playerIndex != gameSetup.curPlayer) {
            let curPlayer = new OpponentHand(
                playerIndex, 
                gameSetup.players[playerIndex].name,
                "avatar_" + gameSetup.players[playerIndex].avatar,
                gameSetup.hands[playerIndex],
                currentBoard);
            curPlayer.loadHTML();
            opponentHands.push(curPlayer);
        }
    }
}
window.addEventListener("load", gbOnLoad);