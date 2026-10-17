/* Redline Community front-end demo.
   Posts, likes, comments, saves and joined groups persist in this browser only.
   This is not multi-user authentication or a production backend. */
const CONFIG = window.SITE_CONFIG || { businessName: "Redline Outdoor & Power", whatsappNumber: "" };
const CATALOGUE = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = {
  name: localStorage.getItem("redlineCommunityName") || "Guest Visitor",
  posts: JSON.parse(localStorage.getItem("redlineCommunityPosts") || "null"),
  likes: JSON.parse(localStorage.getItem("redlineCommunityLikes") || "{}"),
  saved: JSON.parse(localStorage.getItem("redlineCommunitySaved") || "[]"),
  joined: JSON.parse(localStorage.getItem("redlineCommunityJoined") || "[]"),
  view: "home",
  uploadData: null
};
const seededPosts = [
 {id:"seed-1",author:"Redline Outdoor & Power",initial:"R",time:"Business update · 2 days ago",text:"Planning your next outdoor getaway? Explore our range of camping tents, folding chairs, travel bags and portable power products. Browse the catalogue below and contact us to confirm the model, specifications, current price and availability.",image:"assets/images/photo-012.jpg",likes:8,comments:[{name:"Community team",text:"Tell us what kind of trip you're planning and we can help you find the right product to enquire about."}],business:true},
 {id:"seed-2",author:"Redline Outdoor & Power",initial:"R",time:"Product spotlight · 4 days ago",text:"POWER ON THE GO ⚡ Take a look at the portable power and solar products in our supplied catalogue. Exact capacity, compatibility, warranty and included accessories can vary by model, so please ask us to confirm the details before ordering.",image:"assets/images/photo-001.jpg",likes:5,comments:[],business:true},
 {id:"seed-3",author:"Redline Outdoor & Power",initial:"R",time:"Outdoor inspiration · 1 week ago",text:"A little preparation makes a weekend outdoors more comfortable. Check your shelter, seating, lighting and charging needs before you leave. What is the one item you never forget to pack?",image:"assets/images/photo-003.jpg",likes:12,comments:[{name:"Outdoor fan",text:"A comfortable chair and a charged power bank!"}],business:true}
];
if (!Array.isArray(state.posts)) state.posts = seededPosts;
function persist(){
 localStorage.setItem("redlineCommunityName",state.name);
 localStorage.setItem("redlineCommunityPosts",JSON.stringify(state.posts));
 localStorage.setItem("redlineCommunityLikes",JSON.stringify(state.likes));
 localStorage.setItem("redlineCommunitySaved",JSON.stringify(state.saved));
 localStorage.setItem("redlineCommunityJoined",JSON.stringify(state.joined));
}
function toast(message){
 const el=$("#toast"); el.textContent=message; el.classList.add("show");
 clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600);
}
function initials(name){return (name||"G").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"G"}
function updateProfile(){
 $("#sideUserName").textContent=state.name;
 $("#composerAvatar").textContent=initials(state.name);
 $("#profileBtn").textContent=initials(state.name);
 $("#openComposer").textContent=`What's on your mind, ${state.name}?`;
}
function safe(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderPosts(){
 let list=[...state.posts];
 const q=$("#searchInput").value.trim().toLowerCase();
 if(state.view==="saved") list=list.filter(p=>state.saved.includes(p.id));
 if(state.view==="videos") list=list.filter(p=>p.video || /video|clip/i.test(p.text));
 if(state.view==="friends") list=list.filter(p=>!p.business);
 if(state.view==="groups") list=list.filter(p=>p.group || /group|camping|outdoor/i.test(p.text));
 if(state.view==="marketplace") list=list.filter(p=>p.business || p.product);
 if(q) list=list.filter(p=>[p.author,p.text,p.product||"",...(p.comments||[]).map(c=>c.text)].join(" ").toLowerCase().includes(q));
 if($("#sortSelect").value==="popular") list.sort((a,b)=>(b.likes||0)-(a.likes||0));
 $("#feedPosts").innerHTML=list.map(p=>{
  const liked=!!state.likes[p.id];
  const comments=p.comments||[];
  const image=p.image?`<img class="post-image" src="${safe(p.image)}" alt="Photo shared in the community" loading="lazy" onerror="this.style.display='none'">`:"";
  return `<article class="post-card" data-id="${safe(p.id)}">
   <div class="post-header"><span class="post-avatar">${safe(p.initial||initials(p.author))}</span><div class="post-author"><b>${safe(p.author)} ${p.business?'<span style="color:#c71928;font-size:9px">✓</span>':""}</b><small>${safe(p.time||"Just now")} · ◉</small></div><button class="post-menu" data-postmenu="${safe(p.id)}" aria-label="Post options">•••</button></div>
   <div class="post-text">${safe(p.text)}</div>${image}
   <div class="post-stats"><span>👍 ${Number(p.likes||0)+(liked?1:0)} reactions</span><span>${comments.length} comments</span></div>
   <div class="post-actions"><button class="${liked?'liked':''}" data-like="${safe(p.id)}">${liked?'👍 Liked':'♡ Like'}</button><button data-comment="${safe(p.id)}">▢ Comment</button><button data-share="${safe(p.id)}">↗ Share</button><button data-save="${safe(p.id)}">${state.saved.includes(p.id)?'▣ Saved':'▢ Save'}</button></div>
   <div class="comments">${comments.map(c=>`<div class="comment"><b>${safe(c.name)}</b>${safe(c.text)}</div>`).join("")}
   <form class="comment-form" data-commentform="${safe(p.id)}"><input name="comment" placeholder="Write a comment..." maxlength="500" aria-label="Write a comment" required><button type="submit">Post</button></form></div>
  </article>`;
 }).join("");
 $("#feedLabel").textContent=({home:"Latest updates",friends:"Friends' posts",videos:"Videos",groups:"Group conversations",marketplace:"Product updates",saved:"Saved posts",events:"Outdoor events"})[state.view]||"Latest updates";
 $(".end-feed").hidden=list.length===0;
 if(!list.length) $("#feedPosts").innerHTML='<div class="post-card" style="padding:28px;text-align:center"><b>No posts found</b><p style="font-size:11px;color:#72777c">Try another search or switch to the home feed.</p><button class="btn-primary" data-view="home">Back to feed</button></div>';
}
function renderProducts(){
 const q=$("#productSearch").value.trim().toLowerCase();
 const items=CATALOGUE.filter(p=>[p.name,p.category,p.description].join(" ").toLowerCase().includes(q)).slice(0,32);
 $("#productGrid").innerHTML=items.map(p=>{
  const n=Array.isArray(p.images)&&p.images.length?p.images[0]:1;
  const src=`assets/images/photo-${String(n).padStart(3,"0")}.jpg`;
  return `<article class="product-card"><img src="${src}" alt="${safe(p.name)}" loading="lazy" onerror="this.src='assets/images/photo-001.jpg'"><div class="product-info"><small>${safe(p.category||"Outdoor gear")}</small><h3>${safe(p.name)}</h3><p>${safe(p.description||"Contact the business to confirm product details.")}</p><button class="btn-primary" data-product="${safe(p.name)}">Enquire on WhatsApp ↗</button></div></article>`;
 }).join("");
}
function showView(view){
 state.view=view;
 $$(".nav-btn,.side-link,.mobile-tabs button").forEach(b=>b.classList.toggle("selected",b.dataset.view===view));
 const headings={home:["Community feed","Product updates, outdoor ideas and conversations."],friends:["Friends","Posts shared by community members."],videos:["Videos","Video posts will appear here when added."],groups:["Groups","Find people who share your outdoor interests."],marketplace:["Marketplace","Explore products and business updates."],saved:["Saved posts","Posts you have saved in this browser."],events:["Outdoor events","Community events and outdoor inspiration."]};
 const h=headings[view]||headings.home;
 $(".view-heading h1").textContent=h[0]; $(".view-heading p").textContent=h[1];
 renderPosts();
 if(view==="marketplace") $("#shop").scrollIntoView({behavior:"smooth"});
 else window.scrollTo({top:0,behavior:"smooth"});
}
function openComposer(){
 $("#composerExpanded").hidden=false;
 $("#postText").focus();
}
function publish(){
 const text=$("#postText").value.trim();
 if(!text && !state.uploadData){toast("Add some text or choose a photo first.");return}
 const post={id:"user-"+Date.now(),author:state.name,initial:initials(state.name),time:"Just now",text:text||"Shared a photo with the community.",image:state.uploadData,likes:0,comments:[],business:false};
 state.posts.unshift(post);persist();state.uploadData=null;$("#postImage").value="";$("#uploadName").textContent="No photo selected";$("#postText").value="";$("#composerExpanded").hidden=true;showView("home");toast("Your post was added to this browser.");
}
function openWhatsApp(message){
 const num=(CONFIG.whatsappNumber||"").replace(/\D/g,"");
 if(!num){toast("WhatsApp number is not configured in site-config.js.");return}
 window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
}
document.addEventListener("click",e=>{
 const view=e.target.closest("[data-view]"); if(view){showView(view.dataset.view);return}
 const like=e.target.closest("[data-like]"); if(like){const id=like.dataset.like;state.likes[id]=!state.likes[id];persist();renderPosts();return}
 const save=e.target.closest("[data-save]");if(save){const id=save.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist();renderPosts();toast(state.saved.includes(id)?"Post saved.":"Post removed from saved.");return}
 const comment=e.target.closest("[data-comment]");if(comment){const form=$(`[data-commentform="${CSS.escape(comment.dataset.comment)}"] input`);form?.focus();return}
 const share=e.target.closest("[data-share]");if(share){const p=state.posts.find(x=>x.id===share.dataset.share);const text=`${p?.author||"Redline Community"}: ${p?.text||""}`;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast("Post text copied to clipboard.")).catch(()=>toast(text))}else toast(text);return}
 const product=e.target.closest("[data-product]");if(product){openWhatsApp(`Hello Redline Outdoor & Power, I am interested in ${product.dataset.product}. Please confirm the current model, specifications, price and availability.`);return}
 const join=e.target.closest("[data-join]");if(join){const name=join.dataset.join;state.joined=state.joined.includes(name)?state.joined.filter(x=>x!==name):[...state.joined,name];persist();join.textContent=state.joined.includes(name)?"Joined ✓":"Join group";toast(state.joined.includes(name)?`Joined ${name} in this browser.`:`Left ${name}.`);return}
 if(e.target.closest("#openComposer")||e.target.closest("#createPostBtn")||e.target.closest("#storyCreate")){openComposer();return}
 if(e.target.closest("#addPhoto")){$("#postImage").click();return}
 if(e.target.closest("#feelingBtn")){$("#postText").value += ($("#postText").value?" ":"")+"Feeling ready for an adventure!";openComposer();return}
 if(e.target.closest("#publishPost")){publish();return}
 if(e.target.closest("#profileBtn")||e.target.closest("#leftProfile")){$("#displayName").value=state.name==="Guest Visitor"?"":state.name;$("#modalBackdrop").hidden=false;return}
 if(e.target.closest("#modalClose")){$("#modalBackdrop").hidden=true;return}
 if(e.target.closest("#saveProfile")){const name=$("#displayName").value.trim();if(name)state.name=name;persist();updateProfile();$("#modalBackdrop").hidden=true;toast(`Welcome, ${state.name}.`);return}
 if(e.target.closest("#messagesBtn")){toast("Messaging needs a secure backend to support private conversations between different users.");return}
 if(e.target.closest("#notificationsBtn")){toast("You’re all caught up. Notifications will be connected when a backend is added.");return}
 if(e.target.closest("#refreshSuggestions")){toast("These are example community groups. Add your own groups when a backend is connected.");return}
 if(e.target.closest("#mobileMenu")){document.querySelector(".left-sidebar").style.display=document.querySelector(".left-sidebar").style.display==="block"?"none":"block";toast("Use the navigation icons to switch sections.");return}
 if(e.target.closest("#clearFilters")){$("#searchInput").value="";renderPosts();return}
 if(e.target.closest("#contactForm"))return;
 if(e.target.closest("[data-postmenu]")){toast("Post options: save, report, or contact the page administrator. Full moderation requires a backend.");return}
});
document.addEventListener("submit",e=>{
 if(e.target.matches("[data-commentform]")){e.preventDefault();const id=e.target.dataset.commentform;const value=e.target.elements.comment.value.trim();if(!value)return;const post=state.posts.find(p=>p.id===id);if(post){post.comments=post.comments||[];post.comments.push({name:state.name,text:value});persist();renderPosts();toast("Comment added in this browser.");}return}
 if(e.target.id==="searchForm"){e.preventDefault();renderPosts();return}
 if(e.target.id==="contactForm"){e.preventDefault();openWhatsApp(`Hello Redline Outdoor & Power, my name is ${$("#contactName").value.trim()}. ${$("#contactMessage").value.trim()}`);return}
});
$("#postImage").addEventListener("change",e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(!file.type.startsWith("image/")){toast("Please choose an image file.");return}
 if(file.size>4*1024*1024){toast("Please choose an image smaller than 4 MB.");e.target.value="";return}
 const reader=new FileReader();reader.onload=()=>{state.uploadData=reader.result;$("#uploadName").textContent=file.name;openComposer()};reader.readAsDataURL(file);
});
$("#searchInput").addEventListener("input",renderPosts);
$("#sortSelect").addEventListener("change",renderPosts);
$("#productSearch").addEventListener("input",renderProducts);
$("#year").textContent=new Date().getFullYear();
updateProfile();renderPosts();renderProducts();
$$("[data-join]").forEach(b=>{if(state.joined.includes(b.dataset.join))b.textContent="Joined ✓"});
