const packageName = 'excel-to-json'
const userCfgPath = Editor.url(`packages://${packageName}/panel/userCfg.json`, 'utf8')

const Path = require('path')
const fs = require('fs-extra')


const logType = {
    0: 'success',
    1: 'error',
    2: 'warning'
  }

module.exports = {

    filterObj (arr, obj) {
        for (const i in obj) {
            if (!this.inarray(arr, i)) delete obj[i]
        }
    },
    cs (str) {
        
        const obj = window.vv.$data.clientSignObj
        // 都没勾选,不做验证
        if (!obj.c && !obj.s) return true
        // 勾选c || s, 包含其中一项就是有效数据
        if (obj.c && str.toLowerCase().indexOf('c') !== -1) return true
        if (obj.s && str.toLowerCase().indexOf('s') !== -1) return true

        return false
    },
    ext (path) { // 获取扩展名
        return path.split('.').pop()
    },
    filename (path, flag = false) { // 获取文件名, flag=true, 不要扩展名
        let name = path.split(Path.sep).pop()
        if (flag) name = name.split('.').shift()
        return name
    },
    getPath (str) {
        let n = str.lastIndexOf('/')
        return str.substring(0, n)
    },
    inarray (arr, str) { // 数组/对象 包涵值
        for (const i in arr) {
            if (arr[i] == str) return true
        }
        return false
    },
    ds (str) { // \ 转化 /
        return str.replace(/\\/g, '/')
    },
    countRepeat (arr, str) {
        let n = 0
        for (const i in arr) {
            if (arr[i] == str) ++n
        }
        return n
    },
    reg (str) { // 文件名校验
        const reg = new RegExp('^[\u4E00-\u9FA5A-Za-z0-9._-]{1,32}$')
        return reg.test(str)
    },

    saveCfg () {
        const data = window.vv.$data
        let obj = {}
        obj.curIdx = data.curIdx
        obj.enableJson = data.enableJson
        obj.enableCsv = data.enableCsv
        obj.excelPath = data.excelPath
        obj.jsonPath = data.jsonPath
        obj.csvPath = data.csvPath
        obj.enableJsonFormat = data.enableJsonFormat
        obj.enableIdKey = data.enableIdKey
        obj.enableJsonMerge = data.enableJsonMerge
        obj.enableRefreshRes = data.enableRefreshRes
        // obj.enableKeepId = data.enableKeepId
        obj.depthObj = data.depthObj
        obj.clientSignObj = data.clientSignObj
        obj.fileExtObj = data.fileExtObj
        obj.enableJson = data.enableJson
        obj.startNum = data.startNum
        
        fs.writeJson(userCfgPath, obj, err => {
            if (!err) this.log('配置保存成功', 0)
            else this.log(err)
        })
    },
    initCfg () {
        
        fs.readJson(userCfgPath, (err, cfg) => {
            if (err) {
                this.log('未发现已保存的配置文件')
                return 
            }
            for (const i in cfg) {
                window.vv.$data[i] = cfg[i]
            }
            
        })
    },
    // log输出
    log (text, type = 2) {
        if (window.vv.$data.logType != logType[type]) {
            window.vv.$data.logType = logType[type]
            window.vv.$data.logText = ''
        }
        
        const time = (new Date()).format("yyyy-MM-dd hh:mm:ss")
        window.vv.$data.logText = `[${time}]
${text}

${window.vv.$data.logText}
` 
      },
}


Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (const k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}