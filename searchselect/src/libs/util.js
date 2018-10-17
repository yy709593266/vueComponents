let util = {}

util.setCurrentPath = function (vm, name) {
  console.log(name)
  vm.$store.state.routers.forEach(item => {
    // console.log(item)
  })
  let currentPathArr = [
    {
      title: '首页',
      path: '/home/index',
      name: 'Home'
    },
    {
      title: '权限',
      path: '/access/index',
      name: 'Home'
    }
  ]
  vm.$store.commit('setCurrentPath', currentPathArr)
}

export default util
