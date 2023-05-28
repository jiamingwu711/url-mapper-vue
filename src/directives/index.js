import UrlMap from './url-map'

export default {
  install (Vue) {
    Vue.directive('url-map', UrlMap)
  }
}
