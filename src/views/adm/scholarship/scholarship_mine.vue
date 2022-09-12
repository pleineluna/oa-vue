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
    <!-- <el-empty在<el-table>中会自动进行判断，不需要像这样手动判断 -->
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
                         type="success"
                         @click="infoHandler (item.usefulId)">申请详细信息</el-button>
            </div>
          </el-card>
          </br>
        </el-col>
      </el-row>
    </template>
    <!--对话框-->
    <el-dialog title="奖学金申请详细信息"
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
      </template>
      </br>
    </el-dialog>

  </div>

</template>

<script>
import dayjs from 'dayjs';
export default {
  name: "scholarship_apply",
  data () {
    return {
      isEmpty: true,
      dialogVisible: false,
      searchForm: {
        name: ''
      },
      scholarShipList: [],
      //描述项对象
      userInfo: [],
      descriptions: [],
      supplyInfos: [],
    }
  },
  methods: {
    getScholarShipList () {
      this.loading = true
      this.$axios.get("/adm/scholarship/Myscholarship", {
        //axios的get请求可以通过 params 对象传递参数。 
        //通过params传递realname、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          name: this.searchForm.name,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        var resData = res.data.data
        if (resData.length > 0) { this.isEmpty = false } else { this.isEmpty = true }
        //需要新建一个数组存储admScholarship，然后才能给表格。为什么？因为你获取的admScholarship是record的一个属性，并不是record，record是申请记录表也就是用户-申请奖学金记录表，具体参考返回的json数据。
        var admScholarships = []
        resData.forEach(function (value, index, array) {
          value.admScholarshipDto.startTime = dayjs(value.admScholarshipDto.startTime).format('YYYY-MM-DD HH:mm:ss')
          value.admScholarshipDto.endTime = dayjs(value.admScholarshipDto.endTime).format('YYYY-MM-DD HH:mm:ss')
          if (value.admScholarshipDto.fixedMoney == 1) { value.admScholarshipDto.fixedMoney = '是' }
          else { value.admScholarshipDto.fixedMoney = '否' }
          admScholarships.push(value.admScholarshipDto)
        })
        this.scholarShipList = admScholarships
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
    //页面关闭执行的回调函数，绑定在<el-dialog>的:before-close="handleClose"属性中。
    handleClose () {
      this.dialogVisible = false
    },
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