<template>
  <div class="all">
    <div class='logotext'>
      <img :src="logotext"
           width="100%"
           height="100%" />
    </div>

    <div class="front">
      <el-row type="flex"
              class="row-bg"
              justify="center">

        <div class="left_content">
          <el-col :xl="6"
                  :lg="7">

            <img :src="left_content_image"
                 class="left_content_image" />

          </el-col>
        </div>

        <el-col :span="1">
          <el-divider direction="vertical"></el-divider>
        </el-col>

        <div class="right_content">
          <el-col :xl="6"
                  :lg="7">
            </br>
            <el-form :model="loginForm"
                     :rules="rules"
                     ref="loginForm"
                     label-width="80px">
              <el-form-item label="用户名"
                            prop="username"
                            style="width: 380px;">
                <el-input v-model="loginForm.username"></el-input>
              </el-form-item>
              <el-form-item label="密码"
                            prop="password"
                            style="width: 380px;">
                <el-input placeholder="请输入密码"
                          v-model="loginForm.password"
                          show-password></el-input>
              </el-form-item>
              <el-form-item label="验证码"
                            prop="code"
                            style="width: 380px;">
                <el-input v-model="loginForm.code"
                          style="width: 172px; float: left"
                          maxlength="5"></el-input>
                <el-image :src="captchaImg"
                          class="captchaImg"
                          @click="getCaptcha"></el-image>
              </el-form-item>
              <template class="loginButton">
                <el-form-item>
                  <el-button type="primary"
                             @click="submitForm('loginForm')"
                             class="loginButton">登录</el-button>
                </el-form-item>
              </template>
            </el-form>
          </el-col>
        </div>
      </el-row>
    </div>
  </div>
</template>
<script>
import qs from 'qs'
import left_content_image from '@/assets/894zx.png'
export default {
  name: "Login",
  data () {
    return {
      left_content_image,
      logotext: require('@/assets/logotext.png'),
      loginForm: {
        username: 'admin',
        password: '111111',
        code: '',
        token: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 5, max: 5, message: '长度为 5 个字符', trigger: 'blur' }
        ],
      },
      captchaImg: null
    };
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/login?' + qs.stringify(this.loginForm)).then(res => {

            console.log(res)

            const jwt = res.headers['authorization']

            this.$store.commit('SET_TOKEN', jwt) //将令牌存到vuex的state中并且也存到localStore里
            this.$router.push("/index")  //登录后路由到 /index
          })

        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    resetForm (formName) {
      this.$refs[formName].resetFields(); //重设表单按钮功能的回调函数，ui提供
    },
    getCaptcha () {
      this.$axios.get('/captcha').then(res => {

        console.log("/captcha")
        console.log(res)

        this.loginForm.token = res.data.data.token //token存到表单里
        this.captchaImg = res.data.data.captchaImg //base64Img
        this.loginForm.code = ''  //每次获取验证码之前将表单中验证码输入框的值清空
      })
    }
  },
  created () {
    this.getCaptcha()  //获取验证码函数挂载到created钩子里，可以实现页面开始就发送请求获取验证码，并且验证码输入框开始为空
  },
  activated () {
    this.getCaptcha() //登录页面被激活时要重新获取验证码
  },
}
</script>

<style scoped>
.el-row {
  background-color: white;
  height: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.el-divider {
  height: 200px;
}

.captchaImg {
  float: left;
  margin-left: 8px;
  border-radius: 4px;
}

.loginButton {
  float: left;
  width: 300px;
}
.all {
  float: left;
  width: 100%;
  height: 100%;
  background-color: red;
  background: url(~@/assets/backgroundImg.png);
}
.logotext {
  float: left;
  position: relative;
  clear: both;
  top: 11%;
  left: 27%;
}
.front {
  /* 边框阴影 */
  box-shadow: rgb(137, 136, 204) 10px 10px 60px -10px;
  width: 800px;
  float: left;
  position: relative;
  clear: both;
  top: 11%;
  left: 26%;
}
.left_content {
  background-color: white;
  float: left;
  height: 250px;
  width: 370px;
}
.left_content_image {
  float: left;
  position: relative;
  clear: both;
  margin: 0;
  top: -15px;
  width: 405px;
  height: 300px;
}
.right_content {
  float: left;
  background-color: white;
}
</style>