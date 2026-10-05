'use strict';
// Catalog files are loaded only on selection. Used images are embedded in the project,
// so saved projects and exported HTML never depend on installation paths or the network.
const farmCatalog=[['barn','목재 축사'],['barn-day','밝은 목장'],['barn-rustic','시골 목장'],['barn-night','밤의 목장'],['pasture','방목장'],['milking','착유실'],['breeding','교배용 축사'],['office','목장 사무실']];
const farmLoads=new Map();
function loadFarmAsset(key){
 if(window.FarmAssetData?.[key])return Promise.resolve(window.FarmAssetData[key]);
 if(farmLoads.has(key))return farmLoads.get(key);
 const task=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=`assets/farm/${key}.js`;script.onload=()=>{script.remove();const a=window.FarmAssetData?.[key];if(a)resolve(a);else reject(Error('기본 배경을 읽지 못했어요.'));};script.onerror=()=>{script.remove();reject(Error('기본 배경을 읽지 못했어요. 설치 파일을 다시 확인해 주세요.'));};document.head.append(script);});
 farmLoads.set(key,task);task.catch(()=>farmLoads.delete(key));return task;
}
const farmButton=document.createElement('button');farmButton.id='builtinBackgrounds';farmButton.className='quiet wide';farmButton.textContent='기본 배경 · 목장 8종';document.querySelector('.assetSection .tabs').before(farmButton);
farmButton.onclick=()=>{const project=P,target=map();let busy=false;
 wideModal(`<h2>기본 목장 배경</h2><p>배경을 선택하면 현재 맵에 적용됩니다. 사용한 그림은 프로젝트와 내보낸 게임에 함께 저장됩니다.</p><div class="farmGallery">${farmCatalog.map(([key,name])=>`<button data-farm="${key}"><img src="assets/farm/${key}.webp" alt="${name}"><strong>${name}</strong></button>`).join('')}</div><p>가로로 긴 원본 비율을 유지합니다. 횡스크롤 맵은 가로·세로 약 3:1 비율이 잘 맞아요. 기존 바닥이 배경을 가리면 ‘횡스크롤 빈 공간’으로 지우고 투명 충돌 타일을 놓으세요.</p><div class="actions"><button data-close>닫기</button></div>`,()=>{
 $('modalContent').querySelectorAll('[data-farm]').forEach(button=>button.onclick=async()=>{if(busy)return;busy=true;const buttons=[...$('modalContent').querySelectorAll('[data-farm]')];buttons.forEach(b=>b.disabled=true);
  try{const asset=await loadFarmAsset(button.dataset.farm);if(P!==project||!P.maps.includes(target))throw Error('프로젝트가 바뀌었어요. 배경을 다시 선택해 주세요.');const existing=P.assets.find(a=>a.id===asset.id);if(!existing&&(P.assets.length>=2048||JSON.stringify(P).length+JSON.stringify(asset).length>60*1024*1024))throw Error('프로젝트 에셋 또는 용량 한도를 초과합니다.');checkpoint();if(!existing)P.assets.push(E.clone(asset));target.background=asset.id;target.backgroundSpace='map';selected=asset.id;tab='other';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));changed();$('modal').close();render();toast(`${asset.name} 배경을 적용했어요.`);
  }catch(e){toast(e.message);}finally{busy=false;buttons.forEach(b=>b.disabled=false);}
 });
 });
};
