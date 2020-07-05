const defaultCommand = {
  command: 'cardapios',
  description: 'Mostra lista dos cardápios cadastrados'
};

async function setBotCommand(bot, command = defaultCommand) {
  const commands = [];
  commands.push(defaultCommand);
  commands.push(command);

  const result = await bot.setMyCommands(commands);

  console.log(`Resultado da mudança dos comandos: ${result}`);
}

module.exports = {
  setBotCommand: setBotCommand
}
