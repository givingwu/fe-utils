import * as http from 'axios'
import utils from 'axios/lib/utils'
import { stringify } from 'querystring'
import { DEFAULT_AXIOS_CONFIG } from './config/default-axios-config'

/**
 * 挂载 axios.postForm() 方法
 * 挂载 axios.postJSON() 方法
 */
const Axios = http.Axios
const ContentTypes = [
  { 'Content-Type': 'application/json;charset=utf-8' },
  { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
]

// 参见[defaults.transformRequest[0]] https://github.com/axios/axios/blob/master/lib/defaults.js
/**
 * 扩展 Axios 方法以配置默认的 Content-Type
 * axios.postJSON(url, data, config) // application/JSON
 * axios.postForm(url, data, config) // x-www-form-urlencoded;charset=utf-8
 */
;['postJSON', 'postForm'].forEach(function(method, index) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(
      utils.merge(
        config || {},
        {
          method: 'post',
          url: url,
          data:
            method === 'postForm'
              ? window.URLSearchParams
                ? new URLSearchParams(data)
                : stringify(data)
              : data,
        },
        {
          headers: ContentTypes[index],
        }
      )
    )
  }
})

/**
 * 为什么这里需要调用 http.create() ?
 * 因为上面往实例中重新挂载了新的方法，所以这里需要调用工厂方法重新生成 axios 实例对象
 */
export default http.create(DEFAULT_AXIOS_CONFIG)
