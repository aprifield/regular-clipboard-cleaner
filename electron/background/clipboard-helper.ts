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

  let isPastePrevent = false;
  (historyEvent as PreprocessingHistoryEvent).preventPaste = () => {
    isPastePrevent = true;
  };
  try {
    text = eval(`(${preprocessing})(text, historyEvent)`);
  } catch (error) {
    text = error + '';
  }

  clipboard.writeText(text);

  if (settings.closeAfterCopy) {
    hideHistoryWindow();
  }

  if (!isPastePrevent) {
    if (settings.pasteAfterCopy) {
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
    if (settings.commandAfterCopy) {
      setTimeout(() => {
        exec(settings.commandAfterCopy!, (error) => {
          if (error) {
            dialog.showErrorBox(
              'Command Error',
              `The command [${settings.commandAfterCopy}] failed.`
            );
          }
        });
      }, rules.commandAfterCopyTimeout.value(settings.commandAfterCopyTimeout));
    }
  }
}
