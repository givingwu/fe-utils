/**
 * @see {@link https://github.com/joaquimserafim/is-json}
 * isJSON 是否是合法的 JSON string
 * @param {string} str
 * @returns {boolean}
 */
export function isJSON(str) {
  if (!str || typeof str !== 'string') return false

  str = str.replace(/\s/g, '').replace(/\n|\r/, '')

  if (/^\{(.*?)\}$/.test(str)) return /"(.*?)":(.*?)/g.test(str)

  if (/^\[(.*?)\]$/.test(str)) {
    return str
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .replace(/},{/g, '}\n{')
      .split(/\n/)
      .map(function(s) {
        return isJSON(s)
      })
      .reduce(function(prev, curr) {
        return !!curr
      })
  }

  return false
}
