<template>
  <div>
    <el-form :inline="true"
             :model="searchForm"
             ref="searchForm">
      <el-form-item prop="name">
        <el-input v-model="searchForm.name"
                  placeholder="奖学金名称"
                  size="medium"
                  class="input"
                  clearable="clearable" />
      </el-form-item>
      <el-form-item>
        <el-button size="medium"
                   type="primary"
                   @click="getScholarShipList()">搜索</el-button>
        <el-button size="medium"
                   type="primary"
                   @click="dialogFormVisible = true">
          新增
        </el-button>
        <el-button size="medium"
                   type="danger"
                   @click="deleteHandle()"
                   :disabled="delBtlStatu">
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
    <el-table :data="dataList"
              row-key="id"
              border
              v-loading="dataListLoading"
              @selection-change="selectionChangeHandle"
              :cell-style="changeCellStyle"
              style="width: 100%;"
              size="medium">
      <el-table-column type="selection"
                       header-align="center"
                       align="center"
                       width="50" />
      <el-table-column prop="name"
                       header-align="center"
                       align="center"
                       min-width="200"
                       label="奖学金名称" />
      <el-table-column header-align="center"
                       align="center"
                       min-width="100"
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
      <el-table-column prop="fixedMoney"
                       header-align="center"
                       align="center"
                       label="是否固定金额"
                       min-width="80" />
      <el-table-column prop="startTime"
                       header-align="center"
                       align="center"
                       label="申请开始时间"
                       min-width="140" />
      <el-table-column prop="endTime"
                       header-align="center"
                       align="center"
                       label="申请结束时间"
                       min-width="140" />
      <el-table-column prop="statu"
                       header-align="center"
                       align="center"
                       label="奖学金状态"
                       min-width="70" />
      <el-table-column header-align="center"
                       align="center"
                       width="150"
                       label="操作">
        <template #default="scope">
          <el-button type="text"
                     size="medium"
                     @click="updateHandle(scope.row.id)">
            修改
          </el-button>
          <el-button type="text"
                     size="medium"
                     @click="deleteHandle(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    </br>
    <el-pagination @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle"
                   :current-page="pageIndex"
                   :page-sizes="[10, 20, 50]"
                   :page-size="pageSize"
                   :total="totalCount"
                   layout="total, sizes, prev, pager, next, jumper"
                   style="text-align:right">
    </el-pagination>

    <el-dialog title="奖学金类别管理"
               :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm"
               :rules="rules"
               ref="ruleForm"
               label-width="150px"
               class="demo-ruleForm"
               style="margin: 0% auto;width: 75%;">
        <el-form-item label="奖学金名称"
                      prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="奖学金等级"
                      prop="level">
          <el-input v-model="ruleForm.level"></el-input>
        </el-form-item>
        <el-form-item label="金额"
                      prop="amountOfMoney">
          <el-input type="number"
                    v-model.number="ruleForm.amountOfMoney"></el-input>
        </el-form-item>
        <el-form-item label="奖学金开放申请时间"
                      required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker type="date"
                              placeholder="选择日期"
                              v-model="ruleForm.startTime"
                              style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col class="line"
                  :span="2">————</el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker type="date"
                              placeholder="选择日期"
                              v-model="ruleForm.endTime"
                              style="width: 100%;"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="是否固定金额"
                      prop="fixedMoney">
          <el-select v-model="ruleForm.fixedMoney"
                     placeholder="请选择是否固定金额"
                     style="width: 100%;">
            <el-option label="是"
                       value="1"></el-option>
            <el-option label="否"
                       value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评定学年"
                      prop="year">
          <el-select v-model="ruleForm.year"
                     placeholder="请选择评定学年"
                     style="width: 100%;">
            <el-option label="2020-2021学年"
                       value="2020-2021学年"></el-option>
            <el-option label="2021-2022学年"
                       value="2021-2022学年"></el-option>
            <el-option label="2022-2023学年"
                       value="2022-2023学年"></el-option>
            <el-option label="2023-2024学年"
                       value="2023-2024学年"></el-option>
            <el-option label="2025-2026学年"
                       value="2025-2026学年"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="评定学期"
                      prop="semester">
          <el-select v-model="ruleForm.semester"
                     placeholder="请选择评定学期"
                     style="width: 100%;">
            <el-option label="不分学期"
                       value="不分学期"></el-option>
            <el-option label="上半学期"
                       value="上半学期"></el-option>
            <el-option label="下半学期"
                       value="下半学期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否开放"
                      prop="statu">
          <el-select v-model="ruleForm.statu"
                     placeholder="请选择是否开放"
                     style="width: 100%;">
            <el-option label="是"
                       value="1"></el-option>
            <el-option label="否"
                       value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="text-align: center">
          <el-button type="primary"
                     @click="submitForm('ruleForm')">确定</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  data () {
    return {
      searchForm: {
        name: ''
      },
      dataList: [],//表格table数据---element ui 规定表格table的:data="dataList"的数据是数组格式 dataList: []
      ruleForm: { fixedMoney: '', statu: '', },//创建或修改的form表单
      pageIndex: 1,
      pageSize: 10,
      totalCount: 0,
      dialogFormVisible: false,
      dataListSelections: [],
      dataListLoading: false,
      delBtlStatu: true,
      rules: {
        name: [
          { required: true, message: '请输入奖学金名称', trigger: 'blur' },
        ],
        level: [
          { required: true, message: '请输入奖学金等级', trigger: 'blur' },
        ],
        amountOfMoney: [
          { required: true, message: '金额不能为空' },
          { type: 'number', message: '金额必须为数字值' },
          { pattern: /^[+]{0,1}(\d+)$/, message: '金额必须大于零且为整数', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        fixedMoney: [
          { required: true, message: '请选择是否固定金额', trigger: 'change' }
        ],
        year: [
          { required: true, message: '请选择评定学年', trigger: 'change' }
        ],
        semester: [
          { required: true, message: '请选择评定学期', trigger: 'change' }
        ],
        statu: [
          { required: true, message: '请选择是否开放', trigger: 'change' }
        ],
      }
    };
  },
  methods: {
    getScholarShipList () {
      this.$axios.get('/adm/scholarship/scholarshipList', {
        //axios的get请求可以通过 params 对象传递参数。相当于："http://localhost:8080/sys/roles/list?name="普通用户"&current=1&size=10"
        //通过params传递name、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          name: this.searchForm.name,
          current: this.pageIndex,
          size: this.pageSize
        }
      }).then(res => {
        var resData = res.data.data.records
        if (resData.length > 0) { this.isEmpty = false } else { this.isEmpty = true }
        resData.forEach(function (value, index, array) {
          if (value.fixedMoney == 1) { value.fixedMoney = "是" }
          else { value.fixedMoney = "否" }
          if (value.statu == 1) { value.statu = "开放" }
          else { value.statu = "未开放" }
          value.startTime = dayjs(value.startTime).format('YYYY-MM-DD HH:mm:ss')
          value.endTime = dayjs(value.endTime).format('YYYY-MM-DD HH:mm:ss')
        });
        this.dataList = resData
        this.pageSize = res.data.data.size
        this.pageIndex = res.data.data.current
        this.totalCount = res.data.data.total

      })

    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //因为fixedMoney、statu在后台是Integer类型，所以这里提前判断做转换（如果你要转换，就需要在ruleForm里写进去这两个属性）。不能用else，因为你选择了之后就会校正成value的1/0,所以你用else的话不管怎么样都会变成else的设置。
          if (this.ruleForm.fixedMoney == '是') { this.ruleForm.fixedMoney = 1 }
          if (this.ruleForm.fixedMoney == '否') { this.ruleForm.fixedMoney = 0 }
          if (this.ruleForm.statu == '是') { this.ruleForm.statu = 1 }
          if (this.ruleForm.statu == '否') { this.ruleForm.statu = 0 }
          this.$axios.post('/adm/scholarship/' + (this.ruleForm.id ? 'update' : 'create'), this.ruleForm)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.dialogFormVisible = false
              this.$refs[formName].resetFields();
              this.getScholarShipList()
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    updateHandle: function (id) {
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.getScholarShipInfo(id)
      });
      this.$refs[formName].resetFields();
      this.getScholarShipList()

    },
    getScholarShipInfo (id) {
      this.$axios.get('/adm/scholarship/scholarshipInfo?id=' + id).then(res => {
        var resData = res.data.data
        if (resData.fixedMoney == 1) { resData.fixedMoney = "是" }
        else { resData.fixedMoney = "否" }
        if (resData.statu == 1) { resData.statu = "是" }
        else { resData.statu = "否" }
        this.ruleForm = resData//回填表格，如果你data中的ruleForm没有写明对象属性，只是ruleForm: {}简写格式，那么这里不要用对象属性赋值即： this.ruleForm.name = resp.data.data.name;如果data中的ruleForm写明了属性，那么可以这样做。否则会因为强制写死而不能自动分配导致不能修改并且报错。
      })
    },
    deleteHandle: function (id) {
      let that = this;
      var ids = []
      if (id) {
        ids.push(id) //单个删除的情况，传入具体id
      } else {
        this.dataListSelections.forEach(row => {
          ids.push(row.id) //传入null是批量删除的情况
        })
      }
      if (ids.length == 0) {
        that.$message({
          message: '没有选中记录',
          type: 'warning',
          duration: 1200
        });
      } else {
        that.$confirm(`确定要删除选中的记录？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          that.$axios.post('/adm/scholarship/deleteScholarshipByIds', ids).then(resp => {
            if (resp.data.data == true) {
              that.$message({
                message: '操作成功',
                type: 'success',
                duration: 1200
              });
              that.getScholarShipList();
            } else {
              that.$message({
                message: '未能删除记录',
                type: 'warning',
                duration: 1200
              });
            }
          });
        });
      }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields();
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
    selectionChangeHandle: function (val) {
      this.dataListSelections = val;
      //先=赋值，再==比较，得到布尔类型结果。含义是没有勾选的会通过delBtlStatu=0也就是false来禁用"批量删除"按钮
      this.delBtlStatu = val.length == 0
    },
    sizeChangeHandle: function (val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.loadDataList();
    },
    currentChangeHandle: function (val) {
      this.pageIndex = val;
      this.loadDataList();
    },
  },
  created () {
    this.getScholarShipList()
  },
}
</script>

<style>
</style>