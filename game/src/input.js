export function createInput(canvas,actions){
 const keys=new Set();let pointer=null,phase=false;
 const commands={Space:'phase',KeyP:'pause',Escape:'pause',KeyR:'restart',KeyM:'mute',Enter:'start'};
 window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!e.repeat&&commands[e.code]){if(e.code==='Space')phase=true;else actions[commands[e.code]]();}keys.add(e.code);});
 window.addEventListener('keyup',e=>keys.delete(e.code));
 const clear=()=>{keys.clear();pointer=null;phase=false;};
 window.addEventListener('blur',()=>{clear();actions.blur();});
 function target(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1120/r.width,y:(e.clientY-r.top)*700/r.height};}
 canvas.addEventListener('pointerdown',e=>{actions.unlock();if(e.button===2){phase=true;return;}if(e.button===0){pointer=target(e);canvas.setPointerCapture(e.pointerId);}});
 canvas.addEventListener('pointermove',e=>{if(pointer)pointer=target(e);});
 canvas.addEventListener('pointerup',()=>{pointer=null;});canvas.addEventListener('pointercancel',clear);canvas.addEventListener('contextmenu',e=>e.preventDefault());
 return {clear,read(){const i={x:Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y:Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp')),phase,target:pointer};phase=false;return i;}};
}
