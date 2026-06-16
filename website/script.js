/* ============================================================
   المدى القريب — storefront interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ---- Arabic-Indic numeral helper ---- */
  const AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const toAr = (n) => String(n).replace(/\d/g, (d) => AR[d]);
  const money = (n) => toAr(n.toLocaleString("en-US")) + " ر.س";

  /* ---- Product catalogue ---- */
  const PRODUCTS = {
    new: [
      { id: 1, brand: "Apple", title: "آيفون ١٥ برو ماكس ٢٥٦ جيجا", price: 4999, was: 5499, rating: 5, badge: "جديد", badgeType: "new", c1: "#1f2a4d", c2: "#3b4f8a" },
      { id: 2, brand: "Samsung", title: "جالكسي S24 الترا ٥١٢ جيجا", price: 4299, was: 4799, rating: 5, badge: "جديد", badgeType: "new", c1: "#3a2f6b", c2: "#6c4cf1" },
      { id: 3, brand: "Xiaomi", title: "شاومي ١٤T برو ٥G", price: 1899, was: null, rating: 4, badge: "جديد", badgeType: "new", c1: "#7a3b1e", c2: "#ff8a3d" },
      { id: 4, brand: "HONOR", title: "أونر ماجيك ٦ برو", price: 2799, was: 3099, rating: 5, badge: "جديد", badgeType: "new", c1: "#0f5132", c2: "#10b981" },
    ],
    best: [
      { id: 5, brand: "Apple", title: "آيربودز برو الجيل الثاني", price: 899, was: 999, rating: 5, badge: "الأكثر مبيعاً", badgeType: "sale", c1: "#444", c2: "#888" },
      { id: 6, brand: "Samsung", title: "جالكسي A55 ٥G ١٢٨ جيجا", price: 1599, was: null, rating: 4, badge: "الأكثر مبيعاً", badgeType: "sale", c1: "#1f2a4d", c2: "#3b82f6" },
      { id: 7, brand: "Anker", title: "شاحن أنكر ٦٧ واط سريع", price: 199, was: 249, rating: 5, badge: "الأكثر مبيعاً", badgeType: "sale", c1: "#1a1a1a", c2: "#4f46e5" },
      { id: 8, brand: "Xiaomi", title: "ريدمي نوت ١٣ برو", price: 1099, was: 1299, rating: 4, badge: "الأكثر مبيعاً", badgeType: "sale", c1: "#7a3b1e", c2: "#ffb454" },
    ],
    offers: [
      { id: 9, brand: "OPPO", title: "أوبو رينو ١١ ٥G", price: 1399, was: 1799, rating: 4, badge: "خصم ٢٢٪", badgeType: "sale", c1: "#0f5132", c2: "#34d399" },
      { id: 10, brand: "Samsung", title: "سماعة جالكسي بدز ٢ برو", price: 599, was: 799, rating: 5, badge: "خصم ٢٥٪", badgeType: "sale", c1: "#3a2f6b", c2: "#a78bfa" },
      { id: 11, brand: "Apple", title: "كفر آيفون ١٥ سيليكون أصلي", price: 129, was: 199, rating: 4, badge: "خصم ٣٥٪", badgeType: "sale", c1: "#7a1e2e", c2: "#f87171" },
      { id: 12, brand: "OUKITEL", title: "أوكيتل WP30 برو متين", price: 999, was: 1299, rating: 4, badge: "خصم ٢٣٪", badgeType: "sale", c1: "#1a1a1a", c2: "#f59e0b" },
    ],
  };

  /* ---- Render products ---- */
  const grid = document.getElementById("productGrid");
  const starRow = (r) =>
    "★★★★★".slice(0, r) + `<span>${"★".repeat(5 - r)}</span>`;

  function cardHTML(p) {
    return `
      <article class="card">
        <div class="card__media">
          <span class="card__badge card__badge--${p.badgeType}">${p.badge}</span>
          <button class="card__fav" aria-label="أضف للمفضلة">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-7-4.6-9.3-9C1 8.7 2.7 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.3 0 5 3.2 3.3 6.5C19 16.4 12 21 12 21Z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>
          </button>
          <div class="card__phone" style="--c1:${p.c1};--c2:${p.c2}"></div>
        </div>
        <div class="card__body">
          <span class="card__brand">${p.brand}</span>
          <h3 class="card__title">${p.title}</h3>
          <div class="card__rating">${starRow(p.rating)} <span>(${toAr(Math.floor(Math.random() * 90 + 10))})</span></div>
          <div class="card__price">
            <span class="now">${money(p.price)}</span>
            ${p.was ? `<span class="was">${money(p.was)}</span>` : ""}
          </div>
          <button class="card__add" data-id="${p.id}">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            أضف للسلة
          </button>
        </div>
      </article>`;
  }

  function renderTab(tab) {
    grid.innerHTML = PRODUCTS[tab].map(cardHTML).join("");
  }
  renderTab("new");

  /* ---- Tabs ---- */
  const tabsWrap = document.getElementById("tabs");
  tabsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    tabsWrap.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    btn.classList.add("is-active");
    renderTab(btn.dataset.tab);
  });

  /* ---- Cart state ---- */
  const allProducts = [...PRODUCTS.new, ...PRODUCTS.best, ...PRODUCTS.offers];
  const cart = new Map(); // id -> {product, qty}
  const cartCountEl = document.getElementById("cartCount");
  const cartBody = document.getElementById("cartBody");
  const cartTotalEl = document.getElementById("cartTotal");

  function cartCount() {
    let n = 0;
    cart.forEach((i) => (n += i.qty));
    return n;
  }
  function cartTotal() {
    let t = 0;
    cart.forEach((i) => (t += i.product.price * i.qty));
    return t;
  }

  function renderCart() {
    cartCountEl.textContent = toAr(cartCount());
    cartTotalEl.textContent = money(cartTotal());
    if (cart.size === 0) {
      cartBody.innerHTML = `<div class="cart__empty"><span>🛒</span><p>سلتك فارغة حالياً</p></div>`;
      return;
    }
    let html = "";
    cart.forEach(({ product, qty }) => {
      html += `
        <div class="cart__item">
          <div class="cart__thumb" style="background:linear-gradient(160deg,${product.c1},${product.c2})"></div>
          <div>
            <h5>${product.title}</h5>
            <p>${money(product.price)}</p>
          </div>
          <div class="cart__qty">
            <button data-dec="${product.id}" aria-label="إنقاص">−</button>
            <span>${toAr(qty)}</span>
            <button data-inc="${product.id}" aria-label="زيادة">+</button>
          </div>
        </div>`;
    });
    cartBody.innerHTML = html;
  }

  function addToCart(id) {
    const p = allProducts.find((x) => x.id === id);
    if (!p) return;
    const entry = cart.get(id) || { product: p, qty: 0 };
    entry.qty += 1;
    cart.set(id, entry);
    renderCart();
  }
  function changeQty(id, delta) {
    const entry = cart.get(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) cart.delete(id);
    renderCart();
  }

  /* Add-to-cart clicks (event delegation on grid) */
  grid.addEventListener("click", (e) => {
    const add = e.target.closest(".card__add");
    if (add) {
      addToCart(Number(add.dataset.id));
      add.classList.add("added");
      add.innerHTML = "✓ تمت الإضافة";
      setTimeout(() => {
        add.classList.remove("added");
        add.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> أضف للسلة`;
      }, 1200);
      return;
    }
    const fav = e.target.closest(".card__fav");
    if (fav) fav.style.color = fav.style.color === "rgb(255, 138, 61)" ? "" : "rgb(255, 138, 61)";
  });

  /* Cart qty buttons */
  cartBody.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) changeQty(Number(inc.dataset.inc), 1);
    if (dec) changeQty(Number(dec.dataset.dec), -1);
  });

  /* ---- Drawer + cart toggling ---- */
  const backdrop = document.getElementById("backdrop");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const cartDrawer = document.getElementById("cartDrawer");

  function openPanel(panel) {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeAll() {
    mobileDrawer.classList.remove("open");
    cartDrawer.classList.remove("open");
    mobileDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("show");
    document.body.style.overflow = "";
  }

  document.getElementById("menuToggle").addEventListener("click", () => openPanel(mobileDrawer));
  document.getElementById("drawerClose").addEventListener("click", closeAll);
  document.getElementById("cartToggle").addEventListener("click", () => openPanel(cartDrawer));
  document.getElementById("cartClose").addEventListener("click", closeAll);
  backdrop.addEventListener("click", closeAll);
  document.querySelectorAll("[data-open-cart]").forEach((b) =>
    b.addEventListener("click", () => openPanel(cartDrawer))
  );
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

  /* Close mobile drawer when a link is tapped */
  mobileDrawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeAll));

  /* ---- Header shadow on scroll ---- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });

  renderCart();
})();
