<template>
  <div class="exchange-tree-select">
    <div class="two-tree-wrap" :style="{left: mallLeft?0:`${transitionLeft}px`}">
      <select-tree 
        @getMallObj="getMallObjV" 
        :defaultShow="defaultShowV"
        v-if="mallLeft">
      </select-tree>
      <multi-search-tree 
        v-if="!mallLeft" 
        @getCheckedData="getTreeCheckedData" 
        :isDefaultSelected="isDefaultSelected">
      </multi-search-tree>
    </div>
    <el-button @click="exchangeHandle" class="ex-button" icon="h-icon-update"></el-button>
    <multi-search-select 
      :isSingleChose.sync="isSingleChoseV" 
      :isObjData="true"
      @getChoseList="getChoseListV"
      :propOptions.sync="propOptions"
      :defaultChoseData.sync="defaultChoseDataV"
      :style="{left: mallLeft?0:`-${transitionLeft}px`}">
    </multi-search-select>
  </div>
</template>

<script>
import multiSearchSelect from '@/components/multiSearchSelect/multiSearchSelect'
import selectTree from '@/components/syncTreeListDropdown/index.vue'
import multiSearchTree from '@/components/ansySyncCheckboxTreeDp/index.vue'
export default {
  data () {
    return {
      mallLeft: true,
      transitionLeft: 236,
      defaultChoseDataV: [],
      isSingleChoseV: false,
      treeCheckedData: [],
      isDefaultSelected: false,
      defaultShowV: true
    }
  },
  props: {
    propOptions: {
      type: Object,
      default: () => { return {} }
    }
  },
  watch: {
    treeCheckedData (n, o) {
      console.log('treeCheckedData', n)
      console.log('treeCheckedData-o', o)
      if (!this.mallLeft) {
        this.$emit('getChoseTreeData', n)
      }
    }
  },
  components: {
    selectTree,
    multiSearchSelect,
    multiSearchTree
  },
  mounted () {
    this.$emit('isMallLeft', true)
  },
  methods: {
    // 获取门店
    getMallObjV (val) {
      if (val && val.orgUuid) {
        this.$emit('getChoseTreeData', [val])
      } else {
        this.$emit('getChoseTreeData', [])
      }
    },
    // 切换组件
    exchangeHandle () {
      this.mallLeft = !this.mallLeft
      this.isSingleChoseV = !this.mallLeft
      this.$emit('isMallLeft', this.mallLeft)
      this.defaultChoseDataV = []
      this.$emit('getChoseTreeData', [])
      this.$emit('getChoseListData', [])
      this.defaultShowV = false
    },
    // 获取勾选树的勾选数据
    getTreeCheckedData (data) {
      this.treeCheckedData = []
      for (let item of data) {
        item.uuid && this.treeCheckedData.push(item)
      }
    },
    // 获取已选列表
    getChoseListV (arr) {
      this.$emit('getChoseListData', arr)
    }
  }
}
</script>

<style lang="less" scoped>
.exchange-tree-select{
  width: 440px;
  display: flex;
  .two-tree-wrap{
    display: flex;
    position: relative;
    transition: left 0.5s;
  }
  .ex-button{
    transform: rotate(90deg);
  }
}
</style>

