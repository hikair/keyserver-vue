<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/analysis-white.png" alt="">
                <span>员工行为分析系统</span>
            </div>
            <el-button type="info">注销</el-button>
        </el-header>

        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边菜单栏 -->
            <el-aside width="200px">
                <el-menu background-color="#333744" text-color="#fff"
                         active-text-color="#409bff" unique-opened :router="true" :default-active="$route.path">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id">
                            <template slot="title">
                                <!-- 图标 -->
                                <i :class="iconsObj[subItem.id]"></i>
                                <!-- 文本 -->
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>

                </el-menu>
            </el-aside>

            <!-- 右侧内容主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        data(){
          return {
              // 左侧菜单数据
              menulist: [],
              iconsObj: {
                  '101': 'el-icon-s-tools',
                  '102': 'el-icon-s-marketing',
                  '201': 'el-icon-s-custom',
                  '202': 'el-icon-thumb',
                  '203': 'el-icon-notebook-2',
                  '204': 'el-icon-pie-chart',
                  '205': 'el-icon-reading'
              }
          }
        },
        // 组件创建就执行
        created() {
            this.getMenuList()
        },
        methods:{
            // 获取所有的菜单
            async getMenuList(){
                const {data : res} = await this.$axios.get('menu/list');
                if(res.code !== 200){
                    return this.$message.error('获取菜单列表失败');
                }else {
                    this.menulist = res.data;
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .home-container {
        height: 100%;
    }
    .el-header {
        background-color: #373d41;
        display: flex;
        // 两边分
        justify-content: space-between;
        // 左边贴边
        padding-left: 0;
        // 元素上下不要贴边
        align-items: center;
        // 字体白色
        color: white;
        font-size: 20px;
        > div {
            display: flex;
            align-items: center;
            span {
                // 字体与logo隔开些
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;
        .el-menu {
            // 去除右侧边框露出
            border-right: none;
        }
    }

    .el-main {
        background-color: white;
    }

    .iconfont {
        margin-right: 10px;
    }
</style>