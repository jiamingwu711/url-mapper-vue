
function parseUrlParams (url) {
  const params = {}
  const searchParams = new URLSearchParams(url.split('?')[1])
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  return params
}

function replaceQueryState (query) {
  const url = new URL(window.location.href)

  for (const [key, value] of Object.entries(query)) {
    if (!value || !value.length) {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
  }

  history.pushState({}, '', url)
}

function decodeUrl (url, count = 0) {
  if (decodeURIComponent(url) === url || count > 20) {
    return url
  }
  return decodeUrl(decodeURIComponent(url), ++count)
}

export function clearUrlParams () {
  const newUrl = `${window.location.pathname}${window.location.hash}`
  window.history.replaceState('', '', newUrl)
}

/**
 * map data to url params 
 * @param {*} params Object
 */
export function setUrlParams (params) {
  const oriQuery = parseUrlParams(window.location.href)
  const _params = Object.assign({}, oriQuery, params)
  Object.keys(_params).forEach(key => {
    if ([null, undefined, ''].includes(_params[key]) || (Array.isArray(_params[key]) && !_params[key].length)) {
      // delete _params[key]
    } else if (_params[key]) {
      let val = _params[key]
      if (/^http/.test(_params[key])) {
        val = encodeURIComponent(_params[key])
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
  const query = parseUrlParams(window.location.href)
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
        valToBeSet = Boolean(valToBeSet)
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
        that = this[subPath]
      })
    }
    that[targetKey] = valToBeSet
  })
}
