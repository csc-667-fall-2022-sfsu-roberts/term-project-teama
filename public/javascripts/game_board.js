
const gameContainerID = "gameContainer";
let cbSetting = false;
let debug = false;
let spotsByID = [
    [-1, -1, -1], [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3],
    [1, 0, 0], [1, 0, 1], [1, 0, 2], [1, 0, 3],
    [2, 0, 0], [2, 0, 1], [2, 0, 2], [2, 0, 3],
    [3, 0, 0], [3, 0, 1], [3, 0, 2], [3, 0, 3],
    [0, 1, 0], [0, 1, 1], [0, 1, 2], [0, 1, 3],
    [1, 1, 0], [1, 1, 1], [1, 1, 2], [1, 1, 3],
    [2, 1, 0], [2, 1, 1], [2, 1, 2], [2, 1, 3],
    [3, 1, 0], [3, 1, 1], [3, 1, 2], [3, 1, 3],
    [0, 2, 0], [0, 2, 1], [0, 2, 2], [0, 2, 3], [0, 2, 4], [0, 2, 5], [0, 2, 6], [0, 2, 7], [0, 2, 8], [0, 2, 9],
    [0, 2, 10], [0, 2, 11], [0, 2, 12], [0, 2, 13], [0, 2, 14], [0, 2, 15], [0, 2, 16], [0, 2, 17],
    [1, 2, 0], [1, 2, 1], [1, 2, 2], [1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 2, 6], [1, 2, 7], [1, 2, 8], [1, 2, 9],
    [1, 2, 10], [1, 2, 11], [1, 2, 12], [1, 2, 13], [1, 2, 14], [1, 2, 15], [1, 2, 16], [1, 2, 17],
    [2, 2, 0], [2, 2, 1], [2, 2, 2], [2, 2, 3], [2, 2, 4], [2, 2, 5], [2, 2, 6], [2, 2, 7], [2, 2, 8], [2, 2, 9],
    [2, 2, 10], [2, 2, 11], [2, 2, 12], [2, 2, 13], [2, 2, 14], [2, 2, 15], [2, 2, 16], [2, 2, 17],
    [3, 2, 0], [3, 2, 1], [3, 2, 2], [3, 2, 3], [3, 2, 4], [3, 2, 5], [3, 2, 6], [3, 2, 7], [3, 2, 8], [3, 2, 9],
    [3, 2, 10], [3, 2, 11], [3, 2, 12], [3, 2, 13], [3, 2, 14], [3, 2, 15], [3, 2, 16], [3, 2, 17]
];
class tockEvent {
    constructor(id, cssClass, text) {
        this.id = id;
        this.cssClass = cssClass;
        this.text = text;
        this.reversible = true;
    }
}
function to_spot_id(player, area, index) {
    let base = (16 * area) + 1;
    let playerMult = 4 + (Math.floor(area / 2) * 14);
    return base + (player * playerMult) + index;
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
        this.spotID = to_spot_id(player, area, index);
    }
    toString(verbose = false) {
        let spotString = this.spotID + '[' + this.player + ',' + this.area + ',' + this.index + ']';
        if (verbose) {
            spotString += ' (marble: ' + this.marble + ', highlight: ' + this.highlight + ')';
        }
        return spotString;
    }
    setMarble(player_index) {
        if (player_index > -1 && player_index < 4) {
            this.image = "player" + (player_index + 1);
            this.marble = player_index;
        } else {
            this.image = "empty";
            this.marble = -1;
        }
    }
    setHighlight(newHighVal) {
        this.highlight = (newHighVal % 6);
    }
    switchHighlight(newHighVal) {
        if (this.highlight > -1) {
            this.setHighlight(newHighVal);
        }
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
            + '" id="spot_' + this.player + '_'
            + spotTag + '"';
        if (this.onClick != null) {
            htmlString += ' onclick="' + this.onClick + '"';
        }
        htmlString += '>';
        if (this.highlight > 0) {
            htmlString += '<div class="tockSpot consider tshl_' + this.highlight + '"></div>';
        }
        if (debug == true) { htmlString += '<div class="debugSpotID">' + this.spotID + '</div>'; }
        htmlString += '</div>';
        return htmlString;
    }
    isBetween(before, after) {
        let start = to_spot_id(before.player, before.area, before.index);
        let end = to_spot_id(after.player, after.area, after.index);
        if (start < end) { return this.spotID <= end && this.spotID >= start; }
        else { return this.spotID >= start || this.spotID <= end; }
    }
    isBlocking(player_index, tocking = false) {
        if (this.marble > -1) {
            if (this.marble == player_index) { return true; }
            if (this.index == 0 && this.player === this.marble) { return !tocking; }
            if (this.index == 8) { return true; }
        } else {
            if (this.area !== 2 && this.player !== player_index) { return true; }
        }
        return false;
    }
    getNext(player_index) {
        if (this.area == 0) {
            return { player: this.player, area: 2, index: 0 };
        } else if (this.area === 1) {
            if (this.index === 3) {
                return null;
            }
            return { player: this.player, area: this.area, index: this.index + 1 };
        } else {
            let nextIndex = this.index + 1;
            if (nextIndex === 18) {
                let nextSection = (this.player + 1) % 4;
                if (nextSection === player_index) {
                    return { player: player_index, area: 1, index: 0 };
                }
                return { player: nextSection, area: 2, index: 0 };
            }
            return { player: this.player, area: 2, index: nextIndex };
        }
    }
    getPrevious(player_index) {
        if (this.area == 0) {
            return null;
        } else if (this.area === 1) {
            if (this.index === 0) {
                let prevSection = (this.player+3)%4;
                return { player: prevSection, area: 2, index: 17 };
            }
            return { player: this.player, area: this.area, index: this.index - 1 };
        } else {
            let nextIndex = this.index - 1;
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
        newBoard.spots.forEach((playerSpots, playerIndex) => {
            playerSpots.forEach((areaSpots, areaIndex) => {
                areaSpots.forEach((spot, spotIndex) => {
                    spot.highlight = this.spots[playerIndex][areaIndex][spotIndex].highlight;
                    spot.onClick = this.spots[playerIndex][areaIndex][spotIndex].onClick;
                });
            });
        });
        return newBoard;
    }
    filterMarbles(trueIfKeep) {
        let keepers = [];
        if (this.marbles !== null) {
            for (let playerIndex = 0; playerIndex < this.marbles.length; playerIndex++) {
                for (let marbleIndex = 0; marbleIndex < this.marbles[playerIndex].length; marbleIndex++) {
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
        this.filterMarbles((marble, player, index, board) => {
            board.getSpotFromMarble(marble).setMarble(player);
        });
    }
    getOnBoardMarbles() {
        return this.filterMarbles((marble, player, index, board) => {
            if (marble.spot.area == 2) { return true; }
            return false;
        });
    }
    getPlayersMarbles() {
        return this.filterMarbles((marble, player, index, board) => {
            if (player == board.localPlayer) { return true; }
            return false;
        });
    }
    getPlayerClass(currentPlayer) {
        let playerIndex = currentPlayer - this.localPlayer;
        if (playerIndex < 0) { playerIndex += this.numPlayers; }
        return this.playerClasses[playerIndex];
    }
    getDeco(playerIndex) {
        let decoHTML = ""
            // + '<div class="centerDeco"></div>'
            + '<div class="emptyDeco "></div>'
            + '<div class="startDeco decoPlayer_' + playerIndex + '"></div>'
            + '<div class="homeDeco decoPlayer_' + playerIndex + '"></div>'
            + '<div class="portalDeco decoPlayer_' + playerIndex + '"></div>'
            + '';
        return decoHTML;
    }
    getHomePortalProxyHTML(player_index){
        let htmlString = '<div class="fakeTockSpot proxy_prev_17" id="homePortal_' + (player_index) + '"';
        htmlString += ' onclick="tockHistory.proxyClick('+( (player_index+3) %4)+')"></div>';
        return htmlString;
    }
    getHomeChainProxyHTML(player_index){
        let htmlString;
        for (let proxyIndex = 0; proxyIndex < 4; proxyIndex++) {
            htmlString += '<div class="fakeTockSpot proxy_home_'+proxyIndex+'" id="homeProxy_'+player_index+'_'+proxyIndex+'"';
            htmlString += ' onclick="tockHistory.proxyClick('+( (player_index+1) %4)+', '+proxyIndex+')"></div>';
        }
        return htmlString;
    }
    AttachDivs() {
        let gbElement = document.getElementById("gameBoard");
        let boardHTML = '';
        let closeDiv = "</div>";
        let startOpen = '<div class="startArea">';
        let homeOpen = '<div class="homeArea">';
        let boardOpen = '<div class="boardArea">';

        for (let playerIndex = 0; playerIndex < this.numPlayers; playerIndex++) {
            let playerOpen = '<div class="playerArea player' + (playerIndex + 1) + 'as' + this.getPlayerClass(playerIndex) + '">';
            let playerDeco = this.getDeco(playerIndex);
            let startSpots = "";
            let homeSpots = "";
            let boardSpots = "";

            for (let spotIndex = 0; spotIndex < 18; spotIndex++) {
                if (spotIndex < 4) {
                    startSpots += this.spots[playerIndex][0][spotIndex].getHTML();
                    homeSpots += this.spots[playerIndex][1][spotIndex].getHTML();
                }
                boardSpots += this.spots[playerIndex][2][spotIndex].getHTML();
            }
            boardSpots += this.getHomePortalProxyHTML(playerIndex);
            boardSpots += this.getHomeChainProxyHTML(playerIndex);

            boardHTML += playerOpen + playerDeco
                + startOpen + startSpots + closeDiv
                + homeOpen + homeSpots + closeDiv
                + boardOpen + boardSpots + closeDiv
                + closeDiv;
        }
        gbElement.innerHTML = boardHTML;
    }
    getMarbleOnSpot(givenSpot) {
        let spot = this.getSpotFromSpecs(givenSpot);
        let marblePlayer = spot.marble;
        if (marblePlayer === -1) {
            return null;
        }
        for (let marbleIndex = 0; marbleIndex < 4; marbleIndex++) {
            let curMarble = this.marbles[marblePlayer][marbleIndex];
            if (spot.player == curMarble.spot.player) {
                if (spot.area == curMarble.spot.area) {
                    if (spot.index == curMarble.spot.index) {
                        return curMarble;
                    }
                }
            }
        }
        return null;
    }
    findStartSpace(player_index, number_previously_tocked = 0) {
        let firstSpace = null;
        let count = number_previously_tocked;
        this.spots[player_index][0].forEach((spot, index) => {
            if (firstSpace == null){
                if (spot.marble === -1 && count-- == 0) {
                    firstSpace = spot;
                }
            }
        });
        return firstSpace;
    }
    fromHomeToStart(spotFunction) {
        let currentSpot = this.spots[this.localPlayer][1][3];
        let endSpot = this.spots[this.localPlayer][2][0];
        let cancelFlag = false;
        let cancelNext = false;
        while (currentSpot != null && !cancelFlag) {
            cancelFlag = spotFunction(currentSpot);
            if (cancelNext) { cancelFlag = true; }
            let nextSpotSpecs = currentSpot.getPrevious(this.localPlayer);
            if (nextSpotSpecs == null) { currentSpot = null; }
            else {
                currentSpot = this.getSpotFromSpecs(nextSpotSpecs);
                if (currentSpot.spotID == endSpot.spotID){ cancelNext = true; }
            }
        }
    }
    getBoardBlockers() {
        let blockers = [];
        let playerIndex = this.localPlayer;
        let count = 0;
        while (count < 4) {
            if (this.spots[playerIndex][2][8].marble > -1) {
                blockers.push({
                    player: playerIndex,
                    area: 2,
                    index: 8
                });
            }
        }
        return blockers;
    }
    checkIfStartPortalIsBlocked(player_index) {
        return this.spots[player_index][2][0].marble == player_index;
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
    (jokerColor) => { return "<p>" + jokerColor + " Joker</p><p>Start a marble, pulling it onto the board at the closest 18, or propel a marble 15 spaces. Then, draw a card and take another turn.</p>"; },
    (suite) => { return "<p>Ace of " + suite + "s</p><p>Start a marble, or propel a marble you control 1 space.</p>"; },
    (suite) => { return "<p>Two of " + suite + "s</p><p>Propel a marble you control 2 spaces.</p>"; },
    (suite) => { return "<p>Three of " + suite + "s</p><p>Propel a marble you control 3 spaces.</p>"; },
    (suite) => { return "<p>Four of " + suite + "s</p><p>Move a marble you control 4 spaces backwards without moving into any home spaces.</p>"; },
    (suite) => { return "<p>Five of " + suite + "s</p><p>Propel a marble you control 5 spaces.</p>"; },
    (suite) => { return "<p>Six of " + suite + "s</p><p>Propel a marble you control 6 spaces.</p>"; },
    (suite) => { return "<p>Seven of " + suite + "s</p><p>Propel any number of your marbles a total of 7 spaces.</p>"; },
    (suite) => { return "<p>Eight of " + suite + "s</p><p>Propel a marble you control 8 spaces.</p>"; },
    (suite) => { return "<p>Nine of " + suite + "s</p><p>Propel a marble you control 9 spaces.</p>"; },
    (suite) => { return "<p>Ten of " + suite + "s</p><p>Propel a marble you control 10 spaces.</p>"; },
    (suite) => { return "<p>Jack of " + suite + "s</p><p>Propel a marble you control 11 spaces, or swap it with any unprotected marble you do not control.</p>"; },
    (suite) => { return "<p>Queen of " + suite + "s</p><p>Propel a marble you control 12 spaces.</p>"; },
    (suite) => { return "<p>King of " + suite + "s</p><p>Start a marble, or propel a marble you control 13 spaces.</p>"; },
];
class CurrentHand {
    constructor(data, active) {
        this.cards = data;
        this.active = false;
        if (this.cards && this.cards.length > 0) {
            this.selected = this.cards.length - 1;
            this.active = active;
        }
        this.parent = document.getElementById("currentHand");
        this.text = document.getElementById("selectedCardText");
    }
    loadHTML() {
        if (this.cards && this.cards.length) {
            let handHTML = '<div class="hHand">\n';
            this.map((index, card) => {
                let cardClasses = "tockCard ";
                cardClasses += card.category.toLocaleLowerCase() + " ";
                cardClasses += cardValueClasses[card.value] + " Card";
                if (this.active) {
                    if (!card.valid) { cardClasses += 'Not'; }
                    cardClasses += 'Valid';
                }
                handHTML += '<div class="' + cardClasses + '" id="playerHand_' + (index + 1) + '" ';
                if (this.active) {
                    handHTML += 'onclick="tockHistory.setSelectedCard(' + index + ');"';
                }
                handHTML += '></div>\n';
            });
            handHTML += "</div>\n";
            this.parent.innerHTML = handHTML;
        } else { this.parent.innerHTML = ""; }
        let curCardText = "<p>Please wait for your turn.</p>";
        if (this.active) {
            curCardText = cardText[this.cards[this.selected].value](this.cards[this.selected].category);
        }
        this.showText(curCardText);
    }
    showText(text) {
        this.text.innerHTML = text;
    }
    map(mapFunction) {
        for (let cardIndex = 0; cardIndex < this.cards.length; cardIndex++) {
            mapFunction(cardIndex, this.cards[cardIndex]);
        }
    }
    compileHand() {
        let hand = [];
        this.cards.forEach((card, index) => {
            hand.push({ id: card.id, index: index });
        });
        return hand;
    }
    getSelected() { return this.cards[this.selected]; }
    select(newSelection) {
        if (this.cards !== null && this.cards.length > 0){
            let newCards = [];
            let selectedCard;
            this.map((index, card) => {
                if (index == newSelection) { selectedCard = card; }
                else { newCards.push(card); }
            });
            newCards.push(selectedCard);
            this.cards = newCards;
        }
        this.loadHTML();
    }
    sortByValidity() {
        let valid = [], invalid = [];
        this.map((cardIndex, card) => {
            let arr = invalid;
            if (card.valid) { arr = valid; }
            arr.push(card);
        });
        this.cards = invalid.concat(valid);
    }
}

class OpponentHand {
    constructor(playerIndex, name, avatarClass, handCount, board) {
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
            + this.avatarClass + '"></div><p class="name_player'
            + (this.playerIndex + 1) + ' m-1">'
            + this.name + '</p> </div> <div class="hHand">';
        for (let cardIndex = 0; cardIndex < this.handCount; cardIndex++) {
            htmlString += '<div class="opponentCard" id="opponent' + this.location + '_' + (cardIndex + 1) + '"></div>';
        }
        htmlString += '</div>';
        this.parentElement.innerHTML = htmlString;
        this.parentElement.classList.add("decoPlayer_" + this.playerIndex);
    }
}
let Highlight = {
    Marble: {
        Selected: 4,
        Unselected: 2
    },
    Possibility: {
        Selected: 3,
        Unselected: 1
    }
};
let MoveType = {
    Start: 0,
    Propel: 1,
    Tock: 2,
    Switch: 3,
    strings: ['Start', 'Propel', 'Tock', 'Switch'],
    asString(moveType) {
        return this.strings[moveType];
    }
};
class Strategy {
    constructor(currentBoard, currentCard) {
        this.startBoard = currentBoard;
        this.currentBoard = this.startBoard.copy();
        this.card = currentCard;
        this.player = this.currentBoard.localPlayer;
        this.selected = {
            marble: -1,
            possibility: -1
        }
        this.setBoardCopy();
        this.marbleBoard = this.currentBoard;
        this.possibilities = [];
        for (let stepIndex = 0; stepIndex < 4; stepIndex++) { this.possibilities.push([]); }
        this.possibilityKey = 0;
    }
    makeBoard() {
        switch (this.card.value) {
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
        return this.currentBoard;
    }
    makePropel(propelAmount) {
        this.myMarbles.forEach((marble, index) => {
            if (marble.spot.area > 0) {
                let marbleSpot = this.getCurrentSpot(marble.spot);
                let nextSpot = marbleSpot.getNext(this.player);
                let validPropel = this.validatePropel(nextSpot, propelAmount - 1);
                if (validPropel !== null) {
                    this.addPossibility(MoveType.Propel, marble, validPropel);
                    this.setMarbleAsUnselected(marble);
                }
            }
        });
        this.validity = this.possibilityKey !== 0;
    }
    makeBackwards4() {
        this.myMarbles.forEach((marble, index) => {
            if (marble.spot.area > 0) {
                let marbleSpot = this.getCurrentSpot(marble.spot);
                let nextSpot = marbleSpot.getPrevious(this.player);
                let validPropel = this.validatePropel(nextSpot, -3);
                if (validPropel !== null) {
                    this.addPossibility(MoveType.Propel, marble, validPropel);
                    this.setMarbleAsUnselected(marble);
                }
            }
        });
        this.validity = this.possibilityKey !== 0;
    }
    makeIncrementalPropel() {
        if (this.is7AValidCard()) {
            this.initializeTheory();
            this.updateTheory();
            this.theory.data.forEach((propelInfo, index) => {
                if (propelInfo != null && propelInfo.actualDistance > 0) {
                    this.setMarbleAsUnselected(this.myMarbles[index]);
                }
            });
        }
    }
    makeSwitch() {
        this.myMarbles.forEach((marble, index) => {
            if (marble.spot.area == 2) {
                let hasSwitchMate = false;
                this.activeMarbles.forEach((otherMarble, index) => {
                    if (marble.owner !== otherMarble.owner) {
                        if (otherMarble.spot.index !== 8) {
                            hasSwitchMate = true;
                            this.addPossibility(MoveType.Switch, marble, this.getCurrentSpot(otherMarble.spot));
                        }
                    }
                })
                if (hasSwitchMate) {
                    this.setMarbleAsUnselected(marble);
                }
            }
        });
        this.validity = this.possibilityKey !== 0;
    }
    makeStart() {
        if (!this.currentBoard.checkIfStartPortalIsBlocked(this.player)) {
            this.myMarbles.forEach((marble, index) => {
                if (marble.spot.area === 0) {
                    this.addPossibility(MoveType.Start, marble, this.getCurrentSpot({ player: marble.spot.player, area: 2, index: 0 }));
                    this.setMarbleAsUnselected(marble);
                }
            });
        }
        this.validity = this.possibilityKey !== 0;
    }
    validatePropel(spotSpecs, amount) {
        let spot = this.getCurrentSpot(spotSpecs);
        if (spot === null || spot.isBlocking(this.player, amount == 0)) {
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
    is7AValidCard() {
        let totalDistance = 0;
        let currentDistance = 0;
        let furthestSpot = null;
        this.currentBoard.fromHomeToStart((spot) => {
            if (spot.marble > -1) {
                if (spot.marble == this.player) {
                    totalDistance += currentDistance;
                } else {
                    if (spot.index == 8) {
                        currentDistance = 0;
                    } else {
                        currentDistance += 1;
                    }
                }
            } else {
                currentDistance += 1;
            }
            return totalDistance >= 7;
        });
        this.validity = totalDistance >= 7;
        return this.validity;
    }
    isBlocked(propelInfo, nextSpace, tocking = false) {
        let spot = nextSpace;
        let marble = propelInfo.marble;
        if (spot.id == propelInfo.currentSpace.id) { return true; }
        if (spot.marble > -1) {
            if (spot.marble == marble.ident) {
                return false;
            }
            if (spot.marble > 3) { return true; }
            if (spot.index == 0 && spot.player === spot.marble) { return !tocking; }
            if (spot.index == 8) { return true; }
        } else {
            if (spot.area !== 2 && spot.player !== this.player) { return true; }
        }
        return false;
    }
    canContinue(propelInfo) {
        let notBlocked = !propelInfo.blocked;
        let notFinished = propelInfo.requestedDistance !== propelInfo.actualDistance;
        return notBlocked && notFinished;
    }
    initializeTheory() {
        this.theoryBoard = this.currentBoard.copy();
        this.theory = {
            data: [],
            marbles: this.makeTheoryMarbles(this.myMarbles)
        };
        this.theory.marbles.forEach((marble, index) => {
            if (marble.source.area > 0) {
                let sourceSpot = this.getTheorySpot(marble.source);
                let propelInfo = {
                    marble: marble,
                    marbleIndex: index,
                    requestedDistance: 7,
                    actualDistance: 0,
                    theoreticalDistance: 0,
                    blocked: false,
                    startSpace: sourceSpot,
                    currentSpace: sourceSpot,
                    unblockedSpaces: [],
                    selection: -1
                };
                this.theory.data[index] = propelInfo;
            } else {
                this.theory.data[index] = null;
            }
        });
    }
    resetTheory(propelInfo) {
        this.removeTheoryFromMarbleboard(propelInfo);
        propelInfo.blocked = false;
        propelInfo.currentSpace = propelInfo.startSpace;
        propelInfo.actualDistance = 0;
        propelInfo.unblockedSpaces = [];
        this.possibilities[this.getMyMarbleIndex(propelInfo.marble.id)] = [];
    }
    placeTheoryOnMarbleboard(propelInfo){
        if (propelInfo.selection !== -1){
            let targetSpot = this.getMarbleboardSpot(propelInfo.unblockedSpaces[propelInfo.selection]);
            targetSpot.setHighlight(Highlight.Possibility.Selected);
        }
    }
    showTheoryOnCurrentBoard(propelInfo){
        propelInfo.unblockedSpaces.forEach((piSpot, index)=>{
            if (index !== propelInfo.selection){
                let spot = this.getCurrentSpot(piSpot);
                spot.setHighlight(Highlight.Possibility.Unselected);
                spot.onClick = "tockHistory.selectPossibility(" + propelInfo.marbleIndex + "," + index + ");";
            }
        });
        let spot = this.getCurrentSpot(propelInfo.startSpace);
        spot.setHighlight(Highlight.Possibility.Unselected);
        spot.onClick = "tockHistory.selectPossibility(" + propelInfo.marbleIndex + "," + (-1) + ");";
    }
    makeTheoryChoice(marble_index, selection){}
    openTheoryMarble(marble_index){
        this.selected.marble = marble_index;
        this.currentBoard = this.marbleBoard.copy();
        let propelInfo = this.theory.data[marble_index];
        this.showTheoryOnCurrentBoard(propelInfo);
        this.currentBoard.AttachDivs();
        
    }
    removeTheoryFromMarbleboard(propelInfo){
        if (propelInfo.selection !== -1){
            let targetSpot = this.getMarbleboardSpot(propelInfo.unblockedSpaces[propelInfo.selection]);
            let targetMarble = this.currentBoard.getMarbleOnSpot(targetSpot);
            targetSpot.setHighlight(-1);
            if (targetMarble !== null && targetMarble.owner == propelInfo.marble.owner){
                targetSpot.setHighlight(Highlight.Marble.Unselected);
                targetSpot.onClick = "tockHistory.selectMarble(" + marble.id + ");";
            }
        }
    }
    updateTheory() {
        this.theory.data.forEach((propelInfo, index) => {
            if (propelInfo != null) {
                this.resetTheory(propelInfo);
                while (this.canContinue(propelInfo)) {
                    let nextSpotSpecs = propelInfo.currentSpace.getNext(this.player);
                    if (nextSpotSpecs !== null){
                        let nextSpot = this.getTheorySpot(nextSpotSpecs);
                        if (this.isBlocked(propelInfo, nextSpot, true)) {
                            propelInfo.blocked = true;
                        } else {
                            propelInfo.currentSpace = nextSpot;
                            propelInfo.actualDistance++;
                            propelInfo.unblockedSpaces.push(nextSpot);
                            this.addPossibility(MoveType.Propel, propelInfo.marble, propelInfo.currentSpace);
                        }
                    } else { propelInfo.blocked = true; }
                }
                if (propelInfo.selection >= propelInfo.unblockedSpaces.length){
                    propelInfo.selection = -1;
                } else {
                    this.placeTheoryOnMarbleboard(propelInfo);
                }
            }
        });
    }
    makeTheoryMarbles(marbles) {
        let newMarbles = [];
        marbles.forEach((marble, index) => {
            newMarbles[index] = {
                id: marble.id,
                owner: marble.owner,
                index: index,
                ident: index + 4,
                spot: {
                    player: marble.spot.player,
                    area: marble.spot.area,
                    index: marble.spot.index
                },
                source: {
                    player: marble.spot.player,
                    area: marble.spot.area,
                    index: marble.spot.index
                }
            };
            this.getTheorySpot(newMarbles[index].spot).marble = newMarbles[index].ident;
        });
        return newMarbles;
    }
    calculateSpotDistance(from, to) {
        let equal = (from, to) => {
            return from.player == to.player
                && from.area == to.area
                && from.index == to.index;
        };
        let incrementSpot = (spot) => {
            spot.index += 1;
            if (spot.area == 2) {
                if (spot.index == 18) {
                    spot.index = 0;
                    spot.player = (spot.player + 1) % 4;
                    if (spot.player == this.player) {
                        spot.area = 1;
                    }
                }
            } else {
                if (spot.index == 4) {
                    spot.index = 3;
                }
            }
        };
        let current = from;
        let distance = 0;
        while (!equal(current, to)) {
            distance++;
            incrementSpot(current);
        }
        return distance;
    }
    countMoves() {
        let count = 0;
        this.theory.data.forEach((propelInfo, index) => {
            if (propelInfo != null) {
                count += propelInfo.selection + 1;
            }
        });
        return count;
    }
    getTheorySpot(spotSpecs) {
        return this.theoryBoard.spots[spotSpecs.player][spotSpecs.area][spotSpecs.index];
    }
    getMarbleboardSpot(spotSpecs) {
        return this.marbleBoard.spots[spotSpecs.player][spotSpecs.area][spotSpecs.index];
    }
    compileTheory() {
        this.possibility = null;
        this.theory.data.forEach((propelInfo, index) => {
            if (propelInfo !== null) {
                if (propelInfo.selection > -1) {
                    let currentIndex = 0;
                    let previousSpot = propelInfo.startSpace;
                    if (this.possibility == null) {
                        this.possibility = {
                            card: this.card,
                            moveType: MoveType.Propel,
                            marble: propelInfo.marble,
                            marbleIndex: this.getMyMarbleIndex(propelInfo.marble.id),
                            sourceSpot: this.getCurrentSpot(propelInfo.marble.source),
                            destinationSpot: propelInfo.unblockedSpaces[0],
                            subMoves: [],
                            toString: () => {
                                return MoveType.asString(possibility.moveType) + ' Marble ' + possibility.marble.toString() + ' to ' + possibility.destinationSpot.toString();
                            }
                        };
                        currentIndex = 1;
                        previousSpot = this.possibility.destinationSpot;
                    }
                    let tocks = [];
                    while (currentIndex <= propelInfo.selection) {
                        let destination = propelInfo.unblockedSpaces[currentIndex];
                        this.possibility.subMoves.push({
                            moveType: MoveType.Propel,
                            marble: propelInfo.marble,
                            fromSpot: previousSpot,
                            toSpot: destination
                        });
                        let tockSubMove = this.getTockSubmove(destination, tocks);
                        if (tockSubMove !== null) {
                            this.possibility.subMoves.push(tockSubMove);
                        }
                        previousSpot = destination;
                        currentIndex++;
                    }
                }
            }
        });
        return this.possibility;
    }
    getMyMarbleIndex(marbleId) {
        let index = -1;
        this.myMarbles.forEach((myMarble, myIndex) => {
            if (marbleId === myMarble.id) {
                index = myIndex;
            }
        });
        return index;
    }
    setMarbleAsSelected(marble) {
        this.onMarbleSpot(marble, (spot, marble) => {
            spot.setHighlight(Highlight.Marble.Selected);
            spot.onClick = "tockHistory.deselectMarble();";
        });
    }
    setMarbleAsUnselected(marble) {
        this.onMarbleSpot(marble, (spot, marble) => {
            spot.setHighlight(Highlight.Marble.Unselected);
            spot.onClick = "tockHistory.selectMarble(" + marble.id + ");";
        });
    }
    setPossibilityAsSelected(possibility) {
        this.onPossibilitySpot(possibility, (spot, possibility) => {
            spot.setHighlight(Highlight.Possibility.Selected);
            // spot.onClick = "tockHistory.deselectPossibilities();";
        });
    }
    setPossibilityAsUnselected(possibility) {
        this.onPossibilitySpot(possibility, (spot, possibility) => {
            spot.setHighlight(Highlight.Possibility.Unselected);
            spot.onClick = "tockHistory.selectPossibility(" + possibility.marbleIndex + "," + possibility.possibilityIndex + ");";
        });
    }
    setPossibilityAsHidden(marble) {
        this.onPossibilitySpot(possibility, (spot, possibility) => {
            spot.setHighlight(-1);
            spot.onClick = null;
        });
    }
    onMarbleSpot(marble, spotFunc) {
        let spot = this.getCurrentSpot(marble.spot);
        spotFunc(spot, marble);
    }
    onPossibilitySpot(possibility, spotFunc) {
        let spot = this.getCurrentSpot(possibility.destinationSpot);
        spotFunc(spot, possibility);
    }
    getCurrentSpot(specs) {
        return this.currentBoard.getSpotFromSpecs(specs);
    }
    addPossibility(moveType, marble, destinationSpot, otherProperties = {}) {
        let possibility = otherProperties;
        if (possibility.subMoves === undefined) { possibility.subMoves = []; }
        possibility.id = this.possibilityKey++;
        possibility.card = this.card;
        possibility.moveType = moveType;
        possibility.marble = marble;
        possibility.marbleIndex = this.getMyMarbleIndex(marble.id);
        possibility.sourceSpot = this.getCurrentSpot(marble.spot);
        possibility.destinationSpot = destinationSpot;
        possibility.toString = () => {
            return MoveType.asString(possibility.moveType) + ' Marble ' + possibility.marble.toString() + ' to ' + possibility.destinationSpot.toString();
        }
        let subMove = this.getTockSubmove(destinationSpot);
        if (subMove !== null) {
            if (possibility.moveType == MoveType.Switch) {
                subMove.moveType = MoveType.Switch;
                subMove.toSpot = possibility.sourceSpot;
            }
            possibility.subMoves.push(subMove);
        }
        possibility.possibilityIndex = this.possibilities[possibility.marbleIndex].length;
        this.possibilities[possibility.marbleIndex].push(possibility);
        return possibility;
    }
    copyPossibility(possibility) {
        let keys = Object.keys(possibility);
        let newPossibility = {};
        keys.forEach((keyName, index) => {
            newPossibility[keyName] = possibility[keyName];
        });
        newPossibility.subMoves = [];
        return newPossibility;
    }
    getTockSubmove(spot, tocks = []) {
        let misplacedMarble = this.currentBoard.getMarbleOnSpot(spot);
        if (misplacedMarble !== null) {
            let playerTocks = tocks[misplacedMarble.owner];
            if (playerTocks === undefined) { playerTocks = 0;}
            let tockedDestination = this.currentBoard.findStartSpace(misplacedMarble.owner, playerTocks);
            let subMove = {
                moveType: MoveType.Tock,
                marble: misplacedMarble,
                fromSpot: spot,
                toSpot: tockedDestination
            };
            tocks[misplacedMarble.owner] = playerTocks + 1;
            return subMove;
        }
        return null;
    }
    hasPossibilities() {
        return this.validity;
    }
    selectMarble(marbleId) {
        if (this.theory){ this.openTheoryMarble(this.getMyMarbleIndex(marbleId));}
        else {
            // Copy board and log click
            this.setBoardCopy();
            let marbleIndex = this.getMyMarbleIndex(marbleId);
            let marble = this.myMarbles[marbleIndex];
            let spot = this.getCurrentSpot(marble.spot);
            console.log("Selected Marble " + marbleId + " @ Spot " + spot.toString());

            // Reset highlights if a marble was previously set
            // - possibility highlights and interactions should be removed
            // - marble highlight should be set to unselected
            // - any possibility selection should be removed
            if (this.selected.marble !== -1 && this.selected.marble !== marbleIndex) {
                this.possibilities[this.selected.marble].forEach((possibility, index) => {
                    this.setPossibilityAsHidden(possibility);
                });
                this.selected.possibility = -1;
                this.setMarbleAsUnselected(this.myMarbles[this.selected.marble]);
            }

            // Visually select marble and show that marbles possibilities
            this.setMarbleAsSelected(marble);
            this.possibilities[marbleIndex].forEach((possibility, pIndex) => {
                console.log('Possibility ' + pIndex + ': ' + MoveType.asString(possibility.moveType) + ' to ' + possibility.destinationSpot.toString());
                possibility.subMoves.forEach((subMove, index) => {
                    console.log('Sub-Move: Marble ' + subMove.marble.toString() + ' ' + MoveType.asString(subMove.moveType) + ' to ' + subMove.toSpot.toString());
                });
                this.setPossibilityAsUnselected(possibility);
            });

            // If incremental propel, check for current selection
            if (this.theory) {
                let selectedIndex = this.theory.data[marbleIndex].selection;
                if (selectedIndex > -1) {
                    this.setPossibilityAsSelected(this.possibilities[marbleIndex][selectedIndex]);
                    this.selected.possibility = selectedIndex;
                }
            }

            // Save our newly selected marble and display
            this.selected.marble = marbleIndex;
            this.currentBoard.AttachDivs();
        }
    }
    selectTheory(marbleIndex, possibilityIndex) {
        let propelInfo = this.theory.data[marbleIndex];
        if (propelInfo.selection > -1) {
            let oldTheory = this.getTheorySpot(propelInfo.unblockedSpaces[propelInfo.selection]);
            oldTheory.marble = -1;
        }
        this.removeTheoryFromMarbleboard(propelInfo);
        let newTheory = this.getTheorySpot(propelInfo.startSpace);
        if (possibilityIndex > -1) {
            newTheory = this.getTheorySpot(propelInfo.unblockedSpaces[possibilityIndex]);
        }
        newTheory.marble = propelInfo.marble.ident;
        propelInfo.marble.spot.player = newTheory.player;
        propelInfo.marble.spot.area = newTheory.area;
        propelInfo.marble.spot.index = newTheory.index;
        propelInfo.selection = possibilityIndex;
        this.updateTheory();
        this.possibility = null;
        this.placeTheoryOnMarbleboard(propelInfo);
        this.currentBoard = this.marbleBoard.copy();
        this.currentBoard.AttachDivs();
    }
    selectPossibility(marbleIndex, possibilityIndex) {
        if (this.theory){
            this.selectTheory(marbleIndex, possibilityIndex);
        }
        else {
            // Copy board and log click
            this.setBoardCopy();
            let marble = this.myMarbles[marbleIndex];
            let spot = this.getCurrentSpot(marble.spot);
            let possibility = this.possibilities[marbleIndex][possibilityIndex];
            console.log('Selected possibility: ' + possibility.toString());

            // If another possibility was previously chosen, reset it
            if (this.selected.possibility !== -1 && this.selected.possibility != possibilityIndex) {
                this.setPossibilityAsUnselected(this.possibilities[marbleIndex][this.selected.possibility]);
            }
            this.setPossibilityAsSelected(possibility);
            this.selected.possibility = possibilityIndex;
            if (this.theory) {
                this.selectTheory(marbleIndex, possibilityIndex);
            }
            this.currentBoard.AttachDivs();
        }
        return this.isReady();
    }
    isReady() {
        if (this.theory) {
            return this.countMoves() == 7;
        } else {
            return this.selected.possibility > -1;
        }
    }
    getPossibility() {
        if (this.isReady()){
            if (this.theory) {
                return this.compileTheory();
            } else {
                return this.possibilities[this.selected.marble][this.selected.possibility];
            }
        }
        return null;
    }
    deselectPossibilities() {
        let oldPossibility = this.possibilities[this.selected.marble][this.selected.probability];
        this.setPossibilityAsUnselected(oldPossibility);
        this.selected.possibility = -1;

        if (this.theory) {
            let propelInfo = this.theory.data[this.selected.marble];
            this.getCurrentSpot()
        }
    }
    setBoardCopy() {
        this.previousBoard = this.currentBoard;
        this.currentBoard = this.previousBoard.copy();
        this.activeMarbles = this.currentBoard.getOnBoardMarbles();
        this.myMarbles = this.currentBoard.getPlayersMarbles();
    }
    setPreviousBoard() {
        this.currentBoard = this.previousBoard;
        this.previousBoard = this.board;
        this.currentBoard.AttachDivs();
    }
    setMarbleBoard() {
        this.currentBoard = this.marbleBoard;
        this.activeMarbles = this.currentBoard.getOnBoardMarbles();
        this.myMarbles = this.currentBoard.getPlayersMarbles();
        this.selected.marble = -1;
        this.selected.possibility = -1;
    }
}
class ConfirmHandler {
    constructor(buttonID) {
        this.buttonId = buttonID;
        this.buttonElement = document.getElementById(this.buttonId);
        this.State = {
            Hidden: "hidden",
            WasteCard: "Waste Current Card",
            StartMarble: "Start Marble",
            MoveMarble: "Move Marble",
            MoveMarbles: "Move Marble",
            TockMarble: "Tock That Marble!",
            SwitchMarble: "Switch Marbles"
        };
        this.setState(this.State.Hidden);
    }
    setState(state) {
        this.state = state;
        if (this.state === this.State.Hidden) {
            this.buttonElement.hidden = true;
        } else {
            this.buttonElement.hidden = false;
            this.buttonElement.textContent = this.state;
        }
    }
}
class TockHistory {
    constructor(gameState) {
        this.gameState = gameState;
        this.active = gameState.active;
        this.hand = new CurrentHand(this.gameState.curHand, this.active);
        this.startBoard = new Board(this.gameState.numPlayers, this.gameState.curPlayer);
        this.confirm = new ConfirmHandler("confirm");
        this.parseMarbles();
        this.parseOpponents();
        if (this.active) {
            this.prepareStrategies();
            if (this.canWaste) { this.setConfirm(); }
        }
        this.setSelectedCard(this.hand.selected);
    }
    update(data) {
        this.gameState = data;
        this.active = this.gameState.activePlayer;
        this.hand = new CurrentHand(this.gameState.curHand, this.active);
        this.startBoard = new Board(this.gameState.numPlayers, this.gameState.game.curPlayerIndex);
        this.canWaste = false;
        this.setConfirm();
        this.parseMarbles();
        this.parseOpponents();
        if (this.active) {
            this.prepareStrategies();
            if (this.canWaste) { this.setConfirm(); }
        }
        this.setSelectedCard(this.hand.selected);
    }
    setSelectedCard(newSelection) {
        this.hand.select(newSelection);
        let newCard = this.hand.getSelected();
        let newBoard = this.startBoard;
        if (this.active) {
            if (this.strategy !== undefined){
                this.strategy.setMarbleBoard();
            }
            this.strategy = this.strategies[newCard.value];
            newBoard = this.strategy.currentBoard;
            this.setConfirm();
        }
        this.currentBoard = newBoard;
        this.currentBoard.AttachDivs();
    }
    parseMarbles() {
        let marb_player_0 = [];
        let marb_player_1 = [];
        let marb_player_2 = [];
        let marb_player_3 = [];
        let newMarbles = [marb_player_0, marb_player_1, marb_player_2, marb_player_3];
        let homeMarbles = [];
        for (let marbIndex = 0; marbIndex < this.gameState.marbles.length; marbIndex++) {
            let currentMarble = this.gameState.marbles[marbIndex];
            let currentSpot = this.startBoard.getSpotFromID(currentMarble.current_spot);
            let marbleData = {
                id: currentMarble.id,
                owner: currentMarble.player_index,
                spot: {
                    player: currentSpot.player,
                    area: currentSpot.area,
                    index: currentSpot.index
                },
                toString: function () {
                    return this.id + '(Player ' + (this.owner + 1) + ')[' + this.spot.player + ',' + this.spot.area + ',' + this.spot.index + ']';
                }
            }
            newMarbles[currentMarble.player_index].push(marbleData);
            if (currentSpot.area === 1) { 
                let prevNum = homeMarbles[currentMarble.player_index];
                if (prevNum === undefined) { prevNum = 0; }
                homeMarbles[currentMarble.player_index] = prevNum+1;
            }
        }
        let winner = null;
        homeMarbles.forEach((marbleCount, player_index)=>{
            if (marbleCount == 4) {
                winner = player_index;
            }
        });
        this.winner = winner;
        this.startBoard.placeMarbles(newMarbles);
    }
    parseOpponents() {
        this.parseHands();
        this.opponentHands = [];
        for (let playerIndex = 0; playerIndex < this.gameState.numPlayers; playerIndex++) {
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
        for (let sizeIndex = 0; sizeIndex < this.gameState.numPlayers; sizeIndex++) { newHands.push(0); }
        for (let countIndex = 0; countIndex < countArray.length; countIndex++) {
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
    prepareStrategies() {
        this.strategies = [];
        this.canWaste = true;
        this.hand.map((cardIndex, card) => {
            let curStrat;
            if (this.strategies[card.value]) {
                curStrat = this.strategies[card.value];
            } else {
                curStrat = new Strategy(this.startBoard, card);
                curStrat.makeBoard();
                this.strategies[card.value] = curStrat;
            }
            if (curStrat.hasPossibilities()) { card.valid = true; this.canWaste = false; }
            else { card.valid = false; }
        });
        this.hand.sortByValidity();
    }
    selectMarble(marbleId) {
        this.strategy.selectMarble(marbleId);

    }
    selectPossibility(marbleId, possibilityIndex) {
        if (this.strategy.selectPossibility(marbleId, possibilityIndex)) {
            this.setConfirm(this.strategy.getPossibility());
        } else { this.setConfirm(); }
    }
    selectPrevious() {
        this.strategy.setPreviousBoard();
    }
    setConfirm(possibility) {
        if (possibility == undefined) {
            if (this.canWaste) {
                this.confirm.setState(this.confirm.State.WasteCard);
            } else {
                this.confirm.setState(this.confirm.State.Hidden);
            }
        } else {
            if (possibility.moveType == MoveType.Start) {
                this.confirm.setState(this.confirm.State.StartMarble);
            } else if (possibility.moveType == MoveType.Switch) {
                this.confirm.setState(this.confirm.State.SwitchMarble);
            } else {
                if (possibility.subMoves.length == 0) {
                    this.confirm.setState(this.confirm.State.MoveMarble);
                } else {
                    if (possibility.subMoves.length > 1) {
                        this.confirm.setState(this.confirm.State.MoveMarbles);
                    } else {
                        this.confirm.setState(this.confirm.State.TockMarble);
                    }
                }
            }
        }
    }
    prepareMoveData() {
        let possibility = this.strategy.getPossibility();
        if (possibility == null && !this.canWaste) {
            console.log("No possibility selected.");
            return null;
        } else {
            let data = this.compileMove(possibility);
            console.log("Prepared move: ");
            console.log(data);
            return data;
        }
    }
    confirmMove() {
        let data = this.prepareMoveData();
        if (data !== null) {
            sendPost("/game/move", data)
                .then((data) => { 
                    console.log(data); 
                    if (data.status.valid !== true){
                        this.hand.showText("<p>Error</p><p>"+data.status.text+"</p>");
                    }
                });
        }
    }
    compileMove(possibility) {
        let data = {
            user_id: this.gameState.userID,
            game_id: this.gameState.gameID,
            player_index: this.gameState.curPlayer,
            game_player_id: this.gameState.gamePlayer
        };
        data.hand = this.hand.compileHand();
        data.moves = [];
        if (!this.canWaste){
            data.card_used = {
                game_card_id: possibility.card.id,
                card_id: possibility.card.card_id
            };
            data.moves.push({
                marble_id: possibility.marble.id,
                from_spot_id: possibility.sourceSpot.spotID,
                to_spot_id: possibility.destinationSpot.spotID,
                type: possibility.moveType
            });
            possibility.subMoves.forEach((subMove, index) => {
                data.moves.push({
                    marble_id: subMove.marble.id,
                    from_spot_id: subMove.fromSpot.spotID,
                    to_spot_id: subMove.toSpot.spotID,
                    type: subMove.moveType
                });
            });
        } else {
            let card = this.hand.getSelected();
            data.card_used = {
                game_card_id: card.id,
                card_id: card.card_id 
            }
        }
        return data;
    }
    deselectPossibilities() {
        this.strategy.deselectPossibilities();
    }
    triggerDebug() {
        debug = true;
        this.strategy.currentBoard.AttachDivs();
    }
    startTurn() {
        let data = { game_id: this.gameState.gameID };
        return sendPost("/game/state", data)
            .then((data) => {
                console.log(data);
                this.update(data);
            });

    }
    endGame() {
        this.startTurn().then(()=>{
            this.canWaste = false;
            this.setConfirm();
            this.hand.showText(this.gameState.players[this.winner].name + " has won the game!");
            document.getElementById("endGame").hidden = false;
        });
    }
    leaveEndedGame() {
        window.location.replace("/game/summary/" + this.gameState.gameID);
    }
    proxyClick(player_index, index=-1){
        if (index == -1){
            document.getElementById("spot_"+player_index+"_board_17").click();    
        } else {
            document.getElementById("spot_"+player_index+"_home_"+index).click();
        }
    }
}
let tockHistory;
async function sendPost(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(data)
    });
    return response.json();
}

function gbOnLoad() {
    tockHistory = new TockHistory(gameSetup);
}
window.addEventListener("load", gbOnLoad);