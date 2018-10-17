### 运行
下载组件到本地后执行命令
```
npm run dev
```

### 组件效果

组件开发之前首先需要了解组件所要满足的功能，需求是一个下拉组件，下拉内容中带有搜索框以及数据列表。选中后下拉收起，整体和`HUI`的下拉组件`el-select`比较相似，不同的是下拉内容中带有搜索框，可以进行后端搜索，因此考虑对已有的`el-select`进行二次封装开发，使其满足要求。根据需求要完成的效果图如下：

图1:多选

![](https://github.com/yy709593266/vueComponents/blob/master/searchselect/src/views/searchSelect/searchSelect1.gif?raw=true)

图2:单选

![](https://github.com/yy709593266/vueComponents/blob/master/searchselect/src/views/searchSelect/searchSelect2.gif?raw=true)

选中项会有字体颜色和背景颜色标识，同时相应项后面会有勾选状态，显示栏中有选中的项，大于一项的会显示数量值。

### 开发流程

#### 基本布局

虽然组件和`select`的功能相似，但是整体布局还是要重新规划，这里使用`HUI`的下拉组件`dropdown`在下拉内容区加入搜索框以及列表的渲染，基本页面布局如下：

```vue
<template>
  <div class="multi-search-select">
    <!--下拉-->
    <el-dropdown class="multi-el-dropdown" trigger="click">
      <div>
        <!--显示框内容-->
        <div class="left-ctn">
          <!--显示框内选中第一个选项内容-->
          <div></div>
          <!--显示框内多选个数显示-->
          <span></span>
        </div>
        <!--显示框下拉箭头-->
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div>
          <!--下拉搜索框-->
          <el-input></el-input>
          <!--下拉列表内容-->
          <div class="ctn-wrap">
            <el-scrollbar wrap-class="el-ctn-wrap-scrollbar__wrap" @on-scrolling-y="scrollMore">
              <div>
                <span>品牌1</span>
                <img src="/static/img/checked.png" alt="checked">
              </div>
              <div>
                <span>品牌2</span>
                <img src="/static/img/checked.png" alt="checked">
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
```

布局搭好了下面要做的就是

* 视觉调整
* 标签属性添加
* 定义要用的变量和方法

完成后的结果如下：

```vue
<template>
  <div class="multi-search-select">
    <!--下拉-->
    <el-dropdown class="multi-el-dropdown" trigger="click">
      <div class="right-select copy-select-style">
        <!--显示框内容-->
        <div class="left-ctn">
          <!--显示框内选中第一个选项内容-->
          <overflow 
            class="copy-opt-style"
            v-if="choseDataMul.length>0"
            @delBtnHandle="delBtnHandleV" 
            :hasDelBtn="choseDataMul.length?true:false" 
            :title="choseDataMul[0].name" 
            length="12" 
            placement="top">
          </overflow>
          <!--显示框内多选个数显示-->
          <span :class="{'copy-opt-style':choseDataMul.length>1?true:false}">{{choseDataMul.length>1?`+${choseDataMul.length-1}`:''}}</span>
        </div>
        <!--显示框下拉箭头-->
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div class="multi-dropdown-ctn">
          <!--下拉搜索框-->
          <el-input 
            class="multi-search-input" 
            placeholder="请输入品牌名"
            icon="h-icon-search"
            clearable
            v-model="keyword" 
            :on-icon-click="searchRightList" 
            @keyup.enter.native="searchRightList"
            :clear-icon-click="clearSearch">
          </el-input>
          <!--下拉列表内容-->
          <div class="ctn-wrap">
            <el-scrollbar wrap-class="el-ctn-wrap-scrollbar__wrap" @on-scrolling-y="scrollMore">
              <div @click="choseHandle(item, index)" 
                :class="{'list-item': true, 'active': item.active}" 
                v-for="(item,index) in allRightData"
                :key="item.uuid">
                <overflow style="padding-left: 16px;" :title="item.name" :length="12" placement="right"></overflow>
                <img v-if="item.active" src="/static/img/checked.png" alt="checked">
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
```

其中：`choseDataMul`是勾选项数组；`allRightData`是通过接口返回的所有的下拉列表数据；`overflow`是对显示的`title`如果超出指定的`length`就会`...`文字溢出处理，列表的名称可能会超出显示框的长度，因此渲染品牌列表和选中第一个品牌名称都使用`overflow`进行了处理。

#### 主要功能开发

到此组件的整体样式基本满足了需求，但是组件的主要作用是业务功能的开发，主要是对数据和事件的处理。

##### 基本事件绑定

事件绑定之前，首先要知道整个组件会触发哪些事件对值进行操作

* 组件初始化需要对列表数据进行加载
* 搜索时需要重新获取新的结果数据并渲染
* 选择列表项需要进行显示和勾选同时对外抛出已选项的值
* 删除已选列表项显示项和勾选项需要重新计算，同时对外抛出的值发生改变

代码实现如下：

```js
//组件初始化需要对列表数据进行加载
getRightList () {
      let params = {
        keyword: this.keyword,
      }
      proxy.getIndustryPage(params).then(res => {
        res = res.data
        if (res.code === '200') {
          // 将搜索结果中已选中的加上active属性，表示是已选状态
          if (res.data && res.data.rows && res.data.rows.length && this.choseDataMul.length) {
            for (let item of res.data.rows) {
              for (let jtem of this.choseDataMul) {
                if (item.uuid === jtem.uuid) {
                  item.active = true
                } else {
                  item.active = false
                }
              }
            }
          }
          this.allRightData = res.data && res.data.rows && res.data.rows.length ? res.data.rows : []
          this.choseDataMul = res.data && res.data.rows && res.data.rows.length ? [res.data.rows[0]] : []
        }
      })
    }
```

因为，勾选值和删除已选值都是对已选数组`choseDataMul`进行`push`和`splice`操作，因此可以对已选数组`choseDataMul`这个变量进行监听来统一处理它的勾选状态和向外抛值操作：

```javascript
watch: {
  choseDataMul (arr) {
    //首先对所有列表进行未选中标识
    if (this.allRightData && this.allRightData.length) {
      for (let item of this.allRightData) {
        item.active = false
      }
    }
    //再对已选的进行选中标识
    if (arr.length) {
      let uuids = []
      for (let item of arr) {
        item.active = true
        uuids.push(item.uuid)
      }
      //抛出已选值数组，外部数组可以通过getChoseList方法取到
      this.$emit('getChoseList', uuids)
    } else {
      this.$emit('getChoseList', [])
    }
  }
}
```

##### 组件传值

在项目中使用到该组件主要业务需要的值只有选中的列表项数组，考虑到不同应用场景的不同可能会需要的值不一样，一般只需要传选中的`id`值即可，但是也不排除特殊情况下需要传整个选中项的所有信息或者父组件需要用到选中项的其他信息，因此这里对抛出的值有一个标识符可以用来自定义选择要`id`数组还是包含了其他信息的对象`obj`数组：

```js
props: {
  isObjData: {
    type: Boolean,
      default: false//默认抛出的是已选项id组成的数组
  }
},
watch: {
  choseDataMul (arr) {
    //首先对所有列表进行未选中标识
    ......
    //再对已选的进行选中标识
    if (arr.length) {
      ......
      //抛出已选值数组，外部数组可以通过getChoseList方法取到
      if (this.isObjData) {
        this.$emit('getChoseList', arr)
      } else {
        this.$emit('getChoseList', uuids)
      }
    } else {
      this.$emit('getChoseList', [])
    }
  }
}
```

##### 组件`API`

1、既然是仿照`select`的一个组件，自然就要考虑单选的状态，需要传入一个用来标识是单选还是多选的变量，根据不同的选择方式交互形式和显示状态也所有不同：

```javascript
props: {
  isObjData: {
    ......
  },
  isSingleChose: {
    type: Boolean,
    default: false//默认多选
  }
}
```

针对单选还是多选需要处理：

- 单选时候显示框中已选项不行删除，没有删除按钮
- 单选时下拉选中没有勾选状态
- 单选选中一个后再选另外的不是`push`数组数据应该是直接替换数组数据

```vue
<template>
  ......
  <div class="left-ctn">
    <!--显示框内选中第一个选项内容-->
    <overflow 
       :class="{'copy-opt-style':true, 'single-type':isSingleChose}"
       v-if="choseDataMul.length>0"
       @delBtnHandle="delBtnHandleV" 
       :hasDelBtn="choseDataMul.length&&!isSingleChose?true:false" 
        :title="choseDataMul[0].name" 
        :length="isSingleChose?12:6" 
        placement="top">
    </overflow>
    <!--显示框内多选个数显示-->
    <span :class="{'copy-opt-style':choseDataMul.length>1?true:false}">{{choseDataMul.length>1?`+${choseDataMul.length-1}`:''}}</span>
  </div>
  ......


  ......
  <div @click="choseHandle(item, index)" 
       :class="{'list-item': true, 'active': item.active}" 
       v-for="(item,index) in allRightData"
       :key="item.uuid">
    <overflow style="padding-left: 16px;" :title="item.name" :length="12" placement="right"></overflow>
    <img v-if="!isSingleChose&&item.active" src="/static/img/checked.png" alt="checked">
                </div>
  ......
</template>
```

```javascript
choseHandle (item, index) {
  if (this.isSingleChose) {
    // 单选
    for (let temp of this.allRightData) {
      temp.active = false
    }
    item.active = true
    this.choseDataMul = [item]
  } else {
    // 多选
    if (item.active) {
      this.choseDataMul.splice(this.choseDataMul.findIndex(temp => temp.uuid === item.uuid), 1)
    } else {
      if (this.choseDataMul && this.choseDataMul.length < 5) {
        this.choseDataMul.push(item)
      } else {
        this.$message.warning(`最多选择5个`)
      }
    }
  }
}
```

单选和多选状态如下图:

![](https://git.hikvision.com.cn/users/yuanyuan10/repos/searchselect/browse/src/views/searchSelect/%E5%AF%B9%E6%AF%94%E5%9B%BE.png?at=0f0e34f164c8891794e3cc775ea9540f4da4c7c6&raw)

2、对于多选不同应用场景下最多项也有所不同，因此可以对已选数量最大值进行配置

```js
props: {
  isObjData: {
    ......
  },
  isSingleChose: {
    ......
  },
  maxChoseNum: {
    type: Number,
    default: 5//默认最多选5项
  }
}

choseHandle (item, index) {
  if (this.isSingleChose) {
    // 单选
    ......
  } else {
    // 多选
    ......
    if (this.choseDataMul && this.choseDataMul.length < this.maxChoseNum) {
      this.choseDataMul.push(item)
    } else {
      this.$message.warning(`最多选择${this.maxChoseNum}个`)
    }
    ......
  }
}
```

3、列表中滚动条的滚动事件`scrollMore`用来滚动加载列表数据：

```javascript
scrollMore (scrollTop) {
  if (scrollTop.percentY === 1) {
    this.isMore = true
    this.getRightList()
  }
}
```

相应的获取列表数据的传参和请求结果的处理需要做进一步处理

```javascript
getRightList (isFirst) {
  let params = {
    keyword: this.keyword,
    pageSize: this.pageSize
  }
  params.pageNo = this.isMore ? ++this.pageNo : 1
  proxy.getIndustryPage(params).then(res => {
    res = res.data
    if (res.code === '200') {
      // 将已选中的active上
      ......
      // 请求结果渲染
      if (this.isMore) {
        // 加载更多
        if (res.data && res.data.rows && res.data.rows.length) {
          for (let item of res.data.rows) {
            this.allRightData.push(item)
          }
        } else {
          this.$message.warning('暂无更多数据')
        }
      } else {
        // 普通获取
        this.allRightData = res.data && res.data.rows && res.data.rows.length ? res.data.rows : []
        this.choseDataMul = res.data && res.data.rows && res.data.rows.length ? [res.data.rows[0]] : []
      }
    }
  })
}
```

这里对每次加载数量做成配置项

```javascript
props: {
  isObjData: {
    ......
  },
  isSingleChose: {
    ......
  },
  maxChoseNum: {
    ......
  },
  pageSize: {
    type: Number,
    default: 15//默认每次加载15条数据
  }
}
```

4、获取不同的列表显示的文案以及请求的接口也会有所不同，因此对空态文案显示，默认文案显示以及接口进行配置：

```javascript
props: {
  isObjData: {
    ......
  },
  isSingleChose: {
    ......
  },
  maxChoseNum: {
    ......
  },
  pageSize: {
    ......
  },
  propOptions: {
    type: Object,
    default: () => { return {} }//这里可以默认为空,或者默认为常用值
  }
}
```

##### 数据

这里下拉列表的数据格式和字段名如下：

```
allRightData: [
  {
    name: '品牌1',
    uuid: 'dsfjsdfer'
  },
  {
     name: '品牌2',
    uuid: 'dfsdfrerref'
  },
  ......
]
```



##### 特殊处理

剩下的就是对暂无数据以及未选择项时显示框的显示进行特殊处理

```vue
<template>
	......
	<div class="left-ctn">
      <overflow>.......</overflow>
      <span class="no-chose" v-else>{{propOptions.noChoseText?propOptions.noChoseText:defaultOptions.noChoseText}}</span>
      <span :class="{'copy-opt-style':choseDataMul.length>1?true:false}">{{choseDataMul.length>1?`+${choseDataMul.length-1}`:''}}</span>
  </div>
</template>
```

```vue
<template>
  ......
  <div class="ctn-wrap">
    <el-scrollbar wrap-class="el-ctn-wrap-scrollbar__wrap" @on-scrolling-y="scrollMore">
      <div @click="choseHandle(item, index)" 
           :class="{'list-item': true, 'active': item.active}" 
           v-for="(item,index) in allRightData"
           :key="item.uuid">......</div>
      <div class="no-list" v-if="allRightData.length<1">暂无数据</div>
  </el-scrollbar>
  </div>
</template>
```

### 组件使用

1、在需要使用的页面中引入该组件

`import multiSearchSelect from '你的路径/multiSearchSelect'`

（注意这里需要首先确保项目中已经引入了`HUI`）

2、页面中插入标签

`<multi-search-select @getChoseList="getChoseListV"></multi-search-select>`

这里都采用的是默认值，即默认抛出选中项的`id`数组、多选、最大勾选数为5、每次加载数量为15条。在外部组件中通过`getChoseListV`（方法名自定义）获取点击的门店信息，进行后续业务的开发。

### 展望

这里有些默认值是未使用自定义配置的，例如：

* 获取的列表数据都是通过`name`和`uuid`进行渲染和取值的，为增强组件的通用性，可以将列表所要展示和选中后需要抛出的字段进行自定义配置，类似`defaultProps`，相应的数据格式也可以进行配置
* 对于数据量较少的场景可能用不到滚动加载的功能，因此可以对是否需要滚动加载进行配置项抛出等。

























