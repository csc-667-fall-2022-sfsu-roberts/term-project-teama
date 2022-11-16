'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {

        let cards = [];
        const suites = ["Spade", "Heart", "Diamond", "Club"];
        const names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];

        for (let suiteIndex = 0; suiteIndex < 4; suiteIndex++) {
            for (let valueIndex = 1; valueIndex < 14; valueIndex++) {
                let card = {
                    suite: suites[suiteIndex],
                    value: valueIndex,
                    name: names[valueIndex-1] + " of " + suites[suiteIndex] + "s"
                };
                cards.push(card);
            }
        }
        let blackJoker = { suite: "Black", value: 0, name: "Black Joker" };
        cards.push(blackJoker);
        let redJoker = { suite: "Red", value: 0, name: "Red Joker" };
        cards.push(redJoker);
        return queryInterface.bulkInsert('card', cards);
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('card', null, {});
    }
};
