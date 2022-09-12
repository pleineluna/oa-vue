<template>
  <el-container>
    <el-aside width="200px">
      <!-- 侧边导航栏 -->
      <SideMenu></SideMenu>
    </el-aside>
    <el-container>
      <el-header>
        <!-- <strong> 标签和 <em> 标签一样，用于强调文本，但它强调的程度更强一些。 -->
        <strong class="banner_title">学院办公自动化系统</strong>
        <div class="header-avatar">
          <!-- 头像 -->
          <el-avatar :size="55"
                     :src="this.userInfo.avatar"
                     style="margin-right : -50px">
          </el-avatar>
          <!-- 下拉框 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              {{userInfo.username}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <router-link :to="{name: 'PersonalInfo'}">个人中心</router-link>
              </el-dropdown-item>
              <el-dropdown-item @click.native="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <!-- Main里的标签卡 -->
        <Tabs></Tabs>
        <div style="margin: 0 15px; ">
          <!-- Main里的显示内容 -->
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import SideMenu from "./inc/SideMenu";
import Tabs from "./inc/Tabs";

export default {
  name: "Home",
  components: {
    SideMenu,
    Tabs
  },
  data () {
    return {
      userInfo: {
        id: "",
        username: "",
        avatar: '',
      }
    }
  },
  created () {
    this.getUserInfo()
  },
  watch: {
    '$store.state.avatar': function (newVal) {
      this.userInfo.avatar = newVal
    }
  },
  methods: {
    getUserInfo () {
      this.$axios.get("/sys/userInfo").then(res => {
        this.$store.commit('SET_AVATAR', res.data.data.avatar) //把向后台发送请求获取的avatar放在vuex里,这里相当于设置avatar的初始值，而且要在Home页面进行初始值设置，这样可以保证一登录系统就可以进行初始化
        this.userInfo = res.data.data
      })
    },
    logout () {
      this.$axios.post("/logout").then(res => {
        localStorage.clear()
        sessionStorage.clear()

        this.$store.commit("resetState")

        this.$router.push("/login")
      })
    }
  }
}
</script>

<style scoped>
.el-container {
  padding: 0;
  margin: 0;
  height: 100%;
}

.header-avatar {
  float: right;
  width: 220px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
}

.el-header {
  background-image: linear-gradient(
    to right,
    #eea2a2 0%,
    #bbc1bf 19%,
    #57c6e1 42%,
    #b49fda 79%,
    #7ac5d8 100%
  );
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  margin: 0px;
  padding: 0px;
  background-color: #545c64;
  color: #333;
  line-height: 210px;
  overflow: hidden;
}

.el-main {
  color: #333;
  padding: 0;
}

a {
  text-decoration: none;
}
.banner_title {
  font-family: "PingFang SC";
}
</style>