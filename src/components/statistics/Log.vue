<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>按键统计</el-breadcrumb-item>
            <el-breadcrumb-item>日志统计</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-autocomplete class="inline-input" v-model="queryInfo.query" :fetch-suggestions="querySearch"
                                     placeholder="请输入ip" :trigger-on-focus="false"
                                     @keyup.enter.native="getLogList" clearable
                                     @clear="getLogList" @select="getLogList">
                        <el-button slot="append" icon="el-icon-search" @click="getLogList"></el-button>
                    </el-autocomplete>
                </el-col>
            </el-row>

            <!-- 日志列表区域 -->
            <el-table :data="logList" stripe style="width: 100%">
                <!-- 索引列 -->
                <el-table-column type="index" width="50"></el-table-column>
                <el-table-column prop="createDate" label="创建日期" width="180"></el-table-column>
                <el-table-column prop="keyName" label="键名" width="150"></el-table-column>
                <el-table-column prop="hostAddress" label="ip地址" width="150"></el-table-column>
                <el-table-column prop="hostName" label="客户端名字" width="180"></el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <!-- page-sizes 设置一页多少条，初始queryInfo里的size的初始值最好与第一个相同 -->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pageNum"
                    :page-sizes="[10,50,100,200]"
                    :page-size="queryInfo.size"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 获取日志列表的参数
                queryInfo: {
                    query: '',
                    pageNum: 1,
                    size: 10
                },
                // 日志列表
                logList: [],
                // 总条目数
                total: 0,
            }
        },
        methods: {
            // 输入关键词后触发搜索
            async querySearch(queryString, cb) {
                var json = {};
                json.query = this.queryInfo.query;
                const {data: res} = await this.$axios.post("user/getByIp",this.$qs.stringify(json));
                for (var i = 0; i < res.data.length; i++) {
                    res.data[i].value = res.data[i].hostAddress;
                }
                // 一定要用对象数组，而且返回的是带value的
                // 调用 callback 返回建议列表的数据
                cb(res.data);
            },
            // 获取日志列表请求
            async getLogList() {
                const {data: res} = await this.$axios.post('key/list', this.$qs.stringify(this.queryInfo));
                if (res.code !== 200) {
                    return this.$message.error('获取日志失败');
                }
                this.logList = res.data.data;
                this.total = res.data.rowCount;
            },
            // 监听size改变的事件
            handleSizeChange(newSize) {
                this.queryInfo.size = newSize;
                this.getLogList();
            },
            // 监听pageNum改变的事件
            handleCurrentChange(newPage) {
                this.queryInfo.pageNum = newPage;
                this.getLogList();
            }
        }
    }
</script>

<style scoped>

</style>