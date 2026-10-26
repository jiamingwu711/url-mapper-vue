import UrlMap from './url-map'

export default {
  // Vue 2: Vue.use(plugin) 传入 Vue 构造器；Vue 3: app.use(plugin) 传入 app，两者都提供 directive 方法
  install (Vue) {
    if (!Vue || typeof Vue.directive !== 'function') {
      throw Error('[url-mapper-vue] UrlMapperDirective 需要通过 Vue.use(...) / app.use(...) 安装')
    }
    Vue.directive('url-map', UrlMap)
  }
}
