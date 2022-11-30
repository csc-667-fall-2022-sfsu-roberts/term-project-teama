/** API: /game/move
 *  req = {user_id, game_id, player_index, hand, card_used(card_id), moves(marble_id, from_spot_id, to_spot_id)}
 */
router.post("move", function (req, res, next) {
    console.log("Move reached in game_move.js");
    let validator = new Validator(req.body);
    let rs = validator.validate();
    // if rs is -1,  error, cannot move
    // rs = 0, move successful
    // rs == others, card seven restDis curPlayer can move
})

class Validator {
    constructor(data) {
        this.user_id = data.user_id;
        this.game_id = data.game_id;
        this.player_index = data.player_index;
        this.card_used = data.card_used;
        this.moves = data.moves;
    }

    async validate() {
        /** card_id find card value => check if it has special func */
        let card_id = this.card_used.card_id;
        let from_spot_id = this.moves.from_spot_id;
        let to_spot_id = this.moves.to_spot_id;
        let marble_id = this.moves.marble_id;
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

    async startEvent(to_spot_id, marble_id) {
        /** move marble_id to to_spot_id if there is empty */
        let rs = await dbQuery.marblePlayerId(this.game_id, to_spot_id);
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
        if ((this.player_index + 1) * 1 <= spot_id <= (this.player_index + 1) * 4) {
            return true;
        }
        return false;
    }

    // return to_spot_id marble id
    async switchMarbleId(spot_id) {
        // 1st: check if this is at the board and not start spot
        if (spot_id > 32 && spot_id != 33 && spot_id != 51 && spot_id != 69 && spot_id != 87) {
            // marbles table find marble with spot_id
            let rs = await dbQuery.marblePlayerId(this.game_id, spot_id);
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
            let rs = dbQuery.marblePlayerId(this.game_id, this.spot_id);
            if (to_spot_id > 32) {
                let dis = to_spot_id - from_spot_id;
                if (dis === card_value) {
                    if (rs) {
                        if (rs.player_id != this.user_id) {
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
                            let game_player = await dbQuery.findGamePlayer(this.game_id, toSpotMarble.player_id);
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
        if ((this.player_index + 1) * 1 + 16 <= spot_id <= (this.player_index + 1) * 4 + 16) {
            return true;
        }
        return false;
    }

    base() {
        switch (this.player_index) {
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