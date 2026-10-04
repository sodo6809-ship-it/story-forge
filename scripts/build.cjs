const {build,Platform}=require('electron-builder');
const {getMakeNsisPath}=require('app-builder-lib/out/toolsets/windows');
const {spawnSync}=require('node:child_process');
(async()=>{await build({targets:Platform.WINDOWS.createTarget('dir')});const nsis=await getMakeNsisPath();const r=spawnSync(nsis.path,['-V3','-DAPP_VERSION='+require('../package.json').version,'installer.nsi'],{cwd:require('node:path').resolve('build'),env:{...process.env,...nsis.env},stdio:'inherit'});if(r.error)throw r.error;process.exitCode=r.status||0;})().catch(e=>{console.error(e);process.exitCode=1});
