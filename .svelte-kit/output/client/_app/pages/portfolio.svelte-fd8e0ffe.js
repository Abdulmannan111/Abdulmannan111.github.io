import{S as H,i as R,s as U,j as W,m as X,o as Y,x as S,u as Z,v as z,A as B,V as F,e as h,t as j,k as x,c as d,a as p,g as M,d as u,n as P,b as c,H as w,T as G,f as T,E as _,h as J,Z as q,_ as A,$ as K,D as L,G as Q,W as ee,X as te,Y as ae,a0 as se}from"../chunks/vendor-fb0024c4.js";import{P as le}from"../chunks/Page-43ba8f74.js";import"../chunks/company-409b835e.js";function N(m,e,t){const a=m.slice();return a[2]=e[t],a[4]=t,a}function O(m,e){let t,a,l,r=e[2].name+"",v,k,y,f,i,D,g,E,n;return{key:m,first:null,c(){t=h("li"),a=h("div"),l=h("div"),v=j(r),y=x(),f=h("div"),i=h("img"),E=x(),this.h()},l(s){t=d(s,"LI",{style:!0,class:!0});var o=p(t);a=d(o,"DIV",{class:!0});var b=p(a);l=d(b,"DIV",{class:!0});var C=p(l);v=M(C,r),C.forEach(u),b.forEach(u),y=P(o),f=d(o,"DIV",{class:!0});var $=p(f);i=d($,"IMG",{src:!0,alt:!0,class:!0}),$.forEach(u),E=P(o),o.forEach(u),this.h()},h(){c(l,"class","name svelte-1h3mmx7"),c(a,"class","details svelte-1h3mmx7"),w(i.src,D=e[2].image_path)||c(i,"src",D),c(i,"alt",g=e[2].name),c(i,"class","svelte-1h3mmx7"),c(f,"class","image-container svelte-1h3mmx7"),G(t,"animation-delay",e[4]*200+"ms"),c(t,"class","svelte-1h3mmx7"),this.first=t},m(s,o){T(s,t,o),_(t,a),_(a,l),_(l,v),_(t,y),_(t,f),_(f,i),_(t,E)},p(s,o){e=s,o&2&&r!==(r=e[2].name+"")&&J(v,r),o&2&&!w(i.src,D=e[2].image_path)&&c(i,"src",D),o&2&&g!==(g=e[2].name)&&c(i,"alt",g),o&2&&G(t,"animation-delay",e[4]*200+"ms")},i(s){k||q(()=>{k=A(a,se,{duration:300}),k.start()}),n||q(()=>{n=A(t,K,{x:e[4]%2==0?100:-100,duration:500}),n.start()})},o:L,d(s){s&&u(t)}}}function ne(m){let e,t,a,l,r,v,k,y,f,i=[],D=new Map,g=m[1];const E=n=>n[4];for(let n=0;n<g.length;n+=1){let s=N(m,g,n),o=E(s);D.set(o,i[n]=O(o,s))}return{c(){e=h("section"),t=h("div"),a=h("p"),l=h("a"),r=h("strong"),v=j("\u270E"),k=j(" Manage Clients"),y=x(),f=h("ul");for(let n=0;n<i.length;n+=1)i[n].c();this.h()},l(n){e=d(n,"SECTION",{class:!0});var s=p(e);t=d(s,"DIV",{class:!0});var o=p(t);a=d(o,"P",{class:!0});var b=p(a);l=d(b,"A",{href:!0,class:!0});var C=p(l);r=d(C,"STRONG",{});var $=p(r);v=M($,"\u270E"),$.forEach(u),k=M(C," Manage Clients"),C.forEach(u),b.forEach(u),y=P(o),f=d(o,"UL",{class:!0});var V=p(f);for(let I=0;I<i.length;I+=1)i[I].l(V);V.forEach(u),o.forEach(u),s.forEach(u),this.h()},h(){c(l,"href","cloudcannon:collections/content/clients/"),c(l,"class","btn"),c(a,"class","editor-link svelte-1h3mmx7"),c(f,"class","image-grid svelte-1h3mmx7"),c(t,"class","container svelte-1h3mmx7"),c(e,"class","diagonal patterned svelte-1h3mmx7")},m(n,s){T(n,e,s),_(e,t),_(t,a),_(a,l),_(l,r),_(r,v),_(l,k),_(t,y),_(t,f);for(let o=0;o<i.length;o+=1)i[o].m(f,null)},p(n,s){s&2&&(g=n[1],i=Q(i,s,E,1,n,g,D,f,ee,O,null,N))},i(n){for(let s=0;s<g.length;s+=1)S(i[s])},o:L,d(n){n&&u(e);for(let s=0;s<i.length;s+=1)i[s].d()}}}function oe(m){let e,t;return e=new le({props:{pageDetails:m[0],$$slots:{default:[ne]},$$scope:{ctx:m}}}),{c(){W(e.$$.fragment)},l(a){X(e.$$.fragment,a)},m(a,l){Y(e,a,l),t=!0},p(a,[l]){const r={};l&1&&(r.pageDetails=a[0]),l&34&&(r.$$scope={dirty:l,ctx:a}),e.$set(r)},i(a){t||(S(e.$$.fragment,a),t=!0)},o(a){Z(e.$$.fragment,a),t=!1},d(a){z(e,a)}}}async function me({fetch:m}){const e=await m("portfolio.json");if(e.ok)return{props:e.json()}}function ie(m,e,t){let{pageDetails:a,clients:l}=e;return B(async()=>{te(r=>t(0,a=r))}),F(async()=>{ae()}),m.$$set=r=>{"pageDetails"in r&&t(0,a=r.pageDetails),"clients"in r&&t(1,l=r.clients)},[a,l]}class fe extends H{constructor(e){super();R(this,e,ie,oe,U,{pageDetails:0,clients:1})}}export{fe as default,me as load};
