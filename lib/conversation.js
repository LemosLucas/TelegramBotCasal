function telegramConversation() {

  const defaultSendOptions = {
    disable_notification: true,
  };
  const pendingMessagesToBeTreated = {};
  const callbackQueryMap = new Map();
  let bot;

  function registerBot(clientBot) {
    if (clientBot.constructor.name !== 'TelegramBot') {
      return {
        error: 'Argument provided is not an instance of TelegramBot'
      };
    }
    bot = clientBot;

    /* Add listeners for current bot */
    bot.on('text', onText);
    bot.on('callback_query', onCallbackQuery);

    return {
      error: null
    };
  }

  /**
    command: a regex to match the expected command. Ex: /\/cardapios/
    answer: a string to be answered when this command is received.
    Stringify it, if necessary
    options: an object matching the optional properties from the api:
    https://core.telegram.org/bots/api#sendmessage
    inlineKeyboardCallbacks: array of functions whose names must be the same
    as the 'callback_data' property of each 'InlineKeyboardButton'. It's only
    required if 'reply_markup : {inline_keyboard: ...}' is usedd. The argument
    is an object with:
      {
        text: result query with what the user has typed
      }
  */
  function registerCommand({ command, answer, options = defaultSendOptions, inlineKeyboardCallbacks = [] }) {
    /* Applying dedfault options  */
    options = {
      ...defaultSendOptions,
      ...options
    };

    /* Verify if an 'inline_keyboard' is being used. */
    if (options.reply_markup && options.reply_markup.inline_keyboard) {
      /* There should be an unique function for each 'InlineKeyboardButton'
      To match which function to call, the 1st button will call the 1st function,
      and so forth */
      const inlineButtons = options.reply_markup.inline_keyboard.flat();
      if (inlineKeyboardCallbacks.length !== inlineButtons.length) {
        return {
          error: 'Number of inlineKeyboardCallbacks do not match the number of inlineKeyboardButtons'
        };
      }
      let i = 0;
      for (const inlineButton of inlineButtons) {
        const callbacksObject = inlineKeyboardCallbacks[i++];
        callbackQueryMap.set(inlineButton.callback_data, callbacksObject);
      }

    }

    bot.onText(command, async (telegramMessage) => {
      const id = telegramMessage.chat.id;
      const message = answer;
      console.log('Sending message for /cardapios with options: ', options);
      return await bot.sendMessage(id, message, options);
    });


  }

  async function onText(query) {

    console.log('textQuery: ', query);

    return 'onText';

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
  }

  async function onCallbackQuery(query) {

    console.log('callbackQuery: ', query);

    if (!query.data) return;
    const callbackData = query.data;
    const callbackQueryId = query.id;
    const chatId = query.message.chat.id;

    const { callbackQuery, sendMessageCallback } = callbackQueryMap.get(callbackData);
    if (callbackQuery) {
      await _callbackQueryDefault({ callbackQueryId, userCallback: callbackQuery });
    }
    if (sendMessageCallback) {
      await _answerMessageDefault({ id: chatId, userCallback: sendMessageCallback });
    }

  }

  async function _callbackQueryDefault({ callbackQueryId, userCallback }) {
    let result;
    if (typeof userCallback === 'function') {
      result = userCallback();
    } else {
      result = userCallback;
    }

    await bot.answerCallbackQuery(callbackQueryId, {
      callback_query_id: callbackQueryId,
      text: result
    });

    return result;
  }

  async function _answerMessageDefault({ id, userCallback }) {
    let result;
    if (typeof userCallback === 'function') {
      result = userCallback();
    } else {
      result = userCallback;
    }

    await bot.sendMessage(id, result, defaultSendOptions);

  }

  return {
    onText,
    onCallbackQuery,
    registerBot,
    registerCommand
  };
}

module.exports = telegramConversation();
