import type {
  HistoryEvent,
  PreprocessingHistoryEvent,
} from '@/types/history-event';
import { exec, execFile } from 'node:child_process';
import path from 'node:path';
import { clipboard, dialog } from 'electron';
import defaultPreprocessing from '@/util/preprocessing';
import rules from '@/util/rules';
import { getSettings } from './electron-store-helper';

const isDevelopment = process.env.NODE_ENV === 'development';

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
        const keySenderFilePath = isDevelopment
          ? path.join(
              process.env.APP_ROOT,
              'resources',
              'bin',
              'DotNetKeySender.exe'
            )
          : path.join(process.resourcesPath, 'bin', 'DotNetKeySender.exe');
        execFile(keySenderFilePath, ['^v'], (error) => {
          if (error) {
            dialog.showErrorBox(
              'Paste Error',
              `The command [${error.cmd}] failed.`
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
