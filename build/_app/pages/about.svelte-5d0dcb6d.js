import{S as q,i as z,s as R,j as P,m as x,o as I,x as E,u as D,v as O,A as U,V as X,e as m,c as g,a as p,d as u,f as G,t as L,k as Y,g as N,n as B,b as d,E as h,r as F,G as H,O as J,w as K,X as Q,Y as W}from"../chunks/vendor-fb0024c4.js";import{P as Z}from"../chunks/Page-43ba8f74.js";import{A as ee}from"../chunks/AuthorCard-512807b8.js";import"../chunks/company-409b835e.js";function T(c,t,a){const e=c.slice();return e[3]=t[a],e[5]=a,e}function V(c,t){let a,e,s;return e=new ee({props:{author:t[3]}}),{key:c,first:null,c(){a=m("li"),P(e.$$.fragment),this.h()},l(n){a=g(n,"LI",{});var l=p(a);x(e.$$.fragment,l),l.forEach(u),this.h()},h(){this.first=a},m(n,l){G(n,a,l),I(e,a,null),s=!0},p(n,l){t=n},i(n){s||(E(e.$$.fragment,n),s=!0)},o(n){D(e.$$.fragment,n),s=!1},d(n){n&&u(a),O(e)}}}function te(c){let t,a,e,s,n,l,v,$,_,i=[],M=new Map,k,b=c[1];const j=o=>o[5];for(let o=0;o<b.length;o+=1){let r=T(c,b,o),f=j(r);M.set(f,i[o]=V(f,r))}return{c(){t=m("section"),a=m("div"),e=m("p"),s=m("a"),n=m("strong"),l=L("\u270E"),v=L("Manage Staff members"),$=Y(),_=m("ul");for(let o=0;o<i.length;o+=1)i[o].c();this.h()},l(o){t=g(o,"SECTION",{class:!0});var r=p(t);a=g(r,"DIV",{class:!0});var f=p(a);e=g(f,"P",{class:!0});var S=p(e);s=g(S,"A",{href:!0,class:!0});var y=p(s);n=g(y,"STRONG",{});var w=p(n);l=N(w,"\u270E"),w.forEach(u),v=N(y,"Manage Staff members"),y.forEach(u),S.forEach(u),$=B(f),_=g(f,"UL",{class:!0});var A=p(_);for(let C=0;C<i.length;C+=1)i[C].l(A);A.forEach(u),f.forEach(u),r.forEach(u),this.h()},h(){d(s,"href","cloudcannon:collections/content/staff-members/"),d(s,"class","btn"),d(e,"class","editor-link svelte-16zwu5m"),d(_,"class","image-grid"),d(a,"class","container"),d(t,"class","diagonal patterned")},m(o,r){G(o,t,r),h(t,a),h(a,e),h(e,s),h(s,n),h(n,l),h(s,v),h(a,$),h(a,_);for(let f=0;f<i.length;f+=1)i[f].m(_,null);k=!0},p(o,r){r&2&&(b=o[1],F(),i=H(i,r,j,1,o,b,M,_,J,V,null,T),K())},i(o){if(!k){for(let r=0;r<b.length;r+=1)E(i[r]);k=!0}},o(o){for(let r=0;r<i.length;r+=1)D(i[r]);k=!1},d(o){o&&u(t);for(let r=0;r<i.length;r+=1)i[r].d()}}}function ae(c){let t,a;return t=new Z({props:{pageDetails:c[0],$$slots:{default:[te]},$$scope:{ctx:c}}}),{c(){P(t.$$.fragment)},l(e){x(t.$$.fragment,e)},m(e,s){I(t,e,s),a=!0},p(e,[s]){const n={};s&1&&(n.pageDetails=e[0]),s&64&&(n.$$scope={dirty:s,ctx:e}),t.$set(n)},i(e){a||(E(t.$$.fragment,e),a=!0)},o(e){D(t.$$.fragment,e),a=!1},d(e){O(t,e)}}}async function ce({fetch:c}){const t=await c("about.json");if(t.ok)return{props:t.json()}}function se(c,t,a){let{staffMembers:e,pageDetails:s}=t;U(async()=>{Q(l=>a(0,s=l))}),X(async()=>{W()});let n=e.slice(0,2);return c.$$set=l=>{"staffMembers"in l&&a(2,e=l.staffMembers),"pageDetails"in l&&a(0,s=l.pageDetails)},[s,n,e]}class ie extends q{constructor(t){super();z(this,t,se,ae,R,{staffMembers:2,pageDetails:0})}}export{ie as default,ce as load};
