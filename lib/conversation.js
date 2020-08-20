function telegramConversation() {

  const defaultSendOptions = {
    disable_notification: true,
  };
  const pendingMessagesToBeTreated = new Map();
  const responderMap = new Map();
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
  function registerCommand({ command, answer, options = defaultSendOptions, conversations = [] }) {
    /* Applying dedfault options  */
    options = {
      ...defaultSendOptions,
      ...options
    };
    let firstIteration = true;

    /* Verify if an 'inline_keyboard' is being used. */
    const hasInlineKeyboard = options.reply_markup && options.reply_markup.inline_keyboard;
    if (hasInlineKeyboard) {
      /* There should be an unique function for each 'InlineKeyboardButton'
      To match which function to call, the 1st button will call the 1st function,
      and so forth */
      const inlineButtons = options.reply_markup.inline_keyboard.flat();
      if (conversations.length !== inlineButtons.length) {
        return {
          error: 'Number of conversations do not match the number of inlineKeyboardButtons'
        };
      }
      /* Parse the 'conversations' array */
      for (const inlineButton of inlineButtons) {
        /* Retrieve the current conversation */
        const currentConversation = conversations.shift();
        /* Iterate over all objects to determine which functions
        to respond to a given conversation */
        for (let i = 0; i < currentConversation.length; i++) {
          const talk = currentConversation[i];
          if (i === 0) {
            responderMap.set(inlineButton.callback_data, talk);
          }
          const nextTalk = currentConversation[i + 1];
          if (nextTalk) {
            responderMap.set(talk, nextTalk);
          }
        }
      }
    } else {
      /* No inline keyboard is being used. Figure out a way to re-use 
      the same logic above */
    }

    bot.onText(command, async (telegramMessage) => {
      const id = telegramMessage.chat.id;
      let message;
      if (typeof answer === 'function') {
        message = answer();
      } else {
        message = answer;
      }
      console.log(`Sending message for ${command} with options: `, options);
      const sentMessage = await bot.sendMessage(id, message, options);
      if (!hasInlineKeyboard && firstIteration) {
        firstIteration = false;
        console.log('conversations: ', conversations);
        if (conversations.length > 0) {
          const currentConversation = conversations.shift();
          /* Iterate over all objects to determine which functions
          to respond to a given conversation */
          for (let i = 0; i < currentConversation.length; i++) {
            const talk = currentConversation[i];
            if (i === 0) {
              pendingMessagesToBeTreated.set(sentMessage.message_id, talk);
            }
            const nextTalk = currentConversation[i + 1];
            if (nextTalk) {
              pendingMessagesToBeTreated.set(talk, nextTalk);
            }
          }
        }
      }
    });
  }

  async function onText(query) {

    console.log('textQuery: ', query);

    if (!query.reply_to_message) return;
    if (query.reply_to_message.from.username !== 'AmandaLucasCarminattiLemosBot') return;
    const messageId = query.reply_to_message.message_id;

    /* Check this msg is waiting for a reply */
    const reply = pendingMessagesToBeTreated.get(messageId);
    if (!reply) return;

    const text = query.text;
    const callbackQueryId = query.message_id;
    const chatId = query.chat.id;

    if (reply.callbackQuery) {
      await _callbackQueryDefault({ callbackQueryId, userCallback: reply.callbackQuery, userArguments: text });
    }
    if (reply.sendMessageCallback) {
      const options = reply.options ? reply.options : {};
      const msg = await _answerMessageDefault({ id: chatId, userCallback: reply.sendMessageCallback, userArguments: text, options });
      const response = responderMap.get(reply);
      /* Register msg waiting for a reply */
      if (response) {
        pendingMessagesToBeTreated.set(msg.message_id, response);
      }
    }

    /* Removing message already answered */
    pendingMessagesToBeTreated.delete(messageId);
  }

  async function onCallbackQuery(query) {

    console.log('callbackQuery: ', query);

    if (!query.data) return;
    const callbackData = query.data;
    const callbackQueryId = query.id;
    const chatId = query.message.chat.id;

    const reply = responderMap.get(callbackData);
    if (reply.callbackQuery) {
      await _callbackQueryDefault({ callbackQueryId, userCallback: reply.callbackQuery });
    }
    if (reply.sendMessageCallback) {
      const options = reply.options ? reply.options : {};
      const msg = await _answerMessageDefault({ id: chatId, userCallback: reply.sendMessageCallback, options });
      const response = responderMap.get(reply);
      /* Register msg waiting for a reply */
      if (response) {
        pendingMessagesToBeTreated.set(msg.message_id, response);
      }
    }

  }

  async function _callbackQueryDefault({ callbackQueryId, userCallback, userArguments = '' }) {
    let result;
    if (typeof userCallback === 'function') {
      result = userCallback(userArguments);
    } else {
      result = userCallback;
    }

    await bot.answerCallbackQuery(callbackQueryId, {
      callback_query_id: callbackQueryId,
      text: result
    });

    return result;
  }

  async function _answerMessageDefault({ id, userCallback, userArguments = '', options = {} }) {
    let result;
    if (typeof userCallback === 'function') {
      result = userCallback({ text: userArguments });
    } else {
      result = userCallback;
    }
    console.log('options: ', options);

    options = {
      ...defaultSendOptions,
      ...options
    };


    return await bot.sendMessage(id, result, options);

  }

  return {
    onText,
    onCallbackQuery,
    registerBot,
    registerCommand
  };
}

module.exports = telegramConversation();
