<template>
  <el-dialog :title="!dataForm.id ? '新增' : '修改'"
             :close-on-click-modal="false"
             :visible="visible"
             :before-close="handleClose"
             width="430px">
    <el-form :model="dataForm"
             ref="dataForm"
             :rules="dataRule"
             label-width="80px">
      <el-form-item label="房间名称"
                    prop="name">
        <el-input v-model="dataForm.name"
                  size="medium"
                  style="width:100%"
                  clearable />
      </el-form-item>
      <el-form-item label="人数上限"
                    prop="max">
        <el-input v-model="dataForm.max"
                  size="medium"
                  style="width:100%"
                  clearable />
      </el-form-item>
      <el-form-item label="备注"
                    prop="desc">
        <el-input v-model="dataForm.desc"
                  style="width:100%"
                  size="medium"
                  maxlength="20"
                  clearable />
      </el-form-item>
      <el-form-item v-if="dataForm.id"
                    label="状态">
        <el-select v-model="dataForm.status"
                   class="input"
                   placeholder="状态"
                   size="medium">
          <el-option label="可使用"
                     value="1" />
          <el-option label="已停用"
                     value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="medium"
                   @click="visible = false">取消</el-button>
        <el-button type="primary"
                   size="medium"
                   @click="dataFormSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data: function () {
    return {
      visible: false,
      dataForm: {
        id: null,
        name: null,
        max: null,
        desc: null,
        status: 1
      },
      dataRule: {
        name: [{ required: true, pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,20}$', message: '会议室名称格式错误' }],
        max: [{ required: true, pattern: '^[1-9]\\d{0,4}$', message: '数字格式错误' }]
      }
    };
  },

  methods: {
    init: function (id) {
      let that = this;
      that.dataForm.id = id || 0;
      that.visible = true;
      that.$nextTick(() => {
        if (that.$refs['dataForm'] !== undefined) { that.$refs['dataForm'].resetFields(); }
        if (id) {
          that.$axios.post('/meeting_room/searchById', { id: id }).then(resp => {
            that.dataForm.name = resp.data.data.name;
            that.dataForm.max = resp.data.data.max + '';
            that.dataForm.desc = resp.data.data.desc;
            that.dataForm.status = resp.data.data.status + '';
          });
        }
      });
    },
    dataFormSubmit: function () {
      let that = this;
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          that.$axios.post(`/meeting_room/${!that.dataForm.id ? 'insert' : 'update'}`, that.dataForm).then(resp => {
            if (resp.data.data == 1) {
              that.$message({
                message: '操作成功',
                type: 'success',
                duration: 1200
              });
              that.visible = false;
              that.$emit('refreshDataList');
            } else {
              that.$message({
                message: '操作失败',
                type: 'error',
                duration: 1200
              });
            }
          }
          );
        }
      });
    },
    handleClose () {
      this.visible = false;
    }
  }
};
</script>

<style lang="less">
.el-form {
  margin-left: 0px;
  margin-right: 10px;
}
.el-dialog__footer {
  margin-right: 10px;
}
.note {
  margin-left: 20px;
  color: #999;
}
</style>
