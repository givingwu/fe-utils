/**
 * @typedef ResponseData
 * @property {0|1|99|100|403|404|429|503|1403|1503|200} code
 * @property {any} data
 * @property {string} message
 * @property {boolean} success
 */

/**
 * isRightResponse
 * @param {ResponseData} data
 */
export const isRightResponse = ({ success, code }) => success && code === 0
