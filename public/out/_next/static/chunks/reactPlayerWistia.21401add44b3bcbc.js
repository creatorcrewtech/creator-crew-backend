(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[55],{5310:function(e,t,l){var a,i,s=Object.create,n=Object.defineProperty,o=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,p=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,__defNormalProp=(e,t,l)=>t in e?n(e,t,{enumerable:!0,configurable:!0,writable:!0,value:l}):e[t]=l,__copyProps=(e,t,l,a)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let i of r(t))u.call(e,i)||i===l||n(e,i,{get:()=>t[i],enumerable:!(a=o(t,i))||a.enumerable});return e},__publicField=(e,t,l)=>(__defNormalProp(e,"symbol"!=typeof t?t+"":t,l),l),h={};((e,t)=>{for(var l in t)n(e,l,{get:t[l],enumerable:!0})})(h,{default:()=>Wistia}),e.exports=__copyProps(n({},"__esModule",{value:!0}),h);var c=(i=null!=(a=l(2265))?s(p(a)):{},__copyProps(a&&a.__esModule?i:n(i,"default",{value:a,enumerable:!0}),a)),y=l(4117),d=l(5087);let Wistia=class Wistia extends c.Component{constructor(){super(...arguments),__publicField(this,"callPlayer",y.callPlayer),__publicField(this,"playerID",this.props.config.playerId||`wistia-player-${(0,y.randomString)()}`),__publicField(this,"onPlay",(...e)=>this.props.onPlay(...e)),__publicField(this,"onPause",(...e)=>this.props.onPause(...e)),__publicField(this,"onSeek",(...e)=>this.props.onSeek(...e)),__publicField(this,"onEnded",(...e)=>this.props.onEnded(...e)),__publicField(this,"onPlaybackRateChange",(...e)=>this.props.onPlaybackRateChange(...e)),__publicField(this,"mute",()=>{this.callPlayer("mute")}),__publicField(this,"unmute",()=>{this.callPlayer("unmute")})}componentDidMount(){this.props.onMount&&this.props.onMount(this)}load(e){let{playing:t,muted:l,controls:a,onReady:i,config:s,onError:n}=this.props;(0,y.getSDK)("https://fast.wistia.com/assets/external/E-v1.js","Wistia").then(e=>{s.customControls&&s.customControls.forEach(t=>e.defineControl(t)),window._wq=window._wq||[],window._wq.push({id:this.playerID,options:{autoPlay:t,silentAutoPlay:"allow",muted:l,controlsVisibleOnLoad:a,fullscreenButton:a,playbar:a,playbackRateControl:a,qualityControl:a,volumeControl:a,settingsControl:a,smallPlayButton:a,...s.options},onReady:e=>{this.player=e,this.unbind(),this.player.bind("play",this.onPlay),this.player.bind("pause",this.onPause),this.player.bind("seek",this.onSeek),this.player.bind("end",this.onEnded),this.player.bind("playbackratechange",this.onPlaybackRateChange),i()}})},n)}unbind(){this.player.unbind("play",this.onPlay),this.player.unbind("pause",this.onPause),this.player.unbind("seek",this.onSeek),this.player.unbind("end",this.onEnded),this.player.unbind("playbackratechange",this.onPlaybackRateChange)}play(){this.callPlayer("play")}pause(){this.callPlayer("pause")}stop(){this.unbind(),this.callPlayer("remove")}seekTo(e,t=!0){this.callPlayer("time",e),t||this.pause()}setVolume(e){this.callPlayer("volume",e)}setPlaybackRate(e){this.callPlayer("playbackRate",e)}getDuration(){return this.callPlayer("duration")}getCurrentTime(){return this.callPlayer("time")}getSecondsLoaded(){return null}render(){let{url:e}=this.props,t=e&&e.match(d.MATCH_URL_WISTIA)[1],l=`wistia_embed wistia_async_${t}`;return c.default.createElement("div",{id:this.playerID,key:t,className:l,style:{width:"100%",height:"100%"}})}};__publicField(Wistia,"displayName","Wistia"),__publicField(Wistia,"canPlay",d.canPlay.wistia),__publicField(Wistia,"loopOnEnded",!0)}}]);