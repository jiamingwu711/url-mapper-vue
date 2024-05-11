import { UrlMapperDirective, UrlMapperPlugin } from '../../src/index.js'
// import { UrlMapperDirective, UrlMapperPlugin } from '../../lib/index.js'

Vue.use(UrlMapperDirective)
Vue.use(UrlMapperPlugin)

new Vue({
  el: '#app',
  data: function() {
    return { 
      visible: false,
      result: '',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        type2: [],
        resource: '',
        desc: ''
      },
      form2: {
        name2: '',
        region2: '',
      }
     }
  },
  created() {
    console.log(`init value: ${JSON.stringify(this.form)}`)
  },
  methods: {
    onSubmit() {
      this.result = JSON.stringify(this.form)
    },
    clear() {
      this.form =  {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        type2: [],
        resource: '',
        desc: ''
      }
    },
    ready() {
      console.log(`ready value: ${JSON.stringify(this.form)}`)
    },
    onSubmit2() {
      this.$setUrlParams(this.form2)
    },
    clear2() {
      const config = {
        name2: { path: 'form2.name2', type: 'string' },
        region2: { path: 'form2.region2', type: 'string' },
      }
      this.$setDataFromUrl(config)
    }
  }
})