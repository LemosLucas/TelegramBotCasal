require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = `${match[1]}`; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp)
    .then(result => console.log('resposta ao echo enviada c/ sucesso'))
    .catch(error => console.log(`Erro ao enviar resposta ao echo. ${error}`));
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {

  if (msg.entities[0].type === 'bot_command') return;

  const chatId = msg.chat.id;

  console.log(msg);

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message')
    .then(result => console.log('Msg genérica enviada c/ sucesso'))
    .catch(error => console.log(`Erro ao receber msg genérica. ${error}`));
});


// Listen for any kind of message. There are different kinds of
// messages.
/* bot.on('inline_query', (msg) => {
  const queryId = msg.id;

  console.log(msg);

  // bot.sendMessage(userID, msg.query);
  bot.answerInlineQuery(queryId, [])
    .then(result => console.log(`Resposta inline enviada com sucesso`))
    .catch(error => console.log(`Erro ao enviar resposta inline ${error}`));

}); */


bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})