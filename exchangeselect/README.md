### 运行
下载组件到本地后执行命令运行
```
npm run dev
```

###  组件效果

工程项目中有时候会遇到不同维度可以相互作为父子级联进行选择的情况，以一个购物中心（天街）为例：

一个购物中心下有很多门店，不同的门店属于不同的业态，比如餐饮业，服装业等等；所以当统计该购物中心的客流数据时就有了两种情况：

在进行业务开发过程中，发现多处相同的交互形式，考虑将其做成组件，来节省开发时间，加快开发进度。客流运营中客流数据模块，需要显示门店的客流数据，门店是挂在区域树下，由于客流数据需要提供尽可能大的页面来展示客流的数据，所以选择门店不能使用左侧边栏的方式进行展示，需要使用下拉框的形式，因此组件的整体效果是下拉出现门店，同时下拉内容中还可以下拉选择区域，选择区域后展示该区域下的门店信息

![效果图](https://git.hikvision.com.cn/users/yuanyuan10/repos/selecttree/browse/src/views/selectTree/selectTree.gif?at=b030cb140e3f7072a3945f1d1289847c7d13cf60&raw)

### 组件开发流程

#### 基本结构

组件依赖HUI，所以需要在项目中引用HUI`npm install hui`

门店下拉使用HUI的`dropdown`组件，自带下拉效果，且选择门店后可以直接调用`dropdown`的`hide()`方法将其收起隐藏，内部的区域树的下拉使用div加上下拉效果来实现

注意：区域树为什么不使用`dropdown`来实现?因为`dropdown`在点击外部其他区域时会收起，如果区域树下拉也使用`dropdown`的话，当在区域树的下拉页面进行操作时会触发门店下拉那个`dropdown`的点击外部区域收起事件，因为`dropdown`都是`body`元素的子元素，多个`dropdown`都是平级的兄弟元素，所以这里使用一个`dropdown`一个带有`transition`效果的`div`来实现整体布局，页面布局代码如下

```vue
<div class="select-tree">
    <el-dropdown>
      <!--显示已选门店-->
      <div>全部门店</div>
      <el-dropdown-menu slot="dropdown">
        <div class="first-dropdown-ctn">
          <!--显示已选区域-->
          <div class="region-name">全部区域</div>
          <!--区域下拉内容-->
          <div class="transition-wrap">
            <el-collapse-transition>
              <div>
                <div class="dropmenu-tree">
                  <!--下拉区域搜索-->
                  <el-input></el-input>
                  <!--下拉区域树-->
                  <div>
                    <el-tree></el-tree>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
          <!--下拉门店搜索-->
          <div>
            <el-input></el-input>
          </div>
          <!--下拉门店列表-->
          <div class="mall-list-wrap">
            <el-scrollbar class="el-scrollbar-mall" tag="div" wrap-class="el-mall-scrollbar__wrap">
              <div class="mall-item">门店1</div>
              <div class="mall-item">门店2</div>
            </el-scrollbar>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
	</div>
```

到此为止，组件的整体结构完成，下面要做的是:

* 将组件上要显示的文案定义为变量，通过页面交互来显示相应的值;
* 同时为了考虑极端情况下门店或者区域名称可能会过长需要使用文本溢出`...`处理;
* 由于该组件式基于HUI库的，在引用到的标签需要加上对应的属性和方法，完成定义属性，变量值及方法
* 添加样式文件，优化组件的样式
* 区域和门店的列表通过请求的方式获取并渲染出来

完成后的代码如下:

```VUE
<div class="select-tree">
    <el-dropdown 
      trigger="click" 
      ref="selectDropDownRef" 
      class="el-dropdown-diy" 
      menu-align="start"
      @visible-change="hideAll">
      <!--显示已选门店-->
      <div class="space-between">
        <overflow :title="currentMallNode" :length="12" placement="right"></overflow>
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown" class="select-tree-dropmenu">
        <div class="first-dropdown-ctn">
          <!--显示已选区域-->
          <div style="position: relative;" class="space-between region-name" @click="isShowTree">
            <overflow :title="currentTreeNode" :length="12"></overflow>
            <div><i class="el-icon-arrow-down"></i></div>
          </div>
          <!--区域下拉内容-->
          <div class="transition-wrap">
            <el-collapse-transition>
              <div v-show="showTree">
                <div class="dropmenu-tree">
                  <!--下拉区域搜索-->
                  <el-input 
                    class="tree-search-input" 
                    placeholder="请输入区域名查询" 
                    icon="h-icon-search" 
                    clearable 
                    v-model="searchTreeVal" 
                    :on-icon-click="getTreeData" 
                    @keyup.enter.native="getTreeData">
                  </el-input>
                  <!--下拉区域树-->
                  <div style="height: 290px;">
                    <el-tree 
                      :data="treeData"
                      simple-data
                      parent-key="parentUuid"
                      :props="defaultProps"
                      node-key="uuid"
                      :default-expanded-keys="defaultExpandedRoot"
                      :current-node-key="currentNodeKey"
                      @node-click="handleNodeClick">
                    </el-tree>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
          <!--下拉门店搜索-->
          <div class="input-center">
            <el-input 
              v-model="searchMallVal" 
              icon="h-icon-search" 
              clearable
              :on-icon-click="searchMallList" 
              :clear-icon-click="clearSearch"
              @keyup.enter.native="searchMallList"
              class="mall-search-input" 
              placeholder="请输入门店名查询">
            </el-input>
          </div>
          <!--下拉门店列表-->
          <div class="mall-list-wrap">
            <el-scrollbar class="el-scrollbar-mall" tag="div" wrap-class="el-mall-scrollbar__wrap" @on-scrolling-y="scrollMore">
              <div :class="{'mall-item': true, active:index===mallActiveIndex}" v-for="(item, index) in mallList" :key="index" @click="clickMall(item, index)">
                <overflow style="padding-left: 16px;" :title="item.name" :length="12" placement="right"></overflow>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
	</div>
```

其中overflow是用来处理超长文本溢出显示`...`，多出的部分当鼠标悬浮上去后以`tooltip`的形式显示，通过传入的`title`内容和要显示的最小长度`length`判断是显示全部文案还是显示`tooltip`

#### 功能开发

##### 首次加载

首次`mounted`加载成功获取区域列表`getTreeData`，获取到区域列表需要做的事：

* 渲染区域树
* 默认选中区域根节点并向外抛出区域信息`treeNodeObj`，以防外部需要使用
* 获取区域根节点下的门店列表数据`getMallList`
* 渲染门店列表
* 默认选中第一个门店并向外抛出门店信息`mallNodeObj`（此时外部拿到门店信息做下一步操作）

```js
getTreeData () {
      proxy.getAccountRegionTree({
        searchName: this.searchTreeVal
      }).then(res => {
        ......
        // 寻找根节点,默认选中根节点
        let tempUuid = []
        for (let item of this.treeData) {
          tempUuid.push(item.uuid)
          if (item.parentUuid === '') {
            this.treeNodeObj = item
            this.currentTreeKey = item.uuid
            this.currentTreelabel = item.name
          }
        }
        ......
      })
    }
```

```js
getMallList (){
  proxy.getShopList(params).then(res=>{
    ......
    this.mallList = res.data && res.data.length ? res.data : []
    this.mallList.unshift({
      name: `${this.treeNodeObj.name}下全部门店`,
      orgUuid: this.treeNodeObj.uuid,
      type: this.treeNodeObj.type     // 树节点type->区域,type->2门店
    })
    this.mallNodeObj = res.data[0]
    this.currentMallNode = res.data[0].name
    ......
  })
}
```

##### 手动选择区域和小区

手动选择区域节点`handleNodeClick`时将已选的节点重新赋值，同时获取当前区域下的门店同时默认选中新门店列表的第一个数据并向外抛出门店信息

```js
handleNodeClick (data) {
  this.treeNodeObj = data
  this.currentTreelabel = data.name
}
```

手动选择门店节点`clickMall`时抛出选中的门店信息

```js
clickMall (item, index) {
  this.mallNodeObj = item
  this.currentMallLabel = item.name
}
```

这里对已选的区域树节点`treeNodeObj`和门店节点进行`watch`监听，当发生变化时就向外抛区域信息并重新获取门店列表

```js
watch: {
  treeNodeObj (nVal, oVal) {
    this.$emit('getTreeObj', nVal)
    this.getMallList()
  },
  mallNodeObj (nVal, oVal) {
    this.$emit('getMallObj', nVal)
  }
}
```

到此为止，基本功能都实现了，但是对于极端情况需要进行一些优化处理和扩展功能开发。

##### 数据

区域树和门店列表的主要数据格式和字段如下：

```
//区域树
treeData: [
  {
    name: 'xxx',
    uuid: 'dfsdf',
    parentUuid: 'sdfsdf'
    ......
  }
]

//门店列表
mallList: [
  {
    name: '门店1',
    orgUuid: 'sdfsdferf'
  }
]
```

#### 功能扩展

1、首次加载的时候，门店是默认选中的，对于不同的需求，可能不需要默认选中第一个门店，所以这里加一个是否默认选中第一个的标志符`defaultShow`，用来判断首次加载的显示，默认`true`

2、区域下全部门店这个选项也是可配的，用变量`hasAllMall`判断

3、下拉列表如果很多是一次性加载还是滚动加载，用`hasScrollMore`判断

```js
props: {
  defaultShow: {
    type: Boolean,
    default: true
  },
  hasAllMall: {
    type: Boolean,
      default: true
  },
  hasScrollMore: {
    type: Boolean,
      default: true
  }
}
```

相应的判断加入其中

```js
getMallList (){
  proxy.getShopList(params).then(res=>{
    ......
    this.mallList = res.data && res.data.length ? res.data : []
    //是否显示全部门店
    if (this.hasAllMall) {
      this.mallList.unshift({
        name: `${this.treeNodeObj.name}下全部门店`,
        orgUuid: this.treeNodeObj.uuid,
        type: this.treeNodeObj.type     // 树节点type->区域,type->2门店
      })
    }
     // 是否默认选中
    if (this.defaultShow) {
      this.mallNodeObj = res.data[0]
      this.currentMallLabel = res.data[0].name
    }
    ......
  })
}
```

滚动条事件中对滚动加载进行判断

```js
scrollMore (scrollTop) {
  if (this.hasScrollMore && scrollTop.percentY === 1) {
  this.isMore = true
  this.getMallList()
  }
}
```

#### 特殊处理

* 考虑到实际中可能会出现未选门店或者区域的情况，因此需要对未选择区域和门店的状态做单独处理，样式显示为`placeholder`样式--文案显示请选择，颜色`#ccc`；
* 后台接口返回的数据可能为空，需要对获取数据后渲染的下拉列表做暂无数据处理
* 为方便以后扩展，可以将获取数据的接口作为可选项

### 组件API

1、在需要使用的页面中引入该组件

`import selectTree from '你的路径/selectTree'`

（注意这里需要首先确保项目中已经引入了`HUI`）

2、页面中插入标签

`<select-tree ：defaultShow="true" :hasAllMall="true" :hasScrollMore="true" @getMallObj="getMallObjV"></select-tree>`

这里默认项（默认项可不写）有：首次加载默认显示第一个门店，且有当前区域下全部门店选项，门店列表可以滚动加载。在外部组件中通过`getMallObjV`（方法名自定义）获取点击的门店信息，进行下一步业务开发。

### 展望

针对已完成的组件功能，可以对更多项进行配置，如：

1、这里区域树和门店列表数据格式都是统一的格式和字段，例如门店列表数据

```
[{
  name: '门店1',
  orgUuid: '780661eaa2c240f6a60ef67b103d4ab7'
}]
```

不同的应用场景获取到的字段名和数据格式都不一样，后期可以对此项进行配置

2、样式也可以进行进一步优化，比如选中的样式，颜色，字体，以及暂无数据的显示等等。