
import { clearUrlParams, setUrlParams, setDataFromUrl } from '../core/index'


function compareVersion(v1, v2) {
  let arr1 = v1.split('.').map(Number);
  let arr2 = v2.split('.').map(Number);

  for (let i = 0; i < arr1.length || i < arr2.length; i++) {
    let part1 = arr1[i] || 0;
    let part2 = arr2[i] || 0;

    if (part1 > part2) {
      return 1;
    } else if (part1 < part2) {
      return -1;
    }
  }

  return 0;
}

/**
 * 判断传入 install 的是否为 vue3 的 app。
 * 优先使用版本号，缺失时回退到判断 app.config.globalProperties 是否存在。
 */
function isVue3 (Vue) {
  if (Vue && typeof Vue.version === 'string') {
    return compareVersion(Vue.version, '3') >= 0
  }
  return !!(Vue && Vue.config && Vue.config.globalProperties)
}

export default {
  install: (Vue) => {
    if (isVue3(Vue)) {
      Vue.config.globalProperties.$clearUrlParams = clearUrlParams
      Vue.config.globalProperties.$setDataFromUrl = setDataFromUrl
      Vue.config.globalProperties.$setUrlParams = setUrlParams
    } else {
      Vue.prototype.$clearUrlParams = clearUrlParams
      Vue.prototype.$setDataFromUrl = setDataFromUrl
      Vue.prototype.$setUrlParams = setUrlParams
    }
  }
}
