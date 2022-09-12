<template>
  <el-form :model="ruleForm"
           :rules="rules"
           ref="ruleForm"
           label-width="100px"
           class="demo-ruleForm">
    <template v-if="ruleForm.isStudent">
      <el-form-item label="班级"
                    prop="className">
        <el-input v-model="ruleForm.className"
                  :disabled="true"></el-input>
      </el-form-item>
    </template>
    <template v-if="!ruleForm.isStudent">
      <el-form-item label="职位"
                    prop="className">
        <el-input v-model="ruleForm.className"
                  :disabled="true"></el-input>
      </el-form-item>
    </template>
    <el-form-item label="申请人"
                  prop="realname">
      <el-input v-model="ruleForm.realname"
                :disabled="true"></el-input>
    </el-form-item>
    <el-form-item label="请假时间"
                  required>
      <el-col :span="11">
        <el-form-item prop="startTime"
                      ref="startTime">
          <el-date-picker type="date"
                          placeholder="选择日期"
                          v-model="ruleForm.startTime"
                          style="width: 100%"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          :picker-options="pickerOptions"></el-date-picker>
        </el-form-item>
      </el-col>
      <el-col class="line"
              :span="2">——</el-col>
      <el-col :span="11">
        <el-form-item prop="endTime"
                      ref="endTime">
          <el-date-picker type="date"
                          placeholder="选择日期"
                          v-model="ruleForm.endTime"
                          style="width: 100%"
                          value-format="yyyy-MM-dd HH:mm:ss"
                          :picker-options="pickerOptions"></el-date-picker>
        </el-form-item>
      </el-col>
    </el-form-item>
    <el-form-item label="请假类别"
                  prop="formType"
                  ref="formType">
      <el-radio-group v-model="ruleForm.formType">
        <el-radio :label="1">事假</el-radio>
        <el-radio :label="2">病假</el-radio>
        <el-radio :label="3">工伤假</el-radio>
        <el-radio :label="4">婚假</el-radio>
        <el-radio :label="5">产假</el-radio>
        <el-radio :label="6">丧假</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="请假原因"
                  prop="reason"
                  ref="reason">
      <el-input type="textarea"
                v-model="ruleForm.reason"></el-input>
    </el-form-item>
    <el-form-item style="text-align: center">
      <el-button type="primary"
                 @click="submitForm('ruleForm')">立即申请</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      ruleForm: {
        className: "",
        realname: "",
        startTime: "",
        endTime: "",
        formType: "",
        reason: "",
        //判断身份是学生还是其他
        isStudent: true
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
      rules: {
        className: [
          { required: true, message: "请输入班级名称", trigger: "blur" },
        ],
        realname: [
          { required: true, message: "请输入申请人名称", trigger: "blur" },
          {
            min: 2,
            max: 12,
            message: "长度在 2 到 12 个字符",
            trigger: "blur",
          },
        ],
        startTime: [
          {
            type: "string",
            required: true,
            message: "请选择日期",
            trigger: "change",
          },
        ],
        endTime: [
          {
            type: "string",
            required: true,
            message: "请选择时间",
            trigger: "change",
          },
        ],
        formType: [
          { required: true, message: "请选择请假类型", trigger: "change" },
        ],
        reason: [
          { required: true, message: "请填写请假原因", trigger: "blur" },
        ],
      },
    };
  },
  created () {
    this.getBaseInfo()
  },
  methods: {
    getBaseInfo () {
      this.$axios.get("/adm/leave/form/baseInfo/")
        .then(res => {
          this.ruleForm.className = res.data.data.position
          this.ruleForm.realname = res.data.data.realname
          if (this.ruleForm.className == "导员" || this.ruleForm.className == "书记") {
            this.ruleForm.isStudent = false
          } else {
            this.ruleForm.isStudent = true
          }
          console.log(this.ruleForm.isStudent)
        })
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/adm/leave/form/create/', this.ruleForm)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
                onClose: () => {
                }
              });
              this.$refs['startTime'].resetField();
              this.$refs['endTime'].resetField();
              this.$refs['formType'].resetField();
              this.$refs['reason'].resetField();
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },

  },
};
</script>

<style scoped>
.el-form {
  margin: 0% auto;
  width: 45%;
  padding-top: 5%;
}
</style>