import { errorMessage } from '@@/utils/message'

/**
 * requestHandler
 * @param {{}} config
 */
export function requestHandler(config) {
  if (config.debug) {
    console.log(
      `\n\n${config.method} '${config.url}' start => ====================================`
    )

    console.log(config)

    console.log(
      `${config.method} '${config.url}' end => ====================================\n\n`
    )
  }

  return config
}

export function returnsRequestErrorHandler(error) {
  return Promise.reject(error)
}

/**
 * requestErrorHandler
 * @description 根据 PM 需求，直接吃掉异常，具体可能产生的副作用，需要经过详细测试。
 * @param {{}} error
 */
export function requestErrorHandler(error) {
  if (error && !(error.config && error.config.ignoreMsg)) {
    errorMessage(error)
  }

  return Promise.reject(error).catch((error) => {
    console.dir(error)
    return error
  })
}
