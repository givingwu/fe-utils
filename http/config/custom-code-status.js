import { HTTP_STATUS_CODE } from './http-code-status'

/**
 * 从老业务代码中抽象出来的状态码
 */
export const CODE_STATUS = {
  SUCCESS: 0, // 正常/成功
  BUSINESS_ERROR: 1, // 业务异常
  SYSTEM_ERROR: 99, // 系统异常
  VALIDATION_CODE_ERROR: 100, // 验证码
  UNAUTHORIZED_ACCESS: HTTP_STATUS_CODE.FORBIDDEN, // 未经授权访问,需要重新登录
  // 429?
  NO_PERMISSION: 503, // 没有功能权限
  NO_DATA_PERMISSION: 1403, // 没有数据权限
  NOT_FOUND: HTTP_STATUS_CODE.NOT_FOUND,
  DISABLED_LOGIN: 1503, // 不允许登录本系统
  CONCURRENT_ERROR: HTTP_STATUS_CODE.TOO_MANY_REQUESTS, // 并发异常
  CONCURRENT_OPERATE_ERROR: 200, // 并发操作异常
}
