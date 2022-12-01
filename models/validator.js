const { DatabaseError } = require("sequelize");
const dbQuery = require("../db/dbquery");
const wasteValidator = require("boardLogic");

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

    loadData(data, user_id){
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
        data.hand.forEach((cardData, index)=>{
            this.submission.hand.push({
                game_cards_id: cardData.id,
                hand_index: cardData.index
            });
        });
        data.moves.forEach((moveData, index)=>{
            this.submission.moves.push({
                marble_id: moveData.marble_id,
                from_spot_id: moveData.from_spot_id,
                to_spot_id: moveData.to_spot_id,
                movementType: moveData.type
            });
        });
        this.truth.user_id = user_id;
    }

    test() { console.log ("validator reached.");}

    async validateAccess(){
        if (this.truth.user_id === this.submission.user_id){
            console.log("Validation: valid user_id");
            this.truth.game = await dbQuery.findGamesByGameId(this.submission.game_id);
            if (this.truth.game){
                this.truth.game_id = this.submission.game_id;
                console.log("Validation: valid game_id");
                this.truth.game_player = await dbQuery.findGamePlayer(this.truth.game_id, this.truth.user_id);
                if (this.truth.game_player) {
                    this.truth.player_index = this.truth.game_player.player_index;
                    if (this.truth.player_index === this.truth.game.turn){
                        console.log("Validation: valid player_index");
                        this.retrieveGameTruth();
                        let handIsValid = true;
                        this.submission.hand.forEach((card)=>{
                            let isValidCard = false;
                            this.truth.cards.forEach((actualCard)=>{
                                if (card.game_cards_id === actualCard.id){
                                    isValidCard = true;
                                }
                            });
                            handIsValid = handIsValid && isValidCard;
                        });
                        let currentCardIsValid = false;
                        this.truth.cards.forEach((card)=>{
                            if (card.id === this.submission.card_used.game_cards_id){
                                this.truth.card_used = card;
                                currentCardIsValid = true;
                            }
                        });
                        handIsValid = handIsValid && currentCardIsValid;
                        if (handIsValid) {
                            console.log("Validation: valid cards");
                            let marbleIDs = [];
                            this.truth.marbles.forEach((marble)=>{
                                marbleIDs[marble.id] = true;
                            });
                            let movedMarblesAreValid = true;
                            this.submission.moves.forEach((move)=>{
                                if (marbleIDs[move.marble_id] !== true){
                                    movedMarblesAreValid = false;
                                }
                            });
                            if (movedMarblesAreValid){
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

    async retrieveGameTruth(){        
        this.truth.cards = await dbQuery.getHand(gameId, req.game.curPlayerIndex);
        this.truth.marbles = await dbQuery.getMarbles(gameId);
        console.log("Validation: retrieved hand and marbles");
    }

    async validate() {
        if (this.validateAccess()){
            /** card_id find card value => check if it has special func */
            let card_id = this.submission.card_used.card_id;
            let from_spot_id = this.submission.moves[0].from_spot_id;
            let to_spot_id = this.submission.moves[0].to_spot_id;
            let marble_id = this.submission.moves[0].marble_id;
            if (card_id > 52) {
                joker();
            } else {
                let card_value = card_id % 13;
                if (card_value === 0) {
                    card_value += 13;
                }
                if (card_value === 13 || card_value === 1) {
                    /** card = A/K
                     *  1. special fun: move to startSpot(to_spot_id==board_1st; from_spot_id==start_area)
                     *  2. normal func: move forward (from_spot_id == board_id) 
                     * */
                    if (this.isStartArea(from_spot_id)) {
                        this.startEvent(to_spot_id, marble_id);
                    } else {
                        this.moveForward(from_spot_id, to_spot_id, marble_id, card_value);
                    }
                } else if (card_value === 7) {
                    // card = 7, can seperate move
                    this.sevenEvent(from_spot_id, to_spot_id, marble_id);
                } else if (card_value == 11) {
                    // card = J, switch cards with others marble on board
                    this.switchMarbles(from_spot_id, to_spot_id, marble_id);
                } else {
                    this.moveForward(from_spot_id, to_spot_id, marble_id, card_value);
                }
            }
        }   
    }

    async startEvent(to_spot_id, marble_id) {
        /** move marble_id to to_spot_id if there is empty */
        let rs = await dbQuery.marblePlayerId(this.submission.game_id, to_spot_id);
        if (!rs) {
            dbQuery.updateMarbles(marble_id, to_spot_id);
            return 0;
        } else {
            // error, start spot was occupied by other marble
            return -1;
        }
    }

    async switchMarbles(from_spot_id, to_spot_id, marble_id) {
        let toSpotMarble = await this.switchMarbleId(to_spot_id);
        if (toSpotMarble && toSpotMarble.player_id != user_id) {
            let toSpotMarbleId = toSpotMarble.id;
            dbQuery.updateMarbles(marble_id, to_spot_id);
            dbQuery.updateMarbles(toSpotMarbleId, from_spot_id);
            return 0;
        } else {
            // error, cur_player own marble cannot switch
            return -1;
        }
    }

    isStartArea(spot_id) {
        if ((this.submission.player_index + 1) * 1 <= spot_id <= (this.submission.player_index + 1) * 4) {
            return true;
        }
        return false;
    }

    // return to_spot_id marble id
    async switchMarbleId(spot_id) {
        // 1st: check if this is at the board and not start spot
        if (spot_id > 32 && spot_id != 33 && spot_id != 51 && spot_id != 69 && spot_id != 87) {
            // marbles table find marble with spot_id
            let rs = await dbQuery.marblePlayerId(this.submission.game_id, spot_id);
            return rs;
        }
    }

    async sevenEvent(from_spot_id, to_spot_id, marble_id) {
        let dis;
        if (from_spot_id > 32) {
            if (to_spot_id > 16) {
                dis = this.homeBoardDis(from_spot_id, to_spot_id);
            } else if (to_spot_id > 32) {
                dis = to_spot_id - from_spot_id;
            } else {
                dis = -1;
            }
        }
        if (0 < dis <= 7) {
            // not discard card7, select another marble to move
            restDis = 7 - dis;
            dbQuery.updateMarbles(marble_id, to_spot_id);
            if (restDis > 0) {
                return restDis;
            } else {
                // discard this card, next player move
                return 0;
            }
        } else {
            // error, dis > valid
            return -1;
        }
    }

    async moveForward(from_spot_id, to_spot_id, marble_id, card_value) {
        /** to_spot_id occupied by others, move others marble back to start_area
         *  1. to_spot_id > 32: board_area, dis = to - from
         *  2. to_spot_id > 16: home_area
         */
        if (to_spot_id > 16) {
            let rs = dbQuery.marblePlayerId(this.submission.game_id, this.submission.spot_id);
            if (to_spot_id > 32) {
                let dis = to_spot_id - from_spot_id;
                if (dis === card_value) {
                    if (rs) {
                        if (rs.player_id != this.submission.user_id) {
                            // if to_spot being occupied by others marble, to_spot marble return to start_area
                            let toSpotMarble = {
                                marble_id: rs.id,
                                player_id: rs.player_id,
                                marble_index: rs.marble_index
                            }
                            /** to_spot_id occupied by other player
                             * 1st: get to_spot_id player_index, marble_index
                             * 2nd: move this marble back to home (home_spot_id = player_index * 4 + marble_index) 
                             * 3th: move curPlayer marble
                             * 4rd: from_end update
                             **/
                            let game_player = await dbQuery.findGamePlayer(this.submission.game_id, toSpotMarble.player_id);
                            let home_spot_id = (game_player.player_index + 1) * 4 + toSpotMarble.marble_index;
                            dbQuery.updateMarbles(toSpotMarble.marble_id, home_spot_id);
                            dbQuery.updateMarbles(marble_id, to_spot_id);
                            return 0;
                        } else {
                            // error, to_spot_id is curplayer's marble, cannot move
                            return -1;
                        }
                    } else {
                        // to_spot_id is empty, move and update marbles
                        dbQuery.updateMarbles(marble_id, to_spot_id);
                        return 0;
                    }
                } else {
                    // error, move dis not valid
                    return -1;
                }
            } else {
                /** 1st: is to_spot_id player_index home_area
                 *  2nd: is this spot occupied by others, is dis valid
                 *  3rd: move
                 */
                if (this.validEndPlace(to_spot_id)) {
                    if (!rs) {
                        if (this.validDistance(from_spot_id, to_spot_id, card_value)) {
                            dbQuery.updateMarbles(marble_id, to_spot_id);
                            return 0;
                        } else {
                            // card != dis
                            return -1;
                        }
                    } else {
                        // error, home spot is being occupied
                        return -1;
                    }
                } else {
                    // error: invalid end area
                    return -1;
                }
            }
        }
        return -1;
    }

    homeBoardDis(from_spot_id, to_spot_id) {
        let base = base();
        let index = this.getHomeSpotIndex(to_spot_id);
        return (base * 18 + 50 - from_spot_id + 1) + (index + 1);
    }

    validEndPlace(spot_id) {
        if ((this.submission.player_index + 1) * 1 + 16 <= spot_id <= (this.submission.player_index + 1) * 4 + 16) {
            return true;
        }
        return false;
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

    validDistance(from_spot_id, to_spot_id, card_value) {
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

    getHomeSpotIndex(spot_id) {
        let index = (spot_id - 16) % 4 - 1;
        if (index < 0) {
            index = 3;
        }
        return index;
    }

}

const validator = new Validator();

module.exports = {validator};