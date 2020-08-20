function stringifyArray(array, shouldEnumerateArray) {
  let enumeratedArray = array;
  if (shouldEnumerateArray) enumeratedArray = enumerateArray(array);
  const stringifiedArray = JSON.stringify(enumeratedArray, null, 2)
    .replace(/(\[|\]|\")/g, '')
    .replace(/\n\s/, '')
    .replace(/^\s/gm, '');
  return stringifiedArray;
}

function enumerateArray(array) {
  return array.map((element, index) => `${index + 1} - ${element}`);
}

function validateNumberInput({ array, inputText }) {
  const minValidIndex = 0;
  const maxValidIndex = array.length - 1;
  const indexToEdit = parseInt(inputText) - 1;
  if (isNaN(indexToEdit)) {
    return 'Favor providenciar apenas um número';
  } else if (indexToEdit < minValidIndex || indexToEdit > maxValidIndex) {
    return `Favor providenciar um número entre ${minValidIndex + 1} e ${maxValidIndex + 1} (inclusos)`;
  }
  return undefined;
}

module.exports = {
  stringifyArray,
  validateNumberInput
}
