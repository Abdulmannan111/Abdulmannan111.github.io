import{S as B,i as F,s as J,e as _,k as C,t as S,c as d,a as p,d as f,n as j,g as G,H,b as s,f as K,E as i,h as M,D as z}from"./vendor-fb0024c4.js";function L(l){let e,n,a,c,g,V,o,h,m=l[0].name+"",E,b,u,v=l[0].position+"",D,I;return{c(){e=_("a"),n=_("div"),a=_("img"),V=C(),o=_("div"),h=_("div"),E=S(m),b=C(),u=_("div"),D=S(v),this.h()},l(r){e=d(r,"A",{target:!0,href:!0,rel:!0});var t=p(e);n=d(t,"DIV",{class:!0});var q=p(n);a=d(q,"IMG",{src:!0,alt:!0}),q.forEach(f),V=j(t),o=d(t,"DIV",{class:!0});var w=p(o);h=d(w,"DIV",{class:!0});var A=p(h);E=G(A,m),A.forEach(f),b=j(w),u=d(w,"DIV",{class:!0});var k=p(u);D=G(k,v),k.forEach(f),w.forEach(f),t.forEach(f),this.h()},h(){H(a.src,c=l[0].image_path)||s(a,"src",c),s(a,"alt",g=l[0].name),s(n,"class","square-image"),s(h,"class","name"),s(u,"class","position"),s(o,"class","details"),s(e,"target","_blank"),s(e,"href",I="https://twitter.com/"+l[0].twitter),s(e,"rel","noreferrer")},m(r,t){K(r,e,t),i(e,n),i(n,a),i(e,V),i(e,o),i(o,h),i(h,E),i(o,b),i(o,u),i(u,D)},p(r,[t]){t&1&&!H(a.src,c=r[0].image_path)&&s(a,"src",c),t&1&&g!==(g=r[0].name)&&s(a,"alt",g),t&1&&m!==(m=r[0].name+"")&&M(E,m),t&1&&v!==(v=r[0].position+"")&&M(D,v),t&1&&I!==(I="https://twitter.com/"+r[0].twitter)&&s(e,"href",I)},i:z,o:z,d(r){r&&f(e)}}}function N(l,e,n){let{author:a}=e;return l.$$set=c=>{"author"in c&&n(0,a=c.author)},[a]}class P extends B{constructor(e){super();F(this,e,N,L,J,{author:0})}}export{P as A};
