import { Rectangle } from 'electron';

export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  showNearCursor?: boolean;
  monitorInterval?: number;
  clearInterval?: number;
  maxHistoryCount?: number;
  showFrame?: boolean;
  showTaskbarIcon?: boolean;
  showDockIcon?: boolean;
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
  historyBounds?: Rectangle;
  settingsBounds?: Rectangle;
}
