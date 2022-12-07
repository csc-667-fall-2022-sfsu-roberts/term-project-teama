
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
function to_spot_id(player, area, index) {
    let base = (16 * area) + 1;
    let playerMult = 4 + (Math.floor(area / 2) * 14);
    return base + (player * playerMult) + index;
}
class Spot {
    constructor(data) {
        this.player = data.player;
        this.area = data.area;
        this.index = data.index;
        this.marble = -1;
        this.spotID = to_spot_id(this.player, this.area, this.index);
    }
    toString() {
        let spotString = this.spotID + '[' + this.player + ',' + this.area + ',' + this.index + ']';
        if (this.marble > -1) { spotString += this.marble; }
        return spotString;
    }
    getAreaText() {
        if (this.area == 0) { return "start"; }
        else if (this.area == 1) { return "home"; }
        else { return "board"; }
    }
    isBetween(before, after) {
        let start = to_spot_id(before.player, before.area, before.index);
        let end = to_spot_id(after.player, after.area, after.index);
        if (start < end) { return this.spotID <= end && this.spotID >= start; }
        else { return this.spotID >= start || this.spotID <= end; }
    }
    isBlocking(player_index) {
        if (this.marble > -1) {
            if (this.marble == player_index) { return true; }
            if (this.index == 0 && this.player === this.marble) { return true; }
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
            if (index === 4) {
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
            if (index === 0) {
                let prevSection = player_index - 1;
                if (prevSection < 0) {
                    prevSection += 4;
                }
                return { player: prevSection, area: 2, index: 17 };
            }
            return { player: this.player, area: this.area, index: this.index - 1 };
        } else {
            let nextIndex = this.index - 1;
            if (nextIndex === -1) {
                let nextSection = (this.player - 1);
                if (nextSection < 0) { nextSection += 4; }
                if (this.player === player_index) {
                    return null;
                }
                return { player: nextSection, area: 2, index: 17 };
            }
            return { player: this.player, area: 2, index: nextIndex };
        }
    }
}
class Board {
    constructor(numPlayers, currentPlayerIndex) {
        this.numPlayers = numPlayers;
        this.player = currentPlayerIndex;
        this.marbles = null;
        let spots = [];
        for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
            let playerSpots = [];
            let startSpaces = [];
            let homeSpaces = [];
            let boardSpaces = [];
            for (let spotIndex = 0; spotIndex < 18; spotIndex++) {
                if (spotIndex < 4) {
                    startSpaces.push(new Spot({
                        player: playerIndex, 
                        area: 0, 
                        index: spotIndex
                    }));
                    homeSpaces.push(new Spot({
                        player: playerIndex, 
                        area: 1, 
                        index: spotIndex
                    }));
                }
                boardSpaces.push(new Spot({
                    player: playerIndex, 
                    area: 2, 
                    index: spotIndex
                }));
            }
            playerSpots.push(startSpaces);
            playerSpots.push(homeSpaces);
            playerSpots.push(boardSpaces);
            spots.push(playerSpots);
        }
        this.spots = spots;
    }
    filterMarbles(trueIfKeep) {
        let keepers = [];
        if (this.marbles !== null) {
            for (let marbleIndex = 0; marbleIndex < this.marbles.length; marbleIndex++) {
                let marble = this.marbles[marbleIndex];
                if (trueIfKeep(marble, marble.player_index, marbleIndex, this)) {
                    keepers.push(marble);
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
            marble.spot = this.getSpotFromID(marble.current_spot);
            marble.spot.marble = player;
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
    getMarbleOnSpot(spot) {
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
    getFlowValues() {
        const numSpaces = 76;
        let count = 0;
        let flow = {
            to: [],
            from: []
        };
        let currentPosition = this.spots[this.player][2][0];
        while (currentPosition != null){
            flow.to[currentPosition.spotID] = count;
            flow.from[count++] = currentPosition.spotID;
            currentPosition = this.getSpot(currentPosition.getNext(this.player));
        }
        return flow;
    }
    checkWin(potential){
        let homeCount = 0;
        let playerMarbles = this.getPlayersMarbles();
        playerMarbles.forEach((marble)=>{
            if (potential[marble.id] === undefined) {
                if (marble.spot.area == 1) {
                    homeCount++;
                }
            }
            else {
                if (this.getSpotFromID(potential[marble.id]).area == 1) {
                    homeCount++;
                }
            }
        });
        return homeCount == 4;
    }
    fromHomeToStart(spotFunction) {
        let currentSpot = this.spots[this.localPlayer][1][3];
        let cancelFlag = false;
        while (currentSpot != null && !cancelFlag) {
            cancelFlag = spotFunction(currentSpot);
            let nextSpotSpecs = currentSpot.getPrevious();
            if (nextSpotSpecs == null) { currentSpot = null; }
            else {
                currentSpot = this.getSpotFromSpecs(nextSpotSpecs);
            }
        }
    }
    traverse(fromSpotSpecs, amount, mapFunction) {
        let spot = this.getSpot(fromSpotSpecs);
        mapFunction(spot);
        if (amount == 0) { return spot; }
        else if (amount > 0) {
            let nextSpot = spot.getNext(this.player);
            if (nextSpot === null) { return null; }
            return this.traverse(nextSpot, amount - 1);
        } else {
            return this.traverse(spot.getPrevious(this.player), amount + 1);
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
    getSpot(data) {
        let spot = this.spots[data.player][data.area][data.index];
        console.log("Spot "+spot.toString());
        return spot;
    }
    getSpotFromID(spotID) {
        let spotInfo = spotsByID[spotID];
        console.log("Retrieving spot "+spotID+": ["+spotInfo[0]+","+spotInfo[1]+","+spotInfo[2]+"]");
        return this.getSpot({
            player: spotInfo[0], 
            area: spotInfo[1], 
            index: spotInfo[2]
        });
    }
    getSpotFromMarble(marble) {
        return this.getSpot(marble.spot);
    }
    getMarbleByID(marble_id) {
        let marble = null;
        this.marbles.forEach((currentMarble)=>{
            if (currentMarble.id == marble_id){
                marble = currentMarble;
            }
        });
        return marble;
    }
}
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
    constructor(board, card) {
        this.currentBoard = board;
        this.card = card;
        this.player = this.currentBoard.localPlayer;
        this.activeMarbles = this.currentBoard.getOnBoardMarbles();
        this.myMarbles = this.currentBoard.getPlayersMarbles();
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
                let validPropel = this.validatePropel(nextSpot, propelAmount + 1);
                if (validPropel !== null) {
                    this.addPossibility(MoveType.Propel, marble, validPropel);
                }
            }
        });
        this.validity = this.possibilityKey !== 0;
    }
    makeIncrementalPropel() {
        this.is7AValidCard();
    }
    makeSwitch() {
        this.myMarbles.forEach((marble, index) => {
            if (marble.spot.area == 2) {
                let hasSwitchMate = false;
                this.activeMarbles.forEach((otherMarble, index) => {
                    if (marble.owner !== otherMarble.owner) {
                        if (otherMarble.spot.index !== 7) {
                            hasSwitchMate = true;
                            this.addPossibility(MoveType.Switch, marble, this.getCurrentSpot(otherMarble.spot));
                        }
                    }
                });
            }
        });
        this.validity = this.possibilityKey !== 0;
    }
    makeStart() {
        if (!this.currentBoard.checkIfStartPortalIsBlocked(this.player)) {
            this.myMarbles.forEach((marble, index) => {
                if (marble.spot.area === 0) {
                    this.addPossibility(MoveType.Start, marble, this.getCurrentSpot({ player: marble.spot.player, area: 2, index: 0 }));
                }
            });
        }
        this.validity = this.possibilityKey !== 0;
    }
    validatePropel(spotSpecs, amount) {
        let spot = this.getCurrentSpot(spotSpecs);
        if (spot.isBlocking(this.player)) {
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
    getMyMarbleIndex(marbleId) {
        let index = -1;
        this.myMarbles.forEach((myMarble, myIndex) => {
            if (marbleId === myMarble.id) {
                index = myIndex;
            }
        });
        return index;
    }
    onMarbleSpot(marble, spotFunc) {
        let spot = this.getCurrentSpot(marble.spot);
        spotFunc(spot, marble);
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
    getTockSubmove(spot) {
        let misplacedMarble = this.currentBoard.getMarbleOnSpot(spot);
        if (misplacedMarble !== null) {
            let tockedDestination = this.currentBoard.findStartSpace(misplacedMarble.owner);
            let subMove = {
                moveType: MoveType.Tock,
                marble: misplacedMarble,
                fromSpot: spot,
                toSpot: tockedDestination
            };
            return subMove;
        }
        return null;
    }
    hasPossibilities() {
        return this.validity;
    }
}
class WasteValidator {
    constructor(board, currentHand) {
        this.hand = currentHand;
        this.board = board;
        this.player = board.player;
        this.marbles = board.marbles;
        this.prepareStrategies();
    }
    parseMarbles(marbles) {
        let marb_player_0 = [];
        let marb_player_1 = [];
        let marb_player_2 = [];
        let marb_player_3 = [];
        let newMarbles = [marb_player_0, marb_player_1, marb_player_2, marb_player_3];
        for (let marbIndex = 0; marbIndex < marbles.length; marbIndex++) {
            let currentMarble = marbles[marbIndex];
            let currentSpot = this.board.getSpotFromID(currentMarble.current_spot);
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
        }
        this.board.placeMarbles(newMarbles);
    }
    prepareStrategies() {
        this.strategies = [];
        this.canWaste = true;
        this.possibilities = [];
        this.hand.forEach((card) => {
            let curStrat;
            if (this.strategies[card.value]) {
                curStrat = this.strategies[card.value];
            } else {
                curStrat = new Strategy(this.board, card);
                curStrat.makeBoard();
                this.strategies[card.value] = curStrat;
            }
            if (curStrat.hasPossibilities()) { 
                card.valid = true; 
                this.canWaste = false; 
                this.possibilities.push(card.id); 
            }
            else { card.valid = false; }
        });
    }
}
const makeBoard = (numPlayers, currentPlayerIndex, marbles)=>{
    let board = new Board(numPlayers, currentPlayerIndex);
    board.placeMarbles(marbles);
    return board;
};
const validateWaste = (board, hand)=>{
    let wasteValidator = new WasteValidator(board, hand);
    return wasteValidator;
};
module.exports = { makeBoard, validateWaste };