(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[596],{4609:function(e,t,i){var r,a,l=Object.create,o=Object.defineProperty,n=Object.getOwnPropertyDescriptor,s=Object.getOwnPropertyNames,p=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,__defNormalProp=(e,t,i)=>t in e?o(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,__copyProps=(e,t,i,r)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let a of s(t))u.call(e,a)||a===i||o(e,a,{get:()=>t[a],enumerable:!(r=n(t,a))||r.enumerable});return e},__publicField=(e,t,i)=>(__defNormalProp(e,"symbol"!=typeof t?t+"":t,i),i),h={};((e,t)=>{for(var i in t)o(e,i,{get:t[i],enumerable:!0})})(h,{default:()=>DailyMotion}),e.exports=__copyProps(o({},"__esModule",{value:!0}),h);var c=(a=null!=(r=i(2265))?l(p(r)):{},__copyProps(r&&r.__esModule?a:o(a,"default",{value:r,enumerable:!0}),r)),d=i(4117),y=i(5087);let DailyMotion=class DailyMotion extends c.Component{constructor(){super(...arguments),__publicField(this,"callPlayer",d.callPlayer),__publicField(this,"onDurationChange",()=>{let e=this.getDuration();this.props.onDuration(e)}),__publicField(this,"mute",()=>{this.callPlayer("setMuted",!0)}),__publicField(this,"unmute",()=>{this.callPlayer("setMuted",!1)}),__publicField(this,"ref",e=>{this.container=e})}componentDidMount(){this.props.onMount&&this.props.onMount(this)}load(e){let{controls:t,config:i,onError:r,playing:a}=this.props,[,l]=e.match(y.MATCH_URL_DAILYMOTION);if(this.player){this.player.load(l,{start:(0,d.parseStartTime)(e),autoplay:a});return}(0,d.getSDK)("https://api.dmcdn.net/all.js","DM","dmAsyncInit",e=>e.player).then(a=>{if(!this.container)return;let o=a.player;this.player=new o(this.container,{width:"100%",height:"100%",video:l,params:{controls:t,autoplay:this.props.playing,mute:this.props.muted,start:(0,d.parseStartTime)(e),origin:window.location.origin,...i.params},events:{apiready:this.props.onReady,seeked:()=>this.props.onSeek(this.player.currentTime),video_end:this.props.onEnded,durationchange:this.onDurationChange,pause:this.props.onPause,playing:this.props.onPlay,waiting:this.props.onBuffer,error:e=>r(e)}})},r)}play(){this.callPlayer("play")}pause(){this.callPlayer("pause")}stop(){}seekTo(e,t=!0){this.callPlayer("seek",e),t||this.pause()}setVolume(e){this.callPlayer("setVolume",e)}getDuration(){return this.player.duration||null}getCurrentTime(){return this.player.currentTime}getSecondsLoaded(){return this.player.bufferedTime}render(){let{display:e}=this.props;return c.default.createElement("div",{style:{width:"100%",height:"100%",display:e}},c.default.createElement("div",{ref:this.ref}))}};__publicField(DailyMotion,"displayName","DailyMotion"),__publicField(DailyMotion,"canPlay",y.canPlay.dailymotion),__publicField(DailyMotion,"loopOnEnded",!0)}}]);