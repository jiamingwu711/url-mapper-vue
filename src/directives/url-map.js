import { setUrlParams, setDataFromUrl, getByPath } from '../core'

const PREFIX = '[url-mapper-vue]'
const DEBOUNCE_WAIT = 100

function debounce (func, wait, immediate) {
  let timeout

  function debounced () {
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

  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }

  return debounced
}

/**
 * 每个组件实例（vue2: vnode.context, vue3: binding.instance）独立持有一份状态，
 * 避免多个组件实例 / 多个 app 同时使用时互相串扰。
 *
 * state = {
 *   data: { [urlKey]: { path, type } }  待从 url 写入组件 data 的配置
 *   url: { [urlKey]: value }            待从组件 data 写入 url 的参数
 *   callbacks: string[]                 data 写入完成后需要调用的组件方法名
 *   entries: Map<el, { last }>          (vue3) 每个绑定元素最近一次同步的值快照，用于更新去重
 *   flushData / flushUrl                防抖后的刷新函数
 * }
 */
const states = new WeakMap()

function getState (vm) {
  let state = states.get(vm)
  if (!state) {
    state = {
      data: {},
      url: {},
      callbacks: [],
      entries: new Map()
    }
    state.flushData = debounce(() => reflect2data(vm, state), DEBOUNCE_WAIT)
    state.flushUrl = debounce(() => reflect2Url(vm, state), DEBOUNCE_WAIT)
    states.set(vm, state)
  }
  return state
}

function snapshot (val) {
  return val !== null && typeof val === 'object' ? JSON.stringify(val) : val
}

function reflect2data (vm, state) {
  const config = state.data
  state.data = {}
  setDataFromUrl.call(vm, config)

  // 数据由 url 写入后，刷新快照，避免随后的 updated 又把同样的值写回 url
  state.entries.forEach((entry, el) => {
    if (entry.path) entry.last = snapshot(getByPath(vm, entry.path))
  })

  if (state.callbacks.length) {
    const cbNames = state.callbacks
    state.callbacks = []
    vm.$nextTick(() => {
      cbNames.forEach(cbName => {
        if (typeof vm[cbName] === 'function') vm[cbName]()
      })
    })
  }
}

function reflect2Url (vm, state) {
  const params = state.url
  state.url = {}
  setUrlParams.call(vm, params)
}

function addCallback (state, callback) {
  if (callback && !state.callbacks.includes(callback)) state.callbacks.push(callback)
}

// 去除首尾空白与包裹的引号，保证进入 getByPath 的是纯净的点分路径
function normalizePath (path) {
  return path.trim().replace(/^['"`]|['"`]$/g, '').trim()
}

/**
 * 校验并整理指令配置
 * @param {*} value 指令绑定值 { url, type, value | data, callback }
 * @param {string} fallbackPath 未配置 data 时，用于兜底的数据路径
 */
function parseConfig (value, fallbackPath) {
  const { url, type, callback } = value
  // 如果没有配置 data 则从表达式中获取
  const data = value.data || fallbackPath

  const missing = [['url', url], ['type', type], ['value', data]]
    .filter(([, v]) => !v)
    .map(([name]) => name)
  if (missing.length) {
    throw Error(`${PREFIX} v-url-map 配置出错，请检查，缺少：${missing.join(', ')}`)
  }
  if (typeof data !== 'string') {
    throw Error(`${PREFIX} v-url-map 的 value 需要是字符串形式的数据路径，例如 value: 'form.name'`)
  }
  const path = normalizePath(data)
  if (!path) {
    throw Error(`${PREFIX} v-url-map 配置出错，请检查，缺少：value`)
  }
  return { url, type, path, callback }
}

const config = {
  /**
   * for vue3
   */
  beforeMount (el, { value, instance }) {
    // 从 url 取出值，更新到 data 中
    if (!value || !instance) return
    const { url, type, path, callback } = parseConfig(value, value.value)

    const state = getState(instance)
    addCallback(state, callback)
    state.entries.set(el, { path, last: snapshot(getByPath(instance, path)) })
    Object.assign(state.data, {
      [url]: { path, type }
    })

    state.flushData()
  },
  /**
   * for vue3
   */
  updated (el, { value, instance }) {
    if (!value || !instance) return
    const { url } = value
    if (!url || typeof value.value !== 'string') return
    const path = normalizePath(value.value)

    const state = getState(instance)
    const entry = state.entries.get(el)
    const current = getByPath(instance, path)

    if (!entry) {
      state.entries.set(el, { path, last: snapshot(current) })
      return
    }
    entry.path = path

    // 取值失败时降级为不同步，每个元素最多提示一次
    if (current === undefined) {
      if (!entry.warned) {
        entry.warned = true
        console.warn(`${PREFIX} v-url-map 无法根据路径 "${path}" 取到值，请检查 value 配置`)
      }
      return
    }

    // 值没有变化时不写 url，避免组件任意重渲染都触发 pushState
    const snap = snapshot(current)
    if (snap === entry.last) return
    entry.last = snap

    state.url[url] = current
    state.flushUrl()
  },
  /**
   * for vue3
   */
  unmounted (el, { instance }) {
    if (!instance) return
    const state = states.get(instance)
    if (!state) return
    state.entries.delete(el)
    if (!state.entries.size) {
      state.flushData.cancel()
      state.flushUrl.cancel()
      // 取消防抖前先同步落盘尚未写入的 url 参数，避免卸载边界上丢失最后一次变更
      if (Object.keys(state.url).length) reflect2Url(instance, state)
      // 待回填到 data 的配置对已卸载的组件没有意义，直接丢弃
      state.data = {}
      state.callbacks = []
      states.delete(instance)
    }
  },

  /**
   * for vue2
   */
  bind (el, { value, expression }, vnode) {
    // 从 url 取出值，更新到 data 中
    if (!value) return
    let fallbackPath
    if (!value.data && expression) {
      const matched = expression.match(/value:\s*(.*?)(\}|,)/i)
      fallbackPath = matched && matched[1]
    }
    const { url, type, path, callback } = parseConfig(value, fallbackPath)

    const state = getState(vnode.context)
    addCallback(state, callback)
    Object.assign(state.data, {
      [url]: { path, type }
    })

    state.flushData()
  },
  /**
   * for vue2
   */
  componentUpdated (el, { oldValue, value }, vnode) {
    if (!value) return
    // 取出值，更新到 url 中
    const elValue = value.value
    if (oldValue && oldValue.value === elValue) {
      return
    }
    const { url } = value
    const state = getState(vnode.context)
    Object.assign(state.url, { [url]: elValue })
    state.flushUrl()
  }
}

export default config
