// panel/index.js, this filename needs to match the one registered in package.json
const cc = console
const packageName = 'excel-to-json'
const fs = require('fs-extra') // 文件读写
const chokidar = require('chokidar') // 目录监控
const xlsx = require(Editor.url(`packages://${packageName}/node_modules/xlsx`, 'utf8')) // xlsx
const Path = require('path')
const tool = require(Editor.url(`packages://${packageName}/panel/tool.js`))

Editor.Panel.extend({
  style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')),
  template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')),
  ready () {

    window.vv = new window.Vue({
      el: this.shadowRoot,
      data: {
        curIdx: 3,
        enableJson:true,
        enableCsv:false,
        excelPath: '',
        jsonPath:'',
        csvPath:'',
        enableIdKey: true,
        enableJsonMerge: true,
        enableKeepId: true,
        depthObj: {
          checked: false,
          depth: 0
        },
        clientSignObj: {
          c: true,
          s: false,
        },
        fileExtObj: {
          arr: ['xls', 'xlsx'],
          xls: true,
          xlsx: true
        },
        git: 'https://github.com/brotherit2015/excel-to-json',
        enableFindFiles: true,
        excelArr: [],
        fileList: [],
        logText: '',
        logType: 'error',
        allSelect: false,
        updNameVal: '',
        saveList: {},
        startNum: 2, //开始行号 (2表示从第四行开始)
        csvKeys: {},
        enableRefreshRes: false
      },
      watch: {
        excelPath () {
          this.watchDir()
        },
      },
      methods: {
        inputChange (e) {
          const str = e.detail.value
          this.updNameVal = str
        },
        // 临时修改sheet名
        updName (idx, b) {
          const str = this.updNameVal.replace(/ /g,'')
          if (!str) return
          if (!tool.reg(str)) {
            tool.log(`文件名 [${this.updNameVal}]不合法 有效长度1-32,特殊字符只支持.-_`)
            this.updNameVal = ''
            return
          }
          if (b == str) {
            this.updNameVal = ''
            return
          }
          let list = this.fileList
          
          for (const i in list) {
            if (list[i].sheetName == str) {
              tool.log(`文件名 [${this.updNameVal}]重复!`)
              return
            }
          }
          this.fileList[idx].sheetName = str
          this.fileList[idx].saveName = str
          this.updNameVal = ''
          
        },
        // 文件全选
        selectAll () {
          if (this.allSelect) {
            let list = this.fileList
            for (const i in list) {
              list[i].checked = false
            }
            this.allSelect = false
            return
          }
          let flag = true
          let list = this.fileList
          let nameArr = []
          for (const i in list) {
            if (list[i].checked) {
              nameArr.push(list[i].sheetName)
            }
          }
          for (const i in list) {
            if (list[i].checked) {
              continue
            } 

            if (tool.inarray(nameArr, list[i].sheetName)) {
              tool.log(`sheet名称冲突
[${list[i].sheetName}] 不可选中`)
              flag = false
              continue
            } else {
              nameArr.push(list[i].sheetName)
              list[i].checked = true
            }
          }
          this.allSelect = flag
        },
        // 文件单选
        selectItem (idx) {
          let list = this.fileList
          const flag = list[idx].checked
          if (flag) {
            list[idx].checked = !flag
            this.allSelect = false
            return
          }

          for (const i in list) {
            if (list[i].sheetName == list[idx].sheetName && list[i].checked) {
              tool.log(`sheet名称冲突 不可选中`)
              return
            }
          }
          list[idx].checked = true

          let allFlag = true
          for (const i in list) {
            if (!list[i].checked) {
              allFlag = false
            }
          }
          this.allSelect = allFlag
        },
        // 初始化文件列表
        initFileList () {
          this.fileList = []
          let nameArr = []
          const pathLength = this.excelPath.length + 1
          let allSelect = true
          this.excelArr.reverse().forEach((e, idx) => {
            let file = xlsx.readFile(e)
            file.SheetNames.forEach(ei => {
              let obj = {}
              obj.root = this.excelPath
              obj.idx = idx
              obj.path = e.substring(pathLength, e.lastIndexOf(Path.sep))
              obj.filename = tool.filename(e) 
              obj.sheetName = ei
              obj.sheetData = file.Sheets[ei]
              obj.num = tool.countRepeat(nameArr, ei)
              obj.checked = true
              if (obj.num > 0) {
                obj.checked = false
                tool.log(`sheet名称冲突
${obj.filename}----${obj.sheetName}`)
                allSelect = false
              }
              obj.saveName = ei
              this.fileList.push(obj)
              nameArr.push(ei)
            })
            
          })
          this.allSelect = allSelect
        },
        changeTab (idx) {
          if (idx == this.curIdx) return
          this.curIdx = idx
        },
        // excel子目录
        enableDepthSwitch (e) {
          if (e.detail.value) this.depthObj.depth = 10
          else this.depthObj.depth = 0
          this.depthObj.checked = e.detail.value
          this.scanDir()
        },
        // 查找相关文件
        findFiles (dir) {
          
          let list = fs.readdirSync(dir)
          list.forEach((e) => {
            let path = `${dir}${Path.sep}${e}`
            let stat = fs.statSync(path)
            if (stat.isDirectory()) {
              if (this.depthObj.depth == 0) {
                return true
              }
              this.findFiles(path)
            } else {
              if (tool.inarray(this.fileExtObj.arr, tool.ext(path)) && tool.filename(path).substr(0, 2) !== '~$') {
                this.excelArr.push(path)
              }
            }
          })
          // 读取文件信息
          this.initFileList()
          this.enableFindFiles = true
        },

        // 监听目录 有excel文件操作
        watchDir () {
          try {
            if (!this.excelPath || !fs.statSync(this.excelPath).isDirectory()) return
          } catch (error) {
            cc.log(error)
          }
          
          chokidar.watch(this.excelPath, {depth: this.depthObj.depth})
          .on('all', (e, path) => {
            if (tool.inarray(this.fileExtObj.arr, tool.ext(path))) {
              if (this.enableFindFiles) {
                this.enableFindFiles = false
                this.scanDir()
              }
            }
          });
        },
        // 扫描目录
        scanDir () {
          if (!this.excelPath) return
          this.excelArr = []
          this.findFiles(this.excelPath)
        },
        // 设置excel读取目录
        setExcelPath () {
          let path = this.returnPath('选择Excel的目录')
          if (!path) return
          
          this.excelPath = path
          this.watchDir()
        },
        // 设置json保存目录
        setJsonPath () {
          let path = this.returnPath('选择Json保存目录')
          if (path) this.jsonPath = path
        },
        // 设置csv保存目录
        setCsvPath () {
          let path = this.returnPath('选择Csv保存目录')
          if (path) this.csvPath = path
        },
        // 返回选择的目录路径
        returnPath (title) {
          let path = Editor.Dialog.openFile({
            title: title,
            defaultPath: Editor.Project.path,
            properties: ['openDirectory'],
          })
          if (path === -1 || !fs.statSync(path[0]).isDirectory()) {
            return false
          }
          return path[0]
        },
        refreshResSwitch (e) {
          this.enableRefreshRes = e.detail.value
        },
        // json保存时, id作为对象key
        idKeySwitch (e) {
          this.enableIdKey = e.detail.value
        },
        // json保存时 对象中保留id
        keepIdSwitch (e) {
          this.enableKeepId = e.detail.value
        },
        enableJsonMergeSwitch (e) {
          this.enableJsonMerge = e.detail.value
        },
        // 开启json保存
        enableJsonSwitch (e) {
          this.enableJson = e.detail.value
        },
        // 开启csv保存
        enableCsvSwitch (e) {
          this.enableCsv = e.detail.value
        },
        // 过滤扩展名
        xlsSwitch (e) {
          this.fileExtObj.xls = e.detail.value
          this.fileExtArr()
        },
        xlsxSwitch (e) {
          this.fileExtObj.xlsx = e.detail.value
          this.fileExtArr()
        },
        fileExtArr () {
          this.fileExtObj.arr = []
          if (this.fileExtObj.xls) this.fileExtObj.arr.push('xls')
          if (this.fileExtObj.xlsx) this.fileExtObj.arr.push('xlsx')
          this.scanDir()
        },
        // 客户端标识
        clientSignC (e) {
          this.clientSignObj.c = e.detail.value
        },
        clientSignS (e) {
          this.clientSignObj.s = e.detail.value
        },
        checkWrite() {
          if (!this.enableJson && !this.enableCsv) {
            tool.log('Json 或 Csv生成未开启')
            return false
          }

          if (this.enableJson && !this.jsonPath) {
            tool.log('Json导出目录未配置')
            return false
          }

          if (this.enableCsv && !this.csvPath) {
            tool.log('Csv导出目录未配置')
            return false
          }

          return true
        },
        refresh () {
          tool.log('重新扫描目录', 0)
          this.scanDir()
        },

        refreshRes () {
          Editor.assetdb.refresh('db://assets/resources/', (err, results) => {
              if (err) tool.log(`资源刷新错误\n${err}`)
              else {
                tool.log(`资源目录已刷新`, 0)
                Editor.log('资源目录已刷新')
              }
          })
        },
        // 生成
        read () {
          if (!this.checkWrite()) {
            return
          }
          let files = this.fileList

          this.csvKeys = {}
          // 过滤相关数据
          for (const i in files) {

            if (!files[i].checked) continue

            let arr = xlsx.utils.sheet_to_json(files[i].sheetData, {defval:''})

            let cs = arr[1]
            let keys = []
            for (const j in cs) {
              if (tool.cs(cs[j])) keys.push(j)
            }
            this.csvKeys[files[i].sheetName] = keys
            arr.splice(0, this.startNum)
            let tmpObj = {}
            let tmpArr = []
            
            for (let k in arr) {
              tool.filterObj(keys, arr[k])
              // id 为空,不记录
              if (!arr[k][keys[0]]) {
                delete arr[k]
                continue
              }
              if (this.enableIdKey) {
                tmpObj[arr[k][keys[0]]] = arr[k]
                // id作为key, 对象不保留id
                // delete arr[k][keys[0]]
              } else {
                tmpArr.push(arr[k])
              }
            }

            this.saveList[files[i].sheetName] = this.enableIdKey ? tmpObj : tmpArr
          }

          if (JSON.stringify(this.saveList) === "{}") {
            tool.log('没有数据, 刷新重试')
            return
          }

          if (this.enableJson) this.saveJson()
          if (this.enableCsv) this.saveCsv()
          this.saveList = {}
        },
        // 生成csv文件
        saveCsv() {
          const path = `${this.csvPath}${Path.sep}`
          const list = this.saveList
          const arrKey = this.csvKeys
          for (const i in list) { 
            const keys = arrKey[i]
            let str = keys.join(',') + "\r\n"

            for (const k in list[i]) {
              let tmpStr = ''
              for (const j in list[i][k]) {
                tmpStr += list[i][k][j] + ','
              }
              tmpStr = tmpStr.substring(0, tmpStr.lastIndexOf(','))
              str = str + tmpStr + "\r\n"
            }
            str = str.substring(0, str.lastIndexOf("\r\n"))
            fs.writeFile(`${path}${i}.csv`, `${str}`, err => {
              if (err) {
                  tool.log(`${i}.csv 生成出错了`)
                  tool.log(err)
                  return
              }
              tool.log(`${i}.csv 已生成`, 0)
            })
          }

          if (this.enableRefreshRes) {
            setTimeout(() => {
              this.refreshRes()
            }, 2000)
          }
        },
        // 生成json文件
        saveJson () {
          const path = `${this.jsonPath}${Path.sep}`
          // 合并保存 
          if (this.enableJsonMerge) {
            fs.writeJSON(path + 'all.json', this.saveList, err => {
              if (err) {
                tool.log(`all.json 生成出错了`)
                tool.log(err)
                return
              }
              tool.log(`all.json 已生成`, 0)
            })
          } else {
            let list = this.saveList
            for (const i in list) {
              fs.writeJson(`${path}${i}.json`, list[i], err => {
                if (err) {
                  tool.log(`${i}.json 生成出错了`)
                  tool.log(err)
                  return
                }
                tool.log(`${i}.json 已生成`, 0)
              })
            }
          }
          if (this.enableRefreshRes) {
            setTimeout(() => {
              this.refreshRes()
            }, 2000)
          }
        },
        // 清除日志
        clearLog() {
          this.logText = ''
        },
        // 保存配置
        saveCfg () {
          tool.saveCfg()
        },

        
      },
      created () {
        tool.initCfg()
      },
    });
  },
});