/* Isometric town hero for drjackchang.org: a Clayton-style south-east Melbourne suburb.
   The ambulance tours HQ → Tech Lab → Research → Campus; the HEMS helicopter shuttles between the
   medical-centre roof and the airport island; a plane, a train and cars keep the town moving.
   main.js owns the content: it builds the pins in #mapPins and the card in #panelBody, and listens
   to window.TOWN_EVENT(placeId, status) to follow the tour. */
(function(){
"use strict";
if(!document.getElementById('townSvg'))return;
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(id){return document.getElementById(id)};
var NS='http://www.w3.org/2000/svg';
function sv(tag,a,parent){var e=document.createElementNS(NS,tag);for(var k in a)e.setAttribute(k,a[k]);if(parent)parent.appendChild(e);return e}
function ease(f){return f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2}
/* ---------- isometric engine ---------- */
var TW=36, TH=18, OX=500, OY=145, N=16;
function iso(gx,gy,z){return [(gx-gy)*TW+OX,(gx+gy)*TH+OY-(z||0)]}
function pts(arr){return arr.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ')}
function quad(g,a,b,c,d,fill,extra){var e=sv('polygon',{points:pts([a,b,c,d]),fill:fill},g);if(extra)for(var k in extra)e.setAttribute(k,extra[k]);return e}
function M(m,f){return 'var(--'+m+'-'+f+')'}
// box: footprint (gx,gy) size (lx,ly), base z0, height h
function box(g,gx,gy,lx,ly,h,mat,z0){
  z0=z0||0;
  var A=iso(gx,gy,z0+h),B=iso(gx+lx,gy,z0+h),C=iso(gx+lx,gy+ly,z0+h),D=iso(gx,gy+ly,z0+h);
  var Bb=iso(gx+lx,gy,z0),Cb=iso(gx+lx,gy+ly,z0),Db=iso(gx,gy+ly,z0);
  quad(g,D,C,Cb,Db,M(mat,'l'));
  quad(g,B,C,Cb,Bb,M(mat,'r'));
  quad(g,A,B,C,D,M(mat,'t'));
}
// windows on the two visible faces
function windows(g,gx,gy,lx,ly,h,opt){
  opt=opt||{};var fh=opt.fh||16, cols=opt.cols||3, z0=opt.z0||0, w=opt.w||.55, wh=opt.wh||.5, col=opt.col||'var(--win)';
  var floors=Math.floor((h-6)/fh);
  for(var f=0;f<floors;f++){
    var zb=z0+6+f*fh, zt=zb+fh*wh;
    var nl=Math.max(1,Math.round(lx*cols)), nr=Math.max(1,Math.round(ly*cols));
    for(var i=0;i<nl;i++){var u0=gx+(i+(1-w)/2)/nl*lx,u1=gx+(i+(1+w)/2)/nl*lx;
      quad(g,iso(u0,gy+ly,zb),iso(u1,gy+ly,zb),iso(u1,gy+ly,zt),iso(u0,gy+ly,zt),col);}
    for(var j=0;j<nr;j++){var v0=gy+(j+(1-w)/2)/nr*ly,v1=gy+(j+(1+w)/2)/nr*ly;
      quad(g,iso(gx+lx,v0,zb),iso(gx+lx,v1,zb),iso(gx+lx,v1,zt),iso(gx+lx,v0,zt),'var(--win2)');}
  }
}
function shadow(g,gx,gy,lx,ly,h){ // soft cast shadow toward lower-left
  var s=Math.min(1.2,h/70);
  quad(g,iso(gx,gy+ly,0),iso(gx+lx,gy+ly,0),iso(gx+lx-.2,gy+ly+s,0),iso(gx-.2,gy+ly+s,0),'var(--shadow)');
}
function tree(g,gx,gy,s){
  s=s||1;var p=iso(gx,gy,0);
  sv('ellipse',{cx:p[0]-4,cy:p[1]+3,rx:13*s,ry:6*s,fill:'var(--shadow)'},g);
  sv('rect',{x:p[0]-2,y:p[1]-12*s,width:4,height:12*s,fill:'var(--trunk)'},g);
  sv('circle',{cx:p[0],cy:p[1]-20*s,r:12*s,fill:'var(--leaf2)'},g);
  sv('circle',{cx:p[0]-3,cy:p[1]-23*s,r:8*s,fill:'var(--leaf1)'},g);
}

/* ---------- town layout: a Clayton-style south-east Melbourne suburb ---------- */
// land y<=14, beach y=15, bay y>=16; airport island x 6-12, y 17-20
function isIsland(x,y){return x>=6&&x<=12&&y>=17&&y<=20}
function isSea(x,y){return y>=16&&!isIsland(x,y)}
function isBeach(x,y){return y===15}
var LOOP={x0:-1,x1:12,y0:0,y1:11};
function onLoop(x,y){return (x>=LOOP.x0&&x<=LOOP.x1&&(y===LOOP.y0||y===LOOP.y1))||(y>=LOOP.y0&&y<=LOOP.y1&&(x===LOOP.x0||x===LOOP.x1))}
var XST=[-6,17], YST=[-5], RAILY=6;
function isRoad(x,y){
  if(y>14)return false;
  if(onLoop(x,y))return true;
  if((y===LOOP.y0||y===LOOP.y1)&&(x<LOOP.x0||x>LOOP.x1))return true;
  if((x===LOOP.x0||x===LOOP.x1)&&y<LOOP.y0)return true;
  if(XST.indexOf(x)>=0)return true;
  if(YST.indexOf(y)>=0&&(x<LOOP.x0||x>LOOP.x1||y<LOOP.y0))return true;
  if(x===LOOP.x1&&y>LOOP.y1)return true;
  return false;
}
function isRail(x,y){return y===RAILY}
var reserved={};
function reserve(x,y,lx,ly){for(var i=x;i<x+lx;i++)for(var j=y;j<y+ly;j++)reserved[i+','+j]=1}
// landmarks plus a lawn margin so they stand apart from the houses
reserve(0,1,6,5);    // campus
reserve(7,1,5,5);    // medical centre
reserve(6,7,5,4);    // tech lab
reserve(0,7,4,1);    // station platform
reserve(0,12,6,3);   // HQ

var ground=$('ground'), objs=[];
function tile(x,y,f,stroke){quad(ground,iso(x,y,0),iso(x+1,y,0),iso(x+1,y+1,0),iso(x,y+1,0),f,stroke?{stroke:stroke,'stroke-width':.6}:null)}
(function drawGround(){
  for(var x=-18;x<32;x++)for(var y=-18;y<30;y++){
    var f;
    if(isSea(x,y))f='var(--water)';
    else if(isBeach(x,y)||(isIsland(x,y)&&(x===6||x===12||y===17||y===20)))f='var(--sand)';
    else if(isIsland(x,y))f='var(--apron)';
    else if(isRoad(x,y))f='var(--road)';
    else if(isRail(x,y))f='var(--ballast)';
    else f=(x+y)%2?'var(--grass1)':'var(--grass2)';
    tile(x,y,f,isSea(x,y)?null:'rgba(0,0,0,.05)');
  }
  var r0=iso(-18,RAILY+.3,0),r1=iso(32,RAILY+.3,0),r2=iso(-18,RAILY+.7,0),r3=iso(32,RAILY+.7,0);
  for(var s=-18;s<32;s+=.34){var a=iso(s,RAILY+.2,0),b=iso(s,RAILY+.8,0);sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'var(--sleeper)','stroke-width':3},ground)}
  sv('line',{x1:r0[0],y1:r0[1],x2:r1[0],y2:r1[1],stroke:'var(--rail)','stroke-width':2},ground);
  sv('line',{x1:r2[0],y1:r2[1],x2:r3[0],y2:r3[1],stroke:'var(--rail)','stroke-width':2},ground);
  [[0,17.5],[-3,19.2],[3,21.3],[14,17.4],[16.5,19],[-6,17],[1,23],[14.5,22]].forEach(function(w,i){
    var p=iso(w[0],w[1],0);sv('path',{d:'M'+(p[0]-10)+','+p[1]+' q5,-4 10,0 t10,0',fill:'none',stroke:'var(--water2)','stroke-width':2.4,'stroke-linecap':'round',class:'shimmer',style:'animation-delay:-'+(i*.6)+'s'},ground)});
  quad(ground,iso(6.3,18.1,0),iso(12.7,18.1,0),iso(12.7,18.9,0),iso(6.3,18.9,0),'var(--road)');
  for(var u=6.8;u<12.3;u+=.7){var a2=iso(u,18.5,0),b2=iso(u+.35,18.5,0);sv('line',{x1:a2[0],y1:a2[1],x2:b2[0],y2:b2[1],stroke:'#FFFFFF','stroke-width':2},ground)}
  var oc=iso(3,4,0);sv('ellipse',{cx:oc[0],cy:oc[1],rx:58,ry:27,fill:'var(--oval)',stroke:'#FFFFFF','stroke-width':2},ground);
  sv('ellipse',{cx:oc[0],cy:oc[1],rx:14,ry:7,fill:'none',stroke:'#FFFFFF','stroke-width':1.5},ground);
  sv('line',{x1:oc[0]-20,y1:oc[1]-10,x2:oc[0]+20,y2:oc[1]+10,stroke:'#FFFFFF','stroke-width':1,opacity:.6},ground);
  var hp=iso(11.4,19.5,0);sv('ellipse',{cx:hp[0],cy:hp[1],rx:22,ry:11,fill:'var(--char-t)'},ground);sv('ellipse',{cx:hp[0],cy:hp[1],rx:15,ry:7.5,fill:'none',stroke:'var(--signal)','stroke-width':2},ground);
})();

(function(){
  var lines=[];
  [LOOP.y0,LOOP.y1].concat(YST).forEach(function(y){lines.push([[-18,y+.5],[32,y+.5]])});
  [LOOP.x0,LOOP.x1].concat(XST).forEach(function(x){lines.push([[x+.5,-18],[x+.5,x===LOOP.x0?LOOP.y1+1:15]])});
  lines.forEach(function(l){var a=iso(l[0][0],l[0][1],0),b=iso(l[1][0],l[1][1],0);sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'lane'},ground)});
})();

var loopTiles=[];
(function(){var L0=LOOP;for(var x=L0.x0;x<=L0.x1;x++)loopTiles.push([x,L0.y1]);for(var y=L0.y1-1;y>=L0.y0;y--)loopTiles.push([L0.x1,y]);
  for(var x2=L0.x1-1;x2>=L0.x0;x2--)loopTiles.push([x2,L0.y0]);for(var y2=L0.y0+1;y2<L0.y1;y2++)loopTiles.push([L0.x0,y2]);})();
while(!(loopTiles[0][0]===5&&loopTiles[0][1]===LOOP.y1))loopTiles.push(loopTiles.shift());

/* painter's order: every object and moving vehicle sits in a depth band keyed by its footprint centre (gx+gy) */
var bandRoot=$('objBack'), bands={}, KMIN=-160, KMAX=280;
for(var bi0=KMIN;bi0<=KMAX;bi0++)bands[bi0]=sv('g',{},bandRoot);
function band(key){return bands[Math.max(KMIN,Math.min(KMAX,Math.round(key*4)))]}
function place(g,key){var b=band(key);if(g.parentNode!==b)b.appendChild(g)}
function addObj(key,fn){objs.push({d:key,fn:fn})}
var tops={};
function hipRoof(g,x,y,lx,ly,h,rh,mat){
  var A=iso(x,y,h),B=iso(x+lx,y,h),C=iso(x+lx,y+ly,h),D=iso(x,y+ly,h);
  var r1,r2; if(lx>=ly){r1=iso(x+ly/2,y+ly/2,h+rh);r2=iso(x+lx-ly/2,y+ly/2,h+rh)}else{r1=iso(x+lx/2,y+lx/2,h+rh);r2=iso(x+lx/2,y+ly-lx/2,h+rh)}
  if(lx>=ly){quad(g,A,B,r2,r1,M(mat,'t'));quad(g,A,D,r1,r1,M(mat,'t'));quad(g,D,C,r2,r1,M(mat,'l'));quad(g,B,C,r2,r2,M(mat,'r'))}
  else{quad(g,A,D,r2,r1,M(mat,'t'));quad(g,A,B,r1,r1,M(mat,'t'));quad(g,B,C,r2,r1,M(mat,'r'));quad(g,D,C,r2,r2,M(mat,'l'))}
}
function gum(g,gx,gy,s){
  s=s||1;var p=iso(gx,gy,0);
  sv('ellipse',{cx:p[0]-5,cy:p[1]+3,rx:15*s,ry:6*s,fill:'var(--shadow)'},g);
  sv('path',{d:'M'+(p[0]-2)+','+p[1]+' l1,-'+(26*s)+' l3,0 l1,'+(26*s)+'z M'+p[0]+','+(p[1]-18*s)+' l-7,-8 M'+(p[0]+1)+','+(p[1]-20*s)+' l7,-9',stroke:'var(--bark)','stroke-width':2.4,fill:'var(--bark)'},g);
  sv('circle',{cx:p[0]-7*s,cy:p[1]-30*s,r:9*s,fill:'var(--gum2)'},g);
  sv('circle',{cx:p[0]+7*s,cy:p[1]-33*s,r:10*s,fill:'var(--gum2)'},g);
  sv('circle',{cx:p[0],cy:p[1]-38*s,r:10*s,fill:'var(--gum1)'},g);
}
function house(g,x,y,wall,roof,pool){
  var lx=.74,ly=.6,h=15, ox=x+.13, oy=y+.12;
  if(pool){quad(g,iso(x+.15,y+.78,0),iso(x+.55,y+.78,0),iso(x+.55,y+.97,0),iso(x+.15,y+.97,0),'var(--pool)')}
  shadow(g,ox,oy,lx,ly,h);box(g,ox,oy,lx,ly,h,wall);
  quad(g,iso(ox+.1,oy+ly,3),iso(ox+.25,oy+ly,3),iso(ox+.25,oy+ly,12),iso(ox+.1,oy+ly,12),'var(--win2)');
  quad(g,iso(ox+.4,oy+ly,5),iso(ox+.62,oy+ly,5),iso(ox+.62,oy+ly,11),iso(ox+.4,oy+ly,11),'var(--win)');
  hipRoof(g,ox-.04,oy-.04,lx+.08,ly+.08,h,12,roof);
}

// HQ: ambulance station, brick with roller doors and a comms mast
addObj(2.5+12.8,function(g){var x=1,y=12;shadow(g,x,y,3,1.6,30);box(g,x,y,3,1.6,30,'brick');
  box(g,x-.04,y-.04,3.08,1.68,6,'white',30);
  for(var i=0;i<3;i++){quad(g,iso(x+i+.12,y+1.6,0),iso(x+i+.88,y+1.6,0),iso(x+i+.88,y+1.6,24),iso(x+i+.12,y+1.6,24),i===1?'var(--road)':'var(--white-l)')}
  for(var j=0;j<3;j++){var zz=4+j*6.5;quad(g,iso(x+3,y+.15,zz),iso(x+3,y+1.45,zz),iso(x+3,y+1.45,zz+2),iso(x+3,y+.15,zz+2),'var(--white-r)')}
  var c=iso(x+1.5,y+1.6,32);sv('path',{d:'M'+(c[0]-8)+','+(c[1]-4)+'h16M'+c[0]+','+(c[1]-12)+'v16',stroke:'var(--signal)','stroke-width':4},g);
  var m0=iso(x+.4,y+.3,36),m1=iso(x+.4,y+.3,96);sv('line',{x1:m0[0],y1:m0[1],x2:m1[0],y2:m1[1],stroke:'var(--roof-r)','stroke-width':3},g);
  sv('circle',{cx:m1[0],cy:m1[1],r:4,fill:'var(--signal)',class:'beacon'},g);
  tops.hq=iso(x+1.5,y+.8,104);});
// Campus: tall brick tower, lecture halls and the oval
addObj(3+3,function(g){var x=1,y=1;
  shadow(g,x,y,1,1.4,120);box(g,x,y,1,1.4,120,'brick');windows(g,x,y,1,1.4,120,{fh:11,cols:3,w:.7,wh:.5,col:'var(--win2)'});
  box(g,x-.05,y-.05,1.1,1.5,4,'char',120);
  shadow(g,x+1.3,y,2.5,1,34);box(g,x+1.3,y,2.5,1,34,'brick');windows(g,x+1.3,y,2.5,1,34,{fh:14,cols:2});box(g,x+1.25,y-.05,2.6,1.1,4,'cream',34);
  shadow(g,x+1.3,y+1.3,1.4,.9,22);box(g,x+1.3,y+1.3,1.4,.9,22,'cream');windows(g,x+1.3,y+1.3,1.4,.9,22,{fh:12,cols:2.5});
  tops.school=iso(x+.5,y+.7,132);});
// Research: medical centre with rooftop helipad (the helicopter's home)
var HOSPH=96;
addObj(9.9+2.9,function(g){var x=8,y=1;
  shadow(g,x,y,3.8,3.8,40);box(g,x,y,3.8,3.8,36,'hosp');windows(g,x,y,3.8,3.8,36,{fh:12,cols:2});
  box(g,x+.9,y+.6,2.5,2.5,HOSPH-36,'hosp',36);windows(g,x+.9,y+.6,2.5,2.5,HOSPH-36,{fh:12,cols:2.4,z0:36,w:.75});
  box(g,x+.88,y+.58,2.54,2.54,5,'navy',HOSPH);
  var hp=iso(x+2.15,y+1.85,HOSPH+5);sv('ellipse',{cx:hp[0],cy:hp[1],rx:30,ry:15,fill:'var(--char-t)'},g);sv('ellipse',{cx:hp[0],cy:hp[1],rx:21,ry:10.5,fill:'none',stroke:'var(--yellow-t)','stroke-width':2.5},g);
  var t=sv('text',{x:hp[0],y:hp[1]+4,'text-anchor':'middle','font-family':'Inter,sans-serif','font-weight':800,'font-size':14,fill:'#FFFFFF'},g);t.textContent='H';
  var cr=iso(x+3.5,y+3.3,24);sv('path',{d:'M'+(cr[0]-7)+','+cr[1]+'h14M'+cr[0]+','+(cr[1]-7)+'v14',stroke:'var(--signal)','stroke-width':4},g);
  tops.lab=iso(x+2.15,y+1.85,HOSPH+30);});
// Tech Lab: glass office with antenna and dish
addObj(8.3+8.8,function(g){var x=7,y=8;shadow(g,x,y,2.6,1.6,58);box(g,x,y,2.6,1.6,58,'teal');windows(g,x,y,2.6,1.6,58,{fh:11,cols:3,w:.85,wh:.55});
  box(g,x+.2,y+.2,.7,.6,8,'roof',58);
  var a=iso(x+2.2,y+1.2,58),b=iso(x+2.2,y+1.2,96);sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'var(--roof-r)','stroke-width':3},g);
  sv('circle',{cx:b[0],cy:b[1],r:4.5,fill:'var(--signal)',class:'beacon'},g);
  var d=iso(x+1.2,y+.6,70);sv('ellipse',{cx:d[0],cy:d[1],rx:13,ry:8,fill:'var(--white-t)',stroke:'var(--roof-r)','stroke-width':1.5},g);
  tops.it=iso(x+1.3,y+.8,104);});
// Railway station platform + canopy, on the south side of the line
addObj(2+7.35,function(g){box(g,.5,7.05,3,.6,4,'cream');box(g,.7,7.15,2.6,.4,2,'char',22);
  for(var i=0;i<4;i++){var a=iso(.8+i*.8,7.35,4),b=iso(.8+i*.8,7.35,22);sv('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'var(--char-r)','stroke-width':2},g)}});
// Airport on the island: terminal and control tower
addObj(9+19.5,function(g){var x=7,y=19.1;shadow(g,x,y,3.4,.8,22);box(g,x,y,3.4,.8,22,'white');windows(g,x,y,3.4,.8,22,{fh:10,cols:2.5,w:.85});box(g,x-.04,y-.04,3.48,.88,3,'navy',22);
  var tx=10.8,ty=17.4;box(g,tx,ty,.4,.4,64,'white');box(g,tx-.12,ty-.12,.64,.64,12,'glass',64);box(g,tx-.14,ty-.14,.68,.68,3,'navy',76);
  tops.abroad=iso(9,19.4,40);});
// bathing boxes along the beach (Brighton-style)
var BB=['red','yellow','navy','green','white','red','yellow','green'];
for(var bx=-17,bi=0;bx<32;bx+=2,bi++){(function(x,m){addObj(x+.5+15.5,function(g){box(g,x+.3,15.25,.42,.42,12,m);
  var a=iso(x+.3,15.67,12),b=iso(x+.72,15.67,12),c=iso(x+.72,15.25,12),pk1=iso(x+.51,15.67,19),pk2=iso(x+.51,15.25,19);
  quad(g,a,b,pk1,pk1,M(m,'l'));quad(g,pk2,pk1,b,c,M('roof','r'))})})(bx,BB[bi%BB.length])}

// suburb filler
var seed=11;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
var walls=['cream','brick','cream','white','brick'], roofs=['terra','char','terra','char','roof'];
for(var x=-18;x<32;x++)for(var y=-18;y<15;y++){
  if(reserved[x+','+y]||isRoad(x,y)||isRail(x,y)||isSea(x,y)||isBeach(x,y))continue;
  (function(x,y){
    var r=rnd(), inside=x>LOOP.x0&&x<LOOP.x1&&y>LOOP.y0&&y<LOOP.y1;
    if(!inside&&r<.5){var w=walls[Math.floor(rnd()*walls.length)],rf=roofs[Math.floor(rnd()*roofs.length)],pool=rnd()<.22;
      addObj(x+y+1,function(g){house(g,x,y,w,rf,pool)})}
    else if(r<(inside?.55:.85)){var s=.8+rnd()*.35;addObj(x+y+1,function(g){gum(g,x+.5,y+.5,s)})}
  })(x,y);
}
// a few trees on the landmark lawns
[[.4,5.4],[5.4,5.2],[6.6,1.6],[6.5,4.6],[6.4,7.4],[10.4,10.3],[5.3,12.6],[.4,14.3],[5.2,14.2],[6.4,20.6],[12.3,17.3],[6.3,17.2]].forEach(function(t){addObj(t[0]+t[1],function(g){gum(g,t[0],t[1],.8)})});

objs.sort(function(a,b){return a.d-b.d});
objs.forEach(function(o){o.fn(band(o.d))});

/* ---------- vehicles ---------- */
var movers=$('movers');
function vehicle(mat,len,wid,h,emergency){var g=sv('g',{},bandRoot);g._mat=mat;g._len=len;g._wid=wid;g._h=h;g._em=emergency;return g}
function drawVehicle(g,gx,gy,dir){
  while(g.firstChild)g.removeChild(g.firstChild);
  var lx=dir==='x'?g._len:g._wid, ly=dir==='x'?g._wid:g._len, x=gx-lx/2, y=gy-ly/2;
  var s=iso(gx,gy,0);sv('ellipse',{cx:s[0]-3,cy:s[1]+2,rx:g._em?22:15,ry:g._em?9:6,fill:'var(--shadow)'},g);
  if(g._em){
    box(g,x,y,lx,ly,g._h,'white');
    // high-vis checker band on both visible sides
    var n=6;for(var i=0;i<n;i++){var c=i%2?'var(--signal)':'#F4D23C';
      if(dir==='x'){var u0=x+i/n*lx,u1=x+(i+1)/n*lx;quad(g,iso(u0,y+ly,5),iso(u1,y+ly,5),iso(u1,y+ly,9),iso(u0,y+ly,9),c)}
      else{var v0=y+i/n*ly,v1=y+(i+1)/n*ly;quad(g,iso(x+lx,v0,5),iso(x+lx,v1,5),iso(x+lx,v1,9),iso(x+lx,v0,9),c)}}
    var c0=iso(gx,gy,g._h);
    sv('circle',{cx:c0[0]-7,cy:c0[1]-2,r:13,fill:'#FF4A2E',opacity:.35,class:'lb1'},g);
    sv('circle',{cx:c0[0]+7,cy:c0[1]-2,r:13,fill:'#3A8BFF',opacity:.35,class:'lb2'},g);
    sv('rect',{x:c0[0]-10,y:c0[1]-5,width:9,height:5,rx:1.5,fill:'#FF3B22',class:'lb1'},g);
    sv('rect',{x:c0[0]+1,y:c0[1]-5,width:9,height:5,rx:1.5,fill:'#2F7BFF',class:'lb2'},g);
  } else box(g,x,y,lx,ly,g._h,g._mat);
  place(g,gx+gy);
}
var amb=vehicle('white',.82,.42,18,true);
var cars=[vehicle('navy',.5,.3,9,false),vehicle('yellow',.5,.3,9,false),vehicle('green',.5,.3,9,false)];
var LP=loopTiles.length;
function posOn(u,off){off=off||0;
  u=((u%LP)+LP)%LP;var i=Math.floor(u),f=u-i,a=loopTiles[i],b=loopTiles[(i+1)%LP];
  var gx=a[0]+.5+(b[0]-a[0])*f, gy=a[1]+.5+(b[1]-a[1])*f, dir=a[0]!==b[0]?'x':'y';
  if(dir==='x')gy+=off*(b[0]>a[0]?1:-1);else gx-=off*(b[1]>a[1]?1:-1);
  return {gx:gx,gy:gy,dir:dir};
}
function idxOf(x,y){for(var i=0;i<LP;i++)if(loopTiles[i][0]===x&&loopTiles[i][1]===y)return i;return 0}
var stops=[{id:'hq',u:0},{id:'it',u:idxOf(8,LOOP.y1)},{id:'lab',u:idxOf(LOOP.x1,3)},{id:'school',u:idxOf(LOOP.x0,4)}];

/* train: three silver cars on the line */
var trainCars=[sv('g',{},bandRoot),sv('g',{},bandRoot),sv('g',{},bandRoot)];
function drawTrain(gx){for(var i=0;i<3;i++){var g=trainCars[i];while(g.firstChild)g.removeChild(g.firstChild);
    var x=gx-i*1.15,y=RAILY+.25;box(g,x,y,1.05,.5,14,'train');
    quad(g,iso(x+.05,y+.5,6),iso(x+1,y+.5,6),iso(x+1,y+.5,10),iso(x+.05,y+.5,10),'var(--navy-l)');
    quad(g,iso(x+.05,y+.5,10),iso(x+1,y+.5,10),iso(x+1,y+.5,11.5),iso(x+.05,y+.5,11.5),'var(--yellow-l)');
    place(g,x+.52+RAILY+.5)}}

/* helicopter: white HEMS aircraft drawn flat in grid space; lifts straight up, turns, cruises, settles straight down */
var air=$('air'),hShadowG=sv('g',{},air),heliG=sv('g',{},air);
var HP_A={gx:10.15,gy:2.85,z:HOSPH+5}, HP_B={gx:11.4,gy:19.5,z:0}, CRU=105;
var HDG=Math.atan2(HP_B.gy-HP_A.gy,HP_B.gx-HP_A.gx);
function hpoly(g,base,th,sc,uv,fill,dy,extra){
  var c=Math.cos(th),s2=Math.sin(th);
  var pts2=uv.map(function(p){var u=p[0]*sc,v=p[1]*sc,ru=u*c-v*s2,rv=u*s2+v*c;return ((ru-rv)*TW+base[0]).toFixed(1)+','+((ru+rv)*TH+base[1]+(dy||0)).toFixed(1)});
  var e=sv('polygon',{points:pts2.join(' '),fill:fill},g);if(extra)for(var k in extra)e.setAttribute(k,extra[k]);return e;
}
var FUS=[[.58,0],[.52,.12],[.36,.2],[-.12,.21],[-.3,.13],[-.36,0],[-.3,-.13],[-.12,-.21],[.36,-.2],[.52,-.12]];
function drawHeli(gx,gy,z,th,rot,now){
  while(heliG.firstChild)heliG.removeChild(heliG.firstChild);
  while(hShadowG.firstChild)hShadowG.removeChild(hShadowG.firstChild);
  var onRoof=gx>8.9&&gx<11.4&&gy>1.6&&gy<4.1, gz=onRoof?HOSPH+5:0;
  var sc=.95*(1+z/700), base=iso(gx,gy,z), sb=iso(gx,gy,gz);
  var sh=Math.max(0,1-(z-gz)/220);
  if(sh>0){var sg=sv('g',{opacity:(.9*sh).toFixed(2)},hShadowG);
    hpoly(sg,sb,th,.95,FUS,'var(--shadow)');hpoly(sg,sb,th,.95,[[-.3,.05],[-1.02,.03],[-1.02,-.03],[-.3,-.05]],'var(--shadow)');}
  var g=heliG;
  // skids + struts (below the cabin)
  hpoly(g,base,th,sc,[[.38,.25],[-.28,.25],[-.28,.28],[.38,.28]],'#55626B',9);
  hpoly(g,base,th,sc,[[.38,-.28],[-.28,-.28],[-.28,-.25],[.38,-.25]],'#55626B',9);
  // cabin underside for thickness
  hpoly(g,base,th,sc,FUS,'#B9C3CA',7);
  hpoly(g,base,th,sc,[[-.3,.05],[-1.02,.03],[-1.02,-.03],[-.3,-.05]],'#B9C3CA',4);
  // tail boom, stabiliser, fin
  hpoly(g,base,th,sc,[[-.3,.055],[-1.02,.035],[-1.02,-.035],[-.3,-.055]],'#FFFFFF',0,{stroke:'#C9D1D7','stroke-width':.8});
  hpoly(g,base,th,sc,[[-.82,.17],[-.76,.17],[-.76,-.17],[-.82,-.17]],'#FFFFFF',0,{stroke:'#C9D1D7','stroke-width':.8});
  hpoly(g,base,th,sc,[[-.9,.035],[-1.06,.035],[-1.06,-.035],[-.9,-.035]],'#C8452F');
  // cabin
  hpoly(g,base,th,sc,FUS,'#FFFFFF',0,{stroke:'#C9D1D7','stroke-width':.8});
  // red cheatline + high-vis yellow band
  hpoly(g,base,th,sc,[[.36,.2],[-.12,.21],[-.12,.15],[.36,.14]],'#C8452F');
  hpoly(g,base,th,sc,[[.36,-.14],[-.12,-.15],[-.12,-.21],[.36,-.2]],'#C8452F');
  hpoly(g,base,th,sc,[[-.12,.21],[-.3,.13],[-.24,.1],[-.12,.15]],'#E8D83A');
  hpoly(g,base,th,sc,[[-.12,-.15],[-.24,-.1],[-.3,-.13],[-.12,-.21]],'#E8D83A');
  // windscreen
  hpoly(g,base,th,sc,[[.57,0],[.5,.11],[.38,.15],[.38,-.15],[.5,-.11]],'#2E3D47');
  // engine cowling
  hpoly(g,base,th,sc,[[.12,.09],[-.26,.08],[-.26,-.08],[.12,-.09]],'#E6EBEE',-5,{stroke:'#C9D1D7','stroke-width':.8});
  // main rotor: blurred disc + two blades turning
  var R=.82*sc, ring=[];for(var i=0;i<28;i++){var a=i/28*Math.PI*2;ring.push([Math.cos(a)*.82,Math.sin(a)*.82])}
  hpoly(g,[base[0],base[1]-9],0,sc,ring,'rgba(40,52,60,.10)');
  for(var k=0;k<2;k++){var ang=rot+k*Math.PI/2;
    hpoly(g,[base[0],base[1]-9],ang,sc,[[.82,.03],[-.82,.03],[-.82,-.03],[.82,-.03]],'#2B363D');}
  var hub=sv('circle',{cx:base[0],cy:base[1]-9,r:3*sc,fill:'#2B363D'},g);
  // tail rotor
  hpoly(g,base,th,sc,[[-1.02,.12],[-1,.12],[-1,-.12],[-1.02,-.12]],'#2B363D',-3);
  // beacons
  var bk=Math.floor(now/450)%2===0;
  var top=[base[0],base[1]-14];
  if(bk)sv('circle',{cx:top[0],cy:top[1],r:3.4,fill:'#FF3B22'},g);
  if(Math.floor(now/120)%10===0)sv('circle',{cx:top[0],cy:top[1]+20,r:2.6,fill:'#FFFFFF'},g);
}
/* plane: drawn flat in grid space so it sits in the isometric view; rolls down the runway, lifts off and climbs out */
var air2=$('air'),pShadow=sv('g',{},air2),plane=sv('g',{},air2);
function L(u,v){return [(u-v)*TW,(u+v)*TH]}
function poly(g,uv,fill,extra){var e=sv('polygon',{points:uv.map(function(p){var q=L(p[0],p[1]);return q[0].toFixed(1)+','+q[1].toFixed(1)}).join(' '),fill:fill},g);if(extra)for(var k in extra)e.setAttribute(k,extra[k]);return e}
function planeShape(g,body,wing,shadowOnly){
  poly(g,[[.12,-.07],[-.22,-.72],[-.36,-.72],[-.18,-.07]],wing);
  poly(g,[[.12,.07],[-.22,.72],[-.36,.72],[-.18,.07]],wing);
  poly(g,[[-.6,-.06],[-.8,-.28],[-.88,-.28],[-.76,-.06]],wing);
  poly(g,[[-.6,.06],[-.8,.28],[-.88,.28],[-.76,.06]],wing);
  poly(g,[[-.82,-.07],[.62,-.07],[.8,0],[.62,.07],[-.82,.07]],body);
  if(!shadowOnly){
    poly(g,[[.55,-.05],[.68,-.03],[.68,.03],[.55,.05]],'#33434C');
    poly(g,[[-.02,-.38],[.06,-.38],[.06,-.3],[-.02,-.3]],'#9AA6AE');poly(g,[[-.02,.3],[.06,.3],[.06,.38],[-.02,.38]],'#9AA6AE');
    var t0=L(-.82,0),t1=L(-.5,0);sv('polygon',{points:[t0[0],t0[1],t1[0],t1[1],t0[0]-2,t0[1]-20].join(','),fill:'var(--pulse)'},g);
  }
}
planeShape(pShadow,'var(--shadow)','var(--shadow)',true);
planeShape(plane,'#FFFFFF','#E3E8EC',false);
var RW_Y=18.5;
function planeAt(t){ // one 16 s cycle
  var gx,alt=0,op=1;
  if(t<.1){gx=6.9}
  else if(t<.45){var f=(t-.1)/.35;gx=6.9+4.3*f*f}
  else{var d=(t-.45)/.35*8.6;gx=11.2+d;alt=d*14+d*d*1.6}
  if(t>.78)op=Math.max(0,1-(t-.78)/.08);
  var p=iso(gx,RW_Y,0), sc=1+alt/520;
  plane.setAttribute('transform','translate('+p[0].toFixed(1)+','+(p[1]-alt-3).toFixed(1)+') scale('+sc.toFixed(3)+')');
  pShadow.setAttribute('transform','translate('+p[0].toFixed(1)+','+p[1].toFixed(1)+')');
  plane.setAttribute('opacity',op);pShadow.setAttribute('opacity',(op*Math.max(0,1-alt/110)).toFixed(2));
}


/* ---------- pins and rings (pins themselves are built by main.js) ---------- */
var VB=[0,0,1000,700], current='hq', manualUntil=0;
var ringAt={hq:iso(2.5,14.1,0),it:iso(8.3,10.3,0),school:iso(3,4,0),lab:iso(9.9,5.4,0),abroad:iso(9,18.5,0)}, ringEls={};
for(var rid in ringAt){ringEls[rid]=sv('ellipse',{class:'ring',cx:ringAt[rid][0],cy:ringAt[rid][1],rx:18,ry:9},$('rings'))}
// pins follow the rendered SVG (the map may be cropped to fill a taller box)
function placePins(){var svg=$('townSvg'),m=svg.getScreenCTM(),r=$('townMap').getBoundingClientRect();if(!m)return;
  document.querySelectorAll('#mapPins .pin').forEach(function(b){var t=tops[b.getAttribute('data-id')];if(!t)return;
    var pt=svg.createSVGPoint();pt.x=t[0];pt.y=t[1];var q=pt.matrixTransform(m);
    b.style.left=(q.x-r.left).toFixed(1)+'px';b.style.top=(q.y-r.top).toFixed(1)+'px'})}
function applyViewBox(){var box=$('townMap'),narrow=box.clientWidth<600;
  // desktop: always show the core of the town (x 0-1000, y 15-705) and add more suburb on the long side
  var w=box.clientWidth||1000,h=box.clientHeight||700;
  if(narrow)VB=[10,-10,900,740];
  else if(w/h>1000/690){var W=690*w/h;VB=[500-W/2,15,W,690]}
  else{var H=1000*h/w;VB=[0,360-H/2,1000,H]}$('townSvg').setAttribute('viewBox',VB.join(' '));placePins()}
function setRing(id){current=id;for(var k in ringEls)ringEls[k].classList.toggle('go',k===id&&!reduce)}
function auto(){return performance.now()>manualUntil}
function notify(id,status){if(window.TOWN_EVENT)window.TOWN_EVENT(id,status)}
window.TOWN={placePins:placePins,setRing:setRing,hold:function(ms){manualUntil=performance.now()+ms},reduced:reduce};

/* ---------- timeline ---------- */
var SPEED=2.6, DWELL=3400;
var seq=[];for(var i=0;i<stops.length;i++){var a=stops[i].u,b=i+1<stops.length?stops[i+1].u:LP;seq.push({k:'dwell',id:stops[i].id,d:DWELL});seq.push({k:'drive',from:a,to:b,d:(b-a)/SPEED*1000})}
var HSEQ=[{k:'idle',at:'A',d:1200},{k:'lift',from:'A',d:1800},{k:'turn',to:'B',d:900},{k:'cruise',to:'B',d:4600},{k:'land',at:'B',d:2000},{k:'idle',at:'B',d:2600,land:true},{k:'lift',from:'B',d:1800},{k:'turn',to:'A',d:900},{k:'cruise',to:'A',d:4600},{k:'land',at:'A',d:2000}];
var hHead=HDG+Math.PI, rotA=0;
function hp(n){return n==='A'?HP_A:HP_B}
function heliFrame(st,f,now,dt){
  rotA+=dt*(st.k==='idle'?14:26);
  var e=ease(f),P,z,th=hHead;
  if(st.k==='idle'){P=hp(st.at);z=P.z}
  else if(st.k==='lift'){P=hp(st.from);z=P.z+(CRU+(st.from==='A'?HOSPH:0)-P.z)*e}
  else if(st.k==='turn'){var o=st.to==='B'?HP_A:HP_B,tgt=Math.atan2(hp(st.to).gy-o.gy,hp(st.to).gx-o.gx);
    var d=tgt-hHead;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;th=hHead+d*e;P=o;z=CRU+(st.to==='B'?HOSPH:0)}
  else if(st.k==='cruise'){var o2=st.to==='B'?HP_A:HP_B,t2=hp(st.to);P={gx:o2.gx+(t2.gx-o2.gx)*e,gy:o2.gy+(t2.gy-o2.gy)*e};
    var z0=CRU+(st.to==='B'?HOSPH:0),z1=CRU+(st.to==='A'?HOSPH:0);z=z0+(z1-z0)*e;th=Math.atan2(t2.gy-o2.gy,t2.gx-o2.gx);hHead=th}
  else{P=hp(st.at);var zt=CRU+(st.at==='A'?HOSPH:0);z=zt+(P.z-zt)*(1-Math.pow(1-f,3))}
  drawHeli(P.gx,P.gy,z,th,rotA,now);
}
var step=0,t0=null,hs=0,ht0=null,carU=[8,20,30],last=null,start=null;
function enter(st){if(st.k==='dwell'){if(auto())notify(st.id,'onscene')}else if(auto()&&current!=='abroad')notify(null,'enroute')}
function setAmb(u){var p=posOn(u,.2);drawVehicle(amb,p.gx,p.gy,p.dir)}
function frame(now){
  if(t0===null){t0=ht0=start=last=now;enter(seq[step])}
  var dt=Math.min(.1,(now-last)/1000);last=now;
  var st=seq[step],e=now-t0;
  if(e>=st.d){step=(step+1)%seq.length;t0=now;st=seq[step];e=0;enter(st)}
  if(st.k==='drive')setAmb(st.from+(st.to-st.from)*ease(Math.min(1,e/st.d)));
  var hst=HSEQ[hs],he=now-ht0;
  if(he>=hst.d){if(hst.k==='turn'){var o=hst.to==='B'?HP_A:HP_B;hHead=Math.atan2(hp(hst.to).gy-o.gy,hp(hst.to).gx-o.gx)}
    hs=(hs+1)%HSEQ.length;ht0=now;hst=HSEQ[hs];he=0;if(hst.land&&auto()&&seq[step].k==='drive')notify('abroad','fly')}
  heliFrame(hst,Math.min(1,he/hst.d),now,dt);
  planeAt(((now-start)/16000)%1);
  drawTrain(-14+(((now-start)/16000)%1)*40);
  cars.forEach(function(c,i){carU[i]-=dt*1.2;var p=posOn(carU[i],.2);drawVehicle(c,p.gx,p.gy,p.dir)});
  requestAnimationFrame(frame);
}
setAmb(0);drawHeli(HP_A.gx,HP_A.gy,HP_A.z,HDG+Math.PI,.4,0);planeAt(0);drawTrain(3);
cars.forEach(function(c,i){var p=posOn(carU[i],.2);drawVehicle(c,p.gx,p.gy,p.dir)});
applyViewBox();window.addEventListener('resize',applyViewBox);
if(!reduce)requestAnimationFrame(frame);
})();
