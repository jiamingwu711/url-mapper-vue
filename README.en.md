[中文](./README.md)

# url-mapper-vue
A tool directive that can bind the data property of a Vue component with URL parameters bidirectionally. It is compatible with both Vue2 and Vue3.

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

### vue 插件

安装:

```javascript
import { UrlMapperPlugin } from 'url-mapper-vue'

Vue.use(UrlMapperPlugin)
``` 

插件中提供了三个方法进行 url 映射:

- $setDataFromUrl

  - 将 url 参数值写入到组件 data 中。
  参数（arguments）: { [key]: { path: [data path], type: [type] } }
    - key: url 参数名称
    - data path: data 属性的路径，例如data.form.age, 则是 'form.age'.
    - type: 组件data属性的值类型

- $setUrlParams

- 将 data 映射到 url 参数上。
  参数 (arguments): js 对象.

- $clearUrlParams
  - 清除 url 参数.


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

