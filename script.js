const MENU_ITEMS = [
  { id:1,  name:'Charred Beetroot Tartare',   cat:'starter', price:185, emoji:'🥗', desc:'Slow-roasted beetroot, goat cheese mousse, walnut praline, aged balsamic.' },
  { id:2,  name:'Smoked Bone Marrow',          cat:'starter', price:220, emoji:'🍖', desc:'Oak-smoked marrow, sourdough toast, chimichurri, micro herbs.' },
  { id:3,  name:'Ember Burrata',               cat:'starter', price:195, emoji:'🧀', desc:'Wood-fired tomatoes, fresh burrata, basil oil, sea salt flakes.' },
  { id:4,  name:'Seared Scallops',             cat:'starter', price:260, emoji:'🐚', desc:'Day-boat scallops, cauliflower purée, crispy capers, brown butter.' },
  { id:5,  name:'Oak-Fired Côte de Boeuf',     cat:'main',    price:680, emoji:'🥩', desc:'1kg dry-aged beef, roasted bone marrow butter, seasonal greens.' },
  { id:6,  name:'Whole Roasted Sea Bass',       cat:'main',    price:420, emoji:'🐟', desc:'Lemon & thyme brine, fennel, olive tapenade, roasted peppers.' },
  { id:7,  name:'Lamb Rack',                   cat:'main',    price:520, emoji:'🍽', desc:'Herb-crusted rack, pomegranate jus, roasted root vegetables.' },
  { id:8,  name:'Wild Mushroom Risotto',        cat:'main',    price:340, emoji:'🍄', desc:'Porcini, truffle oil, aged Parmesan, chive crème fraîche.' },
  { id:9,  name:'Chocolate Fondant',            cat:'dessert', price:145, emoji:'🍫', desc:'Dark 72% Valrhona, salted caramel ice cream, hazelnut brittle.' },
  { id:10, name:'Crème Brûlée',                cat:'dessert', price:120, emoji:'🍮', desc:'Madagascan vanilla, lavender sugar crust, fresh berries.' },
  { id:11, name:'Fig & Honey Tart',            cat:'dessert', price:135, emoji:'🫐', desc:'Seasonal figs, almond cream, thyme honey, walnut pastry.' },
  { id:12, name:'Artisan Cheese Board',         cat:'dessert', price:220, emoji:'🧀', desc:'Selection of 5 cheeses, quince paste, seeded crackers, walnuts.' },
  { id:13, name:'House Negroni',               cat:'drink',   price:145, emoji:'🍹', desc:'Aperol, Campari, oak-aged vermouth, orange peel.' },
  { id:14, name:'Natural Wine – Öküzgözü',     cat:'drink',   price:220, emoji:'🍷', desc:'Organic red from Eastern Anatolia. Dark fruit, earthy, long finish.' },
  { id:15, name:'Sparkling Water (750ml)',      cat:'drink',   price:55,  emoji:'💧', desc:'San Pellegrino sparkling mineral water.' },
  { id:16, name:'Fresh-Pressed Lemonade',      cat:'drink',   price:75,  emoji:'🍋', desc:'Seasonal citrus, raw honey, fresh mint.' },
];

let cart = JSON.parse(localStorage.getItem('eo_cart') || '[]');

function saveCart() {
  localStorage.setItem('eo_cart', JSON.stringify(cart));
}

function addToCart(id) {
  const item = MENU_ITEMS.find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${item.emoji} ${item.name} added to cart`);
}

function updateQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total-price').textContent = `₺${total.toLocaleString('tr-TR', {minimumFractionDigits:2})}`;

  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><span>🍽</span><p>Your cart is empty.<br>Add something delicious!</p></div>`;
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₺${(item.price * item.qty).toLocaleString('tr-TR')}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const orders = JSON.parse(localStorage.getItem('eo_orders') || '[]');
  orders.push({ date: new Date().toISOString(), items: [...cart], total: cart.reduce((s,c)=>s+c.price*c.qty,0) });
  localStorage.setItem('eo_orders', JSON.stringify(orders));
  cart = [];
  saveCart();
  updateCartUI();
  document.getElementById('order-success').style.display = 'block';
  setTimeout(() => { document.getElementById('order-success').style.display = 'none'; }, 4000);
}

function toggleCart() {
  document.getElementById('cart-overlay').classList.toggle('open');
  document.getElementById('cart-panel').classList.toggle('open');
}

function renderMenu(filter, targetId) {
  const items = filter === 'all' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.cat === filter);
  return items.map(item => `
    <div class="menu-card" data-cat="${item.cat}">
      <div class="menu-card-img">${item.emoji}</div>
      <div class="menu-card-body">
        <div class="menu-card-cat">${item.cat}</div>
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
        <div class="menu-card-footer">
          <div class="menu-card-price">₺${item.price}</div>
          <button class="add-btn" onclick="addToCart(${item.id})">Add to Order</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterMenu(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('menu-grid').innerHTML = renderMenu(cat);
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

function submitReservation() {
  const fname  = document.getElementById('res-fname').value.trim();
  const lname  = document.getElementById('res-lname').value.trim();
  const email  = document.getElementById('res-email').value.trim();
  const date   = document.getElementById('res-date').value;
  const time   = document.getElementById('res-time').value;
  const guests = document.getElementById('res-guests').value;

  if (!fname || !lname || !email || !date || !time) {
    showToast('Please fill in all required fields.'); return;
  }
  const reservations = JSON.parse(localStorage.getItem('eo_reservations') || '[]');
  reservations.push({ fname, lname, email, date, time, guests, createdAt: new Date().toISOString() });
  localStorage.setItem('eo_reservations', JSON.stringify(reservations));

  document.getElementById('res-confirm-text').textContent =
    `Thank you, ${fname}! Your table for ${guests} is confirmed on ${date} at ${time}. A confirmation has been noted.`;
  document.getElementById('res-success').style.display = 'block';
  showToast('✦ Reservation confirmed!');
}

function submitContact() {
  const name = document.getElementById('c-name').value.trim();
  const msg  = document.getElementById('c-msg').value.trim();
  if (!name || !msg) { showToast('Please fill in all fields.'); return; }
  const messages = JSON.parse(localStorage.getItem('eo_messages') || '[]');
  messages.push({ name, msg, createdAt: new Date().toISOString() });
  localStorage.setItem('eo_messages', JSON.stringify(messages));
  document.getElementById('c-name').value = '';
  document.getElementById('c-msg').value = '';
  showToast('✦ Message sent! We\'ll be in touch soon.');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

document.getElementById('menu-grid').innerHTML = renderMenu('all');
document.getElementById('featured-grid').innerHTML = renderMenu('all').split('</div></div>').slice(0,3).join('</div></div>') + '</div></div>';

const featured = [MENU_ITEMS[4], MENU_ITEMS[0], MENU_ITEMS[8], MENU_ITEMS[12]];
document.getElementById('featured-grid').innerHTML = featured.map(item => `
  <div class="menu-card">
    <div class="menu-card-img">${item.emoji}</div>
    <div class="menu-card-body">
      <div class="menu-card-cat">${item.cat}</div>
      <div class="menu-card-name">${item.name}</div>
      <div class="menu-card-desc">${item.desc}</div>
      <div class="menu-card-footer">
        <div class="menu-card-price">₺${item.price}</div>
        <button class="add-btn" onclick="addToCart(${item.id})">Add to Order</button>
      </div>
    </div>
  </div>
`).join('');

document.getElementById('res-date').min = new Date().toISOString().split('T')[0];

updateCartUI();
