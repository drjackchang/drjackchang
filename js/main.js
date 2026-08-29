(function () {
  "use strict";

  var UI = {
    zh: {
      navAbout: "關於", navResearch: "研究", navGrants: "計畫", navCourses: "課程", navPublications: "著作", navNews: "動態",
      sectionAbout: "關於我 About", sectionResearch: "重點研究與專案 Featured Projects",
      sectionGrants: "研究計畫與產學合作 Grants & Industry Collaboration",
      groupNstc: "科技部／國科會計畫", groupIndustry: "產學合作",
      sectionCourses: "教學課程 Courses",
      sectionPublications: "學術著作 Publications", sectionNews: "媒體與動態 News & Updates",
      showAll: "全部展開", showLess: "收合",
      tabAll: "全部", tabJournal: "期刊論文", tabConference: "研討會論文", tabBook: "專書與專章",
      orcidBadge: "ORCID 同步", footerNote: "內容以 JSON 資料檔維護，著作清單定期與 ORCID 同步。",
      visitSite: "前往網站 →", viewProject: "查看 →",
      langBtn: "EN"
    },
    en: {
      navAbout: "About", navResearch: "Research", navGrants: "Grants", navCourses: "Courses", navPublications: "Publications", navNews: "News",
      sectionAbout: "About", sectionResearch: "Featured Projects",
      sectionGrants: "Grants & Industry Collaboration",
      groupNstc: "NSTC Grants", groupIndustry: "Industry Collaboration",
      sectionCourses: "Courses",
      sectionPublications: "Publications", sectionNews: "News & Updates",
      showAll: "Show all", showLess: "Show less",
      tabAll: "All", tabJournal: "Journal Articles", tabConference: "Conference Papers", tabBook: "Books & Chapters",
      orcidBadge: "ORCID synced", footerNote: "Content is maintained via JSON data files; publications sync with ORCID on a schedule.",
      visitSite: "Visit site →", viewProject: "View →",
      langBtn: "中文"
    }
  };

  var state = {
    lang: localStorage.getItem("lang") || (navigator.language.indexOf("zh") === 0 ? "zh" : "en"),
    data: null,
    pubFilter: "all",
    pubExpanded: false
  };

  var PUB_PAGE_SIZE = 8;

  function pick(obj, field) {
    if (!obj) return "";
    var val = obj[field + "_" + state.lang];
    if (val) return val;
    var other = state.lang === "zh" ? "en" : "zh";
    return obj[field + "_" + other] || "";
  }

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function applyStaticStrings() {
    var strings = UI[state.lang];
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (strings[key]) node.textContent = strings[key];
    });
    document.getElementById("langToggle").textContent = strings.langBtn;
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  }

  function renderHero(site) {
    document.querySelector(".brand").textContent = pick(site, "name");
    document.getElementById("heroName").textContent = pick(site, "name");
    document.getElementById("heroTitle").textContent = pick(site, "title");
    document.getElementById("footerAffil").textContent = pick(site, "affiliation");

    var tags = state.lang === "zh" ? site.tags_zh : site.tags_en;
    var tagWrap = document.getElementById("heroTags");
    tagWrap.innerHTML = "";
    (tags || []).forEach(function (t) {
      tagWrap.appendChild(el("li", null, t));
    });

    var contact = site.contact || {};
    var contactWrap = document.getElementById("heroContact");
    contactWrap.innerHTML = "";
    var links = [];
    if (contact.email) links.push({ label: "Email", href: "mailto:" + contact.email });
    if (contact.orcid) links.push({ label: "ORCID", href: "https://orcid.org/" + contact.orcid });
    if (contact.researchgate) links.push({ label: "ResearchGate", href: contact.researchgate });
    if (contact.podcast) links.push({ label: "Podcast", href: contact.podcast });
    links.forEach(function (l) {
      var a = el("a", null, l.label);
      a.href = l.href;
      if (l.href.indexOf("http") === 0) a.target = "_blank";
      if (l.href.indexOf("http") === 0) a.rel = "noopener";
      var li = el("li");
      li.appendChild(a);
      contactWrap.appendChild(li);
    });
  }

  function renderAbout(site) {
    document.getElementById("aboutText").textContent = pick(site, "about");
  }

  function renderProjects(projects) {
    var strings = UI[state.lang];
    var grid = document.getElementById("projectGrid");
    grid.innerHTML = "";
    (projects || []).forEach(function (p) {
      var card = el("div", "card");
      card.appendChild(el("h3", null, pick(p, "title")));
      card.appendChild(el("p", null, pick(p, "desc")));
      if (p.url) {
        var a = el("a", "card-link", strings.viewProject);
        a.href = p.url;
        a.target = "_blank";
        a.rel = "noopener";
        card.appendChild(a);
      }
      grid.appendChild(card);
    });
  }

  function renderCourses(courses) {
    var strings = UI[state.lang];
    var grid = document.getElementById("courseGrid");
    grid.innerHTML = "";
    (courses || []).forEach(function (c) {
      var card = el("div", "card");
      card.appendChild(el("h3", null, pick(c, "title")));
      card.appendChild(el("p", null, pick(c, "desc")));
      if (c.url) {
        var a = el("a", "card-link", strings.visitSite);
        a.href = c.url;
        a.target = "_blank";
        a.rel = "noopener";
        card.appendChild(a);
      }
      grid.appendChild(card);
    });
  }

  function renderGrants(grants) {
    var nstcList = document.getElementById("nstcGrantList");
    var indList = document.getElementById("industryGrantList");
    nstcList.innerHTML = "";
    indList.innerHTML = "";
    (grants || []).forEach(function (g) {
      var li = el("li");
      li.appendChild(el("p", "pub-title", pick(g, "name")));
      var meta = el("p", "pub-meta");
      var metaText = g.number || "";
      if (g.type === "industry" && (g.partner_zh || g.partner_en)) {
        metaText += " · " + pick(g, "partner");
      }
      meta.appendChild(document.createTextNode(metaText));
      li.appendChild(meta);
      if (g.type === "nstc") {
        nstcList.appendChild(li);
      } else {
        indList.appendChild(li);
      }
    });
  }

  function renderPubTabs() {
    var strings = UI[state.lang];
    var tabs = [
      { id: "all", label: strings.tabAll },
      { id: "journal", label: strings.tabJournal },
      { id: "conference", label: strings.tabConference },
      { id: "book", label: strings.tabBook }
    ];
    var wrap = document.getElementById("pubTabs");
    wrap.innerHTML = "";
    tabs.forEach(function (t) {
      var btn = el("button", null, t.label);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(state.pubFilter === t.id));
      btn.addEventListener("click", function () {
        state.pubFilter = t.id;
        state.pubExpanded = false;
        renderPubTabs();
        renderPublications(state.data.publications);
      });
      wrap.appendChild(btn);
    });
  }

  function renderPublications(pubs) {
    var strings = UI[state.lang];
    var list = document.getElementById("pubList");
    list.innerHTML = "";

    var filtered = (pubs || []).filter(function (p) {
      return state.pubFilter === "all" || p.type === state.pubFilter;
    });
    filtered.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });

    var visible = state.pubExpanded ? filtered : filtered.slice(0, PUB_PAGE_SIZE);

    visible.forEach(function (p) {
      var li = el("li");
      li.appendChild(el("p", "pub-title", (p.authors ? p.authors + " — " : "") + pick(p, "title")));
      var meta = el("p", "pub-meta");
      var venueYear = [p.venue, p.year].filter(Boolean).join(" · ");
      meta.appendChild(document.createTextNode(venueYear));
      if (p.role_zh && state.lang === "zh") {
        meta.appendChild(el("span", "role-badge", p.role_zh));
      }
      if (p.source === "orcid-sync") {
        meta.appendChild(el("span", "badge", strings.orcidBadge));
      }
      if (p.doi) {
        var a = el("a", null, "DOI");
        a.href = "https://doi.org/" + p.doi;
        a.target = "_blank";
        a.rel = "noopener";
        a.style.marginLeft = "auto";
        meta.appendChild(a);
      }
      li.appendChild(meta);
      list.appendChild(li);
    });

    var showAllBtn = document.getElementById("pubShowAll");
    if (filtered.length <= PUB_PAGE_SIZE) {
      showAllBtn.style.display = "none";
    } else {
      showAllBtn.style.display = "";
      showAllBtn.textContent = state.pubExpanded ? strings.showLess : strings.showAll;
    }
  }

  function renderNews(news) {
    var wrap = document.getElementById("newsList");
    wrap.innerHTML = "";
    (news || []).forEach(function (n) {
      var item = el("div", "news-item");
      item.appendChild(el("span", "news-date", n.date || ""));
      item.appendChild(el("h3", null, pick(n, "title")));
      if (pick(n, "excerpt")) item.appendChild(el("p", null, pick(n, "excerpt")));
      if (n.url) {
        var a = el("a", null, state.lang === "zh" ? "閱讀全文 →" : "Read more →");
        a.href = n.url;
        a.target = "_blank";
        a.rel = "noopener";
        item.appendChild(a);
      }
      wrap.appendChild(item);
    });
  }

  function renderAll() {
    applyStaticStrings();
    if (!state.data) return;
    renderHero(state.data.site);
    renderAbout(state.data.site);
    renderProjects(state.data.projects);
    renderGrants(state.data.grants);
    renderCourses(state.data.courses);
    renderPubTabs();
    renderPublications(state.data.publications);
    renderNews(state.data.news);
  }

  function init() {
    document.getElementById("langToggle").addEventListener("click", function () {
      state.lang = state.lang === "zh" ? "en" : "zh";
      localStorage.setItem("lang", state.lang);
      renderAll();
    });

    document.getElementById("pubShowAll").addEventListener("click", function () {
      state.pubExpanded = !state.pubExpanded;
      renderPublications(state.data.publications);
    });

    Promise.all([
      fetch("data/site.json").then(function (r) { return r.json(); }),
      fetch("data/projects.json").then(function (r) { return r.json(); }),
      fetch("data/grants.json").then(function (r) { return r.json(); }),
      fetch("data/courses.json").then(function (r) { return r.json(); }),
      fetch("data/publications.json").then(function (r) { return r.json(); }),
      fetch("data/news.json").then(function (r) { return r.json(); })
    ]).then(function (results) {
      state.data = {
        site: results[0],
        projects: results[1],
        grants: results[2],
        courses: results[3],
        publications: results[4],
        news: results[5]
      };
      renderAll();
    }).catch(function (err) {
      console.error("內容載入失敗 / Failed to load content:", err);
      document.getElementById("aboutText").textContent =
        "內容載入失敗，請確認是透過網頁伺服器（例如 GitHub Pages）而非直接開啟檔案來瀏覽。";
    });
  }

  applyStaticStrings();
  document.addEventListener("DOMContentLoaded", init);
})();
