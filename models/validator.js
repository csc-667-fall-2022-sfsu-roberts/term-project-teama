const { DatabaseError } = require("sequelize");
const dbQuery = require("../db/dbquery");
const {makeBoard, validateWaste} = require("../models/boardLogic");

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
let ValidationStatus = {
    NotValidated: { id:-1, text: "Validation not yet run.", valid: false },
    Valid: {id: 0, text: "Validation successful.", valid: true },
    Impersonation: { id: 1, text: "The user_id of the user is different than the user_id of the player.", valid: false },
    GameDoesNotExist: { id: 2, text: "The game_id supplied does not exist.", valid: false },
    GameNotInProgress: { id: 3, text: "The game is not in progress.", valid: false },
    UserNotPlayingGame: { id: 4, text: "The given user is not playing the given game.", valid: false },
    NotPlayerTurn: { id: 5, text: "It is not this player's turn.", valid: false },
    InvalidCardInfo: { id: 6, text: "The cards given were incorrect.", valid: false },
    InvalidMarbles: { id: 7, text: "The marbles given were incorrect.", valid: false },
    CannotWasteWhenValidExists: { id: 8, text: "Cannot waste a card if a valid move exists.", valid: false },
    ExtraMoves: { id: 9, text: "Extra moves were given.", valid: false },
    PropelBlocked: { id: 10, text: "There is another marble blocking the way.", valid: false },
    IncorrectPropelEnd: { id: 11, text: "The marble would land on a space different than provided.", valid: false},
    ExtraTockProvided: { id: 12, text: "An invalid tock was attached to moves.", valid: false },
    IncorrectTockMarble: { id: 13, text: "The marble id being tocked was incorrect.", valid: false },
    IncorrectTockLocation: { id: 14, text: "The location the tocked marble was sent to was incorrect.", valid: false },
    MissingTock: { id: 15, text: "The move would tock a marble but no tock is provided.", valid: false },
    InvalidMovementType: { id:16, text: "A move had an invalid movement type.", valid: false },
    InvalidMarbleMoved: { id: 17, text: "Tried to move a marble that cannot be moved.", valid: false },
    IncorrectStartEnd: { id: 18, text: "The marble would land on a space different than provided.", valid: false},
    InvalidMarbleLocation: { id: 19, text: "The marble listed in a move was at an incorrect location.", valid: false},
    InvalidMoveMarble: { id: 20, text: "The marble listed in a move does not belong to this game.", valid: false },
    IncorrectTockMove: { id: 21, text: "A tock move was either missing or extra.", valid: false},
    NotEnoughMoves: {id: 22, text: "There were not enough moves represented.", valid:false},
    InvalidMoveAmount: {id:23, text: "The total amount of moved spaces were not 7 spaces", valid:false},
    InvalidSwitch: {id:24, text: "Attempted an illegal switch.", valid:false},
};

class Validator {
    constructor() {
        this.user_id = -1;
        this.game_id = -1;
        this.player_index = -1;
        this.card_used = -1;
        this.moves = null;
        this.status = ValidationStatus.NotValidated;
    }
    setStatus(validationStatus, extra) {
        console.log("Validation: Status Set: " + validationStatus.text);
        console.log(extra);
        this.status = validationStatus;
        if (extra !== undefined) {
            this.extra = extra;
        }
        return this.status.valid;
    }
    getStatus() {
        return {
            status: this.status,
            data: JSON.stringify(this.extra)
        };
    }

    loadData(data, user_id) {
        this.valid = false;
        this.submission = {
            user_id: data.user_id,
            game_id: data.game_id,
            player_index: data.player_index,
            game_player_id: data.game_player_id,
            card_used: {
                game_cards_id: data.card_used.game_card_id,
                cards_id: data.card_used.card_id
            },
            moves: [],
            hand: []
        };
        data.hand.forEach((cardData, index) => {
            this.submission.hand.push({
                game_cards_id: cardData.id,
                hand_index: cardData.index
            });
        });
        data.moves.forEach((moveData, index) => {
            this.submission.moves.push({
                marble_id: moveData.marble_id,
                from_spot_id: moveData.from_spot_id,
                to_spot_id: moveData.to_spot_id,
                movement_type: moveData.type
            });
        });
        this.truth = {
            user_id: user_id, 
            gameOver: false,
            moves: [], 
            cardShifts: []
        };
        console.log("Data loaded: ");
        console.log(this.submission);
    }

    async validateAccess() {
        if (this.truth.user_id === this.submission.user_id) {
            this.truth.game = await dbQuery.findGamesByGameId(this.submission.game_id);
            if (this.truth.game) {
                this.truth.game_id = this.submission.game_id;
                if (this.truth.game.state === 1) {
                    this.truth.game_player = await dbQuery.findGamePlayer(this.truth.game_id, this.truth.user_id);
                    if (this.truth.game_player) {
                        this.truth.player_index = this.truth.game_player.player_index;
                        if (this.truth.player_index === this.truth.game.turn) {
                            return this.setStatus(ValidationStatus.Valid);
                        } else { return this.setStatus(ValidationStatus.NotPlayerTurn, { player_index: this.truth.player_index, turn: this.truth.game.turn }); }
                    } else { return this.setStatus(ValidationStatus.UserNotPlayingGame, { user_id: this.truth.user_id, game_id: this.truth.game_id }); }
                } else { return this.setStatus(ValidationStatus.GameNotInProgress, { actual: this.truth.game.state }); }
            } else { return this.setStatus(ValidationStatus.GameDoesNotExist, { given: this.submission.game_id }); }
        } else { return this.setStatus(ValidationStatus.Impersonation, { given: this.submission.user_id, expected: this.truth.user_id }); }
    }

    async validateData(){
        await this.retrieveGameTruth();
        let handIsValid = true;
        this.submission.hand.forEach((card) => {
            let isValidCard = false;
            this.truth.cards.forEach((actualCard) => {
                if (card.game_cards_id === actualCard.id) {
                    isValidCard = true;
                    if (card.hand_index !== actualCard.index){
                        this.truth.cardShifts.push({id: card.game_cards_id, index: card.hand_index });
                    }
                }
            });
            if (!isValidCard) {
                this.setStatus(ValidationStatus.InvalidCardInfo, { missingCard: card.game_cards_id });
            }
        });
        let currentCardIsValid = false;
        this.truth.cards.forEach((card) => {
            if (card.id === this.submission.card_used.game_cards_id) {
                this.truth.card_used = card;
                currentCardIsValid = true;
            }
        });
        this.truth.numberOfCardsAfterTurn = this.truth.cards.length - 1;
        if (!currentCardIsValid) {
            this.setStatus(ValidationStatus.InvalidCardInfo, { missingCardID: this.submission.card_used.game_cards_id });
        }
        if (this.status === ValidationStatus.Valid) {
            this.truth.marbleIDs = [];
            this.truth.marbles.forEach((marble) => {
                this.truth.marbleIDs[marble.id] = marble;
            });
            this.submission.moves.forEach((move) => {
                if (this.truth.marbleIDs[move.marble_id] === undefined) {
                    this.setStatus(ValidationStatus.InvalidMarbles, { missingMarbleID: move.marble_id });
                }
            });
            return this.status.valid;
        }
        return false;
    }

    async retrieveGameTruth() {
        this.truth.cards = await dbQuery.getHand(this.truth.game_id, this.truth.player_index);
        this.truth.marbles = await dbQuery.getMarbles(this.truth.game_id);
        console.log("Validation: retrieved hand and marbles");
    }
    async validate() {
        console.log('validate reached')
        let validAccess = await this.validateAccess();
        let validData = await this.validateData();
        if (validAccess && validData)
        {
            console.log("Valid data and Access");
            this.board = makeBoard(4, this.truth.player_index, this.truth.marbles);
            if (this.submission.moves.length == 0){
                let wasteValidator = validateWaste(this.board, this.truth.cards);
                if (wasteValidator.canWaste) { return true; }
                else { return this.setStatus(ValidationStatus.CannotWasteWhenValidExists, { possibleCardIDs: wasteValidator.possibilities }); }
            } 
            switch (this.truth.card_used.value) {
                case 0: return this.validateMoves() && (this.validatePropel(15) || this.validateStart()); 
                case 1: return this.validateMoves() && (this.validatePropel(1) || this.validateStart());
                case 4: return this.validateMoves() && (this.validatePropel(-4)); 
                case 7: return this.validateIncrementalMoves() && this.validatePropelIncremental(); 
                case 11: return this.validateMoves() && (this.validatePropel(11) || this.validateSwitch());
                case 13: return this.validateMoves() && (this.validatePropel(13) || this.validateStart()); 
                default: return this.validateMoves() && (this.validatePropel(this.truth.card_used.value));
            }
        }
        console.log("Something went wrong.");
    }
    validatePropel(distance){
        // check mvoementType
        console.log("Hit Validate Propel");
        let propelMove = this.submission.moves[0];
        if (propelMove.movement_type !== MoveType.Propel){
            return false;
        }
        let folio = { 
            blocking: null, 
            expectTock: false,
            fromSpot: this.board.getSpotFromID(propelMove.from_spot_id)
        };
        folio.endSpot = this.board.traverse(folio.fromSpot, distance, (spot)=>{
            console.log("Traversing at "+spot.toString());
            if (spot.isBlocking(this.truth.player_index)){
                if (spot.spotID == propelMove.to_spot_id) {
                    folio.expectTock = true;
                } else {
                    let blockingMarble = this.board.getMarbleOnSpot(spot);
                    if (blockingMarble && blockingMarble.id !== propelMove.marble_id){ folio.blocking = spot;}
                }
            }
        });
        if (folio.endSpot.area == 1) {
            let potential = [];
            potential[propelMove.marble_id] = propelMove.to_spot_id;
            this.truth.gameOver = this.board.checkWin(potential);
        }
        // Propel blocked
        if (folio.blocking !== null) {
            let data = { spot_id: folio.blocking.spotID, marble: this.board.getMarbleOnSpot(folio.blocking).id };
            return this.setStatus(ValidationStatus.PropelBlocked, data);
        }
        // Propel inaccurate
        if (folio.endSpot.spotID !== propelMove.to_spot_id){
            let data = { actual: folio.endSpot.spotID, provided: propelMove.to_spot_id};
            return this.setStatus(ValidationStatus.IncorrectPropelEnd, data);
        }
        if (folio.expectTock == (this.submission.moves.length == 2)){
            if (folio.expectTock){
                return this.validateTock(folio.endSpot, this.submission.moves[1]);
            }
            return true;
        } else {
            let data = { tockExpected: folio.expectTock, tockMove: this.submission.moves[1] };
            return this.setStatus(ValidationStatus.IncorrectTockMove, data);
        }
    }
    validateTock(tockSpot, tockMove){
        console.log("hit validate tock");
        let tockMarble = this.board.getMarbleOnSpot(tockSpot);
        if (tockMarble.player_index == this.board.player){
            return this.setStatus(validationStatus.IncorrectTockMarble, { given: tockMove.marble_id, player_index: this.board.player});
        }
        let tockLocation = this.board.getSpotFromID(tockMove.to_spot_id);
        if (tockLocation.player !== tockMarble.player_index || tockLocation.area !== 0){
            return this.setStatus(ValidationStatus.IncorrectTockLocation, { givenMove: tockMove});
        }
        return true;
    }
    validateMoves(){
        console.log("Hit ValidateMoves");
        // check 2 moves or less
        if (this.submission.moves.length > 2){
            return this.setStatus(ValidationStatus.ExtraMoves, {moves: this.submission.moves});
        }
        // check each marble of marbleid is at from spot
        this.submission.moves.forEach((move)=>{
            let marbleFound = false;
            this.truth.marbles.forEach((marble)=>{
                if (marble.id === move.marble_id){
                    marbleFound = true;
                    if (marble.current_spot !== move.from_spot_id){
                        return this.setStatus(ValidationStatus.InvalidMarbleLocation, {actual: marble.current_spot, given: move.from_spot_id});
                    }
                }
            });
            if (!marbleFound){
                return this.setStatus(ValidationStatus.InvalidMoveMarble, {given: move.marble_id});
            }
            this.truth.moves.push(move);
        });
        return true;
    }
    validateIncrementalMoves(){
        // check at least 7 moves
        if (this.submission.moves.length < 7){
            return this.setStatus(ValidationStatus.NotEnoughMoves, { number: this.submission.moves.length, expected: "At least 7"});
        }
        // separate propel from tock
        this.inc = {
            start_spot_id: [],
            end_spot_id: [],
            marbles: [],
            marble_ids: [],
            flow: this.board.getFlowValues(),
            tocks: {
                marbles: []
            },
            moves: { tocks: [], propels: [] }
        };
        let surviveParse = true;
        this.submission.moves.forEach((move)=>{
            if (move.movement_type !== MoveType.Propel && move.movement_type !== MoveType.Tock){
                surviveParse = false;
                return this.setStatus(ValidationStatus.InvalidMovementType, {move: move});
            } else if (move.movement_type == MoveType.Propel){
                if (this.inc.marbles[move.marble_id] === undefined){
                    this.inc.marble_ids.push(move.marble_id);
                    this.inc.marbles[move.marble_id] = this.board.getMarbleByID(move.marble_id);
                    if (this.inc.marbles[move.marble_id] === null){
                        surviveParse = false;
                        return this.setStatus(ValidationStatus.InvalidMoveMarble, { marble_id: move.marble_id});
                    }
                    let flowVals = this.convertMoveToFlow(move);
                    this.inc.start_spot_id[move.marble_id] = flowVals.start;
                    this.inc.end_spot_id[move.marble_id] = flowVals.end;
                } else {
                    let flowVals = this.convertMoveToFlow(move);
                    this.inc.start_spot_id[move.marble_id] = Math.min(this.inc.start_spot_id[move.marble_id], flowVals.start);
                    this.inc.end_spot_id[move.marble_id] = Math.max(this.inc.end_spot_id[move.marble_id], flowVals.end);
                }
            } else {
                if (this.validateTock(this.board.getSpotFromID(move.from_spot_id), move)){
                    this.inc.tocks.marbles.push(this.board.getMarbleByID(move.marble_id));
                    this.inc.moves.tocks.push(move);
                } else {
                    surviveParse = false;
                    return false;
                }
            }

        });
        let potential=[];
        this.inc.marble_ids.forEach((marble_id)=>{
            let moveData = {
                marble_id: marble_id,
                movement_type: MoveType.Propel
            };
            moveData.from_spot_id = this.inc.flow.from[this.inc.start_spot_id[marble_id]];
            moveData.to_spot_id = this.inc.flow.from[this.inc.end_spot_id[marble_id]];
            potential[marble_id] = moveData.to_spot_id;
            this.inc.moves.propels.push(moveData);
        });
        this.truth.moves = this.inc.moves.propels.concat(this.inc.moves.tocks);
        this.truth.gameOver = this.board.checkWin(potential);

        return surviveParse;
    }
    convertMoveToFlow(move){
        return { 
            start: this.inc.flow.to[move.from_spot_id], 
            end: this.inc.flow.to[move.to_spot_id]
        };
    }

    validateStart(){
        // check marble is correct (owned by player, in start)
        // check to is portal
        //check tock
        let startMove = this.submission.moves[0];
        // Movement type was inaccurate.
        if (startMove.movement_type !== MoveType.Start) {
            let data = { givenType: startMove.movement_type };
            return this.setStatus(ValidationStatus.InvalidMovementType, data);
        }
        let fromSpot = this.board.getSpotFromID(startMove.from_spot_id);
        let toSpot = this.board.getSpotFromID(startMove.to_spot_id);
        // Invalid Marble Moved, wrong from spot 
        if (fromSpot.player !== this.truth.player_index){
            return this.setStatus(ValidationStatus.InvalidMarbleMoved, { fromSpot: fromSpot });
        }
        let expectedToID = (this.truth.player_index * 18) + 33;
        console.log(startMove);
        console.log(fromSpot);
        console.log(toSpot);
        console.log(expectedToID);
        if (toSpot.spotID !== expectedToID) {
            return this.setStatus(ValidationStatus.IncorrectStartEnd, { expected: expectedToID, given: toSpot.id});
        }
        return true;
    }
    validatePropelIncremental(){
        // check that relations between marbles match before and after
        let count = 0;
        let previousMarbleID = null;
        let valid = true;
        this.inc.marble_ids.forEach((marble_id, marbleIndex)=>{
            if (previousMarbleID){
                let startRelation = this.inc.start_spot_id[marble_id] < this.inc.start_spot_id[previousMarbleID];
                let endRelation = this.inc.end_spot_id[marble_id] < this.inc.end_spot_id[previousMarbleID];
                if (startRelation !== endRelation){
                    valid = false;
                    return this.setStatus(ValidationStatus.InvalidMarbleLocation, { marble_id: marble_id, startRelation: startRelation, endRelation: endRelation});
                }
            }
            count += this.inc.end_spot_id[marble_id] - this.inc.start_spot_id[marble_id];
            previousMarbleID = marble_id;
        });
        if (!valid){ return false; }
        if (count !== 7){
            return this.setStatus(ValidationStatus.InvalidMoveAmount, { givenAmount: count});
        }

        // check that tocked marbles existed between start and end of one of the moved marbles
        this.inc.tocks.marbles.forEach((marble)=>{
            let flow = this.inc.flow.to[marble.current_spot];
            let validTock = false;
            this.inc.marble_ids.forEach((marble_id)=>{
                if (this.inc.start_spot_id[marble_id] < flow && this.inc.end_spot_id[marble_id] >= flow){
                    validTock = true;
                }
            });
            if (!validTock){
                valid = false;
                return this.setStatus(ValidationStatus.IncorrectTockLocation, { marble: marble });
            }
        });
        return valid;
    }
    validateSwitch(){
        let mainMove = this.submission.moves[0];
        let subMove = this.submission.moves[1];
        if (mainMove.movement_type !== MoveType.Switch) {
            return this.setStatus(ValidationStatus.InvalidMovementType, { maintype: mainMove.movement_type });
        }
        if (subMove.movement_type !== MoveType.Switch) {
            return this.setStatus(ValidationStatus.InvalidMovementType, { subtype: subMove.movement_type });
        }
        let spots = {
            mainFrom: mainMove.from_spot_id,
            mainTo: mainMove.to_spot_id,
            subFrom: subMove.from_spot_id,
            subTo: subMove.to_spot_id
        };
        if (spots.mainFrom == spots.subTo && spots.mainTo == spots.subFrom){
            let mainMarble = this.board.getMarbleByID(mainMove.marble_id);
            let mainSpot = this.board.getSpotFromID(mainMove.from_spot_id);
            let subMarble = this.board.getMarbleByID(subMove.marble_id);
            let subSpot = this.board.getSpotFromID(subMove.from_spot_id);
            if (mainMarble.player_index == subMarble.player_index) {
                return this.setStatus(ValidationStatus.InvalidSwitch, { mainPlayer: mainMarble.player_index, subPlayer: subMarble.player_index});
            }
            if (mainSpot.area != 2) {
                return this.setStatus(ValidationStatus.InvalidSwitch, { mainArea: mainSpot.area});
            }
            if (subSpot.area != 2) {
                return this.setStatus(ValidationStatus.InvalidSwitch, { subArea: subSpot.area});
            }
            return true;

        } else {
            return this.setStatus(ValidationStatus.InvalidSwitch, {spots: spots });
        }
    }
    getMoves(){
        if (this.inc){
            return this.inc.moves;
        }
        return this.submission.moves;
    }
}

const makeValidator = (data, user_id)=>{
    let validator = new Validator();
    validator.loadData(data, user_id);
    return validator;
};

module.exports = { makeValidator };