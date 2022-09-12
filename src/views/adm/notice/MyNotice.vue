<template>
  <div>
    <el-form :inline="true"
             :model="formInline"
             class="demo-form-inline">
      <!-- 这里可以做成动态获取通知类型，但是没必要，因为通知类型几乎不会变更  -->
      <el-form-item>
        <el-select v-model="formInline.type"
                   placeholder="通知类型">
          <el-option label="所有通知"
                     value=""></el-option>
          <el-option label="请假通知"
                     value="1"></el-option>
          <el-option label="学院通知"
                     value="2and3"></el-option>
          <el-option label="会议通知"
                     value="4"></el-option>
          <el-option label="奖学金通知"
                     value="5"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   @click="getNoticeList">搜索</el-button>
      </el-form-item>
    </el-form>
    <template v-if="isEmpty">
      <el-empty :image-size="400"></el-empty>
    </template>
    <template v-if="!isEmpty">
      <div class="block">
        <el-timeline v-for="item in noticeList"
                     :key="item.id">
          <el-timeline-item :timestamp="item.created"
                            placement="top">
            <el-card>
              <h2 class="subjectContext">{{item.subjectContext}}</h2>
              <p style="font-family:Hiragino Sans GB;color:#000000">{{item.content}}</p>
              <el-button v-for="i in item.files"
                         :key="index"
                         type="success"
                         icon="el-icon-download"
                         plain
                         @click="download(i.url)">{{i.name}}</el-button>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </template>
  </div>

</template>
<script>
import dayjs from 'dayjs';
export default {
  data () {
    return {
      formInline: { type: '' },
      isEmpty: true,
      noticeList: [],
    }
  },
  created () {
    this.getNoticeList()
  },
  methods: {
    getNoticeList () {
      this.$axios.get('/adm/notice/list/?type=' + this.formInline.type)
        .then(res => {
          //dayjs(item.created).format('YYYY-MM-DD HH:mm:ss')
          var arr = res.data.data
          arr.forEach(function (value, index, array) {
            value.created = dayjs(value.created).format('YYYY-MM-DD HH:mm:ss')
          });
          this.noticeList = arr
          if (this.noticeList.length == 0) {
            this.isEmpty = true
          } else {
            this.isEmpty = false
          }

        }
        )
    },
    download (url) {
      let link = document.createElement('a')
      link.target = '_blank'
      link.style.display = 'none'
      link.href = url;
      link.click();
    },
  }
}
</script>

<style>
.demo-form-inline {
  position: relative;
  margin: 0px;
  padding: 0px;
  left: 4%;
}
.subjectContext {
  color: #2c3e50;
}
</style>