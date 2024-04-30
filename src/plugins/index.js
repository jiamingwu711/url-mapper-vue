
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

export default {
  install: (Vue) => {
    if(compareVersion(Vue.version, '3') >= 0){
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
