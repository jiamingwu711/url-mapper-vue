[English](./README.en.md)

# url-mapper-vue
提供了 vue 指令（directives）和方法，可以将 url 参数与 vue 组件的 data 属性相互绑定, 适用于 vue2、vue3 。

## 安装

```shell
npm install url-mapper-vue --save
```

## 使用

第一步、注册指令

```javascript
import { UrlMapperDirective } from 'url-mapper-vue'
Vue.use(UrlMapperDirective)
```

### 指令 v-url-map（vue directives）
在有 v-model 的组件节点上使用，例如表单组件中。

组件定义:
v-url-map={url, type, value, callback}

- url (required):  url 参数变量名称
- type (required): 组件data属性的值类型，支持以下几种类型:
  -  boolean 布尔
  -  string 字符串
  -  number 数值
  -  array|number number数组
  -  array|string 字符串数组
  -  arrays|array|number 二维数字数组
  -  arrays|array|string 二维字符串数组
- value (required) : vue 组件的 data 属性，例如 data.form.age，则为 form.age (vue2)。(由于 vue3 不支持 expression 访问，需要写成字符串形式 'form.age')。
- callback (optional): 组件 methods 的方法回调，当初始化完成之后（初始化时会将页面中 url 参数的值映射到组件 data 中）会调用。

使用案例 (vue2):
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

使用案例 (vue3):

vue3 中指令无法通过表达式获取数据路径，`value` 必须写成字符串形式的路径（支持多级，如 `'extra.deep.text'`；`setup` 中返回的 `ref` 会被自动解包）。
只有数据真正变化时才会更新 url；组件卸载后会自动清理内部状态。

```
<script>
import { ref } from 'vue'
export default {
  setup () {
    const model = ref({ input: '', checkbox: [] })
    const ready = () => console.log('ready', model.value)
    // callback 指定的方法需要在 setup 中返回
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

### hash 路由模式

使用 hash 路由（如 vue-router 的 `createWebHashHistory()` / `mode: 'hash'`）时无需任何额外配置，会自动识别并把参数读写在 hash 内的 `?` 之后，路由部分保持不变。`v-url-map` 指令和 `$setDataFromUrl`、`$setUrlParams`、`$clearUrlParams` 三个方法都适用。

识别规则：`location.hash` 以 `#/`、`#!/` 或 `#?` 开头，即视为 hash 路由模式；其它情况（如 `#section`、`#faq?section-2` 这类普通锚点，即使锚点里含 `?`）都不算，仍然读写 `?` 在 hash 之前的普通参数，锚点原样保留。

```
# 普通模式
http://host/page?name=foo#section

# hash 路由模式
http://host/#/list?name=foo
```

使用方式与普通模式完全一致：

```
<n-input
  v-model:value="model.input"
  v-url-map="{ url: 'input', type: 'string', value: 'model.input' }" />
```

- 访问 `http://host/#/list?input=hello`，`model.input` 会被赋值为 `hello`。
- 修改输入框后，地址变为 `http://host/#/list?input=hello%20world`，而不是 `http://host/?input=...#/list`。
- `$clearUrlParams()` 在 hash 模式下只清除 hash 内的参数，保留 `#/list`。

注意：

- 参数通过 `history.pushState` 写入，不会触发 `hashchange`，vue-router 的 `route.query` 不会包含这些参数。使用 `router.push` 跳转时如需保留参数，请自行带上 `query`。
- hash 路由模式下，位于 hash 之前的参数（如 `http://host/?a=1#/list`）不会被读取，也不会被修改。
- 模式是在每次读写时根据当前 `location.hash` 判断的。如果页面地址完全没有 hash（如 `http://host/`），会按普通模式写入；vue-router 的 hash 模式在初始化时会自动补上 `#/`，一般不受影响。

### vue 插件

安装:

```javascript
import { UrlMapperPlugin } from 'url-mapper-vue'

Vue.use(UrlMapperPlugin)
```

插件中提供了三个方法做 url 映射:

- $setDataFromUrl

  - 将 url 参数值写入到组件 data 中.
    入参（arguments）: { [key]: { path: [data path], type: [type] } }

    - key: url 参数名称
    - data path: data 属性的路径，例如data.form.age, 则是 'form.age'.
    - type: 组件data属性的值类型

- $setUrlParams

  - 将 data 映射到 url 参数上。

    入参 (arguments): js 对象.

- $clearUrlParams

  - 清除 url 参数.



案例:

**$setDataFromUrl**

```javascript
...
const config = {
  name: { path: 'form.name', type: 'string' },
  region: { path: 'form.region', type: 'string' },
  date1: { path: 'form.date1', type: 'array|string' },
  type: { path: 'form.type', type: 'array|number' },
  desc: { path: 'form.desc', type: 'string' }
}
this.$setDataFromUrl(config) // map url params to component data 
...
```

**$setUrlParams**

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

```javascript
reset() {
	// ...
	this.$clearUrlParams() // clear url params
}
```

