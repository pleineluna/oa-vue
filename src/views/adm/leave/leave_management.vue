<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-select v-model="searchForm.type"
                   placeholder="请假类型">
          <el-option label="所有类型"
                     value=""></el-option>
          <el-option label="事假"
                     value="1"></el-option>
          <el-option label="病假"
                     value="2"></el-option>
          <el-option label="工伤假"
                     value="3"></el-option>
          <el-option label="婚假"
                     value="4"></el-option>
          <el-option label="产假"
                     value="5"></el-option>
          <el-option label="丧假"
                     value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchForm.realname"
                  placeholder="姓名"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getLeaveList()">搜索</el-button>
      </el-form-item>
      <el-form-item>
        <el-popconfirm title="确定批量删除吗？"
                       @confirm="delHandle(null)">
          <el-button type="danger"
                     slot="reference"
                     :disabled="delBtlStatu">批量删除</el-button>
        </el-popconfirm>
      </el-form-item>
    </el-form>

    <el-table ref="multipleTable"
              :data="tableData"
              v-loading="loading"
              row-key="id"
              tooltip-effect="dark"
              style="width: 100%"
              border
              stripe
              @selection-change="handleSelectionChange">
      <template slot="empty">
        <el-empty :image-size="400"></el-empty>
      </template>
      <!--添加一个el-table-column设置属性type="selection"可以使table为多选表格。具体参考官网文档-->
      <el-table-column type="selection"
                       width="45">
      </el-table-column>
      <el-table-column prop="realname"
                       label="请假人"
                       show-overflow-tooltip>
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

      <el-table-column prop="reason"
                       label="请假原因">
      </el-table-column>

      <el-table-column prop="created"
                       label="申请时间"
                       show-overflow-tooltip>
      </el-table-column>

      <el-table-column>
        <template slot-scope="scope">
          <el-button type="info"
                     plain
                     size="mini"
                     @click="infoHandle(scope.row.id)">详情信息
          </el-button>
          <el-popconfirm title="这是一段内容确定删除吗？"
                         @confirm="delHandle(scope.row.id)">
            <el-button type="danger"
                       size="mini"
                       slot="reference">删除</el-button>
          </el-popconfirm>
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
    <el-dialog title="详情信息"
               :visible.sync="dialogVisible"
               width="600px">

      <template>
        <el-descriptions title="请假详情信息"
                         :border="true"
                         direction="vertical"
                         :column="1">
          <el-descriptions-item label="请假人">{{description.realname}}</el-descriptions-item>
          <el-descriptions-item label="请假类型">{{description.formType}}</el-descriptions-item>
          <el-descriptions-item label="请假原因">{{description.reason}}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{description.created}}</el-descriptions-item>
          <el-descriptions-item label="请假时长">{{description.startTime}}~{{description.endTime}}</el-descriptions-item>
          <el-descriptions-item label="审批结果"
                                v-if="description.identity != 3">{{description.state}}</el-descriptions-item>
          <el-descriptions-item label="审批结果"
                                v-if="description.identity == 3">书记请假申请，系统自动通过。</el-descriptions-item>
          <el-descriptions-item label="导员审批意见"
                                v-if="description.identity == 1">{{description.commentOfGuider}}</el-descriptions-item>
          <el-descriptions-item label="书记审批意见"
                                v-if="description.identity == 1 && description.whetherAuditSecretary=='yes' ">{{description.commentOfSecretary}}</el-descriptions-item>
          <el-descriptions-item label="书记审批意见"
                                v-if="description.identity == 2">{{description.commentOfSecretary}}</el-descriptions-item>

        </el-descriptions>
      </template>
      </br>
    </el-dialog>
  </div>
</template>
<script>
import dayjs from 'dayjs';
export default {
  name: "notice_management",
  data () {
    return {
      loading: false,//loading标识符
      //创建searchForm{}对象，因为是弱语言，所以属性可以赋值时自动帮我们定义，比如searchForm.name赋值时就会自动帮我们添加name属性。
      searchForm: {
        realname: "",
        type: ''
      },

      //分页参数的定义并设置默认参数
      total: 20,
      size: 10,
      current: 1,

      //对话框可显示性的标识
      dialogVisible: false,

      //描述项对象
      description: {},

      //表格记录的数据。数据会向后端发起请求获取。
      tableData: [],

      //"批量删除"按钮是否可禁用的标识。为了实现批量选择的数目为0时禁用"批量删除"的逻辑。
      delBtlStatu: true,
    }
  },
  created () {
    this.getLeaveList()
  },
  methods: {
    //elment ui文档提供的勾选触发的回调函数，绑定在<el-table>的@selection-change="handleSelectionChange"属性中
    //其中val值是勾选对象的Array形式，val中的item.id就是行数据的id
    handleSelectionChange (val) {
      console.log("勾选")
      console.log(val)
      this.multipleSelection = val; //通过此处来确定表格中被批量勾选的所有记录对象的数组

      //先=赋值，再==比较，得到布尔类型结果。含义是没有勾选的旧通过delBtlStatu=0也就是false来禁用"批量删除"按钮
      this.delBtlStatu = val.length == 0
    },
    //elment ui文档提供的分页组件"每页页数"改变触发的回调函数，绑定在<el-pagination>的@size-change="handleSizeChange"属性中
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.size = val
      this.getLeaveList() //重新从后端获取新的Page对象实现每页显示多少条记录的逻辑
    },
    //elment ui文档提供的分页组件"当前页"改变触发的回调函数，绑定在<el-pagination>的@current-change="handleCurrentChange"属性中
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getLeaveList() //重新从后端获取新的Page对象实现当前第几页的逻辑
    },
    //删除、批量删除用的回调函数
    delHandle (id) {
      var ids = []
      if (id) {
        ids.push(id) //单个删除的情况，传入具体id
      } else {
        this.multipleSelection.forEach(row => {
          ids.push(row.id) //传入null是批量删除的情况
        })
      }
      console.log(ids)
      this.$axios.post("/adm/leave/form/delete", ids).then(res => {
        this.$message({
          showClose: true,
          message: '恭喜你，操作成功',
          type: 'success',
          showClose: true,
        });
        this.getLeaveList()
      })
    },
    /**
     * getLeaveList()函数的功能有两个
     * 1.获取表格数据 
     * 2.根据searchForm.idNumber获取表格数据，完成搜索逻辑。因为搜索无非就是显示符合搜索条件的表格数据，所以传递搜索条件（searchForm.idNumber）就可以实现搜索。
     * 后台会根据你是否传递搜索条件来查询数据库返回对应数据。
     */
    getLeaveList () {
      this.loading = true
      this.$axios.get("/adm/leave/form/allList", {
        //axios的get请求可以通过 params 对象传递参数。 (POST 请求是通过data属性项传递)
        //通过params传递realname、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          realname: this.searchForm.realname,
          type: this.searchForm.type,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        var arr = res.data.data.records
        this.tableData = arr
        this.size = res.data.data.size
        this.current = res.data.data.current
        this.total = res.data.data.total
        this.loading = false

      })
    },
    infoHandle (id) {
      this.$axios.get('/adm/leave/form/infoForManagementModel?id=' + id).then(res => {
        var resData = res.data.data
        if (resData.formType == 1) { resData.formType = "事假" }
        else if (resData.formType == 2) { resData.formType = "病假" }
        else if (resData.formType == 3) { resData.formType = "工伤假" }
        else if (resData.formType == 4) { resData.formType = "婚假" }
        else if (resData.formType == 5) { resData.formType = "产假" }
        else if (resData.formType == 6) { resData.formType = "丧假" }
        resData.startTime = dayjs(resData.startTime).format('YYYY-MM-DD')
        resData.endTime = dayjs(resData.endTime).format('YYYY-MM-DD')
        if (resData.state == "approved") { resData.state = "同意" }
        else if (resData.state == "refused") { resData.state = "拒绝" }
        else if (resData.state == "processing") { resData.state = "审批中" }
        this.description = resData
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