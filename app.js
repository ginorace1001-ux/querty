// Simple frontend logic: products, cart, account (localStorage-based)
const products = [
  {id: 'p1', title: 'Mini Castle', desc: 'Castello fantasy in miniatura - pronto per stampa 3D', price: 9.9},
  {id: 'p2', title: 'Modular Gear', desc: 'Ingranaggio modulare, ottimo per prototipi meccanici', price: 6.5},
  {id: 'p3', title: 'Elegant Vase', desc: 'Vaso decorativo con pattern parametrico', price: 8.75},
  {id: 'p4', title: 'Phone Stand', desc: 'Supporto per smartphone, leggero e resistente', price: 5.0}
];

function q(selector) { return document.querySelector(selector) }
function qa(selector) { return [...document.querySelectorAll(selector)] }

const productsEl = q('#products');
const cartCountEl = q('#cart-count');
const cartTotalEl = q('#cart-total');
const cartItemsEl = q('#cart-items');
const cartDrawer = q('#cart-drawer');
const accountDrawer = q('#account-drawer');
const productModal = q('#product-modal');

let cart = JSON.parse(localStorage.getItem('querky_cart') || '[]');
let users = JSON.parse(localStorage.getItem('querky_users') || '{}');
let currentUser = localStorage.getItem('querky_current') || null;

// Render products
function renderProducts(){
  productsEl.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="mini-cube" data-id="${p.id}">
        <div class="cube" style="width:80px;height:80px;animation:spin 6s linear infinite">
          <div class="face f1"></div>
          <div class="face f2"></div>
          <div class="face f3"></div>
          <div class="face f4"></div>
          <div class="face f5"></div>
          <div class="face f6"></div>
        </div>
      </div>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      <div class="price">€${p.price.toFixed(2)}</div>
      <button data-id="${p.id}" class="view-btn">Vedi</button>
    `;
    productsEl.appendChild(card);
  });
  qa('.view-btn').forEach(b=>{
    b.addEventListener('click', ()=> openProductModal(b.dataset.id));
  });
  qa('.mini-cube').forEach(c=>{
    c.addEventListener('click', ()=> openProductModal(c.dataset.id));
  });
}

// Cart functions
function saveCart(){ localStorage.setItem('querky_cart', JSON.stringify(cart)); }
function updateCartUI(){
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  cart.forEach(item=>{
    const el = document.createElement('div'); el.className='cart-item';
    el.innerHTML = `<div class="thumb"></div>
      <div class="meta"><strong>${item.title}</strong><div>€${(item.price).toFixed(2)}</div></div>
      <div><input type="number" min="1" value="${item.qty}" style="width:60px" data-id="${item.id}" class="qty"></div>
      <button data-id="${item.id}" class="remove">✕</button>`;
    cartItemsEl.appendChild(el);
  });
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartTotalEl.textContent = total.toFixed(2);
  qa('.remove').forEach(b=> b.addEventListener('click', e=>{ removeFromCart(b.dataset.id) }));
  qa('.qty').forEach(inp=> inp.addEventListener('change', e=>{
    const id = inp.dataset.id; const v = parseInt(inp.value)||1;
    const it = cart.find(x=>x.id===id); if(it){ it.qty = v; saveCart(); updateCartUI(); }
  }));
}

function addToCart(prodId, qty=1){
  const p = products.find(x=>x.id===prodId);
  if(!p) return;
  const existing = cart.find(x=>x.id===prodId);
  if(existing) existing.qty += qty; else cart.push({...p, qty});
  saveCart(); updateCartUI(); animateCartAdd();
}

function removeFromCart(id){
  cart = cart.filter(x=>x.id!==id); saveCart(); updateCartUI();
}

function animateCartAdd(){
  cartCountEl.classList.add('pulse');
  setTimeout(()=>cartCountEl.classList.remove('pulse'),600);
}

// Drawer toggles
q('#open-cart').addEventListener('click', ()=>{ cartDrawer.classList.toggle('open') });
q('#open-account').addEventListener('click', ()=>{ accountDrawer.classList.toggle('open'); showAccountState(); });
q('#open-products').addEventListener('click', ()=>{ document.getElementById('products-section').scrollIntoView({behavior:'smooth'}) });
qa('[data-close]').forEach(b=> b.addEventListener('click', ()=> {
  const target = q('#'+b.dataset.close);
  if(target) target.classList.remove('open');
}));

// product modal
function openProductModal(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  q('#modal-title').textContent = p.title;
  q('#modal-desc').textContent = p.desc;
  q('#modal-price').textContent = p.price.toFixed(2);
  q('#add-to-cart').dataset.id = p.id;
  q('#buy-now').dataset.id = p.id;
  productModal.classList.add('show');
}
q('#modal-close').addEventListener('click', ()=> productModal.classList.remove('show'));
q('#add-to-cart').addEventListener('click', e=>{ addToCart(e.target.dataset.id, 1); productModal.classList.remove('show') });
q('#buy-now').addEventListener('click', e=>{ alert('Simulazione checkout per ' + e.target.dataset.id); productModal.classList.remove('show') });

// account & auth (very simple, localStorage)
function showAccountState(){
  const info = q('#account-info');
  const signup = q('#signup-form');
  const login = q('#login-form');
  if(currentUser){
    signup.hidden = true; login.hidden = true;
    info.hidden = false;
    q('#account-name').textContent = users[currentUser].name;
  } else {
    signup.hidden = false; login.hidden = false; info.hidden = true;
  }
}

q('#signup-form').addEventListener('submit', e=>{
  e.preventDefault();
  const name = q('#su-name').value.trim();
  const email = q('#su-email').value.trim().toLowerCase();
  const pass = q('#su-pass').value;
  if(!name || !email || !pass) return alert('Compila tutti i campi');
  if(users[email]) return alert('Email già registrata');
  users[email] = {name, pass};
  localStorage.setItem('querky_users', JSON.stringify(users));
  currentUser = email;
  localStorage.setItem('querky_current', currentUser);
  showAccountState();
  alert('Account creato!');
});

q('#login-form').addEventListener('submit', e=>{
  e.preventDefault();
  const email = q('#li-email').value.trim().toLowerCase();
  const pass = q('#li-pass').value;
  if(users[email] && users[email].pass === pass){
    currentUser = email; localStorage.setItem('querky_current', currentUser);
    showAccountState(); alert('Accesso effettuato');
  } else alert('Credenziali non valide');
});

q('#logout-btn').addEventListener('click', ()=>{
  currentUser = null; localStorage.removeItem('querky_current'); showAccountState();
});

// initial
renderProducts();
updateCartUI();
showAccountState();

// small helpers
q('#shop-now').addEventListener('click', ()=> document.getElementById('products-section').scrollIntoView({behavior:'smooth'}));
