import{S as Tt,i as $t,s as Ht,j as qt,m as zt,o as At,x as Yt,u as xt,v as Ot,A as Wt,V as Bt,e as i,k as g,c as o,a as c,n as E,d as l,H as Ft,b as u,f as jt,E as t,t as b,g as D,h as Mt,G as Gt,W as Nt,X as Rt,Y as Ut}from"../chunks/vendor-fb0024c4.js";import{P as Xt,s as Jt}from"../chunks/Page-43ba8f74.js";import"../chunks/company-409b835e.js";function Lt(f,a,s){const e=f.slice();return e[3]=a[s],e[5]=s,e}function Pt(f,a){let s,e,n,h;return{key:f,first:null,c(){s=i("li"),e=i("img"),h=g(),this.h()},l(d){s=o(d,"LI",{});var _=c(s);e=o(_,"IMG",{src:!0,alt:!0}),h=E(_),_.forEach(l),this.h()},h(){Ft(e.src,n=a[3].image_path)||u(e,"src",n),u(e,"alt",a[3].name),this.first=s},m(d,_){jt(d,s,_),t(s,e),t(s,h)},p(d,_){a=d},d(d){d&&l(s)}}}function Kt(f){let a,s,e,n,h,d,_,y,J,K,C,k,Q,Z,P,tt,et,V,j,at,st,S,nt,lt,w,I,q,z=f[0].portfolio_heading+"",W,it,T,B=f[0].portfolio_description_html+"",ot,A,M,Y=f[0].portfolio_call_to_action+"",F,rt,ct,x,L,m=[],_t=new Map,dt,O,ut,G=f[1];const mt=r=>r[5];for(let r=0;r<G.length;r+=1){let v=Lt(f,G,r),p=mt(v);_t.set(p,m[r]=Pt(p,v))}return{c(){a=i("section"),s=i("div"),e=i("div"),n=i("div"),h=i("div"),d=b("0"),_=g(),y=i("div"),J=b("Years Of Experience"),K=g(),C=i("div"),k=i("div"),Q=b("0"),Z=g(),P=i("div"),tt=b("Satisfied Clients"),et=g(),V=i("div"),j=i("div"),at=b("0"),st=g(),S=i("div"),nt=b("Websites Developed"),lt=g(),w=i("div"),I=i("div"),q=i("h3"),W=b(z),it=g(),T=i("p"),ot=g(),A=i("p"),M=i("a"),F=b(Y),rt=b(" \u2192"),ct=g(),x=i("div"),L=i("ul");for(let r=0;r<m.length;r+=1)m[r].c();dt=g(),O=i("style"),ut=b(`.stats {
				display: flex;
				justify-content: space-around;
				margin: 2em 0;
				text-align: center;
			}

			.stat {
				padding: 1em;
			}

			.number {
				font-size: 3em;
				font-weight: bold;
				margin-bottom: 0.2em;
			}

			.label {
				font-size: 1.2em;
			}`),this.h()},l(r){a=o(r,"SECTION",{class:!0});var v=c(a);s=o(v,"DIV",{class:!0});var p=c(s);e=o(p,"DIV",{class:!0});var $=c(e);n=o($,"DIV",{class:!0});var N=c(n);h=o(N,"DIV",{class:!0,id:!0});var pt=c(h);d=D(pt,"0"),pt.forEach(l),_=E(N),y=o(N,"DIV",{class:!0});var gt=c(y);J=D(gt,"Years Of Experience"),gt.forEach(l),N.forEach(l),K=E($),C=o($,"DIV",{class:!0});var R=c(C);k=o(R,"DIV",{class:!0,id:!0});var Et=c(k);Q=D(Et,"0"),Et.forEach(l),Z=E(R),P=o(R,"DIV",{class:!0});var bt=c(P);tt=D(bt,"Satisfied Clients"),bt.forEach(l),R.forEach(l),et=E($),V=o($,"DIV",{class:!0});var U=c(V);j=o(U,"DIV",{class:!0,id:!0});var Dt=c(j);at=D(Dt,"0"),Dt.forEach(l),st=E(U),S=o(U,"DIV",{class:!0});var yt=c(S);nt=D(yt,"Websites Developed"),yt.forEach(l),U.forEach(l),$.forEach(l),lt=E(p),w=o(p,"DIV",{class:!0});var X=c(w);I=o(X,"DIV",{});var H=c(I);q=o(H,"H3",{});var It=c(q);W=D(It,z),It.forEach(l),it=E(H),T=o(H,"P",{});var St=c(T);St.forEach(l),ot=E(H),A=o(H,"P",{});var Ct=c(A);M=o(Ct,"A",{href:!0});var ft=c(M);F=D(ft,Y),rt=D(ft," \u2192"),ft.forEach(l),Ct.forEach(l),H.forEach(l),ct=E(X),x=o(X,"DIV",{});var Vt=c(x);L=o(Vt,"UL",{class:!0});var wt=c(L);for(let ht=0;ht<m.length;ht+=1)m[ht].l(wt);wt.forEach(l),Vt.forEach(l),X.forEach(l),p.forEach(l),dt=E(v),O=o(v,"STYLE",{});var kt=c(O);ut=D(kt,`.stats {
				display: flex;
				justify-content: space-around;
				margin: 2em 0;
				text-align: center;
			}

			.stat {
				padding: 1em;
			}

			.number {
				font-size: 3em;
				font-weight: bold;
				margin-bottom: 0.2em;
			}

			.label {
				font-size: 1.2em;
			}`),kt.forEach(l),v.forEach(l),this.h()},h(){u(h,"class","number"),u(h,"id","yearsCount"),u(y,"class","label"),u(n,"class","stat"),u(k,"class","number"),u(k,"id","clientsCount"),u(P,"class","label"),u(C,"class","stat"),u(j,"class","number"),u(j,"id","websitesCount"),u(S,"class","label"),u(V,"class","stat"),u(e,"class","stats"),u(M,"href",`${Jt.baseurl}/portfolio`),u(L,"class","image-grid"),u(w,"class","halves"),u(s,"class","container"),u(a,"class","diagonal patterned")},m(r,v){jt(r,a,v),t(a,s),t(s,e),t(e,n),t(n,h),t(h,d),t(n,_),t(n,y),t(y,J),t(e,K),t(e,C),t(C,k),t(k,Q),t(C,Z),t(C,P),t(P,tt),t(e,et),t(e,V),t(V,j),t(j,at),t(V,st),t(V,S),t(S,nt),t(s,lt),t(s,w),t(w,I),t(I,q),t(q,W),t(I,it),t(I,T),T.innerHTML=B,t(I,ot),t(I,A),t(A,M),t(M,F),t(M,rt),t(w,ct),t(w,x),t(x,L);for(let p=0;p<m.length;p+=1)m[p].m(L,null);t(a,dt),t(a,O),t(O,ut)},p(r,v){v&1&&z!==(z=r[0].portfolio_heading+"")&&Mt(W,z),v&1&&B!==(B=r[0].portfolio_description_html+"")&&(T.innerHTML=B),v&1&&Y!==(Y=r[0].portfolio_call_to_action+"")&&Mt(F,Y),v&2&&(G=r[1],m=Gt(m,v,mt,1,r,G,_t,L,Nt,Pt,null,Lt))},d(r){r&&l(a);for(let v=0;v<m.length;v+=1)m[v].d()}}}function Qt(f){let a,s;return a=new Xt({props:{pageDetails:f[0],withContactButton:"true",$$slots:{default:[Kt]},$$scope:{ctx:f}}}),{c(){qt(a.$$.fragment)},l(e){zt(a.$$.fragment,e)},m(e,n){At(a,e,n),s=!0},p(e,[n]){const h={};n&1&&(h.pageDetails=e[0]),n&65&&(h.$$scope={dirty:n,ctx:e}),a.$set(h)},i(e){s||(Yt(a.$$.fragment,e),s=!0)},o(e){xt(a.$$.fragment,e),s=!1},d(e){Ot(a,e)}}}async function se({fetch:f}){const a=await f("index.json");if(a.ok)return{props:a.json()}}function vt(f,a,s,e){let n=null;const h=document.getElementById(f);function d(_){n||(n=_);const y=Math.min((_-n)/e,1);h.innerHTML=Math.floor(y*(s-a)+a)+"+",y<1&&window.requestAnimationFrame(d)}window.requestAnimationFrame(d)}function Zt(f,a,s){let{pageDetails:e}=a,{clients:n}=a;Wt(async()=>{Rt(d=>s(0,e=d)),vt("yearsCount",0,10,2e3),vt("clientsCount",0,200,2e3),vt("websitesCount",0,300,2e3)}),Bt(async()=>{Ut()});let h=n.slice(0,4);return f.$$set=d=>{"pageDetails"in d&&s(0,e=d.pageDetails),"clients"in d&&s(2,n=d.clients)},[e,h,n]}class ne extends Tt{constructor(a){super();$t(this,a,Zt,Qt,Ht,{pageDetails:0,clients:2})}}export{ne as default,se as load};
