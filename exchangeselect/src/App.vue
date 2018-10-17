<template>
  <div id="app">
    <div class="box">
      <h3>左右切换式级联组件</h3>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
#app, body, html {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
	width: 100%;
	height: 100%;
}
* {
  margin: 0;
  padding: 0;
}
.box{
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h3{
  margin-bottom: 30px;
}
</style>
