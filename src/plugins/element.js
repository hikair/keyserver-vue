import Vue from 'vue'
import {Button, MessageBox} from 'element-ui'
//import 'element-ui/lib/theme-chalk/index.css'
import { Form, FormItem, Input, Message, Container, Header,Aside, Main,
            Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card,
            Row, Col, Table, TableColumn, Pagination, Dialog, Select, Option,
            Autocomplete, Tag, Drawer, Checkbox, CheckboxGroup, DatePicker,
            Calendar, Tabs, TabPane } from "element-ui"

import axios from 'axios'
// 配置请求的根路径
//axios.defaults.baseURL = 'http://47.100.203.32:8001/'
axios.defaults.baseURL = 'http://127.0.0.1:8001/'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
import qs from 'qs'

//Vue全局对象可用
Vue.prototype.$qs = qs

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Select)
Vue.use(Option)
Vue.use(Autocomplete)
Vue.use(Tag)
Vue.use(Drawer)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(DatePicker)
Vue.use(Calendar)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm