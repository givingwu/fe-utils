import axios from './extend-axios'
import { requestHandler, requestErrorHandler } from './handlers/request'
import { responseHandler, responseErrorHandler } from './handlers/response'

axios.interceptors.request.use(requestHandler, requestErrorHandler)
axios.interceptors.response.use(responseHandler, responseErrorHandler)

export default axios
