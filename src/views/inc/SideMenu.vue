<template>
  <el-aside width="212px">
    <el-menu :default-active="this.$store.state.menus.editableTabsValue"
             class="el-menu-vertical-demo"
             background-color="#545c64"
             text-color="#fff"
             active-text-color="#ffd04b"
             :unique-opened="true">
      <!--首页是所有用户都有的，并且首页是具有路由的-->
      <!--<router-link>标签设置路由属性，再在<router-link>标签里用<el-menu-item>标签生成导航选项，这样实现了生成能够路由的导航选项  -->
      <router-link to="/index">
        <!-- index=""唯一标志 给default-active标记 -->
        <el-menu-item index="Index"
                      @click="selectMenu({name: 'Index', title: '首页'})">
          <template slot="title">
            <i class="el-icon-s-home"></i> <!-- 图标设置 -->
            <span slot="title">首页</span> <!-- 标题设置 -->
          </template>
        </el-menu-item>
      </router-link>
      <!--<el-submenu> 标签就是用来控制 多一层 子导航栏。  -->
      <!-- 规定的菜单menuList数据类型是树状结构。父菜单-children属性里存子菜单。特点：父菜单是归类子菜单用的，不需要路由，子菜单才需要路由-->
      <!-- 此处作唯一标识的menu.name是SysMenuDto的name，比如name: 'SysUser'。因为是Dto对象，所以不对应数据库的字段name："用户管理"  -->
      <el-submenu :index="menu.name+''"
                  v-for="menu in menuList"
                  :key="menu.id">
        <!--这个<template slot="title">是遍历的第一层，也就是父菜单 -->
        <template slot="title">
          <i :class="menu.icon"></i>
          <span>{{menu.title}}</span>
        </template>
        <!-- 紧接着遍历的第二层，也就是children，并且生成路由 -->
        <router-link :to="item.path"
                     v-for="item in menu.children"
                     :key="item.id">
          <el-menu-item :index="item.name+''"
                        @click="selectMenu(item)">
            <template slot="title">
              <span slot="title">{{item.title}}</span>
            </template>
          </el-menu-item>
        </router-link>
      </el-submenu>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: "SideMenu",
  data () {
    return {

    }
  },
  computed: {
    /**因为我们获取菜单列表的时机是登录成功路由前的时机，而页面是先进性渲染在进行路由的，所以渲染完还没有数据，所以是空
     * 所以写在data里是无法完成响应的，因为不是直接对SideMenu里的menuList进行修改，所以没有引起响应式。我们修改的是vuex的数据，
     * 所以没有引起响应式，因为修改的根本不是同一个对象。所以要用计算属性 */
    menuList: {
      get () {
        return this.$store.state.menus.menuList
      }
    }
  },
  methods: {
    selectMenu (item) {
      //该回调函数用于联动选项卡。即生成选项卡
      this.$store.commit("addTab", item)
    }
  }
}
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 100%;
}
a {
  text-decoration: none;
}
</style>