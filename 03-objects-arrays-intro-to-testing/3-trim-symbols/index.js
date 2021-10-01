/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const func = (str, size, result) => {
    let nextCharIndex;
    for (let char of str) {
      if (char !== str[0]) {
        nextCharIndex = str.indexOf(char);
        break;
      }
    }
    result += (nextCharIndex && nextCharIndex <= size) ? str.slice(0, nextCharIndex) : str.slice(0, size);
    return nextCharIndex ? func(str.slice(nextCharIndex), size, result) : result;
  };
  return func(string, size, '');
}
