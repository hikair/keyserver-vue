<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>按键统计</el-breadcrumb-item>
            <el-breadcrumb-item>分析统计</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card style="height: 800px">
            <el-row :gutter="20">
                <el-col :span="24">
                    <!-- 搜索区域 -->
                    <el-autocomplete class="inline-input" v-model="queryInfo.query" :fetch-suggestions="querySearch"
                                     placeholder="请输入名字或ip" :trigger-on-focus="false"
                                     @keyup.enter.native="getUserList" clearable
                                     @clear="getUserList" @select="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-autocomplete>

                    <!-- 日期区域 -->
                    <el-date-picker
                            style="margin-left: 15px"
                            v-model="selectedDate"
                            align="right"
                            type="date"
                            placeholder="选择日期"
                            :picker-options="pickerOptions"
                            format="yyyy 年 MM 月 dd 日"
                            value-format="yyyy-MM-dd"
                            @change="list()">
                    </el-date-picker>

                    <!-- 视图切换区域 -->
                    <el-button type="primary" style="margin-left: 15px" size="medium" @click="list(0)">分视图</el-button>
                    <el-button type="primary" style="margin-left: 15px" size="medium" @click="list(1)">时视图</el-button>
                </el-col>

            </el-row>

            <!-- 按键复选框区域 -->
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" style="margin-top: 15px">全选</el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group v-model="checkedKeys" @change="handleCheckedKeysChange">
                <el-checkbox v-for="listenKey in listenKeys" :label="listenKey" :key="listenKey">{{listenKey}}</el-checkbox>
            </el-checkbox-group>

            <!-- 2.为 ECharts 准备一个具备大小（宽高）的 DOM -->
            <div id="main" style="width: 1200px;height:500px; top:100px"></div>

        </el-card>
    </div>
</template>

<script>
    // 1.导入echarts
    import echarts from 'echarts'
    export default {
        data() {
            return {
                // 获取用户列表的参数
                queryInfo: {
                    query: 'zpq',
                    pageNum: 1,
                    size: 5
                },
                // 用户对象
                userInfo: {},
                // 复选框相关
                // 全选
                checkAll: true,
                checkedKeys: [],
                listenKeys: [],
                isIndeterminate: false,
                // 日期
                selectedDate:'',
                // 日期选项
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now();
                    },
                    shortcuts: [{
                        text: '今天',
                        onClick(picker) {
                            picker.$emit('pick', new Date());
                        }
                    }, {
                        text: '昨天',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '一周前',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', date);
                        }
                    }]
                },
                // 视图相关
                flag: 0,
                oneDay: 24 * 3600 * 1000,
                scale: 60 * 1000,
                timestr: '',
                myChart: ''
            }
        },
        created() {
            this.getUserList();
            var myDate = new Date();
            var time = myDate.toLocaleDateString().split('/').join('-');
            this.selectedDate = time;
            // 因为是异步的，等待前面执行完毕后执行
            setTimeout(() => {
                this.list();
            }, 100)
        },
        methods: {
            // 输入关键词后触发搜索
            async querySearch(queryString, cb) {
                var json = {};
                json.query = this.queryInfo.query;
                const {data: res} = await this.$axios.post("user/getNameOrIpList", this.$qs.stringify(json));
                for (var i = 0; i < res.data.length; i++) {
                    res.data[i].value = res.data[i].name;
                }
                // 一定要用对象数组，而且返回的是带value的
                // 调用 callback 返回建议列表的数据
                cb(res.data);
            },
            // 获取用户信息
            async getUserList() {
                const {data: res} = await this.$axios.post('user/list', this.$qs.stringify(this.queryInfo));
                if (res.code !== 200) {
                    return this.$message.error('获取用户列表失败');
                }
                var user = res.data.data[0];
                // 将监听键名从字符串转换成数组
                var arr = user.listenKey.split(",");
                user.listenKey = arr;
                this.userInfo = user;
                this.checkedKeys = arr;
                this.listenKeys = arr;
            },
            handleCheckAllChange(val) {
                this.checkedKeys = val ? this.listenKeys : [];
                this.isIndeterminate = false;
                this.list(this.flag);
            },
            handleCheckedKeysChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.listenKeys.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.listenKeys.length;
                this.list(this.flag);
            },
            // 把原数据改成2020/12/19 00:00:00一样的格式
            changeData(datain) {
                var startTime = +new Date(this.timestr)-this.scale;
                var liuru = [];
                var length;
                if(this.flag === 0){
                    length = 1440;
                }else {
                    length = 24;
                }
                for (var i = 0; i < length; i++) {
                    startTime = new Date(+startTime + this.scale);
                    liuru.push(this.chartData(i,datain,startTime));
                }
                return liuru;
            },
            // 用来返回2020/12/19 00:00:00一样的数据格式
            chartData(i,data,now) {
                return {
                    value: [
                        this.riqigeshi(now),
                        data[i]
                    ]
                }
            },
            // 把new Date出来的时间格式转换为2020/12/19 00:00:00的日期格式
            riqigeshi(now){
                return now.toLocaleDateString() + ' ' + now.getHours() + now.toLocaleTimeString().substr(-6,6)
            },
            // 画图
            async list(num) {
                if(num === 0){
                    this.flag = 0;
                    this.scale = 60 * 1000;
                }
                if(num === 1){
                    this.flag = 1;
                    this.scale = 3600 * 1000;
                }
                var json = {};
                json.hostAddress = this.userInfo.hostAddress;
                json.createDate = this.selectedDate;
                json.keyNames = this.checkedKeys.join(",");
                json.flag = this.flag;

                if(this.selectedDate !== '' && this.userInfo.hostAddress !==''){
                    const {data: result} = await this.$axios.post('key/list3', this.$qs.stringify(json));
                    if(result.code !== 200){
                        return this.$message.error('获取数据失败');
                    }

                    this.timestr = this.selectedDate+" 00:00:00";

                    var res = [];
                    var data = [];
                    var i = 0;
                    var map = result.data;
                    for(var key in map){
                        res[i]=key;
                        data[i]=map[key];
                        i++;
                    }
                    if (this.myChart != null && this.myChart !== "" && this.myChart !== undefined) {
                        this.myChart.dispose();//销毁
                    }
                    this.myChart = echarts.init(document.getElementById('main'));
                    var that = this;
                    setTimeout(function () {
                        var option = {
                            title: {
                                text: ''
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            legend: {
                                data: function () {
                                    return res;
                                }()
                            },
                            grid: {
                                x:'3.6%',
                                y:'5%',
                                x2:'2.4%',
                                y2:'12%'
                            },
                            toolbox: {
                                feature: {
                                    saveAsImage: {}
                                }
                            },
                            xAxis: {
                                type:'time',
                                splitNumber:24
                            },
                            yAxis: {
                                type: 'value',
                                axisLabel:{
                                    formatter:'{value} 次'
                                }
                            },
                            dataZoom: [
                                {
                                    type: 'slider',//数据滑块
                                    start:0,
                                    minSpan:8,    //5min
                                    dataBackground:{
                                        lineStyle:{
                                            color:'#95BC2F'
                                        },
                                        areaStyle:{
                                            color:'#95BC2F',
                                            opacity:1,
                                        }
                                    }
                                },
                                {
                                    type:'inside'//使鼠标在图表中时滚轮可用
                                }
                            ],

                            //date =  dateSel当前选中的+ 00:00:00
                            //data 就是  [日期,次数]
                            series: function () {
                                var serie = [];
                                for(var i=0;i<res.length;i++){
                                    var liuru = that.changeData(data[i]);
                                    var liuruShift = liuru.shift();
                                    var liuruShiftVal = liuruShift.value[1];
                                    var newlrtime = that.riqigeshi(new Date(new Date(liuruShift.value[0])+that.oneDay+that.scale));
                                    liuru.push({value:[newlrtime,liuruShiftVal]});
                                    var item={name:res[i],type: 'line',showSymbol:false,symbolSize:12,data:liuru};
                                    serie.push(item);
                                }
                                return serie;
                            }()
                        };
                        that.myChart.setOption(option);

                    });
                }
            }
        }
    }
</script>

<style scoped>

</style>