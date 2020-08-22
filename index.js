require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const telegramConversation = require('./lib/conversation');
const { answer: menuAnswer, conversations: menuConversations, inlineKeyboardInput: menuInlineKeyboardInput } = require('./menu');
const { answer: purchaseAnswer, conversations: purchaseConversations, inlineKeyboardInput: purchaseInlineKeyboardInput } = require('./purchaseList');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const { error } = telegramConversation.registerBot(bot);
if (error) throw new Error(`Not possible to attach Telegram Bot.\n${error}`);

telegramConversation.registerCommand({
  command: /\/cardapios/,
  answer: menuAnswer,
  options: {
    reply_markup: {
      inline_keyboard: menuInlineKeyboardInput
    }
  },
  conversations: menuConversations
});

telegramConversation.registerCommand({
  command: /\/compras/,
  answer: purchaseAnswer,
  options: {
    reply_markup: {
      inline_keyboard: purchaseInlineKeyboardInput
    }
  },
  conversations: purchaseConversations
});

bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})