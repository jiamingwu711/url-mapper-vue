# url-mapper-vue
A tool that you can easily map the url query parameter reactively(optional) to the data of the vue component.



## Install

```shell
npm install url-mapper-vue --save
```



## How to use

### vue directives
you can use it in a DOM with a v-model, and this is reactively for both url params and data of component.

First:

```javascript
import { UrlMapperDirective } from 'url-mapper-vue'
Vue.use(UrlMapperDirective)
```

Desc:

v-url-map={url, type, value, callback}

- url (required):  url params name 
- type (required): indicate the value type of component data, these types are supported:
  -  boolean
  -  string
  -  number
  -  array|number
  -  array|string
- value (required) : vue component data
- callback (optional): the method name of component, will be called after setting the url parameter to the component's data value.

Example:

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



### vue plugins

First:

```javascript
import { UrlMapperPlugin } from 'url-mapper-vue'

Vue.use(UrlMapperPlugin)
```

It provides 3 method to map url: 

- $setDataFromUrl

  - map url params to component data.

    Arguments: { [key]: { path: [data path], type: [type] } }

    - key: url params name 
    - data path: to access the value of vue component data, for example: this.form.name is 'form.name'.
    - type: indicate the value type of component data, these types are supported: boolean, string, number, array|number, array|string

- $setUrlParams

  - map data to url params.

    Arguments: js Object.

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

