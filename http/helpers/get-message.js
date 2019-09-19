import { ERROR_MSG_MAP } from '../config/error-msg-map'
import { HTTP_STATUS_TEXT } from '../config/http-code-status'

/**
 * @typedef ResponseData
 * @property {0|1|99|100|403|404|429|503|1403|1503|200} code
 * @property {any} data
 * @property {string} message
 * @property {boolean} success
 */

/**
 * getErrorMsg
 * @param {ResponseData} data
 * @param {number} status
 * @param {string} statusText
 * @returns {string}
 */
export function getMessage(data, status, statusText) {
  let msg

  // data cannot be null
  if (data && typeof data === 'object') {
    msg = data.message || (data.code && ERROR_MSG_MAP[data.code])
  } else {
    msg = ERROR_MSG_MAP[status] || statusText || HTTP_STATUS_TEXT[status]
  }

  return msg
}
