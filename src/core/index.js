/**
 * 是否为 hash 路由模式（例如 http://host/#/list?tab=1）。
 * 仅当 hash 以 "#/" 或 "#!/" 开头（路由前缀），或以 "#?" 开头（仅有参数）时才认为参数位于 hash 内；
 * 普通锚点（如 #section、#faq?section-2）不算 hash 路由，避免误读/误改 "?" 之前的普通参数。
 */
function isHashMode () {
  return /^(#!?\/|#\?)/.test(window.location.hash)
}

/**
 * 把 hash 拆成路由部分和查询字符串，例如 '#/list?tab=1' => { path: '#/list', query: 'tab=1' }
 */
function splitHash (hash) {
  const index = hash.indexOf('?')
  if (index === -1) return { path: hash, query: '' }
  return { path: hash.slice(0, index), query: hash.slice(index + 1) }
}

function getQueryString () {
  return isHashMode()
    ? splitHash(window.location.hash).query
    : window.location.search.slice(1)
}

function parseUrlParams () {
  const params = {}
  const searchParams = new URLSearchParams(getQueryString())
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  return params
}

function isFalsyVal (value) {
  return (!value && value !== 0) ||
  (Array.isArray(value) && !value.length)
}

function replaceQueryState (query) {
  const hashMode = isHashMode()
  const hashParts = splitHash(window.location.hash)
  const searchParams = new URLSearchParams(getQueryString())

  for (const [key, value] of Object.entries(query)) {
    if (isFalsyVal(value)) {
      searchParams.delete(key)
    } else {
      searchParams.set(key, value)
    }
  }

  const queryString = searchParams.toString()
  const { pathname, search, hash } = window.location
  // hash 模式下参数写在 hash 内，保持 "#/path?query" 结构，不动 "?" 之前的 search
  const newUrl = hashMode
    ? `${pathname}${search}${hashParts.path}${queryString ? `?${queryString}` : ''}`
    : `${pathname}${queryString ? `?${queryString}` : ''}${hash}`

  history.pushState({}, '', newUrl)
}

function decodeUrl (url, count = 0) {
  if (decodeURIComponent(url) === url || count > 20) {
    return url
  }
  return decodeUrl(decodeURIComponent(url), ++count)
}

function isJSONObject (json) {
  try {
    if (typeof json !== 'object') return false
    JSON.parse(JSON.stringify(json))
    return true
  } catch (error) {
    return false
  }
}

function parseJSON2Object (str) {
  try {
    return str && JSON.parse(str)
  } catch (error) {
    return null
  }
}

/**
 * 按路径安全取值，例如 getByPath(vm, 'form.name')。
 * 路径为空、非字符串或中间节点为 null/undefined 时返回 undefined。
 * 在 Vue 3 中，通过组件实例代理访问时 ref 会被自动解包。
 */
export function getByPath (target, path) {
  if (target == null || typeof path !== 'string' || !path) return undefined
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), target)
}

export function clearUrlParams () {
  const { pathname, search, hash } = window.location
  // hash 模式下只清除 hash 内的参数，保留路由部分
  const newUrl = isHashMode()
    ? `${pathname}${search}${splitHash(hash).path}`
    : `${pathname}${hash}`
  window.history.replaceState('', '', newUrl)
}

/**
 * map data to url params
 * @param {*} params Object
 */
export function setUrlParams (params) {
  const oriQuery = parseUrlParams()
  const _params = Object.assign({}, oriQuery, params)
  Object.keys(_params).forEach(key => {
    if (isFalsyVal(_params[key])) {
      // if ([null, undefined, ''].includes(_params[key]) || (Array.isArray(_params[key]) && !_params[key].length)) {

      // delete _params[key]
    } else if (_params[key] || _params[key] === false) {
      let val = _params[key]
      if (/^http/.test(_params[key])) {
        val = encodeURIComponent(_params[key])
      }
      if (isJSONObject(val) && !Array.isArray(val)) {
        val = JSON.stringify(val)
      }
      if (typeof val === 'boolean') {
        val = String(val)
      }
      _params[key] = val
    }
  })

  // update url
  replaceQueryState(_params)
}

/**
 * map url params to component data
 * @param {*} config { [key]: { path: [data path], type: [type] } }
 * key: url params name
 * data path: to access the value of vue component data, for example: this.form.name is 'form.name'.
 * type: indicate the value type of component data, these types are supported: boolean, string, number, array|number, array|string
 *
 * Example:
 * const config = {
 *    type: { path: 'form.type', type: 'array|number' }, // Find the parameter named 'type' from the URL, convert its value to Array Number and map it to 'this.form.type' in the component
 *    desc: { path: 'form.desc', type: 'string' } // Find the parameter named 'desc' from the URL, convert its value to String and map it to 'this.form.desc' in the component
 * }
 */
export function setDataFromUrl (config) {
  const query = parseUrlParams()
  Object.keys(config).forEach(key => {
    let valToBeSet = query[key]
    if (valToBeSet === undefined) return

    const { path, type } = config[key]
    if (type.toLowerCase() !== 'arrays|number') {
      // 二维数组不转成
      valToBeSet = decodeUrl(valToBeSet)
    }
    let targetKey = ''
    let that = this
    switch (type.toLowerCase()) {
      case 'number':
        valToBeSet = Number(valToBeSet)
        break
      case 'string':
        valToBeSet = String(valToBeSet)
        break
      case 'boolean':
        if (valToBeSet === 'true') valToBeSet = true
        else if (valToBeSet === 'false') valToBeSet = false
        break
      case 'object':
        valToBeSet = parseJSON2Object(valToBeSet)
        break
      case 'array|number':
        valToBeSet = valToBeSet.split(',')
        valToBeSet = valToBeSet.map(val => Number(val))
        break
      case 'arrays|array|number':
        valToBeSet = Array.isArray(valToBeSet)
          ? valToBeSet.map(it => it.split(',').map(val => Number(val)))
          : [valToBeSet.split(',').map(val => Number(val))]
        break
      case 'array|string':
        valToBeSet = valToBeSet.split(',')
        valToBeSet = valToBeSet.map(val => String(val))
        break
      case 'arrays|array|string':
        valToBeSet = Array.isArray(valToBeSet)
          ? valToBeSet.map(it => it.split(',').map(val => String(val)))
          : [valToBeSet.split(',').map(val => String(val))]
        break
      default:
    }

    if (path) {
      const keyPath = path.split('.')
      targetKey = keyPath.pop()
      keyPath.forEach(subPath => {
        that = that == null ? undefined : that[subPath]
      })
    }
    if (that == null) {
      console.warn(`[url-mapper-vue] 无法根据路径 "${path}" 找到目标数据，已跳过 url 参数 "${key}"`)
      return
    }
    that[targetKey] = valToBeSet
  })
}
