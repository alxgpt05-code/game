import * as T from 'https://esm.sh/three@0.169.0';
import { RoundedBoxGeometry } from 'https://esm.sh/three@0.169.0/examples/jsm/geometries/RoundedBoxGeometry.js';
import {forwardForkPoint,FRONT_AXLE_X} from './geometry-config.js';

// Metres. Reconstructed product silhouettes, not manufacturer CAD.
const textureCache=new Map();
const mushroomTexture=new T.TextureLoader().load('./assets/mushroom-reference.jpg',()=>document.dispatchEvent(new Event('scooter-texture-ready')));mushroomTexture.colorSpace=T.SRGBColorSpace;mushroomTexture.anisotropy=8;
function canvasTexture(key,draw,w=1024,h=512){if(textureCache.has(key))return textureCache.get(key);const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;textureCache.set(key,tex);return tex;}
function seededNoise(ctx,w,h,base,range){let seed=7127;const im=ctx.createImageData(w,h);for(let i=0;i<im.data.length;i+=4){seed=(seed*16807)%2147483647;let n=base+seed/2147483647*range;im.data[i]=im.data[i+1]=im.data[i+2]=n;im.data[i+3]=255}ctx.putImageData(im,0,0)}
function grit(index){return canvasTexture('grit'+index,(c,w,h)=>{seededNoise(c,w,h,22,48);c.textAlign='center';c.textBaseline='middle';if(index===1){c.save();c.translate(w/2,h/2);c.rotate(-.12);c.font='italic 900 135px Arial';c.fillStyle='#e5e5d9';c.fillText('ETHIC',0,-15);c.font='24px Arial';c.fillText('D T C  /  D I S S I D E N C E',0,80);c.restore()}else if(index===2){c.strokeStyle='#bed640';c.lineWidth=12;c.beginPath();c.moveTo(70,h-40);c.lineTo(w-80,40);c.stroke();c.fillStyle='#ecf1de';c.font='900 62px Arial';c.fillText('TECH TEAM',w/2,h/2)}else if(index===0){c.fillStyle='#d9ded1';c.font='900 32px Arial';c.fillText('MOB GRIP',w*.8,h*.8)}});}
function decalTexture(text,color='#e4e5df',sub=''){return canvasTexture('label'+text+color+sub,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='italic 900 160px Arial';c.fillText(text,w/2,h*.46,w*.94);if(sub){c.font='30px Arial';c.fillText(sub,w/2,h*.78,w*.91)}},1024,512)}
function sidewallTexture(brand){return canvasTexture('wheel'+brand,(c,w,h)=>{c.clearRect(0,0,w,h);c.translate(w/2,h/2);c.fillStyle='#b9bdb1';let s=brand.toUpperCase()+'  •  110 MM  •  88A  •  ';c.font='bold 35px Arial';c.textAlign='center';for(let i=0;i<s.length;i++){c.save();c.rotate(i/s.length*Math.PI*2);c.fillText(s[i],0,-h*.435);c.restore()}},512,512)}
export const variantNotes=[
['Узкая park-дека · косые дропауты · 82,5°','Гибридная дека · ширина 127 мм · raw','Street · boxed-дропауты · пеги · 152 мм','Стартовая сборка · чёрная park-дека по фото'],
['AIR · закрытый полый сердечник','Incube · открытые спицы сердечника','Tech Team · шестилучевой сердечник','Грибной рисунок из твоего фото · закрытый core','5 объёмных спиц · переливающийся neochrome','Сквозные шестигранные соты · purple','Стартовая сборка · 5 серебристых спиц'],
['Trianon · прямой T-профиль','Bol · Y-профиль и перемычка','Tech Team · усиленный T-профиль','Плавный Y-профиль с цельной косынкой, по фото'],
['Ethic · облегчённые фигурные перья','Root AIR · моноблок с окнами','Tech Team · прямые массивные перья','Чёрная фигурная вилка, по фото'],
['Root AIR · двухболтовый моноблок','Ethic · облегчённый корпус','Tech Team · высокий корпус, два болта','Чёрный узкий двухболтовый зажим, по фото'],
['ODI · частые mushroom-рёбра','Ethic · спиральный рельеф','Tech Team · ромбовидная насечка','Чёрная резина · частая мелкая насечка'],
['MOB · абразивная чёрная поверхность','Ethic DTC · графическая шкурка','Tech Team · диагональная графика','Чёрная абразивная шкурка без рисунка, по фото'],
['Apex · низкая коническая крышка','Ethic · ступенчатая крышка','Tech Team · высокая крышка']];

export function createScooter(indices,color){
 const root=new T.Group(),groups=Array.from({length:8},(_,i)=>{const g=new T.Group();g.userData.category=i;root.add(g);return g});
 let g=groups[0];const materials=[];const mat=(c,m=.65,r=.3)=>{let v=new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});materials.push(v);return v};
 const chrome=mat('#bfc3c5',1,.16),raw=mat('#b5bac0',.95,.29),dark=mat('#272b30',.78,.32),rubber=mat('#24262a',0,.85),tire=mat('#37393c',0,.7),accent=mat(color,.73,.27),silver=mat('#dadee0',.94,.2),weld=mat('#9b9b8c',.85,.37),black=mat('#12151a',.42,.32);
 const put=(geo,material,p=[0,0,0],parent=g)=>{const m=new T.Mesh(geo,material);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const rod=(a,b,r,material,r2=r,parent=g,segments=32)=>{const p=new T.Vector3(...a),d=new T.Vector3(...b).sub(p);const o=put(new T.CylinderGeometry(r2,r,d.length(),segments),material,p.addScaledVector(d,.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o};
 const box=(w,h,d,material,p,r=.002)=>put(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material,p);
 const torus=(r,t,material,p,axis='z')=>{const o=put(new T.TorusGeometry(r,t,8,64),material,p);if(axis==='y')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.y=Math.PI/2;return o};
 const curved=(pts,r,material)=>{const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));return put(new T.TubeGeometry(curve,48,r,12,false),material)};
 const label=(text,p,w,h,normal='z',sub='',ink)=>{const material=new T.MeshStandardMaterial({map:decalTexture(text,ink||'#e5e7e0',sub),transparent:true,depthWrite:false,roughness:.45,metalness:.15,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});materials.push(material);const o=put(new T.PlaneGeometry(w,h),material,p);o.castShadow=false;if(normal==='y')o.rotation.x=-Math.PI/2;if(normal==='x')o.rotation.y=Math.PI/2;if(normal==='-z')o.rotation.y=Math.PI;return o;};
 const bolt=(p,axis='z',r=.004)=>{const v=axis==='y'?[0,1,0]:axis==='x'?[1,0,0]:[0,0,1];rod(p,p.map((a,i)=>a+v[i]*.002),r,silver,r,g,32);const end=p.map((a,i)=>a+v[i]*.0022);const inner=rod(end,end.map((a,i)=>a+v[i]*.00025),r*.47,black,r*.47,g,6);return inner};
 const plate=(outline,depth,material,z=0,holes=[])=>{const s=new T.Shape();outline.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();for(const points of holes){const path=new T.Path();points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();s.holes.push(path)}const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.001,bevelThickness:.001});return put(geo,material,[0,0,z-depth/2])};
 const di=indices[0],width=[.114,.127,.152,.12][di],length=[.49,.49,.534,.48][di],rear=-length+.125,front=FRONT_AXLE_X,rearAxle=rear+.015,yDeck=.088,upper=.117;
 const deckMaterial=di===1?raw:di===3?black:dark;
 // Extruded deck with real concave profile, rounded rails, and a rear wheel opening.
 const cross=new T.Shape();cross.moveTo(-width/2,.003);cross.lineTo(-width/2,.028);cross.quadraticCurveTo(-width*.43,.032,-width*.34,.029);cross.quadraticCurveTo(0,.022,width*.34,.029);cross.quadraticCurveTo(width*.43,.032,width/2,.028);cross.lineTo(width/2,.003);cross.quadraticCurveTo(width/2-.002,0,width/2-.005,0);cross.lineTo(-width/2+.005,0);cross.quadraticCurveTo(-width/2,0,-width/2,.003);
 const bodyGeo=new T.ExtrudeGeometry(cross,{depth:length-.07,bevelEnabled:false,steps:1,curveSegments:12});const body=put(bodyGeo,deckMaterial,[rear+.06,yDeck,0]);body.rotation.y=Math.PI/2;
 for(const s of [-1,1]){
  const z=s*(width/2-.004);rod([rear+.06,yDeck+.004,z],[.15,yDeck+.004,z],.004,deckMaterial);
  const outline=di===2?[[rear-.015,.06],[rear-.015,.116],[rear+.08,.116],[rear+.09,.085]]:[[rear-.012,.058],[rear+.012,.109],[rear+.09,.116],[rear+.085,.084]];
  plate(outline,di===2?.025:.015,deckMaterial,s*(width/2-(di===2?.014:.009)));
  if(di===2){rod([rearAxle,.055,s*.022],[rearAxle,.055,s*(width/2+.002)],.014,raw);bolt([rearAxle,.055,s*(width/2+.003)],'z',.006)}else{bolt([rearAxle,.055,s*(width/2+.001)],'z',.005)}
  // Side wall engraving and milled lower channel.
  if(di!==3)label('APEX',[-.12,.104,s*(width/2+.0004)],.09,.018,s<0?'-z':'z','',di===1?'#383d42':'#c4c7c9');
  rod([rear+.09,.092,s*(width/2+.0001)],[.09,.092,s*(width/2+.0001)],.00065,di===1?dark:raw);
 }
 // Deck neck with a genuine open window instead of a solid cylinder.
 const neckOutline=[[.075,.104],[.155,.107],[.223,.205],[.225,.244],[.198,.253],[.162,.177]];
 const neckHole=[[.138,.122],[.181,.155],[.203,.211],[.188,.207]];
 plate(neckOutline,di===3?.037:.032,deckMaterial,0,di===3?[]:[neckHole]);
 const headBottom=[.237,.16,0],headTop=[.223,.266,0];
 const hs=new T.Shape();hs.absarc(0,0,.0255,0,Math.PI*2,false);const hb=new T.Path();hb.absarc(0,0,.0208,0,Math.PI*2,true);hs.holes.push(hb);const headGeo=new T.ExtrudeGeometry(hs,{depth:.107,bevelEnabled:true,bevelSize:.0006,bevelThickness:.0006,bevelSegments:2,steps:1,curveSegments:48});const ht=put(headGeo,deckMaterial,headBottom);ht.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...headTop).sub(new T.Vector3(...headBottom)).normalize());
 for(let j=0;j<2;j++)torus(.0262,.0017,raw,[.237-j*.014,.163+j*.098,0],'y').rotation.z=.13;
 if(di!==3)label('APEX',[.248,.224,.023],.04,.017,'z');
 for(const s of [-1,1]){
  // TIG beads along both deck-neck seams.
  for(let k=0;k<18;k++)put(new T.SphereGeometry(.0022,6,4),di===1?weld:dark,[.078+k*.0035,.117,s*.018]);
  for(let k=0;k<16;k++)put(new T.SphereGeometry(.0015,6,4),di===1?weld:dark,[.213,.182+k*.0036,s*.025]);
 }
 const brakeCurve=[new T.Vector3(rear+.11,.118,0),new T.Vector3(rear+.052,.12,0),new T.Vector3(rearAxle+.005,.114,0),new T.Vector3(rearAxle-.025,.1,0)];
 // Flat curved steel brake/fender, rear wheel visible through dropouts.
 const brakePath=new T.CatmullRomCurve3(brakeCurve),bpos=[],bind=[];for(let i=0;i<=24;i++){const p=brakePath.getPoint(i/24);for(const z of [-.014,.014])bpos.push(p.x,p.y,z);if(i<24){const a=i*2;bind.push(a,a+1,a+2,a+1,a+3,a+2)}}const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(bpos,3));bg.setIndex(bind);bg.computeVertexNormals();const bm=mat('#5b6064',.85,.25);bm.side=T.DoubleSide;put(bg,bm);bolt([rear+.103,.121,0],'y');
 // Exposed extrusion channels on the underside.
 for(const s of [-1,1]){box(length-.14,.004,.017,raw,[(rear+.09+.13)/2,.087,s*width*.3]);for(let i=0;i<3;i++)box(.07,.002,.007,dark,[-.22+i*.1,.084,s*width*.3])}
 if(di!==3)label('APEX',[(rear+.14)/2,.082,0],length*.53,width*.62,'y','DESIGNED & MANUFACTURED IN AUSTRALIA',di===1?'#42464a':'#c0c6c7').rotation.x=Math.PI/2;
 g=groups[6];
 // Concave griptape mesh follows the deck profile, with real abrasive normal relief.
 const gp=[],guv=[],gidx=[],gx0=rear+.067,gx1=.115;
 for(let i=0;i<=20;i++)for(let j=0;j<=12;j++){const z=(j/12-.5)*(width-.009),x=gx0+(gx1-gx0)*i/20;gp.push(x,.1145+.0045*Math.pow(z/(width/2),2),z);guv.push(i/20,j/12);if(i<20&&j<12){let a=i*13+j;gidx.push(a,a+13,a+1,a+1,a+13,a+14)}}
 const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(gp,3));gg.setAttribute('uv',new T.Float32BufferAttribute(guv,2));gg.setIndex(gidx);gg.computeVertexNormals();let gm=new T.MeshStandardMaterial({map:grit(indices[6]),bumpMap:grit(0),bumpScale:.0006,roughness:.98,side:T.DoubleSide});materials.push(gm);put(gg,gm);
 // Wheels: three genuinely different cores, bearing assemblies and PU profiles.
 g=groups[1];const wi=indices[1];
 for(const x of [rearAxle,front]){
  g=new T.Group();groups[1].add(g);
 const profile=[[.039,-.01],[.039,-.012],[.047,-.0117],[.053,-.0085],[.055,-.004],[.055,.004],[.053,.0085],[.047,.0117],[.039,.012],[.039,.01]].map(p=>new T.Vector2(...p));
 const tireGeo=new T.LatheGeometry(profile,128);tireGeo.rotateX(Math.PI/2);put(tireGeo,wi>=3?rubber:tire,[x,.055,0]);
 if(wi>=3){
  let coreMat=wi===5?mat('#bd27bf',.92,.21):wi===3?black:chrome;
  const rainbow=new T.MeshPhysicalMaterial({vertexColors:true,metalness:1,roughness:.13,iridescence:.85,iridescenceIOR:1.35,iridescenceThicknessRange:[180,600],clearcoat:1,clearcoatRoughness:.15});materials.push(rainbow);
  const rainbowGeo=(geo,offset=0)=>{let colors=[],pos=geo.attributes.position,col=new T.Color();for(let j=0;j<pos.count;j++){let a=Math.atan2(pos.getY(j),pos.getX(j));let hue=((a/Math.PI/2+pos.getZ(j)*35+offset)%1+1)%1;col.setHSL(hue,.95,.40);colors.push(col.r,col.g,col.b)}geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));return geo};
  if(wi===3){
   // Exact supplied mushroom artwork, projected onto a real 3D disc rather than a flat wheel image.
   const discShape=new T.Shape();discShape.absarc(0,0,.039,0,Math.PI*2,false);let hole=new T.Path();hole.absarc(0,0,.009,0,Math.PI*2,true);discShape.holes.push(hole);let discGeo=new T.ExtrudeGeometry(discShape,{depth:.020,bevelEnabled:true,bevelSize:.0006,bevelThickness:.0006,bevelSegments:3,curveSegments:96,steps:1});put(discGeo,black,[x,.055,-.010]);
   for(const side of [-1,1]){const geo=new T.RingGeometry(.0135,.039,128,1);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let j=0;j<pos.count;j++)uv.setXY(j,.5+pos.getX(j)/.105,.496+pos.getY(j)/.105);const m=new T.MeshStandardMaterial({map:mushroomTexture,metalness:.36,roughness:.42,side:T.DoubleSide});materials.push(m);put(geo,m,[x,.055,side*.0108]);torus(.039,.0008,chrome,[x,.055,side*.0103]);torus(.0136,.001,black,[x,.055,side*.0114]);}
  }else if(wi===5){
   // Hexagonal perforations go through the core. Every opening has its own bevelled inner wall.
   const hs=new T.Shape();hs.absarc(0,0,.039,0,Math.PI*2,false);const centre=new T.Path();centre.absarc(0,0,.009,0,Math.PI*2,true);hs.holes.push(centre);
   for(let row=-8;row<=8;row++)for(let col=-8;col<=8;col++){let hx=col*.0049+(row%2)*.00245,hy=row*.00425,rad=Math.hypot(hx,hy);if(rad<.014||rad>.0352)continue;let hole=new T.Path();for(let k=0;k<6;k++){let a=-k*Math.PI/3+Math.PI/6;let px=hx+Math.cos(a)*.00205,py=hy+Math.sin(a)*.00205;k?hole.lineTo(px,py):hole.moveTo(px,py)}hole.closePath();hs.holes.push(hole)}
   const hg=new T.ExtrudeGeometry(hs,{depth:.0035,bevelEnabled:true,bevelSize:.00027,bevelThickness:.00027,bevelSegments:2,steps:1,curveSegments:96});put(hg,coreMat,[x,.055,-.00175]);
   for(const side of [-1,1]){torus(.0388,.0008,coreMat,[x,.055,side*.0102]);torus(.011,.0013,coreMat,[x,.055,side*.0102]);}
  }else{
   // Broad sculpted spokes with curved shoulders, full depth and rounded machined edges.
   for(let k=0;k<5;k++){const spoke=new T.Shape();spoke.moveTo(.0075,-.004);spoke.bezierCurveTo(.019,-.004,.025,-.014,.038,-.009);spoke.lineTo(.039,.002);spoke.bezierCurveTo(.028,.001,.022,.011,.010,.005);spoke.closePath();let geo=new T.ExtrudeGeometry(spoke,{depth:.018,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:4,curveSegments:12,steps:1});geo.translate(0,0,-.009);geo.rotateZ(k*Math.PI*2/5);const obj=put(wi===4?rainbowGeo(geo):geo,wi===4?rainbow:chrome,[x,.055,0]);}
   for(const side of [-1,1]){const geo=new T.TorusGeometry(.0385,.002,12,96);put(wi===4?rainbowGeo(geo,.1):geo,wi===4?rainbow:chrome,[x,.055,side*.009]);torus(.0113,.002,wi===4?mat('#8c3aa3',.95,.18):chrome,[x,.055,side*.010]);}
  }
  for(const side of [-1,1]){
   if(wi===3){const geo=new T.RingGeometry(.0043,.0135,96);const p=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,.5+p.getX(i)/.105,.496+p.getY(i)/.105);const m=new T.MeshStandardMaterial({map:mushroomTexture,metalness:.4,roughness:.35,side:T.DoubleSide});materials.push(m);put(geo,m,[x,.055,side*.0129]);torus(.0045,.0005,silver,[x,.055,side*.0131]);}
   else{torus(.0084,.0022,chrome,[x,.055,side*.0112]);torus(.0068,.0014,black,[x,.055,side*.0123]);torus(.0045,.0008,silver,[x,.055,side*.0127]);}
   // Polished sidewall mould lines remain separate from the printed artwork.
   for(const r of [.043,.0515])torus(r,.00022,rubber,[x,.055,side*.0105]);
   if(wi===5){const tx=sidewallTexture('ROOT INDUSTRIES • HONEYCORE');const sm=new T.MeshStandardMaterial({map:tx,transparent:true,depthWrite:false,side:T.DoubleSide,roughness:.7});materials.push(sm);put(new T.PlaneGeometry(.11,.11),sm,[x,.055,side*.0122]);}
  }
  continue;
 }
  for(const side of [-1,1]){
   const z=side*.0115;torus(.039,.0018,wi===0?accent:raw,[x,.055,z]);
   if(wi===0){const disk=put(new T.RingGeometry(.010,.039,80),accent,[x,.055,z*.9]);disk.material.side=T.DoubleSide;torus(.027,.0007,chrome,[x,.055,z*1.01]);label('ROOT',[x,.075,z*1.03],.029,.009,side<0?'-z':'z');}
   else{
    const spokes=wi===1?5:6;for(let k=0;k<spokes;k++){const a=k/spokes*Math.PI*2;const r0=.012,r1=.038;const a2=a+(wi===1?.24:0);rod([x+Math.cos(a)*r0,.055+Math.sin(a)*r0,z*.65],[x+Math.cos(a2)*r1,.055+Math.sin(a2)*r1,z*.65],wi===1?.0038:.0048,wi===1?chrome:accent,wi===1?.0025:.0037);}
   }
   torus(.0085,.0022,silver,[x,.055,side*.0127]);torus(.0065,.0013,black,[x,.055,side*.0134]);torus(.0047,.0005,chrome,[x,.055,side*.014]);
   const wt=new T.MeshStandardMaterial({map:sidewallTexture(['ROOT INDUSTRIES AIR','ETHIC INCUBE','TECH TEAM'][wi]),transparent:true,depthWrite:false,roughness:.8,side:T.DoubleSide});materials.push(wt);let lettering=put(new T.PlaneGeometry(.11,.11),wt,[x,.055,side*.0121]);if(side<0)lettering.rotation.y=Math.PI;
   for(const r of [.047,.052])torus(r,.00025,rubber,[x,.055,side*.0098]);
  }
  // Bearings belong to the wheel; the axle stays with deck/fork in inspection mode.
 }
 // Fork legs extruded as machined plates, using different outline and window profiles.
 g=groups[3];const fi=indices[3];rod([.224,.27,0],[.237,.155,0],.014,chrome);
 for(const s of [-1,1]){
  const z=s*.0195;const outlines=[[[.218,.18],[.254,.177],[.263,.135],[.25,.092],[.246,.052],[.219,.047],[.216,.078],[.231,.132]],[[.213,.181],[.257,.178],[.266,.14],[.25,.055],[.238,.043],[.219,.049],[.216,.076],[.233,.14]],[[.22,.175],[.25,.175],[.261,.15],[.251,.06],[.24,.043],[.217,.048],[.221,.118]]];
  // Front axle at x=.23; machined windows differ per model.
  const holes=fi===0?[[[.234,.105],[.244,.142],[.243,.16],[.235,.155]]]:fi===1?[[[.238,.105],[.251,.145],[.246,.161],[.236,.155]]]:[];
  plate(outlines[Math.min(fi,2)].map(forwardForkPoint),fi===2?.013:.01,fi===0?raw:fi===1?accent:fi===3?black:dark,z,holes.map(h=>h.map(forwardForkPoint)));
  torus(.008,.0015,chrome,[front,.055,s*.026]);bolt([front,.055,s*.028],'z',.0058);if(fi!==3)label(fi===0?'ETHIC':fi===1?'ROOT':'TT',[forwardForkPoint([.239,.144])[0],.144,s*.026],.027,.009,s<0?'-z':'z');
 }
 box(.037,.017,.04,fi===0?raw:fi===3?black:accent,[forwardForkPoint([.236,.171])[0],.171,0],.003);rod([front,.055,-.029],[front,.055,.029],.004,chrome);
 g=groups[0];rod([rearAxle,.055,-width/2],[rearAxle,.055,width/2],.004,chrome);
 // Headset: bearing races, dust cover, engraved branding, spacers.
 g=groups[7];let hi=indices[7];for(const y of [.161,.269]){rod([.235-(y-.161)*.13,y-.002,0],[.235-(y-.161)*.13,y+.001,0],.026,chrome);torus(.025,.0009,black,[.235-(y-.161)*.13,y+.0015,0],'y');}
 const hh=[.009,.014,.022][hi];rod([.222,.271,0],[.222-hh*.13,.271+hh,0],.025,[dark,accent,raw][hi],.0195);for(let i=0;i<(hi+1);i++)torus(.022-i*.001,.0007,chrome,[.222,.274+i*.004,0],'y');label(['APEX','ETHIC','TECH TEAM'][hi],[.222,.276+hh/2,.024],.035,.008,'z');
 // Bars: independent T / braced Y / reinforced T silhouettes.
 g=groups[2];const bi=indices[2],barMat=bi===1?chrome:bi===2?raw:bi===3?black:dark;const bottom=[.219,.282,0],topY=[.902,.872,.932,.882][bi],tx=.219-(topY-.282)*.13,half=[.28,.28,.30,.29][bi];
 rod(bottom,[tx,topY-(bi===1?.10:0),0],bi===1?.016:.0159,barMat,bi===2?.0174:.0159);
 if(bi===1){curved([[tx+.013,topY-.1,0],[tx+.005,topY-.058,-.055],[tx,topY-.006,-.103],[tx,topY,-half]],.0115,barMat);curved([[tx+.013,topY-.1,0],[tx+.005,topY-.058,.055],[tx,topY-.006,.103],[tx,topY,half]],.0115,barMat);rod([tx+.005,topY-.053,-.057],[tx+.005,topY-.053,.057],.008,barMat);rod([tx,topY,-half],[tx,topY,half],.0112,barMat);}
 else if(bi===3){
curved([[tx,topY,-half],[tx,topY,-.16],[tx,topY-.02,-.08],[tx,topY-.025,0],[tx,topY-.02,.08],[tx,topY,.16],[tx,topY,half]],.0125,barMat);
const gusset=new T.Shape();gusset.moveTo(-.13,0);gusset.bezierCurveTo(-.06,-.007,-.035,-.065,-.018,-.10);gusset.lineTo(.018,-.10);gusset.bezierCurveTo(.035,-.065,.06,-.007,.13,0);gusset.quadraticCurveTo(0,-.025,-.13,0);const geo=new T.ExtrudeGeometry(gusset,{depth:.022,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:4,curveSegments:16,steps:1});const brace=put(geo,barMat,[tx+.011,topY,0]);brace.rotation.y=-Math.PI/2;
}
else{rod([tx,topY,-half],[tx,topY,half],.0112,barMat);if(bi===2)for(const s of [-1,1])rod([tx+.011,topY-.085,0],[tx,topY,s*.09],.006,barMat);}
 // Weld beads at the centre and tube transitions.
 for(let k=0;k<24;k++){const a=k/24*Math.PI*2;put(new T.SphereGeometry(.0018,6,4),bi===1?weld:barMat,[tx+.015*Math.cos(a),topY-.014,.015*Math.sin(a)])}
 if(bi!==3){const logo=label(['ETHIC','APEX','TECH TEAM'][bi],[tx+.021,topY-.20,.013],.032,.11,'z');logo.rotation.z=Math.PI/2;
 label(bi===1?'Ⓐ':'4130',[tx+.013,topY-.113,.016],.026,.025,'z');}
 // Clamp rings, slots and separate socket-head screws; changing model changes geometry.
 g=groups[4];const ci=indices[4],clampHeight=[.043,.032,.052,.038][ci],cx=.217,cy=.292;const cmat=ci===0?accent:ci===1?raw:ci===3?black:dark;
 const cshape=new T.Shape();cshape.absarc(0,0,[.024,.022,.026,.022][ci],0,Math.PI*2,false);const cHole=new T.Path();cHole.absarc(0,0,.016,0,Math.PI*2,true);cshape.holes.push(cHole);const cgeo=new T.ExtrudeGeometry(cshape,{depth:clampHeight,bevelEnabled:true,bevelSize:.0012,bevelThickness:.0012,bevelSegments:3,steps:1,curveSegments:48});let cl=put(cgeo,cmat,[cx,cy,0]);cl.rotation.x=-Math.PI/2;
 box(.013,clampHeight,.024,cmat,[cx+.024,cy+clampHeight/2,0],.002);box(.001,clampHeight+.001,.03,black,[cx+.025,cy+clampHeight/2,0],.0002);
 for(const t of [.22,.78]){rod([cx+.018,cy+clampHeight*t,-.018],[cx+.018,cy+clampHeight*t,.021],.003,chrome);bolt([cx+.018,cy+clampHeight*t,.021],'z',.0055)}if(ci!==3)label(['ROOT','ETHIC','TT'][ci],[cx-.003,cy+clampHeight*.51,.025],.035,.013,'z');
 // Grips: distinct mushroom, diagonal and diamond patterns. InstancedMesh keeps mobile draw calls low.
 g=groups[5];const gi=indices[5],gripLength=[.135,.16,.145,.13][gi],r=[.0155,.0165,.017,.015][gi],gripMat=mat(gi===1?'#4c4756':gi===2?'#44463d':gi===3?'#18191c':color,0,.88);let ridgeCount=gi===0?48:gi===1?37:28;let dummy=new T.Object3D();
 for(const s of [-1,1]){g=new T.Group();groups[5].add(g);let ridgeGeo=new T.TorusGeometry(r,.0007,5,32);const inst=new T.InstancedMesh(ridgeGeo,gripMat,ridgeCount);inst.castShadow=true;g.add(inst);let n=0;const z0=s*(half-gripLength);rod([tx,topY,z0],[tx,topY,s*half],r-.001,gripMat);for(let i=0;i<ridgeCount;i++){dummy.position.set(tx,topY,z0+s*i*gripLength/(ridgeCount-1));dummy.rotation.set(gi===1?.24:0,gi===2?.22:0,0);dummy.updateMatrix();inst.setMatrixAt(n++,dummy.matrix)}if(gi===2){for(let j=0;j<8;j++){let a=j/8*Math.PI*2;rod([tx+Math.cos(a)*r,topY+Math.sin(a)*r,z0],[tx+Math.cos(a+.45)*r,topY+Math.sin(a+.45)*r,s*half],.0005,rubber)}}for(const z of [z0,s*half])torus(r+.001,.0016,gripMat,[tx,topY,z]);rod([tx,topY,s*half],[tx,topY,s*(half+.005)],r+.0015,black);if(gi!==3)label(['ODI','ETHIC','TT'][gi],[tx+.001,topY+.016,z0+s*gripLength*.53],.017,.035,'y').rotation.z=Math.PI/2;if(gi!==3){const cap=label(['ODI','E','TT'][gi],[tx,topY,s*(half+.0053)],.022,.014,s<0?'-z':'z');}}
 // Front and rear wheel axle positions are shared by the fork and dropouts.
 root.userData={groups,materials,indices:[...indices],width,length,topY,rearAxle};return root;
}
export function disposeScooter(root){root.traverse(o=>{if(o.geometry)o.geometry.dispose()});root.userData.materials?.forEach(m=>m.dispose());}





