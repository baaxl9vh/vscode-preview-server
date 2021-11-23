const express = require('express');
const http = require('http');
const mime = require('mime');

let httpServer;

const server = {
  start: (port, wwwRoot, charset) => {
    if (!charset) charset = 'UTF-8';
    return new Promise((resolve, reject) => {
      const app = express();

      app.use(express.json());
      app.use(express.urlencoded({
        extended: false
      }));
      app.use(express.static(wwwRoot, {
        etag: false,
        lastModified: false,
        index: 'index.html',
        setHeaders: (res, path, stat) => {
          res.setHeader('Cache-control', 'no-cache');
          const type = mime.getType(path);
          if (type === 'text/html') {
            res.setHeader('Content-Type', 'text/html; charset=' + charset);
          } else if (type === 'text/css') {
          } else if (type === 'application/javascript') {
            res.setHeader('Content-Type', 'application/javascript; charset=' + charset);
          }
        },
      }));

      // catch 404 and forward to error handler
      app.use(function (_req, _res, next) {
        const err = new Error('404');
        // @ts-ignore
        err.status = 404;
        next(err);
      });

      // error handler
      app.use(function (err, req, res, next) {
        console.log(err);
        res.locals.message = err.message;
        res.locals.error = {};

        // render the error page
        res.status(err.status || 500);
        res.send(res.locals.message);
      });
      httpServer = http.createServer(app);
      httpServer.keepAliveTimeout = 5000;
      httpServer.on('connection', (socket) => {
        socket.setTimeout(5000);
      });
      httpServer.listen(port);
      httpServer.on('error', (error) => {
        reject(error);
      });
      httpServer.on('listening', () => {
        resolve(httpServer);
      });
    });
  },
  stop: () => {
    return new Promise((resolve, reject) => {
      if (httpServer) {
        httpServer.close(() => {
          resolve()
        });
      } else {
        reject(new Error('Server undefined!'));
      }
    });
  },
};

module.exports = server;