<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.username"
                  placeholder="用户名"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getUserList">搜索</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
                   @click="dialogVisible = true"
                   v-if="hasAuth('sys:user:save')">新增</el-button>
      </el-form-item>

      <el-form-item>
        <el-popconfirm title="确定批量删除吗？"
                       @confirm="delHandle(null)">
          <el-button type="danger"
                     slot="reference"
                     :disabled="delBtlStatu"
                     v-if="hasAuth('sys:user:delete')">批量删除</el-button>
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
      <el-table-column type="selection"
                       width="55">
      </el-table-column>

      <el-table-column label="头像"
                       width="50">
        <template slot-scope="scope">
          <el-avatar size="small"
                     :src="scope.row.avatar"></el-avatar>
        </template>
      </el-table-column>

      <el-table-column prop="username"
                       label="用户名"
                       width="120">
      </el-table-column>

      <el-table-column prop="code"
                       label="角色名称">
        <template slot-scope="scope">
          <el-tag size="small"
                  type="info"
                  v-for="item in scope.row.sysRoles"
                  :key="item.id">{{item.name}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="email"
                       label="邮箱">
      </el-table-column>

      <el-table-column prop="phone"
                       label="手机号">
      </el-table-column>

      <el-table-column prop="statu"
                       label="状态">
        <template slot-scope="scope">
          <el-tag size="small"
                  v-if="scope.row.statu === 1"
                  type="success">正常</el-tag>
          <el-tag size="small"
                  v-else-if="scope.row.statu === 0"
                  type="danger">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="created"
                       width="200"
                       label="创建时间">
      </el-table-column>

      <el-table-column prop="icon"
                       width="260px"
                       label="操作">

        <template slot-scope="scope">
          <el-button type="text"
                     @click="roleHandle(scope.row.id)"
                     v-if="scope.row.isTopManagement != '1'">分配角色</el-button>
          <el-divider direction="vertical"
                      v-if="scope.row.isTopManagement != '1'"></el-divider>

          <el-button type="text"
                     @click="repassHandle(scope.row.id, scope.row.username)">重置密码</el-button>
          <el-divider direction="vertical"></el-divider>

          <el-button type="text"
                     @click="editHandle(scope.row.id)">编辑</el-button>
          <el-divider direction="vertical"
                      v-if="scope.row.isTopManagement != '1'"></el-divider>

          <template>
            <el-popconfirm title="确定删除吗？"
                           @confirm="delHandle(scope.row.id)">
              <el-button type="text"
                         slot="reference"
                         v-if="scope.row.isTopManagement != '1'">删除</el-button>
            </el-popconfirm>
          </template>
        </template>
      </el-table-column>

    </el-table>

    <el-pagination @size-change="handleSizeChange"
                   @current-change="handleCurrentChange"
                   layout="total, sizes, prev, pager, next, jumper"
                   :page-sizes="[10, 20, 50, 100]"
                   :current-page="current"
                   :page-size="size"
                   :total="total">
    </el-pagination>

    <!--新增对话框-->
    <el-dialog title="提示"
               :visible.sync="dialogVisible"
               width="600px"
               :before-close="handleClose">

      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editForm">
        <el-form-item label="用户名"
                      prop="username"
                      label-width="130px">
          <el-input v-model="editForm.username"
                    autocomplete="off"></el-input>
          <el-alert title="初始密码为888888"
                    :closable="false"
                    type="info"
                    style="line-height: 12px;"></el-alert>
        </el-form-item>

        <el-form-item label="邮箱"
                      prop="email"
                      label-width="130px">
          <el-input v-model="editForm.email"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="手机号"
                      prop="phone"
                      label-width="130px">
          <el-input v-model="editForm.phone"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="状态"
                      prop="statu"
                      label-width="130px">
          <el-radio-group v-model="editForm.statu">
            <el-radio :label="0">禁用</el-radio>
            <el-radio :label="1">正常</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="isTopManagement">
          <el-input v-model="editForm.isTopManagement"
                    type="hidden"></el-input>
        </el-form-item>

      </el-form>

      <div slot="footer"
           class="dialog-footer">
        <el-button @click="resetForm('editForm')">取 消</el-button>
        <el-button type="primary"
                   @click="submitForm('editForm')">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色"
               :visible.sync="roleDialogFormVisible"
               width="600px">

      <el-form :model="roleForm">
        <el-tree :data="roleTreeData"
                 show-checkbox
                 ref="roleTree"
                 :check-strictly=checkStrictly
                 node-key="id"
                 :default-expand-all=true
                 :props="defaultProps"
                 @check-change="handleCheckChange">
        </el-tree>
      </el-form>

      <div slot="footer"
           class="dialog-footer">
        <el-button @click="roleDialogFormVisible=false">取 消</el-button>
        <el-button type="primary"
                   @click="submitRoleHandle('roleForm')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import dayjs from 'dayjs';
export default {
  name: "Role",
  data () {
    return {
      loading: false,//loading标识符
      searchForm: {},
      delBtlStatu: true, //"批量删除"按钮是否可禁用的标识。为了实现批量选择的数目为0时禁用"批量删除"的逻辑。

      //默认的分页数据
      total: 0,
      size: 10,
      current: 1,

      dialogVisible: false, //新增修改对话框的可显示标识

      //编辑和新增表单的数据
      editForm: {
        isTopManagement: 0 //默认不是系统最高管理员
      },

      //表格展示所有用户信息记录的数据
      tableData: [],

      //校验规则，放在data里。当然也是element ui演示代码里直接copy来的。
      editFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' }
        ],
        statu: [
          { required: true, message: '请选择状态', trigger: 'blur' }
        ]
      },

      //批量删除时被批量选择选中的记录的id的值，数组的形式。
      multipleSelection: [],

      roleDialogFormVisible: false, //分配角色对话框的可显示性标识

      //<el-tree>的配置选项，里面的配置项是element ui规定的。用来对<el-tree>进行基础配置
      defaultProps: {
        children: 'children', //指定子树为节点对象是那个属性值。比如这里的含义就是指定<el-tree>的当前节点子树是当前节点中的'children'属性
        label: 'name'   //同理
      },

      //
      roleForm: {},

      //
      roleTreeData: [],

      //
      treeCheckedKeys: [],
      checkStrictly: true

    }
  },
  created () {
    this.getUserList()

    this.$axios.get("/sys/role/list").then(res => {
      /*因为后端传来的是Page对象，所以"records"属性并不是我们定义的，是Page对象中的属性，诸如"current"、"size"、"total"等也是
         "records"属性存放查询的记录。*/
      this.roleTreeData = res.data.data.records
    })
  },
  methods: {
    /**
     * @check-change="handleCheckChange"的回调
     * el-tree的节点只能选择一个 
     */
    handleCheckChange (data, checked) {
      var checkedList = this.$refs.roleTree.getCheckedKeys()//得到已经选择的节点Keys列表
      if (checkedList.length > 1) {
        this.$refs.roleTree.setCheckedKeys([data.id], true)//更新为仅能选择的一个节点为最新选择的节点
        // this.$message.error("只能选择一个节点,已把待选择的节点更新为最新选择的节点");
      }
    },
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange (val) {
      console.log("勾选")
      console.log(val)
      this.multipleSelection = val;

      this.delBtlStatu = val.length == 0
    },

    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.size = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getUserList()
    },

    resetForm (formName) {
      this.$refs[formName].resetFields();
      this.dialogVisible = false
      // 这里设置重设表格后的isTopManagement依然是0
      this.editForm = { isTopManagement: 0 }
    },
    handleClose () {
      this.resetForm('editForm')
    },

    getUserList () {
      this.loading = true
      this.$axios.get("/sys/user/list", {
        params: {
          username: this.searchForm.username,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        var resData = res.data.data.records
        resData.forEach(function (value, index, array) {
          value.created = dayjs(value.created).format('YYYY-MM-DD HH:mm:ss')
        })
        this.tableData = resData
        this.size = res.data.data.size
        this.current = res.data.data.current
        this.total = res.data.data.total
        this.loading = false

      })
    },

    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/sys/user/' + (this.editForm.id ? 'update' : 'save'), this.editForm)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.getUserList()
              this.dialogVisible = false
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    editHandle (id) {
      this.$axios.get('/sys/user/info/' + id).then(res => {
        this.editForm = res.data.data

        this.dialogVisible = true
      })
    },
    delHandle (id) {

      var ids = []

      if (id) {
        ids.push(id)
      } else {
        this.multipleSelection.forEach(row => {
          ids.push(row.id)
        })
      }

      console.log(ids)

      this.$axios.post("/sys/user/delete", ids).then(res => {
        var resData = res.data.data
        this.$message({
          showClose: true,
          message: resData,
          type: 'success',
        });
        this.getUserList()
      })
    },

    roleHandle (id) {
      this.roleDialogFormVisible = true

      this.$axios.get('/sys/user/info/' + id).then(res => {
        this.roleForm = res.data.data

        let roleIds = []
        res.data.data.sysRoles.forEach(row => {
          roleIds.push(row.id)
        })

        this.$refs.roleTree.setCheckedKeys(roleIds)
      })
    },
    submitRoleHandle (formName) {
      var roleIds = this.$refs.roleTree.getCheckedKeys()

      console.log(roleIds)

      this.$axios.post('/sys/user/role/' + this.roleForm.id, roleIds).then(res => {
        this.$message({
          showClose: true,
          message: '恭喜你，操作成功',
          type: 'success',
        });
        this.getUserList()
        this.roleDialogFormVisible = false
      })
    },
    repassHandle (id, username) {

      this.$confirm('将重置用户【' + username + '】的密码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.post("/sys/user/repass", id).then(res => {
          this.$message({
            showClose: true,
            message: '恭喜你，操作成功',
            type: 'success',
            onClose: () => {
            }
          });
        })
      })
    }
  }
}
</script>

<style scoped>
.el-pagination {
  float: right;
  margin-top: 22px;
}
</style>