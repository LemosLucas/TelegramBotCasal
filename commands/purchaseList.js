const { stringifyArray, validateNumberInput, transformArrayOfObjectInArray } = require('../utils');
const { read, create, remove } = require('../database/utils');

const DATABASE_TABLE_NAME = 'purchases';
const optionsForPurchaseSelection = [
  [{ text: 'Adicionar item', callback_data: 'addPurchase' }],
  [{ text: 'Remove item', callback_data: 'removePurchase' }]
];


async function showPurchaseList() {
  const shouldEnumerate = true;
  const { rows: purchaseData } = await read({ table: DATABASE_TABLE_NAME });
  const arrayMenu = transformArrayOfObjectInArray(purchaseData, 'product');
  return stringifyArray(arrayMenu, shouldEnumerate);
}

async function removePurchase({ text: dishNumber }) {
  const { rows: purchaseData } = await read({ table: DATABASE_TABLE_NAME });
  const arrayMenu = transformArrayOfObjectInArray(purchaseData, 'product');
  let feedbackMsg = validateNumberInput({ inputText: dishNumber, array: purchaseData });

  if (!feedbackMsg) {
    const indexToRemove = parseInt(dishNumber) - 1;
    const result = await remove({ table: DATABASE_TABLE_NAME, column: 'product', entry: arrayMenu[indexToRemove] });
    feedbackMsg = `"${arrayMenu[indexToRemove]}" removido com sucesso!`;
  }
  return feedbackMsg;
}

async function addPurchase({ text }) {
  const result = await create({ table: DATABASE_TABLE_NAME, column: 'product', entry: text });
  let message;
  if (result.rowCount > 0) {
    message = `"${text}" adicionado com sucesso!`;
  } else {
    message = `Erro ao adicionar ${dishInfo}!`;
  }
  return message;
}

const conversations = [
  [{
    sendMessageCallback: 'Digite o nome do item que deseja adicionar:',
    options: {
      reply_markup: {
        force_reply: true
      }
    }
  },
  {
    sendMessageCallback: addPurchase,
  }],
  [{
    sendMessageCallback: 'Digite o número do item que deseja remover:',
    options: {
      reply_markup: {
        force_reply: true
      }
    }
  },
  {
    sendMessageCallback: removePurchase,
  }]
];

module.exports = {
  conversations: conversations,
  answer: showPurchaseList,
  inlineKeyboardInput: optionsForPurchaseSelection
}