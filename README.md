[English](./README.en.md)

# url-mapper-vue
一个可以将 vue 组件的 data 属性与 url参数 双向绑定的工具 directives，适用于 vue2 和 vue3 。

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

