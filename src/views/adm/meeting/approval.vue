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
        <el-button @click="loadDataList()">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="approvalTable"
              :data="dataList"
              border="border"
              v-loading="dataListLoading"
              :cell-style="changeCellStyle"
              size="medium"
              style="width: 100%;"
              @expand-change="expand"
              :row-key="getRowKeys"
              :expand-row-keys="expands"
              tooltip-effect="dark"
              stripe>
      <template slot="empty">
        <el-empty :image-size="400"></el-empty>
      </template>
      <el-table-column prop="remark"
                       header-align="center"
                       align="center"
                       type="expand">
        <template #default="scope">
          <div class="content-container">
            <table class="content-table">
              <tbody>
                <el-descriptions title="会议单详情信息">
                  <el-descriptions-item label="主题">
                    <el-tag size="small">{{ scope.row.title }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="内容">
                    <el-tag size="small">{{ content.desc }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="日期">
                    <el-tag size="small">{{content.date}} / {{ content.start }} ~ {{ content.end }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="地点">
                    <el-tag size="small">{{ content.place }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="参会人">
                    <el-tag size="small">{{ content.members }}</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </tbody>
            </table>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index"
                       header-align="center"
                       align="center"
                       label="序号"
                       width="100" />
      <el-table-column prop="title"
                       header-align="center"
                       align="center"
                       label="审批事项"
                       min-width="400" />
      <el-table-column prop="meetingType"
                       header-align="center"
                       align="center"
                       label="类别"
                       min-width="180" />
      <el-table-column prop="realname"
                       header-align="center"
                       align="center"
                       label="申请人"
                       min-width="150" />
      <el-table-column prop="createTime"
                       header-align="center"
                       align="center"
                       label="发起日期"
                       min-width="180" />
      <el-table-column header-align="center"
                       align="center"
                       width="150"
                       label="操作">
        <template #default="scope">
          <el-button type="text"
                     size="medium"
                     @click="examineHandle(scope.row.id)">
            审批
          </el-button>
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
    <el-dialog title="会议审批"
               :visible.sync="dialogVisible"
               width="600px"
               :before-close="handleClose">

      <template>

        <el-descriptions title="会议单详情信息"
                         :border="true"
                         :column="2">
          <el-descriptions-item label="主题">
            {{ description.title }}
          </el-descriptions-item>
          <el-descriptions-item label="内容">
            {{description.desc}}
          </el-descriptions-item>
          <el-descriptions-item label="日期">
            {{description.date}} / {{ description.start }} ~ {{ description.end }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">
            {{ description.place }}
          </el-descriptions-item>
          <el-descriptions-item label="参会人">
            {{ description.members }}
          </el-descriptions-item>
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
export default {
  name: "Examine",
  data () {
    return {
      dataListLoading: false,
      dataForm: {
        creatorName: null,
        instanceId: null
      },
      dataList: [],
      content: {},
      expands: [],
      getRowKeys (row) {
        // alert(row.id)
        return row.id
      },

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
    this.loadDataList()
  },
  methods: {
    //获取展开按钮后的某个记录的详情信息
    expand: function (row, expandedRows) {
      let that = this;
      if (expandedRows.length > 0) {
        that.expands = [];
        if (row) {
          that.expands.push(row.id);
          that.$axios.post('/meeting/searchApprovalContent' + '/' + row.id).then(resp => {
            that.content = resp.data.data;
          });
        }
      } else {
        that.expands = [];
      }
    },
    // 获取数据列表
    loadDataList: function () {
      let that = this;
      that.dataListLoading = true;
      let data = {
        creatorName: that.dataForm.creatorName,
        instanceId: that.dataForm.instanceId,
        page: that.pageIndex,
        length: that.pageSize
      };
      that.$axios.post('/meeting/searchTaskByPage' + '/?realname=' + that.searchForm.realname, data).then(resp => {
        that.size = resp.data.data.size
        that.current = resp.data.data.current
        that.total = resp.data.data.total
        that.dataList = resp.data.data.records
        that.dataListLoading = false;
      });
    },
    //审批对话框回填用的回调函数
    examineHandle (id) {
      this.$axios.post('/meeting/searchApprovalContent' + '/' + id).then(res => {
        this.description = res.data.data
        console.log('*res.data.data.taskId:' + res.data.data.taskId)
        this.taskId = res.data.data.taskId
        this.dialogVisible = true
      })
    },
    //审批提交用的回调函数
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.get('/meeting/audit/' + this.taskId + '/?' + 'result=' + this.editForm.result + '&review=' + this.editForm.review)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.loadDataList()
              this.dialogVisible = false
              this.resetForm(formName)
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 表体字体颜色设置
    /***
     * row为某一行的除操作外的全部数据
     * column为某一列的属性
     * rowIndex为某一行（从0开始数起）
     * columnIndex为某一列（从0开始数起）
     */
    changeCellStyle () {
      return "padding: 4px 0"
    },

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