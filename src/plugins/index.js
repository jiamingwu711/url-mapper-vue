
import { clearUrlParams, setUrlParams, setDataFromUrl } from '../core/index'

export default {
  install: (Vue) => {
    Vue.prototype.$clearUrlParams = clearUrlParams
    Vue.prototype.$setDataFromUrl = setDataFromUrl
    Vue.prototype.$setUrlParams = setUrlParams
  }
}
