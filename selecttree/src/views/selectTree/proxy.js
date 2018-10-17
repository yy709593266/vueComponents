// import axios from 'axios'

export default {
  // 获取区域树
  getAccountRegionTree (data) {
    // return axios.get('/copy/user/getAccountOrgTree', {params: data})
    let tempData = {
      code: '200',
      data: [{name: '默认控制中心', uuid: 'sjfewjr890', parentUuid: ''},
             {name: '杭州', uuid: 'sdfere', parentUuid: 'sjfewjr890'}]
    }
    let p = new Promise(function (resolve, reject) {
      resolve({data: tempData})
    })
    return p
  },
  // 获取门店列表
  getShopList (data) {
    // return axios.get('/copy/shopConfig/getShopList', {params: data})
    let tempData = {
      code: '200',
      data: [{name: '门店1', orgUuid: 'sdfsre'},
             {name: '门店2', orgUuid: 'sdfwerwe'}]
    }
    let p = new Promise(function (resolve, reject) {
      resolve({data: tempData})
    })
    return p
  }
}
