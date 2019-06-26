!function(e,t){"use strict";const i=(0,eval)("this"),s=i.swT||(i.swT=Symbol("TEXT")),n=i.swS||(i.swS=Symbol("SIZE")),o=i.swF||(i.swF=Symbol("FONT")),r=i.swC||(i.swC=Symbol("COLOR")),a=i.swI||(i.swI=Symbol("FILE"));class l extends e.ThreeComponent{constructor(){super(...arguments),this.ui=[{name:"text",widget:s,size:12},{name:"font",widget:o,size:9},{name:"size",widget:n,size:2},{name:"color",widget:r,size:1}]}init(){}async render(){const{font:i,size:s,text:n,color:o}=this.props,r=await i.layout(n),a=e.generateShapes(r,s),l=new t.ExtrudeGeometry(a,{steps:1,depth:2,bevelEnabled:!1,bevelThickness:0,bevelSize:0,bevelSegments:0}),d=new t.MeshPhongMaterial({color:o,emissive:5123601,flatShading:!0,side:t.DoubleSide}),h=new t.Mesh(l,d);this.group.add(h)}}class d extends e.ThreeComponent{constructor(){super(...arguments),this.ui=[{name:"file",widget:a,size:12}]}init(){}render(){const{scale:e,file:i}=this.props,s=new t.Texture;s.generateMipmaps=!1,s.wrapS=s.wrapT=t.ClampToEdgeWrapping,s.minFilter=t.LinearFilter;const n=new t.MeshBasicMaterial({side:t.DoubleSide,map:s,transparent:!0});return new Promise(o=>{const r=new Image;i.url().then(e=>r.src=e),r.onload=(()=>{s.image=r,s.needsUpdate=!0;const i=r.width*e,a=r.height*e,l=new t.PlaneBufferGeometry(i,a,32),d=new t.Mesh(l,n);this.group.add(d),o()})})}}class h extends e.ThreeComponent{constructor(){super(...arguments),this.ui=[{name:"file",widget:a,size:12}]}init(){this.video=document.createElement("video"),this.texture=new t.VideoTexture(this.video),this.texture.generateMipmaps=!1,this.texture.wrapS=this.texture.wrapT=t.ClampToEdgeWrapping,this.texture.minFilter=t.LinearFilter,this.material=new t.MeshBasicMaterial({side:t.DoubleSide,map:this.texture,transparent:!0}),this.mesh=new t.Mesh(void 0,this.material),this.video.onloadeddata=(()=>{const e=.05*this.video.videoWidth,i=.05*this.video.videoHeight,s=new t.PlaneBufferGeometry(e,i,32);this.mesh.geometry=s,this.group.add(this.mesh)})}async render(){const{file:e}=this.props,t=await e.url();this.video.src=t}handleClick(){this.video.paused?this.video.play():this.video.pause()}}e.registerModule("slye",class extends e.Module{constructor(){super(...arguments),this.textButtonClickHandler=(async t=>{const i=await e.component("slye","text",{size:10,font:await e.font("slye","Homa"),text:"Write...",color:9003541}),s=t.getCurrentStep();t.actions.insertComponent(s,i)}),this.picBtnClickHandler=(async t=>{const i=await e.showFileDialog(t.presentation.uuid);if(!i||!i.length)return;const s=await e.component("slye","picture",{scale:.05,file:i[0]});s.setPosition(0,0,.1);const n=t.getCurrentStep();t.actions.insertComponent(n,s)}),this.videoBtnClickHandler=(async t=>{const i=await e.showFileDialog(t.presentation.uuid);if(!i||!i.length)return;const s=await e.component("slye","video",{file:i[0]});s.setPosition(0,0,.1);const n=t.getCurrentStep();t.actions.insertComponent(n,s)})}init(){this.registerFont("Homa",this.assets.load("homa.ttf")),this.registerFont("Sahel",this.assets.load("sahel.ttf")),this.registerFont("Shellia",this.assets.load("shellia.ttf")),this.registerFont("Emoji",this.assets.load("emoji.ttf")),this.registerComponent("text",l),e.addStepbarButton("Text","text_fields",this.textButtonClickHandler),this.registerComponent("picture",d),e.addStepbarButton("Picture","photo",this.picBtnClickHandler),this.registerComponent("video",h),e.addStepbarButton("Video","video_library",this.videoBtnClickHandler)}})}(slye,THREE);