(function () {
  "use strict";

  /* ================================================================
   * KatieB Supermarket – storefront
   * Hash-routed single page app (works on any static host).
   * Data lives in js/config.js and js/products.js.
   * ================================================================ */
  var C = window.KATIEB || {};
  var CATS = window.CATEGORIES || [];
  var PRODUCTS = window.PRODUCTS || [];
  var IMG = window.IMAGES || {};
  var D = C.delivery || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var main = $("#main");

  var catById = {}; CATS.forEach(function (c) { catById[c.id] = c; });
  var byId = {}; PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  /* ---------------- helpers ---------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var nf = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });
  function money(n) { return (C.currency || "₦") + nf.format(round2(n)); }
  function round2(n) { return Math.round(n * 100) / 100; }
  function waDigits() { return String(C.whatsapp || "").replace(/\D/g, ""); }
  function waLink(text) { var n = waDigits(); return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(text) : ""; }

  var ICONS = {
    apple: '<path d="M12 7c-2-2-6-1-6 4 0 4 3 9 6 9s6-5 6-9c0-5-4-6-6-4z"/><path d="M12 7c0-2 1-3 3-3"/>',
    meat: '<path d="M15 4a5 5 0 0 1 4 6c-1 2-4 2-6 1l-6 6a2 2 0 1 1-3-3l6-6c-1-2-1-5 1-6a5 5 0 0 1 4 2z"/>',
    dairy: '<path d="M8 3h8l2 4v14H6V7z"/><path d="M6 7h12M9 12h6"/>',
    bread: '<path d="M5 10a4 4 0 0 1 3-7h8a4 4 0 0 1 3 7v10H5z"/>',
    grains: '<path d="M12 21V8M12 8c-2-1-3-3-3-5 2 0 3 1 3 3M12 8c2-1 3-3 3-5-2 0-3 1-3 3M12 14c-2-1-3-3-3-5M12 14c2-1 3-3 3-5"/>',
    drinks: '<path d="M10 3h4v4l2 3v11H8V10l2-3z"/><path d="M8 14h8"/>',
    snacks: '<circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 10h.01M10 15h.01M14 15h.01"/>',
    frozen: '<path d="M12 3v18M4 7.5l16 9M20 7.5l-16 9"/>',
    spray: '<path d="M9 21V10h6v11zM10 10V6h4v4M14 4h4M14 7l3-1"/>',
    drop: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
    baby: '<circle cx="12" cy="12" r="8"/><path d="M9 11h.01M15 11h.01M9.5 15c1.5 1.5 3.5 1.5 5 0"/>',
    basket: '<path d="M3 10h18l-2 10H5zM8 10l3-6M16 10l-3-6"/>',
    truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    leaf: '<path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14zM5 19l7-7"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.basket) + "</svg>";
  }

  /* responsive <img> for a key in js/images.js */
  function pic(key, o) {
    o = o || {};
    var m = IMG[key];
    if (!m) return "";
    var ws = m.w, big = ws[ws.length - 1];
    var want = o.src || 720;
    var mid = ws.filter(function (w) { return w >= want; })[0] || big;
    var srcset = ws.map(function (w) { return "images/" + key + "-" + w + ".webp " + w + "w"; }).join(", ");
    return '<img src="images/' + key + "-" + mid + '.webp" srcset="' + srcset + '" sizes="' + (o.sizes || "100vw") +
      '" width="' + big + '" height="' + Math.round(big / m.ratio) + '" alt="' + esc(o.alt || "") + '" ' +
      (o.eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">';
  }
  function placeholder(catId, label) {
    var c = catById[catId] || {};
    return '<div class="ph" role="img" aria-label="' + esc(label) + '">' + icon(c.icon) + "<span>" + esc(label) + "</span></div>";
  }
  function productMedia(p, sizes) {
    return p.image && IMG[p.image]
      ? pic(p.image, { alt: p.name, sizes: sizes })
      : placeholder(p.category, "Photo coming soon");
  }

  /* ---------------- product maths ---------------- */
  function onSale(p) { return typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price; }
  function priceOf(p) { return onSale(p) ? p.salePrice : p.price; }
  function pct(p) { return Math.round((1 - p.salePrice / p.price) * 100); }
  function stepOf(p) { return p.step && p.step > 0 ? p.step : 1; }
  function clampQty(p, q) {
    var s = stepOf(p);
    q = Number(q);
    if (!isFinite(q)) q = s;
    q = Math.round(q / s) * s;
    if (q < s) q = s;
    var max = p.maxQty || 50;
    if (q > max) q = max;
    return round2(q);
  }
  function qtyText(q) { return String(round2(q)); }

  /* ---------------- cart (kept in this browser only) ---------------- */
  var CART_KEY = "katieb-cart-v1";
  var cart = loadCart();
  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (l) { return l && byId[l.id]; })
        .map(function (l) { return { id: l.id, qty: clampQty(byId[l.id], l.qty) }; });
    } catch (e) { return []; }
  }
  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* private mode */ } }
  function cartCount() { return cart.reduce(function (n, l) { return n + (stepOf(byId[l.id]) < 1 ? 1 : l.qty); }, 0); }
  function subtotal() { return round2(cart.reduce(function (s, l) { return s + priceOf(byId[l.id]) * l.qty; }, 0)); }
  function updateBadge(bump) {
    var n = cartCount();
    var b = $("#cartCount");
    b.textContent = n;
    b.hidden = n === 0;
    $("#cartBtn").setAttribute("aria-label", "Shopping cart, " + n + (n === 1 ? " item" : " items"));
    if (bump && !reduceMotion) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  }
  function addToCart(id, qty) {
    var p = byId[id];
    if (!p || p.stock === "out") return false;
    var line = cart.filter(function (l) { return l.id === id; })[0];
    if (line) line.qty = clampQty(p, line.qty + (qty || stepOf(p)));
    else cart.push({ id: id, qty: clampQty(p, qty || stepOf(p)) });
    saveCart(); updateBadge(true);
    toast("Added " + p.name + " to your cart", true);
    return true;
  }
  function setQty(id, q) {
    var line = cart.filter(function (l) { return l.id === id; })[0];
    if (!line) return;
    line.qty = clampQty(byId[id], q);
    saveCart(); updateBadge();
  }
  function removeLine(id) {
    cart = cart.filter(function (l) { return l.id !== id; });
    saveCart(); updateBadge();
  }

  function deliveryCalc(sub, optId, decided) {
    if (optId === "pickup") return { amount: 0, text: "Free (store pickup)" };
    if (typeof D.fee !== "number") return { amount: null, text: decided ? "To be confirmed by KatieB" : "Calculated at checkout" };
    if (typeof D.freeAbove === "number" && sub >= D.freeAbove) return { amount: 0, text: "Free" };
    return { amount: D.fee, text: money(D.fee) };
  }

  /* ---------------- toast ---------------- */
  var toastTimer;
  function toast(msg, withCartLink) {
    var t = $("#toast");
    t.innerHTML = "<span>" + esc(msg) + "</span>" + (withCartLink ? '<a href="#/cart">View cart</a>' : "");
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* ---------------- product card ---------------- */
  var CARD_SIZES = "(min-width:1100px) 280px, (min-width:700px) 31vw, 46vw";
  function card(p, reveal) {
    var sale = onSale(p);
    var href = "#/product/" + encodeURIComponent(p.id);
    var action = p.stock === "out"
      ? '<button class="btn btn-outline btn-sm" type="button" disabled>Out of stock</button>'
      : '<button class="btn btn-primary btn-sm" type="button" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to cart">Add to cart</button>';
    return '<article class="pcard' + (reveal ? " reveal" : "") + '">' +
      '<a class="pmedia" href="' + href + '" tabindex="-1" aria-hidden="true">' + productMedia(p, CARD_SIZES) +
      (sale ? '<span class="badge">-' + pct(p) + "%</span>" : "") + "</a>" +
      '<div class="pbody"><p class="pcat">' + esc((catById[p.category] || {}).name) + "</p>" +
      '<h3><a href="' + href + '">' + esc(p.name) + "</a></h3>" +
      '<p class="price"><strong>' + money(priceOf(p)) + "</strong>" + (sale ? "<s>" + money(p.price) + "</s>" : "") +
      '<span class="unit">' + esc(p.unit) + "</span></p>" +
      (sale ? '<p class="save">Save ' + money(p.price - p.salePrice) + "</p>" : "") +
      (p.stock === "in" ? '<p class="stock-in">In stock</p>' : "") +
      '<span class="spacer"></span>' + action + "</div></article>";
  }

  /* ---------------- reveal on scroll + cleanup of per-page effects ---------------- */
  var cleanups = [];
  function observeReveals() {
    var items = $$(".reveal:not(.in)", main);
    if (!("IntersectionObserver" in window) || reduceMotion) { items.forEach(function (i) { i.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    items.forEach(function (i, n) { i.style.transitionDelay = (n % 4) * 70 + "ms"; io.observe(i); });
    cleanups.push(function () { io.disconnect(); });
  }

  /* ================================================================
   * PAGES
   * ================================================================ */
  var HERO = [
    { key: "hero-aisle",   alt: "A bright supermarket aisle with fully stocked shelves", pos: "50% 50%" },
    { key: "hero-produce", alt: "Colourful display of tomatoes, peppers, lemons and cauliflower in a supermarket", pos: "50% 62%" },
    { key: "hero-shopper", alt: "A smiling shopper choosing fruit in a supermarket", pos: "72% 40%", posM: "78% 40%" },
    { key: "hero-wall",    alt: "Fresh vegetables in wicker baskets in a supermarket produce section", pos: "50% 50%" },
    { key: "hero-fruit",   alt: "Baskets of citrus fruit, chillies, coconuts and vegetables on a chilled shelf", pos: "50% 45%" }
  ];

  function heroHTML() {
    var slides = HERO.map(function (s, i) {
      var inner = i === 0
        ? pic(s.key, { alt: s.alt, eager: true, src: 1024, sizes: "100vw" })
        : '<img alt="' + esc(s.alt) + '" data-key="' + s.key + '" width="' + IMG[s.key].w[IMG[s.key].w.length - 1] +
          '" height="' + Math.round(IMG[s.key].w[IMG[s.key].w.length - 1] / IMG[s.key].ratio) + '" decoding="async">';
      return '<figure class="slide' + (i === 0 ? " active" : "") + '" role="group" aria-roledescription="slide" aria-label="Photo ' + (i + 1) + " of " + HERO.length +
        '" style="--pos:' + s.pos + ";--pos-m:" + (s.posM || s.pos) + '">' + inner + "</figure>";
    }).join("");
    return '<section class="hero" aria-roledescription="carousel" aria-label="KatieB Supermarket photo slideshow">' +
      '<div class="slides">' + slides + "</div>" +
      '<div class="hero-shade" aria-hidden="true"></div>' +
      '<div class="wrap hero-content">' +
      '<p class="eyebrow">Groceries &amp; everyday essentials</p>' +
      '<h1><span class="h1-brand">KatieB Supermarket<span class="sr"> — </span></span><span class="h1-line">Fresh Choices.</span> <span class="h1-line">Better Prices.</span></h1>' +
      '<p class="lead">Discover fresh produce, quality groceries, household essentials, and great deals for your everyday shopping.</p>' +
      '<div class="btn-row"><a class="btn btn-primary" href="#/shop">Shop Now</a><a class="btn btn-gold" href="#/offers">Explore Deals</a></div>' +
      "</div>" +
      '<div class="hero-controls">' +
      '<button class="ctrl" type="button" data-slide="-1" aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<div class="dots" id="heroDots"></div>' +
      '<button class="ctrl" type="button" data-slide="1" aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button class="ctrl" type="button" id="heroPause" aria-label="Pause slideshow"><svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg></button>' +
      "</div></section>";
  }

  function initHero() {
    var hero = $(".hero", main);
    if (!hero) return;
    var slides = $$(".slide", hero);
    var dotsBox = $("#heroDots", hero);
    var pauseBtn = $("#heroPause", hero);
    var DELAY = 5500, FADE = 1000;
    var idx = 0, timer = null, busy = false, userPaused = false, hoverPaused = false, alive = true;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "dot";
      b.setAttribute("aria-label", "Show photo " + (i + 1));
      b.setAttribute("aria-current", i === 0 ? "true" : "false");
      b.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(b);
      return b;
    });

    function load(i) {
      var img = $("img", slides[(i + slides.length) % slides.length]);
      var key = img.getAttribute("data-key");
      if (!key || img.getAttribute("src")) return Promise.resolve();
      var m = IMG[key], ws = m.w;
      img.srcset = ws.map(function (w) { return "images/" + key + "-" + w + ".webp " + w + "w"; }).join(", ");
      img.sizes = "100vw";
      img.src = "images/" + key + "-" + (ws.filter(function (w) { return w >= 1024; })[0] || ws[ws.length - 1]) + ".webp";
      var done = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
      return Promise.race([done, new Promise(function (r) { setTimeout(r, 3000); })]);
    }

    function go(n) {
      n = (n + slides.length) % slides.length;
      if (n === idx || busy || !alive) return;
      busy = true;
      load(n).then(function () {
        if (!alive) return;
        var prev = slides[idx], next = slides[n];
        slides.forEach(function (s) { if (s !== prev && s !== next) s.classList.remove("leaving", "active"); });
        prev.classList.remove("active"); prev.classList.add("leaving");
        next.classList.remove("leaving"); next.classList.add("active");
        dots[idx].setAttribute("aria-current", "false");
        dots[n].setAttribute("aria-current", "true");
        idx = n;
        setTimeout(function () { if (prev !== slides[idx]) prev.classList.remove("leaving"); busy = false; }, FADE + 50);
        load(n + 1); // quietly get the next one ready
        schedule();
      });
    }

    function schedule() {
      clearTimeout(timer);
      if (!alive || reduceMotion || userPaused || hoverPaused || document.hidden) return;
      timer = setTimeout(function () { go(idx + 1); }, DELAY);
    }

    $$("[data-slide]", hero).forEach(function (b) {
      b.addEventListener("click", function () { go(idx + Number(b.getAttribute("data-slide"))); });
    });
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      pauseBtn.innerHTML = userPaused ? '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>';
      schedule();
    });
    var controls = $(".hero-controls", hero);
    controls.addEventListener("mouseenter", function () { hoverPaused = true; schedule(); });
    controls.addEventListener("mouseleave", function () { hoverPaused = false; schedule(); });
    controls.addEventListener("focusin", function () { hoverPaused = true; schedule(); });
    controls.addEventListener("focusout", function () { hoverPaused = false; schedule(); });
    function onVis() { schedule(); }
    document.addEventListener("visibilitychange", onVis);

    var sx = null;
    hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });

    // Start fetching the second photo once the first has painted
    var first = $("img", slides[0]);
    function ready() { load(1); schedule(); }
    if (first.complete) ready(); else first.addEventListener("load", ready, { once: true });

    cleanups.push(function () { alive = false; clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); });
  }

  function initParallax() {
    var band = $(".band", main), bg = $(".band-bg", main);
    if (!band || reduceMotion) return;
    var ticking = false;
    function update() {
      ticking = false;
      if (window.innerWidth < 900) { bg.style.transform = ""; return; }
      var r = band.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var off = (r.top + r.height / 2 - window.innerHeight / 2) * -0.12;
      bg.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    cleanups.push(function () { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); });
  }

  function catTile(c) {
    var href = "#/shop?cat=" + encodeURIComponent(c.id);
    if (c.image && IMG[c.image]) {
      return '<a class="cat reveal" href="' + href + '">' + pic(c.image, { alt: "", sizes: "(min-width:1100px) 290px, (min-width:700px) 30vw, 46vw" }) +
        '<span class="name">' + esc(c.name) + "</span></a>";
    }
    return '<a class="cat nophoto reveal" href="' + href + '">' + icon(c.icon, "cat-ico") + '<span class="name">' + esc(c.name) + "</span></a>";
  }
  function catGrid(withAll) {
    return '<div class="cat-grid">' + CATS.map(catTile).join("") +
      (withAll ? '<a class="cat all reveal" href="#/shop"><span class="name">View all products<small>Browse the full shop →</small></span></a>' : "") + "</div>";
  }

  function pageHome() {
    var fresh = ["fruit-veg", "meat-fish", "dairy", "bakery"];
    var freshDeals = PRODUCTS.filter(function (p) { return onSale(p) && fresh.indexOf(p.category) > -1; }).slice(0, 4);
    var greatDeals = PRODUCTS.filter(function (p) { return onSale(p) && fresh.indexOf(p.category) === -1; }).slice(0, 4);
    if (!greatDeals.length) greatDeals = PRODUCTS.filter(onSale).slice(0, 4);
    var popular = PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 8);

    var html = heroHTML() +
      '<div class="strip"><div class="wrap"><ul>' +
      '<li><span class="ico">' + icon("leaf") + "</span>Fresh produce</li>" +
      '<li><span class="ico">' + icon("basket") + "</span>Everyday groceries</li>" +
      '<li><span class="ico">' + icon("spray") + "</span>Household essentials</li>" +
      '<li><span class="ico">' + icon("tag") + "</span>Offers on selected items</li></ul></div></div>" +

      '<section class="section" aria-labelledby="h-cats"><div class="wrap">' +
      '<div class="section-head reveal"><div><h2 id="h-cats">Shop by Category</h2><p>Browse the aisles by what you need.</p></div></div>' +
      catGrid(true) + "</div></section>" +

      '<section class="section section-white" aria-labelledby="h-pop"><div class="wrap">' +
      '<div class="section-head reveal"><div><h2 id="h-pop">Popular Picks</h2><p>Everyday favourites from across the shop.</p></div><a class="link-arrow" href="#/shop?featured=1">See all picks →</a></div>' +
      '<div class="pgrid">' + popular.map(function (p) { return card(p, true); }).join("") + "</div></div></section>" +

      '<section class="band" aria-label="KatieB Supermarket"><div class="band-bg" aria-hidden="true">' + pic("hero-wall", { alt: "", sizes: "100vw", src: 1500 }) + "</div>" +
      '<div class="wrap inner reveal"><p>' + esc(C.tagline || "") + '</p><a class="btn btn-gold" href="#/shop">Start shopping</a></div></section>' +

      (freshDeals.length ? '<section class="section" aria-labelledby="h-fresh"><div class="wrap">' +
        '<div class="section-head reveal"><div><h2 id="h-fresh">Fresh Deals</h2><p>Selected fresh items at reduced prices.</p></div><a class="link-arrow" href="#/offers">All offers →</a></div>' +
        '<div class="pgrid">' + freshDeals.map(function (p) { return card(p, true); }).join("") + "</div></div></section>" : "") +

      (greatDeals.length ? '<section class="section deals" aria-labelledby="h-deals"><div class="wrap">' +
        '<div class="section-head reveal"><div><p class="eyebrow-dark">Special offers</p><h2 id="h-deals">Great Deals at KatieB Supermarket</h2></div></div>' +
        '<div class="pgrid">' + greatDeals.map(function (p) { return card(p, true); }).join("") + "</div>" +
        '<div class="deals-cta"><a class="btn btn-primary" href="#/offers">Shop All Offers</a></div></div></section>' : "") +

      '<section class="section section-white" aria-labelledby="h-about"><div class="wrap split">' +
      '<div class="reveal"><p class="eyebrow-dark">About us</p><h2 id="h-about">Everyday shopping, all in one place</h2>' +
      "<p>From fresh fruit and vegetables to rice, drinks, household supplies and baby products, KatieB Supermarket is built around the things you buy every week.</p>" +
      '<ul class="check"><li>Fresh produce, meat, dairy and bakery</li><li>Rice, pasta, drinks, snacks and frozen foods</li><li>Cleaning, personal care and baby products</li></ul>' +
      '<a class="btn btn-outline" href="#/about">Learn more</a></div>' +
      '<div class="reveal">' + pic("about-checkout", { alt: "A cashier smiling at a supermarket checkout while a customer unpacks a basket", sizes: "(min-width:900px) 560px, 92vw", src: 1024 }) +
      '<p class="photo-note">Illustrative stock photograph.</p></div></div></section>';
    return { html: html, title: "KatieB Supermarket | Fresh Groceries and Everyday Essentials", after: function () { initHero(); initParallax(); } };
  }

  /* ---------- Shop / offers ---------- */
  function filterProducts(st) {
    var q = st.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      if (st.cat && p.category !== st.cat) return false;
      if (st.offers && !onSale(p)) return false;
      if (st.featured && !p.featured) return false;
      if (q) {
        var hay = (p.name + " " + p.description + " " + ((catById[p.category] || {}).name || "")).toLowerCase();
        if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) === -1; })) return false;
      }
      return true;
    });
    var order = {}; PRODUCTS.forEach(function (p, i) { order[p.id] = i; });
    list.sort(function (a, b) {
      switch (st.sort) {
        case "price-asc": return priceOf(a) - priceOf(b);
        case "price-desc": return priceOf(b) - priceOf(a);
        case "name": return a.name.localeCompare(b.name);
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[a.id] - order[b.id];
      }
    });
    return list;
  }

  function pageShop(qs, mode) {
    var st = {
      cat: catById[qs.get("cat")] ? qs.get("cat") : "",
      q: qs.get("q") || "",
      sort: ["featured", "price-asc", "price-desc", "name"].indexOf(qs.get("sort")) > -1 ? qs.get("sort") : "featured",
      offers: mode === "offers" || qs.get("offers") === "1",
      featured: qs.get("featured") === "1"
    };
    var heading = mode === "offers" ? "Special Offers" : st.cat ? catById[st.cat].name : st.featured ? "Popular Picks" : "Shop";
    var sub = mode === "offers" ? "Items currently priced below their normal price." : "Search, filter and sort the full catalogue.";
    var base = mode === "offers" ? "#/offers" : "#/shop";

    var html = '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / ' + esc(heading) + "</nav>" +
      "<h1>" + esc(heading) + "</h1><p>" + esc(sub) + "</p></div></div>" +
      '<div class="wrap page">' + demoNotice() +
      '<div class="shop"><details class="filters" id="filters"' + (window.innerWidth > 900 ? " open" : "") + "><summary>Filters</summary><div class=\"filters-body\">" +
      '<fieldset><legend>Category</legend>' +
      '<label><input type="radio" name="cat" value=""' + (st.cat ? "" : " checked") + "> All categories</label>" +
      CATS.map(function (c) { return '<label><input type="radio" name="cat" value="' + c.id + '"' + (st.cat === c.id ? " checked" : "") + "> " + esc(c.name) + "</label>"; }).join("") +
      "</fieldset><fieldset><legend>Show only</legend>" +
      (mode === "offers" ? "" : '<label><input type="checkbox" name="offers"' + (st.offers ? " checked" : "") + "> On offer</label>") +
      '<label><input type="checkbox" name="featured"' + (st.featured ? " checked" : "") + "> Popular picks</label>" +
      '</fieldset><button class="btn btn-outline btn-sm" type="button" id="clearFilters">Clear filters</button></div></details>' +
      "<div><div class=\"toolbar\"><div class=\"field-search\"><label class=\"sr\" for=\"sq\">Search products</label>" +
      '<input id="sq" type="search" placeholder="Search products" value="' + esc(st.q) + '" autocomplete="off"></div>' +
      '<label class="sr" for="ssort">Sort by</label><select id="ssort">' +
      [["featured", "Featured first"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name: A to Z"]]
        .map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
      '</select></div><p class="count" id="count" aria-live="polite"></p><div id="results"></div></div></div></div>';

    function readState() {
      var f = $("#filters", main);
      st.cat = (f.querySelector('input[name="cat"]:checked') || {}).value || "";
      st.q = $("#sq", main).value;
      st.sort = $("#ssort", main).value;
      var o = f.querySelector('input[name="offers"]');
      st.offers = mode === "offers" ? true : !!(o && o.checked);
      st.featured = !!f.querySelector('input[name="featured"]').checked;
    }
    function urlFor() {
      var p = new URLSearchParams();
      if (st.cat) p.set("cat", st.cat);
      if (st.q.trim()) p.set("q", st.q.trim());
      if (st.sort !== "featured") p.set("sort", st.sort);
      if (mode !== "offers" && st.offers) p.set("offers", "1");
      if (st.featured) p.set("featured", "1");
      var s = p.toString();
      return base + (s ? "?" + s : "");
    }
    function renderResults() {
      var list = filterProducts(st);
      $("#count", main).textContent = list.length + (list.length === 1 ? " product" : " products") + (st.q.trim() ? ' for "' + st.q.trim() + '"' : "");
      $("#results", main).innerHTML = list.length
        ? '<div class="pgrid shop-grid">' + list.map(function (p) { return card(p, false); }).join("") + "</div>"
        : '<div class="empty"><h2>No products found</h2><p>Try a different spelling, another category, or clear your filters.</p><button class="btn btn-primary btn-sm" type="button" data-clear>Clear filters</button></div>';
    }
    function onChange() {
      readState();
      history.replaceState(null, "", urlFor());
      renderResults();
    }
    function clearAll() {
      var f = $("#filters", main);
      f.querySelector('input[name="cat"][value=""]').checked = true;
      $("#sq", main).value = ""; $("#ssort", main).value = "featured";
      $$('input[type=checkbox]', f).forEach(function (c) { c.checked = false; });
      onChange();
    }
    return {
      html: html,
      title: (mode === "offers" ? "Special Offers" : st.cat ? catById[st.cat].name : "Shop") + " | KatieB Supermarket",
      after: function () {
        renderResults();
        $("#filters", main).addEventListener("change", onChange);
        $("#sq", main).addEventListener("input", onChange);
        $("#ssort", main).addEventListener("change", onChange);
        $("#clearFilters", main).addEventListener("click", clearAll);
        $("#results", main).addEventListener("click", function (e) { if (e.target.closest("[data-clear]")) clearAll(); });
      }
    };
  }

  function pageCategories() {
    return {
      html: '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / Categories</nav><h1>Shop by Category</h1><p>Choose a category to see its products.</p></div></div>' +
        '<div class="wrap page">' + catGrid(true) + "</div>",
      title: "Categories | KatieB Supermarket"
    };
  }

  /* ---------- Product page ---------- */
  function pageProduct(id) {
    var p = byId[id];
    if (!p) return page404();
    var c = catById[p.category] || {};
    var sale = onSale(p);
    var related = PRODUCTS.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 4);
    var s = stepOf(p);
    var html = '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/shop">Shop</a> / <a href="#/shop?cat=' +
      encodeURIComponent(c.id) + '">' + esc(c.name) + "</a> / " + esc(p.name) + "</nav></div></div>" +
      '<div class="wrap page">' + demoNotice(true) + '<div class="pdp"><div class="pdp-media">' + productMedia(p, "(min-width:900px) 560px, 92vw") + "</div><div>" +
      '<p class="pcat">' + esc(c.name) + "</p><h1>" + esc(p.name) + "</h1>" +
      '<p class="price"><strong>' + money(priceOf(p)) + "</strong>" + (sale ? "<s>" + money(p.price) + "</s>" : "") + '<span class="unit">' + esc(p.unit) + "</span></p>" +
      (sale ? '<p class="save">Save ' + money(p.price - p.salePrice) + " (" + pct(p) + "% off)</p>" : "") +
      (p.stock === "in" ? '<p class="stock-in">In stock</p>' : p.stock === "out" ? '<p class="stock-out">Out of stock</p>' : "") +
      "<p>" + esc(p.description) + "</p>" +
      (p.stock === "out" ? "" :
        '<div class="buyrow"><div class="qty" role="group" aria-label="Quantity">' +
        '<button type="button" id="pdq-dec" aria-label="Decrease quantity">−</button>' +
        '<input id="pdq" type="number" inputmode="decimal" min="' + s + '" max="' + (p.maxQty || 50) + '" step="' + s + '" value="' + s + '" aria-label="Quantity">' +
        '<button type="button" id="pdq-inc" aria-label="Increase quantity">+</button></div>' +
        '<button class="btn btn-primary" type="button" id="pdAdd">Add to cart</button></div>') +
      '<p class="photo-note">Pack size / price basis: ' + esc(p.unit) + (s < 1 ? ". Sold by weight in steps of " + s + "." : ".") + "</p>" +
      "</div></div>" +
      (related.length ? '<section style="margin-top:48px" aria-labelledby="h-rel"><h2 id="h-rel">More from ' + esc(c.name) + '</h2><div class="pgrid">' + related.map(function (r) { return card(r, false); }).join("") + "</div></section>" : "") +
      "</div>";
    return {
      html: html, title: p.name + " | KatieB Supermarket",
      after: function () {
        var inp = $("#pdq", main); if (!inp) return;
        function fix() { inp.value = qtyText(clampQty(p, inp.value)); }
        $("#pdq-dec", main).addEventListener("click", function () { inp.value = qtyText(clampQty(p, Number(inp.value) - s)); });
        $("#pdq-inc", main).addEventListener("click", function () { inp.value = qtyText(clampQty(p, Number(inp.value) + s)); });
        inp.addEventListener("change", fix);
        $("#pdAdd", main).addEventListener("click", function (e) {
          fix();
          if (addToCart(p.id, Number(inp.value))) flash(e.currentTarget);
        });
      }
    };
  }

  function demoNotice(short) {
    if (!C.demoMode) return "";
    return '<div class="notice"><strong>Demo store.</strong> ' + (short ? "This is a sample product with a sample price." : "Products, prices and offers on this site are samples until KatieB Supermarket adds its real catalogue.") + "</div>";
  }
  function flash(btn) {
    if (!btn || btn.dataset.busy) return;
    var old = btn.textContent;
    btn.dataset.busy = "1"; btn.classList.add("added"); btn.textContent = "Added ✓";
    setTimeout(function () { btn.textContent = old; btn.classList.remove("added"); delete btn.dataset.busy; }, 1300);
  }

  /* ---------- Cart ---------- */
  function totals(optId, decided) {
    var sub = subtotal(), d = deliveryCalc(sub, optId, decided);
    return { sub: sub, d: d, total: round2(sub + (d.amount || 0)), pending: d.amount === null };
  }
  function summaryRows(t) {
    return '<dl><div class="row"><dt>Subtotal</dt><dd>' + money(t.sub) + "</dd></div>" +
      '<div class="row"><dt>Delivery</dt><dd>' + esc(t.d.text) + "</dd></div>" +
      '<div class="row total"><dt>Total</dt><dd>' + money(t.total) + "</dd></div></dl>" +
      (t.pending ? '<p class="small">Total excludes delivery until KatieB confirms the delivery charge.</p>' : "");
  }
  function thumb(p) { return '<div class="thumb">' + productMedia(p, "84px") + "</div>"; }

  function cartBody() {
    if (!cart.length) {
      return '<div class="empty"><h2>Your cart is empty</h2><p>Add some groceries and they will show up here.</p><a class="btn btn-primary" href="#/shop">Continue shopping</a></div>';
    }
    var t = totals("delivery", false);
    return '<div class="cart-layout"><div class="lines" role="list">' + cart.map(function (l) {
      var p = byId[l.id], s = stepOf(p);
      return '<div class="line" role="listitem">' + thumb(p) + "<div>" +
        '<h3><a href="#/product/' + encodeURIComponent(p.id) + '">' + esc(p.name) + "</a></h3>" +
        '<p class="meta">' + money(priceOf(p)) + " " + esc(p.unit) + "</p>" +
        '<div class="line-actions"><div class="qty" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
        '<button type="button" data-dec="' + esc(p.id) + '" aria-label="Decrease quantity of ' + esc(p.name) + '">−</button>' +
        '<input type="number" inputmode="decimal" data-qty="' + esc(p.id) + '" min="' + s + '" max="' + (p.maxQty || 50) + '" step="' + s + '" value="' + qtyText(l.qty) + '" aria-label="Quantity of ' + esc(p.name) + '">' +
        '<button type="button" data-inc="' + esc(p.id) + '" aria-label="Increase quantity of ' + esc(p.name) + '">+</button></div>' +
        '<button class="linkbtn" type="button" data-remove="' + esc(p.id) + '">Remove</button></div></div>' +
        '<div class="line-total">' + money(priceOf(p) * l.qty) + "</div></div>";
    }).join("") + '</div><aside class="summary" aria-labelledby="h-sum"><h2 id="h-sum">Order summary</h2>' + summaryRows(t) +
      '<a class="btn btn-primary" href="#/checkout">Proceed to checkout</a><a class="btn btn-outline" href="#/shop" style="margin-top:10px">Continue shopping</a></aside></div>';
  }
  function pageCart() {
    return {
      html: '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / Cart</nav><h1>Your cart</h1></div></div><div class="wrap page">' + demoNotice() + '<div id="cartBody">' + cartBody() + "</div></div>",
      title: "Your Cart | KatieB Supermarket"
    };
  }
  function rerenderCart(focusSel) {
    var box = $("#cartBody");
    if (!box) return;
    box.innerHTML = cartBody();
    if (focusSel) { var f = $(focusSel, box); if (f) f.focus(); }
  }

  /* ---------- Checkout (demo until a backend is connected) ---------- */
  function orderText(v, t, optLabel) {
    var lines = cart.map(function (l) {
      var p = byId[l.id];
      return "• " + p.name + " × " + qtyText(l.qty) + " (" + money(priceOf(p)) + " " + p.unit + ") = " + money(priceOf(p) * l.qty);
    });
    return "New order request – " + (C.name || "KatieB Supermarket") + "\n\n" + lines.join("\n") +
      "\n\nSubtotal: " + money(t.sub) + "\nDelivery: " + t.d.text + "\nTotal: " + money(t.total) + (t.pending ? " (excluding delivery)" : "") +
      "\n\nName: " + v.name + "\nPhone: " + v.phone + (v.email ? "\nEmail: " + v.email : "") +
      "\nDelivery option: " + optLabel + (v.address ? "\nAddress: " + v.address : "") +
      (v.notes ? "\nInstructions: " + v.notes : "") + (v.payment ? "\nPreferred payment: " + v.payment : "");
  }

  function pageCheckout() {
    if (!cart.length) {
      return { html: '<div class="page-head"><div class="wrap"><h1>Checkout</h1></div></div><div class="wrap page"><div class="empty"><h2>Your cart is empty</h2><p>Add products before checking out.</p><a class="btn btn-primary" href="#/shop">Go to the shop</a></div></div>', title: "Checkout | KatieB Supermarket" };
    }
    var opts = D.options && D.options.length ? D.options : [{ id: "delivery", label: "Home delivery" }];
    var pays = C.payments || [];
    var html = '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/cart">Cart</a> / Checkout</nav><h1>Checkout</h1></div></div>' +
      '<div class="wrap page">' + demoNotice() + '<div class="cart-layout"><form class="form panel" id="checkoutForm" novalidate>' +
      '<div class="two"><div><label for="c-name">Full name</label><input id="c-name" name="name" autocomplete="name" required aria-describedby="e-name"><p class="err" id="e-name" hidden></p></div>' +
      '<div><label for="c-phone">Phone number</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required aria-describedby="e-phone"><p class="err" id="e-phone" hidden></p></div></div>' +
      '<div><label for="c-email">Email address' + (C.requireEmail ? "" : ' <span class="opt">(optional)</span>') + '</label><input id="c-email" name="email" type="email" autocomplete="email" aria-describedby="e-email"' + (C.requireEmail ? " required" : "") + '><p class="err" id="e-email" hidden></p></div>' +
      '<fieldset><legend>Delivery option</legend>' + opts.map(function (o, i) {
        return '<label class="radio"><input type="radio" name="option" value="' + esc(o.id) + '"' + (i === 0 ? " checked" : "") + "> " + esc(o.label) + "</label>";
      }).join("") + "</fieldset>" +
      '<div id="addrBox"><label for="c-address">Delivery address</label><textarea id="c-address" name="address" rows="3" autocomplete="street-address" aria-describedby="e-address"></textarea><p class="err" id="e-address" hidden></p></div>' +
      '<div><label for="c-notes">Delivery instructions <span class="opt">(optional)</span></label><textarea id="c-notes" name="notes" rows="2"></textarea></div>' +
      (pays.length ? '<fieldset><legend>Payment method</legend>' + pays.map(function (m, i) {
        return '<label class="radio"><input type="radio" name="payment" value="' + esc(m) + '"' + (i === 0 ? " checked" : "") + "> " + esc(m) + "</label>";
      }).join("") + '<p class="photo-note">No payment is taken on this website. KatieB confirms the payment details when they reply to your order.</p></fieldset>'
        : '<p class="photo-note">No payment is taken on this website. Payment is agreed with KatieB when they confirm your order.</p>') +
      '<div role="alert" id="formAlert" class="err" hidden></div>' +
      '<button class="btn btn-primary" type="submit">' + (waDigits() ? "Send order request on WhatsApp" : "Place order (demo)") + "</button>" +
      '<div id="checkoutResult" role="status" aria-live="polite"></div></form>' +
      '<aside class="summary" aria-labelledby="h-sum"><h2 id="h-sum">Order summary</h2><ul class="sum-items">' +
      cart.map(function (l) { var p = byId[l.id]; return "<li><span>" + esc(p.name) + " × " + qtyText(l.qty) + "</span><span>" + money(priceOf(p) * l.qty) + "</span></li>"; }).join("") +
      '</ul><div id="sumRows"></div><a class="linkbtn" href="#/cart" style="color:var(--forest)">Edit cart</a></aside></div></div>';

    return {
      html: html, title: "Checkout | KatieB Supermarket",
      after: function () {
        var form = $("#checkoutForm", main);
        function opt() { return (form.querySelector('input[name="option"]:checked') || {}).value || "delivery"; }
        function refresh() {
          $("#sumRows", main).innerHTML = summaryRows(totals(opt(), true));
          $("#addrBox", main).hidden = opt() === "pickup";
        }
        refresh();
        form.addEventListener("change", function (e) { if (e.target.name === "option") refresh(); });

        function setErr(field, msg) {
          var inp = form.elements[field], e = $("#e-" + field, main);
          if (!e) return;
          e.hidden = !msg; e.textContent = msg || "";
          if (inp) inp.setAttribute("aria-invalid", msg ? "true" : "false");
        }
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          var v = {
            name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(),
            email: form.elements.email.value.trim(), address: form.elements.address.value.trim(),
            notes: form.elements.notes.value.trim(),
            payment: (form.querySelector('input[name="payment"]:checked') || {}).value || ""
          };
          var o = opt(), bad = [];
          var digits = v.phone.replace(/\D/g, "");
          setErr("name", v.name.length < 2 ? "Please enter your full name." : ""); if (v.name.length < 2) bad.push("name");
          var phoneBad = !/^[+\d\s()-]+$/.test(v.phone) || digits.length < 7 || digits.length > 15;
          setErr("phone", phoneBad ? "Enter a valid phone number (7–15 digits)." : ""); if (phoneBad) bad.push("phone");
          var emailBad = (C.requireEmail && !v.email) || (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email));
          setErr("email", emailBad ? "Enter a valid email address." : ""); if (emailBad) bad.push("email");
          var addrBad = o !== "pickup" && v.address.length < 6;
          setErr("address", addrBad ? "Please enter your delivery address." : ""); if (addrBad) bad.push("address");
          var alertBox = $("#formAlert", main);
          if (bad.length) {
            alertBox.hidden = false; alertBox.textContent = "Please fix the highlighted fields.";
            form.elements[bad[0]].focus();
            return;
          }
          alertBox.hidden = true;
          var t = totals(o, true);
          var optLabel = (opts.filter(function (x) { return x.id === o; })[0] || {}).label || o;
          var text = orderText(v, t, optLabel);
          var res = $("#checkoutResult", main);
          var link = waLink(text);
          if (link) {
            window.open(link, "_blank", "noopener");
            res.innerHTML = '<div class="result info"><strong>Order request opened in WhatsApp.</strong> Press send there to submit it. Your order is <b>not confirmed</b> until KatieB replies, and no payment has been taken on this website.</div>';
          } else {
            res.innerHTML = '<div class="result info"><strong>Demo checkout – nothing was submitted.</strong> No order has been placed and no payment was taken. To accept real orders, add KatieB\'s WhatsApp number in <code>js/config.js</code> or connect an order backend (see README).</div>';
          }
        });
      }
    };
  }

  /* ---------- About / contact / policies ---------- */
  function tbc(v, fallback) { return v ? esc(v) : '<span class="tbc">' + (fallback || "To be added") + "</span>"; }

  function pageAbout() {
    return {
      title: "About Us | KatieB Supermarket",
      html: '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / About Us</nav><h1>About KatieB Supermarket</h1><p>' + esc(C.tagline || "") + "</p></div></div>" +
        '<div class="wrap page"><div class="split"><div class="prose"><h2 style="margin-top:0">What we offer</h2>' +
        "<p>KatieB Supermarket brings everyday shopping together: fresh fruits and vegetables, meat and poultry, dairy and eggs, bread and bakery, rice, grains and pasta, drinks, snacks, frozen foods, cleaning and household supplies, personal care and baby products.</p>" +
        "<h2>Our approach</h2><p>We want buying groceries and household essentials to be simple, with clear prices and friendly help when you need it. Questions about a product, an order or delivery? Get in touch and we will help.</p>" +
        '<p><a class="btn btn-primary" href="#/shop">Start shopping</a> <a class="btn btn-outline" href="#/contact">Contact us</a></p></div>' +
        "<div>" + pic("hero-aisle", { alt: "A bright supermarket aisle with stocked shelves", sizes: "(min-width:900px) 560px, 92vw", src: 1024 }) +
        '<p class="photo-note">Illustrative stock photograph, not a picture of a KatieB Supermarket branch.</p></div></div>' +
        '<div class="panel" style="margin-top:32px"><h2 style="font-size:1.2rem">Business details</h2><ul class="contact-list">' +
        "<li><b>Address</b><span>" + tbc(C.address) + "</span></li><li><b>Opening hours</b><span>" + tbc(C.hours) + "</span></li>" +
        "<li><b>Delivery area</b><span>" + tbc(D.coverage) + "</span></li></ul></div></div>"
    };
  }

  function pageContact() {
    var wa = waDigits();
    var html = '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / Contact</nav><h1>Contact us</h1><p>Questions about products, orders or delivery? Send us a message.</p></div></div>' +
      '<div class="wrap page"><div class="split" style="align-items:start"><div><ul class="contact-list">' +
      "<li><b>WhatsApp</b><span>" + (wa ? '<a href="' + waLink("Hello, I would like to make an enquiry.") + '" target="_blank" rel="noopener">+' + esc(wa) + "</a>" : tbc()) + "</span></li>" +
      "<li><b>Phone</b><span>" + (C.phone ? '<a href="tel:' + esc(String(C.phone).replace(/[^\d+]/g, "")) + '">' + esc(C.phone) + "</a>" : tbc()) + "</span></li>" +
      "<li><b>Email</b><span>" + (C.email ? '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>" : tbc()) + "</span></li>" +
      "<li><b>Address</b><span>" + tbc(C.address) + "</span></li><li><b>Opening hours</b><span>" + tbc(C.hours) + "</span></li></ul>" + socialHTML("") + "</div>" +
      '<form class="form panel" id="contactForm" novalidate><h2 style="font-size:1.3rem;margin:0">Send a message</h2>' +
      (wa || C.email ? "" : '<div class="notice" style="margin:0"><strong>Demo form.</strong> It will start working once KatieB adds a WhatsApp number or email in <code>js/config.js</code>.</div>') +
      '<div><label for="m-name">Your name</label><input id="m-name" name="name" autocomplete="name" aria-describedby="e-mname"><p class="err" id="e-mname" hidden></p></div>' +
      '<div><label for="m-contact">Phone or email</label><input id="m-contact" name="contact" autocomplete="email" aria-describedby="e-mcontact"><p class="err" id="e-mcontact" hidden></p></div>' +
      '<div><label for="m-msg">Message</label><textarea id="m-msg" name="msg" rows="5" aria-describedby="e-mmsg"></textarea><p class="err" id="e-mmsg" hidden></p></div>' +
      '<button class="btn btn-primary" type="submit">Send message</button><div id="contactResult" role="status" aria-live="polite"></div></form></div></div>';
    return {
      html: html, title: "Contact | KatieB Supermarket",
      after: function () {
        var form = $("#contactForm", main);
        function setErr(id, msg, input) { var e = $("#e-" + id, main); e.hidden = !msg; e.textContent = msg || ""; input.setAttribute("aria-invalid", msg ? "true" : "false"); }
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          var n = form.elements.name, c = form.elements.contact, m = form.elements.msg, first = null;
          var nb = n.value.trim().length < 2, cb = !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim()) || c.value.replace(/\D/g, "").length >= 7), mb = m.value.trim().length < 5;
          setErr("mname", nb ? "Please enter your name." : "", n); setErr("mcontact", cb ? "Enter a valid phone number or email." : "", c); setErr("mmsg", mb ? "Please write a short message." : "", m);
          first = nb ? n : cb ? c : mb ? m : null;
          if (first) { first.focus(); return; }
          var text = "Message from " + n.value.trim() + " (" + c.value.trim() + "):\n\n" + m.value.trim();
          var res = $("#contactResult", main);
          if (waDigits()) {
            window.open(waLink(text), "_blank", "noopener");
            res.innerHTML = '<div class="result info">WhatsApp opened with your message. Press send there to deliver it.</div>';
          } else if (C.email) {
            window.location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent("Enquiry from the website") + "&body=" + encodeURIComponent(text);
            res.innerHTML = '<div class="result info">Your email app should open with the message ready to send.</div>';
          } else {
            res.innerHTML = '<div class="result info"><strong>Demo form – nothing was sent.</strong> Add a WhatsApp number or email in <code>js/config.js</code> to receive messages.</div>';
          }
        });
      }
    };
  }

  function pageDelivery() {
    var fee = typeof D.fee === "number" ? money(D.fee) : null;
    return {
      title: "Delivery and Returns | KatieB Supermarket",
      html: '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / Delivery and Returns</nav><h1>Delivery and returns</h1></div></div><div class="wrap page"><div class="prose">' +
        "<h2>Delivery area</h2><p>" + tbc(D.coverage, "Delivery coverage will be published here once confirmed.") + "</p>" +
        "<h2>Delivery charges</h2><p>" + (fee ? "Delivery costs " + fee + "." + (typeof D.freeAbove === "number" ? " Orders of " + money(D.freeAbove) + " or more qualify for free delivery." : "") : tbc("Delivery charges will be confirmed by KatieB when your order is received.")) + "</p>" +
        (D.note ? "<p>" + esc(D.note) + "</p>" : "") +
        "<h2>Returns</h2><p>" + tbc("", "Returns information will be published here once KatieB has set its policy.") + "</p></div></div>"
    };
  }
  function pageLegal(kind) {
    var isPriv = kind === "privacy";
    var body = isPriv
      ? "<h2>What this website stores</h2><p>Your shopping cart is saved only in your own browser so it is still there if you refresh the page. We do not run accounts on this website.</p>" +
        "<h2>When you place an order or send a message</h2><p>The details you enter (name, phone, email, address and instructions) are used only to prepare the order request or message you send. When WhatsApp or email is used, that message is handled by the service you choose.</p>" +
        "<h2>Payments</h2><p>This website does not collect or store card details.</p>" +
        "<h2>Contact</h2><p>Questions about your information? Use the <a href=\"#/contact\">contact page</a>.</p>"
      : "<h2>Using this website</h2><p>Product information, prices and availability may change. An order request is not an accepted order until KatieB Supermarket confirms it with you.</p>" +
        "<h2>Prices and payment</h2><p>Prices are shown in naira (" + esc(C.currency || "₦") + "). Payment arrangements are confirmed when KatieB replies to your order request.</p>" +
        "<h2>Delivery and returns</h2><p>See the <a href=\"#/delivery\">delivery and returns</a> page.</p>";
    return {
      title: (isPriv ? "Privacy Policy" : "Terms and Conditions") + " | KatieB Supermarket",
      html: '<div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / ' + (isPriv ? "Privacy Policy" : "Terms and Conditions") + "</nav><h1>" + (isPriv ? "Privacy Policy" : "Terms and Conditions") + "</h1></div></div>" +
        '<div class="wrap page"><div class="notice"><strong>Draft text.</strong> This is a simple starting draft. KatieB Supermarket should have it reviewed and completed before launch.</div><div class="prose">' + body + "</div></div>"
    };
  }
  function page404() {
    return { title: "Page not found | KatieB Supermarket", html: '<div class="wrap page"><div class="empty"><h1>Page not found</h1><p>That page does not exist.</p><a class="btn btn-primary" href="#/">Back to the homepage</a></div></div>' };
  }

  /* ================================================================
   * Header / footer / router
   * ================================================================ */
  function socialHTML(cls) {
    var names = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", x: "X" };
    var s = C.social || {}, out = "";
    Object.keys(names).forEach(function (k) { if (s[k]) out += '<a href="' + esc(s[k]) + '" target="_blank" rel="noopener">' + names[k] + "</a>"; });
    return out ? '<div class="social ' + cls + '">' + out + "</div>" : "";
  }
  function renderFooter() {
    var wa = waDigits();
    $("#siteFooter").innerHTML = '<div class="wrap"><div class="foot-grid">' +
      '<div><a class="logo" href="#/"><svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#22C55E"/><path d="M9 17h22l-2.5 12.5a2 2 0 0 1-2 1.5h-13a2 2 0 0 1-2-1.5z" fill="#14532D"/><path d="M14 17l4-6M26 17l-4-6" stroke="#14532D" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M20 14c0-4 3-6 7-6 0 4-3 6-7 6z" fill="#FBBF24"/></svg><span class="logo-text"><b>KatieB</b><small>Supermarket</small></span></a>' +
      '<p class="tag">' + esc(C.tagline || "") + "</p>" + socialHTML("") + "</div>" +
      '<div><h2>Quick links</h2><ul><li><a href="#/">Home</a></li><li><a href="#/shop">Shop</a></li><li><a href="#/offers">Special Offers</a></li><li><a href="#/about">About Us</a></li><li><a href="#/contact">Contact</a></li><li><a href="#/cart">Cart</a></li></ul></div>' +
      "<div><h2>Categories</h2><ul>" + CATS.slice(0, 6).map(function (c) { return '<li><a href="#/shop?cat=' + c.id + '">' + esc(c.name) + "</a></li>"; }).join("") + '<li><a href="#/categories">All categories</a></li></ul></div>' +
      "<div><h2>Contact</h2><ul>" +
      "<li>" + (wa ? 'WhatsApp: <a href="' + waLink("Hello") + '" target="_blank" rel="noopener">+' + esc(wa) + "</a>" : "WhatsApp: coming soon") + "</li>" +
      (C.phone ? "<li>Phone: " + esc(C.phone) + "</li>" : "") + (C.email ? '<li>Email: <a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a></li>" : "") +
      (C.address ? "<li>" + esc(C.address) + "</li>" : "") + (C.hours ? "<li>" + esc(C.hours) + "</li>" : "") +
      '<li><a href="#/delivery">Delivery and returns</a></li><li><a href="#/privacy">Privacy Policy</a></li><li><a href="#/terms">Terms and Conditions</a></li></ul></div></div>' +
      '<div class="foot-bottom"><p>&copy; ' + new Date().getFullYear() + " " + esc(C.name || "KatieB Supermarket") + ". All rights reserved.</p><p>Photographs are illustrative stock images.</p></div></div>";
  }

  function parseRoute() {
    var h = location.hash.slice(1) || "/";
    var i = h.indexOf("?");
    return { path: i > -1 ? h.slice(0, i) : h, qs: new URLSearchParams(i > -1 ? h.slice(i + 1) : "") };
  }
  var NAVKEY = { "/": "home", "/shop": "shop", "/categories": "categories", "/offers": "offers", "/about": "about", "/contact": "contact" };

  function route() {
    cleanups.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    var r = parseRoute(), page;
    var m = r.path.match(/^\/product\/(.+)$/);
    if (r.path === "/") page = pageHome();
    else if (r.path === "/shop") page = pageShop(r.qs, "shop");
    else if (r.path === "/offers") page = pageShop(r.qs, "offers");
    else if (r.path === "/categories") page = pageCategories();
    else if (m) page = pageProduct(decodeURIComponent(m[1]));
    else if (r.path === "/cart") page = pageCart();
    else if (r.path === "/checkout") page = pageCheckout();
    else if (r.path === "/about") page = pageAbout();
    else if (r.path === "/contact") page = pageContact();
    else if (r.path === "/delivery") page = pageDelivery();
    else if (r.path === "/privacy") page = pageLegal("privacy");
    else if (r.path === "/terms") page = pageLegal("terms");
    else page = page404();

    main.innerHTML = page.html;
    document.title = page.title;
    var key = NAVKEY[r.path] || (m ? "shop" : "");
    $$("#mainNav a").forEach(function (a) {
      if (a.getAttribute("data-nav") === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    closeMenu();
    window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    if (page.after) page.after();
    observeReveals();
  }

  /* ---------------- header behaviour ---------------- */
  var header = $("#siteHeader"), menuBtn = $("#menuBtn");
  function closeMenu() { header.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Open menu"); }
  menuBtn.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("scroll", function () { header.classList.toggle("scrolled", window.scrollY > 10); }, { passive: true });
  $("#headerSearch").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("#hq").value.trim();
    location.hash = "#/shop" + (q ? "?q=" + encodeURIComponent(q) : "");
    $("#hq").value = "";
  });

  /* ---------------- global click handling ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    var id;
    if ((id = t.getAttribute("data-add"))) { if (addToCart(id)) flash(t); return; }
    if ((id = t.getAttribute("data-inc"))) { var l = cart.filter(function (x) { return x.id === id; })[0]; if (l) setQty(id, l.qty + stepOf(byId[id])); rerenderCart('[data-inc="' + id + '"]'); return; }
    if ((id = t.getAttribute("data-dec"))) { var l2 = cart.filter(function (x) { return x.id === id; })[0]; if (l2) setQty(id, l2.qty - stepOf(byId[id])); rerenderCart('[data-dec="' + id + '"]'); return; }
    if ((id = t.getAttribute("data-remove"))) { removeLine(id); rerenderCart(cart.length ? '[data-remove]' : ".empty a"); toast("Item removed"); return; }
  });
  document.addEventListener("change", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-qty");
    if (id) { setQty(id, e.target.value); rerenderCart('[data-qty="' + id + '"]'); }
  });

  /* broken image fallback: hide the broken icon, keep the layout */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && !t.dataset.failed) {
      t.dataset.failed = "1"; t.removeAttribute("srcset"); t.style.visibility = "hidden";
      var box = t.parentNode;
      if (box && /pmedia|thumb|pdp-media/.test(box.className)) box.insertAdjacentHTML("beforeend", placeholder("fruit-veg", "Photo unavailable"));
    }
  }, true);

  /* ---------------- start ---------------- */
  var ann = $("#announce");
  if (C.announcement) { ann.textContent = C.announcement; ann.hidden = false; }
  renderFooter();
  updateBadge();
  window.addEventListener("hashchange", route);
  route();
})();
