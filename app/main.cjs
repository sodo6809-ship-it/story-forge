const {app,BrowserWindow,ipcMain,dialog,Menu}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path');
let win,currentPath=null,pendingPath=null;
const maxBytes=64*1024*1024;
let installing=false,updater,recoveryQueue=Promise.resolve();
const {createUpdater}=require('./updater.cjs');
const updateConfig=require('./update-config.json');
const {spawn}=require('node:child_process');
const Engine=require('./engine.js');
if(!app.requestSingleInstanceLock())app.quit();
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
function trusted(e){if(e.sender!==win.webContents||e.senderFrame!==win.webContents.mainFrame)throw Error('Invalid sender');}
async function atomic(file,text){await fs.mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+require('node:crypto').randomUUID()+'.tmp';await fs.writeFile(tmp,text,'utf8');await fs.rename(tmp,file);}
app.whenReady().then(()=>{
 Menu.setApplicationMenu(null);
 win=new BrowserWindow({width:1480,height:960,minWidth:980,minHeight:700,backgroundColor:'#16191f',icon:path.join(__dirname,'icon.png'),title:'이야기 공방',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.webContents.on('will-prevent-unload',e=>{if(installing){e.preventDefault();return;}const choice=dialog.showMessageBoxSync(win,{type:'question',buttons:['계속 편집','저장하지 않고 종료'],defaultId:0,cancelId:0,title:'이야기 공방',message:'저장하지 않은 변경이 있습니다.',detail:'파일로 저장하려면 계속 편집을 누른 뒤 저장해 주세요.'});if(choice===1)e.preventDefault();});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',e=>e.preventDefault());
 win.webContents.session.setPermissionRequestHandler((wc,permission,callback)=>callback(false));
 updater=createUpdater({app,win,config:updateConfig,spawn,saveProject:async text=>{
  if(!currentPath)throw Error('업데이트 전에 프로젝트를 파일로 저장해 주세요.');
  if(typeof text!=='string'||Buffer.byteLength(text)>maxBytes)throw Error('프로젝트 크기를 확인해 주세요.');
  Engine.validate(JSON.parse(text));
  await atomic(currentPath,text);
  await recoveryQueue.catch(()=>{});
  await atomic(path.join(app.getPath('userData'),'recovery.storyforge'),text);
 },onInstalling:()=>{installing=true;}});
 ipcMain.handle('update:state',e=>{trusted(e);return updater.state()});
 ipcMain.handle('update:check',e=>{trusted(e);return updater.check()});
 ipcMain.handle('update:download',e=>{trusted(e);return updater.download()});
 ipcMain.handle('update:install',(e,text)=>{trusted(e);return updater.install(text)});
 win.webContents.once('did-finish-load',()=>{if(updateConfig.repository)setTimeout(()=>updater.check(),3000)});
 win.loadFile(path.join(__dirname,'index.html'));
 ipcMain.handle('project:open',async(e)=>{trusted(e);const r=await dialog.showOpenDialog(win,{filters:[{name:'이야기 공방 프로젝트',extensions:['storyforge','json']}],properties:['openFile']});if(r.canceled)return null;const f=r.filePaths[0];if((await fs.stat(f)).size>maxBytes)throw Error('프로젝트는 64MB 이하만 열 수 있습니다.');pendingPath=f;return {text:await fs.readFile(f,'utf8'),path:f};});
 ipcMain.handle('project:accept',async(e,p)=>{trusted(e);if(typeof p==='string'&&p===pendingPath){currentPath=p;pendingPath=null;}});
 ipcMain.handle('project:save',async(e,text,saveAs)=>{trusted(e);if(typeof text!=='string'||Buffer.byteLength(text)>maxBytes)throw Error('프로젝트가 너무 큽니다.');let f=currentPath;if(!f||saveAs){const r=await dialog.showSaveDialog(win,{defaultPath:f||'나의 이야기.storyforge',filters:[{name:'이야기 공방 프로젝트',extensions:['storyforge']}]});if(r.canceled)return null;f=r.filePath;}await atomic(f,text);currentPath=f;return f;});
 ipcMain.handle('project:reset',async e=>{trusted(e);currentPath=null;});
 ipcMain.handle('project:autosave',async(e,text)=>{trusted(e);if(typeof text==='string'&&Buffer.byteLength(text)<=maxBytes){recoveryQueue=recoveryQueue.catch(()=>{}).then(()=>atomic(path.join(app.getPath('userData'),'recovery.storyforge'),text));await recoveryQueue;}});
 ipcMain.handle('project:recover',async e=>{trusted(e);try{return await fs.readFile(path.join(app.getPath('userData'),'recovery.storyforge'),'utf8')}catch{return null}});
 ipcMain.handle('game:export',async(e,text)=>{trusted(e);if(typeof text!=='string'||Buffer.byteLength(text)>maxBytes*2)throw Error('내보낼 파일이 너무 큽니다.');const r=await dialog.showSaveDialog(win,{defaultPath:'나의 이야기.html',filters:[{name:'플레이용 게임',extensions:['html']}]});if(r.canceled)return null;await atomic(r.filePath,text);return r.filePath;});
});
app.on('window-all-closed',()=>app.quit());
