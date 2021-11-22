const createError = require('http-errors');
const express = require('express');
const path = require('path');
const http = require('http');

let httpServer;

const server = {
  start: (port, wwwRoot, charset) => {
    if (!charset) charset = 'UTF-8';
    return new Promise((resolve, reject) => {
      const app = express();

      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'pug');
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
          // res.setHeader('Content-Type', 'text/html; charset=GBK');
          res.setHeader('Content-Type', 'text/html; charset=' + charset);
        },
      }));

      // catch 404 and forward to error handler
      app.use(function (_req, _res, next) {
        next(createError(404));
      });

      // error handler
      app.use(function (err, req, res, next) {
        res.locals.message = err.message;
        res.locals.error = {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
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