const { stringifyArray, validateNumberInput } = require('./utils');

const purchaseData = ['Macarrão', 'Água'];

function showPurchaseList() {
  const shouldEnumerate = true;
  return stringifyArray(purchaseData, shouldEnumerate);
}

function removePurchase({ text }) {
  let feedbackMsg = validateNumberInput({ inputText: text, array: purchaseData });

  if (!feedbackMsg) {
    const indexToEdit = parseInt(text) - 1;
    purchaseData.splice(indexToEdit, 1);
    feedbackMsg = 'Item removido com sucesso!';
  }
  return feedbackMsg;
}

function addPurchase({ text }) {
  purchaseData.push(text);
  return 'Item adicionado com sucesso';
}

const removeConversations = [
  [{
    sendMessageCallback: removePurchase,
  }]
];

const addConversations = [
  [{
    sendMessageCallback: addPurchase,
  }]
];

module.exports = {
  showPurchaseList,
  options: {
    reply_markup: {
      force_reply: true
    }
  },
  removeConversations: removeConversations,
  addConversations: addConversations
}