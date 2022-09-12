<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.name"
                  placeholder="奖学金名称"
                  clearable>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getScholarShipList()">搜索</el-button>
      </el-form-item>
    </el-form>
    <template v-if="isEmpty">
      <el-empty :image-size="400"></el-empty>
    </template>
    <template v-if="!isEmpty">
      <el-row>
        <el-col :span="8"
                v-for="item in this.scholarShipList"
                :key="item.id">
          <el-card class="box-card">
            <div slot="header"
                 class="clearfix">
              <el-descriptions title="奖学金信息"
                               :column="1">
                <el-descriptions-item label="奖学金名称">{{item.name}}</el-descriptions-item>
                <el-descriptions-item label="评定学年">{{item.year}}</el-descriptions-item>
                <el-descriptions-item label="评定学期">{{item.semester}}</el-descriptions-item>
                <el-descriptions-item label="等级名称">
                  <el-tag size="small"
                          type="danger">{{item.level}}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="金额">{{item.amountOfMoney}}</el-descriptions-item>
                <el-descriptions-item label="是否固定金额">{{item.fixedMoney}}</el-descriptions-item>
              </el-descriptions>
              <el-button style="float: right; padding: 3px 0"
                         type="danger"
                         @click=" applyHandler (item.id)">申请</el-button>
            </div>
          </el-card>
          </br>
        </el-col>
      </el-row>
    </template>
    <el-dialog title="奖学金申请"
               :visible.sync="dialogFormVisible">
      <el-descriptions title="用户基本信息"
                       :column="3"
                       border>
        <el-descriptions-item label="姓名">{{userInfo.realname}}</el-descriptions-item>
        <el-descriptions-item label="性别">{{userInfo.gender}}</el-descriptions-item>
        <el-descriptions-item label="民族">{{userInfo.nation}}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{userInfo.idNo}}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{userInfo.politicalOutlook}}</el-descriptions-item>
        <el-descriptions-item label="银行账号">{{userInfo.bankAccount}}</el-descriptions-item>
        <el-descriptions-item label="学号">{{userInfo.idNumber}}</el-descriptions-item>
        <el-descriptions-item label="专业">{{this.specializedSubjectName}}</el-descriptions-item>
        <el-descriptions-item label="班级">{{this.className}}</el-descriptions-item>
      </el-descriptions>
      </br>
      </br>
      <el-descriptions title="奖学金信息"
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
        <el-descriptions-item label="申请开始时间">{{descriptions.startTime}}</el-descriptions-item>
        <el-descriptions-item label="申请结束时间">{{descriptions.endTime}}</el-descriptions-item>

      </el-descriptions>
      </br>
      </br>
      <el-form :model="form">
        <el-form-item label="申请描述">
          <el-input type="textarea"
                    v-model="form.applyDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="submitApplyHandler()">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import dayjs from 'dayjs';
export default {
  name: "scholarship_apply",
  data () {
    return {
      form: { applyDesc: '', scholarshipId: '' },
      isEmpty: true,
      dialogFormVisible: false,
      searchForm: {
        name: ''
      },
      scholarShipList: '',
      descriptions: '',
      userInfo: '',
      className: '',
      specializedSubjectName: '',
    }
  },
  methods: {
    getScholarShipList () {
      this.$axios.get('/adm/scholarship/scholarshipListStatuIsOpen?name=' + this.searchForm.name).then(res => {
        var resData = res.data.data
        if (resData.length > 0) { this.isEmpty = false } else { this.isEmpty = true }
        resData.forEach(function (value, index, array) {
          if (value.fixedMoney == 1) { value.fixedMoney = "是" }
          else { value.fixedMoney = "否" }
        });
        this.scholarShipList = resData

      })

    },
    applyHandler (id) {
      this.getScholarShipInfo(id)
      this.getLoginUserInfo()
      this.form.scholarshipId = id
      this.dialogFormVisible = true
    },
    submitApplyHandler () {
      let reqData = {
        applyDesc: this.form.applyDesc,
        scholarshipId: this.form.scholarshipId
      };
      this.$axios.post('/adm/scholarship/apply', reqData).then(res => {
        this.$message({
          showClose: true,
          message: '恭喜你，操作成功',
          type: 'success',
        });
        this.dialogFormVisible = false
      })
    },
    getScholarShipInfo (id) {
      this.$axios.get('/adm/scholarship/scholarshipInfo?id=' + id).then(res => {
        var resData = res.data.data
        resData.startTime = dayjs(resData.startTime).format('YYYY-MM-DD HH:mm:ss')
        resData.endTime = dayjs(resData.endTime).format('YYYY-MM-DD HH:mm:ss')
        if (resData.fixedMoney == 1) { resData.fixedMoney = "是" }
        else { resData.fixedMoney = "否" }
        this.descriptions = resData
      })
    },
    getLoginUserInfo () {
      this.$axios.get('/sys/user/sysUserInfo').then(res => {
        var resData = res.data.data
        if (resData.gender == 0) { resData.gender = '女' } else { resData.gender = '男' }
        this.userInfo = resData
      })
      this.$axios.get('/sys/user/sysUserClassAndSubject').then(res => {
        this.className = res.data.data.className
        this.specializedSubjectName = res.data.data.specializedSubjectName

      })
    }
  },
  created () {
    this.getScholarShipList()
  },

}
</script>

<style>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 95%;
}
</style>