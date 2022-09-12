<template>
  <div>
    <div class='banner'>
      <a @click="change_avatar()"
         title="点击更换头像"
         href="javascript:void(0);">
        <!-- href="javascript:void(0);写在vue的@click前面就会阻止vue的@click行为 -->
        <div class="avatar_box">
          <!-- 头像 -->
          <el-avatar :size="155"
                     :src="this.userInfo.avatar">
          </el-avatar>
        </div>
      </a>
      <span class="userinfoForUsername">
        {{userInfo.username}}
      </span>
      <div class="userinfoForGender">
        {{userInfo.gender}}
        <el-divider direction="vertical"></el-divider>
        {{userInfo.city}}
      </div>
    </div>

    <div class="NavMenu1">
      <el-row class="tac">
        <el-col :span="4">
          <el-menu default-active="2"
                   class="el-menu-vertical-demo">
            <router-link to="/userCenter/personalInfo">
              <el-menu-item index="PersonalInfo">
                <i class="el-icon-caret-right"></i>
                <span slot="title">个人资料</span>
              </el-menu-item>
            </router-link>
            <router-link to="/userCenter/changePassword">
              <el-menu-item index="ChangePassword">
                <i class="el-icon-caret-right"></i>
                <span slot="title">修改密码</span>
              </el-menu-item>
            </router-link>
          </el-menu>
        </el-col>
      </el-row>
    </div>
    <div style="margin: 0 15px;">
      <!-- 路由区域里的显示内容 -->
      <router-view />
    </div>
    <!-- 头像修改的dialog -->
    <el-dialog title="更换头像"
               :visible.sync="dialogVisible"
               width="30%"
               :before-close="handleClose">
      <el-form ref="form"
               :model="form"
               :rules="rules"
               label-width="80px"
               style="text-align:center;width:80%;">
        <el-form-item>
        </el-form-item>
        <el-form-item ref="uploadElement"
                      prop="imageUrl">
          <el-input v-model="form.imageUrl"
                    v-if="false"></el-input>
          <el-upload class="avatar-uploader"
                     ref="upload"
                     name="file"
                     :headers="Myhead"
                     :show-file-list="false"
                     action="http://localhost:8081/sys/user/changeAvatar"
                     :before-upload="beforeUpload"
                     :on-change="handleChange"
                     :on-success="successUpload"
                     :auto-upload="false"
                     accept=".jpeg,.png,.jpg,.bmp,.gif,.JPEG,.PNG,.JPG,.BMP,.GIF"
                     :data="form">
            <!-- 头像显示，因为是修改信息所以需要回填信息，所以此处显示旧头像，当上传了头像之进行新头像预览 -->
            <img v-if="form.imageUrl"
                 :src="form.imageUrl"
                 class="avatar">
            <i v-else
               class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     @click="submitForm('form')">确定</el-button>
          <el-button type="primary"
                     @click="handleClose()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: "UserCenter",
  data () {
    return {
      dialogVisible: false,
      userInfo: {
        id: "",
        username: "",
        gender: "",
        avatar: '',
        city: ""
      },
      fileList: [],
      form: {
        imageUrl: '',
      },
      rules: {
        imageUrl: [
          { required: true, message: '请上传图片', trigger: 'blur' },
        ],
      }
    }
  },
  computed: {
    Myhead: {
      get () {
        return { Authorization: localStorage.getItem("token") }
      }
    },
  },
  watch: {
    '$store.state.avatar': function (newVal) {
      this.userInfo.avatar = newVal
    }
  },
  created () {
    this.getUserInfo()
  },
  methods: {
    getUserInfo () {
      this.$axios.get("/sys/userInfo").then(res => {
        var resData = res.data.data
        if (resData.gender == 0) { resData.gender = '女' } else { resData.gender = '男' }
        this.userInfo = resData
      })
    },

    /** 以下是更换图片相关的事件回调 */
    /** 打开dialog的回调函数 */
    change_avatar () {
      this.dialogVisible = true
      this.form.imageUrl = this.userInfo.avatar
    },
    resetForm (formName) {
      this.$refs[formName].resetFields();
      this.form.imageUrl = '';
    },
    /** before-upload：上传文件之前的钩子，参数为上传的文件 */
    beforeUpload (file) {
      const fileName = file.name
      const fileType = fileName.substring(fileName.lastIndexOf('.'))
      // accept=".jpeg,.png,.jpg,.bmp,.gif,.JPEG,.PNG,.JPG,.BMP,.GIF"
      if (
        fileType === '.jpg' ||
        fileType === '.png' ||
        fileType === '.jpeg' ||
        fileType === '.bmp' ||
        fileType === '.gif' ||
        fileType === '.JPG' ||
        fileType === '.PNG' ||
        fileType === '.JPEG' ||
        fileType === '.BMP' ||
        fileType === '.GIF'
      ) {
        // 不处理
      } else {
        this.$message.error(
          '不是,jpeg,.png,.jpg,.bmp,.gif文件,请上传正确的图片类型'
        )
        return false
      }
    },
    /** on-change：文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 */
    handleChange (file, fileList) {
      this.form.imageUrl = URL.createObjectURL(file.raw);
    },
    successUpload () {
      this.handleClose()
      this.$nextTick(() => {
        this.$store.commit('SET_AVATAR', this.form.imageUrl) //提交更新后的avatar到vuex里,注意这里提交的是向后台发送请求获取的avatar，而不是从vuex里获取再给vuex，这样没意义的。所以是this.form.avatar而不是this.avatar
      });
    },
    /** 更换头像的表单提交回调函数 */
    submitForm (formName) {
      let vm = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          vm.$refs.upload.submit();
          // this.handleClose()
          /** this.getUserInfo()  ；在这里写this.getUserInfo()不是响应式的，可能是因为这没有跟其他一样写在this.$axios.post(xxx).then(res => {})的res函数里，
          而是用的vm.$refs.upload.submit()执行element ui的upload组件的submit，但是经测试是执行了getUserInfo()的，只不过不是响应式的，手动刷新就出来了。人家也提供了上传成功时的钩子函数:on-success,所以我写在了这里面就生效了并且是响应式的【原因难道是element ui修改了upload的响应式给on-success？？？】*/
        } else {
          return false;
        }
      });
    },
    /** 这个是element ui的dialog的:before-close="handleClose"，注意有的NavMenu也有这个回调，注意别混了 */
    handleClose () {
      this.dialogVisible = false
    },
  }
}
</script>

<style>
.banner {
  width: 100%;
  height: 140px;
  background: url(~@/assets/userCenterBg.png);
}
.userinfoForUsername {
  float: left;
  position: relative;
  color: white;
  font-family: "Helvetica Neue";
  font-size: 3ex;
  margin-top: 3%;
  margin-left: 2%;
}
.userinfoForGender {
  float: left;
  position: relative;
  color: white;
  font-family: "Helvetica Neue";
  font-size: 2ex;
  margin-top: 6%;
  margin-left: -4.3%;
}
.NavMenu1 {
  float: left;
  position: relative;
  margin-top: 5%;
  margin-left: -10%;
}
a {
  text-decoration: none;
}
.avatar_box {
  float: left;
  position: relative;
  margin-top: 1.5%;
  margin-left: 1%;
  clear: both;
  border-radius: 100%;
}
.avatar_box :hover {
  box-shadow: rgb(0, 0, 255) 10px 10px 60px -10px;
}
input[type="file"] {
  display: none;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>