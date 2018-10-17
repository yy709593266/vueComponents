<template>
	<div class="select-tree">
    <el-dropdown 
      trigger="click" 
      ref="selectDropDownRef" 
      class="el-dropdown-diy" 
      menu-align="start"
      @visible-change="hideAll">
      <div class="space-between">
        <overflow :title="currentMallLabel" :class="{'no-mall-node': !mallNodeObj.orgUuid}" :length="12" placement="right"></overflow>
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown" class="select-tree-dropmenu">
        <div class="first-dropdown-ctn">
          <div style="position: relative;" class="space-between region-name" @click="isShowTree">
            <overflow :title="currentTreelabel" :class="{'no-mall-node': noTreeNodeStyle}" :length="12"></overflow>
            <div><i class="el-icon-arrow-down"></i></div>
          </div>
          <div class="transition-wrap">
            <el-collapse-transition>
              <div v-show="showTree">
                <div class="dropmenu-tree">
                  <el-input 
                    class="drop-search-input" 
                    :placeholder="propOptions.treePlaceholder?propOptions.treePlaceholder:defaultPropOptions.treePlaceholder" 
                    icon="h-icon-search" 
                    clearable 
                    v-model="searchTreeVal" 
                    :on-icon-click="getTreeData" 
                    @keyup.enter.native="getTreeData"
                    :clear-icon-click="clearSearchTree">
                  </el-input>
                  <div class="drop-tree-wrap">
                    <el-tree 
                      :data="treeData"
                      simple-data
                      parent-key="parentUuid"
                      :props="defaultProps"
                      node-key="uuid"
                      :default-expanded-keys="defaultExpandedRoot"
                      :current-node-key="currentTreeKey"
                      @node-click="handleNodeClick"
                      :default-expand-all="isExpand">
                    </el-tree>
                  </div>
                </div>
              </div>
            </el-collapse-transition>
          </div>
          <div class="input-center">
            <el-input 
              v-model="searchMallVal" 
              icon="h-icon-search" 
              clearable
              :on-icon-click="searchMallList" 
              @keyup.enter.native="searchMallList"
              :clear-icon-click="clearSearch"
              class="drop-search-input" 
              :placeholder="propOptions.listPlaceholder?propOptions.listPlaceholder:defaultPropOptions.listPlaceholder">
            </el-input>
          </div>
          <div class="empty-text" v-if="mallList.length<1">暂无数据</div>
          <div class="mall-list-wrap">
            <el-scrollbar ref="mallScrollRef" class="el-scrollbar-mall" tag="div" wrap-class="el-mall-scrollbar__wrap" @on-scrolling-y="onScrollingY">
              <div :class="{'mall-item': true, active:index===mallActiveIndex}" v-for="(item, index) in mallList" :key="index" @click="clickMall(item, index)">
                <overflow style="padding-left: 16px;" :title="item.name" :length="12" placement="right"></overflow>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
	</div>
</template>

<script>
import proxy from './proxy'
export default {
  data () {
    return {
      currentMallLabel: '请选择门店',
      currentTreelabel: '请选择区域',
      noTreeNodeStyle: true,
      searchTreeVal: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        uuid: 'uuid',
        label: 'name',
        icon: 'icon',
        disabled: 'disabled'
      },
      defaultPropOptions: {
        treePlaceholder: '请输入区域名查询',
        listPlaceholder: '请输入门店名查询',
        getTreeUrl: '/web/user/getAccountOrgTree',
        getListUrl: '/web/shopConfig/getShopList'
      },
      treeNodeObj: {},
      mallNodeObj: {},
      defaultExpandedRoot: [], // 默认展开根节点
      mallList: [],
      searchMallVal: '',
      mallActiveIndex: -1,
      showTree: false,
      currentTreeKey: '',
      pageNo: 1,
      isExpand: false, // 搜索为空展示一级节点
      noMoreData: true, // 滚动到没有数据以后此时触发滚动加载不再请求数据
      scrollTop: 0, // 滚动条位置
      autoChose: true // 是否选中搜索结果的第一个,只有在默认选中第一个且首次进来的时候才会选中,搜索结果不会选中
    }
  },
  props: {
    treeObj: {
      type: Object,
      default: () => { return {} }
    },
    mallObj: {
      type: Object,
      default: () => { return {} }
    },
    /* 是否需要显示当前区域下的全部门店 */
    hasAllMall: {
      type: Boolean,
      default: true
    },
    /* 是否需要滚动加载 */
    canScrollMore: {
      type: Boolean,
      default: true
    },
    /* 加载更多每次加载条数 */
    pageSize: {
      type: Number,
      default: 15
    },
    /* 首次进来是否默认选中第一个 */
    defaultShow: {
      type: Boolean,
      default: true
    },
    propOptions: {
      type: Object,
      default: () => { return {} }
    }
  },
  mounted () {
    this.getTreeData()
  },
  watch: {
    treeNodeObj (nVal, oVal) {
      this.$emit('getTreeObj', nVal)
      this.pageNo = 1
      this.autoChose = true
      this.getMallList()
    },
    mallNodeObj (nVal, oVal) {
      this.showChecked(nVal, this.mallList)
      this.$emit('getMallObj', nVal)
    },
    mallObj (nVal) {
      this.selectMall(nVal)
    }
  },
  methods: {
    // 获取区域树
    getTreeData () {
      let url = this.propOptions.getTreeUrl ? this.propOptions.getTreeUrl : this.defaultPropOptions.getTreeUrl
      proxy.getAccountRegionTree({
        searchName: this.searchTreeVal
      }, url).then(res => {
        res = res.data
        if (res.code === '200') {
          this.treeData = res.data && res.data.length ? res.data : []
          // 寻找根节点,默认选中根节点
          if (this.treeData && this.treeData.length) {
            for (let item of this.treeData) {
              if (item.parentUuid === '') {
                this.treeNodeObj = item
                this.currentTreeKey = item.uuid
                this.currentTreelabel = item.name
                this.noTreeNodeStyle = false
                /* 重置了筛选条件就默认展开第一级,否则搜索出的就全部展开 */
                if (this.searchTreeVal === '') {
                  this.isExpand = false
                  this.defaultExpandedRoot = [item.uuid]
                } else {
                  /* 搜索结果集如果大于50个只展开一级节点,否则展开全部 */
                  if (this.treeData.length < 50) {
                    this.isExpand = true
                  } else {
                    this.isExpand = false
                    this.defaultExpandedRoot = [item.uuid]
                  }
                }
              }
            }
          }
        }
      })
    },
    // 点击区域树节点
    handleNodeClick (data) {
      this.treeNodeObj = data
      this.currentTreelabel = data.name
      this.noTreeNodeStyle = false
      // 收起选择树
      this.showTree = false
    },
    // 删除搜索关键字
    clearSearchTree () {
      this.searchTreeVal = ''
      this.getTreeData()
    },
    // 获取门店列表
    getMallList () {
      let params = {
        uuid: this.treeNodeObj.uuid,
        searchName: this.searchMallVal
      }
      if (this.canScrollMore) {
        params.pageNo = this.pageNo
        params.pageSize = this.pageSize
      }
      let url = this.propOptions.getListUrl ? this.propOptions.getListUrl : this.defaultPropOptions.getListUrl
      proxy.getShopList(params, url).then(res => {
        res = res.data
        if (res.code === '200') {
          let resData = res.data && res.data.length ? res.data : []
          // 如果请求的页码和总页码一样说明没有更多数据了,下次不能再滚动加载了
          this.noMoreData = res.data.totalPage === params.pageNo
          // 请求结果渲染
          if (this.pageNo !== 1) {
            // 加载更多
            if (res.data && res.data.length) {
              for (let item of res.data) {
                this.mallList.push(item)
              }
            }
          } else {
            // 第一页数据
            this.mallList = resData
            // 是否显示全部门店
            if (this.hasAllMall) {
              // 添加全部门店选项
              this.mallList.unshift({
                name: `${this.treeNodeObj.name}全部门店`,
                path: this.treeNodeObj.path,
                id: this.treeNodeObj.id,
                orgUuid: this.treeNodeObj.uuid,
                type: this.treeNodeObj.type     // 树节点type->区域,type->2门店
              })
            }
            if (this.autoChose && this.defaultShow) {
              this.autoChose = false
              this.mallActiveIndex = 0
              this.currentMallLabel = this.mallList[0].name
              this.mallNodeObj = this.mallList && this.mallList.length ? this.mallList[0] : {}
            }
          }
          // 搜索结果中将显示框中已选中的active上
          this.showChecked(this.mallNodeObj, this.mallList)
        }
      })
    },
    // 点击门店
    clickMall (item, index) {
      this.mallActiveIndex = index
      this.mallNodeObj = item
      this.currentMallLabel = item.name
      this.showTree = false
      this.$refs.selectDropDownRef.hide()
    },
    // 搜索结果中选中已勾选的值
    showChecked (choseObj, allArr) {
      this.mallActiveIndex = allArr.findIndex((item, index) => {
        return item.orgUuid === choseObj.orgUuid
      })
    },
    // 重新设置滚动条的高度为0
    // 否则如果滚动条在第二页,此时搜索会自动触发滚动加载事件
    resetScrollTop () {
      this.scrollTop = 0
      this.$refs.mallScrollRef.wrap.scrollTop = this.scrollTop
    },
    searchMallList () {
      this.pageNo = 1
      this.resetScrollTop()
      this.getMallList()
    },
    // 清空门店关键字搜索
    clearSearch () {
      this.searchMallVal = ''
      this.pageNo = 1
      this.resetScrollTop()
      this.getMallList()
    },
    // 滚动加载更多
    onScrollingY (scrollTop) {
      this.scrollTop = scrollTop.scrollTop
      if (!this.noMoreData && scrollTop.percentY === 1) {
        this.pageNo++
        this.getMallList()
      }
    },
    // 是否展示树
    isShowTree () {
      this.showTree = !this.showTree
    },
    // 选中传递过来的门店值, 根据传递过来的门店选中上方下拉门店
    selectMall (selectedMall) {
      if (selectedMall.searchFlag) {
        let index = this.mallList.findIndex(item => item.orgUuid === selectedMall.uuid)
        if (index > -1) {
          this.clickMall(this.mallList[index], index)
        }
      }
    },
    // 隐藏下拉所有内容
    hideAll (val) {
      setTimeout(() => {
        this.$refs.mallScrollRef.wrap.scrollTop = this.scrollTop
      }, 0)
      if (!val) {
        this.showTree = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>
<style lang="less">
.el-input.drop-search-input {
  width: 184px;
  input.el-input__inner{
    border: none;
    border-bottom: 1px solid #e6e6e6;
  }
}
.el-mall-scrollbar__wrap{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.select-tree-dropmenu{
  background: rgba(255,255,255,0.95);
  box-shadow: 0 5px 10px 0 rgba(0,0,0,0.20);
  border: none;
}
</style>

