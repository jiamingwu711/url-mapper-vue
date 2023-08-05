import { setUrlParams, setDataFromUrl } from '../core'

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

let config2data = {} // 存放到一个 data 中
let callbackMap = {}

const reflect2data = debounce(function (vm) {
  setDataFromUrl.call(vm, { ...config2data })
  config2data = {}
  if (callbackMap[vm]) {
    vm.$nextTick(() => {
      callbackMap[vm].forEach(cbName => {
        if (typeof vm[cbName] === 'function') vm[cbName]()
      })
      callbackMap[vm] = []
    })
  }
}, 100)

let config2Url = {}
const reflect2Url = debounce(vm => {
  setUrlParams.call(vm, config2Url)
  config2Url = {}
}, 100)

export default {
  bind (el, { value, expression }, vnode) {
    // 从 url 取出值，更新到 data 中
    if (!value) return
    let { url, type, data, callback } = value
    // 如果没有配置 data 则从表达式中获取
    if (!value.data) {
      const res = expression.matchAll(/value:\s*(.*?)(\}|,)/gi)
      const firstRes = [...res][0]
      data = firstRes[1]
    }

    if (!(url && type && data)) throw Error('url data 配置出错，请检查')
    if (callback) {
      callbackMap[vnode.context] = callbackMap[vnode.context] || []
      callbackMap[vnode.context].push(callback)
    }
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
