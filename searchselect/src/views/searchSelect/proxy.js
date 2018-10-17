// import axios from 'axios'

export default {
  // 获取业态列表
  getIndustryPage (url, data) {
    // return axios.get(url, {params: data})
    let tempData = {
      code: '200',
      data: {
        rows: [{name: '耐克', uuid: 'sjfewjr890'},
        {name: '阿迪达斯', uuid: 'sdfere'},
        {name: 'balabala', uuid: 'gerte'},
        {name: '外婆家', uuid: 'wer5435'}]
      }
    }
    let p = new Promise(function (resolve, reject) {
      resolve({data: tempData})
    })
    return p
  }
}
