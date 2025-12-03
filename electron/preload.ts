import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipcBridge', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (event: any, data: any) => void) =>
    ipcRenderer.on(channel, callback),
});
