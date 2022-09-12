<template>
  <div>
    <el-form :inline="true"
             :model="dataForm"
             :rules="dataRule"
             ref="dataForm"
             class="form">
      <el-form-item prop="name">
        <el-select v-model="dataForm.name"
                   class="input"
                   placeholder="选择会议室"
                   size="medium"
                   clearable="clearable">
          <el-option v-for="one in roomList"
                     :key="one.name"
                     :label="one.name"
                     :value="one.name" />
        </el-select>
      </el-form-item>
      <el-form-item prop="date">
        <el-date-picker v-model="dataForm.date"
                        type="date"
                        placeholder="选择日期"
                        class="input"
                        size="medium"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="medium"
                   type="primary"
                   @click="searchHandle()">查询</el-button>
        <el-button size="medium"
                   type="danger"
                   @click="addHandle()">会议申请</el-button>
      </el-form-item>
      <el-form-item class="mold">
        <el-radio-group v-model="dataForm.mold"
                        size="medium"
                        @change="changeHandle">
          <el-radio-button label="全部会议"></el-radio-button>
          <el-radio-button label="我的会议"></el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <!-- 甘特图的div -->
    <div class="gantt"
         ref="gantt"
         v-show="mode == 'gantt'">
      <div class="row">
        <div class="cell-time"></div>
        <div class="cell-time"
             v-for="one in time">
          <span class="time">{{ one }}</span>
        </div>
      </div>
      <div class="row"
           v-for="room in gantt.meetingRoom">
        <div class="cell room">{{ room.name }}</div>
        <div class="cell"
             v-for="one in time">
          <div v-if="room.meeting.hasOwnProperty(one)"
               class="meeting"
               :class="room.meeting[one].split('#')[1]"
               :style="
              'width:' +
              room.meeting[one].split('#')[0] * gantt.cellWidth +
              'px'
            "></div>
        </div>
      </div>
    </div>
    <el-pagination v-show="mode == 'gantt'"
                   @size-change="sizeChangeHandle"
                   @current-change="currentChangeHandle"
                   :current-page="pageIndex"
                   :page-sizes="[10, 20, 50]"
                   :page-size="pageSize"
                   :total="totalCount"
                   layout="total, sizes, prev, pager, next, jumper" />

    <div class="calendar"
         v-show="mode == 'calendar'">
      <div class="row">
        <div class="cell">时间</div>
        <div class="cell"
             v-for="one in calendar.days">
          {{ one.date }}（{{ one.day }}）
        </div>
      </div>
      <div class="row"
           v-for="(one, index) in time">
        <div class="cell-time"
             v-if="time[index + 1] != null">
          {{ one }} ~ {{ time[index + 1] }}
        </div>
        <div class="cell"
             v-for="day in calendar.days"
             v-if="time[index + 1] != null">
          <div class="meeting"
               v-if="calendar.map.hasOwnProperty(`${day.date}#${one}`)"
               :style="
              'height:' +
              calendar.map[day.date + '#' + one].time * 31 +
              'px; line-height:' +
              calendar.map[day.date + '#' + one].time * 31 +
              'px'
            "
               :ref="`${day.date}#${one}`"
               @click="
              infoHandle(
                calendar.map[day.date + '#' + one].id,
                calendar.map[day.date + '#' + one].status
              )
            ">
            <el-button type="danger"
                       size="mini"
                       icon="el-icon-delete"
                       circle
                       @click.stop="deleteHandle(`${day.date}#${one}`)"></el-button>
            {{ calendar.map[`${day.date}#${one}`].title }}
          </div>
        </div>
      </div>
    </div>
    <add v-if="addVisible"
         ref="add"
         @refresh="refresh"></add>
    <info v-if="infoVisble"
          ref="info"></info>
  </div>
</template>

<script>
import dayjs from "dayjs";
import Add from "./offline_meeting-add.vue";
import Info from "./offline_meeting-info.vue";
export default {
  components: { Add, Info },
  data: function () {
    return {
      time: [
        "08:30",
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
      ],
      // 甘特图的各种业务数据
      gantt: {
        meetingRoom: [],
        cellWidth: 0,
      },
      // 周日历的各种业务数据
      calendar: {
        map: {},
        days: [],
      },
      // 条件查询的会议室下拉列表数据
      roomList: [],
      dataForm: {
        name: null,
        date: null,
        mold: "全部会议",
      },
      pageIndex: 1, //相当于之前用的current，因为这里是借鉴的别人，所以命名不一致。以后也不再说了。
      pageSize: 10, //相当于之前用的size
      totalCount: 0, //相当于之前用的total
      dataListLoading: false,
      addVisible: false,
      infoVisble: false,
      dataRule: {},
      // 显示那种界面（日程表或周日历）
      mode: "gantt",
    };
  },
  methods: {
    loadDataList: function () {
      let that = this; //此时保存的指向是指向vm（vc），以后不再做说明
      that.dataListLoading = true;
      let data = {
        name: that.dataForm.name,
        mold: that.dataForm.mold,
        page: that.pageIndex,
        length: that.pageSize,
      };
      //如果没有传入要查询的会议日期，那么以当前时间为查询日期
      if (that.dataForm.date == null || that.dataForm.date == "") {
        data.date = dayjs(new Date()).format("YYYY-MM-DD");
      } else {
        data.date = dayjs(that.dataForm.date).format("YYYY-MM-DD");
      }

      this.$axios
        .post("meeting/searchOfflineMeetingByPage", data)
        .then((resp) => {
          // 因为我自己使用统一响应api和借鉴的统一响应api对象不一样，所以这里到时候可能重新对接接口参数名字。
          let page = resp.data.data; //我修改后的返回是：return Result.succ(pageUtils);
          let temp = [];
          for (let room of page.list) {
            let json = {};
            json.name = room.name;
            json.meeting = {};
            if (room.hasOwnProperty("meeting")) {
              for (let meeting of room.meeting) {
                let color = null;
                if (meeting.status == 1) {
                  color = "yellow";
                } else if (meeting.status == 3) {
                  color = "blue";
                } else if (meeting.status == 4) {
                  color = "pink";
                } else if (meeting.status == 5) {
                  color = "gray";
                }
                // 以会议开始时间作为某个会议的属性名，值是时间+"#"+颜色 ;#充当分隔符
                json.meeting[meeting.start] = meeting.time + "#" + color;
              }
            }
            temp.push(json);
          }
          that.gantt.meetingRoom = temp;
          that.totalCount = page.totalCount;
          that.dataListLoading = false;
        });
    },
    backHandle: function () {
      let that = this;
      that.mode = "gantt";
    },
    searchHandle: function () {
      let that = this;
      if (that.dataForm.name == null || that.dataForm.name == "") {
        that.$refs["dataForm"].validate((valid) => {
          if (valid) {
            that.$refs["dataForm"].clearValidate();
            if (that.pageIndex != 1) {
              that.pageIndex = 1;
            }
            that.loadDataList();
            that.mode = "gantt";
          } else {
            return false;
          }
        });
      } else {
        //查询周日历数据
        that.$refs["dataForm"].validate((valid) => {
          if (valid) {
            that.$refs["dataForm"].clearValidate();
            let data = {
              name: that.dataForm.name,
              mold: that.dataForm.mold,
            };
            if (that.dataForm.date != null && that.dataForm.date != "") {
              //日历控件的值默认为null，有具体的日历被清除日期zhihou，值为空字符串
              data.date = dayjs(that.dataForm.date).format("YYYY-MM-DD");
            }
            that.$axios
              .post("meeting/searchOfflineMeetingInWeek", data)
              .then((resp) => {
                let map = {};
                for (let one of resp.data.data.list) {
                  map[`${one.date}#${one.start}`] = one;
                }
                that.calendar.map = map;
                that.calendar.days = resp.data.data.days;
                that.mode = "calendar";
              });
          } else {
            return false;
          }
        });
      }
    },
    changeHandle: function () {
      this.searchHandle();
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
    addHandle: function () {
      this.addVisible = true;
      this.$nextTick(() => {
        this.$refs.add.init();
      });
    },
    infoHandle: function (id, status) {
      this.infoVisble = true;
      this.$nextTick(() => {
        this.$refs.info.init(id, status);
      });
    },
    deleteHandle: function (key) {
      let that = this;
      that
        .$confirm("是否删除该会议?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          let json = that.calendar.map[key];
          let data = {
            id: json.id,
            uuid: json.uuid,
            instanceId: json.instanceId,
            reason: "删除会议",
          };
          that.$axios
            .post("meeting/deleteMeetingApplication", data)
            .then((resp) => {
              if (resp.data.data == 1) {
                that.$message({
                  message: "删除成功",
                  type: "success",
                  duration: 1200,
                });
                that.searchHandle();
              } else {
                that.$message({
                  message: "删除失败",
                  type: "error",
                  duration: 1200,
                });
              }
            });
        });
    },
    refresh: function () {
      this.mode = "gantt";
      this.$refs["dataForm"].resetFields();
      this.loadDataList();
    },
  },
  mounted: function () {
    let that = this;
    //根据实际情况设置甘特图每个单元格应该有的宽度
    let rowWidth = that.$refs["gantt"].offsetWidth - 1;
    let cellWidth = rowWidth * 0.042 + 0.01;
    that.gantt.cellWidth = cellWidth;

    //当浏览器窗口尺寸改变的时候，重新设置甘特图单元格的宽度
    window.addEventListener("resize", () => {
      let rowWidth = that.$refs["gantt"].offsetWidth - 1;
      let cellWidth = rowWidth * 0.042 + 0.01;
      that.gantt.cellWidth = cellWidth;
    });
  },
  created: function () {
    //加载会议室列表
    let that = this;

    that.$axios.get("meeting_room/searchAllMeetingRoom").then((resp) => {
      that.roomList = resp.data.data;
    });

    //加载日程表分页数据
    that.loadDataList();
  },
};
</script>

<style lang="less" scoped="scoped">
@import url("offline_meeting.less");
</style>
