export interface HistoryEvent {
  altKey: boolean;
  code?: string;
  ctrlKey: boolean;
  key?: string;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface PreprocessingHistoryEvent extends HistoryEvent {
  preventPaste(): void;
}
