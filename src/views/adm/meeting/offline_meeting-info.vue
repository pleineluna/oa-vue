<template>
  <el-dialog title="会议概要信息"
             :before-close="handleClose"
             :visible="visible"
             width="450px">
    <div>
      <div class="banner"></div>
      <el-row class="info">
        <el-col :span="3"
                class="label">主题：</el-col>
        <el-col :span="21">
          <span class="value">{{ title }}</span>
        </el-col>
      </el-row>
      <el-row class="info">
        <el-col :span="3"
                class="label">日期：</el-col>
        <el-col :span="9"
                class="value">{{ date }}</el-col>
        <el-col :span="3"
                class="label">地点：</el-col>
        <el-col :span="9"
                class="value">{{ place }}</el-col>
      </el-row>
      <el-row class="info">
        <el-col :span="3"
                class="label">时间：</el-col>
        <el-col :span="9"
                class="value">{{ start }} ~ {{ end }}</el-col>
        <el-col :span="3"
                class="label">状态：</el-col>
        <el-col :span="9"
                class="value">{{ status }}</el-col>
      </el-row>
      <el-row class="info member"
              v-if="['待审批', '未开始'].includes(status)">
        <el-col :span="3"
                class="label">人员：</el-col>
        <el-col :span="21"
                class="value">
          <ul class="list">
            <li class="item"
                v-for="one in members">
              <img :src="one.avatar"
                   class="photo" />
              <span class="name">{{ one.realname }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
      <el-row class="info member"
              v-if="['进行中', '已结束'].includes(status)">
        <el-col :span="3"
                class="label">参会：</el-col>
        <el-col :span="21"
                class="value">
          <ul class="list">
            <li class="item"
                v-for="one in present">
              <img :src="one.avatar"
                   class="photo" />
              <span class="name">{{ one.realname }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
      <el-row class="info member"
              v-if="['进行中', '已结束'].includes(status)">
        <el-col :span="3"
                class="label">缺席：</el-col>
        <el-col :span="21"
                class="value">
          <ul class="list">
            <li class="item"
                v-for="one in unpresent">
              <img :src="one.avatar"
                   class="photo" />
              <span class="name">{{ one.realname }}</span>
            </li>
          </ul>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="medium"
                   @click="visible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data: function () {
    return {
      visible: false,
      title: null,
      date: null,
      place: null,
      start: null,
      end: null,
      members: [],
      present: [],
      unpresent: [],
      status: null,
    };
  },
  methods: {
    handleClose (done) {
      this.visible = false;
    },
    init: function (id, status) {
      let that = this;
      that.visible = true;
      that.$nextTick(() => {
        let data = {
          id: id,
          status: status,
        };
        that.$axios.post("meeting/searchMeetingInfo", data).then((resp) => {
          that.title = resp.data.data.title;
          that.date = resp.data.data.date;
          that.place = resp.data.data.place;
          that.start = resp.data.data.start;
          that.end = resp.data.data.end;
          if (resp.data.data.status == 1) {
            that.status = "待审批";
          } else if (resp.data.data.status == 3) {
            that.status = "未开始";
          } else if (resp.data.data.status == 4) {
            that.status = "进行中";
          } else if (resp.data.data.status == 5) {
            that.status = "已结束";
          }
          // alert(resp.data.data.hasOwnProperty("members"))
          if (resp.data.data.hasOwnProperty("members")) {
            that.members = JSON.parse(resp.data.data.members);
          }
          if (resp.data.data.hasOwnProperty("present")) {
            that.present = JSON.parse(resp.data.data.present);
          }
          if (resp.data.data.hasOwnProperty("unpresent")) {
            that.unpresent = JSON.parse(resp.data.data.unpresent);
          }
        });
      });
    },
  },
};
</script>

<style lang="less" scoped="scoped">
@import url("offline_meeting-info.less");
</style>
