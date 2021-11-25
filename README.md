# Preview Server

HTML快速预览服务器，支持GBK编码文件，基于 Express，在 ServerResponse 调用 setHeader 添加 Content-Type: text/html, charset=GBK。

当工作空间有多个工作目录时，只使用第一个目录来启动服务器。

Easy way to preview your HTML. This extension supports HTML and Javascript files that encoded in GBK. Base on Express.

When workspace have one more folders, Server starts using the first folder only.

## Features

快速启动HTML页面预览服务器，服务器默认监听8900端口。如果同时多个项目在进行，服务端口冲突的话，可以在 workspace 设置不同的端口。

Start a web server to preview html pages. server is listening to 8900 default. If you have multi working projects, you can change the listening port in the workspace.

## Available Commands

+ Preview Server: Start Server，输入startserver命名，快速启动预览服务
+ Preview Server: Start Server with GBK charset，输入startgbk命名，快速启动GBK编码预览服务
+ Preview Server: Stop Server，输入stopserver命名，停止预览服务
+ Preview Server: Open In Browser，打开浏览器，访问当前工作空间的index.html

## Extension Settings

+ previewServer.webServerPort: set preview web server's listening port, default: 8900
+ previewServer.webServerCharset: set HTML/Javascript file's response charset, default: UTF-8
