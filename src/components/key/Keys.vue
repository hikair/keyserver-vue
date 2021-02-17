<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>按键管理</el-breadcrumb-item>
            <el-breadcrumb-item>按键分配</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-autocomplete class="inline-input" v-model="queryInfo.query" :fetch-suggestions="querySearch"
                                     placeholder="请输入名字或ip" :trigger-on-focus="false"
                                     @keyup.enter.native="getUserList" clearable
                                     @clear="getUserList" @select="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-autocomplete>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userList" stripe style="width: 100%">
                <!-- 展开列 -->
                <el-table-column type="expand" width="50">
                    <template slot-scope="scope">
                        <el-tag type="warning" v-for="(item,i) in scope.row.listenKey" closable @close="removeKeyById(scope.row,item)">{{ item }}</el-tag>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" width="50"></el-table-column>
                <el-table-column prop="name" label="姓名" width="180"></el-table-column>
                <el-table-column prop="hostAddress" label="ip地址" width="200"></el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-zoom-in" size="mini" @click="getIdAndShow(scope.row)"></el-button>
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

        <!-- 右侧抽屉区域,用于新增监听按键 -->
        <el-drawer title="录入按键" :visible.sync="drawerVisible" :direction="direction"
                   @open="open()" :before-close="handleClose">
            <el-input class="keyInput" id="keyListen" placeholder="请输入按键" readonly="readonly" style="width: 50%;margin: 15px"></el-input>
            <el-button type="primary" @click="addKey">添加</el-button>
            <el-button type="success" @click="submit">提交</el-button>
            <div style="margin-left: 8px">
                <el-tag type="warning" v-for="(item,i) in addKeyList" closable @close="removeDrawerKey(i)">{{ item }}</el-tag>
            </div>
        </el-drawer>
    </div>
</template>

<script>
    import $ from 'jquery'
    import {keypress} from "@/assets/js/myKey";

    export default {
        data() {
            return {
                // 获取用户列表的参数
                queryInfo: {
                    query: '',
                    pageNum: 1,
                    size: 5
                },
                // 用户列表
                userList: [],
                // 总条目数
                total: 0,
                // 用户编辑表单
                userDialogForm: {
                    id: '',
                    name: '',
                    hostAddress: '',
                    listenKey: ''
                },
                // 抽屉属性值
                drawerVisible: false,
                // 抽屉打开方向,从右往左打开
                direction: 'rtl',
                // 当前操作的用户id
                currentUserId: '',
                // 新增按键
                addKeyName: '',

                // 抽屉里新增的按键list
                addKeyList: [],
                // 作用域插槽
                userInfo: {}
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            // 获取用户列表请求
            async getUserList() {
                const {data: res} = await this.$axios.post('user/list', this.$qs.stringify(this.queryInfo));
                if (res.code !== 200) {
                    return this.$message.error('获取用户列表失败');
                }
                // 对象数组
                var keyArr = res.data.data;
                // 将监听键名从字符串转换成数组
                for (var i = 0; i < keyArr.length; i++) {
                    var arr = keyArr[i].listenKey.split(",");
                    keyArr[i].listenKey = arr;
                }
                this.userList = keyArr;
                this.total = res.data.rowCount;
            },
            // 输入关键词后触发搜索
            async querySearch(queryString, cb) {
                var json = {};
                json.query = this.queryInfo.query;
                const {data: res} = await this.$axios.post("user/getNameOrIpList",this.$qs.stringify(json));
                for (var i = 0; i < res.data.length; i++) {
                    res.data[i].value = res.data[i].name;
                }
                // 一定要用对象数组，而且返回的是带value的
                // 调用 callback 返回建议列表的数据
                cb(res.data);
            },
            // 监听size改变的事件
            handleSizeChange(newSize) {
                this.queryInfo.size = newSize;
                this.getUserList();
            },
            // 监听pageNum改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pageNum = newPage;
                this.getUserList();
            },
            // 删除某个key
            async removeKeyById(keyUser, listenKey) {
                const confirmResult = await this.$confirm(
                    '是否移除该键?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }
                ).catch(err => err)

                if (confirmResult !== 'confirm') {
                    return this.$message.info('取消了删除');
                }
                var json = {};
                json.id = keyUser.id;
                json.listenKey = listenKey;
                const {data: res} = await this.$axios.post('user/deleteKeyById', this.$qs.stringify(json));
                if (res.code !== 200) {
                    return this.$message.error(res.message);
                }
                this.$message.success(res.message);
                // 作用域插槽的数据更新下就好
                keyUser.listenKey = res.data;
            },
            // 抽屉加载
            open() {
                // 因为抽屉是懒加载的，延时等待dom渲染完
                setTimeout(() => {
                    keypress($("#keyListen"));
                }, 100)

            },
            // 添加监听按键
            getIdAndShow(userInfo) {
                this.userInfo = userInfo;
                this.currentUserId = userInfo.id;
                this.drawerVisible = true;
            },
            // 添加按键
            addKey() {
                var key = $("#keyListen").val();
                // 遍历用户列表,找到当前操作的用户
                for (var i = 0; i < this.userList.length; i++) {
                    if (this.userList[i].id === this.currentUserId) {
                        // 拿到当前用户已经在监听的按键
                        var keyArr = this.userList.listenKey;
                        // 判断是否已经有这个按键
                        for (var j = 0; j < keyArr; j++) {
                            if (key === keyArr[j]) {
                                this.$message.error('该键已在监听');
                                return;
                            }
                        }
                        // 判断抽屉里是否已有该键
                        for (var k = 0; k < this.addKeyList.length; k++) {
                            if (key === this.addKeyList[k]) {
                                this.$message.error('该键已在监听');
                                return;
                            }
                        }
                    }
                }
                this.addKeyList.push(key);
            },
            // 清空抽屉里的内容
            cleanDrawer() {
                this.addKeyList = [];
                $("#keyListen").val("");
                this.drawerVisible = false;
            },
            // 抽屉表单的提交方法,新增按键
            async submit() {
                var json = {};
                json.id = this.currentUserId;
                json.listenKey = this.addKeyList.join(",");
                const {data: res} = await this.$axios.post('user/add', this.$qs.stringify(json));
                if (res.code !== 200) {
                    if (res.message !== undefined) {
                        this.$message.error(res.message);
                    } else {
                        this.$message.error('新增失败');
                    }
                } else {
                    this.userInfo.listenKey = res.data;
                    this.$message.success(res.message);
                    this.cleanDrawer();
                }
            },
            // 抽屉关闭之前的方法
            handleClose() {
                this.$confirm('确定提交?').then(
                    () => {
                        // 添加按键的请求
                        this.submit();
                    }
                ).catch(() => {
                    this.cleanDrawer();
                })
            },
            // 删除抽屉里的按键
            removeDrawerKey(index) {
                // 从下标Index开始删除元素，删除一个
                this.addKeyList.splice(index,1);
            }
        }
    }
</script>

<style>
    :focus{
        outline:0;
    }
</style>