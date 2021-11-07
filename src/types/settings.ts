import { Rectangle } from 'electron';

export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  clearInterval?: number;
  monitorInterval?: number;
  maxHistoryCount?: number;
  maxTextLength?: number;
  shortcut?: {
    commandOrControl?: boolean;
    alt?: boolean;
    shift?: boolean;
    key?: string;
  };
  preprocessing?: string;
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
  blockList?: string[];
  historyBounds?: Rectangle;
  settingsBounds?: Rectangle;
}
