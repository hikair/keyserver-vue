<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>按键管理</el-breadcrumb-item>
            <el-breadcrumb-item>模板管理</el-breadcrumb-item>
        </el-breadcrumb>


<!--        <el-button @click="pass()">向子组件传值</el-button>
        <children-test ref="mychild"></children-test>-->


        <el-container class="template-container">
            <el-aside width="200px">
                <el-menu active-text-color="#409bff" unique-opened :router="true">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in deptList" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 文本 -->
                            <span>{{ item.deptName }}</span>
                        </template>

                        <!-- 二级菜单 -->
                        <el-menu-item :index="subItem.id" v-for="subItem in item.keyTemplates" :key="subItem.id">
                            <template slot="title">
                                <!-- 文本 -->
                                <span>{{ subItem.templateName }}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import ChildrenTest from "./ChildrenTest";
    export default {
        components: {
            ChildrenTest
        },
        data() {
            return {
                deptList: []
            }
        },
        created() {
            this.getDeptList();
        },
        methods:{
            async getDeptList() {
                const {data : res} = await this.$axios.get('dept/getAllDeptWithTemplate');
                if(res.code !== 200) {
                    return this.$message.error('获取部门列表失败');
                }
                this.deptList = res.data;
            },
            pass(){
                this.$refs.mychild.init(this.name,this.age)
            }
        }
    }
</script>

<style lang="less" scoped>
    .template-container {
        height: 100%;
    }
</style>