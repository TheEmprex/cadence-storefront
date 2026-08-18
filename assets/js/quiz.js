/* ============================================================================
   CADENCE — the quiz
   Six questions, one per screen. Renders into #quiz-mount.
   Loads after store.js and content.js.

   SAFETY: the pregnancy/nursing answer short-circuits to a screen that
   recommends nothing, shows no price and has no add-to-cart. Do not "fix"
   that path into a sale.
   ========================================================================== */
(function () {
  "use strict";

  var C = window.Cadence;
  if (!C) { return; }
  var esc = C.esc, money = C.money, url = C.url, get = C.get;

  var QUESTIONS = [
    {
      id: "where", multi: false,
      title: "Where are you in your cycle today?",
      hint: "A rough guess is fine — nothing here depends on getting it exact.",
      opts: [
        { v: "period", l: "On my period", s: "Days 1–5" },
        { v: "follicular", l: "Just finished, or mid-month", s: "Days 6–16, energy climbing" },
        { v: "luteal", l: "The week or two before", s: "Days 17–28" },
        { v: "unsure", l: "Honestly no idea", s: "Or my cycle is irregular" },
        { v: "none", l: "I don't get a period", s: "Contraception, medical, or otherwise" }
      ]
    },
    {
      id: "luteal", multi: true,
      title: "In the second half of your month, what actually shows up?",
      hint: "Pick everything that applies.",
      opts: [
        { v: "bloat", l: "Bloating and puffiness" },
        { v: "mood", l: "Mood dips and a shorter fuse" },
        { v: "cravings", l: "Cravings I can't argue with" },
        { v: "tender", l: "Tenderness and general soreness" },
        { v: "sleep", l: "Sleep gets noticeably worse" },
        { v: "none", l: "Not much, honestly" }
      ]
    },
    {
      id: "period", multi: true,
      title: "And the first few days?",
      hint: "Pick everything that applies.",
      opts: [
        { v: "cramps", l: "Cramping and discomfort" },
        { v: "lowe", l: "Flattened — low energy, thirsty" },
        { v: "nausea", l: "Queasy, or off my food" },
        { v: "heavy", l: "Heavy, and it takes a lot out of me" },
        { v: "fine", l: "They're mostly fine" }
      ]
    },
    {
      id: "sleep", multi: true,
      title: "How's sleep, generally?",
      hint: "Pick everything that applies.",
      opts: [
        { v: "onset", l: "Takes ages to fall asleep", s: "Brain won't switch off" },
        { v: "waking", l: "I wake up in the night" },
        { v: "groggy", l: "I wake up foggy", s: "Even after enough hours" },
        { v: "fine", l: "Sleep is fine" }
      ]
    },
    {
      id: "training", multi: false,
      title: "Training right now?",
      hint: "This changes how we talk about the base, not whether you get it.",
      opts: [
        { v: "strength", l: "Lifting or strength work", s: "Twice a week or more" },
        { v: "low", l: "Pilates, yoga, walking", s: "Moving, not lifting" },
        { v: "none", l: "Not really, not right now" }
      ]
    },
    {
      id: "flags", multi: true,
      title: "Anything we should know before recommending?",
      hint: "This changes what we will and won't suggest.",
      opts: [
        { v: "bc", l: "I'm on hormonal birth control" },
        { v: "pregnant", l: "I'm pregnant or nursing" },
        { v: "intim", l: "I'd like daily intimate wellness covered too" },
        { v: "nothing", l: "None of these" }
      ]
    }
  ];

  var EXCLUSIVE = { none: 1, fine: 1, nothing: 1 };

  var answers = {};
  var step = 0;
  var mount, inner, bar;

  function has(id, v) { return (answers[id] || []).indexOf(v) !== -1; }
  function any(id, vs) {
    for (var i = 0; i < vs.length; i++) { if (has(id, vs[i])) { return true; } }
    return false;
  }

  function setProgress(frac) {
    if (bar) { bar.style.width = Math.round(frac * 100) + "%"; }
  }

  function renderQuestion() {
    var q = QUESTIONS[step];
    var picked = answers[q.id] || [];
    setProgress(step / QUESTIONS.length);

    inner.innerHTML =
      '<p class="qcount">Question ' + (step + 1) + " of " + QUESTIONS.length + "</p>" +
      '<h2 class="qtitle serif">' + esc(q.title) + "</h2>" +
      '<p class="qhint">' + esc(q.hint) + "</p>" +
      '<div class="qopts" role="group" aria-label="' + esc(q.title) + '">' +
        q.opts.map(function (o) {
          var on = picked.indexOf(o.v) !== -1;
          return '<button class="qopt' + (q.multi ? " multi" : "") + '" type="button" ' +
            'aria-pressed="' + on + '" data-v="' + o.v + '">' +
            '<span class="box" aria-hidden="true">' + (on ? "✓" : "") + "</span>" +
            '<span class="lbl"><b>' + esc(o.l) + "</b>" +
            (o.s ? "<small>" + esc(o.s) + "</small>" : "") + "</span></button>";
        }).join("") +
      "</div>" +
      '<div class="qnav">' +
        (step > 0 ? '<button class="linkbtn" type="button" id="qback">← Back</button>' : "<span></span>") +
        '<button class="btn" type="button" id="qnext"' + (picked.length ? "" : " disabled") + ">" +
        (step === QUESTIONS.length - 1 ? "See my kit" : "Next") + "</button>" +
      "</div>";

    Array.prototype.forEach.call(inner.querySelectorAll(".qopt"), function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-v");
        var cur = answers[q.id] || [];
        if (!q.multi || EXCLUSIVE[v]) {
          cur = [v];
        } else {
          cur = cur.filter(function (x) { return !EXCLUSIVE[x]; });
          cur = cur.indexOf(v) !== -1
            ? cur.filter(function (x) { return x !== v; })
            : cur.concat(v);
        }
        answers[q.id] = cur;
        renderQuestion();
        if (!q.multi) { window.setTimeout(advance, 180); }
      });
    });

    var back = document.getElementById("qback");
    if (back) { back.addEventListener("click", function () { step--; renderQuestion(); }); }
    document.getElementById("qnext").addEventListener("click", advance);
  }

  function advance() {
    if (!(answers[QUESTIONS[step].id] || []).length) { return; }
    if (step === QUESTIONS.length - 1) { renderResult(); }
    else { step++; renderQuestion(); }
  }

  /* ── scoring ─────────────────────────────────────────────────────────── */

  function buildStack() {
    var stack = ["build"];
    var why = {};

    why.build = has("training", "strength")
      ? "The base. You're lifting, so this is the one that compounds — 5 g every morning, every phase."
      : has("training", "none")
        ? "The base. Worth taking without training too: the strength and recovery story does not require a gym."
        : "The base. Same 5 g every morning, whatever the rest of the month is doing.";

    if (any("luteal", ["bloat", "mood", "cravings", "tender", "sleep"])) {
      stack.push("ease");
      var named = [];
      if (has("luteal", "bloat")) { named.push("bloating"); }
      if (has("luteal", "mood")) { named.push("mood"); }
      if (has("luteal", "cravings")) { named.push("cravings"); }
      if (has("luteal", "tender")) { named.push("tenderness"); }
      why.ease = named.length
        ? "You flagged " + named.join(", ") + " in the second half. Magnesium, saffron and B6, across those twelve days only."
        : "Your sleep goes sideways in the luteal stretch, which is the fortnight this one is built for.";
    }

    if (any("period", ["cramps", "lowe", "nausea", "heavy"])) {
      stack.push("flow");
      why.flow = has("period", "nausea")
        ? "Ginger leads this one, which is also why it tends to sit well when you're queasy."
        : "Ginger, magnesium and electrolytes for the first few days — the ones you said take it out of you.";
    }

    if (any("sleep", ["onset", "waking", "groggy"]) || has("luteal", "sleep")) {
      stack.push("rest");
      why.rest = has("sleep", "groggy")
        ? "You wake up foggy, so the melatonin-free part matters here — that fog is usually the melatonin rather than the sleep."
        : has("sleep", "onset")
          ? "3 g glycine and theanine, for the gap between lying down and actually being asleep."
          : "3 g glycine, theanine and magnesium. Felt the first night, and nothing left over in the morning.";
    }

    if (has("flags", "intim")) {
      stack.push("intimate");
      why.intimate = "Daily, and independent of your cycle. Named strains at a count guaranteed through end of shelf life.";
    }

    return { stack: stack, why: why };
  }

  /* Returns { kit, exact } or null.

     An exact match is obvious. The non-obvious case: because kits are discounted
     against the sum of their parts, a larger kit can cost LESS than a smaller
     hand-picked set — four formulas bought singly is $119, the five-formula Full
     Ritual is $118. Recommending the $119 option would be indefensible, so if a
     kit is a superset of what she needs AND costs no more, we recommend that and
     say why. */
  function kitSingles(kit) {
    var total = 0;
    kit.packs.forEach(function (id) { total += get(id).sub; });
    return total;
  }

  function mapKit(stack) {
    var key = stack.slice().sort().join(",");
    var kits = C.KITS;

    for (var i = 0; i < kits.length; i++) {
      if (kits[i].packs.slice().sort().join(",") === key) {
        return { kit: kits[i], exact: true };
      }
    }

    var singles = 0;
    stack.forEach(function (id) { singles += get(id).sub; });

    var best = null;
    kits.forEach(function (k) {
      var covers = stack.every(function (id) { return k.packs.indexOf(id) !== -1; });
      if (!covers) { return; }
      if (k.sub > singles) { return; }
      if (!best || k.sub < best.sub) { best = k; }
    });

    return best ? { kit: best, exact: false, singles: singles } : null;
  }

  function notes(stack) {
    var out = [];
    if (has("flags", "bc")) {
      out.push(["Because you're on hormonal birth control",
        "Ease uses saffron rather than chasteberry — chasteberry is the ingredient most commonly flagged for " +
        "interaction with hormonal contraception, and we left it out for exactly this reason. Nothing in your kit " +
        "is formulated to act on your hormones. Still worth a word with your doctor if you take anything else."]);
    }
    if (has("where", "none") || has("where", "unsure")) {
      out.push(["Because your cycle isn't predictable",
        "Take Ease and Flow by how you feel rather than by a date. The phase names on this site are a shorthand, " +
        "not a schedule you have to hit."]);
    }
    if (stack.indexOf("build") !== -1) {
      out.push(["One honest note on timing",
        "Build takes three to four weeks to do anything at all — that's saturation, not marketing. If you judge it " +
        "at day ten you'll conclude it doesn't work. Everything else in your kit is faster."]);
    }
    return out;
  }

  /* ── result ──────────────────────────────────────────────────────────── */

  function renderResult() {
    setProgress(1);
    var head = document.getElementById("quiz-head");
    if (head) { head.hidden = true; }

    /* Safety gate. This path sells nothing. */
    if (has("flags", "pregnant")) {
      inner.innerHTML =
        '<p class="qcount">Your result</p>' +
        '<h2 class="qtitle serif">We\'re not going to recommend anything today.</h2>' +
        "<p>Several ingredients across this line — including the ones doing the real work in Ease and Rest — " +
        "aren't appropriate during pregnancy or nursing, and a quiz is the wrong thing to be deciding that. " +
        "Please talk to your doctor or midwife about what's suitable for you right now.</p>" +
        "<p>We'd rather lose the sale than get this one wrong.</p>" +
        '<div class="qnav" style="margin-top:26px">' +
        '<button class="linkbtn" type="button" id="qrestart">Start over</button>' +
        '<a class="linkbtn" href="' + url("pages/faq.html") + '">Read the FAQ</a></div>';
      document.getElementById("qrestart").addEventListener("click", restart);
      save(null);
      return;
    }

    var res = buildStack();
    var stack = res.stack, why = res.why;
    var match = mapKit(stack);
    var kit = match ? match.kit : null;

    var sumSub = 0, sumOnce = 0;
    stack.forEach(function (id) { var p = get(id); sumSub += p.sub; sumOnce += p.once; });

    /* An upgraded match covers more than she asked for, so show the kit's real
       contents rather than only the formulas the answers produced. */
    var upgradeNote = null;
    if (match && !match.exact) {
      var extra = kit.packs.filter(function (id) { return stack.indexOf(id) === -1; });
      upgradeNote = [
        "You're being shown a bigger kit, and it's cheaper",
        "Your answers point at " + stack.length + " formulas, which comes to " + money(sumSub) +
        " bought individually. " + kit.name + " costs " + money(kit.sub) + " and includes " +
        extra.map(function (id) { return get(id).name; }).join(" and ") +
        " as well — so taking the larger box is the cheaper option. Nothing obliges you to use the extra; " +
        "you can also buy just the " + stack.length + " on their own from the shop."
      ];
      stack = kit.packs.slice();
      extra.forEach(function (id) {
        why[id] = why[id] || (get(id).what + " Included because the kit costs less than your formulas bought singly.");
      });
    }

    /* A one-formula result is not a "kit" — name it after the product so the
       cart line and the order confirmation say something meaningful. */
    var soleProduct = stack.length === 1 ? get(stack[0]) : null;

    var target = kit || (soleProduct ? {
      id: soleProduct.id, name: soleProduct.name, sub: soleProduct.sub, once: soleProduct.once,
      color: soleProduct.color, keys: soleProduct.keys, url: soleProduct.url
    } : {
      id: "custom", name: "Your kit", sub: sumSub, once: sumOnce,
      color: get(stack[stack.length - 1]).color,
      keys: stack.map(function (id) { return get(id).name; }).join(" · "),
      url: "shop.html"
    });

    inner.innerHTML =
      '<p class="qcount">Your result</p>' +
      '<h2 class="qtitle serif">' + esc(target.name) + "</h2>" +
      '<p class="qhint">' + stack.length + " formula" + (stack.length > 1 ? "s" : "") +
        ", sized to one cycle.</p>" +
      '<div class="rstack" data-packs="' + stack.join(",") + '"></div>' +
      '<div class="rlist">' + stack.map(function (id) {
        var p = get(id);
        return '<a class="ritem" href="' + url(p.url) + '">' +
          '<span class="dot" style="background:var(' + p.color + ')"></span>' +
          '<span><span class="rn" style="color:var(' + p.color + ')">' + esc(p.name) + "</span>" +
          '<span class="rw">' + esc(why[id]) + "</span></span></a>";
      }).join("") + "</div>" +
      (upgradeNote ? [upgradeNote] : []).concat(notes(stack)).map(function (n) {
        return '<div class="flag"><b>' + esc(n[0]) + "</b>" + esc(n[1]) + "</div>";
      }).join("") +
      '<p class="rprice"><span class="amt">' + money(target.sub) + "</span>" +
        '<span class="per">/ cycle, subscribed</span>' +
        '<span class="was">' + money(target.once) + "</span></p>" +
      '<p class="savenote">' + (kit
        ? "Save " + money(kitSingles(kit) - kit.sub) + " a cycle against buying these separately, in one parcel " +
          "instead of " + kit.packs.length + ". Skip or cancel any time."
        : "Priced as individual boxes. Skip or cancel any time.") + "</p>" +
      '<button class="btn block" type="button" style="margin-bottom:14px" ' +
        'data-add="' + esc(target.name) + '" data-id="' + esc(target.id) + '" ' +
        'data-meta="' + esc(target.keys) + '" data-color="var(' + target.color + ')" ' +
        'data-url="' + esc(target.url) + '" ' +
        'data-sub-price="' + target.sub + '" data-once-price="' + target.once + '">' +
        "Add to cart — " + money(target.sub) + "</button>" +
      '<div class="qnav">' +
        '<button class="linkbtn" type="button" id="qrestart">Start over</button>' +
        '<a class="linkbtn" href="' + url("shop.html") + '">See all five formulas</a>' +
      "</div>";

    C.drawPacks(inner);
    document.getElementById("qrestart").addEventListener("click", restart);
    save({ stack: stack, answers: answers, kit: kit ? kit.id : null });
  }

  function save(result) {
    try {
      if (result) { window.localStorage.setItem("cadence-quiz", JSON.stringify(result)); }
      else { window.localStorage.removeItem("cadence-quiz"); }
    } catch (e) { /* private mode or file:// lockdown — the result is still on screen */ }
  }

  function restart() {
    answers = {};
    step = 0;
    var head = document.getElementById("quiz-head");
    if (head) { head.hidden = false; }
    renderQuestion();
  }

  function boot() {
    mount = document.getElementById("quiz-mount");
    if (!mount) { return; }
    mount.innerHTML =
      '<div class="quizshell"><div class="quizbar"><span id="quizprogress"></span></div>' +
      '<div class="quizinner" id="quizinner"></div></div>';
    inner = document.getElementById("quizinner");
    bar = document.getElementById("quizprogress");
    renderQuestion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
