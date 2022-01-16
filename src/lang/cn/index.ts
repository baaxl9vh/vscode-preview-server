import { LOG_TAG } from '../../constants';

export interface Language {
  [key: string] : string;
}

export const lang: Language = {
  'SERVER_STARTING' : `${LOG_TAG}: Server is starting. please wait...`,
  'SERVER_RUNNING' : `${LOG_TAG}: Server is running.`,
  'SERVER_STOPPING' : `${LOG_TAG}: Server is stopping. please wait...`,
  'SERVER_STOPPED' : `${LOG_TAG}: Server is NOT running.`,
  'NO_FOLDERS': `${LOG_TAG}: No workspace folders!`,
  'PORT_USED': `${LOG_TAG}: Port already in use: `,
  'RESULT_STOPPED': `${LOG_TAG}: Server is stopped now.`,
  'RESULT_START_SUC': `${LOG_TAG}: Start successful.`,
};

export function t(key: string) {
  return lang[key] || key;
}