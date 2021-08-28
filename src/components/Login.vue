<template>
    <div class="login_container">
        <div class="login_box">
            <!-- logo区域 -->
            <div class="logo_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 表单区域 -->
            <el-form ref="LoginFormRef" :model="loginForm" :rules="loginFormRule" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" show-password prefix-icon="el-icon-lock"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="loginFormReset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import axios from "axios";

    export default {
        data(){
            return{
                // 这是登录表单的数据绑定对象
                loginForm:{
                    username: 'admin',
                    password: '123456'
                },
                // 这是表单的验证规则对象
                loginFormRule:{
                    // 验证用户名是否合法
                    username: [
                        // required 是否必填项  message 提示信息  trigger 触发时机
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    // 验证密码是否合法
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                }
            }
        },
        methods:{
            loginFormReset() {
                // console.log(this)
                this.$refs.LoginFormRef.resetFields();
            },
            login() {
                // valid 验证结果的布尔值
                this.$refs.LoginFormRef.validate(async valid => {
                    if(!valid){
                        return;
                    }
                    // post(请求地址,表单数据)
                    const result = await this.$axios.post('login',this.$qs.stringify(this.loginForm));
                    if(result.data.data){
                        this.$message.success('登录成功');
                        // 路由到home组件
                        this.$router.push('/home');
                    }else {
                        this.$message.error('登录失败');
                    }
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .login_container{
        background: aquamarine;
        height: 100%;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background-color: white;
        // 圆角边框
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%,-50%);

        .logo_box{
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }
    }

    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }

    .btns {
        display: flex;
        justify-content: flex-end;
    }
</style>