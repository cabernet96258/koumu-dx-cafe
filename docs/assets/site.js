(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── watercolour ground fit ────────────────────────────────────────────
     Each .wc-tile's viewBox (1440x900, landscape) is designed for the
     desktop-width layout. On a narrow/tall phone viewport, "xMidYMid slice"
     zooms into a thin center strip to cover the tall box, cropping out most
     of the painted colour and leaving the wash almost invisible. The colour
     fields are soft blurred blobs with no crisp edges, so switching to
     "none" (non-uniform stretch, no cropping) reads as the same wash with
     no visible distortion, while keeping every colour on screen. */

  function fitWatercolorTiles() {
    var mode = window.matchMedia("(max-width: 1119px)").matches ? "none" : "xMidYMid slice";
    var tiles = document.querySelectorAll(".wc-tile");
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].setAttribute("preserveAspectRatio", mode);
    }
  }

  /* ── きょうのひとやすみ ─────────────────────────────────────────────── */

  var RESTS = [
    "コーヒーが冷めないうちに、ひと息どうぞ。",
    "今日やらなかったことは、明日の自分にお任せしましょう。",
    "定時に帰るのは、さぼりではありません。",
    "うまくいかなかった一時間も、ちゃんと仕事です。",
    "肩を下げて、ゆっくり吐いてみてください。",
    "明日できることは明日やる。今しかできないことを優先しよう。",
    "完璧よりもほどほどに。いつも100点を目指すのではなく、安定して60点の出来を目指そう。",
    "やりがいのある仕事は人生を豊かにします。",
    "上司の機嫌は天気と同じ。自分がコントロールできないことに構うのはやめよう。",
    "愚痴ばかりの人からはこっそり距離をとろう。愚痴を聞いていいのは家族だけ。",
    "嫌な記憶は、楽しい記憶で上書きしよう。",
    "やる気なんて頑張って出すもんじゃない。頑張らなくてもできる仕組みを作ろう。",
    "ブラックと微糖を使い分けよう。",
    "授業がうまい先生、仕事ができる先生のテクニックを真似しよう。真似しようと工夫していくうちに、やがてそれが自分のオリジナルになっていく。"
  ];

  function greeting() {
    var h = new Date().getHours();
    if (h < 7) return "はやい時間からおつかれさまです";
    if (h < 11) return "おはようございます";
    if (h < 14) return "お昼はとれましたか";
    if (h < 18) return "放課後です";
    if (h < 22) return "そろそろ帰りましょう";
    return "夜おそくまでおつかれさまです";
  }

  function lockRestHeight(msg) {
    var current = msg.textContent;
    var maxH = 0;
    for (var k = 0; k < RESTS.length; k++) {
      msg.textContent = RESTS[k];
      if (msg.scrollHeight > maxH) maxH = msg.scrollHeight;
    }
    msg.textContent = current;
    msg.style.minHeight = maxH + "px";
  }

  function startRestBar() {
    var msg = document.querySelector("[data-rest-msg]");
    var greet = document.querySelector("[data-rest-greeting]");
    if (greet) greet.textContent = greeting();
    if (!msg) return;

    var i = 0;
    msg.textContent = RESTS[0];
    if (reduceMotion) return;

    // The longest message can wrap to several lines on narrow screens; lock
    // the tallest possible height up front so rotating messages never
    // reflows the page. Re-measure on resize (wrapping depends on width)
    // and once webfonts finish loading (metrics can shift after swap-in).
    lockRestHeight(msg);
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { lockRestHeight(msg); }, 150);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { lockRestHeight(msg); });
    }

    setInterval(function () {
      msg.style.opacity = "0";
      setTimeout(function () {
        i = (i + 1) % RESTS.length;
        msg.textContent = RESTS[i];
        msg.style.opacity = "1";
      }, 800);
    }, 8000);
  }

  /* ── scroll reveal ──────────────────────────────────────────────────── */

  function startReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    var showAll = function () {
      targets.forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.filter = "none";
      });
    };
    window.addEventListener("beforeprint", showAll);

    if (typeof IntersectionObserver === "undefined" || reduceMotion) return;

    var DIST = 20, DUR = "1.1s", BLUR = 6;
    var EASE = "cubic-bezier(.22,.7,.2,1)";

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.opacity = "1";
        e.target.style.transform = "none";
        e.target.style.filter = "blur(0px)";
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.03 });

    targets.forEach(function (el) {
      // Anything already on screen at load stays visible — never fade in the fold.
      if (el.getBoundingClientRect().top <= window.innerHeight) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(" + DIST + "px)";
      el.style.filter = "blur(" + BLUR + "px)";
      el.style.transition =
        "opacity " + DUR + " " + EASE +
        ", transform " + DUR + " " + EASE +
        ", filter " + DUR + " " + EASE;
      io.observe(el);
    });

    setTimeout(showAll, 1400);
  }

  /* ── depth drift on the watercolour ground ──────────────────────────── */

  function startDrift() {
    var layers = Array.prototype.slice.call(document.querySelectorAll(".wc-bg [data-depth]"));
    if (!layers.length || reduceMotion) return;

    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        layers.forEach(function (g) {
          var d = parseFloat(g.getAttribute("data-depth")) || 0;
          g.style.transform =
            "translate3d(" + (-y * d * 0.05).toFixed(2) + "px," +
            (-y * d * 0.18).toFixed(2) + "px,0)";
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── rising motes ───────────────────────────────────────────────────── */

  function startParticles() {
    var cv = document.querySelector(".wc-particles");
    if (!cv || reduceMotion) return;

    var ctx = cv.getContext("2d");
    var w = 0, h = 0;

    var resize = function () {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w;
      cv.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    var tints = ["201,154,78", "224,196,138", "247,242,230", "255,253,248"];
    var sprites = tints.map(function (t) {
      var S = 48;
      var c = document.createElement("canvas");
      c.width = c.height = S;
      var g = c.getContext("2d");
      var rg = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      rg.addColorStop(0, "rgba(" + t + ",1)");
      rg.addColorStop(0.45, "rgba(" + t + ",0.42)");
      rg.addColorStop(1, "rgba(" + t + ",0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, S, S);
      return c;
    });

    var make = function (seed) {
      return {
        x: Math.random() * w,
        y: seed ? Math.random() * h : h + Math.random() * 60,
        r: 0.9 + Math.random() * 2.6,
        vy: 0.26 + Math.random() * 0.78,
        drift: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        sway: 0.4 + Math.random() * 1.4,
        life: 0,
        span: 520 + Math.random() * 900,
        peak: 0.16 + Math.random() * 0.3,
        sprite: sprites[(Math.random() * sprites.length) | 0]
      };
    };

    var count = Math.max(14, Math.min(38, Math.round(w / 42)));
    var ps = [];
    for (var n = 0; n < count; n++) ps.push(make(true));

    var last = 0;
    var draw = function (now) {
      requestAnimationFrame(draw);
      if (now - last < 32) return;
      last = now || 0;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.life++;
        p.y -= p.vy;
        p.phase += 0.01;
        p.x += p.drift + Math.sin(p.phase) * p.sway * 0.14;
        var t = p.life / p.span;
        if (t >= 1 || p.y < -20) { ps[i] = make(false); continue; }
        var a = t < 0.18 ? t / 0.18 : (t > 0.7 ? Math.max(0, (1 - t) / 0.3) : 1);
        var d = p.r * 6.8;
        ctx.globalAlpha = a * p.peak;
        ctx.drawImage(p.sprite, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(draw);
  }

  /* ── tool list filter ───────────────────────────────────────────────── */

  function startFilter() {
    var bar = document.querySelector("[data-filter-bar]");
    if (!bar) return;

    var opts = Array.prototype.slice.call(bar.querySelectorAll(".filter-opt"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".tool-card"));
    var countEl = document.querySelector("[data-filter-count]");

    var apply = function (label) {
      var shown = 0;
      cards.forEach(function (card) {
        var hit = label === "すべて" || label.indexOf(card.dataset.cat) === 0;
        card.hidden = !hit;
        if (hit) shown++;
      });
      opts.forEach(function (o) {
        o.setAttribute("aria-pressed", String(o.dataset.filter === label));
      });
      if (countEl) countEl.textContent = shown + " 個のツール";
    };

    opts.forEach(function (o) {
      o.addEventListener("click", function () { apply(o.dataset.filter); });
    });
  }

  fitWatercolorTiles();
  window.addEventListener("resize", fitWatercolorTiles);

  startRestBar();
  startReveal();
  startDrift();
  startParticles();
  startFilter();
})();
