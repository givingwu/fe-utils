import router from '@@/router/index'
import { redirectToLogin } from '@@/utils/url'
import { warnMessage, errorMessage } from '@@/utils/message'
import { getMessage } from './get-message'
import { CODE_STATUS } from '../config/custom-code-status'

export function warningHandler() {
  warnMessage(getMessage.apply(null, arguments))
}

export function errorHandler() {
  errorMessage(getMessage.apply(null, arguments))
}

export const codeHandlers = {
  // 未经授权访问,需要重新登录
  [CODE_STATUS.UNAUTHORIZED_ACCESS]: () => {
    redirectToLogin()
  },
  // 没有功能权限
  [CODE_STATUS.NO_PERMISSION]: () => {
    router.push({ name: 'error401' })
  },
  // 没有数据权限
  [CODE_STATUS.NO_DATA_PERMISSION]: () => {
    router.push({ name: 'error401' })
  },
  [CODE_STATUS.NOT_FOUND]: () => {
    router.push({ name: 'error404' })
  },
  // 不允许登录本系统
  [CODE_STATUS.DISABLED_LOGIN]: () => {
    router.push({ name: 'errorNoLogin' })
  },
  // 并发异常
  [CODE_STATUS.CONCURRENT_ERROR]: warningHandler,
  // 并发操作异常
  [CODE_STATUS.CONCURRENT_OPERATE_ERROR]: warningHandler,
  // 100
  [CODE_STATUS.VALIDATION_CODE_ERROR]: (data) => data,
  [CODE_STATUS.SYSTEM_ERROR]: warningHandler,
}
