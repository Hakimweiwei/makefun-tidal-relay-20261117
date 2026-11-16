export function createAudio(){
 let context=null,muted=false;
 function unlock(){if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)context=new Audio();}if(context?.state==='suspended')context.resume();}
 function tone(frequency,time,duration,type='sine',volume=.05){if(!context||muted)return;const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,time);osc.frequency.exponentialRampToValueAtTime(frequency*.65,time+duration);gain.gain.setValueAtTime(.001,time);gain.gain.exponentialRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(gain);gain.connect(context.destination);osc.start(time);osc.stop(time+duration+.02);}
 function play(event){if(!context||muted)return;const t=context.currentTime;const notes={pickup:[520,780],delivery:[392,494,587,784],phase:[180,360,240],hit:[100,57],sector:[330,440,660],win:[392,494,587,784,988],lose:[220,165,110]}[event]||[];notes.forEach((f,i)=>tone(f,t+i*.085,event==='hit'?.2:.22,event==='hit'?'sawtooth':'sine',event==='hit'?.035:.07));}
 return{unlock,play,toggle(){muted=!muted;unlock();return muted;},isMuted:()=>muted};
}
