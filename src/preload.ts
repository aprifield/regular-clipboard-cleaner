import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipcBridge', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, args);
  },
  on: (
    channel: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.on(channel, listener);
  }
});
