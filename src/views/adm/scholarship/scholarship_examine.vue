<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.realname"
                  placeholder="申请人姓名"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getScholarshipList()">搜索</el-button>
      </el-form-item>
    </el-form>
    <!--注意 row-key="usefulId" ，因为tableData实际上是admScholarships，所以后端在AdmScholarshipDto添加usefulId属性存储本次本类奖学金申请表AdmScholarshipSysUserDto的主键id-->
    <el-table :data="tableData"
              v-loading="loading"
              row-key="usefulId"
              tooltip-effect="dark"
              style="width: 100%"
              border
              stripe>
      <template slot="empty">
        <el-empty :image-size="400"></el-empty>
      </template>
      <el-table-column prop="name"
                       header-align="center"
                       align="center"
                       min-width="200"
                       label="奖学金名称" />
      <el-table-column prop="realname"
                       header-align="center"
                       align="center"
                       min-width="80"
                       label="申请人姓名" />
      <el-table-column prop="idNumber"
                       header-align="center"
                       align="center"
                       min-width="140"
                       label="申请人学号" />
      <el-table-column prop="userSpecializedSubjectName"
                       header-align="center"
                       align="center"
                       min-width="140"
                       label="申请人专业" />
      <el-table-column prop="userClassName"
                       header-align="center"
                       align="center"
                       min-width="140"
                       label="申请人班级" />
      <el-table-column header-align="center"
                       align="center"
                       min-width="80"
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
          <el-button type="danger"
                     round
                     @click="examineHandle(scope.row.usefulId)">审批</el-button>
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
    <el-dialog title="奖学金申请审批"
               :visible.sync="dialogVisible"
               width="1300px"
               :before-close="handleClose">

      <template>
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

        <el-form-item style="text-align: right">
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

      //任务id  
      taskId: '',

      //审批表单的数据。 
      editForm: {
        result: '',
        review: ''
      },

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
    this.getScholarshipList()
  },
  methods: {
    //elment ui文档提供的分页组件"每页页数"改变触发的回调函数，绑定在<el-pagination>的@size-change="handleSizeChange"属性中
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.size = val
      this.getScholarshipList() //重新从后端获取新的Page对象实现每页显示多少条记录的逻辑
    },
    //elment ui文档提供的分页组件"当前页"改变触发的回调函数，绑定在<el-pagination>的@current-change="handleCurrentChange"属性中
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getScholarshipList() //重新从后端获取新的Page对象实现当前第几页的逻辑
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
     * getScholarshipList()函数的功能有两个
     * 1.获取表格数据 
     * 2.根据searchForm.idNumber获取表格数据，完成搜索逻辑。因为搜索无非就是显示符合搜索条件的表格数据，所以传递搜索条件（searchForm.idNumber）就可以实现搜索。
     * 后台会根据你是否传递搜索条件来查询数据库返回对应数据。
     */
    getScholarshipList () {
      this.loading = true
      this.$axios.get("/adm/scholarship/scholarshipListNeedToExamine", {
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
    //审批提交用的回调函数
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.get('/adm/scholarship/audit/' + this.taskId + '?' + 'result=' + this.editForm.result + '&review=' + this.editForm.review)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.getScholarshipList()
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
      this.$axios.get('/adm/scholarship/info/' + id).then(res => {
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
        this.taskId = resData.taskId
        this.supplyInfos.created = resData.created
        this.supplyInfos.applyDesc = resData.applyDesc
        this.supplyInfos.userClassName = resData.admScholarshipDto.userClassName
        this.supplyInfos.userSpecializedSubjectName = resData.admScholarshipDto.userSpecializedSubjectName
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