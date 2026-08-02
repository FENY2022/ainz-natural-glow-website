(() => {
  'use strict';

  const PHONE_DISPLAY = '0995 923 7839';
  const PHONE_INTL = '+639959237839';
  const MESSENGER_URL = 'https://m.me/aineze';
  const PRICE = 159;

  const products = {
    turmeric: {
      id: 'turmeric', name: 'Rice Turmeric', price: PRICE,
      image: 'assets/rice-turmeric.webp', accent: '#b77706',
      description: 'A radiant blend of rice water, nourishing oils, shea butter, turmeric extract, and Vitamin E.',
      benefits: ['Helps brighten and even the look of skin tone', 'Soothes and calms the skin', 'Supports a clear, healthy-looking glow']
    },
    rosemary: {
      id: 'rosemary', name: 'Rice Rosemary', price: PRICE,
      image: 'assets/rice-rosemary.webp', accent: '#4f752f',
      description: 'A refreshing botanical formula with rice water, moisturizing oils, shea butter, rosemary extract, and Vitamin E.',
      benefits: ['Calms and soothes the skin', 'Helps refresh skin that feels stressed', 'Supports a strong, healthy-looking skin barrier']
    },
    salt: {
      id: 'salt', name: 'Himalayan Salt', price: PRICE,
      image: 'assets/himalayan-salt.webp', accent: '#b85d58',
      description: 'A mineral-rich cleansing bar made with rice water, nourishing oils, shea butter, Vitamin E, and Himalayan salt.',
      benefits: ['Deeply cleanses the skin', 'Gently exfoliates dead skin cells', 'Leaves skin feeling refreshed and revitalized']
    }
  };

  const cart = loadCart();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = amount => `₱${amount.toLocaleString('en-PH')}`;

  const drawer = $('[data-cart-drawer]');
  const drawerBackdrop = $('[data-cart-backdrop]');
  const modal = $('[data-modal]');
  const modalBackdrop = $('[data-modal-backdrop]');
  const modalContent = $('[data-modal-content]');
  const toast = $('[data-toast]');
  let toastTimer;

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem('ainzCart') || '{}');
      return Object.fromEntries(Object.entries(stored).filter(([id, qty]) => products[id] && Number.isFinite(qty) && qty > 0));
    } catch {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem('ainzCart', JSON.stringify(cart));
  }

  function getCartCount() {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function getCartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => sum + products[id].price * qty, 0);
  }

  function setQuantity(id, qty) {
    const safeQty = Math.max(0, Math.min(99, Number(qty) || 0));
    if (!safeQty) delete cart[id];
    else cart[id] = safeQty;
    saveCart();
    renderCart();
  }

  function addToCart(id, qty = 1, message = null) {
    const amount = Math.max(1, Math.min(99, Number(qty) || 1));
    cart[id] = Math.min(99, (cart[id] || 0) + amount);
    saveCart();
    renderCart();
    showToast(message || `${products[id].name} added to cart`);
  }

  function renderCart() {
    const items = Object.entries(cart);
    const count = getCartCount();
    $$('[data-cart-count]').forEach(el => el.textContent = count);
    $('[data-cart-total]').textContent = money(getCartTotal());

    const list = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    const footer = $('[data-cart-footer]');

    if (!items.length) {
      list.innerHTML = '';
      empty.classList.add('active');
      footer.classList.add('hidden');
      return;
    }

    empty.classList.remove('active');
    footer.classList.remove('hidden');
    list.innerHTML = items.map(([id, qty]) => {
      const p = products[id];
      return `
        <article class="cart-item">
          <img src="${p.image}" alt="${p.name}" />
          <div>
            <h3>${p.name}</h3>
            <small>${money(p.price)} each</small>
            <div class="mini-qty" aria-label="Change ${p.name} quantity">
              <button type="button" data-cart-minus="${id}" aria-label="Decrease ${p.name} quantity">−</button>
              <span>${qty}</span>
              <button type="button" data-cart-plus="${id}" aria-label="Increase ${p.name} quantity">+</button>
            </div>
          </div>
          <div class="cart-item-price">
            <strong>${money(p.price * qty)}</strong>
            <button class="remove-item" type="button" data-remove="${id}">Remove</button>
          </div>
        </article>`;
    }).join('');

    $$('[data-cart-minus]', list).forEach(btn => btn.addEventListener('click', () => setQuantity(btn.dataset.cartMinus, cart[btn.dataset.cartMinus] - 1)));
    $$('[data-cart-plus]', list).forEach(btn => btn.addEventListener('click', () => setQuantity(btn.dataset.cartPlus, cart[btn.dataset.cartPlus] + 1)));
    $$('[data-remove]', list).forEach(btn => btn.addEventListener('click', () => setQuantity(btn.dataset.remove, 0)));
  }

  function openCart() {
    closeModal();
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.classList.add('active');
    document.body.classList.add('locked');
    setTimeout(() => $('[data-close-cart]')?.focus(), 50);
  }

  function closeCart() {
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.classList.remove('active');
    if (!modal.classList.contains('active')) document.body.classList.remove('locked');
  }

  function openModal(html) {
    closeCart();
    modalContent.innerHTML = html;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    modalBackdrop.classList.add('active');
    document.body.classList.add('locked');
    setTimeout(() => $('[data-close-modal]')?.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalBackdrop.classList.remove('active');
    if (!drawer.classList.contains('active')) document.body.classList.remove('locked');
  }

  function showQuickView(id) {
    const p = products[id];
    openModal(`
      <div class="modal-inner modal-product">
        <img src="${p.image}" alt="${p.name}" />
        <div>
          <span class="eyebrow" style="color:${p.accent}"><span></span> Premium soap</span>
          <h2 id="modal-title">${p.name}</h2>
          <div class="modal-price">${money(p.price)}</div>
          <p>${p.description}</p>
          <ul class="modal-benefits">${p.benefits.map(item => `<li>${item}</li>`).join('')}</ul>
          <button class="button button-primary" type="button" data-modal-add="${id}">Add to cart</button>
        </div>
      </div>`);
    $('[data-modal-add]')?.addEventListener('click', () => {
      addToCart(id);
      closeModal();
      openCart();
    });
  }

  function buildOrderMessage(customer) {
    const lines = Object.entries(cart).map(([id, qty]) => {
      const p = products[id];
      return `• ${p.name} x${qty} — ${money(p.price * qty)}`;
    });
    return [
      'Hello AINZ Natural Glow Soap! I would like to place an order:',
      '',
      ...lines,
      '',
      `Subtotal: ${money(getCartTotal())}`,
      '',
      `Name: ${customer.name}`,
      `Contact: ${customer.contact}`,
      `Delivery address: ${customer.address}`,
      `Notes: ${customer.notes || 'None'}`,
      '',
      'Please confirm the delivery fee, payment details, and availability. Thank you!'
    ].join('\n');
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  }

  function showCheckout() {
    if (!getCartCount()) return;
    openModal(`
      <form class="checkout-form" data-checkout-form>
        <span class="eyebrow"><span></span> Complete your order</span>
        <h2 id="modal-title">Send your order</h2>
        <p>Enter your details below. The website will prepare an order message for SMS or Messenger. No online payment will be charged here.</p>
        <div class="form-grid">
          <div class="field"><label for="customer-name">Full name</label><input id="customer-name" name="name" autocomplete="name" required /></div>
          <div class="field"><label for="customer-contact">Contact number</label><input id="customer-contact" name="contact" inputmode="tel" autocomplete="tel" required /></div>
          <div class="field full"><label for="customer-address">Delivery address</label><textarea id="customer-address" name="address" autocomplete="street-address" required></textarea></div>
          <div class="field full"><label for="customer-notes">Order notes (optional)</label><textarea id="customer-notes" name="notes" placeholder="Preferred delivery schedule, landmark, or other notes"></textarea></div>
        </div>
        <div class="checkout-total"><span>Order subtotal</span><strong>${money(getCartTotal())}</strong></div>
        <div class="checkout-actions">
          <button class="button button-primary" type="submit">Open SMS order</button>
          <button class="button button-ghost" type="button" data-messenger-order>Open Messenger</button>
          <button class="button button-ghost" type="button" data-copy-order>Copy order details</button>
        </div>
        <p class="checkout-help">Delivery fee, payment method, and final confirmation will be arranged directly with AINZ.</p>
      </form>`);

    const form = $('[data-checkout-form]');
    const getCustomer = () => ({
      name: form.elements.name.value.trim(),
      contact: form.elements.contact.value.trim(),
      address: form.elements.address.value.trim(),
      notes: form.elements.notes.value.trim()
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const message = buildOrderMessage(getCustomer());
      window.location.href = `sms:${PHONE_INTL}?body=${encodeURIComponent(message)}`;
      showToast('Your SMS order is ready to send');
    });

    $('[data-messenger-order]').addEventListener('click', async () => {
      if (!form.reportValidity()) return;
      const message = buildOrderMessage(getCustomer());
      const messengerWindow = window.open('about:blank', '_blank');
      if (messengerWindow) messengerWindow.opener = null;
      await copyText(message);
      const messengerLink = `${MESSENGER_URL}?text=${encodeURIComponent(message)}`;
      if (messengerWindow) messengerWindow.location.href = messengerLink;
      else window.location.href = messengerLink;
      showToast('Order copied. Paste it in Messenger if needed');
    });

    $('[data-copy-order]').addEventListener('click', async () => {
      if (!form.reportValidity()) return;
      const message = buildOrderMessage(getCustomer());
      await copyText(message);
      showToast('Order details copied');
    });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $('[data-toast-message]').textContent = message;
    toast.classList.add('active');
    toastTimer = setTimeout(() => toast.classList.remove('active'), 2600);
  }

  $$('[data-product-card]').forEach(card => {
    const input = $('input[type="number"]', card);
    $$('[data-step]', card).forEach(btn => btn.addEventListener('click', () => {
      const next = Math.max(1, Math.min(99, Number(input.value || 1) + Number(btn.dataset.step)));
      input.value = next;
    }));
    input.addEventListener('change', () => input.value = Math.max(1, Math.min(99, Number(input.value) || 1)));
    $('[data-add]', card).addEventListener('click', event => {
      addToCart(event.currentTarget.dataset.add, input.value);
      input.value = 1;
    });
  });

  $$('[data-quick-view]').forEach(btn => btn.addEventListener('click', () => showQuickView(btn.dataset.quickView)));
  $$('[data-open-cart]').forEach(btn => btn.addEventListener('click', openCart));
  $$('[data-close-cart]').forEach(btn => btn.addEventListener('click', event => {
    closeCart();
    if (event.currentTarget.hasAttribute('data-scroll-shop')) setTimeout(() => $('#shop').scrollIntoView({ behavior: 'smooth' }), 200);
  }));
  $('[data-close-modal]').addEventListener('click', closeModal);
  drawerBackdrop.addEventListener('click', closeCart);
  modalBackdrop.addEventListener('click', closeModal);
  $('[data-checkout]').addEventListener('click', showCheckout);
  $('[data-clear-cart]').addEventListener('click', () => {
    Object.keys(cart).forEach(id => delete cart[id]);
    saveCart();
    renderCart();
    showToast('Cart cleared');
  });
  $('[data-add-trio]').addEventListener('click', () => {
    Object.keys(products).forEach(id => cart[id] = Math.min(99, (cart[id] || 0) + 1));
    saveCart();
    renderCart();
    showToast('Complete trio added to cart');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeCart();
      closeModal();
    }
  });

  const menuToggle = $('.menu-toggle');
  const nav = $('.main-nav');
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.main-nav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => observer.observe(el));

  window.addEventListener('scroll', () => $('.site-header').classList.toggle('scrolled', window.scrollY > 10), { passive: true });
  $('[data-year]').textContent = new Date().getFullYear();
  renderCart();
})();
