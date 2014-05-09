yc-cmd
======

this is a *humanize* commander for yc

### 如何使用？

```js
var cmd = require('yc-cmd');
```


### 特性：

1. 支持对-abc的解析-a -b -c 
2. version内嵌，无需配置，更合理化
3. 体积更小，代码结构更简洁明了

### 约束：

- parse接口支持传递的参数:

> 约定为：process.argv，目前不支持别的参数

- option接口支持的参数：

 - 参数1： flags 命令，包含一短一长
 - 参数2： desc  命令代表的内容  
 


### TODO：
