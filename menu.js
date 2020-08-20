const { stringifyArray, validateNumberInput } = require('./utils');

const menuData = [
  'Risoto de alho poró com tilápia e camarões',
  'Macarrão com vina',
  'Yakissoba',
  'Jardineira'
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

  let feedbackMsg = validateNumberInput({ inputText: dishNumber, array: menuData });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishNumber) - 1;
    menuData[indexToEdit] = dishName;
    feedbackMsg = 'Prato editado com sucesso!';
  }
  return feedbackMsg;
}

function removeExistingDish({ text: dishInfo, callbackQueryId }) {
  let feedbackMsg = validateNumberInput({ inputText: dishInfo, array: menuData });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishInfo) - 1;
    menuData.splice(indexToEdit, 1);
    feedbackMsg = 'Prato removido com sucesso!';
  }
  return feedbackMsg;
}

function provideMenu() {
  const shouldEnumerate = true;
  return stringifyArray(menuData, shouldEnumerate);
}

const optionsForMenuSelection = [
  [{ text: 'Selecionar aleatório', callback_data: 'handleRandomSelect' }],
  [{ text: 'Adicionar novo', callback_data: 'handleAddNew' }],
  [{ text: 'Editar prato', callback_data: 'handleEditDish' }, { text: 'Remover prato', callback_data: 'handleRemoveDish' }]
];

const conversations = [
  [{
    callbackQuery: 'Bon appétit',
    sendMessageCallback: handleRandomSelect,
  }],
  [{
    sendMessageCallback: 'Digite o nome do prato que deseja cadastrar:',
    options: {
      reply_markup: {
        force_reply: true
      }
    }
  },
  {
    sendMessageCallback: insertNewDish
  }],
  [{
    sendMessageCallback: 'Para editar um prato, utilize o formato: NUMERO_PRATO - NOME NOVO PRATO',
    options: {
      reply_markup: {
        force_reply: true
      }
    }
  },
  {
    sendMessageCallback: editExistingDish
  }],
  [{
    sendMessageCallback: 'Digite o número do prato que deseja remover:',
    options: {
      reply_markup: {
        force_reply: true
      }
    }
  },
  {
    sendMessageCallback: removeExistingDish
  }]
];

module.exports = {
  conversations: conversations,
  answer: provideMenu,
  inlineKeyboardInput: optionsForMenuSelection
}