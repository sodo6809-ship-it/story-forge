const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const E=require('../app/engine.js'),A=require('../app/action.js')(E);
// Each bundled asset is self-contained and survives validation/serialization.
const context={window:{}};vm.createContext(context);
for(const f of fs.readdirSync(path.join(__dirname,'../app/assets/farm')).filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/assets/farm',f),'utf8'),context);
const assets=Object.values(context.window.FarmAssetData);assert.equal(assets.length,8);
for(const a of assets){const p=A.sample();p.assets=[JSON.parse(JSON.stringify(a))];p.maps[0].background=a.id;p.maps[0].backgroundSpace='map';assert(a.preserveAspect);assert.equal(Buffer.from(a.data.split(',')[1],'base64').subarray(8,12).toString(),'WEBP');E.validate(JSON.parse(JSON.stringify(p)));}
// Contain tall/wide art, bottom-align feet, and retain explicit legacy stretching.
assert.deepEqual(E.fitRect(50,100,0,0,80,96,true,1),{x:16,y:0,w:48,h:96});
assert.deepEqual(E.fitRect(200,100,0,0,40,96,true,1),{x:0,y:76,w:40,h:20});
assert.deepEqual(E.fitRect(200,100,0,0,40,96,false),{x:0,y:0,w:40,h:96});
const calls=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(...args){calls.push(args);}};
global.Image=class{complete=true;naturalWidth=400;naturalHeight=100;};
let p=A.sample();p.assets=[{id:'sheet',kind:'animation',data:'data:image/png;base64,AAAA',cols:4,rows:1,frames:4,fps:8,preserveAspect:true}];
A.frame(ctx,p,'sheet',0,0,40,96,0,true,false,1);assert.deepEqual(calls[0].slice(1,5),[0,0,100,100]);assert.deepEqual(calls[0].slice(-2),[40,40]);
p.assets[0].preserveAspect=false;A.frame(ctx,p,'sheet',0,0,40,96,0);assert.deepEqual(calls[1].slice(-2),[40,96]);delete global.Image;
// A collision-only floor and wall block motion with entirely empty visual layers.
p=A.sample();const m=p.maps[0];m.enemies=[];m.ground.fill('air');m.objects.fill(null);for(let y=9;y<16;y++)m.collision[y*m.w+5]=true;
const s=A.create(p);for(let i=0;i<120;i++)A.tick(p,s,1/60,{right:true});assert(s.grounded);assert.equal(s.py,512);assert(s.px+12<=160.01);assert(m.ground.every(t=>t==='air'));assert(m.objects.every(t=>t===null));
E.drawAsset({},p,'collider',0,0);const legacy=E.sample();E.validate(legacy);const bad=JSON.parse(JSON.stringify(p));bad.assets=[{id:'bad',kind:'background',data:'data:image/png;base64,AAAA',preserveAspect:'yes'}];assert.throws(()=>E.validate(bad));
console.log('PASS: 8 bundled backgrounds, portable roundtrip, aspect fit/legacy stretch, frame-cell ratio, invisible floor/wall collision');
