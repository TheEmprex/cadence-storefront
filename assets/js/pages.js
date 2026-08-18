/* ============================================================================
   CADENCE — page renderers
   Builds PDPs, kit pages, shop, cart and checkout from CATALOG + CADENCE_CONTENT.

   Load order in every page that uses it:
     store.js  →  content.js  →  pages.js
   Dispatch: <main id="main" data-page="pdp" data-id="build"></main>
   ========================================================================== */
(function () {
  "use strict";

  var C = window.Cadence;
  var CONTENT = window.CADENCE_CONTENT || {};
  if (!C) { return; }

  var esc = C.esc, money = C.money, url = C.url, get = C.get;

  function content(id) { return CONTENT[id] || {}; }

  /* ═══════════════ small builders ═══════════════ */

  function crumbs(trail) {
    var items = trail.map(function (t, i) {
      var last = i === trail.length - 1;
      return "<li>" + (last
        ? '<span aria-current="page">' + esc(t[0]) + "</span>"
        : '<a href="' + url(t[1]) + '">' + esc(t[0]) + "</a>") + "</li>";
    }).join("");
    return '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>' + items + "</ol></nav>";
  }

  function priceLine(p) {
    return '<p class="price">' +
      '<span class="amt" data-sub="' + money(p.sub) + '" data-once="' + money(p.once) + '">' + money(p.sub) + "</span>" +
      '<span class="per" data-sub="/ cycle, subscribed" data-once="one-time">/ cycle, subscribed</span>' +
      '<span class="was" data-sub="' + money(p.once) + '" data-once="">' + money(p.once) + "</span>" +
      "</p>";
  }

  function planOpts(p) {
    var save = p.once - p.sub;
    return '<fieldset class="plan-opts">' +
      "<legend>Purchase plan</legend>" +
      '<label class="plan-opt">' +
        '<input type="radio" name="plan" value="sub" checked>' +
        '<span class="pl-main-wrap"><span class="pl-main">' +
          '<span class="pl-name">Subscribe &amp; save</span>' +
          '<span class="pl-price">' + money(p.sub) + "</span></span>" +
          '<span class="pl-note"><span class="pl-save">Save ' + money(save) + " every cycle.</span> " +
          "Arrives every 30 days. Skip, move the date or cancel any time.</span></span>" +
      "</label>" +
      '<label class="plan-opt">' +
        '<input type="radio" name="plan" value="once">' +
        '<span class="pl-main-wrap"><span class="pl-main">' +
          '<span class="pl-name">One-time</span>' +
          '<span class="pl-price">' + money(p.once) + "</span></span>" +
          '<span class="pl-note">A single box. No subscription, no renewal.</span></span>' +
      "</label>" +
      "</fieldset>";
  }

  function addAttrs(p) {
    return 'data-add="' + esc(p.name) + '" data-id="' + esc(p.id) + '" ' +
      'data-meta="' + esc(p.keys) + '" data-color="var(' + p.color + ')" ' +
      'data-url="' + esc(p.url) + '" ' +
      'data-sub-price="' + p.sub + '" data-once-price="' + p.once + '"';
  }

  function trustRow() {
    return '<div class="trust-row">' +
      '<div><span class="mark" aria-hidden="true">✓</span><span>Third-party tested every batch</span></div>' +
      '<div><span class="mark" aria-hidden="true">✓</span><span>Every active listed at its dose</span></div>' +
      '<div><span class="mark" aria-hidden="true">✓</span><span>Free US shipping over ' + money(C.FREE_SHIP) + "</span></div>" +
      '<div><span class="mark" aria-hidden="true">✓</span><span>Skip or cancel any time</span></div>' +
      "</div>";
  }

  function purchaseBox(p) {
    return '<div class="purchase-box">' +
      priceLine(p) +
      planOpts(p) +
      '<div class="qty-row">' +
        '<label for="qty-' + p.id + '">Quantity</label>' +
        '<span class="qty">' +
          '<button type="button" data-qty-step="-1" aria-label="Decrease quantity">−</button>' +
          '<input id="qty-' + p.id + '" type="number" value="1" min="1" max="99" inputmode="numeric" aria-label="Quantity">' +
          '<button type="button" data-qty-step="1" aria-label="Increase quantity">+</button>' +
        "</span>" +
      "</div>" +
      '<button class="btn block" type="button" ' + addAttrs(p) + ">Add to cart</button>" +
      '<ul class="buy-notes">' +
        "<li>" + esc(p.size) + " · " + esc(p.freq) + "</li>" +
        "<li>Ships in 1–2 business days from the US.</li>" +
        "<li>30-day returns, opened boxes included.</li>" +
      "</ul>" +
      "</div>";
  }

  function stickyAtc(p) {
    return '<div class="sticky-atc">' +
      "<div><p class=\"sa-name\">" + esc(p.name) + "</p>" +
      '<p class="sa-price"><span data-sub="' + money(p.sub) + '" data-once="' + money(p.once) + '">' +
      money(p.sub) + "</span> · " + esc(p.size) + "</p></div>" +
      '<button class="btn sm" type="button" ' + addAttrs(p) + ">Add to cart</button>" +
      "</div>";
  }

  function gallery(p) {
    var insideRows = (content(p.id).facts ? content(p.id).facts.rows : []) || [];
    var insideSvg = insideRows.length
      ? insideRows.slice(0, 5).map(function (r, i) {
          var y = 40 + i * 30;
          return '<rect x="18" y="' + (y - 12) + '" width="' + (30 + (5 - i) * 22) + '" height="16" rx="4" fill="var(' + p.color + ')" opacity="' + (0.9 - i * 0.13) + '"/>' +
            '<text x="' + (56 + (5 - i) * 22) + '" y="' + (y + 1) + '" font-family="Helvetica Neue, Arial, sans-serif" font-size="9" fill="currentColor" opacity="0.7">' + esc(r[1]) + "</text>";
        }).join("")
      : "";

    return '<div class="gallery" id="gal-main" data-pack="' + p.id + '"></div>' +
      '<div class="gallery-thumbs" role="tablist" aria-label="Product views">' +
        '<button type="button" role="tab" aria-selected="true" data-view="pack" aria-label="The pack"></button>' +
        '<button type="button" role="tab" aria-selected="false" data-view="inside" aria-label="What is inside">' +
          '<svg viewBox="0 0 200 190" aria-hidden="true"><rect width="200" height="190" fill="var(' + p.tint + ')"/>' + insideSvg + "</svg>" +
        "</button>" +
        '<button type="button" role="tab" aria-selected="false" data-view="phase" aria-label="When to take it">' +
          '<svg viewBox="0 0 200 190" aria-hidden="true"><rect width="200" height="190" fill="var(' + p.tint + ')"/>' +
          '<circle cx="100" cy="95" r="58" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="14"/>' +
          '<circle cx="100" cy="95" r="58" fill="none" stroke="var(' + p.color + ')" stroke-width="14" ' +
          'stroke-dasharray="' + (p.id === "build" || p.id === "intimate" ? "364 0" : p.id === "ease" ? "156 208" : p.id === "flow" ? "65 299" : "120 244") + '" ' +
          'transform="rotate(-90 100 95)" stroke-linecap="butt"/></svg>' +
        "</button>" +
      "</div>" +
      '<div class="gal-views" hidden>' +
        '<div data-viewbody="inside"><h3>' + esc(p.name) + " at a glance</h3><p class=\"small\">" + esc(p.keys) + "</p></div>" +
      "</div>";
  }

  function wireGallery(p) {
    var main = document.getElementById("gal-main");
    var thumbs = document.querySelectorAll(".gallery-thumbs button");
    if (!main || !thumbs.length) { return; }

    function show(view) {
      Array.prototype.forEach.call(thumbs, function (b) {
        b.setAttribute("aria-selected", String(b.getAttribute("data-view") === view));
      });
      if (view === "pack") {
        main.innerHTML = C.pack(p.id);
        return;
      }
      if (view === "inside") {
        var rows = (content(p.id).facts ? content(p.id).facts.rows : []) || [];
        main.innerHTML = '<div class="gal-panel"><h3 class="serif">What is in it</h3><ul class="gal-list">' +
          rows.map(function (r) {
            return "<li><b>" + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>";
          }).join("") + "</ul></div>";
        return;
      }
      var wt = content(p.id).whenToTake || {};
      main.innerHTML = '<div class="gal-panel"><h3 class="serif">' + esc(wt.title || "When to take it") +
        "</h3><p>" + esc(wt.body || "") + "</p></div>";
    }

    Array.prototype.forEach.call(thumbs, function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-view")); });
    });
    /* first thumb shows the drawn pack */
    thumbs[0].innerHTML = C.pack(p.id);
    show("pack");
  }

  function factsPanel(f) {
    if (!f) { return ""; }
    var rows = f.rows.map(function (r) {
      return "<tr><th scope=\"row\"><b>" + esc(r[0]) + "</b>" +
        (r[2] ? '<span class="small"> — ' + esc(r[2]) + "</span>" : "") +
        "</th><td>" + esc(r[1]) + "</td></tr>";
    }).join("");
    return '<div class="facts">' +
      "<h3>Supplement Facts</h3>" +
      '<p class="serving"><span><span>Serving size</span><span>' + esc(f.serving) + "</span></span>" +
      "<span><span>" + esc(f.per) + "</span><span></span></span></p>" +
      '<div class="bar-thick"></div>' +
      "<table><thead><tr><th>Per serving</th><th>Amount</th></tr></thead><tbody>" + rows + "</tbody></table>" +
      '<p class="other">' + esc(f.other) + "</p>" +
      "</div>";
  }

  function accordion(list, cls) {
    if (!list || !list.length) { return ""; }
    return '<div class="accordion ' + (cls || "") + '">' + list.map(function (f) {
      return "<details><summary>" + esc(f.q) + "</summary><p>" + esc(f.a) + "</p></details>";
    }).join("") + "</div>";
  }

  function reviewsBlock(name) {
    return '<section class="pdp-section"><h2 class="serif">Reviews</h2>' +
      '<p class="placeholder"><b>Mockup note</b><br>Layout placeholder, not real reviews. Replace with the ' +
      "Judge.me widget before launch. Never ship invented testimonials.</p>" +
      '<div class="revgrid">' +
        '<div class="rev"><div class="stars">★★★★★</div><p>[Placeholder review — ' + esc(name) + "]</p>" +
        '<span class="who">Verified buyer</span></div>' +
        '<div class="rev"><div class="stars">★★★★★</div><p>[Placeholder review — ' + esc(name) + "]</p>" +
        '<span class="who">Verified buyer</span></div>' +
        '<div class="rev"><div class="stars">★★★★☆</div><p>[Placeholder review — ' + esc(name) + "]</p>" +
        '<span class="who">Verified buyer</span></div>' +
      "</div></section>";
  }

  function pairsRow(ids, heading) {
    if (!ids || !ids.length) { return ""; }
    return '<section class="pdp-section"><h2 class="serif">' + esc(heading || "Pairs with") + "</h2>" +
      '<div class="cols-3">' + ids.map(function (id) {
        var q = get(id);
        if (!q) { return ""; }
        return '<a class="card-link" href="' + url(q.url) + '">' +
          '<span class="tag" style="color:var(' + q.color + ')">' + esc(q.name) + "</span>" +
          "<p>" + esc(q.what) + "</p>" +
          '<span class="more">' + money(q.sub) + " subscribed →</span></a>";
      }).join("") + "</div></section>";
  }

  function whySection(why) {
    if (!why || !why.length) { return ""; }
    return '<section class="pdp-section"><h2 class="serif">Why these, and why not others</h2>' +
      why.map(function (w) {
        return "<h3>" + esc(w.h) + "</h3><p>" + esc(w.p) + "</p>";
      }).join("") + "</section>";
  }

  /* ═══════════════ PDP ═══════════════ */

  function renderPDP(mount, id) {
    var p = get(id);
    var c = content(id);
    if (!p) { mount.innerHTML = "<p>Product not found.</p>"; return; }

    mount.innerHTML =
      '<div class="band"><div class="inner">' +
        crumbs([["Home", "index.html"], ["Shop", "shop.html"], [p.name, p.url]]) +
        '<div class="pdp">' +
          '<div class="pdp-main">' + gallery(p) + "</div>" +
          '<div class="pdp-buy">' +
            '<p class="eyebrow" style="color:var(' + p.color + ')">' + esc(p.freq) + " · " + esc(p.size) + "</p>" +
            "<h1>" + esc(p.name) + "</h1>" +
            '<p class="pdp-sub">' + esc(c.tagline || p.what) + "</p>" +
            purchaseBox(p) +
          "</div>" +
        "</div>" +
        trustRow() +
        '<div class="split wide-left" style="margin-top:40px">' +
          "<div>" +
            "<p class=\"lede\">" + esc(c.longWhat || p.what) + "</p>" +
            '<section class="pdp-section"><h2 class="serif">' + esc((c.whenToTake || {}).title || "When to take it") + "</h2>" +
            "<p>" + esc((c.whenToTake || {}).body || "") + "</p></section>" +
            '<section class="pdp-section"><h2 class="serif">Time to felt effect</h2>' +
            '<p><span class="pill">' + esc((c.timing || {}).label || "") + "</span></p>" +
            "<p>" + esc((c.timing || {}).body || "") + "</p></section>" +
            whySection(c.why) +
            '<section class="pdp-section"><h2 class="serif">How to take it</h2><ul>' +
            (c.howTo || []).map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") +
            "</ul></section>" +
            '<section class="pdp-section"><h2 class="serif">Warnings</h2><ul class="buy-notes">' +
            (c.warnings || []).map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") +
            "</ul></section>" +
          "</div>" +
          "<div>" + factsPanel(c.facts) + "</div>" +
        "</div>" +
        '<section class="pdp-section"><h2 class="serif">Questions about ' + esc(p.name) + "</h2>" +
        accordion(c.faq) + "</section>" +
        reviewsBlock(p.name) +
        pairsRow(c.pairs) +
      "</div></div>" +
      stickyAtc(p);

    C.drawPacks(mount);
    wireGallery(p);
    C.setPlan(C.plan());
  }

  /* ═══════════════ kit page ═══════════════ */

  function kitSeparately(k) {
    var subSum = 0, onceSum = 0;
    k.packs.forEach(function (id) {
      var q = get(id);
      subSum += q.sub; onceSum += q.once;
    });
    return { sub: subSum, once: onceSum };
  }

  function calendarStrip(cal) {
    if (!cal || !cal.length) { return ""; }
    return '<div class="table-wrap"><table class="table"><caption>A 28-day cycle, and what you take when. ' +
      "Day numbers are a shorthand — go by how you feel.</caption>" +
      "<thead><tr><th>Days</th><th>Phase</th><th>What you take</th></tr></thead><tbody>" +
      cal.map(function (row) {
        return "<tr><th scope=\"row\" class=\"mono\">" + esc(row.days) + "</th><td>" + esc(row.label) + "</td><td>" +
          row.ids.map(function (id) {
            var q = get(id);
            return '<span class="tag" style="color:var(' + q.color + ')">' + esc(q.name) + "</span>";
          }).join(" ") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderKit(mount, id) {
    var k = get(id);
    var c = content(id);
    if (!k) { mount.innerHTML = "<p>Kit not found.</p>"; return; }
    var sep = kitSeparately(k);

    var contentsRows = (c.contents || []).map(function (row) {
      var q = get(row.id);
      return "<tr><th scope=\"row\"><span class=\"tag\" style=\"color:var(" + q.color + ")\">" + esc(q.name) +
        "</span></th><td>" + esc(row.count) + "</td><td>" + esc(row.why) + "</td></tr>";
    }).join("");

    mount.innerHTML =
      '<div class="band"><div class="inner">' +
        crumbs([["Home", "index.html"], ["Shop", "shop.html"], [k.name, k.url]]) +
        '<div class="pdp">' +
          '<div class="pdp-main"><div class="gallery" data-packs="' + k.packs.join(",") + '"></div></div>' +
          '<div class="pdp-buy">' +
            '<p class="eyebrow">' + esc(k.tagline) + " · sized to one cycle</p>" +
            "<h1>" + esc(k.name) + "</h1>" +
            '<p class="pdp-sub">' + esc(c.tagline || k.what) + "</p>" +
            purchaseBox(k) +
          "</div>" +
        "</div>" +
        trustRow() +
        '<section class="pdp-section" style="margin-top:36px"><h2 class="serif">What is in the box</h2>' +
          "<p class=\"lede\">" + esc(c.longWhat || k.what) + "</p>" +
          '<div class="table-wrap"><table class="table">' +
          "<thead><tr><th>Formula</th><th>Count</th><th>Why that count</th></tr></thead>" +
          "<tbody>" + contentsRows + "</tbody></table></div>" +
        "</section>" +
        '<section class="pdp-section"><h2 class="serif">Your month, at a glance</h2>' + calendarStrip(c.calendar) + "</section>" +
        '<section class="pdp-section"><h2 class="serif">Against buying them separately</h2>' +
          '<div class="table-wrap"><table class="table">' +
          "<thead><tr><th>&nbsp;</th><th class=\"n\">Subscribed</th><th class=\"n\">One-time</th></tr></thead><tbody>" +
          "<tr><th scope=\"row\">The same formulas, bought individually</th><td class=\"n\">" + money(sep.sub) +
            "</td><td class=\"n\">" + money(sep.once) + "</td></tr>" +
          "<tr><th scope=\"row\">" + esc(k.name) + "</th><td class=\"n\">" + money(k.sub) +
            "</td><td class=\"n\">" + money(k.once) + "</td></tr>" +
          "<tr><th scope=\"row\">You save</th><td class=\"n\">" + money(sep.sub - k.sub) +
            "</td><td class=\"n\">" + money(sep.once - k.once) + "</td></tr>" +
          "</tbody></table></div>" +
          "<p>It is also one parcel instead of " + k.packs.length + ", one renewal date instead of " + k.packs.length +
          ", and one thing to skip when you want to skip. Shipping is charged per parcel rather than per product, " +
          "which is most of where the difference comes from.</p>" +
        "</section>" +
        whySection(c.why) +
        '<section class="pdp-section"><h2 class="serif">Questions about ' + esc(k.name) + "</h2>" +
        accordion(c.faq) + "</section>" +
        reviewsBlock(k.name) +
        pairsRow(c.pairs, "Also in the line") +
      "</div></div>" +
      stickyAtc(k);

    C.drawPacks(mount);
    C.setPlan(C.plan());
  }

  /* ═══════════════ shop ═══════════════ */

  var FILTERS = [
    { key: "all", label: "All" },
    { key: "kit", label: "Kits" },
    { key: "daily", label: "Daily" },
    { key: "luteal", label: "Luteal" },
    { key: "period", label: "Period" },
    { key: "night", label: "Night" }
  ];

  var TAGS = {
    build: ["daily"], intimate: ["daily"], ease: ["luteal"],
    flow: ["period"], rest: ["night"], "cycle-kit": ["kit"], "full-ritual": ["kit"]
  };

  function productCard(p) {
    return '<article class="prod" data-tags="' + (TAGS[p.id] || []).join(" ") + '" data-price="' + p.sub + '">' +
      '<a class="prodstage" href="' + url(p.url) + '" style="background:var(' + p.tint + ')" ' +
      'data-pack' + (p.kind === "kit" ? 's="' + p.packs.join(",") : '="' + p.id) + '" aria-label="' + esc(p.name) + '"></a>' +
      '<div class="prodbody">' +
        "<h3><a href=\"" + url(p.url) + "\" style=\"color:var(" + p.color + ");text-decoration:none\">" + esc(p.name) + "</a></h3>" +
        '<p class="what">' + esc(p.what) + "</p>" +
        '<p class="keys">' + esc(p.keys) + "</p>" +
        '<div class="metarow"><span>' + esc(p.size) + "</span><span>" + esc(p.freq) + "</span></div>" +
        '<div class="buyrow">' +
          '<p class="price"><span class="amt" data-sub="' + money(p.sub) + '" data-once="' + money(p.once) + '">' +
          money(p.sub) + '</span><span class="per" data-sub="/ cycle" data-once="once">/ cycle</span></p>' +
          '<button class="btn sm ghost" type="button" ' + addAttrs(p) + ">Add</button>" +
        "</div>" +
      "</div></article>";
  }

  function renderShop(mount) {
    var all = C.KITS.concat(C.PRODUCTS);

    mount.innerHTML =
      '<div class="band"><div class="inner">' +
        crumbs([["Home", "index.html"], ["Shop", "shop.html"]]) +
        '<header class="pagehead"><p class="eyebrow">Shop</p>' +
          "<h1 class=\"serif\">Everything we make.</h1>" +
          '<p class="lede">Two kits and five formulas. Every box is sized to a single cycle — the daily base at ' +
          "thirty, the phase formulas at the number of days they are actually for. That is why a Flow box has " +
          "five sticks in it rather than thirty.</p>" +
        "</header>" +
        '<div class="row" style="margin:26px 0 22px;display:flex;gap:14px;flex-wrap:wrap;align-items:center;justify-content:space-between">' +
          '<div class="plantoggle" role="group" aria-label="Purchase plan">' +
            '<button type="button" data-plan="sub" aria-pressed="true">Subscribe &amp; save</button>' +
            '<button type="button" data-plan="once" aria-pressed="false">One-time</button>' +
          "</div>" +
          '<div class="field" style="gap:0"><label class="skip" for="shop-sort">Sort</label>' +
          '<select class="select" id="shop-sort" style="width:auto">' +
            '<option value="featured">Featured</option>' +
            '<option value="low">Price: low to high</option>' +
            '<option value="high">Price: high to low</option>' +
          "</select></div>" +
        "</div>" +
        '<div class="row" id="shop-filters" role="group" aria-label="Filter products" ' +
          'style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px">' +
          FILTERS.map(function (f, i) {
            return '<button class="btn sm ' + (i === 0 ? "" : "ghost") + '" type="button" data-filter="' + f.key +
              '" aria-pressed="' + (i === 0) + '">' + esc(f.label) + "</button>";
          }).join("") +
        "</div>" +
        '<p class="small" id="shop-count" aria-live="polite"></p>' +
        '<div class="prodgrid" id="shop-grid">' + all.map(productCard).join("") + "</div>" +
        '<p class="small" style="margin-top:30px">Not sure where to start? ' +
        '<a href="' + url("quiz.html") + '">Take the quiz</a> — six questions, no email required.</p>' +
      "</div></div>";

    C.drawPacks(mount);

    var grid = document.getElementById("shop-grid");
    var countEl = document.getElementById("shop-count");
    var cards = Array.prototype.slice.call(grid.children);

    function paintCount() {
      var n = cards.filter(function (c2) { return c2.style.display !== "none"; }).length;
      countEl.textContent = n === 1 ? "1 product" : n + " products";
    }

    document.getElementById("shop-filters").addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) { return; }
      var key = b.getAttribute("data-filter");
      Array.prototype.forEach.call(this.children, function (btn) {
        var on = btn === b;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = "btn sm" + (on ? "" : " ghost");
      });
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        card.style.display = (key === "all" || tags.indexOf(key) !== -1) ? "" : "none";
      });
      paintCount();
    });

    document.getElementById("shop-sort").addEventListener("change", function () {
      var v = this.value;
      var sorted = cards.slice();
      if (v === "low") { sorted.sort(function (a, b) { return a.dataset.price - b.dataset.price; }); }
      if (v === "high") { sorted.sort(function (a, b) { return b.dataset.price - a.dataset.price; }); }
      sorted.forEach(function (c2) { grid.appendChild(c2); });
    });

    paintCount();
    C.setPlan(C.plan());
  }

  /* ═══════════════ cart page ═══════════════ */

  function renderCart(mount) {
    function paint() {
      var items = C.cart.items();
      var host = document.getElementById("cart-body");
      if (!host) { return; }

      if (!items.length) {
        host.innerHTML =
          '<div class="empty-state"><h2 class="serif">Nothing here yet.</h2>' +
          "<p>Six questions will tell you which formulas are worth your money, and which ones are not.</p>" +
          '<div class="row" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
          '<a class="btn" href="' + url("quiz.html") + '">Take the quiz</a>' +
          '<a class="btn ghost" href="' + url("shop.html") + '">Browse everything</a></div></div>';
        return;
      }

      var subtotal = C.cart.subtotal();
      var lines = items.map(function (it, i) {
        return '<div class="lineitem">' +
          '<span class="swatch" style="background:' + it.color + '"></span>' +
          "<span><p class=\"li-n\">" + esc(it.name) + "</p>" +
          '<p class="li-m">' + esc(it.meta) + "</p>" +
          '<p class="li-m">' + (it.plan === "sub" ? "Subscription · every 30 days" : "One-time") + "</p>" +
          '<span class="li-controls"><span class="qty li-qty">' +
            '<button type="button" data-cart-qty="' + i + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
            "<input type=\"number\" value=\"" + it.qty + "\" readonly aria-label=\"Quantity\">" +
            '<button type="button" data-cart-qty="' + i + '" data-delta="1" aria-label="Increase quantity">+</button>' +
          "</span>" +
          '<button class="removebtn" type="button" data-cart-remove="' + i + '">Remove</button></span></span>' +
          '<span class="li-p">' + money(it.price * it.qty) + "</span>" +
          "</div>";
      }).join("");

      var owned = items.map(function (it) { return it.id; });
      var suggestions = C.PRODUCTS.filter(function (p) { return owned.indexOf(p.id) === -1; }).slice(0, 3);

      host.innerHTML =
        '<div class="split wide-left">' +
          "<div>" + lines +
            (suggestions.length
              ? '<section class="pdp-section"><h2 class="serif">You might add</h2><div class="cols-3">' +
                suggestions.map(function (p) {
                  return '<a class="card-link" href="' + url(p.url) + '">' +
                    '<span class="tag" style="color:var(' + p.color + ')">' + esc(p.name) + "</span>" +
                    "<p>" + esc(p.what) + "</p>" +
                    '<span class="more">' + money(p.sub) + " subscribed →</span></a>";
                }).join("") + "</div></section>"
              : "") +
          "</div>" +
          '<aside class="order-summary"><h2>Order summary</h2>' +
            '<div class="totals">' +
              "<div><span>Subtotal</span><span>" + money(subtotal) + "</span></div>" +
              "<div><span>Shipping</span><span>" + (subtotal >= C.FREE_SHIP ? "Free" : money(6)) + "</span></div>" +
              '<div class="grand"><span>Total</span><span>' +
                money(subtotal >= C.FREE_SHIP ? subtotal : subtotal + 6) + "</span></div>" +
            "</div>" +
            "<p class=\"shipnote\">" + (subtotal >= C.FREE_SHIP
              ? "Shipping is free on this order."
              : "Add " + money(C.FREE_SHIP - subtotal) + " for free shipping.") + "</p>" +
            '<a class="btn block" href="' + url("checkout.html") + '">Checkout</a>' +
            '<p class="fineprint">Subscriptions renew every 30 days. Skip, move the date or cancel from your ' +
            "account in two clicks — no phone call, no retention script, no free trial that quietly converts.</p>" +
          "</aside>" +
        "</div>";
    }

    mount.innerHTML =
      '<div class="band"><div class="inner">' +
        crumbs([["Home", "index.html"], ["Your cart", "cart.html"]]) +
        '<header class="pagehead"><p class="eyebrow">Your cart</p><h1 class="serif">Before you check out.</h1></header>' +
        '<div id="cart-body" style="padding:30px 0 60px"></div>' +
      "</div></div>";

    paint();
    document.addEventListener("cadence:cart", paint);
  }

  /* ═══════════════ checkout ═══════════════ */

  function renderCheckout(mount) {
    var items = C.cart.items();
    var subtotal = C.cart.subtotal();
    var ship = subtotal >= C.FREE_SHIP || !items.length ? 0 : 6;

    var summaryItems = items.length
      ? items.map(function (it) {
          return '<div class="lineitem">' +
            '<span class="swatch" style="background:' + it.color + '"></span>' +
            "<span><p class=\"li-n\">" + esc(it.name) + "</p>" +
            '<p class="li-m">' + (it.plan === "sub" ? "Every 30 days" : "One-time") + " · qty " + it.qty + "</p></span>" +
            '<span class="li-p">' + money(it.price * it.qty) + "</span></div>";
        }).join("")
      : '<p class="small">Your cart is empty. <a href="' + url("shop.html") + '">Add something first.</a></p>';

    mount.innerHTML =
      '<div class="band"><div class="inner narrow" style="padding-bottom:70px">' +
        crumbs([["Home", "index.html"], ["Cart", "cart.html"], ["Checkout", "checkout.html"]]) +
        '<header class="pagehead"><p class="eyebrow">Checkout</p><h1 class="serif">Almost there.</h1>' +
        '<p class="lede">This is a design mockup. Nothing is charged, nothing is stored, and no payment ' +
        "details are collected or transmitted anywhere.</p></header>" +

        '<nav class="step-nav" aria-label="Checkout steps" style="margin-top:28px"><ol>' +
          '<li aria-current="step"><span class="n">1</span> Contact</li>' +
          '<li><span class="n">2</span> Shipping</li>' +
          '<li><span class="n">3</span> Payment</li>' +
        "</ol></nav>" +

        '<div class="split wide-left">' +
          '<form class="form" novalidate>' +
            "<fieldset><legend>Contact</legend>" +
              '<div class="field"><label for="co-email">Email <span class="req">(required)</span></label>' +
              '<input class="input" id="co-email" name="email" type="email" autocomplete="email" placeholder="you@example.com">' +
              '<p class="hint">Order confirmation and delivery updates only.</p></div>' +
              '<div class="checkline"><input type="checkbox" id="co-news"><label for="co-news">Email me when there is ' +
              "something worth reading<span class=\"sub\">Roughly monthly. Unsubscribe in one click.</span></label></div>" +
            "</fieldset>" +

            "<fieldset><legend>Shipping address</legend>" +
              '<div class="form-grid two">' +
                '<div class="field"><label for="co-first">First name</label>' +
                '<input class="input" id="co-first" autocomplete="given-name"></div>' +
                '<div class="field"><label for="co-last">Last name</label>' +
                '<input class="input" id="co-last" autocomplete="family-name"></div>' +
              "</div>" +
              '<div class="field"><label for="co-addr">Address</label>' +
              '<input class="input" id="co-addr" autocomplete="address-line1"></div>' +
              '<div class="field"><label for="co-addr2">Apartment, suite, etc. <span class="req">(optional)</span></label>' +
              '<input class="input" id="co-addr2" autocomplete="address-line2"></div>' +
              '<div class="form-grid three">' +
                '<div class="field"><label for="co-city">City</label>' +
                '<input class="input" id="co-city" autocomplete="address-level2"></div>' +
                '<div class="field"><label for="co-state">State</label>' +
                '<select class="select" id="co-state" autocomplete="address-level1">' +
                '<option value="">Select</option><option>California</option><option>New York</option>' +
                "<option>Texas</option><option>Florida</option><option>Other</option></select></div>" +
                '<div class="field"><label for="co-zip">ZIP</label>' +
                '<input class="input" id="co-zip" autocomplete="postal-code" inputmode="numeric"></div>' +
              "</div>" +
            "</fieldset>" +

            "<fieldset><legend>Payment</legend>" +
              '<p class="placeholder"><b>Mockup — inert</b><br>No card fields are rendered and no payment method is ' +
              "connected. On the real store this block is replaced by Shopify Checkout, which handles card data " +
              "directly so it never touches this page.</p>" +
              '<div class="field"><label for="co-code">Discount code</label>' +
              '<div class="row" style="display:flex;gap:10px">' +
              '<input class="input" id="co-code" placeholder="Enter code">' +
              '<button class="btn ghost" type="button" disabled>Apply</button></div></div>' +
            "</fieldset>" +

            '<button class="btn block" type="button" disabled>Pay ' + money(subtotal + ship) + "</button>" +
            '<p class="small">Disabled on purpose. This page cannot take a payment.</p>' +
          "</form>" +

          '<aside class="order-summary"><h2>Order summary</h2>' +
            '<div class="os-items">' + summaryItems + "</div>" +
            '<div class="totals">' +
              "<div><span>Subtotal</span><span>" + money(subtotal) + "</span></div>" +
              "<div><span>Shipping</span><span>" + (ship ? money(ship) : "Free") + "</span></div>" +
              "<div><span>Tax</span><span>Calculated at checkout</span></div>" +
              '<div class="grand"><span>Total</span><span>' + money(subtotal + ship) + "</span></div>" +
            "</div>" +
            '<p class="fineprint">Items marked as a subscription renew every 30 days at the same price. ' +
            "You can skip, reschedule or cancel at any time from your account.</p>" +
            '<p class="fineprint"><a href="' + url("cart.html") + '">Back to cart</a></p>' +
          "</aside>" +
        "</div>" +
      "</div></div>";
  }

  /* ═══════════════ reusable page fragments ═══════════════ */

  /* <div class="prodgrid" data-autogrid="products|kits|all"></div> */
  function fillGrids() {
    var grids = document.querySelectorAll("[data-autogrid]");
    Array.prototype.forEach.call(grids, function (g) {
      var which = g.getAttribute("data-autogrid");
      var list = which === "kits" ? C.KITS
        : which === "all" ? C.KITS.concat(C.PRODUCTS)
        : C.PRODUCTS;
      g.innerHTML = list.map(productCard).join("");
      C.drawPacks(g);
    });
  }

  var PHASES = {
    period: {
      label: "Your period", days: "Days 1–5", tint: "--flow-t",
      feel: "Flattened, thirsty, uncomfortable. The days you want the least friction possible.",
      stack: [
        ["flow", "Ginger, magnesium and electrolytes for the first few days."],
        ["build", "Keep the base going. Consistency is the whole mechanism."]
      ]
    },
    follicular: {
      label: "Follicular & ovulation", days: "Days 6–16", tint: "--build-t",
      feel: "Energy climbing, training feels easier, you want to use it. Nothing to fix here.",
      stack: [["build", "The stretch where your training actually compounds. Same 5 g, every morning."]]
    },
    luteal: {
      label: "Luteal", days: "Days 17–28", tint: "--ease-t",
      feel: "Bloating, cravings, a shorter fuse, sleep that is not landing. The fortnight most people just endure.",
      stack: [
        ["ease", "Magnesium, saffron and B6 across the second half of your cycle."],
        ["build", "Unchanged. The base does not move with the phases."],
        ["rest", "For the nights in this stretch when winding down gets harder."]
      ]
    },
    night: {
      label: "Any night", days: "Not on a schedule", tint: "--rest-t",
      feel: "Wired at 11pm, tired at 7am. Any night of any phase — this one ignores the calendar.",
      stack: [["rest", "3 g glycine, theanine and magnesium. No melatonin, no morning fog."]]
    }
  };

  /* <div data-phasestrip></div> */
  function fillPhaseStrips() {
    var hosts = document.querySelectorAll("[data-phasestrip]");
    Array.prototype.forEach.call(hosts, function (host) {
      var keys = Object.keys(PHASES);
      host.innerHTML =
        '<div class="phasebar" role="tablist" aria-label="Cycle phase">' +
        keys.map(function (k, i) {
          return '<button class="phasebtn" type="button" role="tab" data-phase="' + k +
            '" aria-selected="' + (i === 0) + '" aria-controls="phasepanel">' +
            '<span class="pn">' + esc(PHASES[k].label) + '</span>' +
            '<span class="pd">' + esc(PHASES[k].days) + "</span></button>";
        }).join("") +
        "</div>" +
        '<div class="phasepanel" id="phasepanel" role="tabpanel" aria-live="polite"></div>';

      var panel = host.querySelector("#phasepanel");
      var btns = host.querySelectorAll(".phasebtn");

      function show(k) {
        var ph = PHASES[k];
        panel.style.background = "var(" + ph.tint + ")";
        panel.innerHTML =
          '<p class="feel serif">' + esc(ph.feel) + "</p>" +
          '<div class="stackrow">' + ph.stack.map(function (s) {
            var p = get(s[0]);
            return '<a class="stackcard" href="' + url(p.url) + '">' +
              '<span class="dot" style="background:var(' + p.color + ')"></span>' +
              '<span><span class="sn" style="color:var(' + p.color + ')">' + esc(p.name) + "</span>" +
              '<span class="sw">' + esc(s[1]) + "</span></span></a>";
          }).join("") + "</div>";
        Array.prototype.forEach.call(btns, function (b) {
          b.setAttribute("aria-selected", String(b.getAttribute("data-phase") === k));
        });
      }

      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () { show(b.getAttribute("data-phase")); });
      });
      show("period");
    });
  }

  /* ═══════════════ dispatch ═══════════════ */

  function boot() {
    fillGrids();
    fillPhaseStrips();

    var mount = document.getElementById("main");
    if (!mount) { return; }
    var page = mount.getAttribute("data-page");
    var id = mount.getAttribute("data-id");

    if (page === "pdp") { renderPDP(mount, id); }
    else if (page === "kit") { renderKit(mount, id); }
    else if (page === "shop") { renderShop(mount); }
    else if (page === "cart") { renderCart(mount); }
    else if (page === "checkout") { renderCheckout(mount); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
