import { setUrlParams, setDataFromUrl } from '../core/index'

function debounce (func, wait, immediate) {
  let timeout

  return function () {
    const context = this
    const args = arguments

    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

let config2data = {}
const reflect2data = function (vm) {
  setDataFromUrl.call(vm, { ...config2data })
  config2data = {}
}

let config2Url = {}
const reflect2Url = debounce(vm => {
  setUrlParams.call(vm, config2Url)
  config2Url = {}
}, 100)

export default {
  bind (el, { value, expression }, vnode) {
    if (!value) return
    let { url, type, data } = value
    // 如果没有配置 data 则从表达式中获取
    if (!value.data) {
      const res = expression.matchAll(/value:\s*(.*?)(\}|,)/gi)
      const firstRes = [...res][0]
      data = firstRes[1]
    }

    if (!(url && type && data)) throw Error(`v-url-map config not corrected: ${value}`)

    Object.assign(config2data, {
      [url]: { path: data, type }
    })

    reflect2data(vnode.context)
  },
  componentUpdated (el, { oldValue, value }, vnode) {
    if (!value) return
    // 取出值，更新到 url 中
    const elValue = value.value
    if (oldValue.value === elValue) {
      return
    }
    const { url } = value
    const params = { [url]: elValue }
    Object.assign(config2Url, params)
    reflect2Url(vnode.context)
  }
}
