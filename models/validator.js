const { DatabaseError } = require("sequelize");
const dbQuery = require("../db/dbquery");
const wasteValidator = require("./boardLogic");

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

class Validator {
    constructor() {
        this.user_id = -1;
        this.game_id = -1;
        this.player_index = -1;
        this.card_used = -1;
        this.moves = null;
        this.isValid = false;
    }

    loadData(data, user_id) {
        this.valid = false;
        this.submission = {
            user_id: data.user_id,
            game_id: data.game_id,
            player_index: data.player_index,
            game_player_id: data.game_player_id,
            card_used: {
                game_cards_id: data.game_card_id,
                cards_id: data.card_id
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
                movementType: moveData.type
            });
        });
        this.truth = {user_id: user_id};
    }

    test() { console.log("validator reached."); }

    async validateAccess() {
        if (this.truth.user_id === this.submission.user_id) {
            console.log("Validation: valid user_id");
            this.truth.game = await dbQuery.findGamesByGameId(this.submission.game_id);
            if (this.truth.game) {
                this.truth.game_id = this.submission.game_id;
                console.log("Validation: valid game_id");
                this.truth.game_player = await dbQuery.findGamePlayer(this.truth.game_id, this.truth.user_id);
                if (this.truth.game_player) {
                    this.truth.player_index = this.truth.game_player.player_index;
                    if (this.truth.player_index === this.truth.game.turn) {
                        console.log("Validation: valid player_index");
                        this.retrieveGameTruth();
                        let handIsValid = true;
                        this.submission.hand.forEach((card) => {
                            let isValidCard = false;
                            this.truth.cards.forEach((actualCard) => {
                                if (card.game_cards_id === actualCard.id) {
                                    isValidCard = true;
                                }
                            });
                            handIsValid = handIsValid && isValidCard;
                        });
                        let currentCardIsValid = false;
                        this.truth.cards.forEach((card) => {
                            if (card.id === this.submission.card_used.game_cards_id) {
                                this.truth.card_used = card;
                                currentCardIsValid = true;
                            }
                        });
                        handIsValid = handIsValid && currentCardIsValid;
                        if (handIsValid) {
                            console.log("Validation: valid cards");
                            let marbleIDs = [];
                            this.truth.marbles.forEach((marble) => {
                                marbleIDs[marble.id] = true;
                            });
                            let movedMarblesAreValid = true;
                            this.submission.moves.forEach((move) => {
                                if (marbleIDs[move.marble_id] !== true) {
                                    movedMarblesAreValid = false;
                                }
                            });
                            if (movedMarblesAreValid) {
                                console.log("Validation: valid marbles");
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    async retrieveGameTruth() {
        this.truth.cards = await dbQuery.getHand(this.truth.game_id, this.truth.player_index);
        this.truth.marbles = await dbQuery.getMarbles(this.truth.game_id);
        console.log("Validation: retrieved hand and marbles");
    }

    /** response = {
     * status(0: success, 1: fail),
     * current_player_index,
     * seven_rest_dis (only for card 7),
     * new_card_id (only for joker)
     * } */
    validate() {
        console.log('validate reached')
        if (this.validateAccess())
         {
            console.log('validate access succeed.')
            let response = {
                current_player_index: this.submission.player_index,
            }

            let card_id = this.submission.card_used.cards_id;
            let moves = this.submission.moves;
            if (card_id > 52) {
                this.joker(response);
            } else {
                let card_value = card_id % 13;
                if (card_value === 0) {
                    card_value += 13;
                }
                console.log('card value', card_value);
                if (card_value === 13 || card_value === 1) {
                    if (moves[0].movementType === 0) {
                        this.startEvent(moves, card_value, response);
                    } else if (moves[0].movementType === 1) {
                        this.moveForward(moves, card_value, response);
                    } else {
                        return -1;
                    }
                } else if (card_value === 4) {
                    if (moves[0].movementType === 1) {
                        this.moveBackward(moves, card_value, response);
                    }
                    return -1;
                }
                else if (card_value === 7) {
                    // card = 7, can seperate move
                    if (moves[0].movementType === 1) {
                        this.sevenEvent(moves, response);
                    }
                    return -1;
                } else if (card_value == 11) {
                    // card = J, switch cards with others marble on board
                    this.switchMarbles(this.submission.moves, response);
                } else {
                    if (moves[0].movementType === 1) {
                        this.moveForward(moves, card_value, response);
                    }
                    return -1;
                }
            }
        }
    }

    joker(response) {
        console.log('joker event reached.')
        let card_value = 15;
        /** 1. same as start, but card value== 15 */
        if (moves[0].movementType === 0) {
            this.startEvent(this.submission.moves, card_value, response);
        } else if (moves[0].movementType === 1) {
            this.moveForward(this.submission.moves, card_value, response);
        }
    }

    startEvent(moves, card_value, response) {
        console.log('start event reached.')

        /** 1. length=1, [0]start
         *  2. length=2, [0]start+ [1]tock
         */
        if (moves.length === 1) {
            if (moves[0].movementType === 0) {
                return this.startEventDB(moves, card_value, response);
            }
        }
        if (moves.length === 2) {
            if (moves[0].movementType === 0 && moves[1].movementType === 2) {
                return this.startEventDB(moves, card_value, response);
            }
        }
        return this.errorResponse(response);
    }

    startEventDB(moves, card_value, response) {
        this.updateMarbles(moves);
        this.discardGameCards();
        if (card_value === 15) {
            /** 0. give user one more card
             *  1. curPlayer still this player
             */
            let card_id = this.drawACard();
            response.new_card_id = card_id;
            response.status = 0;
        } else {
            let next_player_index = this.updateCurPlayerIndex();
            response.current_player_index = next_player_index;
            // update current player to next player
        }
        return response;
    }

    moveForward(moves, card_value, response) {
        console.log('move forward event reached.')

        /** 1. [0] propel \/
         *  2.  dis == card_value
         *  3. length == 1, move
         *  4. length == 2, [1] tock => move
         */
        if (moves[0].to_spot_id > 16) {
            if (moves[0].to_spot_id > 32) {
                let validSpotID = this.spotOfValidDis(moves[0].from_spot_id, card_value, 0);
                if (moves[0].to_spot_id === validSpotID) {
                    if (moves.length === 1) {
                        return this.normalEventDB(moves, response);
                    }
                    if (moves.length === 2 && moves[1].movementType === 2) {
                        return this.normalEventDB(moves, response);
                    }
                }
            } else {
                // to_spot_id is home area, valid dis
                if (moves.length === 1) {
                    if (this.isHomeArea(moves[0].to_spot_id)) {
                        if (this.validHomeBoardDis(moves[0].from_spot_id, moves[0].to_spot_id, card_value)) {
                            return this.normalEventDB(moves, response);
                        }
                    }
                }
            }
        }
        return this.errorResponse(response);
    }

    normalEventDB(moves, response) {
        this.updateMarbles(moves);
        this.discardGameCards();
        let next_player_index = this.updateCurPlayerIndex();
        response.current_player_index = next_player_index;
        response.status = 0;
        return response;
    }

    moveBackward(moves, card_value, response) {
        console.log('move backward event reached.')

        /** 0. propel => on board
         *  1. valid distance => length=1, move; length==2, [1]tock move
         */
        let validSpotID = this.spotOfValidDis(moves[0].from_spot_id, card_value, 0);
        if (moves[0].to_spot_id === validSpotID) {
            if (moves.length === 1) {
                return this.normalEventDB(moves, response);
            }
            if (moves.length === 2) {
                if (moves[1].movementType === 2) {
                    return this.normalEventDB(moves, response);
                }
            }
        }
        return this.errorResponse(response);
    }

    sevenEvent(moves, response) {
        console.log('seven event reached.')

        let dis = -1;
        if (moves[0].from_spot_id > 32) {
            if (moves[0].to_spot_id > 32) {
                // to_spot_id is on board
                dis = moves[0].to_spot_id - moves[0].from_spot_id;
            }
            if (moves[0].to_spot_id > 16) {
                // to_spot_id is home-area
                dis = this.homeBoardDis(moves[0].from_spot_id, moves[0].to_spot_id);
            }
        }
        if (0 < dis < 7) {
            restDis = 7 - dis;
            if (this.validSevenMove(moves)) {
                // curPlayer not change, card not discard, card_value === restDis
                this.updateMarbles(moves);
                response.status = 0;
                response.seven_rest_dis = restDis;
                return response;
            } else {
                return this.errorResponse(response);
            }
        }
        if (dis === 7) {
            if (this.validSevenMove(moves)) {
                return this.normalEventDB(moves, response);
            } else {
                return this.errorResponse(response);
            }
        }
    }

    switchMarbles(moves) {
        console.log('switch event reached.')

        /** moves length ==2, all switch type */
        if (moves.length === 2 && moves[0].movementType === 3 && moves[0].movementType === 3) {
            this.normalEventDB(moves, response);
        }
        return this.errorResponse(response);
    }

    errorResponse(response){
        response.status = -1;
        return response;
    }

    updateMarbles() {
        for (let i = 0; i < moves.length; i++) {
            dbQuery.updateMarbles(moves[i].marble_id, moves[i].to_spot_id);
        }
    }

    discardGameCards() {
        dbQuery.discardGameCards(this.submission.card_used.game_cards_id);
    }

    updateCurPlayerIndex() {
        // find next player, update db games.turn to next player_id
        // return playerIndex****
        /** curplayer index + 1 next player index, if > 3 nextIndex == result - 3 */
        let nextPlayerIndex = this.submission.player_index + 1;
        if (nextPlayerIndex > 3) {
            nextPlayerIndex = nextPlayerIndex - 4;
        }
        dbQuery.updateGameTurn(this.submission.game_id, nextPlayerIndex);
        return nextPlayerIndex;
    }

    async drawACard() {
        let card = await dbQuery.getANewCard(this, this.submission.game_id, this.submission.player_index);
        console.log('joker, draw new card-id', card.card_id);
        return card.card_id;
    }

    spotOfValidDis(spot_id, card_value, type) {
        let validSpot;
        if (type === 0) {
            // forward, to - from + 1 = card
            validSpot = spot_id + card_value - 1;
        }
        if (type === 1) {
            // back, from - to + 1 = card
            validSpot = spot_id - card_value + 1;
        }

        if (validSpot < 33) {
            validSpot = validSpot - 33 + 104;
        }
        if (validSpot > 104) {
            validSpot = validSpot - 104 + 33;
        }
        return validSpot;
    }

    isHomeArea(spot_id) {
        let player_index = this.submission.player_index;
        if (player_index + 17 <= spot_id <= player_index + 20) {
            return true;
        }
        return false;
    }

    validHomeBoardDis(from_spot_id, to_spot_id, card_value) {
        let dis = this.homeBoardDis(from_spot_id, to_spot_id);
        if (dis === card_value) {
            return true;
        }
        return false;
        /*
        if (base * 18 + 33 <= from_spot_id <= base * 18 + 50) {   
        }
        */
    }

    homeBoardDis(from_spot_id, to_spot_id) {
        let base = base();
        let index = this.getHomeSpotIndex(to_spot_id);
        return (base * 18 + 50 - from_spot_id + 1) + (index + 1);
    }

    base() {
        switch (this.submission.player_index) {
            case 0:
                return 3
            case 1:
                return 0
            case 2:
                return 1
            case 3:
                return 2
        }
    }

    getHomeSpotIndex(spot_id) {
        let index = (spot_id - 16) % 4 - 1;
        if (index < 0) {
            index = 3;
        }
        return index;
    }

    validSevenMove(moves) {
        /** length == 1, move; others all tock => move */
        if (moves.length > 1) {
            for (let i = 1; i < moves.length; i++) {
                if (moves[i].movementType != 2) {
                    return false;
                }
            }
        }
        return true;
    }
}

const validator = new Validator();

module.exports = { validator };