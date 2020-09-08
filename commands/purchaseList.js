const { stringifyArray, validateNumberInput } = require('../utils');

const purchaseData = ['Macarrão', 'Água'];
const optionsForPurchaseSelection = [
  [{ text: 'Adicionar item', callback_data: 'addPurchase' }],
  [{ text: 'Remove item', callback_data: 'removePurchase' }]
];


function showPurchaseList() {
  const shouldEnumerate = true;
  return stringifyArray(purchaseData, shouldEnumerate);
}

function removePurchase({ text }) {
  let feedbackMsg = validateNumberInput({ inputText: text, array: purchaseData });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(text) - 1;
    const removedItem = purchaseData[indexToEdit];
    purchaseData.splice(indexToEdit, 1);
    feedbackMsg = `"${removedItem}" removido com sucesso!`;
  }
  return feedbackMsg;
}

function addPurchase({ text }) {
  purchaseData.push(text);
  return `"${text}" adicionado com sucesso.`;
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