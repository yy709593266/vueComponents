<template>
	<div class="tree-checkbox">
    <el-dropdown class="ex-el-dropdown" trigger="click">
      <div class="right-select copy-select-style">
        <div class="left-ctn">
          <overflow 
            class="copy-opt-style"
            v-if="choseData&&choseData.length>0"
            @delBtnHandle="delBtnHandleV" 
            :hasDelBtn="choseData&&choseData.length?true:false" 
            :title="choseData[0].name" 
            :length="6" 
            placement="top">
          </overflow>
          <span class="no-chose" v-else>请选择门店</span>
          <span :class="{'copy-opt-style':choseData&&choseData.length>1?true:false}">{{choseData&&choseData.length>1?`+${choseData.length-1}`:''}}</span>
        </div>
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown" style="padding: 0;width: 200px;">
        <div class="tree-frame">
          <div class="tree-filter">
            <el-input class="drop-search-input"
                  placeholder="请输入区域名查询"
                  kind="surface"
                  icon="h-icon-search"
                  v-model="searchName"
                  @keyup.enter.native="handleSearchClick"
                  :on-icon-click="handleSearchClick"
                  clearable
                  :clear-icon-click='clearClick'
                  >
            </el-input>
            <div class="tree-wrap" style="height:200px;">
              <el-tree
                v-show="!isSearch "
                :data="treeData"
                simple-data
                parent-key="parentUuid"
                :props="defaultProps"
                check-strictly
                :show-checkbox="true"
                node-key="uuid"
                :default-expanded-keys="defaultExpandedRoot"
                @check-change="checkedChange"
                ref="tree"
                :load="loadNode" lazy>
                </el-tree> 
                <el-tree v-show="isSearch"
                :data="treeDataSearch"
                simple-data
                parent-key="parentUuid"
                :props="defaultProps"
                check-strictly
                :show-checkbox="true"
                node-key="uuid"
                ref="treeSearch"
                @check-change="checkedChangeSearch"
                default-expand-all>
              </el-tree>
            </div>
          </div>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
	</div>
</template>
<script>
import proxy from './proxy'
export default {
  props: {
    proxyAnsy: {
      type: Object,
      default: () => {
        return {
          // 异步树
          url: '/web/organization/getOrganizationList',
          params: {}
        }
      }
    },
    proxySync: {
      type: Object,
      default: () => {
        return {
          // 同步树
          url: '/web/organization/getOrganizationTree',
          params: {}
        }
      }
    },
    isDefaultSelected: {
      type: Boolean,
      default: true
    },
    length: {
      type: Number,
      default: 5
    }
  },
  mounted () {
    this.getTree()
  },
  watch: {
    choseData (n, o) {
      // 选的个数改变才抛出
      if (n.length !== o.length) {
        this.$emit('getCheckedData', this.choseData)
      }
    }
  },
  data () {
    return {
      // 选中展示的节点
      choseData: [],
      isSearch: false,
      searchName: '',
      treeData: [],
      treeDataSearch: [],
      first: true,
      defaultProps: {
        children: 'children',
        uuid: 'uuid',
        label: 'name',
        icon: 'icon',
        disabled: 'disabled',
        isLeaf: 'leaf'
      },
      overflowPlace: 'right',
      // 判断异步树是否重新加载
      flag: false,
      defaultExpandedRoot: [] // 默认展开根节点,
    }
  },
  methods: {
    delBtnHandleV () {
      this.choseData.splice(0, 1)
      // 删除的时候 n 与 o一样
      this.$emit('getCheckedData', this.choseData)
      if (this.isSearch) {
        this.$refs.treeSearch.setCheckedNodes(this.choseData, false, true)
      } else {
        this.$refs.tree.setCheckedNodes(this.choseData, false, true)
      }
    },
    // 异步树勾选改变
    checkedChange (data, isChecked, hasSonChecked) {
      if (this.choseData.length === this.length && isChecked) {
        this.$refs.tree.setCheckedNodes(this.choseData, false, true)
        this.$message.warning('最多只能选择' + this.length + '个')
        // 不抛出
        return false
      }
      if (!this.flag) {
        this.choseData = this.$refs.tree.getCheckedNodes(false, true)
      }
      this.flag = false
      // this.$emit('getCheckedData', this.choseData)
    },
    // 同步树勾选改变
    checkedChangeSearch (data, isChecked, hasSonChecked) {
      if (this.choseData.length === this.length && isChecked) {
        this.$refs.treeSearch.setCheckedNodes(this.choseData, false, true)
        this.$message.warning('最多只能选择' + this.length + '个')
        return false
      }
      this.choseData = this.$refs.treeSearch.getCheckedNodes(false, true)
      // this.$emit('getCheckedData', this.choseData)
    },
    clearClick () {
      this.searchName = ''
      this.handleSearchClick()
    },
      // 异步树
    getTree () {
      this.proxyAnsy.params.uuid = ''
      proxy.getDataTree(this.proxyAnsy).then(res => {
        res = res.data
        if (res.code === '200') {
          this.treeData = res.data ? res.data : []
          this.treeInit(res.data, 'tree')
        }
      })
    },
    // 同步树
    searchTree () {
      this.proxySync.params.searchName = this.searchName
      proxy.getDataTree(this.proxySync).then(res => {
        res = res.data
        if (res.code === '200') {
          this.treeDataSearch = res.data ? res.data : []
          this.treeInit(res.data, 'treeSearch')
          let uuids = []
          for (let item of this.choseData) {
            uuids.push(item.uuid)
          }
          this.$refs.treeSearch.setCheckedKeys(uuids, false, true)
        }
      })
    },
    treeInit (data, tree) {
      if (data && data.length > 0) {
        for (let index in data) {
          if (data[index].parentUuid === '') {
            // 异步树请求,第一次默认选中根节点
            if (tree === 'tree' && this.first && this.isDefaultSelected) {
              this.choseData = [data[index]]
              // 防止 setCheckedNodes 报undefined
              this.$refs[tree] && this.$refs[tree].setCheckedNodes(this.choseData, false, true)
            }
            try {
              this.defaultExpandedRoot = [data[index].uuid]
            } catch (e) {}
          }
        }
      }
    },
    loadNode (node, resolve) {
      // 默认控制中心level === 1
      if (node.level === 0) {
        return resolve(this.treeData)
      } else {
        // if (node.level === 1) {
        //   this.flag = true
        // }
        this.proxyAnsy.params.uuid = node.data.uuid
        proxy.getDataTree(this.proxyAnsy).then((res) => {
          res = res.data
          if (res.code === '200') {
            resolve(res.data ? res.data : [])
            this.$refs.tree && this.$refs.tree.setCheckedNodes(this.choseData, false, true)
          }
        })
      }
    },
      // 搜索树
    handleSearchClick () {
      // 异步搜索的时候会把默认控制中心选中项置空, 解决方案
      this.flag = true
        // 搜索有值,同步树, 没值,异步树
      this.first = false
      if (this.searchName) {
        this.isSearch = true
        this.searchTree()
      } else {
        this.isSearch = false
        this.getTree()
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
.tree-checkbox{
  // 修复IE下不对齐
  display: flex;
}
</style>
<style lang="less">
.tree-frame{
  .tree-filter{
    .drop-search-input{
      margin: 9px 8px;
      input {
        border-radius: 20px;
        background-color: #f2f2f2;
        border: none !important;
      }
    }
  }
}
</style>
