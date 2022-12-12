'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

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
    queryInterface.bulkInsert('spots', allSpaces);

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
    return queryInterface.bulkInsert('cards', cards);
  },

  async down (queryInterface, Sequelize) {
      queryInterface.bulkDelete('spots');
      return queryInterface.bulkDelete('cards');
  }
};
