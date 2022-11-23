
const gameContainerID = "gameContainer";
let cbSetting = false;
let spotsByID = [
    [-1,-1,-1], [0,0,0], [0,0,1],[0,0,2],[0,0,3],
    [1,0,0], [1,0,1],[1,0,2],[1,0,3],
    [2,0,0], [2,0,1],[2,0,2],[2,0,3],
    [3,0,0], [3,0,1],[3,0,2],[3,0,3],
    [0,1,0], [0,1,1],[0,1,2],[0,1,3],
    [1,1,0], [1,1,1],[1,1,2],[1,1,3],
    [2,1,0], [2,1,1],[2,1,2],[2,1,3],
    [3,1,0], [3,1,1],[3,1,2],[3,1,3],
    [0,2,0], [0,2,1],[0,2,2],[0,2,3],[0,2,4], [0,2,5],[0,2,6],[0,2,7], [0,2,8], [0,2,9],
    [0,2,10], [0,2,11],[0,2,12],[0,2,13],[0,2,14], [0,2,15],[0,2,16],[0,2,17],
    [1,2,0], [1,2,1],[1,2,2],[1,2,3],[1,2,4], [1,2,5],[1,2,6],[1,2,7], [1,2,8], [1,2,9],
    [1,2,10], [1,2,11],[1,2,12],[1,2,13],[1,2,14], [1,2,15],[1,2,16],[1,2,17],
    [2,2,0], [2,2,1],[2,2,2],[2,2,3],[2,2,4], [2,2,5],[2,2,6],[2,2,7], [2,2,8], [2,2,9],
    [2,2,10], [2,2,11],[2,2,12],[2,2,13],[2,2,14], [2,2,15],[2,2,16],[2,2,17],
    [3,2,0], [3,2,1],[3,2,2],[3,2,3],[3,2,4], [3,2,5],[3,2,6],[3,2,7], [3,2,8], [3,2,9],
    [3,2,10], [3,2,11],[3,2,12],[3,2,13],[3,2,14], [3,2,15],[3,2,16],[3,2,17]
];
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
        this.marble = -1;
        this.image = "empty";
        this.highlight = 0;
        this.onClick = null;
        this.id = "spot_" + this.player + "_" + this.getAreaText() + "_" + this.index; 
        let base = (16*area)+1;
        let playerMult = 4 + (Math.floor( area/2 ) * 14 );
        this.spotID = base + (player * playerMult) + index;
    }
    setMarble(player_index) {
        if(player_index > -1 && player_index < 4) {
            this.image = "player"+ (player_index+1);
            this.marble = player_index;
        } else {
            this.image = "empty";
            this.marble = -1;
        }
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
            htmlString += '<div class="tockSpot consider tshl_' + this.highlight + '"></div>'; 
        }
        htmlString += '</div>';
        return htmlString;
    }
    isBlocking(player_index) {
        if (this.marble > -1) {
            if (this.marble == player_index){ return true; }
            if (this.index == 0 && this.player === this.marble) { return true; }
            if (this.index == 8) { return true; }
        } else { 
            if (this.area !== 2 && this.player !== player_index) { return true; }
        }
        return false;
    }
    getNext(player_index) {
        if (this.area == 0) {
            return { player: this.player, area: 2, index: 0};
        } else if (this.area === 1) {
            if (index === 4) {
                return null;
            }
            return { player: this.player, area: this.area, index: this.index+1 };
        } else {
            let nextIndex = this.index+1;
            if (nextIndex === 18) {
                let nextSection = (this.player + 1)%4;
                if (nextSection === player_index) {
                    return { player: player_index, area: 1, index: 0 };
                }
                return { player: nextSection, area: 2, index: 0 };
            }
            return { player: this.player, area: 2, index: nextIndex };
        }
    }
    getPrevious(player_index){
        if (this.area == 0) {
            return null;
        } else if (this.area === 1) {
            if (index === 0) {
                let prevSection = player_index - 1;
                if (prevSection < 0) {
                    prevSection += 4;
                }
                return { player: prevSection, area: 2, index: 17 };
            }
            return { player: this.player, area: this.area, index: this.index-1 };
        } else {
            let nextIndex = this.index-1;
            if (nextIndex === -1) {
                let nextSection = (this.player - 1);
                if (nextSection < 0) { nextSection += 4; }
                return { player: nextSection, area: 2, index: 17 };
            }
            return { player: this.player, area: 2, index: nextIndex };
        }
    }
}
class Board {
    constructor(numPlayers, localPlayer) {
        this.numPlayers = numPlayers;
        this.localPlayer = localPlayer;
        this.playerClasses = ["Center", "Left", "Across", "Right"];
        this.marbles = null;
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
        newBoard.placeMarbles(this.marbles);
        return newBoard;
    }
    filterMarbles( trueIfKeep ) {
        let keepers = [];
        if (this.marbles !== null) {
            for (let playerIndex = 0; playerIndex < this.marbles.length; playerIndex++) {
                for (let marbleIndex = 0; marbleIndex < this.marbles[playerIndex].length; marbleIndex++){
                    if (trueIfKeep(this.marbles[playerIndex][marbleIndex], playerIndex, marbleIndex, this)) {
                        keepers.push(this.marbles[playerIndex][marbleIndex]);
                    }
                }
            }
        }
        return keepers;
    }
    clearMarbles(marbles) {
        let clearFunc = (marble, player, index, board) => {
            board.getSpotFromMarble(marble).setMarble(-1);
        };
        if (marbles === undefined) {
            this.filterMarbles(clearFunc);
        } else {
            for (let marbleIndex = 0; marbleIndex < marbles.length; marbleIndex++) {
                clearFunc(this.marbles[marbleIndex], marbleIndex);
            }
        }
    }
    placeMarbles(marbles) {
        if (this.marbles !== null) {
            this.clearMarbles();
        }
        this.marbles = marbles;
        this.filterMarbles((marble, player, index, board)=> {
            board.getSpotFromMarble(marble).setMarble(player);
        });
    }
    getOnBoardMarbles() {
        return this.filterMarbles((marble,player,index, board)=> {
            if (marble.spot.area == 2) { return true; }
            return false;
        });
    }
    getPlayersMarbles() {
        return this.filterMarbles((marble,player,index, board)=> {
            if (player == board.localPlayer-1) { return true; }
            return false;
        });
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
    setSpotImage(spot, imageName) {
        this.spots[spot.player][spot.area][application.index] = imageName;
    }
    getSpot(player, area, index) {
        return this.spots[player][area][index];
    }
    getSpotFromID(spotID) {
        let spotInfo = spotsByID[spotID];
        return this.getSpot(spotInfo[0], spotInfo[1], spotInfo[2]);
    }
    getSpotFromMarble(marble) {
        return this.getSpot(marble.spot.player, marble.spot.area, marble.spot.index);
    }
    getSpotFromSpecs(spotSpecs) {
        if (spotSpecs !== null) {
            return this.getSpot(spotSpecs.player, spotSpecs.area, spotSpecs.index);
        }
        return null;
    }
}

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
            handHTML += '<div class="'+cardClasses+'" id="playerHand_'+(index+1)+'" onclick="tockHistory.setSelectedCard('+index+');"></div>\n';
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
class Strategy {
    constructor(currentBoard, currentCard){
        this.board = currentBoard.copy();
        this.card = currentCard;
        this.player = this.board.localPlayer - 1;
        this.activeMarbles = this.board.getOnBoardMarbles();
        this.myMarbles = this.board.getPlayersMarbles();
    }
    makeBoard() {
        switch(this.card.value) {
            case 0: this.makePropel(15); this.makeStart(); break;
            case 1: this.makePropel(1); this.makeStart(); break;
            case 2: this.makePropel(2); break;
            case 3: this.makePropel(3); break;
            case 4: this.makeBackwards4(); break;
            case 5: this.makePropel(5); break;
            case 6: this.makePropel(6); break;
            case 7: this.makeIncrementalPropel(); break;
            case 8: this.makePropel(8); break;
            case 9: this.makePropel(9); break;
            case 10: this.makePropel(10); break;
            case 11: this.makePropel(11); this.makeSwitch(); break;
            case 12: this.makePropel(12); break;
            case 13: this.makePropel(13); this.makeStart(); break;
            default: break;
        }
        return this.board;
    }
    makePropel(propelAmount) {
        this.onMyMarbles((marble, strategy)=>{
            if (marble.spot.area > 0){
                let marbleSpot = strategy.board.getSpotFromMarble(marble);
                let nextSpot = marbleSpot.getNext(strategy.player);
                let validPropel = strategy.validatePropel(nextSpot, propelAmount-1);
                if (validPropel !== null) {
                    strategy.setMarbleHighlight(marble, 1);
                }
            }
        });
    }
    makeBackwards4() {
        this.onMyMarbles((marble, strategy)=>{
            if (marble.spot.area > 0){
                let marbleSpot = strategy.board.getSpotFromMarble(marble);
                let nextSpot = marbleSpot.getPrevious(strategy.player);
                let validPropel = strategy.validatePropel(nextSpot, propelAmount+1);
                if (validPropel !== null) {
                    strategy.setMarbleHighlight(marble, 1);
                }
            }
        });
    }
    makeIncrementalPropel() {
        this.propelData = [];
        this.onMyMarbles((marble, strategy)=>{
            if (marble.spot.area > 0){
                let marbleSpot = strategy.board.getSpotFromMarble(marble);
                let propelInfo = {
                    marble: marble,
                    requestedDistance:7,
                    actualDistance:0,
                    blocked:false,
                    startSpace:marbleSpot,
                    currentSpace:marbleSpot,
                    unblockedSpaces: []
                };
                while (!propelInfo.blocked && propelInfo.requestedDistance !== propelInfo.actualDistance){
                    let nextSpotSpecs = propelInfo.currentSpace.getNext(strategy.player);
                    let nextSpot = strategy.board.getSpotFromSpecs(nextSpotSpecs);
                    if (nextSpot.isBlocking()) {
                        propelInfo.blocked = true;                        
                    } else {
                        propelInfo.currentSpace = nextSpot;
                        propelInfo.actualDistance++;
                        propelInfo.unblockedSpaces.push(nextSpot);
                    }
                }
                strategy.propelData.push(propelInfo);
            }
        });
        let totalDistance = 0;
        this.propelData.forEach((considerPropel)=>{ 
            if (considerPropel.actualDistance == 7){
                this.setMarbleHighlight(considerPropel.marble, 1);
            } else {
                if (considerPropel.actualDistance > 0){
                    let otherDistance = 0;
                    this.propelData.forEach((otherPropel)=>{
                        if (considerPropel.marble.id !== otherPropel.marble.id) {
                            otherDistance += otherPropel.actualDistance;
                        }
                    });
                    if ((otherDistance + considerPropel.actualDistance) >= 7) {
                        this.setMarbleHighlight(considerPropel.marble, 1);
                    }
                }
            }
        });
    }
    makeSwitch() {
        this.onMyMarbles((marble,strategy)=>{
            if (marble.spot.area == 2) {
                strategy.setMarbleHighlight(marble, 1);
            }
        });
    }
    makeStart() {
        this.onMyMarbles((marble, strategy) => {
            if (marble.spot.area === 0) {
                strategy.setMarbleHighlight(marble, 1);
            }
        });
    }
    validatePropel(spotSpecs, amount) {
        let spot = this.board.getSpotFromSpecs(spotSpecs);
        if (spot.isBlocking()){ 
            return null;
        }
        if (amount == 0) { return spot; }
        else if (amount > 0) { 
            let nextSpot = spot.getNext(this.player);
            if (nextSpot === null) { return null; }
            return this.validatePropel(nextSpot, amount - 1);
        } else {
            return this.validatePropel(spot.getPrevious(this.player), amount + 1);
        }
    }
    validateIncrementalPropel(spotSpecs, amount) {
        let spot = this.board.getSpotFromSpecs(spotSpecs);
        if (spot.isBlocking()){ 
            return null;
        }
        if (amount == 0) { return spot; }
        else if (amount > 0) { 
            let nextSpot = spot.getNext(this.player);
            if (nextSpot === null) { return null; }
            return this.validatePropel(nextSpot, amount - 1);
        } else {
            return this.validatePropel(spot.getPrevious(this.player), amount + 1);
        }
    }
    onMyMarbles(marbleFunc) {
        for( let marbleIndex = 0; marbleIndex < this.myMarbles.length; marbleIndex++) { 
            marbleFunc(this.myMarbles[marbleIndex], this);
        }
    }
    setMarbleHighlight(marble, highlight) {
        this.board.getSpotFromMarble(marble).setHighlight(highlight);
    }
}

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
    constructor(gameState){
        this.gameState = gameState;
        this.hand = new CurrentHand(this.gameState.curHand);
        this.hand.loadHTML();
        this.startBoard = new Board(this.gameState.numPlayers, this.gameState.curPlayer);
        this.parseMarbles();
        this.parseOpponents();
        this.setSelectedCard(this.hand.selected);
        this.currentBoard.AttachDivs();
    }
    setSelectedCard(newSelection) {
        this.hand.select(newSelection);
        let newCard = this.hand.getSelected();
        this.strategy = new Strategy(this.startBoard, newCard);
        this.currentBoard = this.strategy.makeBoard();
        this.currentBoard.AttachDivs();
    }
    parseMarbles(){
        let marb_player_0 = [];
        let marb_player_1 = [];
        let marb_player_2 = [];
        let marb_player_3 = [];
        let newMarbles = [marb_player_0, marb_player_1, marb_player_2, marb_player_3];
        for (let marbIndex = 0; marbIndex < this.gameState.marbles.length; marbIndex++) {
            let currentMarble = this.gameState.marbles[marbIndex];
            let currentSpot = this.startBoard.getSpotFromID(currentMarble.current_spot);
            newMarbles[currentMarble.player_index].push( { id: currentMarble.id, spot: {player: currentSpot.player, area: currentSpot.area, index: currentSpot.index}  } );
        }
        this.startBoard.placeMarbles(newMarbles);
    }
    parseOpponents(){
        this.parseHands();
        this.opponentHands = [];
        for (let playerIndex = 0; playerIndex< this.gameState.numPlayers; playerIndex++){
            if (playerIndex != this.gameState.curPlayer) {
                let curPlayer = new OpponentHand(
                    playerIndex, 
                    this.gameState.players[playerIndex].name,
                    "avatar_" + this.gameState.players[playerIndex].avatar,
                    this.cardCounts[playerIndex],
                    this.startBoard);
                curPlayer.loadHTML();
                this.opponentHands.push(curPlayer);
            }
        }
    }
    parseHands() {
        let countArray = this.gameState.hands;
        let newHands = [];
        for(let sizeIndex = 0; sizeIndex < this.gameState.numPlayers; sizeIndex++) {newHands.push(0);}
        for (let countIndex=0; countIndex < countArray.length; countIndex++) {
            let currentCount = countArray[countIndex];
            if (currentCount.location_id === -1) {
                newHands.discard = currentCount.amount;
            } else if (currentCount.location_id === 18) {
                newHands.draw = currentCount.amount;
            } else {
                newHands[currentCount.location_id] = currentCount.amount;
            }
        }
        this.cardCounts = newHands;
    }
}
let tockHistory;

function gbOnLoad() {
    tockHistory = new TockHistory(gameSetup);
}
window.addEventListener("load", gbOnLoad);