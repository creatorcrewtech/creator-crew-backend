(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[931],{8444:function(e,t,s){Promise.resolve().then(s.bind(s,2134))},2134:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return Index}});var n=s(7437),o=s(2265),i=s(220),a=s(3435),r=s(2173),l=s(429),c=s.n(l);function LoginPage(){let[e,t]=(0,o.useState)([]),[s,l]=(0,o.useState)(),[u,d]=(0,o.useState)(),[h,g,p]=(0,a.fP)(["session"]),[j,x]=(0,o.useState)([]),f=(0,i.Nq)({onSuccess:e=>{g("session",e.access_token,{maxAge:e.expires_in,path:"/"}),t(e)},onError:e=>console.log("Login Failed:",e)});(0,o.useEffect)(()=>{h.session&&r.Z.get("https://www.googleapis.com/oauth2/v1/userinfo?access_token=".concat(h.session),{headers:{Authorization:"Bearer ".concat(h.session),Accept:"application/json"}}).then(async e=>{let t=await r.Z.get("http://localhost:4000/videos"),s=t.data.data;x(s),l(e.data)}).catch(e=>console.log(e))},[e]);let uploadVideo=async e=>{try{e.preventDefault();let t=new FormData;t.append("file",u);let s=await r.Z.post("http://localhost:4000/upload",t);if(200==s.status){let e=await r.Z.get("http://localhost:4000/videos"),t=e.data.data;x(t)}else alert("failed to upload video")}catch(e){console.log(e)}};return(0,n.jsx)(n.Fragment,{children:s?(0,n.jsxs)("div",{children:[(0,n.jsx)("img",{src:s.picture,alt:"user image"}),(0,n.jsx)("h3",{children:"User Logged in"}),(0,n.jsxs)("p",{children:["Name: ",s.name]}),(0,n.jsxs)("p",{children:["Email Address: ",s.email]}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("button",{style:{backgroundColor:"green",width:130,height:50,fontSize:20},onClick:()=>{(0,i.Kz)(),l(null)},children:"Log out"}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("input",{type:"file",name:"file",id:"file",required:!0,onChange:e=>{d(e.target.files[0])}}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("button",{style:{backgroundColor:"green",width:230,height:50,fontSize:20},onClick:uploadVideo,children:"Upload Video"}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),(0,n.jsx)("br",{}),j.map(e=>(0,n.jsx)(c(),{light:!0,controls:!0,url:e.url},e.url))]}):(0,n.jsx)("button",{onClick:()=>f(),children:"Sign in with Google \uD83D\uDE80 "})})}async function Index(){return(0,n.jsx)(o.StrictMode,{children:(0,n.jsx)(i.rg,{clientId:"991721113010-kjq22snhb1vrehjpqaq7eevknu5j6cei.apps.googleusercontent.com",children:(0,n.jsx)(LoginPage,{})})})}}},function(e){e.O(0,[195,971,864,744],function(){return e(e.s=8444)}),_N_E=e.O()}]);