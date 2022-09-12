<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-select v-model="searchForm.type"
                   placeholder="奖学金类别">
          <el-option label="所有类别"
                     value="所有类别"></el-option>
          <el-option v-for="val in Options"
                     :key="val.id"
                     :value="val.name"
                     :label="val.name" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchForm.realname"
                  placeholder="申请人姓名"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getApplyScholarshipList()">搜索</el-button>
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

    <template slot="empty">
      <el-empty :image-size="400"></el-empty>
    </template>
    <!--注意 row-key="usefulId" ，因为tableData实际上是admScholarships，所以后端在AdmScholarshipDto添加usefulId属性存储本次本类奖学金申请表AdmScholarshipSysUserDto的主键id-->
    <el-table ref="multipleTable"
              :data="tableData"
              v-loading="loading"
              row-key="usefulId"
              tooltip-effect="dark"
              style="width: 100%"
              border
              stripe
              @selection-change="handleSelectionChange">
      <template slot="empty">
        <el-empty :image-size="400"></el-empty>
      </template>
      <el-table-column type="selection"
                       width="45">
      </el-table-column>
      <el-table-column prop="name"
                       header-align="center"
                       align="center"
                       label="奖学金名称" />
      <el-table-column prop="realname"
                       header-align="center"
                       align="center"
                       label="申请人姓名" />
      <el-table-column prop="idNumber"
                       header-align="center"
                       align="center"
                       label="申请人学号" />
      <el-table-column prop="userSpecializedSubjectName"
                       header-align="center"
                       align="center"
                       label="申请人专业" />
      <el-table-column prop="userClassName"
                       header-align="center"
                       align="center"
                       label="申请人班级" />
      <el-table-column header-align="center"
                       align="center"
                       label="等级名称">
        <template #default="scope">
          <el-tag size="small"
                  type="danger">{{ scope.row.level}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="year"
                       header-align="center"
                       align="center"
                       label="评定学年"
                       min-width="100" />
      <el-table-column prop="semester"
                       header-align="center"
                       align="center"
                       label="评定学期"
                       min-width="70" />
      <el-table-column prop="amountOfMoney"
                       header-align="center"
                       align="center"
                       label="金额(元人民币)"
                       min-width="80" />
      <el-table-column>
        <template slot-scope="scope">
          <el-button type="info"
                     plain
                     size="mini"
                     @click="infoHandler(scope.row.usefulId)">详情信息
          </el-button>
          <el-popconfirm title="这是一段内容确定删除吗？"
                         @confirm="delHandle(scope.row.usefulId)">
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

    <!--对话框-->
    <el-dialog title="奖学金申请详细信息"
               :visible.sync="dialogVisible"
               width="1300px"
               :before-close="handleClose">
      <el-descriptions title="申请人基本信息"
                       :column="3"
                       border>
        <el-descriptions-item label="姓名">{{userInfo.realname}}</el-descriptions-item>
        <el-descriptions-item label="性别">{{userInfo.gender}}</el-descriptions-item>
        <el-descriptions-item label="民族">{{userInfo.nation}}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{userInfo.idNo}}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{userInfo.politicalOutlook}}</el-descriptions-item>
        <el-descriptions-item label="银行账号">{{userInfo.bankAccount}}</el-descriptions-item>
        <el-descriptions-item label="学号">{{userInfo.idNumber}}</el-descriptions-item>
        <el-descriptions-item label="专业">{{supplyInfos.userSpecializedSubjectName}}</el-descriptions-item>
        <el-descriptions-item label="班级">{{supplyInfos.userClassName}}</el-descriptions-item>
      </el-descriptions>
      </br>
      <el-descriptions title="申请奖学金信息"
                       :column="3"
                       border>
        <el-descriptions-item label="奖学金名称">{{descriptions.name}}</el-descriptions-item>
        <el-descriptions-item label="评定学年">{{descriptions.year}}</el-descriptions-item>
        <el-descriptions-item label="评定学期">{{descriptions.semester}}</el-descriptions-item>
        <el-descriptions-item label="等级名称">
          <el-tag size="small"
                  type="danger">{{descriptions.level}}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="金额(元人民币)">{{descriptions.amountOfMoney}}</el-descriptions-item>
        <el-descriptions-item label="是否固定金额">{{descriptions.fixedMoney}}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{supplyInfos.created}}</el-descriptions-item>
        <el-descriptions-item label="申请开始时间">{{descriptions.startTime}}</el-descriptions-item>
        <el-descriptions-item label="申请结束时间">{{descriptions.endTime}}</el-descriptions-item>

      </el-descriptions>
      </br>
      <h1>
        申请理由
      </h1>
      <span>{{supplyInfos.applyDesc}}</span>
      </br>
      <h1>
        申请状态
      </h1>
      <h2 style="color:green;font-weight:700"
          v-if="supplyInfos.status=='approved'">——同意</h2>
      <h2 style="color:red;font-weight:700"
          v-if="supplyInfos.status=='refused'">——拒绝</h2>
      <h2 style="color:orange;font-weight:700"
          v-if="supplyInfos.status=='processing'">——处理中</h2>
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

      Options: [],

      //待审批请假单表格记录的数据。数据会向后端发起请求获取。
      tableData: [],

      //描述项对象
      userInfo: [],
      descriptions: [],
      supplyInfos: [],

      //分页参数的定义并设置默认参数
      total: 20,
      size: 10,
      current: 1,

      //审批对话框可显示性的标识
      dialogVisible: false,


      //"批量删除"按钮是否可禁用的标识。为了实现批量选择的数目为0时禁用"批量删除"的逻辑。
      delBtlStatu: true,
    }
  },
  created () {
    this.getApplyScholarshipList()
    this.getScholarshipCategoryList()
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
      this.getNoticeList() //重新从后端获取新的Page对象实现每页显示多少条记录的逻辑
    },
    //elment ui文档提供的分页组件"当前页"改变触发的回调函数，绑定在<el-pagination>的@current-change="handleCurrentChange"属性中
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getNoticeList() //重新从后端获取新的Page对象实现当前第几页的逻辑
    },
    /**
     * 动态获取奖学金类别给下拉框选项
     */
    getScholarshipCategoryList () {
      this.$axios.get("adm/scholarship/getScholarshipCategoryList").then(res => {
        this.Options = res.data.data
      })
    },
    //删除、批量删除用的回调函数
    delHandle (id) {
      var ids = []
      if (id) {
        ids.push(id) //单个删除的情况，传入具体id
      } else {
        this.multipleSelection.forEach(row => {
          ids.push(row.usefulId) //传入null是批量删除的情况,注意此处应该是usefulId，为什么是这个，看tableData的数据格式
        })
      }
      console.log(ids)
      this.$axios.post("/adm/scholarship/delete", ids).then(res => {
        if (res.data.data) {
          this.$message({
            showClose: true,
            message: '恭喜你，操作成功',
            type: 'success',
            showClose: true,
          });
        } else {
          this.$message({
            showClose: true,
            message: '删除失败',
            type: 'error',
            showClose: true,
          });
        }

        this.getApplyScholarshipList()
      })
    },
    getApplyScholarshipList () {
      this.loading = true
      this.$axios.get("/adm/scholarship/getApplyScholarshipList", {
        //axios的get请求可以通过 params 对象传递参数。 (POST 请求是通过data属性项传递)
        //通过params传递realname、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          realname: this.searchForm.realname,
          type: this.searchForm.type,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        /*因为后端传来的是Page对象，所以"records"属性并不是我们定义的，是Page对象中的属性，诸如"current"、"size"、"total"等也是
         *"records"属性存放查询的记录。
         *下面操作获取查询到的记录数据、分页数据 
         */
        var resData = res.data.data.records
        //需要新建一个数组存储admScholarship，然后才能给表格。为什么？因为你获取的admScholarship是record的一个属性，并不是record，record是申请记录表也就是用户-申请奖学金记录表，具体参考返回的json数据。
        var admScholarships = []
        resData.forEach(function (value, index, array) {
          value.admScholarshipDto.startTime = dayjs(value.admScholarshipDto.startTime).format('YYYY-MM-DD HH:mm:ss')
          value.admScholarshipDto.endTime = dayjs(value.admScholarshipDto.endTime).format('YYYY-MM-DD HH:mm:ss')
          admScholarships.push(value.admScholarshipDto)
        })
        this.tableData = admScholarships
        this.size = res.data.data.size
        this.current = res.data.data.current
        this.total = res.data.data.total
        this.loading = false
      })
    },
    infoHandler (id) {
      this.$axios.get('/adm/scholarship/Myscholarshipinfo/' + id).then(res => {
        var resData = res.data.data
        if (resData.admScholarshipDto.fixedMoney == 1) { resData.admScholarshipDto.fixedMoney = "是" }
        else { resData.admScholarshipDto.fixedMoney = "否" }
        if (resData.admScholarshipDto.statu == 1) { resData.admScholarshipDto.statu = "开放" }
        else { resData.admScholarshipDto.statu = "未开放" }
        if (resData.sysUser.gender == 1) { resData.sysUser.gender = "男" }
        else { resData.sysUser.gender = "女" }
        resData.created = dayjs(resData.created).format('YYYY-MM-DD HH:mm:ss')
        resData.admScholarshipDto.startTime = dayjs(resData.admScholarshipDto.startTime).format('YYYY-MM-DD HH:mm:ss')
        resData.admScholarshipDto.endTime = dayjs(resData.admScholarshipDto.endTime).format('YYYY-MM-DD HH:mm:ss')
        this.descriptions = resData.admScholarshipDto
        this.userInfo = resData.sysUser
        this.supplyInfos.created = resData.created
        this.supplyInfos.applyDesc = resData.applyDesc
        this.supplyInfos.userClassName = resData.admScholarshipDto.userClassName
        this.supplyInfos.userSpecializedSubjectName = resData.admScholarshipDto.userSpecializedSubjectName
        this.supplyInfos.status = resData.status
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