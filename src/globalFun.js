import Vue from "vue"

Vue.mixin({
  methods: {
    /**
     * 用来用户是否拥有"perm 权限字符串字段",也就是用户是否拥有这个权限。条件渲染时会用到。
     * @param {*} perm 权限字符串字段 
     * @returns 布尔值
     */
    hasAuth (perm) {
      var authority = this.$store.state.menus.permList

      return authority.indexOf(perm) > -1
    }
  }
})