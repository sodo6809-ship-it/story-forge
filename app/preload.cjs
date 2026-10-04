const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{
 open:()=>ipcRenderer.invoke('project:open'),accept:p=>ipcRenderer.invoke('project:accept',p),save:(text,as)=>ipcRenderer.invoke('project:save',text,as),reset:()=>ipcRenderer.invoke('project:reset'),autosave:text=>ipcRenderer.invoke('project:autosave',text),recover:()=>ipcRenderer.invoke('project:recover'),export:text=>ipcRenderer.invoke('game:export',text),
 getUpdateState:()=>ipcRenderer.invoke('update:state'),checkUpdate:()=>ipcRenderer.invoke('update:check'),downloadUpdate:()=>ipcRenderer.invoke('update:download'),installUpdate:text=>ipcRenderer.invoke('update:install',text),
 onUpdate:callback=>{const listener=(_event,state)=>callback(state);ipcRenderer.on('update:status',listener);return ()=>ipcRenderer.removeListener('update:status',listener);}

});
