require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

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

async function insertNewDish({ dishInfo, callbackQueryId }) {
  menuData.push(dishInfo);
  await bot.answerCallbackQuery(callbackQueryId, { callback_query_id: callbackQueryId, text: 'Prato adicionado com sucesso!' });

}

async function handleRandomSelect({ id: chatId, callbackQueryId }) {

  console.log('\n\nSeleção aleatória\n\n');
  const randomIndex = Math.floor(Math.random() * menuData.length);
  const chosenDish = menuData[randomIndex];

  await bot.sendMessage(chatId, chosenDish, { disable_notification: true });
  await bot.answerCallbackQuery(callbackQueryId, { callback_query_id: callbackQueryId, text: 'Bon appétit!' });
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
    console.log(`Removendo index ${indexToEdit}`);
    feedbackMsg = 'Prato removido com sucesso!';
  }

  await bot.answerCallbackQuery(callbackQueryId, { callback_query_id: callbackQueryId, text: feedbackMsg });

}

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

/*  Attach listener to the commands available */
// CARDAPIOS
bot.onText(/\/cardapios/, handleCardapios);
// 
bot.onText(/\/start/, handleStart);
bot.onText(/\/ola/, handleStart);


/* General function that catches all msgs.
This will be used to handle replies to bot's messages */
bot.on('text', async query => {

  if (!query.reply_to_message) return;
  if (query.reply_to_message.from.username !== 'AmandaLucasCarminattiLemosBot') return;
  const messageId = query.reply_to_message.message_id;

  /* Check this msg is waiting for a reply */
  if (!pendingMessagesToBeTreated[messageId]) return;

  const dishInfo = query.text;

  /* Call function to handle the pending message */
  const { fn: callbackFn, callbackQueryId } = pendingMessagesToBeTreated[messageId];
  callbackFn({ dishInfo, callbackQueryId });

  /* Remove the msg that has already been processed */
  delete pendingMessagesToBeTreated[messageId];

  console.log(`Message ${messageId} has been processed and deleted`);

});


(async () => {
  main();
})();

async function main() {
  const commands = await bot.getMyCommands();
  console.log('Comandos disponíveis:');
  console.log(commands);
}



async function handleStart(msg) {
  await bot.sendMessage(msg.chat.id, `Hello ${msg.from.first_name}`, { disable_notification: true })
}

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



// General listener for callback_queries
bot.on('callback_query', async query => {
  if (!query.data) return;

  console.log(`Callback query recebida`);
  console.log(query);

  const callbackQueryId = query.id;

  const ids = {
    chatId: query.message.chat.id,
    messageId: query.message.message_id
  };

  const chosenMenuOptionHandler = menuOptionsHandlers[query.data];
  const actionFunctionHandle = chosenMenuOptionHandler.fn;
  console.log('Passou no filtro!!');


  await actionFunctionHandle({ id: ids[chosenMenuOptionHandler.id], callbackQueryId });

})


function insertOrderNumber({ menu }) {
  const output = menu.map((dish, index) => `${index + 1} - ${dish}`);

  return output;
}

bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})