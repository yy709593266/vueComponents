<template>
	<span class="overflow-title">
		<span v-if="showtip">
			<el-tooltip :placement="placement" :content="title" effect="dark">
				<span>{{shortTitle}}</span>
			</el-tooltip>
		</span>
		<span v-else>{{shortTitle}}</span>
    <slot v-if="hasDelBtn" name="delBtn">
      <span @click.stop="delItem" class="h-icon-close"></span>
    </slot>
	</span>
</template>

<script>
export default {
  data () {
    return {
      showtip: false,
      shortTitle: ''
    }
  },
  props: {
    placement: {
      type: String,
      default: 'bottom'
    },
    length: {
      type: Number,
      default: 6
    },
    title: {
      type: String,
      default: '请选择'
    },
    hasDelBtn: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    if (this.title) {
      if (this.title.length <= this.length) {
        this.shortTitle = this.title
        this.showtip = false
      } else {
        this.shortTitle = `${this.title.substr(0, this.length)}...`
        this.showtip = true
      }
    }
  },
  watch: {
    title () {
      if (this.title.length <= this.length) {
        this.shortTitle = this.title
        this.showtip = false
      } else {
        this.shortTitle = `${this.title.substr(0, this.length)}...`
        this.showtip = true
      }
    }
  },
  methods: {
    // 删除当前元素
    delItem () {
      this.$emit('delBtnHandle')
    }
  }
}
</script>
