(function () {
  "use strict";

  var ICONS = {
    experience:
      '<svg class="hl-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/><path d="M24 12v12l8 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    custom:
      '<svg class="hl-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="8" y="10" width="32" height="28" rx="3" stroke="currentColor" stroke-width="2"/><path d="M14 18h20M14 24h14M14 30h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    wood: '<svg class="hl-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><ellipse cx="24" cy="24" rx="16" ry="18" stroke="currentColor" stroke-width="2"/><path d="M24 6c6 8 6 28 0 36M16 14c8 4 8 16 0 20M32 14c-8 4-8 16 0 20" stroke="currentColor" stroke-width="1.6"/></svg>',
    machine:
      '<svg class="hl-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="7" y="20" width="34" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M14 20V12h20v8M18 36v4h12v-4" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="28" r="2" fill="currentColor"/><circle cx="24" cy="28" r="2" fill="currentColor"/><circle cx="32" cy="28" r="2" fill="currentColor"/></svg>',
  };

  var state = {
    config: null,
    page: document.body.getAttribute("data-page") || "home",
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fileName() {
    var path = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();
    return path || "index.html";
  }

  function renderHeader(cfg) {
    var current = fileName();
    var nav = cfg.nav
      .map(function (item) {
        var active = item.href === current ? " is-active" : "";
        return (
          '<a href="' +
          item.href +
          '" class="' +
          active.trim() +
          '">' +
          escapeHtml(item.label) +
          "</a>"
        );
      })
      .join("");

    $("#site-header").innerHTML =
      '<div class="wrap header-inner">' +
      '<a class="brand" href="index.html">' +
      '<img src="' +
      escapeHtml(cfg.site.logo) +
      '" alt="' +
      escapeHtml(cfg.site.name) +
      '">' +
      '<span class="brand-text"><span class="brand-name">' +
      escapeHtml(cfg.site.name) +
      "</span>" +
      '<span class="brand-sub">' +
      escapeHtml(cfg.site.subtitle) +
      "</span></span></a>" +
      '<nav class="nav" id="site-nav">' +
      nav +
      "</nav>" +
      '<button class="menu-toggle" type="button" aria-label="打开菜单" aria-expanded="false"><span></span></button>' +
      "</div>";
  }

  function companyOf(cfg) {
    return cfg.company || {};
  }

  function renderFooter(cfg) {
    var nav = cfg.nav
      .map(function (item) {
        return '<a href="' + item.href + '">' + escapeHtml(item.label) + "</a>";
      })
      .join("");
    var c = cfg.contact;
    var co = companyOf(cfg);
    var companyLines = "";

    if (co.legalName) {
      companyLines += "<span>名称：" + escapeHtml(co.legalName) + "</span>";
    }
    if (co.creditCode) {
      companyLines +=
        "<span>统一社会信用代码：" + escapeHtml(co.creditCode) + "</span>";
    }
    if (co.operator) {
      companyLines += "<span>经营者：" + escapeHtml(co.operator) + "</span>";
    }

    var copyBits = "<span>" + escapeHtml(cfg.site.footer) + "</span>";
    if (co.icp) {
      copyBits +=
        '<a href="' +
        escapeHtml(co.icpHref || "https://beian.miit.gov.cn/") +
        '" target="_blank" rel="noopener">' +
        escapeHtml(co.icp) +
        "</a>";
    }
    if (cfg.site.originalNote) {
      copyBits +=
        '<span class="copyright-note">' +
        escapeHtml(cfg.site.originalNote) +
        "</span>";
    }

    copyBits += siteStatsHtml(cfg);

    $("#site-footer").innerHTML =
      '<div class="wrap">' +
      '<div class="footer-grid">' +
      '<div><div class="brand-name">' +
      escapeHtml(cfg.site.name) +
      "</div>" +
      '<p class="muted footer-sub">' +
      escapeHtml(cfg.site.subtitle) +
      "</p></div>" +
      '<div><h3>页面</h3><div class="footer-nav">' +
      nav +
      "</div></div>" +
      '<div><h3>联系</h3><div class="footer-contact">' +
      "<span>电话：" +
      escapeHtml(c.phone) +
      "</span>" +
      "<span>微信：" +
      escapeHtml(c.wechat) +
      "</span>" +
      "<span>" +
      escapeHtml(c.address) +
      "</span></div></div>" +
      '<div><h3>公司信息</h3><div class="footer-contact">' +
      companyLines +
      "</div></div>" +
      "</div>" +
      '<div class="copy">' +
      copyBits +
      "</div></div>";

    startUptime(cfg);
    loadBusuanzi(cfg);
    bindBusuanziOffset(cfg);
  }

  function statsNumber(stats, key) {
    var n = Number(stats && stats[key]);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function statsHoursSinceStart(stats) {
    var start = parseStartAt(stats && stats.startAt);
    if (!start) return 0;
    var hours = (Date.now() - start.getTime()) / 3600000;
    return hours > 0 ? hours : 0;
  }

  function statsFakeExtra(stats, perHourKey) {
    return Math.floor(
      statsHoursSinceStart(stats) * statsNumber(stats, perHourKey),
    );
  }

  function statsDisplayBase(stats, offsetKey, perHourKey) {
    return Math.floor(
      statsNumber(stats, offsetKey) + statsFakeExtra(stats, perHourKey),
    );
  }

  function parseStartAt(raw) {
    if (!raw) return null;
    var t = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      t += "T00:00:00+08:00";
    } else if (/^\d{4}-\d{2}-\d{2} /.test(t)) {
      t = t.replace(" ", "T");
      if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(t)) t += "+08:00";
    }
    var d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatUptime(start) {
    var ms = Date.now() - start.getTime();
    if (ms < 0) ms = 0;
    var sec = Math.floor(ms / 1000);
    var days = Math.floor(sec / 86400);
    sec %= 86400;
    var hours = Math.floor(sec / 3600);
    sec %= 3600;
    var mins = Math.floor(sec / 60);
    var secs = sec % 60;
    return days + " 天 " + hours + " 小时 " + mins + " 分 " + secs + " 秒";
  }

  function siteStatsHtml(cfg) {
    var stats = cfg.stats || {};
    var bits = '<span class="site-stats">';
    if (parseStartAt(stats.startAt)) {
      bits += '<span>本站已运行 <span id="site-uptime">—</span></span>';
    }
    if (stats.busuanzi !== false) {
      bits +=
        '<span class="busuanzi-raw" aria-hidden="true">' +
        '<span id="busuanzi_container_site_pv"><span id="busuanzi_value_site_pv"></span></span>' +
        '<span id="busuanzi_container_site_uv"><span id="busuanzi_value_site_uv"></span></span>' +
        "</span>" +
        '<span>访问 <span id="site-pv-display">' +
        escapeHtml(String(statsDisplayBase(stats, "pvOffset", "pvPerHour"))) +
        "</span> 次</span>" +
        '<span>访客 <span id="site-uv-display">' +
        escapeHtml(String(statsDisplayBase(stats, "uvOffset", "uvPerHour"))) +
        "</span> 人</span>";
    }
    bits += "</span>";
    return bits;
  }

  var uptimeTimer = 0;

  function startUptime(cfg) {
    var el = $("#site-uptime");
    var start = parseStartAt(cfg.stats && cfg.stats.startAt);
    if (!el || !start) return;
    if (uptimeTimer) clearInterval(uptimeTimer);
    function tick() {
      el.textContent = formatUptime(start);
    }
    tick();
    uptimeTimer = setInterval(tick, 1000);
  }

  function loadBusuanzi(cfg) {
    var stats = cfg.stats || {};
    if (stats.busuanzi === false) return;
    if ($("#busuanzi-script")) return;
    var s = document.createElement("script");
    s.id = "busuanzi-script";
    s.async = true;
    s.src =
      stats.script ||
      "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    document.body.appendChild(s);
  }

  function bindBusuanziOffset(cfg) {
    var stats = cfg.stats || {};
    if (stats.busuanzi === false) return;

    function readCount(id) {
      var el = document.getElementById(id);
      if (!el) return null;
      var n = parseInt(String(el.textContent).replace(/[^\d]/g, ""), 10);
      return isNaN(n) ? null : n;
    }

    function paint() {
      var pv = readCount("busuanzi_value_site_pv");
      var uv = readCount("busuanzi_value_site_uv");
      var pvEl = $("#site-pv-display");
      var uvEl = $("#site-uv-display");
      var fakePv = statsDisplayBase(stats, "pvOffset", "pvPerHour");
      var fakeUv = statsDisplayBase(stats, "uvOffset", "uvPerHour");
      if (pvEl) pvEl.textContent = String((pv == null ? 0 : pv) + fakePv);
      if (uvEl) uvEl.textContent = String((uv == null ? 0 : uv) + fakeUv);
      var hourPv = statsFakeExtra(stats, "pvPerHour");
      var hourUv = statsFakeExtra(stats, "uvPerHour");
      var hp = $("#nbsz-hour-pv");
      var hu = $("#nbsz-hour-uv");
      var ap = $("#nbsz-add-pv");
      var au = $("#nbsz-add-uv");
      if (hp) hp.textContent = String(hourPv);
      if (hu) hu.textContent = String(hourUv);
      if (ap) ap.textContent = String(fakePv);
      if (au) au.textContent = String(fakeUv);
      return pv != null && uv != null;
    }

    paint();
    var srcPv = document.getElementById("busuanzi_value_site_pv");
    var srcUv = document.getElementById("busuanzi_value_site_uv");
    if (window.MutationObserver && srcPv && srcUv) {
      var obs = new MutationObserver(paint);
      obs.observe(srcPv, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      obs.observe(srcUv, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      paint();
      if (tries > 40) clearInterval(timer);
    }, 250);
    setInterval(paint, 60000);
  }

  function renderNbsz(cfg) {
    var stats = cfg.stats || {};
    var fakePv = statsDisplayBase(stats, "pvOffset", "pvPerHour");
    var fakeUv = statsDisplayBase(stats, "uvOffset", "uvPerHour");
    var hourPv = statsFakeExtra(stats, "pvPerHour");
    var hourUv = statsFakeExtra(stats, "uvPerHour");
    var basePv = Math.floor(statsNumber(stats, "pvOffset"));
    var baseUv = Math.floor(statsNumber(stats, "uvOffset"));
    var hours = statsHoursSinceStart(stats);
    $("#main").innerHTML =
      '<div class="nbsz-box">' +
      '<p class="nbsz-kicker">不蒜子对照</p>' +
      "<h1>访问数据</h1>" +
      '<div class="nbsz-grid nbsz-grid-3">' +
      "<section><h2>真实</h2>" +
      '<div class="nbsz-metric"><span class="nbsz-label">访问</span><span class="nbsz-num" id="busuanzi_container_site_pv"><span id="busuanzi_value_site_pv">…</span></span></div>' +
      '<div class="nbsz-metric"><span class="nbsz-label">访客</span><span class="nbsz-num" id="busuanzi_container_site_uv"><span id="busuanzi_value_site_uv">…</span></span></div></section>' +
      "<section><h2>当前已加</h2>" +
      '<div class="nbsz-metric"><span class="nbsz-label">访问</span><span class="nbsz-num" id="nbsz-add-pv">' +
      escapeHtml(String(fakePv)) +
      "</span></div>" +
      '<div class="nbsz-metric"><span class="nbsz-label">访客</span><span class="nbsz-num" id="nbsz-add-uv">' +
      escapeHtml(String(fakeUv)) +
      "</span></div>" +
      '<p class="nbsz-break">基数 ' +
      escapeHtml(String(basePv)) +
      " / " +
      escapeHtml(String(baseUv)) +
      "</p>" +
      '<p class="nbsz-break">按小时 +<span id="nbsz-hour-pv">' +
      escapeHtml(String(hourPv)) +
      '</span> / +<span id="nbsz-hour-uv">' +
      escapeHtml(String(hourUv)) +
      "</span></p></section>" +
      "<section><h2>前台显示</h2>" +
      '<div class="nbsz-metric"><span class="nbsz-label">访问</span><span class="nbsz-num" id="site-pv-display">' +
      escapeHtml(String(fakePv)) +
      "</span></div>" +
      '<div class="nbsz-metric"><span class="nbsz-label">访客</span><span class="nbsz-num" id="site-uv-display">' +
      escapeHtml(String(fakeUv)) +
      "</span></div></section>" +
      "</div>" +
      '<p class="nbsz-meta">已加 = 基数 + 按小时累加<br>前台显示 = 真实 + 已加<br>每小时访问 +' +
      escapeHtml(String(stats.pvPerHour || 0)) +
      "、访客 +" +
      escapeHtml(String(stats.uvPerHour || 0)) +
      " · 已过 " +
      escapeHtml(hours.toFixed(1)) +
      " 小时</p>" +
      '<p class="nbsz-meta">打开本页会计入不蒜子一次真实访问</p></div>';
  }

  function telHref(c, fallback) {
    if (c.phoneHref && c.phoneHref !== "tel:") return c.phoneHref;
    var digits = String(c.phone || "").replace(/\D/g, "");
    return digits ? "tel:" + digits : fallback || "contact.html";
  }

  function renderMobileBar(cfg) {
    var c = cfg.contact;
    $("#mobile-bar").innerHTML =
      '<a href="' +
      telHref(c) +
      '">电话咨询</a>' +
      '<a href="#" data-wechat>微信联系</a>';
  }

  function watermarkLabel() {
    var site = state.config && state.config.site;
    return escapeHtml((site && site.watermark) || "盗图必究");
  }

  function watermarkBadge() {
    var site = state.config && state.config.site;
    if (site && site.watermarkEnabled === false) return "";
    return '<span class="wm">' + watermarkLabel() + "</span>";
  }

  function formatUploadDate(iso) {
    if (!iso) return "";
    var p = String(iso).split("-");
    if (p.length < 3) return iso;
    return Number(p[0]) + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
  }

  function originalMeta(p) {
    var day = formatUploadDate(p.updatedAt);
    if (day) return "原创图文 · " + day + " 上传";
    return "原创图文";
  }

  function productCard(p) {
    return (
      '<article class="product-card" data-id="' +
      escapeHtml(p.id) +
      '" data-category="' +
      escapeHtml(p.category) +
      '">' +
      '<div class="thumb img-protect"><img src="' +
      escapeHtml(p.images[0]) +
      '" alt="' +
      escapeHtml(p.name) +
      '" loading="lazy">' +
      watermarkBadge() +
      "</div>" +
      '<div class="body"><h3>' +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="origin-note">' +
      escapeHtml(originalMeta(p)) +
      "</p>" +
      '<p class="muted">' +
      escapeHtml(p.desc) +
      "</p>" +
      '<div class="product-meta">' +
      p.woods
        .map(function (w) {
          return '<span class="tag">' + escapeHtml(w) + "</span>";
        })
        .join("") +
      "</div>" +
      '<p class="muted">尺寸 ' +
      escapeHtml(p.size) +
      " · 周期 " +
      escapeHtml(p.cycle) +
      "</p>" +
      "</div></article>"
    );
  }

  function bindProductCards(cfg) {
    $all(".product-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var id = card.getAttribute("data-id");
        var p = cfg.products.filter(function (x) {
          return x.id === id;
        })[0];
        if (p) openProduct(p);
      });
    });
  }

  function openProduct(p) {
    var images = p.images
      .map(function (src) {
        return (
          '<div class="detail-shot img-protect">' +
          '<img src="' +
          escapeHtml(src) +
          '" alt="' +
          escapeHtml(p.name) +
          '" data-full="' +
          escapeHtml(src) +
          '">' +
          watermarkBadge() +
          "</div>"
        );
      })
      .join("");
    openPanel(
      "<h2>" +
        escapeHtml(p.name) +
        "</h2>" +
        '<p class="origin-note">' +
        escapeHtml(originalMeta(p)) +
        "</p>" +
        '<div class="detail-images">' +
        images +
        "</div>" +
        "<p>" +
        escapeHtml(p.desc) +
        "</p>" +
        "<p>适用木材：" +
        escapeHtml(p.woods.join("、")) +
        "</p>" +
        "<p>尺寸范围：" +
        escapeHtml(p.size) +
        "</p>" +
        "<p>定制周期：" +
        escapeHtml(p.cycle) +
        "</p>" +
        '<p><a class="btn" href="contact.html">咨询这件定制</a></p>',
    );
    var gallery = p.images.map(function (src) {
      return { src: src, alt: p.name };
    });
    $all(".detail-images img").forEach(function (img, i) {
      img.addEventListener("click", function (e) {
        e.stopPropagation();
        openLightbox(gallery, i);
      });
    });
  }

  function renderHome(cfg) {
    var homeLimit = 3;
    var featured = cfg.products
      .filter(function (p) {
        return p.featured;
      })
      .slice(0, homeLimit);
    var highlights = cfg.highlights
      .map(function (h) {
        return (
          '<article class="hl-card">' +
          (ICONS[h.icon] || "") +
          "<h3>" +
          escapeHtml(h.title) +
          "</h3><p>" +
          escapeHtml(h.desc) +
          "</p></article>"
        );
      })
      .join("");

    $("#main").innerHTML =
      '<section class="hero"><div class="hero-bg" style="background-image:linear-gradient(180deg,rgba(44,24,16,.32),rgba(44,24,16,.64)),url(\'' +
      escapeHtml(cfg.hero.bgImage) +
      "')\"></div>" +
      '<div class="wrap hero-inner"><p class="eyebrow">' +
      escapeHtml(cfg.site.name) +
      "</p>" +
      "<h1>" +
      escapeHtml(cfg.hero.title) +
      "</h1>" +
      '<p class="lead">' +
      escapeHtml(cfg.hero.subtitle) +
      "</p>" +
      '<a class="btn" href="' +
      escapeHtml(cfg.hero.ctaLink) +
      '">' +
      escapeHtml(cfg.hero.ctaText) +
      "</a>" +
      "</div></section>" +
      '<section class="section"><div class="wrap"><div class="highlights">' +
      highlights +
      "</div></div></section>" +
      '<section class="section section-alt"><div class="wrap">' +
      '<div class="section-head"><p class="eyebrow">PRODUCTS</p><h2>' +
      escapeHtml(cfg.homeProducts.title) +
      "</h2>" +
      "<p>" +
      escapeHtml(cfg.homeProducts.subtitle) +
      "</p>" +
      (cfg.homeProducts.originalNote
        ? '<p class="origin-note page-origin">' +
          escapeHtml(cfg.homeProducts.originalNote) +
          "</p>"
        : "") +
      "</div>" +
      '<div class="product-grid">' +
      featured.map(productCard).join("") +
      "</div>" +
      '<p style="text-align:center;margin-top:36px"><a class="btn btn-line" href="products.html">查看全部产品</a></p>' +
      "</div></section>" +
      '<section class="section"><div class="wrap compare-teaser">' +
      '<div class="section-head"><p class="eyebrow">COMPARE</p><h2>' +
      escapeHtml(
        (cfg.comparePage && cfg.comparePage.title) || "和网上大牌比一比",
      ) +
      "</h2><p>" +
      escapeHtml((cfg.comparePage && cfg.comparePage.subtitle) || "") +
      "</p></div>" +
      "<p>" +
      escapeHtml((cfg.comparePage && cfg.comparePage.lead) || "") +
      "</p>" +
      '<p style="margin-top:24px"><a class="btn" href="compare.html">看完整对照</a></p>' +
      "</div></section>" +
      '<section class="section cta-band"><div class="wrap">' +
      "<h2>" +
      escapeHtml(cfg.homeCta.title) +
      "</h2>" +
      "<p>" +
      escapeHtml(cfg.homeCta.subtitle) +
      "</p>" +
      '<a class="btn" href="' +
      escapeHtml(cfg.homeCta.link) +
      '">' +
      escapeHtml(cfg.homeCta.button) +
      "</a>" +
      "</div></section>";

    bindProductCards(cfg);
  }

  function renderAbout(cfg) {
    var a = cfg.about;
    var story = a.story
      .map(function (p) {
        return "<p>" + escapeHtml(p) + "</p>";
      })
      .join("");
    var timeline = a.timeline
      .map(function (t) {
        return (
          '<li><div class="year">' +
          escapeHtml(t.year) +
          "</div><div>" +
          escapeHtml(t.event) +
          "</div></li>"
        );
      })
      .join("");
    var ph = a.philosophy.paragraphs
      .map(function (p) {
        return "<p>" + escapeHtml(p) + "</p>";
      })
      .join("");

    var co = companyOf(cfg);
    var rows = "";
    if (co.legalName) {
      rows +=
        '<li><span class="label">名称</span>' +
        escapeHtml(co.legalName) +
        "</li>";
    }
    if (co.creditCode) {
      rows +=
        '<li><span class="label">统一社会信用代码</span>' +
        escapeHtml(co.creditCode) +
        "</li>";
    }
    if (co.operator) {
      rows +=
        '<li><span class="label">经营者</span>' +
        escapeHtml(co.operator) +
        "</li>";
    }
    rows +=
      '<li><span class="label">地址</span>' +
      escapeHtml(cfg.contact.address) +
      "</li>";

    var license = "";
    if (co.licenseImage) {
      license =
        '<figure class="license-card" data-full="' +
        escapeHtml(co.licenseImage) +
        '">' +
        '<img src="' +
        escapeHtml(co.licenseImage) +
        '" alt="' +
        escapeHtml(co.licenseCaption || "营业执照") +
        '">' +
        "<figcaption>点击查看大图 · " +
        escapeHtml(co.licenseCaption || "营业执照") +
        "</figcaption></figure>";
    }

    $("#main").innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">ABOUT</p>' +
      "<h1>" +
      escapeHtml(a.pageTitle) +
      '</h1><p class="muted">' +
      escapeHtml(a.pageSubtitle) +
      "</p>" +
      (a.originalNote
        ? '<p class="origin-note page-origin">' +
          escapeHtml(a.originalNote) +
          "</p>"
        : "") +
      "</div></section>" +
      '<section class="section"><div class="wrap story-grid">' +
      '<div class="story-quote">' +
      escapeHtml(a.intro) +
      "</div>" +
      "<div>" +
      story +
      "</div></div></section>" +
      '<section class="section section-alt"><div class="wrap">' +
      '<div class="section-head"><h2>走过的路</h2><p>' +
      escapeHtml(a.masterName) +
      " 的三十年</p></div>" +
      '<ol class="timeline">' +
      timeline +
      "</ol></div></section>" +
      '<section class="section philosophy"><div class="wrap">' +
      "<h2>" +
      escapeHtml(a.philosophy.title) +
      "</h2>" +
      ph +
      "</div></section>" +
      '<section class="section section-alt" id="license"><div class="wrap">' +
      '<div class="section-head"><h2>' +
      escapeHtml(co.licenseCaption || "营业执照") +
      "</h2>" +
      "<p>" +
      escapeHtml(co.pageSubtitle || "依法经营，证照可查") +
      "</p></div>" +
      '<div class="legal-grid">' +
      '<div class="contact-card"><ul class="contact-list">' +
      rows +
      "</ul>" +
      (co.note ? '<p class="muted">' + escapeHtml(co.note) + "</p>" : "") +
      "</div>" +
      license +
      "</div></div></section>";

    var fig = $(".license-card");
    if (fig) {
      fig.addEventListener("click", function () {
        openLightbox(
          [
            {
              src: fig.getAttribute("data-full"),
              alt: co.licenseCaption || "营业执照",
            },
          ],
          0,
        );
      });
    }
    if (location.hash === "#license") {
      var block = $("#license");
      if (block) block.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderProducts(cfg) {
    var filters =
      '<button class="filter-btn is-active" type="button" data-filter="all">全部</button>' +
      cfg.productCategories
        .map(function (c) {
          return (
            '<button class="filter-btn" type="button" data-filter="' +
            escapeHtml(c.id) +
            '">' +
            escapeHtml(c.name) +
            "</button>"
          );
        })
        .join("");
    var intros = cfg.productCategories
      .map(function (c) {
        return (
          '<p class="cat-intro" data-cat="' +
          escapeHtml(c.id) +
          '" hidden>' +
          escapeHtml(c.desc) +
          "</p>"
        );
      })
      .join("");

    $("#main").innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">PRODUCTS</p>' +
      "<h1>" +
      escapeHtml(cfg.productsPage.title) +
      "</h1>" +
      '<p class="muted">' +
      escapeHtml(cfg.productsPage.subtitle) +
      "</p>" +
      (cfg.productsPage.originalNote
        ? '<p class="origin-note page-origin">' +
          escapeHtml(cfg.productsPage.originalNote) +
          "</p>"
        : "") +
      "</div></section>" +
      '<section class="section"><div class="wrap">' +
      '<div class="filters">' +
      filters +
      "</div>" +
      '<p class="cat-intro" data-cat="all">' +
      escapeHtml(cfg.productsPage.subtitle) +
      "</p>" +
      intros +
      '<div class="product-grid">' +
      cfg.products.map(productCard).join("") +
      "</div>" +
      "</div></section>";

    bindProductCards(cfg);
    $all(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-filter");
        $all(".filter-btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        $all(".cat-intro").forEach(function (el) {
          el.hidden = el.getAttribute("data-cat") !== key;
        });
        $all(".product-card").forEach(function (card) {
          card.style.display =
            key === "all" || card.getAttribute("data-category") === key
              ? ""
              : "none";
        });
      });
    });
  }

  function renderCustom(cfg) {
    var steps = cfg.customProcess
      .map(function (s) {
        return (
          '<article class="process-step"><span class="process-num">0' +
          s.step +
          "</span>" +
          "<h3>" +
          escapeHtml(s.title) +
          '</h3><p class="muted">' +
          escapeHtml(s.desc) +
          "</p></article>"
        );
      })
      .join("");

    var rows = cfg.woods
      .map(function (w) {
        var thumb = w.image
          ? '<img class="wood-thumb" src="' +
            escapeHtml(w.image) +
            '" alt="' +
            escapeHtml(w.name) +
            '">'
          : "";
        return (
          '<tr><td class="wood-name">' +
          thumb +
          "<span>" +
          escapeHtml(w.name) +
          "</span></td><td>" +
          escapeHtml(w.trait) +
          "</td><td>" +
          escapeHtml(w.color) +
          "</td><td>" +
          escapeHtml(w.hardness) +
          "</td><td>" +
          escapeHtml(w.price) +
          "</td><td>" +
          escapeHtml(w.scene) +
          "</td></tr>"
        );
      })
      .join("");

    var cards = cfg.woods
      .map(function (w) {
        var thumb = w.image
          ? '<img class="wood-thumb" src="' +
            escapeHtml(w.image) +
            '" alt="' +
            escapeHtml(w.name) +
            '">'
          : "";
        return (
          '<article class="wood-card">' +
          thumb +
          "<h3>" +
          escapeHtml(w.name) +
          "</h3><dl>" +
          "<dt>特点</dt><dd>" +
          escapeHtml(w.trait) +
          "</dd>" +
          "<dt>颜色</dt><dd>" +
          escapeHtml(w.color) +
          "</dd>" +
          "<dt>硬度</dt><dd>" +
          escapeHtml(w.hardness) +
          "</dd>" +
          "<dt>价格</dt><dd>" +
          escapeHtml(w.price) +
          "</dd>" +
          "<dt>适合</dt><dd>" +
          escapeHtml(w.scene) +
          "</dd></dl></article>"
        );
      })
      .join("");

    var faq = cfg.faq
      .map(function (item, i) {
        return (
          '<div class="faq-item' +
          (i === 0 ? " is-open" : "") +
          '">' +
          '<button type="button">' +
          escapeHtml(item.q) +
          '<span class="mark">+</span></button>' +
          '<div class="a">' +
          escapeHtml(item.a) +
          "</div></div>"
        );
      })
      .join("");

    $("#main").innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">CUSTOM</p>' +
      "<h1>" +
      escapeHtml(cfg.customPage.title) +
      "</h1>" +
      '<p class="muted">' +
      escapeHtml(cfg.customPage.subtitle) +
      "</p></div></section>" +
      '<section class="section"><div class="wrap">' +
      '<div class="section-head"><h2>定制流程</h2><p>五步把想法做成家具</p></div>' +
      '<div class="process">' +
      steps +
      "</div></div></section>" +
      '<section class="section section-alt"><div class="wrap">' +
      '<div class="section-head"><h2>木材对比</h2><p>不选最贵的，选最合适的</p></div>' +
      '<div class="table-wrap"><table class="woods"><thead><tr>' +
      "<th>木材</th><th>特点</th><th>颜色</th><th>硬度</th><th>价格区间</th><th>适合场景</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>" +
      '<div class="wood-cards">' +
      cards +
      "</div>" +
      '<p class="woods-note">' +
      escapeHtml(cfg.woodsNote) +
      "</p></div></section>" +
      '<section class="section"><div class="wrap">' +
      '<div class="section-head"><h2>常见问题</h2></div>' +
      '<div class="faq">' +
      faq +
      "</div></div></section>";

    $all(".faq-item button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.parentNode;
        var open = item.classList.contains("is-open");
        $all(".faq-item").forEach(function (el) {
          el.classList.remove("is-open");
        });
        if (!open) item.classList.add("is-open");
      });
    });
  }

  function renderCompare(cfg) {
    var page = cfg.comparePage || {};
    var rows = (page.rows || [])
      .map(function (r) {
        return (
          "<tr><th>" +
          escapeHtml(r.item) +
          "</th><td>" +
          escapeHtml(r.us) +
          "</td><td>" +
          escapeHtml(r.them) +
          "</td></tr>"
        );
      })
      .join("");
    var cards = (page.rows || [])
      .map(function (r) {
        return (
          '<article class="compare-card"><h3>' +
          escapeHtml(r.item) +
          "</h3>" +
          "<p><strong>头木</strong>" +
          escapeHtml(r.us) +
          "</p>" +
          "<p><strong>连锁实木品牌</strong>" +
          escapeHtml(r.them) +
          "</p></article>"
        );
      })
      .join("");
    var pros = (page.pros || [])
      .map(function (x) {
        return (
          "<article><h3>" +
          escapeHtml(x.title) +
          "</h3><p>" +
          escapeHtml(x.desc) +
          "</p></article>"
        );
      })
      .join("");
    var cons = (page.cons || [])
      .map(function (x) {
        return (
          "<article><h3>" +
          escapeHtml(x.title) +
          "</h3><p>" +
          escapeHtml(x.desc) +
          "</p></article>"
        );
      })
      .join("");

    $("#main").innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">COMPARE</p>' +
      "<h1>" +
      escapeHtml(page.title || "对照") +
      "</h1>" +
      '<p class="muted">' +
      escapeHtml(page.subtitle || "") +
      "</p></div></section>" +
      '<section class="section"><div class="wrap">' +
      '<p class="compare-lead">' +
      escapeHtml(page.lead || "") +
      "</p>" +
      '<div class="table-wrap"><table class="compare-table"><thead><tr>' +
      "<th>比什么</th><th>头木木业</th><th>源氏木语等连锁实木</th></tr></thead><tbody>" +
      rows +
      "</tbody></table></div>" +
      '<div class="compare-cards">' +
      cards +
      "</div>" +
      '<p class="woods-note">' +
      escapeHtml(page.note || "") +
      "</p></div></section>" +
      '<section class="section section-alt"><div class="wrap compare-split">' +
      "<div><h2>" +
      escapeHtml(page.prosTitle || "") +
      '</h2><div class="compare-points">' +
      pros +
      "</div></div>" +
      "<div><h2>" +
      escapeHtml(page.consTitle || "") +
      '</h2><div class="compare-points">' +
      cons +
      "</div></div></div></section>" +
      '<section class="section cta-band"><div class="wrap">' +
      "<h2>" +
      escapeHtml(page.ctaTitle || "") +
      "</h2>" +
      "<p>" +
      escapeHtml(page.ctaText || "") +
      "</p>" +
      '<a class="btn" href="' +
      escapeHtml(page.ctaLink || "contact.html") +
      '">' +
      escapeHtml(page.ctaButton || "联系我们") +
      "</a></div></section>";
  }

  function renderWorkshop(cfg) {
    var filters =
      '<button class="filter-btn is-active" type="button" data-filter="all">全部</button>' +
      cfg.galleryCategories
        .map(function (c) {
          return (
            '<button class="filter-btn" type="button" data-filter="' +
            escapeHtml(c.id) +
            '">' +
            escapeHtml(c.name) +
            "</button>"
          );
        })
        .join("");

    var items = cfg.gallery
      .map(function (g) {
        return (
          '<figure class="gallery-item" data-category="' +
          escapeHtml(g.category) +
          '" data-full="' +
          escapeHtml(g.src) +
          '">' +
          '<div class="shot img-protect"><img src="' +
          escapeHtml(g.src) +
          '" alt="' +
          escapeHtml(g.alt) +
          '" loading="lazy">' +
          watermarkBadge() +
          "</div>" +
          "<figcaption>" +
          escapeHtml(g.caption) +
          "</figcaption></figure>"
        );
      })
      .join("");

    $("#main").innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">WORKSHOP</p>' +
      "<h1>" +
      escapeHtml(cfg.workshopPage.title) +
      "</h1>" +
      '<p class="muted">' +
      escapeHtml(cfg.workshopPage.subtitle) +
      "</p>" +
      (cfg.workshopPage.originalNote
        ? '<p class="origin-note page-origin">' +
          escapeHtml(cfg.workshopPage.originalNote) +
          "</p>"
        : "") +
      "</div></section>" +
      '<section class="section"><div class="wrap">' +
      '<div class="filters">' +
      filters +
      "</div>" +
      '<div class="gallery">' +
      items +
      "</div></div></section>" +
      '<section class="section cta-band"><div class="wrap"><p>' +
      escapeHtml(cfg.workshopPage.closing) +
      "</p>" +
      '<a class="btn" href="contact.html">联系定制</a></div></section>';

    $all(".gallery-item").forEach(function (fig) {
      fig.addEventListener("click", function () {
        openLightbox(
          [{ src: fig.getAttribute("data-full"), alt: $("img", fig).alt }],
          0,
        );
      });
    });

    $all(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-filter");
        $all(".filter-btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        $all(".gallery-item").forEach(function (item) {
          item.style.display =
            key === "all" || item.getAttribute("data-category") === key
              ? ""
              : "none";
        });
      });
    });
  }

  function renderContact(cfg) {
    var main = $("#main");
    if (main && main.getAttribute("data-static") !== null) return;

    var c = cfg.contact;
    var tel = telHref(c, "#");

    main.innerHTML =
      '<section class="page-hero"><div class="wrap"><p class="eyebrow">CONTACT</p>' +
      "<h1>" +
      escapeHtml(c.pageTitle) +
      "</h1>" +
      '<p class="muted">' +
      escapeHtml(c.pageSubtitle) +
      "</p></div></section>" +
      '<section class="section"><div class="wrap contact-grid">' +
      '<div class="contact-card"><ul class="contact-list">' +
      '<li><span class="label">电话</span><a class="contact-phone" href="' +
      escapeHtml(tel) +
      '">' +
      escapeHtml(c.phone) +
      "</a></li>" +
      '<li><span class="label">微信</span>' +
      escapeHtml(c.wechat) +
      "</li>" +
      '<li><span class="label">地址</span>' +
      escapeHtml(c.address) +
      "</li>" +
      '<li><span class="label">工作时间</span>' +
      escapeHtml(c.hours) +
      "</li>" +
      '</ul><p class="muted">来之前最好先打个电话或发微信，避免空跑。</p>' +
      '<p class="contact-actions"><a class="btn" href="' +
      escapeHtml(tel) +
      '">拨打电话</a></p></div>' +
      '<div class="contact-card wechat-side">' +
      '<span class="label">微信二维码</span>' +
      '<img src="' +
      escapeHtml(c.wechatQr) +
      '" alt="微信二维码">' +
      "<p>" +
      escapeHtml(c.wechat) +
      "</p>" +
      '<p class="muted">添加时请备注「家具定制」</p></div></div>' +
      '<p class="closing">' +
      escapeHtml(c.closing) +
      "</p></section>";
  }

  function ensureOverlay() {
    var el = $("#overlay");
    if (el) return el;
    el = document.createElement("div");
    el.id = "overlay";
    el.className = "overlay";
    el.innerHTML =
      '<button class="close" type="button" aria-label="关闭">×</button><div class="overlay-body"></div>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el) closeOverlay();
    });
    $(".close", el).addEventListener("click", closeOverlay);
    return el;
  }

  var lightbox = { items: [], index: 0 };

  function ensureLightbox() {
    var el = $("#lightbox");
    if (el) return el;
    el = document.createElement("div");
    el.id = "lightbox";
    el.className = "lightbox";
    el.innerHTML =
      '<button class="close" type="button" aria-label="关闭">×</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="上一张">‹</button>' +
      '<button class="lb-nav lb-next" type="button" aria-label="下一张">›</button>' +
      '<div class="lightbox-body"></div>' +
      '<p class="lightbox-count"></p>';
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target === el || e.target.classList.contains("lightbox-body"))
        closeLightbox();
    });
    $(".close", el).addEventListener("click", function (e) {
      e.stopPropagation();
      closeLightbox();
    });
    $(".lb-prev", el).addEventListener("click", function (e) {
      e.stopPropagation();
      stepLightbox(-1);
    });
    $(".lb-next", el).addEventListener("click", function (e) {
      e.stopPropagation();
      stepLightbox(1);
    });
    return el;
  }

  function isLightboxOpen() {
    var el = $("#lightbox");
    return !!(el && el.classList.contains("is-open"));
  }

  function renderLightbox() {
    var el = ensureLightbox();
    var items = lightbox.items;
    var item = items[lightbox.index] || { src: "", alt: "" };
    $(".lightbox-body", el).innerHTML =
      '<div class="img-protect">' +
      '<img src="' +
      escapeHtml(item.src) +
      '" alt="' +
      escapeHtml(item.alt || "") +
      '">' +
      watermarkBadge() +
      "</div>";
    $(".lightbox-count", el).textContent =
      items.length > 1 ? lightbox.index + 1 + " / " + items.length : "";
    el.classList.toggle("has-nav", items.length > 1);
    el.classList.add("is-open");
  }

  function openLightbox(items, index) {
    lightbox.items = items || [];
    lightbox.index = index || 0;
    renderLightbox();
  }

  function stepLightbox(dir) {
    var n = lightbox.items.length;
    if (n < 2) return;
    lightbox.index = (lightbox.index + dir + n) % n;
    renderLightbox();
  }

  function closeLightbox() {
    var el = $("#lightbox");
    if (el) el.classList.remove("is-open");
  }

  function openPanel(html) {
    var el = ensureOverlay();
    $(".overlay-body", el).innerHTML = '<div class="panel">' + html + "</div>";
    el.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    var el = $("#overlay");
    if (!el) return;
    el.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function bindMenuToggle() {
    var toggle = $(".menu-toggle");
    if (!toggle || toggle.getAttribute("data-bound")) return;
    toggle.setAttribute("data-bound", "1");
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function bindChrome() {
    bindMenuToggle();

    if (document.documentElement.getAttribute("data-chrome-bound")) return;
    document.documentElement.setAttribute("data-chrome-bound", "1");

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (isLightboxOpen()) closeLightbox();
        else closeOverlay();
        return;
      }
      if (!isLightboxOpen()) return;
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });

    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-wechat]") : null;
      if (!t) return;
      e.preventDefault();
      var c = (state.config && state.config.contact) || {
        wechat: "Valar_Morghulis426",
        wechatQr: "images/contact/wechat-qr.png",
      };
      openPanel(
        '<div class="wechat-box"><h2>微信联系</h2><p>' +
          escapeHtml(c.wechat) +
          "</p>" +
          '<img src="' +
          escapeHtml(c.wechatQr) +
          '" alt="微信二维码">' +
          '<p class="muted">添加时请备注「家具定制」</p></div>',
      );
    });
  }

  function applySeo(cfg) {
    var seoAll = cfg.seo || {};
    var pageSeo = seoAll[state.page] || {};
    var name = cfg.site.name;
    var title = pageSeo.title || name + " · " + (cfg.site.subtitle || "");
    var desc = pageSeo.description || cfg.site.description || "";
    var image = pageSeo.image || cfg.hero.bgImage || cfg.site.logo;
    var robots = pageSeo.robots || "index, follow";
    var keywords = cfg.site.keywords || "";
    var file = fileName();
    var absImage = absUrl(cfg, image);
    var pageUrl = absUrl(cfg, file === "index.html" ? "" : file);

    document.title = title;
    setMeta("name", "description", desc);
    setMeta("name", "keywords", keywords);
    setMeta("name", "author", name);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:locale", "zh_CN");
    setMeta("property", "og:site_name", name);
    setMeta("property", "og:image", absImage);
    setMeta("property", "og:url", pageUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", absImage);
    setLinkRel("canonical", pageUrl);

    if (state.page === "nbsz") return;

    var store = {
      "@context": "https://schema.org",
      "@type": "FurnitureStore",
      name: name,
      alternateName:
        cfg.company && cfg.company.legalName ? cfg.company.legalName : name,
      description: cfg.site.description,
      image: absUrl(cfg, cfg.site.logo),
      telephone: cfg.contact.phone,
      url: originBase(cfg),
      address: {
        "@type": "PostalAddress",
        streetAddress: cfg.contact.address,
        addressCountry: "CN",
      },
      openingHours: "Mo-Su 07:00-20:00",
      areaServed: "CN",
      makesOffer: {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "实木家具来图定制",
          description: cfg.customPage.subtitle,
        },
      },
    };
    setJsonLd("ld-business", store);

    if (state.page === "custom" && cfg.faq && cfg.faq.length) {
      setJsonLd("ld-faq", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: cfg.faq.map(function (item) {
          return {
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          };
        }),
      });
    }
  }

  function originBase(cfg) {
    var u = cfg.site && cfg.site.url ? String(cfg.site.url) : "";
    if (u) return u.replace(/\/$/, "");
    return location.origin;
  }

  function absUrl(cfg, path) {
    if (!path) return originBase(cfg) + "/";
    if (/^https?:\/\//.test(path)) return path;
    return originBase(cfg) + "/" + String(path).replace(/^\//, "");
  }

  function setMeta(attr, key, value) {
    if (value == null || value === "") return;
    var sel =
      attr === "property"
        ? 'meta[property="' + key + '"]'
        : 'meta[name="' + key + '"]';
    var el = $(sel);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function setLinkRel(rel, href) {
    if (!href) return;
    var el = $('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  function setJsonLd(id, data) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  var pages = {
    home: renderHome,
    about: renderAbout,
    products: renderProducts,
    custom: renderCustom,
    compare: renderCompare,
    workshop: renderWorkshop,
    contact: renderContact,
    nbsz: renderNbsz,
  };

  function configUrl() {
    var scripts = document.getElementsByTagName("script");
    var i;
    var src;
    for (i = 0; i < scripts.length; i++) {
      src = scripts[i].src || "";
      if (/js\/main\.js(\?|$)/.test(src)) {
        return src.replace(/js\/main\.js(\?.*)?$/, "config.json");
      }
    }
    return "config.json";
  }

  fetch(configUrl())
    .then(function (res) {
      if (!res.ok) throw new Error("config");
      return res.json();
    })
    .then(function (cfg) {
      state.config = cfg;
      applySeo(cfg);
      if (state.page === "nbsz") {
        document.body.classList.add("nbsz-only");
        renderNbsz(cfg);
        loadBusuanzi(cfg);
        bindBusuanziOffset(cfg);
        return;
      }
      renderHeader(cfg);
      renderFooter(cfg);
      renderMobileBar(cfg);
      if (pages[state.page]) pages[state.page](cfg);
      bindChrome();
    })
    .catch(function () {
      var main = $("#main");
      if (!(main && main.getAttribute("data-static") !== null)) {
        main.innerHTML =
          '<section class="section"><div class="wrap"><h1>页面加载失败</h1>' +
          "<p>请通过本地静态服务器打开网站（不要直接双击 HTML），确保 config.json 可访问。</p></div></section>";
      }
      bindChrome();
    });

  bindChrome();
})();
