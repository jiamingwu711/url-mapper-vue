import { UrlMapperDirective, UrlMapperPlugin } from '../src/index.js'
Vue.use(UrlMapperDirective)
Vue.use(UrlMapperPlugin)

new Vue({
  el: '#app',
  data: function() {
    return { 
      visible: false,
      message: 'hello',
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
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
      console.log('submit!');
    },
    clear() {
      this.form =  {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
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