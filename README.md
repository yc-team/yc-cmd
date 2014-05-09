yc-cmd
======

this is a *humanize* commander for yc

### 如何使用？

```js
var cmd = require('yc-cmd');
```


### 特性：

1. version内嵌，无需配置，更合理化

### 约束：

1. parse接口支持传递的参数:

> 约定为：process.argv，目前不支持别的参数

2. option接口支持的参数：

* 参数1： flags 命令，包含一短一长
* 参数2： desc  命令代表的内容  
 


### TODO：
