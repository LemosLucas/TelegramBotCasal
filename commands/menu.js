const { stringifyArray, validateNumberInput, transformArrayOfObjectInArray } = require('../utils');
const { read, create, remove, update } = require('../database/utils');

const DATABASE_TABLE_NAME = 'menuitems';

async function insertNewDish({ text: dishInfo }) {
  const result = await create({ table: DATABASE_TABLE_NAME, column: 'dish', entry: dishInfo });
  let message;
  if (result.rowCount > 0) {
    message = 'Prato adicionado com sucesso!';
  } else {
    message = `Erro ao adicionar ${dishInfo}!`;
  }
  return message;
}

async function handleRandomSelect() {
  const { rows: menuData } = await read({ table: DATABASE_TABLE_NAME });
  const randomIndex = Math.floor(Math.random() * menuData.length);
  const chosenDish = menuData[randomIndex].dish;
  return chosenDish;
}

async function editExistingDish({ text: dishInfo }) {
  const [dishNumber, dishName] = dishInfo.split('-');
  const { rows: menuData } = await read({ table: DATABASE_TABLE_NAME });
  const arrayMenu = transformArrayOfObjectInArray(menuData, 'dish');
  let feedbackMsg = validateNumberInput({ inputText: dishNumber, array: arrayMenu });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(dishNumber) - 1;
    const result = await update({ table: DATABASE_TABLE_NAME, column: 'dish', oldEntry: arrayMenu[indexToEdit], newEntry: dishName });
    feedbackMsg = 'Prato editado com sucesso!';
  }
  return feedbackMsg;
}

async function removeExistingDish({ text: dishNumber }) {
  const { rows: menuData } = await read({ table: DATABASE_TABLE_NAME });
  const arrayMenu = transformArrayOfObjectInArray(menuData, 'dish');
  let feedbackMsg = validateNumberInput({ inputText: dishNumber, array: arrayMenu });

  if (!feedbackMsg) {
    const indexToRemove = parseInt(dishNumber) - 1;
    const result = await remove({ table: DATABASE_TABLE_NAME, column: 'dish', entry: arrayMenu[indexToRemove] });
    feedbackMsg = 'Prato removido com sucesso!';
  }
  return feedbackMsg;
}

async function provideMenu() {
  const shouldEnumerate = true;
  const { rows: menuData } = await read({ table: DATABASE_TABLE_NAME });
  const arrayMenu = transformArrayOfObjectInArray(menuData, 'dish');
  return stringifyArray(arrayMenu, shouldEnumerate);
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