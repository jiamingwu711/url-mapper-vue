[中文](./README.md)

# url-mapper-vue
Provides vue directives and methods that allow URL parameters to be bound bidirectionally with the data properties of a Vue component, compatible with Vue2 and Vue3.

## Installation

```shell
npm install url-mapper-vue --save
```

## Usage
First step, register the directive

``` javascript
import { UrlMapperDirective } from 'url-mapper-vue'
Vue.use(UrlMapperDirective)
```

### Directive v-url-map (vue directives)
Use on component nodes with v-model, such as in form components.

Component definition:
v-url-map={url, type, value, callback}

- url (required): URL parameter variable name
- type (required): The value type of the component data property, supporting the following types:
  - boolean
  - string
  - number
  - array|number: array of numbers
  - array|string: array of strings
  - arrays|array|number: two-dimensional array of numbers
  - arrays|array|string: two-dimensional array of strings
- value (required): The data property of the Vue component, for example, if it is data.form.age, then it is form.age (vue2). (Vue3 does not support expression access, it needs to be written as 'form.age').
- callback (optional): The method callback of component methods, which will be called after initialization is completed (the value of the URL parameter in the page will be mapped to the component data during initialization).

example (vue2):
```
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="活动名称">
        <el-input
          v-url-map="{url:'name',type:'string', value:form.name}"
          v-model="form.name">
        </el-input>
      </el-form-item>

      <el-form-item label="活动区域">
        <el-select v-model="form.region"
        placeholder="请选择活动区域"
        v-url-map="{url:'region',type:'string', value:form.region}"
        >
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="活动时间">
        <el-date-picker
          v-url-map="{url:'date1',type:'array|string', value:form.date1}"
          v-model="form.date1"
          value-format="yyyy-MM-dd HH-mm-ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
    </el-form>
```

example (vue3):

In vue3 the directive cannot read the data path from the expression, so `value` must be a string path (multi-level paths such as `'extra.deep.text'` are supported; refs returned from `setup` are unwrapped automatically).
The url is only updated when the data really changes, and internal state is cleaned up when the component is unmounted.

```
<script>
import { ref } from 'vue'
export default {
  setup () {
    const model = ref({ input: '', checkbox: [] })
    const ready = () => console.log('ready', model.value)
    // the method used by `callback` must be returned from setup
    return { model, ready }
  }
}
</script>

<template>
  <n-input
    v-model:value="model.input"
    v-url-map="{ url: 'input', type: 'string', value: 'model.input', callback: 'ready' }" />
  <n-checkbox-group
    v-model:value="model.checkbox"
    v-url-map="{ url: 'checkbox', type: 'array|string', value: 'model.checkbox' }" />
</template>
```

### Hash router mode

With a hash router (e.g. vue-router `createWebHashHistory()` / `mode: 'hash'`) no extra configuration is needed. It is detected automatically, and params are read from and written after the `?` inside the hash, leaving the route part untouched. It works with the `v-url-map` directive and with `$setDataFromUrl`, `$setUrlParams` and `$clearUrlParams`.

Detection: hash mode is used when `location.hash` starts with `#/`, `#!/` or `#?`. Anything else (plain anchors such as `#section`, or `#faq?section-2` even though it contains a `?`) is not a hash route: the normal query before the hash is read and written, and the anchor is kept untouched.

```
# normal mode
http://host/page?name=foo#section

# hash router mode
http://host/#/list?name=foo
```

Usage is exactly the same as in normal mode:

```
<n-input
  v-model:value="model.input"
  v-url-map="{ url: 'input', type: 'string', value: 'model.input' }" />
```

- Visiting `http://host/#/list?input=hello` sets `model.input` to `hello`.
- After editing the input the address becomes `http://host/#/list?input=hello%20world`, not `http://host/?input=...#/list`.
- In hash mode `$clearUrlParams()` only clears the params inside the hash and keeps `#/list`.

Notes:

- Params are written with `history.pushState`, which does not fire `hashchange`, so vue-router's `route.query` will not contain them. If you need to keep them when calling `router.push`, pass `query` yourself.
- In hash mode, params placed before the hash (e.g. `http://host/?a=1#/list`) are neither read nor modified.
- The mode is decided on every read/write from the current `location.hash`. If the address has no hash at all (e.g. `http://host/`), normal mode is used; vue-router's hash mode adds `#/` on initialisation, so this is usually not an issue.

### vue 插件

安装:

```javascript
import { UrlMapperPlugin } from 'url-mapper-vue'

Vue.use(UrlMapperPlugin)
``` 

methods:

- $setDataFromUrl

  - url params to component data。
  参数（arguments）: { [key]: { path: [data path], type: [type] } }
    - key: url 参数名称
    - data path: data 属性的路径，例如data.form.age, 则是 'form.age'.
    - type: 组件data属性的值类型

- $setUrlParams

- component data to url params。
  参数 (arguments): js 对象.

- $clearUrlParams
  - clear url params.


Example:

**$setDataFromUrl**

In vue component:

```javascript
...
const config = {
  name: { path: 'form.name', type: 'string' },
  region: { path: 'form.region', type: 'string' },
  date1: { path: 'form.date1', type: 'array|string' },
  type: { path: 'form.type', type: 'array|number' },
  desc: { path: 'form.desc', type: 'string' }
}
this.$setDataFromUrl(config) // map url params to component data.
...
```

**$setUrlParams**

In vue component:

```javascript

onSubmit () {
	// do sth...
  const params = {
    name: 'xxx',
    region: 'japan',
    type: [1,2,3],
    ...
  }
	this.$setUrlParams(params) // map data to url params.
},
```


**$clearUrlParams**

In vue component:

```javascript
reset() {
	// ...
	this.$clearUrlParams() // clear url params
}
```

