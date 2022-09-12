<template>
  <div>
    <el-form ref="form"
             :model="form"
             label-width="80px"
             :rules="rules">
      <el-form-item label="通知主题"
                    prop="subjectContext"
                    ref="subjectContext">
        <el-input v-model="form.subjectContext"></el-input>
      </el-form-item>
      <el-form-item label="通知内容"
                    prop="content"
                    ref="content">
        <el-input type="textarea"
                  v-model="form.content"></el-input>
      </el-form-item>
      <el-form-item>
        <el-upload class="upload-demo"
                   action="http://localhost:8081/adm/notice/notify/fileUpload"
                   ref="upload"
                   name="file"
                   :headers="Myhead"
                   :on-preview="handlePreview"
                   :on-remove="handleRemove"
                   :before-remove="beforeRemove"
                   multiple
                   :limit="6"
                   :on-exceed="handleExceed"
                   :file-list="fileList"
                   :auto-upload="false">
          <el-button slot="trigger"
                     size="small"
                     type="primary">选取文件</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary"
                   @click="submitForm('form')">立即发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        subjectContext: '',
        content: '',
      },
      createdNotice: { noticeId: 0 }, //"发布通知"后创建的通知的id值。从后端的返回获取。目前用在后端/notify/fileUpload接口对附件标识到那个通知使用。
      fileList: [],
      rules: {
        subjectContext: [
          { required: true, message: '请输入通知主题', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 18 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入通知内容', trigger: 'blur' },
        ],
      }
    };
  },
  computed: {
    Myhead: {
      get () {
        return { Authorization: localStorage.getItem("token") }
      }
    }
  },
  watch: {
    createdNotice: {
      deep: true,
      handler () {
        let uploadFiles = this.$refs.upload.uploadFiles
        let formData = new FormData();
        uploadFiles.forEach(file => {
          formData.append('file', file.raw);
          formData.append('noticeId', this.createdNotice.noticeId)
        });
        this.$axios.post('/adm/notice/notify/fileUpload', formData)
          .then(res => {
            this.$refs['upload'].clearFiles();//清空已上传的文件列表（该方法不支持在 before-upload 中调用）
          })
      }
    }
  },
  methods: {
    handleRemove (file, fileList) {
      console.log(file, fileList);
    },
    handlePreview (file) {
      //点击文件列表中已上传的文件时的钩子,可以实现预览功能
      console.log(file);
    },
    handleExceed (files, fileList) {
      this.$message.warning(`当前限制选择 6 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/adm/notice/notify/', this.form)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
                onClose: () => {
                }
              });
              this.createdNotice.noticeId = res.data.data
              console.log("*************res.data.data****" + res.data.data)
              console.log("*************this.createdNotice.noticeId****" + this.createdNotice.noticeId)
              this.$refs['subjectContext'].resetField();
              this.$refs['content'].resetField();
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  }

}
</script>

<style>
.el-form {
  margin: 0% auto;
  width: 45%;
  padding-top: 5%;
}
</style>