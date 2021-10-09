import { Rectangle } from 'electron';

export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  closeAfterCopy?: boolean;
  showNearCursor?: boolean;
  monitorInterval?: number;
  clearInterval?: number;
  maxHistoryCount?: number;
  showFrame?: boolean;
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
  historyBounds?: Rectangle;
  settingsBounds?: Rectangle;
}
