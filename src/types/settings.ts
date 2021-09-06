export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  closeAfterCopy?: boolean;
  monitorInterval?: number;
  clearInterval?: number;
  maxHistoryCount?: number;
  hideTaskbarIcon?: boolean;
  hideDockIcon?: boolean;
  shortcut?: {
    commandOrControl?: boolean;
    alt?: boolean;
    shift?: boolean;
    key?: string;
  };
  pasteAfterCopy?: boolean;
  pasteAfterCopyTimeout?: number;
  commandAfterCopy?: string;
  commandAfterCopyTimeout?: number;
  window?: {
    history?: WindowSettings;
    settings?: WindowSettings;
  };
}

export interface WindowSettings {
  position?: number[];
  size?: number[];
  maximized?: boolean;
}
