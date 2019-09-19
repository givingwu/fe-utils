import createError from 'axios/lib/core/createError'
import { isJSON } from './is-valid-json'

export function openDownloadURL() {
  return createForm.apply(window, arguments)
}

const createForm = (config) =>
  new Promise((resolve, reject) => {
    const { method, url, data } = config
    const iframe = createIframe(config, resolve, reject)
    const name = `__download__form__`
    remove(name)

    const form = document.createElement('form')

    form.style.display = 'none'
    // The name of the form. In HTML 4, its use is deprecated (id should be used instead).
    // It must be unique among the forms in a document and not just an empty string in HTML 5.
    form.id = name
    form.name = name
    form.action = url
    form.method = method || 'post'

    /**
     * A name or keyword indicating where to display the response that is received after submitting the form.
     * In HTML 4, this is the name/keyword for a frame.
     * In HTML5, it is a name/keyword for a browsing context (for example, tab, window, or inline frame).
     * The following keywords have special meanings:
       + `_self`: Load the response into the same HTML 4 frame (or HTML5 browsing context) as the current one. This value is the default if the attribute is not specified.
      + `_blank`: Load the response into a new unnamed HTML 4 window or HTML5 browsing context.
      + `_parent`: Load the response into the HTML 4 frameset parent of the current frame, or HTML5 parent browsing context of the current one. If there is no parent, this option behaves the same way as _self.
      + `_top`: HTML 4: Load the response into the full original window, and cancel all other frames. HTML5: Load the response into the top-level browsing context (i.e., the browsing context that is an ancestor of the current one, and has no parent). If there is no parent, this option behaves the same way as _self.
      + `iframename`: The response is displayed in a named <iframe>.
   */
    form.target = iframe.name // iframename

    if (data) {
      let params = data

      if (typeof data === 'string') {
        try {
          params = JSON.parse(data)
        } catch (e) {
          console.error(e)
        }
      }

      if (typeof params === 'object') {
        Object.keys(params).forEach((key) => {
          form.appendChild(createInput(key, params[key]))
        })
      } else {
        form.appendChild(createInput('filter', params))
      }
    }

    document.body.appendChild(form)
    form.submit()

    remove(form)
  })

const createIframe = (config, resolve, reject) => {
  const name = `__download__iframe__`
  remove(name)

  const iframe = document.createElement('iframe')

  iframe.style.display = 'none'
  iframe.id = name
  iframe.name = name
  iframe.onload = () => {
    let json = ''

    if (/msie/.test(navigator.userAgent.toLowerCase())) {
      json =
        iframe.contentWindow && iframe.contentWindow.document.body.innerText
    } else {
      // If the iframe and the iframe's parent document are Same Origin,
      // returns a Document (that is, the active document in the inline frame's nested browsing context),
      // else returns null.
      json = iframe.contentDocument && iframe.contentDocument.body.innerText
    }

    remove(iframe)

    if (json) {
      if (isJSON(json)) {
        try {
          const data = JSON.parse(json)

          if (data && typeof data === 'object') {
            reject(createError(data.message, config, '', config, data))
          }
        } catch (error) {
          reject(createError(error, config, '', config, error))
        }
      } else {
        reject(createError(json, config, '', config, new Error(json)))
      }
    } else {
      /* 适配 AxiosResponse 数据结构 */
      resolve({
        data: json,
        config,
        status: 200,
        statusText: 'OK',
        headers: null,
        request: config,
      })
    }
  }

  document.body.appendChild(iframe)

  return iframe
}

const createInput = (key, val) => {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = key
  input.value = JSON.stringify(val || {})

  return input
}

function remove(ele) {
  let $ele = typeof ele === 'string' ? document.getElementById(ele) : ele

  if ($ele && $ele instanceof HTMLElement) {
    $ele.parentNode && $ele.parentNode.removeChild($ele)
    $ele = null
  }
}
