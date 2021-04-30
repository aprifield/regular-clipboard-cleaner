export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  closeAfterCopy?: boolean;
  monitorInterval?: number;
  clearInterval?: number;
  shortcut?: {
    commandOrControl?: boolean;
    alt?: boolean;
    shift?: boolean;
    key?: string;
  };
  historyWin?: {
    position?: number[];
    size?: number[];
    maximized?: boolean;
  };
  settingsWin?: {
    position?: number[];
    size?: number[];
    maximized?: boolean;
  };
}
