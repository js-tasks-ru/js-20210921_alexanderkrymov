/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sorted = [...arr];
  sorted.sort((a, b) => {
    const result = a.localeCompare(b, ['ru-RU', 'es-US'], {
      localeMatcher: 'lookup',
      caseFirst: 'upper',
    });
    if (param === 'desc') result *= -1;
    return result;
  });
  return sorted;
}
