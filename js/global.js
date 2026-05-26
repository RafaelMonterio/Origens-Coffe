/* ═══════════════════════════════════════════
   ORIGENS — Global JS v2
═══════════════════════════════════════════ */

// ── Cursor ────────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e=>{
  mx=e.clientX; my=e.clientY;
  if(cursor){cursor.style.left=mx+'px';cursor.style.top=my+'px';}
});
(function animRing(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';}
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,[data-hover]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
});

// ── Navbar scroll ─────────────────────────
const navbar=document.querySelector('.navbar');
if(navbar){
  const onScroll=()=>{
    if(window.scrollY>40){navbar.classList.add('scrolled');navbar.classList.remove('transparent');}
    else{navbar.classList.remove('scrolled');if(navbar.dataset.transparent==='true')navbar.classList.add('transparent');}
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
}

// ── Scroll reveal ─────────────────────────
const revealAll=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});
},{threshold:.08,rootMargin:'0px 0px -50px 0px'});
revealAll.forEach(el=>revealObs.observe(el));

// ── Active nav link ───────────────────────
const currentPage=window.location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.nav-links a').forEach(a=>{
  const href=a.getAttribute('href');
  if(href&&(href===currentPage||href.includes(currentPage)))a.classList.add('active');
});

// ── Modal helpers ─────────────────────────
function openModal(id){
  const el=document.getElementById(id); if(!el)return;
  el.classList.add('open'); document.body.style.overflow='hidden';
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('visible')));
}
function closeModal(id){
  const el=document.getElementById(id); if(!el)return;
  el.classList.remove('visible');
  setTimeout(()=>{el.classList.remove('open');document.body.style.overflow='';},450);
}
function switchModal(from,to){closeModal(from);setTimeout(()=>openModal(to),300);}
window.openModal=openModal; window.closeModal=closeModal; window.switchModal=switchModal;
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));
    closeCart();
  }
});

// ── Cart ──────────────────────────────────
let cartItems=JSON.parse(localStorage.getItem('origens_cart')||'[]');
function saveCart(){localStorage.setItem('origens_cart',JSON.stringify(cartItems));}
function openCart(){document.getElementById('cart-panel')?.classList.add('open');}
function closeCart(){document.getElementById('cart-panel')?.classList.remove('open');}
window.openCart=openCart; window.closeCart=closeCart;

function addToCart(name,price,origin){
  cartItems.push({name,price,origin:origin||''});
  saveCart(); renderCart(); openCart();
  showToast(name+' adicionado ao carrinho');
}
window.addToCart=addToCart;

function removeFromCart(idx){cartItems.splice(idx,1);saveCart();renderCart();}
window.removeFromCart=removeFromCart;

function renderCart(){
  const list=document.getElementById('cart-items-list');
  const total=document.getElementById('cart-total-val');
  const badge=document.getElementById('cart-badge');
  const navBtn=document.getElementById('cart-nav-btn');

  if(badge)badge.textContent=cartItems.length;
  // Atualiza o badge numérico no ícone do carrinho
  const iconBadge=document.getElementById('cart-icon-badge');
  if(iconBadge){
    iconBadge.textContent=cartItems.length;
    iconBadge.style.display=cartItems.length>0?'flex':'none';
  }
  if(navBtn)navBtn.title=`Carrinho (${cartItems.length})`;

  if(!list)return;
  if(cartItems.length===0){
    list.innerHTML='<p style="font-size:.75rem;color:var(--gray-600);text-align:center;margin-top:3rem;letter-spacing:.08em">Seu carrinho está vazio.</p>';
    if(total)total.textContent='R$ 0'; return;
  }
  list.innerHTML=cartItems.map((item,i)=>`
    <div class="cart-item">
      <div class="cart-item-thumb"></div>
      <div style="flex:1">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-sub">${item.origin||'250g · Grão inteiro'}</div>
        <div class="cart-item-price">${item.price}</div>
      </div>
      <button onclick="removeFromCart(${i})" style="background:none;border:none;font-size:.65rem;letter-spacing:.1em;color:var(--gray-400);align-self:flex-start;transition:color .2s" onmouseenter="this.style.color='var(--black)'" onmouseleave="this.style.color='var(--gray-400)'">✕</button>
    </div>
  `).join('');
  const sum=cartItems.reduce((s,it)=>s+parseInt(it.price.replace(/\D/g,'')),0);
  if(total)total.textContent='R$ '+sum.toLocaleString('pt-BR');
}

// ── Toast ─────────────────────────────────
function showToast(msg,dur=2800){
  let t=document.getElementById('global-toast');
  if(!t){t=document.createElement('div');t.id='global-toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),dur);
}
window.showToast=showToast;

// ── Mini Loading (tela de carregamento reutilizável) ─
const MINI_STAGES=[
  {id:'mst0',label:'colheita'},
  {id:'mst1',label:'torra'},
  {id:'mst2',label:'moagem'},
  {id:'mst3',label:'pacote pronto'},
  {id:'mst4',label:'café pronto'},
];
let miniCur=0, miniInterval=null;

function injectMiniLoading(){
  if(document.getElementById('mini-loading'))return;
  const el=document.createElement('div');
  el.id='mini-loading';
  el.className='';
  el.style.cssText='position:fixed;inset:0;z-index:9100;background:rgba(248,245,240,.97);display:none;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .35s;';
  el.innerHTML=`
  <div class="mini-loading-inner" style="background:#fffef9;border-radius:48px;box-shadow:0 12px 28px rgba(0,0,0,.04);padding:2.5rem 2rem 2rem;display:flex;flex-direction:column;align-items:center;gap:0;width:340px;">
    <div class="mini-loading-msg" id="mini-msg" style="font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;color:#6b3a1f;margin-bottom:1.2rem;font-weight:500;">processando</div>
    <div style="width:220px;height:220px;position:relative;display:flex;align-items:center;justify-content:center;">
      <!-- COLHEITA -->
      <div class="mstage" id="mst0" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .55s cubic-bezier(.2,.9,.4,1.1);pointer-events:none;">
        <svg width="200" height="200" viewBox="0 0 200 200" overflow="visible">
          <rect x="97" y="45" width="6" height="70" rx="3" fill="#2d5a1b"/>
          <g style="animation:sway 2s ease-in-out infinite;transform-origin:100px 110px">
            <ellipse cx="68" cy="82" rx="20" ry="9" fill="#4a9a30" transform="rotate(-22,68,82)"/>
            <ellipse cx="134" cy="78" rx="20" ry="9" fill="#4a9a30" transform="rotate(22,134,78)"/>
          </g>
          <ellipse cx="94" cy="110" rx="7" ry="5" fill="#c0392b" style="animation:berryPlant 2.4s ease-in-out infinite"/>
          <g style="animation:handMotion 2.4s ease-in-out infinite;transform-origin:152px 152px">
            <path d="M152 152 Q146 140 140 130" fill="none" stroke="#c8956c" stroke-width="5" stroke-linecap="round"/>
            <ellipse cx="137" cy="127" rx="5" ry="7" fill="#c8956c" transform="rotate(-30,137,127)"/>
          </g>
        </svg>
      </div>
      <!-- TORRA -->
      <div class="mstage" id="mst1" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .55s cubic-bezier(.2,.9,.4,1.1);pointer-events:none;">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <rect x="32" y="90" width="136" height="68" rx="6" fill="#2a1a0c"/>
          <rect x="62" y="62" width="76" height="28" rx="4" fill="#2a1a0c"/>
          <g style="animation:flicker .65s ease-in-out infinite;transform-origin:100px 80px">
            <ellipse cx="100" cy="72" rx="7" ry="11" fill="#e74c3c" opacity=".9"/>
            <ellipse cx="100" cy="64" rx="5" ry="7" fill="#e67e22"/>
          </g>
          <ellipse cx="66" cy="118" rx="8" ry="5.5" fill="#c0392b" style="animation:roastBean 1.6s ease-in-out infinite"/>
          <ellipse cx="100" cy="116" rx="8" ry="5.5" fill="#c0392b" style="animation:roastBean 1.6s ease-in-out infinite .5s"/>
          <ellipse cx="134" cy="118" rx="7" ry="5" fill="#c0392b" style="animation:roastBean 1.6s ease-in-out infinite 1s"/>
          <path d="M100 46 Q102 28 100 18" fill="none" stroke="#bbb" stroke-width="1.2" stroke-dasharray="3 3" opacity=".4" style="animation:rise 1.6s ease-out infinite .55s"/>
        </svg>
      </div>
      <!-- MOAGEM -->
      <div class="mstage" id="mst2" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .55s cubic-bezier(.2,.9,.4,1.1);pointer-events:none;">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <rect x="68" y="75" width="64" height="58" rx="6" fill="none" stroke="#4a2700" stroke-width="1.5"/>
          <rect x="60" y="62" width="80" height="18" rx="5" fill="#2d1500"/>
          <ellipse cx="100" cy="58" rx="7" ry="5" fill="#8B4513" style="animation:beanDrop 1.5s ease-in infinite"/>
          <g style="animation:grindSpin .8s linear infinite;transform-origin:100px 104px">
            <circle cx="100" cy="104" r="20" fill="none" stroke="#4a2700" stroke-width="3"/>
            <line x1="100" y1="84" x2="100" y2="94" stroke="#4a2700" stroke-width="2.5"/>
            <line x1="120" y1="104" x2="110" y2="104" stroke="#4a2700" stroke-width="2.5"/>
            <line x1="100" y1="124" x2="100" y2="114" stroke="#4a2700" stroke-width="2.5"/>
            <line x1="80" y1="104" x2="90" y2="104" stroke="#4a2700" stroke-width="2.5"/>
          </g>
          <circle cx="100" cy="104" r="6" fill="#6B3A1F"/>
          <circle cx="100" cy="150" r="2.2" fill="#2d1500" style="animation:powderFall 1.1s ease-out infinite"/>
        </svg>
      </div>
      <!-- PACOTE -->
      <div class="mstage" id="mst3" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .55s cubic-bezier(.2,.9,.4,1.1);pointer-events:none;">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs><linearGradient id="mlbF" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c9995a"/><stop offset="50%" stop-color="#e8c48a"/><stop offset="100%" stop-color="#c9995a"/></linearGradient></defs>
          <polygon points="148,52 164,62 160,160 148,158" fill="#8b6030"/>
          <rect x="52" y="52" width="96" height="106" rx="5" fill="url(#mlbF)"/>
          <rect x="62" y="68" width="76" height="70" rx="4" fill="rgba(253,246,232,.9)" stroke="#c9995a" stroke-width="1"/>
          <text x="100" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="14" font-weight="bold" fill="#3d1f00" letter-spacing="2">Origens</text>
        </svg>
      </div>
      <!-- XÍCARA -->
      <div class="mstage" id="mst4" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .55s cubic-bezier(.2,.9,.4,1.1);pointer-events:none;">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <path d="M66 68 Q62 106 66 136 Q78 152 100 152 Q122 152 134 136 Q138 106 134 68 Z" fill="white" stroke="#d0c0b0" stroke-width="1.5"/>
          <path d="M68 84 Q68 110 72 128 Q82 148 100 148 Q118 148 128 128 Q132 110 132 84" fill="#3d1f00" opacity=".9" style="animation:fillCup .9s ease-out forwards;transform-origin:100px 148px"/>
          <path d="M134 88 Q152 84 150 100 Q148 114 134 110" fill="none" stroke="#d0c0b0" stroke-width="1.5"/>
          <path d="M100 42 Q102 26 100 14" fill="none" stroke="#bbb" stroke-width="1.2" stroke-dasharray="4 3" opacity=".5" style="animation:steam 1.3s ease-out infinite .45s"/>
        </svg>
      </div>
    </div>
    <div style="font-size:11px;font-weight:500;color:#9b7b5c;letter-spacing:.12em;text-transform:uppercase;margin-top:1.2rem;background:#f3ede3;padding:.3rem 1rem;border-radius:40px;" id="mini-stage-lbl">processando</div>
    <div style="display:flex;gap:10px;margin-top:1.2rem;" id="mini-dots"></div>
    <div style="width:180px;height:2px;background:#e2d4c2;border-radius:2px;margin-top:1rem;overflow:hidden;"><div style="height:100%;background:#6B3A1F;border-radius:2px;width:0%;transition:width .5s ease;" id="mini-pbar"></div></div>
  </div>
  `;

  // keyframes inline para o mini-loading (caso não haja CSS global disponível)
  const style=document.createElement('style');
  style.textContent=`
    @keyframes sway{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
    @keyframes flicker{0%,100%{transform:scaleY(1) scaleX(1)}40%{transform:scaleY(1.25) scaleX(.82)}70%{transform:scaleY(.88) scaleX(1.12)}}
    @keyframes rise{0%{transform:translateY(0);opacity:.6}100%{transform:translateY(-34px);opacity:0}}
    @keyframes beanDrop{0%{transform:translateY(-52px);opacity:0}18%{opacity:1}55%{transform:translateY(8px);opacity:1}80%,100%{transform:translateY(8px);opacity:0}}
    @keyframes powderFall{0%{opacity:0;transform:translateY(0)}12%{opacity:.95}75%{opacity:.7;transform:translateY(30px)}100%{opacity:0;transform:translateY(38px)}}
    @keyframes grindSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes fillCup{from{transform:scaleY(0)}to{transform:scaleY(1)}}
    @keyframes steam{0%{transform:translateY(0);opacity:.6}100%{transform:translateY(-32px);opacity:0}}
    @keyframes roastBean{0%{fill:#c0392b}65%,100%{fill:#2d1500}}
    @keyframes berryPlant{0%,20%{opacity:1}28%,100%{opacity:0}}
    @keyframes handMotion{0%{transform:translate(0,0) rotate(0deg)}22%{transform:translate(-24px,-30px) rotate(-20deg)}42%{transform:translate(-24px,-30px) rotate(-20deg)}100%{transform:translate(0,0) rotate(0deg)}}
  `;
  document.head.appendChild(style);
  document.body.appendChild(el);

  // dots
  const dotsEl=document.getElementById('mini-dots');
  MINI_STAGES.forEach((_,i)=>{
    const d=document.createElement('div');
    d.style.cssText=`width:6px;height:6px;border-radius:50%;background:${i===0?'#6B3A1F':'#e2d4c2'};transition:background .3s,transform .25s ease;${i===0?'transform:scale(1.35);box-shadow:0 0 0 2px #f0e4d4':''}`;
    d.id='mdot'+i; dotsEl.appendChild(d);
  });
}

function miniGoStage(idx){
  MINI_STAGES.forEach((s,i)=>{
    const el=document.getElementById(s.id);
    if(el)el.style.opacity=i===idx?'1':'0';
    const d=document.getElementById('mdot'+i);
    if(d){
      d.style.background=i===idx?'#6B3A1F':'#e2d4c2';
      d.style.transform=i===idx?'scale(1.35)':'scale(1)';
    }
  });
  const lbl=document.getElementById('mini-stage-lbl');
  if(lbl)lbl.textContent=MINI_STAGES[idx].label;
  const pbar=document.getElementById('mini-pbar');
  if(pbar)pbar.style.width=(idx/(MINI_STAGES.length-1)*100)+'%';
  miniCur=idx;
}

function showMiniLoading(msg){
  injectMiniLoading();
  const el=document.getElementById('mini-loading');
  const msgEl=document.getElementById('mini-msg');
  if(msgEl)msgEl.textContent=msg||'processando';
  el.style.display='flex';
  requestAnimationFrame(()=>{ el.style.opacity='1'; });
  miniCur=0; miniGoStage(0);
  miniInterval=setInterval(()=>{ miniGoStage((miniCur+1)%MINI_STAGES.length); },2200);
}

function hideMiniLoading(){
  const el=document.getElementById('mini-loading');
  if(!el)return;
  el.style.opacity='0';
  setTimeout(()=>{ el.style.display='none'; },350);
  if(miniInterval){clearInterval(miniInterval);miniInterval=null;}
}

window.showMiniLoading=showMiniLoading;
window.hideMiniLoading=hideMiniLoading;

// ── Auth ──────────────────────────────────
function getUser(){try{return JSON.parse(localStorage.getItem('origens_user')||'null');}catch{return null;}}
function setUser(u){localStorage.setItem('origens_user',JSON.stringify(u));}
function logout(){localStorage.removeItem('origens_user');window.location.href=getBasePath()+'index.html';}
window.getUser=getUser; window.setUser=setUser; window.logout=logout;

function getBasePath(){
  const p=window.location.pathname;
  return p.includes('/pages/')?'../':'';
}

function renderNavAuth(){
  const user=getUser();
  const actionsEl=document.getElementById('nav-auth-actions');
  if(!actionsEl)return;
  const base=getBasePath();

  if(user){
    actionsEl.innerHTML=`
      <div style="position:relative">
        <button id="cart-nav-btn" onclick="openCart()" title="Carrinho" style="background:none;border:none;color:var(--black);display:flex;align-items:center;justify-content:center;position:relative;padding:.3rem .5rem;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span id="cart-icon-badge" style="display:none;position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:var(--brown-mid);color:#fff;font-size:.55rem;font-weight:600;align-items:center;justify-content:center;">0</span>
        </button>
      </div>
      <div style="position:relative" id="user-menu-wrap">
        <button class="btn btn-dark btn-sm" onclick="toggleUserMenu()" style="display:flex;align-items:center;gap:.5rem">
          <span style="width:18px;height:18px;border-radius:50%;background:var(--brown-mid);display:inline-flex;align-items:center;justify-content:center;font-size:.55rem;color:#fff">${(user.name||'U')[0].toUpperCase()}</span>
          ${user.name?user.name.split(' ')[0]:'Conta'}
        </button>
        <div id="user-menu" style="display:none;position:absolute;top:calc(100% + .5rem);right:0;background:var(--white);border:1px solid var(--gray-200);min-width:180px;box-shadow:0 8px 32px rgba(59,31,8,.1);z-index:600">
          <a href="${base}pages/perfil.html" style="display:block;padding:.75rem 1.2rem;font-size:.72rem;color:var(--gray-600);border-bottom:1px solid var(--gray-100);transition:color .2s" onmouseenter="this.style.color='var(--black)'" onmouseleave="this.style.color='var(--gray-600)'">Meu Perfil</a>
          <a href="${base}pages/rastreamento.html" style="display:block;padding:.75rem 1.2rem;font-size:.72rem;color:var(--gray-600);border-bottom:1px solid var(--gray-100);transition:color .2s" onmouseenter="this.style.color='var(--black)'" onmouseleave="this.style.color='var(--gray-600)'">Meus Pedidos</a>
          <button onclick="logout()" style="display:block;width:100%;text-align:left;padding:.75rem 1.2rem;font-size:.72rem;color:var(--gray-600);background:none;border:none;transition:color .2s" onmouseenter="this.style.color='var(--black)'" onmouseleave="this.style.color='var(--gray-600)'">Sair</button>
        </div>
      </div>
    `;
    renderCart();
  } else {
    actionsEl.innerHTML=`
      <button class="btn btn-outline-white btn-sm" onclick="openModal('login-modal')">Entrar</button>
      <button class="btn btn-dark btn-sm" onclick="openModal('cadastro-modal')">Criar conta</button>
    `;
  }
}

function toggleUserMenu(){
  const m=document.getElementById('user-menu');
  if(m)m.style.display=m.style.display==='none'?'block':'none';
}
window.toggleUserMenu=toggleUserMenu;
document.addEventListener('click',e=>{
  const wrap=document.getElementById('user-menu-wrap');
  if(wrap&&!wrap.contains(e.target)){const m=document.getElementById('user-menu');if(m)m.style.display='none';}
});

// ── Login / Cadastro ──────────────────────
function doLogin(e){
  e.preventDefault();
  const email=document.getElementById('login-email')?.value.trim();
  const pass=document.getElementById('login-pass')?.value.trim();
  if(!email||!pass){showToast('Preencha todos os campos');return;}
  showMiniLoading('verificando acesso');
  setTimeout(()=>{
    hideMiniLoading();
    const stored=JSON.parse(localStorage.getItem('origens_users')||'[]');
    const found=stored.find(u=>u.email===email&&u.pass===pass);
    if(!found){showToast('E-mail ou senha incorretos');return;}
    setUser({name:found.name,email:found.email});
    closeModal('login-modal');
    showToast('Bem-vindo de volta, '+found.name.split(' ')[0]+'!');
    renderNavAuth();
    // atualiza hero se existir
    if(typeof updateHeroForLoggedUser==='function')updateHeroForLoggedUser();
  },3500);
}
window.doLogin=doLogin;

function doCadastro(e){
  e.preventDefault();
  const name=document.getElementById('cad-name')?.value.trim();
  const email=document.getElementById('cad-email')?.value.trim();
  const pass=document.getElementById('cad-pass')?.value.trim();
  const pass2=document.getElementById('cad-pass2')?.value.trim();
  if(!name||!email||!pass){showToast('Preencha todos os campos');return;}
  if(pass!==pass2){showToast('As senhas não coincidem');return;}
  showMiniLoading('criando sua conta');
  setTimeout(()=>{
    hideMiniLoading();
    const users=JSON.parse(localStorage.getItem('origens_users')||'[]');
    if(users.find(u=>u.email===email)){showToast('E-mail já cadastrado');return;}
    users.push({name,email,pass});
    localStorage.setItem('origens_users',JSON.stringify(users));
    setUser({name,email});
    closeModal('cadastro-modal');
    showToast('Conta criada! Bem-vindo, '+name.split(' ')[0]+'!');
    renderNavAuth();
    if(typeof updateHeroForLoggedUser==='function')updateHeroForLoggedUser();
  },3500);
}
window.doCadastro=doCadastro;

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  renderNavAuth();
  renderCart();
});
