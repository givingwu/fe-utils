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

  if (typeof data === 'object') {
    msg = data.message || (data.code && ERROR_MSG_MAP[data.code])
  } else {
    msg = ERROR_MSG_MAP[status] || statusText
  }

  if (!msg) {
    msg = HTTP_STATUS_TEXT[status] || 'Uncaught Error (in ibuild/http)'

    if (process.env.NODE_ENV !== 'production') {
      debugger
    }
  }

  return msg
}
