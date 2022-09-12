import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
  state: {

    menuList: [], //得到的菜单列表
    permList: [], //得到的权限列表

    hasRoutes: false, //是否已经第一次路由过

    editableTabsValue: 'Index', //绑定值，当前选中选项卡的name、也用作当前SideMenu选中的name

    editableTabs: [{  // editableTabs是所有选项卡的数据源，是数组类型。默认初始值只具有首页，也就是选项标签永远存在首页这个选项标签
      title: '首页',
      name: 'Index',
    }]
  },
  mutations: {
    setMenuList (state, menus) {
      state.menuList = menus
    },
    setPermList (state, perms) {
      state.permList = perms
    },
    changeRouteStatus (state, hasRoute) {
      state.hasRoutes = hasRoute
    },
    /**添加标签选项卡的方法，本来是放在Tabs的，但因为要实现联动，也就是SideMenu需要绑定点击事件调用这个方法，所以放到vuex里。 */
    addTab (state, tab) {
      /**findIndex是js里的函数，e代表当前参数也就是state.editableTabs。如果参数是数组就代表迭代项  */
      let index = state.editableTabs.findIndex(e => e.name === tab.name)

      //下面的逻辑是判断选项卡是否已经存在，若存在则不添加，防止选项卡重复
      if (index === -1) {
        state.editableTabs.push({ //向editableTabs选项卡数据源数组中push进一个新的选项卡对象{itle: tab.title,name: tab.name,}
          title: tab.title,
          name: tab.name,
        });
      }
      //让当前选中选项卡的name为新添加的选项卡name。如果已经存在，这个逻辑也行得通。就是激活当前选项卡逻辑。
      state.editableTabsValue = tab.name;
    },
    /** 重设状态逻辑，要清除vuex里的所有数据，并把某些数据设置为默认值 */
    resetState: (state) => {
      state.menuList = []
      state.permList = []

      state.hasRoutes = false
      state.editableTabsValue = 'Index'
      state.editableTabs = [{
        title: '首页',
        name: 'Index',
      }]
    }

  },
  actions: {
  },

}