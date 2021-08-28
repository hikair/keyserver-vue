<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>按键管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="3">
                    <el-autocomplete class="inline-input" v-model="queryInfo.query" :fetch-suggestions="querySearch"
                                     placeholder="请输入名字或ip" :trigger-on-focus="false"
                                     @keyup.enter.native="getUserList" clearable
                                     @clear="getUserList" @select="getUserList">
                    </el-autocomplete>
                </el-col>

                <el-col :span="2">
                    <el-button type="primary" @click="addUser">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userList" stripe style="width: 100%">
                <!-- 展开列 -->
                <el-table-column type="expand" width="50">
                    <template slot-scope="scope">
                        <!--<el-tag v-for="(item,i) in scope.row.listenKey">{{ item }}</el-tag>-->
                        <el-row :gutter="0">
                            <el-col :span="4" v-for="(item,i) in scope.row.listenKey">
                                <el-tag type="warning" closable @close="removeKeyByIp(scope.row,item)">{{ item }}</el-tag>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" width="50"></el-table-column>
                <el-table-column prop="name" label="姓名" width="180"></el-table-column>
                <el-table-column prop="deptName" label="部门" width="180"></el-table-column>
                <el-table-column prop="hostAddress" label="ip地址" width="180"></el-table-column>
                <!--<el-table-column prop="listenKey" label="监听键名" width="180"></el-table-column>-->
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="updateUser(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <!-- page-sizes 设置一页多少条，初始queryInfo里的size的初始值最好与第一个相同 -->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pageNum"
                    :page-sizes="[5, 10, 20]"
                    :page-size="queryInfo.size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>

        </el-card>

        <!-- 新增和修改用户信息的弹窗 -->
        <el-dialog  :title="edit.modify===0?edit.addTitle:edit.updateTitle"
                    :visible.sync="userDialogFormVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="userDialogForm" :rules="editFormRules" label-width="80px" ref="editFormRef" label-position="right" status-icon>
                <el-form-item label="名字" prop="name">
                    <el-input v-model="userDialogForm.name"></el-input>
                </el-form-item>
                <el-form-item label="ip" prop="hostAddress">
                    <el-input v-model="userDialogForm.hostAddress"></el-input>
                </el-form-item>
                <el-form-item label="部门">
                    <el-select v-model="userDialogForm.deptName" filterable placeholder="请选择" @change="getDeptId" style="width: 100%">
                        <el-option
                                v-for="item in deptOptions.options"
                                :key="item.id"
                                :label="item.deptName"
                                :value="item.deptName">
                        </el-option>
                    </el-select>

                </el-form-item>

            </el-form>
            <!-- 底部按钮区域 -->
            <div slot="footer" class="dialog-footer">
                <el-button @click="userDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="checkForm">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data(){
            // 验证ip的规则
            var checkIp = (rule,value,cb) => {
                // 验证ip的正则表达式
                const regIp = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
                if(regIp.test(value)){
                    // 合法的ip
                    return cb();
                }
                cb(new Error('请输入合法的Ip'))
            };

            return {
                // 获取用户列表的参数
                queryInfo:{
                    query: '',
                    pageNum: 1,
                    size: 5
                },
                // 用户列表
                userList: [],
                // 总条目数
                total: 0,
                // 用户编辑表单弹窗是否显示
                userDialogFormVisible: false,
                // 用户编辑表单
                userDialogForm:{
                    id: '',
                    deptId: '',
                    // 部门下拉框选中的值放这里!!
                    deptName: '',
                    name: '',
                    hostAddress: '',
                    listenKey:''
                },
                // 编辑用户表单的验证规则对象
                editFormRules:{
                    name:[
                        {required:true,message:'请输入名字',trigger:'blur'}
                    ],
                    hostAddress:[
                        {required:true,message:'请输入ip',trigger:'blur'},
                        // 自定义验证规则
                        {validator:checkIp,trigger: 'blur'}
                    ]
                },
                // 新增和修改相关
                edit:{
                    // 控制是新增还是修改默认是新增
                    modify:0,
                    addTitle:'新增用户',
                    updateTitle:'修改用户',
                },

                // 部门下拉框的可选值
                deptOptions:{
                    options:[],
                }
            }
        },
        created() {
            this.getUserList();
            this.getAllDept();

        },
        methods: {
            // 获取用户列表请求
            async getUserList() {
                const {data:res} = await this.$axios.post('user/list',this.$qs.stringify(this.queryInfo));
                if(res.code!==200){
                    return this.$message.error('获取用户列表失败');
                }
                // 对象数组
                var keyArr = res.data.data;
                // 将监听键名从字符串转换成数组
                for(var i=0;i<keyArr.length;i++){
                    var arr = keyArr[i].listenKey.split(",");
                    keyArr[i].listenKey = arr;
                }
                this.userList = keyArr;
                this.total = res.data.rowCount;
            },
            // 获取所有部门
            async getAllDept() {
                const {data:res} = await this.$axios.post('dept/list');
                if(res.code!==200){
                    return this.$message.error('获取部门列表失败');
                }
                this.deptOptions.options = res.data;
            },
            // 监听部门下拉框改变事件,目的是拿到deptId
            getDeptId(deptName){
                let obj = {};
                obj = this.userList.find((item)=>{//这里的userList就是上面遍历的数据源
                    return item.deptName === deptName;//筛选出匹配数据
                });
                console.log(obj)
                this.userDialogForm.deptId = obj.deptId;
            },
            // 输入关键词后触发搜索
            async querySearch(queryString,cb){
                const {data:res} = await this.$axios.post("user/getNameOrIpList",this.$qs.stringify(this.queryInfo));
                for(var i=0;i<res.data.length;i++){
                    res.data[i].value = res.data[i].name;
                }
                // 一定要用对象数组，而且返回的是带value的
                // 调用 callback 返回建议列表的数据
                cb(res.data);
            },
            // 监听size改变的事件
            handleSizeChange (newSize){
                this.queryInfo.size = newSize;
                this.getUserList();
            },
            // 监听pageNum改变的事件
            handleCurrentChange (newPage){
                this.queryInfo.pageNum = newPage;
                this.getUserList();
            },
            // 新增用户
            addUser(){
                this.edit.modify = 0;
                this.userDialogForm.id = '';
                this.userDialogForm.deptId = '';
                this.userDialogForm.deptName = '';
                this.userDialogForm.name = '';
                this.userDialogForm.hostAddress = '';
                this.userDialogFormVisible = true;
            },
            // 修改用户
            async updateUser (userinfo){
                this.edit.modify = 1;
                this.userDialogForm.id = userinfo.id;
                this.userDialogForm.deptId = userinfo.deptId;
                this.userDialogForm.deptName = userinfo.deptName;
                this.userDialogForm.name = userinfo.name;
                this.userDialogForm.hostAddress = userinfo.hostAddress;
                this.userDialogForm.listenKey = userinfo.listenKey.join(",");
                this.userDialogFormVisible = true;
            },
            // 验证表单
            checkForm (){
                // 点击确认进行表单预校验
                this.$refs.editFormRef.validate(valid => {
                    if(!valid){
                        // 校验失败直接退出
                        return;
                    }
                    this.editUser();
                })
            },
            // 编辑用户
            async editUser(){
                this.userDialogForm.modify = this.edit.modify;
                console.log(this.userDialogForm)
                const {data:res} = await this.$axios.post('user/edit',this.$qs.stringify(this.userDialogForm));
                if(res.code!==200){
                    return this.$message.error(res.message);
                }
                this.getUserList();
                this.$message.success(res.message);
                this.userDialogFormVisible = false;
            },
            // 监听编辑用户对话框的关闭事件
            editDialogClosed(){
                this.$refs.editFormRef.resetFields()
            },
            // 删除某个key
            async removeKeyByIp(keyUser,listenKey){
                const confirmResult = await this.$confirm(
                    '是否移除该键?','提示',{
                        confirmButtonText:'确定',
                        cancelButtonText:'取消',
                        type:'warning',
                    }
                ).catch(err => err)

                if(confirmResult !== 'confirm'){
                    return this.$message.info('取消了删除');
                }
                var json = {};
                json.hostAddress = keyUser.hostAddress;
                json.listenKey= listenKey;
                const {data:res} = await this.$axios.post('user/deleteKey',this.$qs.stringify(json));
                if(res.code !== 200){
                    return this.$message.error(res.message);
                }
                this.$message.success(res.message);
                // 作用域插槽的数据更新下就好
                keyUser.listenKey = res.data;
            }
        }
    }
</script>

<style scoped>

</style>