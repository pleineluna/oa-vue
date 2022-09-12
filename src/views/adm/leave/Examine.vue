<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.realname"
                  placeholder="姓名"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getLeaveFormList()">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData"
              v-loading="loading"
              row-key="id"
              tooltip-effect="dark"
              style="width: 100%"
              border
              stripe>
      <template slot="empty">
        <el-empty :image-size="400"></el-empty>
      </template>
      <el-table-column prop="realname"
                       label="姓名"
                       show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="position"
                       label="班级或职位"
                       show-overflow-tooltip>
      </el-table-column>

      <el-table-column prop="created"
                       label="申请时间">
      </el-table-column>

      <el-table-column prop="formType"
                       label="请假类型"
                       show-overflow-tooltip>
        <template slot-scope="scope">
          <el-tag size="max"
                  v-if="scope.row.formType == '1'"
                  type="primary">事假</el-tag>
          <el-tag size="max"
                  v-if="scope.row.formType == '2'"
                  type="danger">病假</el-tag>
          <el-tag size="max"
                  v-if="scope.row.formType == '3'"
                  type="danger">工伤假</el-tag>
          <el-tag size="max"
                  v-if="scope.row.formType == '4'"
                  type="primary">婚假</el-tag>
          <el-tag size="max"
                  v-if="scope.row.formType == '5'"
                  type="warning">产假</el-tag>
          <el-tag size="max"
                  v-if="scope.row.formType == '6'"
                  type="info">丧假</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="startTime"
                       label="起始时间">
      </el-table-column>

      <el-table-column prop="endTime"
                       label="结束时间">
      </el-table-column>

      <el-table-column>
        <template slot-scope="scope">
          <el-button type="danger"
                     round
                     @click="examineHandle(scope.row.id)">审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="block">
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     layout="total, sizes, prev, pager, next, jumper"
                     :page-sizes="[10, 20, 50, 100]"
                     :current-page.sync="current"
                     :page-size="size"
                     :total="total">
      </el-pagination>
    </div>

    <!--新增对话框-->
    <el-dialog title="请假审批"
               :visible.sync="dialogVisible"
               width="600px"
               :before-close="handleClose">

      <template>
        <el-descriptions title="请假单信息"
                         :border="true"
                         :column="2">
          <el-descriptions-item label="姓名">{{description.realname}}</el-descriptions-item>
          <el-descriptions-item label="班级或职位">{{description.position}}</el-descriptions-item>
          <el-descriptions-item label="起始时间">{{description.startTime}}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{description.endTime}}</el-descriptions-item>
          <el-descriptions-item label="请假原因">{{description.reason}}</el-descriptions-item>
        </el-descriptions>
      </template>
      </br>

      <el-form :model="editForm"
               :rules="rules"
               ref="editForm"
               label-width="100px"
               class="demo-editForm">
        <el-form-item label="是否同意"
                      prop="result">
          <el-select v-model="editForm.result"
                     placeholder="请选择是否同意">
            <el-option label="同意"
                       value="approved"></el-option>
            <el-option label="驳回"
                       value="refused"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="审批意见"
                      prop="review"
                      label-width="100px">
          <el-input v-model="editForm.review"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary"
                     @click="submitForm('editForm')">确认提交</el-button>
        </el-form-item>
      </el-form>

    </el-dialog>

  </div>
</template>

<script>
import dayjs from 'dayjs';
export default {
  name: "Examine",
  data () {
    return {
      loading: false,//loading标识符
      //创建searchForm{}对象，因为是弱语言，所以属性可以赋值时自动帮我们定义，比如searchForm.name赋值时就会自动帮我们添加name属性。
      searchForm: {
        realname: ""
      },

      //分页参数的定义并设置默认参数
      total: 20,
      size: 10,
      current: 1,

      //审批对话框可显示性的标识
      dialogVisible: false,

      //描述项对象
      description: {},

      //任务id  
      taskId: '',

      //审批表单的数据。 
      editForm: {
        result: '',
        review: ''
      },

      //待审批请假单表格记录的数据。数据会向后端发起请求获取。
      tableData: [],

      rules: {
        review: [
          { required: true, message: '请输入审批意见', trigger: 'blur' },
        ],
        result: [
          { required: true, message: '请选择是否同意', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.getLeaveFormList()
  },
  methods: {
    //elment ui文档提供的分页组件"每页页数"改变触发的回调函数，绑定在<el-pagination>的@size-change="handleSizeChange"属性中
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.size = val
      this.getLeaveFormList() //重新从后端获取新的Page对象实现每页显示多少条记录的逻辑
    },
    //elment ui文档提供的分页组件"当前页"改变触发的回调函数，绑定在<el-pagination>的@current-change="handleCurrentChange"属性中
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getLeaveFormList() //重新从后端获取新的Page对象实现当前第几页的逻辑
    },
    //elment ui文档提供的Form表单重设回调函数。供表单中"重置"按钮或其他方法调用
    resetForm (formName) {
      this.$refs[formName].resetFields();
      this.dialogVisible = false
      this.editForm = {}
    },
    //页面关闭执行的回调函数，绑定在<el-dialog>的:before-close="handleClose"属性中。
    handleClose () {
      this.resetForm('editForm')
    },
    /**
     * getLeaveFormList()函数的功能有两个
     * 1.获取表格数据 
     * 2.根据searchForm.idNumber获取表格数据，完成搜索逻辑。因为搜索无非就是显示符合搜索条件的表格数据，所以传递搜索条件（searchForm.idNumber）就可以实现搜索。
     * 后台会根据你是否传递搜索条件来查询数据库返回对应数据。
     */
    getLeaveFormList () {
      this.loading = true
      this.$axios.get("/adm/leave/form/list", {
        //axios的get请求可以通过 params 对象传递参数。 
        //通过params传递realname、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          realname: this.searchForm.realname,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        /*因为后端传来的是Page对象，所以"records"属性并不是我们定义的，是Page对象中的属性，诸如"current"、"size"、"total"等也是
         *"records"属性存放查询的记录。
         *下面操作获取查询到的记录数据、分页数据 
         */
        var resData = res.data.data.records
        resData.forEach(function (value, index, array) {
          value.startTime = dayjs(value.startTime).format('YYYY-MM-DD')
          value.endTime = dayjs(value.endTime).format('YYYY-MM-DD')
        })
        this.tableData = resData
        this.size = res.data.data.size
        this.current = res.data.data.current
        this.total = res.data.data.total
        this.loading = false
      })
    },
    //审批提交用的回调函数
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.get('/adm/leave/form/audit/' + this.taskId + '/?' + 'result=' + this.editForm.result + '&review=' + this.editForm.review)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.getLeaveFormList()
              this.dialogVisible = false
              this.resetForm(formName)
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    //审批对话框回填用的回调函数
    examineHandle (id) {
      this.$axios.get('/adm/leave/form/info/' + id).then(res => {
        this.description = res.data.data
        this.taskId = res.data.data.taskId
        // console.log('*this.taskId:' + this.taskId)
        this.dialogVisible = true
      })
    },
  }
}
</script>

<style scoped>
.el-pagination {
  float: right;
  margin-top: 22px;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>