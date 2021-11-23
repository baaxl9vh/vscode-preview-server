# Preview Server

HTML快速预览服务器，支持GBK编码文件。

## Features

快速启动HTML页面预览服务器，服务器默认监听8900端口。

## Available Commands

+ Preview Server: Start Server，输入startserver命名，快速启动预览服务
+ Preview Server: Start Server with GBK charset，输入startgbk命名，快速启动GBK编码预览服务
+ Preview Server: Stop Server，输入stopserver命名，停止预览服务
+ Preview Server: Open In Browser，打开浏览器，访问当前工作空间的index.html

## Extension Settings

+ previewServer.webServerPort: set preview web server's listening port, default: 8900
+ previewServer.webServerCharset: set HTML/Javascript file's response charset, default: UTF-8

## Release Notes

### 0.0.7

+ 降低vscode版本要求为1.41.0以上版本
+ 添加端口和默认charset配置项
+ 加上icon

### 0.0.6

+ 仅对mime 为 text/html 和 application/javascript 的静态文件添加 charset

### 0.0.5

+ 修复 Windows 目录错误问题
