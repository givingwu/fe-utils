import http from './index'

export let _Vue

export default function install(Vue, namespace = '$http') {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  if (!Vue.prototype[namespace]) {
    Object.defineProperty(Vue.prototype, namespace, {
      get() {
        return http
      },
    })
  } else {
    throw new ReferenceError(
      `The namespace ${namespace} in Vue.prototype has been existed ${
        Vue.prototype[namespace]
      }`
    )
  }

  if (!Vue.Http) {
    Vue.Http  = http
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
