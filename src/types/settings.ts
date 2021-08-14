export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  closeAfterCopy?: boolean;
  monitorInterval?: number;
  clearInterval?: number;
  maxHistoryCount?: number;
  shortcut?: {
    commandOrControl?: boolean;
    alt?: boolean;
    shift?: boolean;
    key?: string;
  };
  command?: string;
  commandTimeout?: number;
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
