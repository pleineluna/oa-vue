import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Index from '../views/Index.vue'
import PersonalInfo from '../views/sys/userCenter/PersonalInfo.vue'
import ChangePassword from '../views/sys/userCenter/ChangePassword.vue'
import axios from "../axios";
import store from "../store"

Vue.use(VueRouter) //应用路由插件

//创建路由route，数组形式。
const routes = [
  //首页、个人中心、登录页的路由是固定的，因为所有用户都具有这三个页面的访问权限。
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: "信息科学与工程学院自动办公系统",
      keepAlive: true // 需要被缓存
    },
    children: [
      {
        path: '/index',
        name: 'Index',
        meta: {
          title: "首页",
          keepAlive: true
        },
        component: Index  //普通加载，需要import路由组件
      },
      {
        path: '/userCenter',
        name: 'UserCenter',
        meta: {
          title: "个人中心",
          keepAlive: true
        },
        //下面是三重路由了，并不是路由层级越多越高级，只要是需要的就是好的。
        children: [
          {
            path: '/userCenter/personalInfo',
            name: 'PersonalInfo',
            component: PersonalInfo, //注意，这里用的是路由普通加载组件的方式，没有用懒加载。
            meta: {
              title: '个人资料',
              keepAlive: true
            },
          },
          {
            path: '/userCenter/changePassword',
            name: 'ChangePassword',
            component: ChangePassword,//注意，这里用的是路由普通加载组件的方式，没有用懒加载。
            meta: {
              title: '修改密码',
              keepAlive: true
            }
          }
        ],
        component: () => import('@/views/UserCenter.vue') //懒加载，不需要import组件，非常适用动态生成路由
      },
      {
        path: '/meeting_video/:meetingId/:uuid',
        name: 'MeetingVideo',
        component: () => import('@/views/adm/meeting/meeting_video.vue'), //懒加载，不需要import组件，非常适用动态生成路由
        meta: {
          title: '视频会议',
          keepAlive: true,
          isTab: true
        }
      },
    ]
  },

  {
    path: '/login',
    name: 'Login',
    meta: { title: "信息科学与工程学院自动办公系统", keepAlive: true },
    component: () => import('@/views/Login.vue')
  }
]
//创建全局唯一的路由器router
const router = new VueRouter({
  mode: 'history', //路由的 history 模式 
  base: process.env.BASE_URL, //打包路径，默认为/，可以修改
  routes //路由数组
})

//利用全局路由前置守卫（初始化、路由切换之前被调用），登录成功切换之前就能够动态生成菜单路由
router.beforeEach((to, from, next) => {


  //路由发生改变时,触发 --- 用于title的设置
  window.document.title = to.meta.title == undefined ? '等待响应' : to.meta.title

  if (to.path == '/') { next({ path: '/index' }) }

  //hasRoute标识符是有没有route，没有route才进行后续操作，操作完后修改标识，防止每次都动态生成路由。是设置在vuex state里的
  let hasRoute = store.state.menus.hasRoutes

  //获取登录成功之后存储在localStore里的令牌
  let token = localStorage.getItem("token")
  if (to.path == '/login') {
    //如果路由to的地址是登录页面直接放行,并且清空localStore里存储的token ---- 防止登录页面残留无效token！！！
    localStorage.removeItem("token");
    next()
  } else if (!token) {
    //如果to的不是登录页并且没有令牌，那么将跳转到登录页让用户登录
    next({ path: '/login' })
  } else if (token && !hasRoute) {  //如果有令牌并且是第一次动态生成路由
    axios.get("/sys/menu/nav", {
      //可以用的配置选项。只有 url 是必需的  
      // `headers` 是即将被发送的自定义请求头
      headers: {
        Authorization: localStorage.getItem("token") //意思是给这个请求头中添加 Authorization: token
      }
    }).then(res => {

      console.log(res.data.data)

      // 拿到menuList，存到vuex里
      store.commit("setMenuList", res.data.data.nav)

      // 拿到用户权限，存到vuex里
      store.commit("setPermList", res.data.data.authoritys)

      console.log(store.state.menus.menuList)

      // 动态绑定路由  拿到全局唯一router身上的所有route放到数组newRoutes里，routes本身就是一个数组形式
      let newRoutes = router.options.routes

      res.data.data.nav.forEach(menu => {
        // 这个判断是因为第一层导航不需要路由，第二层菜单才需要绑定路由。nav是遍历的列表  menu是迭代项
        if (menu.children) {
          menu.children.forEach(e => {

            // 转成路由
            let route = menuToRoute(e)

            // 把路由添加到路由管理中
            if (route) {
              //路由是一个数组，第一个元素是Home路由。
              newRoutes[0].children.push(route)
            }

          })
        }
      })

      console.log("newRoutes")
      console.log(newRoutes)
      //好像这个api废弃了用router.addRoute("Home",newRoutes)?
      router.addRoutes(newRoutes) //router.addRoutes 给router身上添加routes  官方api

      hasRoute = true
      store.commit("changeRouteStatus", hasRoute)
    })
  }

  next()
})

/**
 * 导航菜单转成路由
 * @param {*} menu 菜单对象
 * @returns route
 */
const menuToRoute = (menu) => {

  if (!menu.component) {
    return null
  }

  let route = {
    name: menu.name,
    path: menu.path,
    meta: {
      icon: menu.icon,
      title: menu.title,
      keepAlive: true
    }
    //或component = () => import('@/views/' + menu.component +'.vue')
  }
  route.component = () => import('@/views/' + menu.component + '.vue')

  return route  //要return啊 ，这是个函数，你不return，调用时是拿不到值的。
}

export default router //暴露出去
