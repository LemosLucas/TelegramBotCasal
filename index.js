require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const telegramConversation = require('./lib/conversation');

const pendingMessagesToBeTreated = {};

const menuData = [
  'Risoto de alho poró com tilápia e camarões',
  'Macarrão com vina',
  'Yakissoba',
  'Jardineira'
]

optionsForMenuSelection = [
  [{ text: 'Selecionar aleatório', callback_data: 'handleRandomSelect' }],
  [{ text: 'Adicionar novo', callback_data: 'handleAddNew' }],
  [{ text: 'Editar prato', callback_data: 'handleEditDish' }, { text: 'Remover prato', callback_data: 'handleRemoveDish' }]
];

const menuOptionsHandlers = {
  handleRandomSelect: {
    fn: handleRandomSelect,
    id: 'chatId'
  },
  handleAddNew: {
    fn: handleAddNew,
    id: 'chatId'
  },
  handleEditDish: {
    fn: handleEditDish,
    id: 'chatId'
  },
  handleRemoveDish: {
    fn: handleRemoveDish,
    id: 'chatId'
  }
}

async function insertNewDish({ text: dishInfo }) {
  menuData.push(dishInfo);
  return 'Prato adicionado com sucesso!';
}

function handleRandomSelect() {
  const randomIndex = Math.floor(Math.random() * menuData.length);
  const chosenDish = menuData[randomIndex];
  return chosenDish;
}

async function handleAddNew({ id: chatId, callbackQueryId }) {
  const text = 'Digite o nome do prato que deseja cadastrar:'
  const msg = await bot.sendMessage(chatId, text, {
    reply_markup: {
      force_reply: true
    },
    disable_notification: true
  });

  pendingMessagesToBeTreated[msg.message_id] = {
    fn: insertNewDish,
    callbackQueryId
  };
}


async function handleEditDish({ id: chatId, callbackQueryId }) {
  const text = 'Para editar um prato, utilize o formato: NUMERO_PRATO - NOME NOVO PRATO';

  const msg = await bot.sendMessage(chatId, text, {
    reply_markup: {
      force_reply: true
    },
    disable_notification: true
  });

  pendingMessagesToBeTreated[msg.message_id] = {
    fn: editExistingDish,
    callbackQueryId
  };
}

async function handleRemoveDish({ id: chatId, callbackQueryId }) {
  const text = 'Digite o número do prato que deseja remover:'

  const msg = await bot.sendMessage(chatId, text, {
    reply_markup: {
      force_reply: true
    },
    disable_notification: true
  });

  pendingMessagesToBeTreated[msg.message_id] = {
    fn: removeExistingDish,
    callbackQueryId
  };
}

async function editExistingDish({ dishInfo, callbackQueryId }) {
  const [dishNumber, dishName] = dishInfo.split('-');

  let feedbackMsg = validateNumberInput({ inputText: dishNumber });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishNumber) - 1;
    menuData[indexToEdit] = dishName;
    feedbackMsg = 'Prato editado com sucesso!';
  }
  await bot.answerCallbackQuery(callbackQueryId, { callback_query_id: callbackQueryId, text: feedbackMsg });
}

function validateNumberInput({ inputText }) {
  const minValidIndex = 0;
  const maxValidIndex = menuData.length - 1;
  const indexToEdit = parseInt(inputText) - 1;
  if (isNaN(indexToEdit)) {
    return 'Favor providenciar apenas um número';
  } else if (indexToEdit < minValidIndex || indexToEdit > maxValidIndex) {
    return `Favor providenciar um número entre ${minValidIndex + 1} e ${maxValidIndex + 1} (inclusos)`;
  }
  return undefined;
}

async function removeExistingDish({ dishInfo, callbackQueryId }) {
  let feedbackMsg = validateNumberInput({ inputText: dishInfo });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishInfo) - 1;
    menuData.splice(indexToEdit, 1);
    feedbackMsg = 'Prato removido com sucesso!';
  }
  await bot.answerCallbackQuery(callbackQueryId, { callback_query_id: callbackQueryId, text: feedbackMsg });
}

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const { error } = telegramConversation.registerBot(bot);
if (error) throw new Error(`Not possible to attach Telegram Bot.\n${error}`);

const answerCardapios = JSON.stringify(insertOrderNumber({ menu: menuData }), null, 2)
  .replace(/(\[|\]|\")/g, '')
  .replace(/\n\s/, '')
  .replace(/^\s/gm, '');

const handlesForCardapioDisplay = [
  { callbackQuery: 'Bon appétit', sendMessageCallback: handleRandomSelect },
  { callbackQuery: handleAddNew },
  { callbackQuery: handleEditDish },
  { callbackQuery: handleRemoveDish }
];

telegramConversation.registerCommand({
  command: /\/cardapios/,
  answer: answerCardapios,
  options: {
    reply_markup: {
      inline_keyboard: optionsForMenuSelection
    }
  },
  inlineKeyboardCallbacks: handlesForCardapioDisplay
})

/*  Attach listener to the commands available */
// CARDAPIOS
// bot.onText(/\/cardapios/, handleCardapios);


async function handleCardapios(msg) {
  const chatId = msg.chat.id;

  const responseStringified = JSON.stringify(insertOrderNumber({ menu: menuData }), null, 2)
    .replace(/(\[|\]|\")/g, '')
    .replace(/\n\s/, '')
    .replace(/^\s/gm, '');

  await bot.sendMessage(chatId, responseStringified, {
    reply_markup: {
      inline_keyboard: optionsForMenuSelection
    },
    disable_notification: true
  });

}


function insertOrderNumber({ menu }) {
  const output = menu.map((dish, index) => `${index + 1} - ${dish}`);
  return output;
}

bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})