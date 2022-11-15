const moment = require('moment');

function formatMessage(avatar, username, text) {
  return {
    avatar,
    username,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
