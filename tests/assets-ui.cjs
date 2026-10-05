const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'storyforge-assets-'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage'],headless:true});
 const page=await browser.newPage({viewport:{width:1480,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve('app/index.html'));
 await page.locator('#actionExample').click();await page.locator('#confirmAction').click();
 await page.locator('#builtinBackgrounds').click();assert.equal(await page.locator('[data-farm]').count(),8);
 await page.locator('[data-farm="barn-day"]').click();await page.waitForFunction(()=>map().background==='builtin-farm-barn-day');
 assert.equal(await page.evaluate(()=>P.assets.length),1);assert.equal(await page.evaluate(()=>map().backgroundSpace),'map');
 await page.locator('#builtinBackgrounds').click();await page.locator('[data-farm="barn-day"]').click();await page.waitForFunction(()=>!document.getElementById('modal').open);assert.equal(await page.evaluate(()=>P.assets.length),1);
 await page.locator('#assetAspect').uncheck();assert.equal(await page.evaluate(()=>P.assets[0].preserveAspect),false);await page.locator('#undo').click();assert.equal(await page.evaluate(()=>P.assets[0].preserveAspect),true);
 await page.locator('[data-tab="tile"]').click();await page.locator('[data-asset="collider"]').click();assert.equal(await page.locator('#layer').inputValue(),'collision');assert(await page.locator('#showCollision').isChecked());
 const before=await page.evaluate(()=>({ground:map().ground[10*map().w+6],objects:map().objects[10*map().w+6]}));
 await page.locator('#mapCanvas').click({position:{x:6*32+16,y:10*32+16}});assert.equal(await page.evaluate(()=>map().collision[10*map().w+6]),true);assert.deepEqual(await page.evaluate(()=>({ground:map().ground[10*map().w+6],objects:map().objects[10*map().w+6]})),before);
 await page.locator('#undo').click();assert.equal(await page.evaluate(()=>map().collision[10*map().w+6]),null);await page.locator('#redo').click();assert.equal(await page.evaluate(()=>map().collision[10*map().w+6]),true);
 const picture=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=60;c.height=120;const x=c.getContext('2d');x.fillStyle='#eb7788';x.fillRect(0,0,60,120);return c.toDataURL().split(',')[1];});const input=path.join(temp,'tall.png');fs.writeFileSync(input,Buffer.from(picture,'base64'));
 await page.locator('#assetFile').setInputFiles(input);await page.locator('#assetKind').selectOption('character');assert(await page.locator('#importAspect').isChecked());await page.locator('#addAsset').click();const id=await page.evaluate(()=>P.assets.at(-1).id);
 assert(await page.evaluate(()=>P.assets.at(-1).preserveAspect));
 await page.locator('#actorSettings').click();await page.locator('[data-clip="idle"]').selectOption(id);await page.locator('#applyActor').click();
 // Verify real Canvas destination dimensions and bottom anchor, including mirror facing.
 const geometry=await page.evaluate(async id=>{const a=P.assets.find(a=>a.id===id),im=new Image();im.src=a.data;await im.decode();const c=document.createElement('canvas'),ctx=c.getContext('2d'),calls=[];const draw=ctx.drawImage.bind(ctx);ctx.drawImage=(...args)=>{calls.push(args.slice(1));draw(...args);};A.actor(ctx,P,{px:100,py:200,anim:'idle',facing:-1},A.config(P),0);await new Promise(r=>setTimeout(r,50));A.actor(ctx,P,{px:100,py:200,anim:'idle',facing:-1},A.config(P),0);return calls.at(-1);},id);
 assert.deepEqual(geometry.slice(-2),[40,80]);
 await page.locator('#motionFile').setInputFiles(input);assert(await page.locator('#motionAspect').isChecked());await page.locator('#addMotion').click();assert(await page.evaluate(()=>P.assets.at(-1).preserveAspect));
 const serialized=await page.evaluate(()=>JSON.stringify(P));await page.evaluate(t=>loadText(t),serialized);assert.equal(await page.evaluate(()=>map().collision[10*map().w+6]),true);assert.equal(await page.evaluate(()=>P.assets[0].preserveAspect),true);
 // Background + transparent floor; no generated asset path is required by export.
 await page.evaluate(()=>{map().ground.fill('air');map().objects.fill(null);map().enemies=[];map().events=[];render();});
 await page.locator('#play').click();await page.waitForFunction(()=>actionRuntime?.state.grounded);assert(Math.abs(await page.evaluate(()=>actionRuntime.state.py)-512)<.01);await page.keyboard.press('Escape');
 const html=await page.evaluate(()=>exportHTML());assert(html.includes('data:image/webp;base64,'));assert(!html.includes('assets/farm/'));const exported=path.join(temp,'game.html');fs.writeFileSync(exported,html);
 const game=await browser.newPage();game.on('pageerror',e=>errors.push(e.message));await game.goto('file://'+exported);await game.waitForSelector('.actionStatus');await game.waitForTimeout(200);assert.match(await game.locator('.actionStatus').textContent(),/체력/);
 await page.setViewportSize({width:1000,height:720});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);await browser.close();fs.rmSync(temp,{recursive:true,force:true});console.log('PASS: gallery selection/deduplication, ratio import/toggle/undo, real frame rendering, collision painting/undo, project roundtrip, play, portable export, small viewport');
})().catch(e=>{console.error(e);process.exit(1);});
