require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const telegramConversation = require('./lib/conversation');
const { answer, conversations, inlineKeyboardInput } = require('./menu');
const { showPurchaseList, removeConversations, addConversations, options: optionsPurchaseList } = require('./purchaseList');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const { error } = telegramConversation.registerBot(bot);
if (error) throw new Error(`Not possible to attach Telegram Bot.\n${error}`);

telegramConversation.registerCommand({
  command: /\/cardapios/,
  answer: answer,
  options: {
    reply_markup: {
      inline_keyboard: inlineKeyboardInput
    }
  },
  conversations: conversations
});

telegramConversation.registerCommand({
  command: /\/listarcompras/,
  answer: showPurchaseList
})

telegramConversation.registerCommand({
  command: /\/removercompra/,
  answer: 'Digite o número do item que deseja remover',
  conversations: removeConversations,
  options: optionsPurchaseList
})

telegramConversation.registerCommand({
  command: /\/addcompra/,
  answer: 'Digite o nome do item que deseja adicionar',
  conversations: addConversations,
  options: optionsPurchaseList
})

bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})