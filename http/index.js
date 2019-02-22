import * as http from 'axios';
import utils from 'axios/lib/utils';
import { stringify } from 'querystring';


/**
 * 挂载 axios.postForm() 方法
 * 挂载 axios.postJSON() 方法
 */
const Axios = http.Axios;
const ContentTypes = [
  { 'Content-Type': 'application/json;charset=utf-8' },
  { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
];

// 参见[defaults.transformRequest[0]] https://github.com/axios/axios/blob/master/lib/defaults.js
['postJSON', 'postForm'].forEach(function(method, index) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: 'post',
      url: url,
      data: method === 'postForm' ? window.URLSearchParams ? new URLSearchParams(data) : stringify(data) : data,
    }, {
      headers: ContentTypes[index]
    }));
  };
});

/**
 * 为什么这里需要 http.create() ?
 * 因为上面往实例中重新挂载了新的方法，所以这里需要调用工厂方法重新绑定 Axios.prototype 对象
 */
const axios = http.create({
  timeout: 60 * 1000 * 2,
});

export const ERROR_MSG_MAP = {
  // 40101: '未登录',      //ERP user
  // 40102: '微信未授权',  // wechat user
  // 40103: '您不是会员',  // member user

  401: '抱歉，您还未登录',
  403: '抱歉，您没有权限访问该页面',
  413: '抱歉，您上传文件太大',

  404: '服务器迷路了，未寻到这个地址',
  405: '服务器无法理解这个请求方法',
  500: '服务器开小差，这是一个问题',
  502: '网关服务器在跟你开玩笑呢',
  503: '服务器不可用，你在跟我开玩笑',
  504: '服务器过于拥挤，超时空穿越了',
};

export function getErrorMsg (data, status, statusText) {
  let msg = '';

  if (typeof data !== 'object') {
    msg = ERROR_MSG_MAP[status]
  } else {
    msg = data.result || data.message
  }

  return msg || statusText || 'Uncaught (in ff/http)'
}


/**
 * [参见0](https://github.com/axios/axios/blob/master/lib/adapters/xhr.js#L67) // xhr request source code
 * [参见1](https://github.com/axios/axios/blob/master/lib/core/settle.js#L18) // promise resolve settle
 * [参见2](https://github.com/axios/axios/blob/master/lib/core/createError.js#L15) // how axios returns an error
 * [参见3](https://github.com/axios/axios/blob/master/lib/core/enhanceError.js#L13) // enhance Error 返回错误并挂载 request\response\config 到 Error 对象
 * [usage](./README.md#L5~L10)
 */

/**
 * TODO:
 *  1. 在发起请求前，检查本地是否包含指定的 cookie `${config.cookieName ?: string}`
 *  如果是用户`login`,`logout`,`register`,`forgotPswd`等操作，则应该忽略检查。
 *  所以需要一个`config.ignorePaths ?: array` or `['login', 'logout', ...]`
 *
 *  2. 再发起请求时候默认约定加上 `gateway` 转发的地址，即 prefix: '/api' 网关代理
 *  为了保证和以前兼容，加了 prefix 的则不需要添加，支持自定义 prefix: http.get(url, { prefix: '/custom' })
 *  检测如果是完整 http url 路径，/https?\:/ 则直接发起请求不需要 prefix
 *  如果不需要自动添加 prefix 则 http.get(url, { prefix: false }) 取消自动添加prefix
 */
axios.interceptors.request.use(function(config) {
  if (config.debug) {
    console.log('request => config ====================================');
    console.log(config);
    console.log('request => config ====================================');
  }

  // if u add new Chainable promise or other interceptor
  // You have to return `config` inside of a request
  // otherwise u will get a very confusing error
  // and spend 5mins at least to debug that.
  return config;
}, function(error) {
  return Promise.reject(error).then(error => {
    config.showErrorMsg && config.showErrorMsg(error);
    console.dir(error);
  });
});

axios.interceptors.response.use(function(response) {
  // handle server response error
  const { data, status, statusText, /* headers, */ config = {} } = response; // 参见0 参见1

  // if it is a external request, just return its data
  if (config.external) {
    return data;
  } else {
    // if no data returns from server, do nothing
    // and just return empty data object
    if (data) {
      const { code, success, data: serverData, result } = data;

      // 默认当 success && code === 0 的时候
      // 理解为下游不需要手动处理 data.code，所以直接返回 data
      if (success && code === 0) {
        // 需要自己处理成功后的code
        // 或者 code 不为0的情况
        if (config.allData || code !== 0) {
          return data;
        } else {
          return serverData;
        }
      } else {
        let message = '请求返回异常'

        // 不交由下游处理
        if (!config.handleError) {
          config.showErrorMsg && config.showErrorMsg(message = getErrorMsg(data, status, result || statusText));
        }

        return Promise.reject({ message, code, data })
      }
    }/*  else {
      // 这里的异常不能吃！！！
      return Promise.reject(new Error('Data is not a valid object'))
    } */
  }
}, function(error) {
  // handle http status code error `401|403|500`
  const { config = {}, code, request = {}, response = {} } = error; // 参见1

  if (error && (config || request || response)) {
    const { data, status, statusText, code: respCode, /* headers */ } = response; // 参见0

    let errorMsg = '请求发生错误'
    let errorCode = code || respCode || status

    if (errorCode && errorCode === 'ECONNABORTED') {
      errorMsg = getErrorMsg(data, status || 504, statusText);
    } else {
      errorMsg = getErrorMsg(data, status, statusText);
    }

    // 不交由下游处理
    if (!config.handleError) {
      if (status) {
        if (status === 401 && data && typeof data === 'object') { //unauthorized
          config.handleUnauthorized && config.handleUnauthorized(errorCode || status, data)
        } else {
          config.showErrorMsg && config.showErrorMsg(errorCode || status, errorMsg);
        }
      }
    }

    if (errorMsg) error.message = errorMsg;
    if (errorCode) error.code = errorCode;

  } else {
    config.showErrorMsg && config.showErrorMsg('Unknown Error', error);
  }

  return Promise.reject(error);
});

export default axios;
