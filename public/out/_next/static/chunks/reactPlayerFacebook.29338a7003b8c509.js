(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[121],{1467:function(e,t,r){var s,l,o=Object.create,i=Object.defineProperty,a=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,n=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,__defNormalProp=(e,t,r)=>t in e?i(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,__copyProps=(e,t,r,s)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let l of p(t))u.call(e,l)||l===r||i(e,l,{get:()=>t[l],enumerable:!(s=a(t,l))||s.enumerable});return e},__publicField=(e,t,r)=>(__defNormalProp(e,"symbol"!=typeof t?t+"":t,r),r),c={};((e,t)=>{for(var r in t)i(e,r,{get:t[r],enumerable:!0})})(c,{default:()=>Facebook}),e.exports=__copyProps(i({},"__esModule",{value:!0}),c);var b=(l=null!=(s=r(2265))?o(n(s)):{},__copyProps(s&&s.__esModule?l:i(l,"default",{value:s,enumerable:!0}),s)),d=r(4117),h=r(5087);let y="https://connect.facebook.net/en_US/sdk.js",f="fbAsyncInit";let Facebook=class Facebook extends b.Component{constructor(){super(...arguments),__publicField(this,"callPlayer",d.callPlayer),__publicField(this,"playerID",this.props.config.playerId||`facebook-player-${(0,d.randomString)()}`),__publicField(this,"mute",()=>{this.callPlayer("mute")}),__publicField(this,"unmute",()=>{this.callPlayer("unmute")})}componentDidMount(){this.props.onMount&&this.props.onMount(this)}load(e,t){if(t){(0,d.getSDK)(y,"FB",f).then(e=>e.XFBML.parse());return}(0,d.getSDK)(y,"FB",f).then(e=>{e.init({appId:this.props.config.appId,xfbml:!0,version:this.props.config.version}),e.Event.subscribe("xfbml.render",e=>{this.props.onLoaded()}),e.Event.subscribe("xfbml.ready",e=>{"video"===e.type&&e.id===this.playerID&&(this.player=e.instance,this.player.subscribe("startedPlaying",this.props.onPlay),this.player.subscribe("paused",this.props.onPause),this.player.subscribe("finishedPlaying",this.props.onEnded),this.player.subscribe("startedBuffering",this.props.onBuffer),this.player.subscribe("finishedBuffering",this.props.onBufferEnd),this.player.subscribe("error",this.props.onError),this.props.muted?this.callPlayer("mute"):this.callPlayer("unmute"),this.props.onReady(),document.getElementById(this.playerID).querySelector("iframe").style.visibility="visible")})})}play(){this.callPlayer("play")}pause(){this.callPlayer("pause")}stop(){}seekTo(e,t=!0){this.callPlayer("seek",e),t||this.pause()}setVolume(e){this.callPlayer("setVolume",e)}getDuration(){return this.callPlayer("getDuration")}getCurrentTime(){return this.callPlayer("getCurrentPosition")}getSecondsLoaded(){return null}render(){let{attributes:e}=this.props.config;return b.default.createElement("div",{style:{width:"100%",height:"100%"},id:this.playerID,className:"fb-video","data-href":this.props.url,"data-autoplay":this.props.playing?"true":"false","data-allowfullscreen":"true","data-controls":this.props.controls?"true":"false",...e})}};__publicField(Facebook,"displayName","Facebook"),__publicField(Facebook,"canPlay",h.canPlay.facebook),__publicField(Facebook,"loopOnEnded",!0)}}]);