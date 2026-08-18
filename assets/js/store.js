/* ============================================================================
   CADENCE — shared storefront runtime
   Single non-module IIFE. Plain ES5 syntax so it runs from file:// anywhere.

   Exposes window.Cadence. Self-initialises on DOMContentLoaded:
   header, footer and cart drawer are injected, [data-pack] stages are drawn,
   plan selectors are wired, and clicks on [data-add] are handled globally.

   Every internal link is built from window.CADENCE_ROOT so pages at any
   directory depth resolve correctly on file:// and on python3 -m http.server.
   ========================================================================== */
(function () {
  "use strict";

  var FREE_SHIP = 45;
  var STORE_KEY = "cadence-cart";

  function root() {
    return (typeof window.CADENCE_ROOT === "string" && window.CADENCE_ROOT) || "./";
  }
  function url(path) {
    return root() + path;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function money(n) {
    var v = Number(n) || 0;
    return v % 1 === 0 ? "$" + v : "$" + v.toFixed(2);
  }
  function el(id) { return document.getElementById(id); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function qsa(sel, scope) { return (scope || document).querySelectorAll(sel); }

  /* ═══════════════════ catalogue ═══════════════════ */

  var CATALOG = [
    {
      id: "build", kind: "product", name: "Build", color: "--build", tint: "--build-t", form: "stick",
      what: "Everyday strength and performance. Supports strength, muscle, exercise performance and recovery.",
      keys: "Creatine monohydrate 5 g · taurine 1 g · L-theanine 100 mg · B12 · electrolyte base",
      size: "30 servings", freq: "Every day", sub: 29, once: 34, url: "products/build.html"
    },
    {
      id: "ease", kind: "product", name: "Ease", color: "--ease", tint: "--ease-t", form: "bottle",
      what: "Support for the second half of your cycle — comfort, mood, fluid balance and calm through the luteal phase.",
      keys: "Magnesium glycinate 200 mg · saffron extract 30 mg · vitamin B6 25 mg · zinc 15 mg",
      size: "24 capsules · one cycle", freq: "2/day, 12 days", sub: 29, once: 34, url: "products/ease.html"
    },
    {
      id: "flow", kind: "product", name: "Flow", color: "--flow", tint: "--flow-t", form: "stick",
      what: "For the first few days. Supports comfort, hydration and steadiness while you're bleeding.",
      keys: "Ginger extract 500 mg · magnesium 200 mg · sodium and potassium · vitamin B6",
      size: "5 sticks · one cycle", freq: "During your period", sub: 24, once: 28, url: "products/flow.html"
    },
    {
      id: "rest", kind: "product", name: "Rest", color: "--rest", tint: "--rest-t", form: "stick",
      what: "Helps you fall asleep faster and wake up clear. Made without melatonin, on purpose.",
      keys: "Glycine 3 g · magnesium glycinate 200 mg · L-theanine 200 mg · tart cherry 500 mg · apigenin 50 mg",
      size: "30 servings", freq: "At night", sub: 37, once: 44, url: "products/rest.html"
    },
    {
      id: "intimate", kind: "product", name: "Intimate", color: "--intimate", tint: "--intimate-t", form: "bottle",
      what: "Daily intimate wellness. Supports a healthy vaginal microbiome and everyday urinary wellness.",
      keys: "Clinically studied lactobacillus strains · cranberry proanthocyanidins 36 mg",
      size: "30 capsules", freq: "Every day", sub: 31, once: 36, url: "products/intimate.html"
    },
    {
      id: "cycle-kit", kind: "kit", name: "The Cycle Kit", color: "--build", tint: "--build-t", form: "kit",
      packs: ["build", "ease", "flow"], tagline: "Most popular",
      what: "The three formulas a full cycle actually needs, sized to one cycle and delivered together.",
      keys: "BUILD 30 servings · EASE 24 capsules · FLOW 5 sticks",
      size: "One cycle", freq: "Monthly", sub: 72, once: 89, url: "kits/cycle-kit.html"
    },
    {
      id: "full-ritual", kind: "kit", name: "The Full Ritual", color: "--rest", tint: "--rest-t", form: "kit",
      packs: ["build", "ease", "flow", "rest", "intimate"], tagline: "Everything",
      what: "The Cycle Kit plus Rest and Intimate. Day, night and every phase of the month.",
      keys: "BUILD 30 · EASE 24 · FLOW 5 · REST 30 servings · INTIMATE 30 capsules",
      size: "One cycle", freq: "Monthly", sub: 118, once: 145, url: "kits/full-ritual.html"
    }
  ];

  var BY_ID = {};
  for (var i = 0; i < CATALOG.length; i++) { BY_ID[CATALOG[i].id] = CATALOG[i]; }

  function get(idOrObj) {
    return typeof idOrObj === "string" ? BY_ID[idOrObj] : idOrObj;
  }

  /* ═══════════════════ packaging renders ═══════════════════ */

  function stick(p) {
    var c = "var(" + p.color + ")";
    return '<svg viewBox="0 0 120 210" role="img" aria-label="' + esc(p.name) + ' stick pack">' +
      '<defs><linearGradient id="g-' + p.id + '" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="' + c + '"/>' +
        '<stop offset="0.55" stop-color="' + c + '" stop-opacity="0.8"/>' +
        '<stop offset="1" stop-color="' + c + '"/></linearGradient></defs>' +
      '<path d="M14 16 L20 10 L26 16 L32 10 L38 16 L44 10 L50 16 L56 10 L62 16 L68 10 L74 16 L80 10 L86 16 L92 10 L98 16 L106 16 L106 196 L14 196 Z" fill="url(#g-' + p.id + ')"/>' +
      '<rect x="14" y="182" width="92" height="14" fill="rgba(0,0,0,0.12)"/>' +
      '<rect x="14" y="74" width="92" height="52" fill="#F5F3F0" opacity="0.94"/>' +
      '<text x="60" y="60" text-anchor="middle" fill="#1F1A18" opacity="0.62" font-family="Helvetica Neue, Arial, sans-serif" font-size="7.5" letter-spacing="3.4">CADENCE</text>' +
      '<text x="60" y="105" text-anchor="middle" fill="#1F1A18" font-family="Helvetica Neue, Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="2.6">' + esc(p.name.toUpperCase()) + '</text>' +
      '<text x="60" y="148" text-anchor="middle" fill="#1F1A18" opacity="0.55" font-family="Helvetica Neue, Arial, sans-serif" font-size="6.5" letter-spacing="1.6">' + esc(p.freq.toUpperCase()) + '</text>' +
      '</svg>';
  }

  function bottle(p) {
    var c = "var(" + p.color + ")";
    return '<svg viewBox="0 0 120 210" role="img" aria-label="' + esc(p.name) + ' bottle">' +
      '<rect x="40" y="12" width="40" height="20" rx="3" fill="' + c + '"/>' +
      '<rect x="40" y="12" width="40" height="20" rx="3" fill="rgba(0,0,0,0.18)"/>' +
      '<rect x="26" y="30" width="68" height="166" rx="10" fill="' + c + '"/>' +
      '<rect x="26" y="76" width="68" height="70" fill="#F5F3F0" opacity="0.94"/>' +
      '<text x="60" y="58" text-anchor="middle" fill="#1F1A18" opacity="0.6" font-family="Helvetica Neue, Arial, sans-serif" font-size="7.5" letter-spacing="3.4">CADENCE</text>' +
      '<text x="60" y="106" text-anchor="middle" fill="#1F1A18" font-family="Helvetica Neue, Arial, sans-serif" font-size="15" font-weight="600" letter-spacing="2.2">' + esc(p.name.toUpperCase()) + '</text>' +
      '<text x="60" y="128" text-anchor="middle" fill="#1F1A18" opacity="0.55" font-family="Helvetica Neue, Arial, sans-serif" font-size="6.5" letter-spacing="1.4">' + esc(p.size.split(" · ")[0].toUpperCase()) + '</text>' +
      '<text x="60" y="176" text-anchor="middle" fill="#1F1A18" opacity="0.5" font-family="Helvetica Neue, Arial, sans-serif" font-size="6.5" letter-spacing="1.6">' + esc(p.freq.toUpperCase()) + '</text>' +
      '</svg>';
  }

  /* pack("build") → one SVG. pack("cycle-kit") → the kit's packs side by side. */
  function pack(idOrObj) {
    var p = get(idOrObj);
    if (!p) { return ""; }
    if (p.form === "kit" && p.packs) {
      return p.packs.map(function (id) { return pack(id); }).join("");
    }
    return p.form === "bottle" ? bottle(p) : stick(p);
  }

  /* Fill every [data-pack="id"] / [data-packs="a,b,c"] stage on the page. */
  function drawPacks(scope) {
    each(qsa("[data-pack]", scope), function (node) {
      node.innerHTML = pack(node.getAttribute("data-pack"));
    });
    each(qsa("[data-packs]", scope), function (node) {
      node.innerHTML = node.getAttribute("data-packs").split(",").map(function (id) {
        return pack(id.replace(/\s+/g, ""));
      }).join("");
    });
  }

  /* ═══════════════════ storage ═══════════════════ */

  var memory = null; /* fallback when localStorage is unavailable (file:// lockdown) */

  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) { return JSON.parse(raw) || []; }
      return [];
    } catch (e) {
      return memory || [];
    }
  }
  function save(items) {
    memory = items;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(items));
    } catch (e) { /* memory copy above is the fallback */ }
  }

  /* ═══════════════════ cart ═══════════════════ */

  var lines = load();

  function normalise(item) {
    var qty = Math.max(1, Math.round(Number(item.qty) || 1));
    return {
      id: item.id || "",
      name: item.name || "Item",
      meta: item.meta || "",
      color: item.color || "var(--ink)",
      plan: item.plan === "once" ? "once" : "sub",
      price: Number(item.price) || 0,
      url: item.url || "",
      qty: qty
    };
  }

  function changed() {
    save(lines);
    paintCount();
    paintDrawer();
    try {
      document.dispatchEvent(new CustomEvent("cadence:cart", { detail: { items: cart.items() } }));
    } catch (e) {
      var ev = document.createEvent("Event");
      ev.initEvent("cadence:cart", true, false);
      document.dispatchEvent(ev);
    }
  }

  var cart = {
    add: function (item) {
      var it = normalise(item);
      for (var j = 0; j < lines.length; j++) {
        if (lines[j].name === it.name && lines[j].plan === it.plan && lines[j].price === it.price) {
          lines[j].qty += it.qty;
          changed();
          return lines[j];
        }
      }
      lines.push(it);
      changed();
      return it;
    },
    remove: function (index) {
      if (index >= 0 && index < lines.length) { lines.splice(index, 1); changed(); }
    },
    setQty: function (index, n) {
      if (index < 0 || index >= lines.length) { return; }
      var q = Math.round(Number(n) || 0);
      if (q <= 0) { lines.splice(index, 1); } else { lines[index].qty = Math.min(q, 99); }
      changed();
    },
    items: function () {
      return lines.map(function (l) {
        return { id: l.id, name: l.name, meta: l.meta, color: l.color, plan: l.plan, price: l.price, url: l.url, qty: l.qty };
      });
    },
    count: function () {
      var n = 0;
      for (var j = 0; j < lines.length; j++) { n += lines[j].qty; }
      return n;
    },
    subtotal: function () {
      var t = 0;
      for (var j = 0; j < lines.length; j++) { t += lines[j].price * lines[j].qty; }
      return Math.round(t * 100) / 100;
    },
    clear: function () { lines = []; changed(); }
  };

  /* ═══════════════════ plan selection ═══════════════════ */

  /* Current plan: an explicit checked radio [name="plan"], else the .plantoggle
     pressed button, else "sub". */
  function plan() {
    var radio = document.querySelector('input[name="plan"]:checked');
    if (radio) { return radio.value === "once" ? "once" : "sub"; }
    var pressed = document.querySelector('.plantoggle button[aria-pressed="true"]');
    if (pressed && pressed.getAttribute("data-plan")) {
      return pressed.getAttribute("data-plan") === "once" ? "once" : "sub";
    }
    return "sub";
  }

  /* Swap every [data-sub]/[data-once] label and sync the controls. */
  function setPlan(mode) {
    var m = mode === "once" ? "once" : "sub";
    each(qsa(".plantoggle button"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-plan") === m));
    });
    each(qsa('input[name="plan"]'), function (r) { r.checked = (r.value === m); });
    each(qsa("[data-sub]"), function (node) {
      var v = m === "sub" ? node.getAttribute("data-sub") : node.getAttribute("data-once");
      if (v === null) { v = ""; }
      node.textContent = v;
      node.style.display = v === "" ? "none" : "";
    });
    try {
      document.dispatchEvent(new CustomEvent("cadence:plan", { detail: { plan: m } }));
    } catch (e) { /* older engines simply skip the notification */ }
    return m;
  }

  /* ═══════════════════ header ═══════════════════ */

  var NAV = [
    { href: "shop.html", label: "Shop" },
    { href: "quiz.html", label: "Take the quiz" },
    { href: "pages/how-it-works.html", label: "How it works" },
    { href: "pages/standards.html", label: "Standards" },
    { href: "journal/index.html", label: "Journal" }
  ];

  function isCurrent(href) {
    var path = window.location.pathname.replace(/\\/g, "/");
    var tail = href.replace(/^\.\//, "");
    if (path === "" || /\/$/.test(path)) { path = path + "index.html"; }
    return path.length >= tail.length && path.slice(-tail.length) === tail;
  }

  function renderHeader() {
    var host = el("site-header");
    if (!host) { return; }
    var links = NAV.map(function (n) {
      var cur = isCurrent(n.href) ? ' aria-current="page"' : "";
      return '<li><a href="' + url(n.href) + '"' + cur + '>' + esc(n.label) + "</a></li>";
    }).join("");

    host.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<div class="announce">Free US shipping over ' + money(FREE_SHIP) + ' · Skip or cancel any time</div>' +
      '<nav class="nav" aria-label="Primary">' +
        '<a class="wordmark" href="' + url("index.html") + '">Cadence</a>' +
        '<ul class="navlinks">' + links + "</ul>" +
        '<button class="cartbtn" type="button" id="cadence-opencart" aria-controls="cadence-drawer" aria-expanded="false">' +
          'Cart <span class="count" id="cadence-count" aria-hidden="true">0</span>' +
          '<span class="skip" id="cadence-count-sr">0 items</span>' +
        "</button>" +
      "</nav>";

    var open = el("cadence-opencart");
    if (open) { open.addEventListener("click", function () { openCart(true); }); }
    paintCount();
  }

  function paintCount() {
    var n = cart.count();
    var c = el("cadence-count");
    if (c) { c.textContent = String(n); }
    var sr = el("cadence-count-sr");
    if (sr) { sr.textContent = n === 1 ? "1 item in cart" : n + " items in cart"; }
  }

  /* ═══════════════════ footer ═══════════════════ */

  function linkList(items) {
    return "<ul>" + items.map(function (it) {
      return '<li><a href="' + url(it[0]) + '">' + esc(it[1]) + "</a></li>";
    }).join("") + "</ul>";
  }

  function renderFooter() {
    var host = el("site-footer");
    if (!host) { return; }

    var shop = [
      ["kits/cycle-kit.html", "The Cycle Kit"],
      ["kits/full-ritual.html", "The Full Ritual"],
      ["products/build.html", "Build"],
      ["products/ease.html", "Ease"],
      ["products/flow.html", "Flow"],
      ["products/rest.html", "Rest"],
      ["products/intimate.html", "Intimate"],
      ["shop.html", "Shop all"]
    ];
    var learn = [
      ["quiz.html", "Take the quiz"],
      ["pages/how-it-works.html", "How it works"],
      ["pages/standards.html", "Our standards"],
      ["pages/test-results.html", "Test results"],
      ["pages/about.html", "About Cadence"],
      ["journal/index.html", "Journal"]
    ];
    var help = [
      ["pages/faq.html", "FAQ"],
      ["pages/shipping-returns.html", "Shipping & returns"],
      ["pages/contact.html", "Contact"],
      ["cart.html", "Your cart"],
      ["checkout.html", "Checkout"]
    ];

    host.innerHTML =
      '<footer class="footer">' +
        '<div class="cols">' +
          "<div>" +
            '<p class="wordmark" style="margin-bottom:13px">Cadence</p>' +
            '<p class="blurb">Supplements built around the fact that a month isn\'t one thing. ' +
            "Third-party tested, openly dosed, made in an FDA-registered facility.</p>" +
          "</div>" +
          "<div><h4>Shop</h4>" + linkList(shop) + "</div>" +
          "<div><h4>Learn</h4>" + linkList(learn) + "</div>" +
          "<div><h4>Help</h4>" + linkList(help) + "</div>" +
        "</div>" +
        '<div class="disc">' +
          "<p>These statements have not been evaluated by the Food and Drug Administration. " +
          "This product is not intended to diagnose, treat, cure, or prevent any disease.</p>" +
          "<p>Not for use during pregnancy or nursing unless directed by your healthcare provider. " +
          "Consult your physician before use if you take prescription medication or have a medical condition. 18+.</p>" +
          "<p>&copy; " + new Date().getFullYear() + " Cadence Supplements. All prices in USD.</p>" +
        "</div>" +
      "</footer>";
  }

  /* ═══════════════════ cart drawer ═══════════════════ */

  var drawerNode = null, scrimNode = null, lastOpener = null;

  function mountDrawer() {
    if (el("cadence-drawer")) { drawerNode = el("cadence-drawer"); scrimNode = el("cadence-scrim"); return; }

    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="scrim" id="cadence-scrim"></div>' +
      '<aside class="drawer" id="cadence-drawer" role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden="true">' +
        '<div class="drawerhead">' +
          "<h2>Your cart</h2>" +
          '<button class="closebtn" type="button" id="cadence-closecart" aria-label="Close cart">&times;</button>' +
        "</div>" +
        '<div class="drawerbody" id="cadence-drawerbody"></div>' +
        '<div class="drawerfoot">' +
          '<div class="shipbar"><span id="cadence-shipbar"></span></div>' +
          '<div class="subtotal"><span>Subtotal</span><span id="cadence-subtotal">$0</span></div>' +
          '<p class="shipnote" id="cadence-shipnote">Free US shipping over ' + money(FREE_SHIP) + ".</p>" +
          '<a class="btn block" id="cadence-checkout" href="' + url("checkout.html") + '">Checkout</a>' +
          '<a class="linkbtn" href="' + url("cart.html") + '" style="text-align:center">View full cart</a>' +
        "</div>" +
      "</aside>" +
      '<div class="toast" id="cadence-toast" role="status" aria-live="polite"></div>';

    while (wrap.firstChild) { document.body.appendChild(wrap.firstChild); }

    drawerNode = el("cadence-drawer");
    scrimNode = el("cadence-scrim");

    el("cadence-closecart").addEventListener("click", function () { openCart(false); });
    scrimNode.addEventListener("click", function () { openCart(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawerNode && drawerNode.classList.contains("open")) { openCart(false); }
    });

    paintDrawer();
  }

  function openCart(open) {
    if (!drawerNode) { mountDrawer(); }
    if (!drawerNode) { return; }
    var want = open !== false;
    if (want) { lastOpener = document.activeElement; }
    drawerNode.classList.toggle("open", want);
    scrimNode.classList.toggle("open", want);
    drawerNode.setAttribute("aria-hidden", String(!want));
    var btn = el("cadence-opencart");
    if (btn) { btn.setAttribute("aria-expanded", String(want)); }
    if (want) {
      var close = el("cadence-closecart");
      if (close) { close.focus(); }
    } else if (lastOpener && lastOpener.focus) {
      lastOpener.focus();
      lastOpener = null;
    }
  }

  function planLabel(p) {
    return p === "sub" ? "Subscription · every 30 days" : "One-time purchase";
  }

  function paintDrawer() {
    var body = el("cadence-drawerbody");
    if (!body) { return; }
    var items = cart.items();
    var total = cart.subtotal();

    if (!items.length) {
      body.innerHTML =
        '<p class="empty">Nothing here yet.<br><a href="' + url("shop.html") + '">Shop the line</a></p>';
    } else {
      body.innerHTML = items.map(function (it, idx) {
        return '<div class="lineitem">' +
          '<span class="swatch" style="background:' + esc(it.color) + '"></span>' +
          '<span class="li-body">' +
            '<p class="li-n">' + esc(it.name) + "</p>" +
            (it.meta ? '<p class="li-m">' + esc(it.meta) + "</p>" : "") +
            '<p class="li-m">' + planLabel(it.plan) + "</p>" +
            '<span class="li-controls">' +
              '<span class="li-qty">' +
                '<button type="button" data-cart-qty="' + idx + '" data-delta="-1" aria-label="Decrease quantity of ' + esc(it.name) + '">&minus;</button>' +
                "<span>" + it.qty + "</span>" +
                '<button type="button" data-cart-qty="' + idx + '" data-delta="1" aria-label="Increase quantity of ' + esc(it.name) + '">+</button>' +
              "</span>" +
              '<button type="button" class="removebtn" data-cart-remove="' + idx + '">Remove</button>' +
            "</span>" +
          "</span>" +
          '<span class="li-p">' + money(it.price * it.qty) + "</span>" +
        "</div>";
      }).join("");
    }

    var sub = el("cadence-subtotal");
    if (sub) { sub.textContent = money(total); }

    var bar = el("cadence-shipbar");
    if (bar) { bar.style.width = Math.min(100, Math.round((total / FREE_SHIP) * 100)) + "%"; }

    var note = el("cadence-shipnote");
    if (note) {
      note.textContent = total >= FREE_SHIP
        ? "Shipping is free on this order."
        : total > 0
          ? "Add " + money(Math.round((FREE_SHIP - total) * 100) / 100) + " for free US shipping."
          : "Free US shipping over " + money(FREE_SHIP) + ".";
    }
  }

  /* ═══════════════════ toast ═══════════════════ */

  var toastTimer = null;

  function toast(msg) {
    var t = el("cadence-toast");
    if (!t) { return; }
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) { window.clearTimeout(toastTimer); }
    toastTimer = window.setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ═══════════════════ delegated interaction ═══════════════════ */

  /* Quantity the add button should use: explicit data-qty, else the nearest
     stepper input on the page, else 1. */
  function qtyFor(btn) {
    if (btn.getAttribute("data-qty")) { return Number(btn.getAttribute("data-qty")) || 1; }
    var box = btn.closest(".purchase-box") || btn.closest(".pdp-buy") || document;
    var input = box.querySelector ? box.querySelector(".qty input") : null;
    return input ? (Number(input.value) || 1) : 1;
  }

  function stepQty(input, delta) {
    var next = Math.min(99, Math.max(1, (Number(input.value) || 1) + delta));
    input.value = String(next);
    try {
      input.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) { /* no listener is required for the value to be read back */ }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) { return; }

    var addBtn = t.closest("[data-add]");
    if (addBtn) {
      var mode = addBtn.getAttribute("data-plan") || plan();
      var price = Number(mode === "sub" ? addBtn.getAttribute("data-sub-price") : addBtn.getAttribute("data-once-price"));
      cart.add({
        id: addBtn.getAttribute("data-id") || "",
        name: addBtn.getAttribute("data-add"),
        meta: addBtn.getAttribute("data-meta") || "",
        color: addBtn.getAttribute("data-color") || "var(--ink)",
        url: addBtn.getAttribute("data-url") || "",
        plan: mode,
        price: price,
        qty: qtyFor(addBtn)
      });
      toast(addBtn.getAttribute("data-add") + " added to cart");
      if (addBtn.getAttribute("data-no-open") === null) { openCart(true); }
      e.preventDefault();
      return;
    }

    var rm = t.closest("[data-cart-remove]");
    if (rm) { cart.remove(Number(rm.getAttribute("data-cart-remove"))); return; }

    var qb = t.closest("[data-cart-qty]");
    if (qb) {
      var idx = Number(qb.getAttribute("data-cart-qty"));
      var cur = cart.items()[idx];
      if (cur) { cart.setQty(idx, cur.qty + (Number(qb.getAttribute("data-delta")) || 0)); }
      return;
    }

    var step = t.closest("[data-qty-step]");
    if (step) {
      var wrap = step.closest(".qty");
      var input = wrap ? wrap.querySelector("input") : null;
      if (input) { stepQty(input, Number(step.getAttribute("data-qty-step")) || 0); }
      return;
    }

    var planBtn = t.closest(".plantoggle button");
    if (planBtn) { setPlan(planBtn.getAttribute("data-plan")); return; }

    var opener = t.closest("[data-open-cart]");
    if (opener) { openCart(true); e.preventDefault(); }
  }

  function onChange(e) {
    var t = e.target;
    if (t && t.name === "plan" && t.checked) { setPlan(t.value); }
  }

  /* ═══════════════════ boot ═══════════════════ */

  function init() {
    renderHeader();
    renderFooter();
    mountDrawer();
    drawPacks(document);
    setPlan(plan());
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
  }

  window.Cadence = {
    CATALOG: CATALOG,
    BY_ID: BY_ID,
    PRODUCTS: CATALOG.filter(function (p) { return p.kind === "product"; }),
    KITS: CATALOG.filter(function (p) { return p.kind === "kit"; }),
    FREE_SHIP: FREE_SHIP,
    get: get,
    pack: pack,
    drawPacks: drawPacks,
    money: money,
    esc: esc,
    url: url,
    cart: cart,
    plan: plan,
    setPlan: setPlan,
    openCart: openCart,
    toast: toast,
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    mountDrawer: mountDrawer,
    init: init
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
