# excel-to-json

Cocos Creator插件  

\*excel 生成 json文件  
\*excel 生成 csv文件  
\*excel 版本兼容 xlsx/xls  
\*重名检测  
\*支持客户端标识过滤  
\*支持json合并  
\*生成到resources目录下是 支持资源管理器自动刷新或手动  

## 安装方式

#### Cocos Creator
菜单栏 -> 扩展 -> 扩展商店 搜索 excel-to-json

#### git
项目目录下 -> packages目录 (没有可手动创建) -> git clone
或将此源码下载 解压到 packages 目录下
解压完成后 需进入 插件目录 excel-to-json 执行 npm install

## 使用说明

![help](https://github.com/brotherit2015/excel-to-json/blob/master/doc/1.png)  
![help](https://github.com/brotherit2015/excel-to-json/blob/master/doc/excel.png)  
![help](https://github.com/brotherit2015/excel-to-json/blob/master/doc/json.png)  
![help](https://github.com/brotherit2015/excel-to-json/blob/master/doc/csv.png)  

### excel 格式
\*第一行 key 字段  
\*第二行 key说明  
\*第三行 客户端标识  c/s/w..  
\*数据读取是从第4行开始,若要修改 /panel/index.js 49行 startNum 变量  

![excel](https://github.com/brotherit2015/excel-to-json/blob/master/doc/2.png)  

### 生成示例

#### json
\*id作为Key  勾选  
```javascript
{
"10001": {
"id": 10001,
"name": "材料1",
"skin": 10001,
"type": 1,
"subtype": 100,
"quality": 0,
"val": "",
"desc": "装备炼化所需"
},
"10002": {
"id": 10002,
"name": "材料2",
"skin": 10002,
"type": 1,
"subtype": 101,
"quality": 0,
"val": "",
"desc": "装备炼化所需"
}
}
```

\*id作为Key  未勾选  
```javascript
[
{
"id": 20002,
"name": "红糖水",
"skin": 20002,
"type": 2,
"subtype": 200,
"quality": 0,
"val": "exp=999999",
"desc": "使用增加人物经验999999"
},
{
"id": 20003,
"name": "冰糖水",
"skin": 20003,
"type": 2,
"subtype": 201,
"quality": 0,
"val": "exp=99999",
"desc": "使用增加人物经验99999"
}
]
```
\*json合并
```javascript
{
"item": {
"10001": {
"id": 10001,
"name": "材料1",
"skin": 10001,
"type": 1,
"subtype": 100,
"quality": 0,
"val": "",
"desc": "装备炼化所需"
}
},
"item2": {
"20002": {
"id": 20002,
"name": "红糖水",
"skin": 20002,
"type": 2,
"subtype": 200,
"quality": 0,
"val": "exp=999999",
"desc": "使用增加人物经验999999"
}
}
}
```
#### csv

```
id,name,skin,type,subtype,quality,val,desc
20002,红糖水,20002,2,200,0,exp=999999,使用增加人物经验999999
20003,冰糖水,20003,2,201,0,exp=99999,使用增加人物经验99999
```

### 保存说明

#### json  

合并 文件名为 all.json, 每个sheet的名字作为对象 key值  
不合并, 每个sheet名字将作为文件名单独保存  

#### csv

以每个sheet名字作为文件名单独保存  

## 相关node.js库

sheetjs -- excel操作  
fs-extra -- 文件操作  
chokidar -- 目录扫描  

## 其他
原PHP后端程序员~ 一直想开发一款个人游戏, 目前已完成一期60%的内容  
目前到数值这块, 网上的转json格式太繁琐, 想比较快速, 智能一些  
然后在扩展商店找到了excel-killer  
大概需求能满足, 主要还是一直在进行游戏的开发, 有些腻  
正好学习一下插件开发 借鉴了excel-killer 并根据自己需求改进一下~
