
export const DEFAULT_CHARSET = 'UTF-8';

export enum Charset {
  gbk = 'GBK',
  utf8 = 'UTF-8',
}

export const DEFAULT_SERVER_PORT = 8900;

// configuration section name
export const CONFIG_SECTION = 'previewServer';

export enum ConfigKeys {
  port = 'webServerPort',
  charset = 'webServerCharset',
}

// info name
export const LOG_TAG = 'Preview Server';

export enum Commands {
  /**
   * 启动GBK服务器
   */
  startGbk = 'preview-server.startGBK',
  /**
   * 启动服务器编码由配置设置
   */
  start = 'preview-server.startServer',
  /**
   * 停止服务器
   */
  stop = 'preview-server.stopServer',
  /**
   * 打开浏览器
   */
  open = 'preview-server.open',
}


export enum ServerStatus {
  /**
   * 停止
   */
  stopped = 0,
  /**
   * 正在启动
   */
  starting = 1,
  /**
   * 完成启动，正在运行
   */
  running = 2,
  /**
   * 正在停止中
   */
  stopping = 3,
}

