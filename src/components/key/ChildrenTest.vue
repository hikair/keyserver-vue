<template>
    <div>
        <h1>{{name}}</h1>
        <h1>{{age}}</h1>
    </div>
</template>

<script>
    export default {
        name: 'ChildrenTest',
        data(){
            return {
                name: '',
                age: ''
            }
        },
        methods:{
            init(name,age){
                this.name = name;
                this.age = age;
            }
        }
    }
</script>

<style scoped>

</style>