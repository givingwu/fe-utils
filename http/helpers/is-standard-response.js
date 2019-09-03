import { hasOwn } from '@@/utils/index'

/**
 * @typedef StandardData
 * @property {0|1|99|100|403|404|429|503|1403|1503|200} code
 * @property {any} data
 * @property {string} message
 * @property {boolean} success
 *
 * isStandardData
 * @param {StandardData|{}} data
 * @returns {boolean}
 */
export const isStandardResponseBody = (data) => {
  if (typeof data === 'object') {
    return (
      hasOwn(data, 'data') &&
      hasOwn(data, 'code') &&
      hasOwn(data, 'message') &&
      hasOwn(data, 'success')
    )
  }

  return false
}
