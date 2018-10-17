// import Vue from 'vue'
export default {
   // 获取列表数据
  getDataTree (data) {
    // return Vue.http.get(data.url, {params: Object.keys(data.params).length ? data.params : '', loading: true})
    let tempData = {
      code: '200',
      data: [{name: '测试中心', uuid: 'sjfewjr890', parentUuid: 'ddd'},
             {name: '杭州', uuid: 'sdfere', parentUuid: 'sjfewjr890'}]
    }
    let p = new Promise(function (resolve, reject) {
      resolve({data: tempData})
    })
    return p
  }
}
