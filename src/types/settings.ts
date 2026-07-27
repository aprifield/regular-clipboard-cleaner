import type { Rectangle } from 'electron';

export interface Settings {
  startAtLogin?: boolean;
  maintained?: boolean;
  clearInterval?: number;
  monitorInterval?: number;
  maxHistoryCount?: number;
  maxTextLength?: number;
  retentionPeriod?: number;
  shortcut?: {
    commandOrControl?: boolean;
    alt?: boolean;
    shift?: boolean;
    key?: string;
  };
  preprocessing?: string;
  pasteAfterCopy?: boolean;
  pasteAfterCopyTimeout?: number;
  showNearCursor?: boolean;
  showFrame?: boolean;
  darkTheme?: boolean;
  blockList?: string[];
  historyBounds?: Rectangle;
  settingsBounds?: Rectangle;
}
