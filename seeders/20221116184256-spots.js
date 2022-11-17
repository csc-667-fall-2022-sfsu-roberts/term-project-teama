'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        let homeSpaces = [];
        let startSpaces = [];
        let boardSpaces = [];

        for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
            for (let spotIndex = 0; spotIndex < 18; spotIndex++) {
                if (spotIndex < 4) {
                    let startSpace = { player_index: playerIndex, area: 0, index: spotIndex };
                    let homeSpace = { player_index: playerIndex, area: 1, index: spotIndex };
                    startSpaces.push(startSpace);
                    homeSpaces.push(homeSpace);
                }
                let boardSpace = { player_index: playerIndex, area: 2, index: spotIndex };
                boardSpaces.push(boardSpace);
            }
        }
        const allSpaces = startSpaces.concat(homeSpaces).concat(boardSpaces);
        return queryInterface.bulkInsert('spots', allSpaces);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('spots', null, {});
    }
};
