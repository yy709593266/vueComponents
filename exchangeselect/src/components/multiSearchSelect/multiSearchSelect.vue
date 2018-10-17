<template>
  <div class="multi-search-select">
    <el-dropdown ref="dropdownRef" class="multi-el-dropdown" trigger="click" @visible-change="visibleChange">
      <div class="right-select copy-select-style">
        <div class="left-ctn">
          <overflow 
            :class="{'copy-opt-style':true, 'single-type':isSingleChose}"
            v-if="choseDataMul.length>0"
            @delBtnHandle="delBtnHandleV" 
            :hasDelBtn="choseDataMul.length&&!isSingleChose?true:false" 
            :title="choseDataMul[0][propOptions.dataFormat?propOptions.dataFormat.label:defaultOptions.dataFormat.label]" 
            :length="isSingleChose?12:6" 
            placement="top">
          </overflow>
          <span class="no-chose" v-else>{{propOptions.noChoseText?propOptions.noChoseText:defaultOptions.noChoseText}}</span>
          <span :class="{'copy-opt-style':choseDataMul.length>1?true:false}">{{choseDataMul.length>1?`+${choseDataMul.length-1}`:''}}</span>
        </div>
        <div><i class="el-icon-arrow-down"></i></div>
      </div>
      <el-dropdown-menu slot="dropdown">
        <div class="multi-dropdown-ctn">
          <el-input 
            class="multi-search-input" 
            :placeholder="propOptions.placeholder?propOptions.placeholder:defaultOptions.placeholder"
            icon="h-icon-search"
            clearable
            v-model="keyword" 
            :on-icon-click="searchRightList" 
            @keyup.enter.native="searchRightList"
            :clear-icon-click="clearSearch">
          </el-input>
          <div class="ctn-wrap">
            <el-scrollbar ref="scrollRef" wrap-class="el-ctn-wrap-scrollbar__wrap" @on-scrolling-y="onScrollingY">
              <div @click="choseHandle(item, index)" 
                :class="{'list-item': true, 'active': item.active}" 
                v-for="(item,index) in allRightData"
                :key="item[propOptions.dataFormat?propOptions.dataFormat.value:defaultOptions.dataFormat.value]">
                <overflow style="padding-left: 16px;" :title="item[propOptions.dataFormat?propOptions.dataFormat.label:defaultOptions.dataFormat.label]" :length="12" placement="right"></overflow>
                <img v-if="!isSingleChose&&item.active" src="/static/img/checked.png" alt="checked">
              </div>
              <div class="empty-text" v-if="allRightData.length<1">{{emptyText}}</div>
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
      allRightData: [],
      choseDataMul: [],
      keyword: '',
      defaultOptions: {
        placeholder: '请输入业态名称查询',
        noChoseText: '请选择业态',
        keyword: 'keyword',
        proxyUrl: '/web/passenger/industry/getIndustryPage',
        params: {}, // 传参
        dataFormat: { // 默认返回的数据格式
          label: 'name',
          value: 'uuid'
        }
      },
      pageNo: 1,
      noMoreData: true, // 滚动到没有数据以后此时触发滚动加载不再请求数据
      scrollTop: 0 // 滚动条位置
    }
  },
  props: {
    propOptions: {
      type: Object,
      default: () => { return {} }
    },
    // 最大可勾选数
    maxChoseNum: {
      type: Number,
      default: 5
    },
    // 是否是单选(默认多选)
    isSingleChose: {
      type: Boolean,
      default: false
    },
    // 反向默认选中(为空)
    defaultChoseData: {
      type: Array,
      default: () => { return [] }
    },
    // 抛出是对象数组还是字符串(id)数组,默认字符串数组
    isObjData: {
      type: Boolean,
      default: false
    },
    // 首次进入是否默认选中第一个
    defaultChoseFirst: {
      type: Boolean,
      default: true
    },
    // 滚动加载时一次加载多少条数据,默认10条
    pageSize: {
      type: Number,
      default: 10
    },
    // 是否启动滚动加载
    // 根据滚动加载与否接口返回的数据格式有分页型数据格式和普通数据格式
    canScrollMore: {
      type: Boolean,
      default: true
    },
    // 暂无数据文案
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  mounted () {
    this.getRightList('first')
  },
  watch: {
    propOptions: {
      handler (n, o) {
        this.getRightList('first')
      },
      deep: true
    },
    defaultChoseData (arr) {
      this.choseDataMul = arr
      this.showChecked(this.choseDataMul, this.allRightData)
    },
    choseDataMul (arr) {
      // 当选中的值发生改变就会渲染
      if (this.allRightData && this.allRightData.length) {
        this.showChecked(arr, this.allRightData)
      }
      // 选中的值发生变化就抛出
      if (arr.length) {
        let uuids = []
        for (let item of arr) {
          uuids.push(item[this.propOptions.dataFormat ? this.propOptions.dataFormat.value : this.defaultOptions.dataFormat.value])
        }
        if (this.isObjData) {
          this.$emit('getChoseList', arr)
        } else {
          this.$emit('getChoseList', uuids)
        }
      } else {
        this.$emit('getChoseList', [])
      }
    }
  },
  methods: {
    // 下拉列表勾选显示框中的已选项
    showChecked (choseArr, allArr) {
      // 如果都没有选中就将所有的结果都置为未选中状态(清空已选项)
      if (!choseArr.length) {
        for (let item of allArr) {
          item.active = false
        }
      } else {
        for (let item of allArr) {
          for (let jtem of choseArr) {
            if (item[this.propOptions.dataFormat ? this.propOptions.dataFormat.value : this.defaultOptions.dataFormat.value] === jtem[this.propOptions.dataFormat ? this.propOptions.dataFormat.value : this.defaultOptions.dataFormat.value]) {
              item.active = true
              break
            } else {
              item.active = false
            }
          }
        }
      }
    },
    // 获取右侧业态/品牌列表
    getRightList (isFirst) {
      let params = {}
      // 滚动加载需要传页码参数
      if (this.canScrollMore) {
        params.pageSize = this.pageSize
        params.pageNo = this.pageNo
      }
      if (this.propOptions.keyword) {
        params[this.propOptions.keyword] = this.keyword
      } else {
        params[this.defaultOptions.keyword] = this.keyword
      }
      Object.assign(params, this.propOptions.params)
      let tempUrl = this.propOptions.proxyUrl ? this.propOptions.proxyUrl : this.defaultOptions.proxyUrl
      proxy.getIndustryPage(tempUrl, params).then(res => {
        res = res.data
        if (res.code === '200') {
          let resData = []
          // 如果请求的页码和总页码一样说明没有更多数据了,下次不能再滚动加载了
          this.noMoreData = res.data.totalPage === params.pageNo
          // 加载更多与否结果集数据结构不同
          if (this.canScrollMore) {
            resData = res.data.rows && res.data.rows.length ? res.data.rows : []
          } else {
            resData = res.data && res.data.length ? res.data : []
          }
          // 搜索结果中将显示框中已选中的active上
          if (this.choseDataMul.length && resData.length) {
            this.showChecked(this.choseDataMul, resData)
          }
          // 请求结果渲染
          if (this.pageNo !== 1) {
              // 加载更多
            if (res.data && res.data.rows && res.data.rows.length) {
              for (let item of res.data.rows) {
                this.allRightData.push(item)
              }
            }
          } else {
            // 普通获取
            this.allRightData = resData
            if (this.defaultChoseFirst && isFirst === 'first') {
              this.choseDataMul = resData && resData.length ? [resData[0]] : []
            }
          }
        }
      })
    },
    // 重新设置滚动条的高度为0
    // 否则如果滚动条在第二页,此时搜索会自动触发滚动加载事件
    resetScrollTop () {
      this.scrollTop = 0
      this.$refs.scrollRef.wrap.scrollTop = this.scrollTop
    },
    // 搜索列表
    searchRightList () {
      this.resetScrollTop()
      this.pageNo = 1
      this.getRightList()
    },
    // 清空搜索关键字
    clearSearch () {
      this.keyword = ''
      this.pageNo = 1
      this.resetScrollTop()
      this.getRightList()
    },
    // 选择业态品牌
    choseHandle (item, index) {
      if (this.isSingleChose) {
        // 单选
        for (let temp of this.allRightData) {
          temp.active = false
        }
        item.active = true
        this.choseDataMul = [item]
        // 单选后收起下拉框
        this.$refs.dropdownRef.hide()
      } else {
        // 多选
        if (item.active) {
          this.choseDataMul.splice(this.choseDataMul.findIndex(temp => temp[this.propOptions.dataFormat ? this.propOptions.dataFormat.value : this.defaultOptions.dataFormat.value] === item[this.propOptions.dataFormat ? this.propOptions.dataFormat.value : this.defaultOptions.dataFormat.value]), 1)
        } else {
          if (this.choseDataMul && this.choseDataMul.length < this.maxChoseNum) {
            this.choseDataMul.push(item)
          } else {
            this.$message.warning(`最多选择${this.maxChoseNum}个`)
          }
        }
      }
    },
    // 删除已选
    delBtnHandleV () {
      this.choseDataMul.splice(0, 1)
    },
    // 滚动加载更多
    onScrollingY (scrollTop) {
      this.scrollTop = scrollTop.scrollTop
      // 滚动到底部&&还有更多数据
      if (scrollTop.percentY === 1 && !this.noMoreData) {
        this.pageNo++
        this.getRightList()
      }
    },
    // 收起或者展开下拉列表后将滚动条设置到上一次的位置
    visibleChange (val) {
      setTimeout(() => {
        this.$refs.scrollRef.wrap.scrollTop = this.scrollTop
      }, 0)
    }
  }
}
</script>

<style lang="less" scoped>
@import './style.less';
</style>

<style lang="less">
.multi-dropdown-ctn{
  .multi-search-input{
    width: 184px;
    margin: 9px 8px;
    input.el-input__inner{
      border-radius: 20px;
      background-color: #f2f2f2;
      border: none;
    }
  }
}
.el-ctn-wrap-scrollbar__wrap{
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>

