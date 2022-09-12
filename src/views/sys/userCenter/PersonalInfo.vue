<template>
  <div class="show_area">
    <el-descriptions title="个人基本信息"
                     :column="3"
                     border>
      <el-descriptions-item label="用户名">{{userInfo.username}}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{userInfo.email}}</el-descriptions-item>
      <el-descriptions-item label="籍贯城市">{{userInfo.city}}</el-descriptions-item>
      <el-descriptions-item label="真实姓名">{{userInfo.realname}}</el-descriptions-item>
      <el-descriptions-item label="性别">{{userInfo.gender}}</el-descriptions-item>
      <el-descriptions-item label="民族">{{userInfo.nation}}</el-descriptions-item>
      <el-descriptions-item label="身份证号">{{userInfo.idNo}}</el-descriptions-item>
      <el-descriptions-item label="政治面貌">{{userInfo.politicalOutlook}}</el-descriptions-item>
      <el-descriptions-item label="学号">{{userInfo.idNumber}}</el-descriptions-item>
      <el-descriptions-item label="银行账号">{{userInfo.bankAccount}}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{userInfo.phone}}</el-descriptions-item>
    </el-descriptions>
    <div class="button_changeInfo">
      <el-button type="primary"
                 @click="changePersonalInfo()">修改个人信息</el-button>
    </div>
    <!--新增对话框-->
    <el-dialog title="提示"
               :visible.sync="dialogVisible"
               width="600px"
               :before-close="handleClose">

      <el-form :model="editForm"
               ref="editForm"
               :rules="rules"
               class="demo-ruleForm">
        <el-form-item label="用户名"
                      prop="username"
                      label-width="130px">
          <el-input v-model="editForm.username"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="邮箱"
                      prop="email"
                      label-width="130px">
          <el-input v-model="editForm.email"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="银行账号"
                      prop="bankAccount"
                      label-width="130px">
          <el-input v-model="editForm.bankAccount"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="手机号"
                      prop="phone"
                      label-width="130px">
          <el-input v-model="editForm.phone"
                    autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="handleClose()">取 消</el-button>
        <el-button type="primary"
                   @click="submitForm('editForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PersonalInfo',
  data () {
    return {
      userInfo: {},
      dialogVisible: false, //新增修改对话框的可显示标识
      editForm: {
        username: '',
        email: '',
        bankAccount: '',
        phone: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ],
        bankAccount: [
          { required: true, message: '请输入银行账号', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ],
      },
    }
  },
  created () {
    this.getUserInfo()
  },
  methods: {
    getUserInfo () {
      this.$axios.get("/sys/user/sysUserInfo").then(res => {
        var resData = res.data.data
        if (resData.gender == 1) { resData.gender = "男" }
        else { resData.gender = "女" }
        this.userInfo = resData;
      })
    },

    PersonalInfobackfill () {
      this.$axios.get("/sys/user/sysUserInfo").then(res => {
        var resData = res.data.data
        this.editForm.username = resData.username
        this.editForm.email = resData.email
        this.editForm.bankAccount = resData.bankAccount
        this.editForm.phone = resData.phone
      })
    },
    changePersonalInfo () {
      this.dialogVisible = true
      this.PersonalInfobackfill()
    },
    submitForm () {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          this.$axios.post("/sys/user/changePersonalInfo", this.editForm).then(res => {
            this.$message({
              showClose: true,
              message: '恭喜你，操作成功',
              type: 'success',
              onClose: () => {
              }
            });
            this.handleClose()
            this.getUserInfo()
          })
        } else {
          console.log('error update!!');
          return false;
        }
      })

    },
    handleClose () {
      this.dialogVisible = false
    },

  },
}
</script>

<style>
.show_area {
  height: 80%;
  width: 80%;
  margin-left: 10%;
  margin-top: 5%;
}
.button_changeInfo {
  float: left;
  position: relative;
  margin-top: 1%;
}
</style>