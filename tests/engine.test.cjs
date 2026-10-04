const assert=require('node:assert/strict'),E=require('../app/engine.js');
const p=E.validate(E.sample()),s=E.createState(p),m=p.maps[0];
assert.equal(E.solid(p,m,21,10),true);assert.equal(E.solid(p,m,10,12),false);
// Item acquisition is committed after dialogue, and only once.
s.x=4;s.y=11;s.dir=3;assert.equal(E.interact(p,s),true);assert.equal(s.inventory['오래된 열쇠'],undefined);E.next(p,s);assert.equal(s.inventory['오래된 열쇠'],1);assert(s.done.includes('village:gift'));E.interact(p,s);assert.match(s.dialog.text,/비어/);E.next(p,s);assert.equal(s.inventory['오래된 열쇠'],1);
// Locked door, successful transfer, and return route.
const locked=E.createState(p);locked.x=6;locked.y=8;E.move(p,locked,0,-1);assert.equal(locked.map,'village');assert.match(locked.dialog.text,/잠겨/);
s.x=6;s.y=8;assert(E.move(p,s,0,-1));assert.equal(s.map,'house');assert.equal(s.y,8);E.move(p,s,0,1);assert.equal(s.map,'village');assert.equal(s.y,8);
// Choice sets named switch; switch-condition and fallback.
s.x=10;s.y=9;s.dir=3;E.interact(p,s);E.next(p,s);assert.equal(s.dialog.type,'choice');E.choose(p,s,0);assert.equal(s.switches['모험 시작'],true);assert.equal(s.dialog.type,'text');E.next(p,s);assert.equal(s.dialog,null);
E.trigger(p,s,{id:'conditional',condition:{type:'switch',key:'missing'},fallback:'잠김',commands:[]});assert.equal(s.dialog.text,'잠김');E.next(p,s);
// Project data remains untouched by play, collision overrides, hostile-key inventory.
assert.equal(p.maps[0].events[1].commands[1].amount,1);const i=10*m.w+21;m.collision[i]=false;assert.equal(E.solid(p,m,21,10),false);m.collision[i]=null;
s.queue=[{type:'item',name:'__proto__',amount:1},{type:'item',name:'toString',amount:2}];E.next(p,s);assert.equal(s.inventory.__proto__,1);assert.equal(s.inventory.toString,2);
const bad=E.clone(p);bad.maps[0].w=100000;assert.throws(()=>E.validate(bad));const broken=E.clone(p);broken.maps[0].events[2].commands[0].x=999;assert.throws(()=>E.validate(broken));
console.log('PASS: collision, dialogue, once-only item, locked door, map travel, choice switch, condition fallback, isolated state, schema bounds');
