import * as express from 'express';
import * as http from 'http';
import * as mime from 'mime';
import { DEFAULT_CHARSET, DEFAULT_SERVER_PORT, ServerStatus } from './constants';

import { output } from './output';

let httpServer: http.Server;

export const server = {
  port: DEFAULT_SERVER_PORT,
  charset: DEFAULT_CHARSET,
  status: ServerStatus.stopped,
  start: function (port: number, root: string, charset: string) {
    return new Promise((resolve, reject) => {
      this.status = ServerStatus.starting;
      const app = express();

      app.use(express.json());

      app.use(express.urlencoded({
        extended: false
      }));
      app.use((req, res, next) => {
        output.appendLine(`hostname: ${req.hostname} ${req.method} ${req.originalUrl}`);
        next();
      });
      app.use(express.static(root, {
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
      app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
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
        this.status = ServerStatus.stopped;
        this.charset = charset;
        this.port = port;
        reject(error);
      });
      httpServer.on('listening', () => {
        this.status = ServerStatus.running;
        resolve(httpServer);
      });
    });
  },
  stop: function () {
    return new Promise((resolve, reject) => {
      if (httpServer) {
        this.status = ServerStatus.stopping;
        httpServer.close(() => {
          this.status = ServerStatus.stopped;
          resolve(true);
        });
      } else {
        reject(new Error('Server undefined!'));
      }
    });
  },
};
