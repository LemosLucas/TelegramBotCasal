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

function insertNewDish({ text: dishInfo }) {
  menuData.push(dishInfo);
  return 'Prato adicionado com sucesso!';
}

function handleRandomSelect() {
  const randomIndex = Math.floor(Math.random() * menuData.length);
  const chosenDish = menuData[randomIndex];
  return chosenDish;
}

function editExistingDish({ text: dishInfo }) {
  const [dishNumber, dishName] = dishInfo.split('-');

  let feedbackMsg = validateNumberInput({ inputText: dishNumber });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishNumber) - 1;
    menuData[indexToEdit] = dishName;
    feedbackMsg = 'Prato editado com sucesso!';
  }
  return feedbackMsg;
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

function removeExistingDish({ text: dishInfo, callbackQueryId }) {
  let feedbackMsg = validateNumberInput({ inputText: dishInfo });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishInfo) - 1;
    menuData.splice(indexToEdit, 1);
    feedbackMsg = 'Prato removido com sucesso!';
  }
  return feedbackMsg;
}

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.AMANDA_LUCAS_BOT_API_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const { error } = telegramConversation.registerBot(bot);
if (error) throw new Error(`Not possible to attach Telegram Bot.\n${error}`);

const conversations = [
  [
    {
      callbackQuery: 'Bon appétit',
      sendMessageCallback: handleRandomSelect,
    }
  ],
  [
    {
      sendMessageCallback: 'Digite o nome do prato que deseja cadastrar:',
      options: {
        reply_markup: {
          force_reply: true
        }
      }
    },
    {
      sendMessageCallback: insertNewDish
    },
  ],
  [
    {
      sendMessageCallback: 'Para editar um prato, utilize o formato: NUMERO_PRATO - NOME NOVO PRATO',
      options: {
        reply_markup: {
          force_reply: true
        }
      }
    },
    {
      sendMessageCallback: editExistingDish
    }
  ],
  [
    {
      sendMessageCallback: 'Digite o número do prato que deseja remover:',
      options: {
        reply_markup: {
          force_reply: true
        }
      }
    },
    {
      sendMessageCallback: removeExistingDish
    }
  ]
];


function provideMenu() {
  const answerCardapios = JSON.stringify(insertOrderNumber({ menu: menuData }), null, 2)
    .replace(/(\[|\]|\")/g, '')
    .replace(/\n\s/, '')
    .replace(/^\s/gm, '');
  return answerCardapios;
}

telegramConversation.registerCommand({
  command: /\/cardapios/,
  answer: provideMenu,
  options: {
    reply_markup: {
      inline_keyboard: optionsForMenuSelection
    }
  },
  conversations: conversations
});

function insertOrderNumber({ menu }) {
  const output = menu.map((dish, index) => `${index + 1} - ${dish}`);
  return output;
}

bot.on('polling_error', error => {
  console.log(`Polling error: ${error}`);
})