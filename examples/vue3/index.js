

const { createApp, ref } = Vue
import { UrlMapperDirective, UrlMapperPlugin } from '../../src/index.js'

// Vue.use(UrlMapperDirective)
// Vue.use(UrlMapperPlugin)

// const { useMessage } = naive

const app = createApp({
  setup() {
    const modelRef = ref({
      age: '',
      radio: '',
      time: ''
    })
    
    return {
      // formRef,
      model: modelRef,
      songs: [
        {
          value: "Rock'n'Roll Star",
          label: "Rock'n'Roll Star"
        },
        {
          value: 'Shakermaker',
          label: 'Shakermaker'
        },
        {
          value: 'Up in the Sky',
          label: 'Up in the Sky'
        },
      ].map((s) => {
        s.value = s.value.toLowerCase()
        return s
      })
    }
  },
  methods: {
    show () {
      this.visible = true;
    }
  }
})

app.use(UrlMapperDirective)
app.use(UrlMapperPlugin)
app.use(naive)
app.mount("#app");