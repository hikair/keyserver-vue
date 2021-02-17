import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from "./components/user/Users.vue";
import Keys from "./components/key/Keys.vue";
import Templates from "./components/key/Templates.vue";
import Echarts from "./components/statistics/Echarts.vue";
import Logs from "./components/statistics/Log.vue"

Vue.use(Router)

export default new Router({
    routes:[
        { path: '/', redirect: '/login'},
        { path: '/login', component: Login},
        { path: '/home', component: Home, redirect: '/welcome',
            children:[
                { path: '/welcome',component:Welcome},
                { path: '/users',component: Users},
                { path: '/keys',component: Keys},
                { path: '/templates',component: Templates},
                { path: '/echarts',component: Echarts},
                { path: '/logs',component: Logs}
            ]
        }
    ]
})