import axios from 'axios'
import http from './extend-axios'
import { requestHandler, requestErrorHandler } from './handlers/request'
import { responseHandler, responseErrorHandler } from './handlers/response'

http.interceptors.request.use(requestHandler, requestErrorHandler)
http.interceptors.response.use(responseHandler, responseErrorHandler)

export function getHeader(key) {
  return http.defaults.headers.common[key] || axios.defaults.headers.common[key]
}

export function setHeader(key, val) {
  http.defaults.headers.common[key] = val
  axios.defaults.headers.common[key] = val
}

export function cleanHeader(key) {
  delete http.defaults.headers.common[key]
  delete axios.defaults.headers.common[key]
}

export default http
