# MoFang
罗铁坚老师的高级软件工程大作业
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
3. environment
  - 原深度学习求解魔方模型的文件夹，暂无用
4. metadata
  - 原深度学习求解魔方模型的文件夹，暂无用

## 运行服务器
1. cd flask
2. conda activate py27（使用python 2.7环境）
3. export CUDA_VISIBLE_DEVICES="0"
4. python app.py

## 路由
1."/"
- GET接口，返回最早版本魔方求解页面

2."/initState"
- POST接口，魔方求解页面初始化状态用

3."/solve"
- POST接口，魔方求解页面求解用，发送魔方状态序列，返回求解步骤等

4."/test"
- GET接口，返回3D化魔方插件页面
