/* =========================================================
   交互逻辑（原生 JS，无依赖）
   加载动画 · 文字遮罩揭示 · 滚动动效 · 导航 · 色块扫场转场 · 作品渲染
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* 文字分割（CJK 逐字 / 拉丁逐词），用于遮罩揭示 */
  function tokenize(s) {
    var re = /[㐀-鿿぀-ヿ가-힯]|[^\s㐀-鿿぀-ヿ가-힯]+|\s+/g;
    return s.match(re) || [];
  }
  function splitText(el) {
    var tokens = tokenize(el.textContent);
    el.textContent = "";
    var i = 0;
    tokens.forEach(function (tok) {
      if (/^\s+$/.test(tok)) { el.appendChild(document.createTextNode(" ")); return; }
      var w = document.createElement("span"); w.className = "split-w";
      var inner = document.createElement("span"); inner.className = "split-i";
      inner.textContent = tok;
      inner.style.setProperty("--d", (i * 55) + "ms");
      w.appendChild(inner); el.appendChild(w);
      i++;
    });
    el.classList.add("split-ready");
  }
  function splitAll() { $$("[data-split]").forEach(splitText); }

  /* 揭示观察器 */
  function setupReveals() {
    var targets = $$("[data-reveal], [data-split]");
    if (!("IntersectionObserver" in window)) { targets.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* 加载动画 */
  function lockScroll(on) { document.body.style.overflow = on ? "hidden" : ""; }
  function runPreloader(done) {
    var pre = $("#preloader"), num = $("#loadNum"), bar = $("#loadBar");
    if (!pre || !num) { done(); return; }
    var start = null, DUR = 1500;
    function step(t) {
      if (!start) start = t;
      var k = Math.min((t - start) / DUR, 1);
      var eased = 1 - Math.pow(1 - k, 3);
      var p = Math.round(eased * 100);
      num.textContent = p; if (bar) bar.style.width = p + "%";
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(function () {
        pre.classList.add("is-done");
        setTimeout(function () { pre.style.display = "none"; done(); }, 1000);
      }, 200);
    }
    requestAnimationFrame(step);
  }

  /* 导航 + 进度条 */
  function setupNav() {
    var nav = $("#nav"), pbar = $("#progressBar");
    function onScroll() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (nav) nav.classList.toggle("is-scrolled", y > 8);
      if (pbar) { var h = document.documentElement.scrollHeight - window.innerHeight; pbar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%"; }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    var toggle = $("#navToggle"), menu = $("#navLinks");
    if (toggle && menu) {
      var close = function () { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "打开菜单"); lockScroll(false); };
      var open = function () { menu.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-label", "关闭菜单"); lockScroll(true); };
      toggle.addEventListener("click", function () { menu.classList.contains("is-open") ? close() : open(); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    }
  }

  /* 色块扫场转场（点击导航/页内锚点触发） */
  function setupTransition() {
    var wipe = document.createElement("div");
    wipe.className = "wipe"; wipe.setAttribute("aria-hidden", "true");
    wipe.innerHTML = '<span class="wipe__mark mono">&gt;_</span>';
    document.body.appendChild(wipe);
    var busy = false;

    function jump(hash) {
      var top = 0;
      if (hash && hash !== "#home") {
        var el = document.querySelector(hash);
        if (el) top = el.getBoundingClientRect().top + window.pageYOffset - 64;
      }
      var html = document.documentElement, prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, Math.max(0, top));
      html.style.scrollBehavior = prev;
    }
    function go(hash) {
      if (busy) return;
      if (reduce) { jump(hash); return; }
      busy = true;
      wipe.classList.add("is-cover");
      setTimeout(function () {
        jump(hash);
        wipe.classList.add("is-reveal");
        setTimeout(function () { wipe.classList.remove("is-cover", "is-reveal"); busy = false; }, 580);
      }, 510);
    }

    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var hash = a.getAttribute("href");
        if (!hash || hash === "#") return;
        if (hash !== "#home" && !document.querySelector(hash)) return;
        e.preventDefault();
        go(hash);
        if (history.replaceState) history.replaceState(null, "", hash === "#home" ? " " : hash);
      });
    });
  }

  function jumpToInitialHash() {
    var hash = window.location.hash;
    if (!hash || hash === "#home") return;
    var el = document.querySelector(hash);
    if (!el) return;
    [el].concat($$("[data-reveal], [data-split]", el)).forEach(function (target) {
      target.classList.add("is-in", "split-ready");
    });
    var html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 64));
    html.style.scrollBehavior = prev;
  }

  /* 作品渲染 */
  function renderProjects() {
    var wrap = $("#works");
    if (!wrap || typeof PROJECTS === "undefined") return;
    wrap.innerHTML = PROJECTS.map(function (p, i) {
      var idx = ("0" + (i + 1)).slice(-2);
      var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("");
      var links = (p.links || []).map(function (l) {
        var ext = /^https?:/i.test(l.url) ? ' target="_blank" rel="noopener"' : "";
        return '<a class="work__link link-underline" href="' + l.url + '"' + ext + ">" + l.label + "</a>";
      }).join("");
      return '<article class="work" data-reveal>' +
        '<div class="work__media"><img src="' + p.cover + '" alt="' + p.title + ' 封面" loading="lazy" /></div>' +
        '<div class="work__body">' +
        '<span class="work__index mono">' + idx + (p.badge ? " / " + p.badge : "") + "</span>" +
        '<h3 class="work__title">' + p.title + "</h3>" +
        '<div class="work__tags">' + tags + "</div>" +
        '<p class="work__desc">' + p.desc + "</p>" +
        (links ? '<div class="work__links">' + links + "</div>" : "") +
        "</div></article>";
    }).join("");
  }

  /* 杂项 */
  function setYear() { var y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }
  function revealAll() { $$("[data-reveal], [data-split]").forEach(function (el) { el.classList.add("is-in", "split-ready"); }); }
  function killPreloader() { var p = $("#preloader"); if (p) { p.classList.add("is-done"); p.style.display = "none"; } lockScroll(false); }

  /* 启动 */
  document.addEventListener("DOMContentLoaded", function () {
    try {
      renderProjects();
      setYear();
      setupNav();
      setupTransition();
      if (reduce) { revealAll(); killPreloader(); jumpToInitialHash(); return; }
      splitAll();
      lockScroll(true);
      runPreloader(function () { lockScroll(false); setupReveals(); jumpToInitialHash(); });
    } catch (err) {
      if (window.console) console.error(err);
      revealAll(); killPreloader(); jumpToInitialHash();
    }
    setTimeout(function () {
      var pre = $("#preloader");
      if (pre && pre.style.display !== "none") { revealAll(); killPreloader(); jumpToInitialHash(); }
    }, 6000);
  });
})();
