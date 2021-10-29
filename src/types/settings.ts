import { Rectangle } from 'electron';

export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  clearInterval?: number;
  monitorInterval?: number;
  maxHistoryCount?: number;
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
  closeAfterCopy?: boolean;
  showNearCursor?: boolean;
  showFrame?: boolean;
  showTaskbarIcon?: boolean;
  showDockIcon?: boolean;
  darkTheme?: boolean;
  historyBounds?: Rectangle;
  settingsBounds?: Rectangle;
}
