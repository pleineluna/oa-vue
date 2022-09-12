<template>
  <div>
    <template v-if="isEmpty">
      <el-empty :image-size="400"></el-empty>
    </template>
    <template v-if="!isEmpty">
      <el-row>
        <el-col :span="8"
                v-for="item in myLeave"
                :key="item.id">
          <el-card class="box-card">
            <div slot="header"
                 class="clearfix">
              <template>
                <el-descriptions title="请假单信息"
                                 :border="true"
                                 :column="1">
                  <el-descriptions-item label="起始时间">{{item.startTime}}</el-descriptions-item>
                  <el-descriptions-item label="结束时间">{{item.endTime}}</el-descriptions-item>
                  <el-descriptions-item label="请假原因">{{item.reason}}</el-descriptions-item>
                  <el-descriptions-item label="审批结果"
                                        v-if="item.state=='审批已通过'"><span style="color:green;font-weight:700">{{item.state}}</span></el-descriptions-item>
                  <el-descriptions-item label="审批结果"
                                        v-if="item.state=='审批被驳回'"><span style="color:red;font-weight:700">{{item.state}}</span></el-descriptions-item>
                  <el-descriptions-item label="审批结果"
                                        v-if="item.state=='正在审批'"><span style="color:orange;font-weight:400">{{item.state}}</span></el-descriptions-item>
                </el-descriptions>
              </template>
            </div>
          </el-card>
          </br>
        </el-col>
      </el-row>
    </template>
  </div>
</template>
<script>
import dayjs from 'dayjs';
export default {
  data () {
    return {
      isEmpty: true,
      myLeave: []
    }
  },
  created () {
    this.getMyLeaveList()
  },
  methods: {
    getMyLeaveList () {
      this.$axios.get('/adm/leave/form/myList')
        .then(res => {
          var resData = res.data.data
          if (resData.length == 0) {
            this.isEmpty = true
          } else {
            this.isEmpty = false
          }
          resData.forEach(function (value, index, array) {
            value.startTime = dayjs(value.startTime).format('YYYY-MM-DD')
            value.endTime = dayjs(value.endTime).format('YYYY-MM-DD')
            if (value.state == "approved") { value.state = "审批已通过" }
            else if (value.state == "processing") { value.state = "正在审批" }
            else { value.state = "审批被驳回" }
          });
          this.myLeave = resData
        })
    },
  }
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