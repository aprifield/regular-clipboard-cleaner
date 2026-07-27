import type {
  HistoryEvent,
  PreprocessingHistoryEvent,
} from '@/types/history-event';
import { exec } from 'node:child_process';
import { clipboard, dialog } from 'electron';
import defaultPreprocessing from '@/util/preprocessing';
import rules from '@/util/rules';
import { getSettings } from './electron-store-helper';

export function copyTextAndPostProcess(
  text: string,
  historyEvent: HistoryEvent,
  hideHistoryWindow: () => void
) {
  const settings = getSettings();
  const preprocessing = settings.preprocessing || defaultPreprocessing;

  let processedText = '';
  let isPastePrevent = false;
  (historyEvent as PreprocessingHistoryEvent).preventPaste = () => {
    isPastePrevent = true;
  };
  try {
    processedText = eval(`(${preprocessing})(text, historyEvent)`);
  } catch (error) {
    processedText = String(error);
  }

  clipboard.writeText(processedText);

  hideHistoryWindow();

  if (!isPastePrevent && settings.pasteAfterCopy) {
    setTimeout(() => {
      const command =
        process.platform === 'darwin'
          ? `osascript -e 'tell application "System Events" to keystroke "v" using command down'`
          : `powershell -NoProfile -WindowStyle Hidden -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^{v}')"`;
      exec(command, (error) => {
        if (error) {
          dialog.showErrorBox(
            'Paste Error',
            `The command [${command}] failed.`
          );
        }
      });
    }, rules.pasteAfterCopyTimeout.value(settings.pasteAfterCopyTimeout));
  }
}
