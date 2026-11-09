import{c as n,u as r,j as a,L as d}from"./index-Ns51gnD6.js";import{s as o}from"./speech-D_k60704.js";import{V as m}from"./volume-2-j6Kmy3lO.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=n("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=n("Star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]);function g({word:e}){const{language:s,learned:i,favorites:l,toggleFavorite:c,toggleLearned:t}=r();return a.jsxs("article",{className:"card word-card",children:[a.jsxs("div",{className:"row spread",children:[a.jsx("span",{className:"badge",children:e.level}),a.jsx("button",{className:"icon-button","aria-label":"Lưu từ "+e.word,"aria-pressed":l.includes(e.id),onClick:()=>c(e.id),children:a.jsx(u,{size:18,fill:l.includes(e.id)?"currentColor":"none"})})]}),a.jsx(d,{to:"/vocabulary/"+e.id,className:"word-title",children:e.word}),a.jsx("p",{className:"pinyin",children:e.pinyin||e.pronunciation_guide}),a.jsx("h3",{children:e.meaning_vi||e.meaning_zh}),a.jsx("p",{className:"word-example",children:s==="zh"?e.example_zh:e.example_vi}),a.jsxs("div",{className:"row spread",children:[a.jsxs("button",{className:"text-button",onClick:()=>o(e.word,s),children:[a.jsx(m,{size:17})," Nghe phát âm"]}),a.jsx("button",{className:"icon-button "+(i.includes(e.id)?"learned":""),"aria-label":"Đánh dấu đã học "+e.word,"aria-pressed":i.includes(e.id),onClick:()=>t(e.id),children:a.jsx(p,{size:18})})]})]})}export{g as W};
