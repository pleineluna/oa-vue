<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchForm.name"
                  placeholder="名称"
                  clearable>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button @click="getRoleList">搜索</el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary"
                   @click="dialogVisible = true">新增</el-button>
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

      <el-table-column prop="name"
                       label="名称"
                       width="120">
      </el-table-column>
      <el-table-column prop="code"
                       label="唯一编码"
                       show-overflow-tooltip>
      </el-table-column>
      <el-table-column prop="remark"
                       label="描述"
                       show-overflow-tooltip>
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
      <el-table-column prop="icon"
                       label="操作">
        <!--v-if="scope.row.code != 'TopManagement'" 的逻辑是TopManagement角色不允许被操作。  -->
        <template slot-scope="scope"
                  v-if="scope.row.code != 'TopManagement'">
          <el-button type="text"
                     @click="permHandle(scope.row.id)">分配权限</el-button>
          <el-divider direction="vertical"></el-divider>

          <el-button type="text"
                     @click="editHandle(scope.row.id)">编辑</el-button>
          <el-divider direction="vertical"></el-divider>

          <template>
            <el-popconfirm title="确定删除吗？"
                           @confirm="delHandle(scope.row.id)">
              <el-button type="text"
                         slot="reference">删除</el-button>
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
               ref="editForm"
               label-width="100px"
               class="demo-editForm">

        <el-form-item label="角色名称"
                      prop="name"
                      label-width="100px">
          <el-input v-model="editForm.name"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="唯一编码"
                      prop="code"
                      label-width="100px">
          <el-input v-model="editForm.code"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="描述"
                      prop="remark"
                      label-width="100px">
          <el-input v-model="editForm.remark"
                    autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="状态"
                      prop="statu"
                      label-width="100px">
          <el-radio-group v-model="editForm.statu">
            <el-radio :label=0>禁用</el-radio>
            <el-radio :label=1>正常</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary"
                     @click="submitForm('editForm')">确定</el-button>
          <el-button @click="resetForm('editForm')">重置</el-button>
        </el-form-item>
      </el-form>

    </el-dialog>

    <el-dialog title="分配权限"
               :visible.sync="permDialogVisible"
               width="600px">

      <el-form :model="permForm">

        <el-tree :data="permTreeData"
                 show-checkbox
                 ref="permTree"
                 :default-expand-all=true
                 node-key="id"
                 :props="defaultProps"
                 :check-strictly="true">
        </el-tree>

      </el-form>

      <span slot="footer"
            class="dialog-footer">
        <el-button @click="permDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="submitPermFormHandle('permForm')">确 定</el-button>
      </span>

    </el-dialog>

  </div>
</template>

<script>
export default {
  loading: false,
  name: "Role",
  data () {
    return {
      loading: false,//loading标识符
      //创建searchForm{}对象，因为是弱语言，所以属性可以赋值时自动帮我们定义，比如searchForm.name赋值时就会自动帮我们添加name属性。
      searchForm: {},
      //"批量删除"按钮是否可禁用的标识。为了实现批量选择的数目为0时禁用"批量删除"的逻辑。
      delBtlStatu: true,

      //分页参数的定义并设置默认参数
      total: 0,
      size: 10,
      current: 1,

      //编辑和新增对话框可显示性的标识
      dialogVisible: false,
      //编辑和新增表单的数据。数据会向后端发起请求获取。
      editForm: {

      },
      //角色表格记录的数据。数据会向后端发起请求获取。
      tableData: [],
      //校验规则，放在data里。当然也是element ui演示代码里直接copy来的。
      editFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入唯一编码', trigger: 'blur' }
        ],
        statu: [
          { required: true, message: '请选择状态', trigger: 'blur' }
        ]
      },

      //批量删除时被批量选择选中的记录的id的值，数组的形式。
      multipleSelection: [],
      //分配权限对话框可显示性的标识
      permDialogVisible: false,
      /**
       * 分配权限对话框中表单的数据。 
       * 向后端发起请求："/sys/role/info/" + id，返回类型为SysRole
       * 看*365row的说明
       */
      permForm: {},

      //<el-tree>的配置选项，里面的配置项是element ui规定的。用来对<el-tree>进行基础配置
      defaultProps: {
        children: 'children', //指定子树为节点对象是那个属性值。比如这里的含义就是指定<el-tree>的当前节点子树是当前节点中的'children'属性
        label: 'name'   //同理
      },
      // permTreeData是被勾选的所有权限的id的数组
      permTreeData: []
    }
  },
  created () {
    this.getRoleList()
    console.log("******************************" + this.tableData)
    this.$axios.get('/sys/menu/list').then(res => {
      this.permTreeData = res.data.data
    })
  },
  methods: {
    //elment ui文档提供的全选/全不选触发的回调函数
    toggleSelection (rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    //elment ui文档提供的勾选触发的回调函数，绑定在<el-table>的@selection-change="handleSelectionChange"属性中
    //其中val值是勾选对象的Array形式，val中的item.id就是行数据的id
    handleSelectionChange (val) {
      console.log("勾选")
      console.log(val)
      this.multipleSelection = val; //通过此处来确定表格中被批量勾选的所有记录对象的数组

      //先=赋值，再==比较，得到布尔类型结果。含义是没有勾选的会通过delBtlStatu=0也就是false来禁用"批量删除"按钮
      this.delBtlStatu = val.length == 0
    },
    //elment ui文档提供的分页组件"每页页数"改变触发的回调函数，绑定在<el-pagination>的@size-change="handleSizeChange"属性中
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.size = val
      this.getRoleList() //重新从后端获取新的Page对象实现每页显示多少条记录的逻辑
    },
    //elment ui文档提供的分页组件"当前页"改变触发的回调函数，绑定在<el-pagination>的@current-change="handleCurrentChange"属性中
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.current = val
      this.getRoleList() //重新从后端获取新的Page对象实现当前第几页的逻辑
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
     * getRoleList()函数的功能有两个
     * 1.获取表格数据 
     * 2.根据searchForm.name获取表格数据，完成搜索逻辑。因为搜索无非就是显示符合搜索条件的表格数据，所以传递搜索条件（searchForm.name）就可以实现搜索。
     * 后台会根据你是否传递搜索条件来查询数据库返回对应数据。
     */
    getRoleList () {
      this.loading = true
      this.$axios.get("/sys/role/list", {
        //axios的get请求可以通过 params 对象传递参数。相当于："http://localhost:8080/sys/roles/list?name="普通用户"&current=1&size=10"
        //通过params传递name、current、size参数给后台。后台会根据参数名称接收这三个参数，然后通过Page的构造方法生成分页对象Page。
        params: {
          name: this.searchForm.name,
          current: this.current,
          size: this.size
        }
      }).then(res => {
        /*因为后端传来的是Page对象，所以"records"属性并不是我们定义的，是Page对象中的属性，诸如"current"、"size"、"total"等也是
         *"records"属性存放查询的记录。
         *下面操作获取查询到的记录数据、分页数据 
         */
        this.tableData = res.data.data.records
        console.log("******************************" + this.tableData)
        this.size = res.data.data.size
        this.current = res.data.data.current
        this.total = res.data.data.total
        this.loading = false
      })
    },
    //新增、编辑用的回调函数
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$axios.post('/sys/role/' + (this.editForm.id ? 'update' : 'save'), this.editForm)
            .then(res => {
              this.$message({
                showClose: true,
                message: '恭喜你，操作成功',
                type: 'success',
              });
              this.getRoleList()
              this.dialogVisible = false
              this.resetForm(formName)
            })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    //编辑对话框回填用的回调函数
    editHandle (id) {
      this.$axios.get('/sys/role/info/' + id).then(res => {
        this.editForm = res.data.data

        this.dialogVisible = true
      })
    },
    //删除、批量删除用的回调函数
    delHandle (id) {

      var ids = []

      if (id) {
        ids.push(id) //单个删除的情况，传入具体id
      } else {
        this.multipleSelection.forEach(row => {
          ids.push(row.id) //传入null是批量删除的情况
        })
      }

      console.log(ids)

      this.$axios.post("/sys/role/delete", ids).then(res => {
        var resData = res.data.data
        this.$message({
          showClose: true,
          message: resData,
          type: 'success',
          showClose: true,
        });
        this.getRoleList()

      })
    },
    //分配权限对话框用的回调函数
    permHandle (id) {
      this.permDialogVisible = true

      this.$axios.get("/sys/role/info/" + id).then(res => {

        this.$refs.permTree.setCheckedKeys(res.data.data.menuIds) //数据回填，通过<el-tree>的setCheckedKeys()方法实现
        this.permForm = res.data.data //赋值
      })
    },
    //分配权限"确认"按钮用的回调函数
    submitPermFormHandle (formName) {
      //通过<el-tree>的getCheckedKeys()方法获取到树状结构中所有勾选记录的key值的数组，因为在标签中node-key="id"，所以key值对应数据源的"id"属性
      var menuIds = this.$refs.permTree.getCheckedKeys()
      console.log(menuIds)
      /**this.permForm.id就是SysRole.id因为this.permForm的获取是向后端发起"/sys/role/info/" + id请求，后端返回的就是SysRole。
                  * 为什么返回SysRole？其实分配权限也是修改操作的一种，只不过修改的只有menuIds属性（也就是角色的权限列表）
      * 所以会提前进行数据回填操作，修改就需要id，
                  * 所以要获取对应记录的对应实体SysRole。然后<el-tree>就是对应SysRole中的menuIds属性。
                  * ==== 总结：分配权限就是对指定id值的SysRole对象的menuIds属性进行更新。
                  */
      this.$axios.post('/sys/role/perm/' + this.permForm.id, menuIds).then(res => {
        this.$message({
          showClose: true,
          message: '恭喜你，操作成功',
          type: 'success',
        });
        this.getRoleList()
        this.permDialogVisible = false
        this.resetForm(formName)
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