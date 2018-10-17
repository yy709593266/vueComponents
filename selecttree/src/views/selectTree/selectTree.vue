<template>
	<div class="select-tree">
    <el-dropdown 
      trigger="click" 
      ref="selectDropDownRef" 
      class="el-dropdown-diy" 
      menu-align="start"
      @visible-change="hideAll">
      <div class="space-between">
        <overflow :title="currentMallNode" :length="12" placement="right"></overflow>
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div class="first-dropdown-ctn">
          <div style="position: relative;" class="space-between region-name" @click="isShowTree">
            <overflow :title="currentTreeNode" :length="12"></overflow>
            <div><i class="el-icon-arrow-down"></i></div>
          </div>
          <div class="transition-wrap">
            <el-collapse-transition>
              <div v-show="showTree">
                <div class="dropmenu-tree">
                  <el-input 
                    class="tree-search-input" 
                    placeholder="请输入区域名查询" 
                    icon="h-icon-search" 
                    clearable 
                    v-model="searchTreeVal" 
                    :on-icon-click="getTreeData" 
                    @keyup.enter.native="getTreeData">
                  </el-input>
                  <div style="height: 200px;">
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
          <div class="input-center">
            <el-input 
              v-model="searchMallVal" 
              icon="h-icon-search" 
              clearable
              :on-icon-click="getMallList" 
              @keyup.enter.native="getMallList"
              class="mall-search-input" 
              placeholder="请输入门店名查询">
            </el-input>
          </div>
          <div class="no-mall" v-if="mallList.length<1">暂无数据</div>
          <div class="mall-list-wrap">
            <el-scrollbar class="el-scrollbar-mall" tag="div" wrap-class="el-mall-scrollbar__wrap" view-class="el-mall-scrollbar__view">
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
      currentMallNode: '请选择门店',
      currentTreeNode: '请选择区域',
      searchTreeVal: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        uuid: 'uuid',
        label: 'name',
        icon: 'icon',
        disabled: 'disabled'
      },
      treeNodeObj: {},
      mallNodeObj: {},
      overflowPlace: 'right',
      defaultExpandedRoot: [], // 默认展开根节点
      mallList: [],
      searchMallVal: '',
      mallActiveIndex: 0,
      showTree: false,
      currentNodeKey: ''
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
    /* 是否显示当前区域下全部门店 */
    hasAllMall: {
      type: Boolean,
      default: true
    }
  },
  mounted () {
    this.getTreeData('first')
  },
  watch: {
    treeNodeObj (nVal, oVal) {
      this.$emit('getTreeObj', nVal)
      this.getMallList(nVal)
    },
    searchTreeVal () {
      this.getTreeData()
    },
    mallObj (nVal) {
      if (nVal) {
        this.selectMall(nVal)
      }
    }
  },
  methods: {
    // 获取区域树
    getTreeData (flag) {
      proxy.getAccountRegionTree({
        searchName: this.searchTreeVal
      }).then(res => {
        res = res.data
        if (res.code === '200') {
          this.treeData = res.data && res.data.length ? res.data : []
          // 寻找根节点,默认选中根节点
          if (this.treeData && this.treeData.length) {
            let tempUuid = []
            for (let item of this.treeData) {
              tempUuid.push(item.uuid)
              if (item.parentUuid === '') {
                this.treeNodeObj = item
                this.currentNodeKey = item.uuid
                this.currentTreeNode = item.name
                /* 如果是首次进入,或者是重置了筛选条件就默认展开第一级,否则搜索出的就全部展开 */
                if (flag === 'first' || this.searchTreeVal === '') {
                  this.defaultExpandedRoot = [item.uuid]
                } else {
                  this.defaultExpandedRoot = tempUuid
                }
              }
            }
          }
        }
      })
    },
    // 获取门店列表
    getMallList (treeNodeObj) {
      let params = {
        uuid: treeNodeObj.uuid,
        keyword: this.searchMallVal
      }
      proxy.getShopList(params).then(res => {
        res = res.data
        if (res.code === '200') {
          this.mallList = res.data && res.data.length ? res.data : []
          if (this.mallList && this.mallList.length) {
            if (this.hasAllMall) {
              this.mallList.unshift({
                name: `${treeNodeObj.name}下全部门店`,
                orgUuid: treeNodeObj.uuid,
                type: '地区type'
              })
            }
            this.mallNodeObj = res.data[0]
            this.$emit('getMallObj', this.mallNodeObj)
            this.mallActiveIndex = 0
            this.currentMallNode = res.data[0].name
          } else {
            this.mallNodeObj = {}
            this.$emit('getMallObj', this.mallNodeObj)
            this.currentMallNode = '请选择门店'
          }
        }
      })
    },
    // 点击区域树节点
    handleNodeClick (data) {
      this.treeNodeObj = data
      this.currentTreeNode = data.name
      // 收起选择树
      this.showTree = false
    },
    // 是否展示树
    isShowTree () {
      this.showTree = !this.showTree
    },
    // 点击门店
    clickMall (item, index) {
      this.mallActiveIndex = index
      this.mallNodeObj = item
      this.$emit('getMallObj', this.mallNodeObj)
      this.currentMallNode = item.name
      this.showTree = false
      this.$refs.selectDropDownRef.hide()
    },
    // 选中传递过来的门店值, 根据传递过来的门店选中上方下拉门店
    selectMall (selectedMall) {
      if (!selectedMall.type && selectedMall.searchFlag) {
        let index = this.mallList.findIndex(item => item.orgUuid === selectedMall.uuid)
        this.clickMall(selectedMall, index)
      }
    },
    // 隐藏下拉所有内容
    hideAll (val) {
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
.tree-search-input{
  input.el-input__inner{
    border-radius: 20px;
    background-color: #f2f2f2;
    border: none;
  }
}
.el-mall-scrollbar__wrap{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
.first-dropdown-ctn{
  .mall-search-input{
    width: 170px;
    input.el-input__inner{
      border-radius: 0;
      border: none;
      border-bottom: 1px solid #e6e6e6;
      &:hover{
        border-color: #666;
      }
    }
  }
}
</style>

