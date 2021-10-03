/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split('.');
  return (obj) => {
    return pathArr.reduce((acc, val) => {
      return (typeof acc === 'object') ? acc[val] : acc;
    }, obj);
  };
}
