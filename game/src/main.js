import {createGame,startGame,stepGame,togglePause,STEP} from './simulation.js';
import {renderGame} from './render.js';
import {createInput} from './input.js';
import {createAudio} from './audio.js';
import {createUI} from './ui.js';
const canvas=document.querySelector('#game'),context=canvas.getContext('2d');
let state=createGame(),best=0,accumulator=0,last=0;
try{best=Number(localStorage.getItem('tidal-relay-best'))||0;}catch{}
const audio=createAudio();let input,ui;
const actions={unlock:()=>audio.unlock(),start(){audio.unlock();startGame(state);input.clear();ui.update(state,best);},pause(){audio.unlock();togglePause(state);input.clear();ui.update(state,best);},restart(){audio.unlock();state=createGame();startGame(state);input.clear();accumulator=0;ui.update(state,best);},mute(){ui.setMuted(audio.toggle());},blur(){if(state.status==='playing'){togglePause(state);ui.update(state,best);}}};
input=createInput(canvas,actions);ui=createUI(actions);ui.update(state,best);
function frame(now){let elapsed=last?Math.min(.1,(now-last)/1000):0;last=now;accumulator+=elapsed;
 while(accumulator>=STEP){stepGame(state,input.read(),STEP);for(const event of state.events)audio.play(event);state.events=[];accumulator-=STEP;}
 if((state.status==='won'||state.status==='lost')&&state.score>best){best=state.score;try{localStorage.setItem('tidal-relay-best',String(best));}catch{}}
 ui.update(state,best);renderGame(context,state);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Read-only telemetry also makes deterministic browser integration checks possible.
export function snapshot(){return structuredClone(state);}
