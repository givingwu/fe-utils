import { errorMessage } from '@@/utils/message'
import { openDownloadURL } from '../adapter/open-download-url'

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

  if (config.download) {
    /**
     * https://github.com/axios/axios/blob/93e69625a69ef7bbcf14c9bcb2a1cba2d4b5a126/lib/core/dispatchRequest.js#L52
     * 如要使用自定义的下载方法， 则更改其 axios 的 adapter 为我们的 openDownloadURL 方法
     */
    config.adapter = openDownloadURL
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

  return Promise.reject(error)
}
