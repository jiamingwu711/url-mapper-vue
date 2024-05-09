

const { createApp, ref } = Vue
import { UrlMapperDirective, UrlMapperPlugin } from '../../src/index.js'
// import { UrlMapperDirective, UrlMapperPlugin } from '../../lib/index.js'

const app = createApp({
  setup() {

    const modelRef = ref({
      input: '',
      radio: '',
      time: 1183135260000,
      multiSelect: []
    })

    function reset(){
      modelRef.value = {
        input: '',
        radio: '',
        time: 1183135260000,
        multiSelect: []
      }
    }
    
    return {
      reset,
      options: [
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
        }],
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
    clearUrl() {
      this.$clearUrlParams()
    },
    ready() {
      console.log(`ready value: ${JSON.stringify(this.model)}`)
    },
    clear() {
      this.reset()
    }
  }
})

app.use(UrlMapperDirective)
app.use(UrlMapperPlugin)
app.use(naive)
app.mount("#app");