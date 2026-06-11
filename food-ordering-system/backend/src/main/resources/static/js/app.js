/* ====================================================
   ForkIt — Food Ordering System
   Vanilla JS client talking to Spring Boot REST API
   ==================================================== */

const API = 'http://localhost:8080/api';

// ── State ──────────────────────────────────────────────
const state = {
    menuItems: [],
    cart: JSON.parse(localStorage.getItem('cart') || '[]'),
    activeCategory: 'all',
    vegOnly: false,
    searchQuery: '',
};

// ── DOM refs ───────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const menuGrid      = $('#menuGrid');
const categoryTabs  = $('#categoryTabs');
const cartBadge     = $('#cartBadge');
const cartBody      = $('#cartBody');
const cartItemsList = $('#cartItemsList');
const emptyCart     = $('#emptyCart');
const cartFooter    = $('#cartFooter');
const subtotalAmt   = $('#subtotalAmt');
const totalAmt      = $('#totalAmt');
const modalTotal    = $('#modalTotal');
const toast         = $('#toast');

// ── Utility ────────────────────────────────────────────
function showToast(msg, duration = 2500) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function fmtPrice(n) { return '₹' + Number(n).toFixed(0); }

function stars(rating) {
    const full  = Math.round(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
}

function openModal(id)  { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }
function openCart()  { $('#cartDrawer').classList.add('open'); $('#cartOverlay').classList.add('open'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartOverlay').classList.remove('open'); }

// ── Fetch helpers ──────────────────────────────────────
async function apiGet(path) {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

async function apiPost(path, body) {
    const r = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

async function apiPut(path, body) {
    const r = await fetch(API + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

// ── Load menu ──────────────────────────────────────────
async function loadMenu() {
    try {
        state.menuItems = await apiGet('/menu');
        await buildCategoryTabs();
        renderMenu();
    } catch (e) {
        menuGrid.innerHTML = `<div class="no-results">⚠️ Could not load menu. Is the Spring Boot server running on port 8080?<br><small>${e.message}</small></div>`;
    }
}

async function buildCategoryTabs() {
    const cats = [...new Set(state.menuItems.map(i => i.category))].sort();
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-tab';
        btn.dataset.category = cat;
        btn.textContent = cat;
        categoryTabs.appendChild(btn);
    });
}

function getFilteredItems() {
    return state.menuItems.filter(item => {
        const matchCat  = state.activeCategory === 'all' || item.category === state.activeCategory;
        const matchVeg  = !state.vegOnly || item.vegetarian;
        const matchSrch = !state.searchQuery || item.name.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchCat && matchVeg && matchSrch;
    });
}

function renderMenu() {
    const items = getFilteredItems();
    menuGrid.innerHTML = '';

    if (!items.length) {
        menuGrid.innerHTML = '<div class="no-results">No dishes match your filters. Try clearing the search.</div>';
        return;
    }

    items.forEach(item => {
        const inCart   = state.cart.find(c => c.id === item.id);
        const qty      = inCart ? inCart.qty : 0;

        const card = document.createElement('div');
        card.className = 'menu-card';
        card.dataset.id = item.id;
        card.innerHTML = `
            <div class="card-emoji">${item.imageUrl || '🍽️'}</div>
            <div class="card-body">
                <div class="card-tags">
                    ${item.popular   ? '<span class="tag tag-popular">🔥 Popular</span>' : ''}
                    ${item.vegetarian ? '<span class="tag tag-veg">🌿 Veg</span>' : ''}
                </div>
                <div class="card-name">${item.name}</div>
                <div class="card-desc">${item.description || ''}</div>
                <div class="card-meta">
                    <span class="card-rating"><span>${stars(item.rating || 0)}</span> ${(item.rating || 0).toFixed(1)} (${item.reviewCount || 0})</span>
                    <span class="card-prep">⏱ ${item.prepTimeMinutes} min</span>
                </div>
            </div>
            <div class="card-footer">
                <span class="card-price">${fmtPrice(item.price)}</span>
                ${qty === 0
                    ? `<button class="add-btn" data-id="${item.id}">Add +</button>`
                    : `<div class="qty-control">
                          <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
                          <span class="qty-count">${qty}</span>
                          <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
                       </div>`}
            </div>`;
        menuGrid.appendChild(card);
    });
}

// ── Cart ───────────────────────────────────────────────
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function addToCart(itemId) {
    const item = state.menuItems.find(i => i.id == itemId);
    if (!item) return;
    const existing = state.cart.find(c => c.id == itemId);
    if (existing) { existing.qty++; }
    else { state.cart.push({ id: item.id, name: item.name, price: item.price, emoji: item.imageUrl || '🍽️', qty: 1 }); }
    saveCart();
    renderCart();
    renderMenu();
    showToast(`${item.name} added to cart`);
}

function updateQty(itemId, delta) {
    const idx = state.cart.findIndex(c => c.id == itemId);
    if (idx === -1) return;
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
    saveCart();
    renderCart();
    renderMenu();
}

function renderCart() {
    const count = state.cart.reduce((a, c) => a + c.qty, 0);
    cartBadge.textContent = count;

    if (!state.cart.length) {
        emptyCart.style.display = '';
        cartItemsList.innerHTML = '';
        cartFooter.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartFooter.style.display = '';

    cartItemsList.innerHTML = state.cart.map(ci => `
        <div class="cart-item">
            <div class="cart-item-emoji">${ci.emoji}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${ci.name}</div>
                <div class="cart-item-price">${fmtPrice(ci.price)} each</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" data-action="dec" data-id="${ci.id}">−</button>
                <span class="qty-count">${ci.qty}</span>
                <button class="qty-btn" data-action="inc" data-id="${ci.id}">+</button>
            </div>
        </div>
    `).join('');

    const sub   = state.cart.reduce((a, c) => a + c.price * c.qty, 0);
    const total = sub + 40;
    subtotalAmt.textContent = fmtPrice(sub);
    totalAmt.textContent    = fmtPrice(total);
    modalTotal.textContent  = fmtPrice(total);
}

// ── Checkout ───────────────────────────────────────────
async function placeOrder() {
    const name    = $('#custName').value.trim();
    const email   = $('#custEmail').value.trim();
    const phone   = $('#custPhone').value.trim();
    const address = $('#custAddress').value.trim();
    const payment = $('input[name="payment"]:checked').value;
    const notes   = $('#custInstructions').value.trim();

    if (!name || !email || !phone || !address) {
        showToast('Please fill in all required fields');
        return;
    }
    if (!state.cart.length) {
        showToast('Your cart is empty');
        return;
    }

    const orderPayload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryAddress: address,
        paymentMethod: payment,
        specialInstructions: notes,
        items: state.cart.map(c => ({ menuItemId: c.id, quantity: c.qty })),
    };

    const btn = $('#placeOrderBtn');
    btn.textContent = 'Placing…';
    btn.disabled = true;

    try {
        const order = await apiPost('/orders', orderPayload);
        // Clear cart
        state.cart = [];
        saveCart();
        renderCart();
        renderMenu();
        closeModal('#checkoutOverlay');
        // Show success
        $('#successOrderId').textContent = '#' + order.id;
        $('#successMsg').textContent = `Thank you, ${name}! Your order is confirmed.`;
        openModal('#successOverlay');
    } catch (e) {
        showToast('Failed to place order. Is the server running?');
    } finally {
        btn.textContent = 'Place Order →';
        btn.disabled = false;
    }
}

// ── My Orders ──────────────────────────────────────────
async function lookupOrders() {
    const email = $('#lookupEmail').value.trim();
    if (!email) { showToast('Enter your email'); return; }
    const result = $('#ordersResult');
    result.innerHTML = '<div class="spinner" style="margin:1rem auto;"></div>';
    try {
        const orders = await apiGet(`/orders/customer?email=${encodeURIComponent(email)}`);
        if (!orders.length) { result.innerHTML = '<p style="color:var(--smoke);text-align:center;margin-top:1rem;">No orders found for this email.</p>'; return; }
        result.innerHTML = orders.map(o => `
            <div class="order-history-item">
                <div class="order-history-header">
                    <span class="order-history-id">Order #${o.id}</span>
                    <span class="status-badge status-${o.status}">${o.status.replace('_', ' ')}</span>
                </div>
                <div class="order-history-items">${(o.items || []).map(i => `${i.quantity}× ${i.menuItem?.name || 'Item'}`).join(', ')}</div>
                <div class="order-history-footer">
                    <span>${new Date(o.createdAt).toLocaleString()}</span>
                    <span>${fmtPrice(o.totalAmount)}</span>
                </div>
            </div>
        `).join('');
    } catch (e) {
        result.innerHTML = '<p style="color:var(--smoke);">Could not fetch orders.</p>';
    }
}

// ── Track Order ────────────────────────────────────────
async function trackOrder() {
    const id = $('#trackId').value.trim();
    if (!id) { showToast('Enter an order ID'); return; }
    const result = $('#trackResult');
    result.innerHTML = '<div class="spinner" style="margin:1rem auto;"></div>';
    try {
        const order = await apiGet(`/orders/${id}`);
        const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const labels = { PENDING: 'Order received', CONFIRMED: 'Confirmed', PREPARING: 'Being prepared', OUT_FOR_DELIVERY: 'On the way', DELIVERED: 'Delivered' };
        const icons  = { PENDING: '📋', CONFIRMED: '✅', PREPARING: '👨‍🍳', OUT_FOR_DELIVERY: '🛵', DELIVERED: '🎉' };
        const curIdx = steps.indexOf(order.status);

        result.innerHTML = `
            <div style="margin-top:1rem;">
                <p style="font-size:.85rem;color:var(--smoke);">Order #${order.id} — <strong>${order.customerName}</strong></p>
                <div class="track-steps">
                    ${steps.map((s, i) => {
                        const cls = i < curIdx ? 'done' : (i === curIdx ? 'active' : '');
                        return `<div class="track-step">
                            <div class="step-dot ${cls}">${cls === 'done' ? '✓' : (cls === 'active' ? icons[s] : '○')}</div>
                            <div class="step-info"><strong>${labels[s]}</strong>${cls === 'active' ? '<small>Current status</small>' : ''}</div>
                        </div>`;
                    }).join('')}
                </div>
                <p style="text-align:right;font-size:.85rem;font-weight:600;margin-top:.75rem;">${fmtPrice(order.totalAmount)}</p>
            </div>`;
    } catch (e) {
        result.innerHTML = '<p style="color:var(--smoke);">Order not found.</p>';
    }
}

// ── Admin ──────────────────────────────────────────────
async function loadAdminOrders() {
    const body = $('#adminBody');
    body.innerHTML = '<div class="spinner" style="margin:2rem auto;"></div>';
    try {
        const orders = await apiGet('/orders');
        if (!orders.length) { body.innerHTML = '<p style="color:var(--smoke);text-align:center;padding:2rem;">No orders yet.</p>'; return; }

        const statuses = ['PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];
        body.innerHTML = `<div style="overflow-x:auto;"><table class="admin-table">
            <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${orders.map(o => `
                <tr>
                    <td>${o.id}</td>
                    <td><strong>${o.customerName}</strong><br><small>${o.customerEmail}</small></td>
                    <td><small>${(o.items || []).map(i => `${i.quantity}× ${i.menuItem?.name || '?'}`).join(', ')}</small></td>
                    <td>${fmtPrice(o.totalAmount)}</td>
                    <td>
                        <select class="status-select" data-id="${o.id}">
                            ${statuses.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                        </select>
                    </td>
                    <td><small>${new Date(o.createdAt).toLocaleString()}</small></td>
                </tr>`).join('')}
            </tbody>
        </table></div>`;

        $$('.status-select', body).forEach(sel => {
            sel.addEventListener('change', async (e) => {
                try {
                    await apiPut(`/orders/${e.target.dataset.id}/status`, { status: e.target.value });
                    showToast('Status updated');
                } catch { showToast('Update failed'); }
            });
        });
    } catch (e) {
        body.innerHTML = '<p style="color:var(--smoke);">Could not load orders. Is the server running?</p>';
    }
}

// ── Event Listeners ────────────────────────────────────
// Cart
$('#cartBtn').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);

$('#checkoutBtn').addEventListener('click', () => {
    closeCart();
    openModal('#checkoutOverlay');
});

// Cart item qty buttons (delegated)
$('#cartItemsList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    updateQty(btn.dataset.id, btn.dataset.action === 'inc' ? 1 : -1);
});

// Checkout modal
$('#closeCheckout').addEventListener('click', () => closeModal('#checkoutOverlay'));
$('#cancelCheckout').addEventListener('click', () => closeModal('#checkoutOverlay'));
$('#placeOrderBtn').addEventListener('click', placeOrder);

// Success
$('#closeSuccess').addEventListener('click', () => closeModal('#successOverlay'));

// My orders
$('#myOrdersLink').addEventListener('click', (e) => { e.preventDefault(); openModal('#myOrdersOverlay'); });
$('#closeMyOrders').addEventListener('click', () => closeModal('#myOrdersOverlay'));
$('#lookupBtn').addEventListener('click', lookupOrders);
$('#lookupEmail').addEventListener('keydown', (e) => { if (e.key === 'Enter') lookupOrders(); });

// Track order
$('#trackOrderBtn').addEventListener('click', (e) => { e.preventDefault(); openModal('#trackOverlay'); });
$('#closeTrack').addEventListener('click', () => closeModal('#trackOverlay'));
$('#trackBtn').addEventListener('click', trackOrder);
$('#trackId').addEventListener('keydown', (e) => { if (e.key === 'Enter') trackOrder(); });

// Admin
$('#adminLink').addEventListener('click', (e) => { e.preventDefault(); openModal('#adminOverlay'); loadAdminOrders(); });
$('#closeAdmin').addEventListener('click', () => closeModal('#adminOverlay'));

// Category tabs
categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.cat-tab');
    if (!tab) return;
    $$('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeCategory = tab.dataset.category;
    renderMenu();
});

// Veg filter
$('#vegOnly').addEventListener('change', (e) => {
    state.vegOnly = e.target.checked;
    renderMenu();
});

// Search
const searchInput = $('#searchInput');
const searchClear = $('#searchClear');
searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    searchClear.classList.toggle('visible', !!e.target.value);
    renderMenu();
});
searchClear.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    searchClear.classList.remove('visible');
    renderMenu();
});

// Menu grid — delegated add/qty
menuGrid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-btn');
    if (addBtn) { addToCart(addBtn.dataset.id); return; }

    const qtyBtn = e.target.closest('.qty-btn[data-action]');
    if (qtyBtn) { updateQty(qtyBtn.dataset.id, qtyBtn.dataset.action === 'inc' ? 1 : -1); }
});

// Payment option styling
document.querySelectorAll('.pay-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.pay-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

// Close modals on overlay click
['#checkoutOverlay','#myOrdersOverlay','#trackOverlay','#adminOverlay','#successOverlay'].forEach(id => {
    $(id).addEventListener('click', (e) => { if (e.target === $(id)) closeModal(id); });
});

// ── Init ───────────────────────────────────────────────
renderCart();
loadMenu();
