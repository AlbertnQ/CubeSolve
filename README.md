# cube
魔方作业
## Requirements
1. ubuntu环境（windows下python2不支持tensorflow)
2. python == 2.7
3. tensorflow == 1.8.0
4. flask == Python2下最新版本

## 目录结构安排
1. code
  - 存放深度学习求解魔方模型的代码
  - 详细解释参照code/README.md
  - 其中code\scripts\nnetSolve.py为魔方求解接口
2. flask
  - 存放flask服务器后端
  - 具体如下：
    - app.py：服务器运行文件
    - static：网页静态资源（js脚本等）
    - templates：存放页面html文件
