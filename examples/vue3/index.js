/* global Vue, naive */
import { UrlMapperDirective, UrlMapperPlugin } from '../../src/index.js'
const { createApp, ref, getCurrentInstance } = Vue
// import { UrlMapperDirective, UrlMapperPlugin } from '../../lib/index.js'
const options = [
  {
    label: "Everybody's Got Something to Hide Except Me and My Monkey",
    value: 'song0',
    disabled: true
  },
  {
    label: 'Drive My Car',
    value: 'song1'
  },
  {
    label: 'Norwegian Wood',
    value: 'song2'
  },
  {
    label: "You Won't See",
    value: 'song3',
    disabled: true
  },
  {
    label: 'Nowhere Man',
    value: 'song4'
  },
  {
    label: 'Think For Yourself',
    value: 'song5'
  },
  {
    label: 'The Word',
    value: 'song6'
  },
  {
    label: 'Michelle',
    value: 'song7',
    disabled: true
  },
  {
    label: 'What goes on',
    value: 'song8'
  }]
const app = createApp({
  setup () {
    const instance = getCurrentInstance()

    const createModel = () => ({
      input: '',
      radio: '',
      time: 1183135260000,
      multiSelect: [],
      checkbox: [],
      checkbox2: [],
      switch: false
    })

    const model = ref(createModel())
    // 多级路径示例：v-url-map 的 value 为 'extra.deep.text'
    const extra = ref({ deep: { text: '' } })
    const result = ref('')

    // 供 v-url-map 的 callback 配置使用，需要在 setup 中返回
    function ready () {
      console.log(`ready value: ${JSON.stringify(model.value)}`)
    }

    function submit () {
      result.value = JSON.stringify(model.value)
    }

    function clearUrl () {
      instance.proxy.$clearUrlParams()
    }

    function clear () {
      model.value = createModel()
    }

    return {
      options,
      model,
      extra,
      result,
      ready,
      submit,
      clearUrl,
      clear,
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
        }
      ].map((s) => {
        s.value = s.value.toLowerCase()
        return s
      })
    }
  }
})

app.use(UrlMapperDirective)
app.use(UrlMapperPlugin)
app.use(naive)
app.mount('#app')
