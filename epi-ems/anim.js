// 互動動畫：每個 mount(el) 在 el 裡建立 SVG 與控制項；顏色一律取自 CSS 變數，支援深淺色
(function () {
  const D = window.ANIM_DATA || {};
  const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches } catch { return false } })();
  const NS = "http://www.w3.org/2000/svg";
  const svg = (w, h, label) => `<svg viewBox="0 0 ${w} ${h}" class="anim-svg" role="img" aria-label="${label}">`;
  const fmt = (x, d = 3) => Number.isFinite(x) ? x.toFixed(d) : "—";
  const pct = (x, d = 1) => Number.isFinite(x) ? (x * 100).toFixed(d) + "%" : "—";
  const ctl = (html) => `<div class="anim-ctl">${html}</div>`;
  const out = (id) => `<div class="anim-out" id="${id}"></div>`;
  const uid = (() => { let i = 0; return p => p + "-" + (++i) })();
  function loop(step, ms) { if (reduce) { while (step() !== false); return { stop() {} } } const t = setInterval(() => { if (step() === false) clearInterval(t) }, ms); return { stop() { clearInterval(t) } } }

  const A = {};

  // 1. 盛行率浴缸模型
  A.prevalence = { title: "浴缸模型：盛行率 ≈ 發生率 × 病程", desc: "新個案像水龍頭流進浴缸（發生率），痊癒或死亡像排水孔流出（病程越短流越快）。浴缸裡的水量就是盛行個案。拉動兩個滑桿看水位變化。",
    mount(el) {
      const a = uid("pv");
      el.innerHTML = svg(560, 260, "浴缸模型") + `
        <rect x="40" y="20" width="16" height="70" fill="var(--accent)" opacity=".55"/><text x="66" y="40" class="lbl">新個案（發生率）</text>
        <path d="M120 90 L120 230 L440 230 L440 90" fill="none" stroke="var(--ink)" stroke-width="3"/>
        <rect id="${a}-w" x="122" y="230" width="316" height="0" fill="var(--accent)" opacity=".35"/>
        <rect x="440" y="214" width="70" height="14" fill="var(--muted)"/><text x="450" y="250" class="lbl">痊癒／死亡</text>
        <text id="${a}-t" x="280" y="80" text-anchor="middle" class="big">盛行個案</text></svg>` +
        ctl(`<label>發生率（每年每千人新個案）<input type="range" id="${a}-i" min="1" max="20" value="6"></label>
             <label>平均病程（年）<input type="range" id="${a}-d" min="1" max="10" value="4"></label>`) + out(a + "-o");
      const upd = () => {
        const i = +el.querySelector(`#${a}-i`).value, d = +el.querySelector(`#${a}-d`).value, p = i * d;
        const h = Math.min(135, p * 0.7); const w = el.querySelector(`#${a}-w`);
        w.setAttribute("y", 230 - h); w.setAttribute("height", h);
        el.querySelector(`#${a}-t`).textContent = `盛行約每千人 ${p} 人`;
        el.querySelector(`#${a}-o`).innerHTML = `發生率 ${i}／千人年 × 病程 ${d} 年 ≈ 盛行率 <b>${p}／千人</b>。病程變長（例如慢性倦怠、燒傷後遺症），即使新個案不變，盛行率也會上升。`;
      };
      el.querySelectorAll("input").forEach(x => x.addEventListener("input", upd)); upd();
    } };

  // 2. 人年
  A.persontime = { title: "人年怎麼算", desc: "6 位救護人員追蹤 5 年。橫條是每個人「仍有風險」被觀察的時間；✕ 是發生事件（心血管事件），○ 是中途離職失聯。按「播放」看人年如何累加。",
    mount(el) {
      const a = uid("pt");
      const P = [{ s: 0, e: 5, ev: 0 }, { s: 0, e: 2.5, ev: 1 }, { s: 1, e: 5, ev: 0 }, { s: 0, e: 3.5, ev: 0 }, { s: 2, e: 4, ev: 1 }, { s: 0, e: 1.5, ev: 1 }];
      const X = t => 90 + t * 88;
      let rows = P.map((p, i) => `<text x="10" y="${48 + i * 34}" class="lbl">人員 ${i + 1}</text>
        <rect id="${a}-b${i}" x="${X(p.s)}" y="${34 + i * 34}" width="0" height="18" rx="3" fill="var(--accent)" opacity=".75"/>
        <text id="${a}-m${i}" x="${X(p.e) + 6}" y="${48 + i * 34}" class="mk" opacity="0">${p.ev ? "✕" : (p.e < 5 ? "○" : "")}</text>`).join("");
      let ticks = [0, 1, 2, 3, 4, 5].map(t => `<line x1="${X(t)}" y1="26" x2="${X(t)}" y2="240" stroke="var(--line)"/><text x="${X(t)}" y="258" text-anchor="middle" class="lbl">第 ${t} 年</text>`).join("");
      el.innerHTML = svg(560, 270, "人年時間軸") + ticks + rows + `</svg>` + ctl(`<button id="${a}-p" class="anim-btn">播放</button><button id="${a}-r" class="anim-btn ghost">重來</button>`) + out(a + "-o");
      const o = el.querySelector(`#${a}-o`); let run = null;
      const show = (t) => {
        let py = 0, ev = 0;
        P.forEach((p, i) => { const end = Math.min(p.e, Math.max(p.s, t)); py += Math.max(0, end - p.s);
          el.querySelector(`#${a}-b${i}`).setAttribute("width", Math.max(0, (end - p.s) * 88));
          const done = t >= p.e; el.querySelector(`#${a}-m${i}`).setAttribute("opacity", done ? 1 : 0); if (done && p.ev) ev++; });
        o.innerHTML = `時間：第 ${t.toFixed(1)} 年　累積 <b>${py.toFixed(1)} 人年</b>，事件 <b>${ev}</b> 件　→ 發生密度 = ${ev} ÷ ${py.toFixed(1)} = <b>${py ? (ev / py).toFixed(3) : "—"} 每人年</b>` +
          (t >= 5 ? `<br>注意：人員 3 與人員 5 是中途才加入，只從加入時開始計算人年；人員 4 離職後不再計入。` : "");
      };
      const play = () => { if (run) run.stop(); let t = 0; run = loop(() => { t = Math.min(5, t + 0.1); show(t); return t < 5 }, 60) };
      el.querySelector(`#${a}-p`).addEventListener("click", play);
      el.querySelector(`#${a}-r`).addEventListener("click", () => { if (run) run.stop(); show(0) });
      show(reduce ? 5 : 0);
    } };

  // 3. 年齡標準化
  A.standardize = { title: "為什麼要年齡標準化", desc: "甲區（山區）與乙區（新市鎮）每個年齡層的 OHCA 發生率完全相同，只是甲區老人多。切換「粗率」與「標準化」，看兩區的差距如何消失。",
    mount(el) {
      const a = uid("st");
      const groups = ["<65", "65–74", "≥75"], rate = [40, 250, 800];
      const popA = [30000, 8000, 7000], popB = [90000, 6000, 4000], std = [120000, 14000, 11000];
      const share = p => p.map(x => x / p.reduce((s, y) => s + y, 0));
      el.innerHTML = svg(560, 270, "年齡結構與標準化") + `<g id="${a}-g"></g></svg>` +
        ctl(`<button id="${a}-c" class="anim-btn">粗率（各自的年齡結構）</button><button id="${a}-s" class="anim-btn ghost">標準化（共同年齡結構）</button>`) + out(a + "-o");
      const g = el.querySelector(`#${a}-g`), o = el.querySelector(`#${a}-o`);
      const cols = ["var(--accent)", "var(--signal)", "var(--bad)"];
      const draw = (mode) => {
        const wA = mode === "std" ? share(std) : share(popA), wB = mode === "std" ? share(std) : share(popB);
        const bar = (x, w, name) => { let y = 220, s = ""; w.forEach((v, i) => { const h = v * 180; y -= h; s += `<rect x="${x}" y="${y}" width="90" height="${h}" fill="${cols[i]}" opacity=".8" style="transition:all .6s"/>`; if (h > 16) s += `<text x="${x + 45}" y="${y + h / 2 + 5}" text-anchor="middle" class="lbl inv">${groups[i]} ${(v * 100).toFixed(0)}%</text>` }); return s + `<text x="${x + 45}" y="245" text-anchor="middle" class="lbl">${name}</text>` };
        const rA = wA.reduce((s, v, i) => s + v * rate[i], 0), rB = wB.reduce((s, v, i) => s + v * rate[i], 0);
        g.innerHTML = bar(70, wA, "甲區") + bar(230, wB, "乙區") +
          `<text x="400" y="80" class="lbl">年齡別率（每十萬）</text>` + groups.map((x, i) => `<text x="400" y="${108 + i * 26}" class="lbl">${x}：${rate[i]}</text>`).join("") +
          `<text x="115" y="28" text-anchor="middle" class="big">${rA.toFixed(1)}</text><text x="275" y="28" text-anchor="middle" class="big">${rB.toFixed(1)}</text>`;
        o.innerHTML = mode === "std" ? `套用同一個標準人口後，兩區都是 <b>${rA.toFixed(1)}</b>／十萬：差距完全來自年齡結構，不是風險不同。` :
          `粗率：甲區 <b>${rA.toFixed(1)}</b>、乙區 <b>${rB.toFixed(1)}</b>／十萬，看起來差 ${(rA / rB).toFixed(1)} 倍。`;
        el.querySelector(`#${a}-c`).classList.toggle("ghost", mode === "std"); el.querySelector(`#${a}-s`).classList.toggle("ghost", mode !== "std");
      };
      el.querySelector(`#${a}-c`).addEventListener("click", () => draw("crude"));
      el.querySelector(`#${a}-s`).addEventListener("click", () => draw("std")); draw("crude");
    } };

  // 4. 切點 → 敏感度、特異度、ROC
  A.cutoff = { title: "移動切點：敏感度與特異度的拉鋸", desc: "北濱市 1,200 名創傷傷患的休克指數分布：上方是需要大量輸血者，下方是不需要者。拖動切點，看 TP、FN、FP、TN 與右側 ROC 上的點怎麼移動。",
    mount(el) {
      const a = uid("co"); const mt = (D.si && D.si.mt) || [], no = (D.si && D.si.no) || [];
      const bins = Array.from({ length: 26 }, (_, i) => 0.4 + i * 0.06);
      const hist = v => bins.map((b, i) => v.filter(x => x >= b && x < b + 0.06).length);
      const h1 = hist(mt), h0 = hist(no); const m1 = Math.max(...h1), m0 = Math.max(...h0);
      const X = v => 30 + (v - 0.4) / 1.56 * 330;
      const roc = []; for (let k = 0.3; k <= 2.1; k += 0.02) roc.push([no.filter(x => x >= k).length / no.length, mt.filter(x => x >= k).length / mt.length]);
      el.innerHTML = svg(620, 290, "休克指數分布與 ROC") +
        `<g id="${a}-h"></g><line id="${a}-l" y1="20" y2="250" stroke="var(--ink)" stroke-width="2" stroke-dasharray="5 4"/>
         <text x="30" y="16" class="lbl">需要大量輸血（${mt.length} 人）</text><text x="30" y="148" class="lbl">不需要（${no.length} 人）</text>
         <text x="200" y="278" text-anchor="middle" class="lbl">休克指數（心跳 ÷ 收縮壓）</text>
         <rect x="420" y="30" width="180" height="180" fill="none" stroke="var(--line)"/><line x1="420" y1="210" x2="600" y2="30" stroke="var(--line)" stroke-dasharray="3 3"/>
         <polyline points="${roc.map(([fp, tp]) => `${420 + fp * 180},${210 - tp * 180}`).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2"/>
         <circle id="${a}-p" r="7" fill="var(--signal)"/><text x="510" y="232" text-anchor="middle" class="lbl">1 − 特異度</text><text x="412" y="120" class="lbl" transform="rotate(-90 412 120)" text-anchor="middle">敏感度</text></svg>` +
        ctl(`<label>切點 <b id="${a}-k"></b><input type="range" id="${a}-r" min="0.5" max="1.6" step="0.02" value="0.94"></label><button id="${a}-y" class="anim-btn ghost">跳到 Youden 最佳切點</button>`) + out(a + "-o");
      const draw = () => {
        const k = +el.querySelector(`#${a}-r`).value; el.querySelector(`#${a}-k`).textContent = k.toFixed(2);
        let s = ""; bins.forEach((b, i) => { const x = X(b), w = 330 / 26 - 1, on = b + 0.03 >= k;
          s += `<rect x="${x}" y="${130 - h1[i] / m1 * 105}" width="${w}" height="${h1[i] / m1 * 105}" fill="${on ? "var(--ok)" : "var(--bad)"}" opacity=".75"/>`;
          s += `<rect x="${x}" y="${250 - h0[i] / m0 * 95}" width="${w}" height="${h0[i] / m0 * 95}" fill="${on ? "var(--signal)" : "var(--muted)"}" opacity=".6"/>` });
        el.querySelector(`#${a}-h`).innerHTML = s;
        const l = el.querySelector(`#${a}-l`); l.setAttribute("x1", X(k)); l.setAttribute("x2", X(k));
        const TP = mt.filter(x => x >= k).length, FN = mt.length - TP, FP = no.filter(x => x >= k).length, TN = no.length - FP;
        const se = TP / mt.length, sp = TN / no.length; const p = el.querySelector(`#${a}-p`); p.setAttribute("cx", 420 + (1 - sp) * 180); p.setAttribute("cy", 210 - se * 180);
        el.querySelector(`#${a}-o`).innerHTML = `<span class="sw ok"></span>TP ${TP}　<span class="sw bad"></span>FN ${FN}　<span class="sw sig"></span>FP ${FP}　<span class="sw mu"></span>TN ${TN}<br>
          敏感度 <b>${pct(se)}</b>（不足檢傷 ${pct(1 - se)}）　特異度 <b>${pct(sp)}</b>（過度檢傷 ${pct(1 - sp)}）　Youden ${fmt(se + sp - 1, 2)}`;
      };
      el.querySelector(`#${a}-r`).addEventListener("input", draw);
      el.querySelector(`#${a}-y`).addEventListener("click", () => { el.querySelector(`#${a}-r`).value = 0.94; draw() }); draw();
    } };

  // 5. 盛行率 → PPV
  A.ppv = { title: "同一個工具，換個現場預測值就變了", desc: "1,000 位傷患，每個點是一人。檢傷工具的敏感度與特異度固定，只改變「重傷比例」：一般出勤約 10%，大量傷病患現場可能 30% 以上。",
    mount(el) {
      const a = uid("pp");
      el.innerHTML = `<div class="dots" id="${a}-d" aria-hidden="true"></div>` +
        ctl(`<label>重傷比例 <b id="${a}-pv"></b><input type="range" id="${a}-p" min="2" max="60" value="10"></label>
             <label>敏感度 <b id="${a}-sev"></b><input type="range" id="${a}-se" min="50" max="99" value="90"></label>
             <label>特異度 <b id="${a}-spv"></b><input type="range" id="${a}-sp" min="50" max="99" value="81"></label>`) +
        `<div class="legend"><span class="sw ok"></span>真陽性　<span class="sw bad"></span>偽陰性　<span class="sw sig"></span>偽陽性　<span class="sw mu"></span>真陰性</div>` + out(a + "-o");
      const box = el.querySelector(`#${a}-d`); box.innerHTML = Array.from({ length: 1000 }, () => "<i></i>").join("");
      const dots = box.children;
      const upd = () => {
        const p = +el.querySelector(`#${a}-p`).value / 100, se = +el.querySelector(`#${a}-se`).value / 100, sp = +el.querySelector(`#${a}-sp`).value / 100;
        el.querySelector(`#${a}-pv`).textContent = Math.round(p * 100) + "%"; el.querySelector(`#${a}-sev`).textContent = Math.round(se * 100) + "%"; el.querySelector(`#${a}-spv`).textContent = Math.round(sp * 100) + "%";
        const D1 = Math.round(1000 * p), TP = Math.round(D1 * se), FN = D1 - TP, N0 = 1000 - D1, TN = Math.round(N0 * sp), FP = N0 - TN;
        for (let i = 0; i < 1000; i++) dots[i].className = i < TP ? "ok" : i < D1 ? "bad" : i < D1 + FP ? "sig" : "mu";
        el.querySelector(`#${a}-o`).innerHTML = `判陽性 ${TP + FP} 人中真正重傷 ${TP} 人 → <b>PPV ${pct(TP / (TP + FP))}</b>；判陰性 ${FN + TN} 人中真正輕傷 ${TN} 人 → <b>NPV ${pct(TN / (TN + FN))}</b>`;
      };
      el.querySelectorAll("input").forEach(x => x.addEventListener("input", upd)); upd();
    } };

  // 6. Kaplan–Meier
  A.km = { title: "Kaplan–Meier：一步一步算存活", desc: "10 位重度燒傷病人追蹤 30 天（期中考第六題的資料）。按「下一步」，每到一個時間點就更新「仍在追蹤人數」與累積存活率；○ 是失聯（設限），不算死亡，但之後不再計入分母。",
    mount(el) {
      const a = uid("km");
      const ev = [[2, 1], [3, 1], [5, 0], [8, 1], [12, 0], [15, 1], [30, 0]]; // [天, 1=死亡 0=設限]
      el.innerHTML = svg(560, 260, "Kaplan-Meier 存活曲線") +
        `<line x1="50" y1="220" x2="530" y2="220" stroke="var(--line)"/><line x1="50" y1="20" x2="50" y2="220" stroke="var(--line)"/>
         ${[0, 0.25, 0.5, 0.75, 1].map(v => `<text x="44" y="${224 - v * 200}" text-anchor="end" class="lbl">${v}</text>`).join("")}
         ${[0, 5, 10, 15, 20, 25, 30].map(d => `<text x="${50 + d * 16}" y="240" text-anchor="middle" class="lbl">${d}</text>`).join("")}
         <text x="290" y="256" text-anchor="middle" class="lbl">天</text><path id="${a}-c" fill="none" stroke="var(--accent)" stroke-width="3"/><g id="${a}-m"></g></svg>` +
        ctl(`<button id="${a}-n" class="anim-btn">下一步</button><button id="${a}-r" class="anim-btn ghost">重來</button>`) +
        `<div class="tblwrap"><table class="mini"><thead><tr><th>天</th><th>仍在追蹤</th><th>事件</th><th>條件存活</th><th>累積存活</th></tr></thead><tbody id="${a}-t"></tbody></table></div>`;
      let k = 0;
      const render = () => {
        let n = 10, S = 1, d = `M50 20`, rows = "", marks = "";
        for (let i = 0; i < k; i++) {
          const [day, die] = ev[i], x = 50 + day * 16;
          if (die) { const c = (n - 1) / n; rows += `<tr><td>${day}</td><td>${n}</td><td>死亡 1</td><td>${n - 1}/${n}</td><td><b>${(S * c).toFixed(3)}</b></td></tr>`; d += ` H${x} V${220 - S * c * 200}`; S *= c; }
          else { rows += `<tr><td>${day}</td><td>${n}</td><td>${day === 30 ? "研究結束（4 人存活）" : "失聯 1"}</td><td>—</td><td>${S.toFixed(3)}</td></tr>`; marks += `<circle cx="${x}" cy="${220 - S * 200}" r="5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>`; d += ` H${x}`; }
          n -= day === 30 ? 0 : 1;
        }
        el.querySelector(`#${a}-c`).setAttribute("d", d); el.querySelector(`#${a}-m`).innerHTML = marks;
        el.querySelector(`#${a}-t`).innerHTML = rows || `<tr><td colspan="5">按「下一步」開始</td></tr>`;
        el.querySelector(`#${a}-n`).disabled = k >= ev.length;
      };
      el.querySelector(`#${a}-n`).addEventListener("click", () => { k = Math.min(ev.length, k + 1); render() });
      el.querySelector(`#${a}-r`).addEventListener("click", () => { k = 0; render() });
      k = reduce ? ev.length : 0; render();
    } };

  // 7. 2×2 計算器
  A.twobytwo = { title: "2×2 表計算器", desc: "預設是北濱市旁觀者 CPR 的資料。改任何一格，所有指標即時更新。試試把存活人數放大十倍，看 OR 與 RR 是不是開始分開。",
    mount(el) {
      const a = uid("tb"); const v = { a: 85, b: 639, c: 29, d: 630 };
      el.innerHTML = `<div class="tblwrap"><table class="mini two"><thead><tr><th></th><th>存活出院</th><th>死亡</th></tr></thead><tbody>
        <tr><th>有旁觀者 CPR</th><td><input id="${a}-a" type="number" min="0" value="${v.a}"> <i>a</i></td><td><input id="${a}-b" type="number" min="0" value="${v.b}"> <i>b</i></td></tr>
        <tr><th>無旁觀者 CPR</th><td><input id="${a}-c" type="number" min="0" value="${v.c}"> <i>c</i></td><td><input id="${a}-d" type="number" min="0" value="${v.d}"> <i>d</i></td></tr></tbody></table></div>` + out(a + "-o");
      const upd = () => {
        const [A1, B, C, Dd] = ["a", "b", "c", "d"].map(k => Math.max(0, +el.querySelector(`#${a}-${k}`).value || 0));
        const r1 = A1 / (A1 + B), r0 = C / (C + Dd), rr = r1 / r0, or = (A1 * Dd) / (B * C), rd = r1 - r0;
        const se = Math.sqrt(1 / A1 - 1 / (A1 + B) + 1 / C - 1 / (C + Dd));
        el.querySelector(`#${a}-o`).innerHTML = `<div class="kv">
          <div><span>風險（暴露）</span><b>${fmt(r1)}</b><small>a ÷ (a+b)</small></div><div><span>風險（非暴露）</span><b>${fmt(r0)}</b><small>c ÷ (c+d)</small></div>
          <div><span>RR</span><b>${fmt(rr, 2)}</b><small>95% CI ${fmt(Math.exp(Math.log(rr) - 1.96 * se), 2)}–${fmt(Math.exp(Math.log(rr) + 1.96 * se), 2)}</small></div>
          <div><span>OR</span><b>${fmt(or, 2)}</b><small>ad ÷ bc</small></div><div><span>風險差</span><b>${fmt(rd)}</b><small>R₁ − R₀</small></div>
          <div><span>NNT</span><b>${rd > 0 ? fmt(1 / rd, 1) : "—"}</b><small>1 ÷ 風險差</small></div></div>`;
      };
      el.querySelectorAll("input").forEach(x => x.addEventListener("input", upd)); upd();
    } };

  // 8. DAG 調整
  A.dag = { title: "DAG：調整哪個變項，路徑就會開或關", desc: "想估計「反應時間 → 存活」的總效應。勾選要調整的變項：紅色是仍開著、會造成偏誤的路徑；灰色是被擋住的路徑。",
    mount(el) {
      const a = uid("dg");
      const N = { rural: [300, 32, "鄉村區"], rhythm: [300, 104, "初始心律"], resp: [80, 168, "反應時間"], surv: [520, 168, "存活"], hosp: [300, 238, "有送醫"] };
      const E = [["rural", "resp"], ["rural", "surv"], ["resp", "rhythm"], ["rhythm", "surv"], ["resp", "surv"], ["resp", "hosp"], ["surv", "hosp"]];
      const line = ([s, t], id) => { const [x1, y1] = N[s], [x2, y2] = N[t]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), r1 = 48 / L, r2 = (L - 52) / L;
        return `<line id="${a}-${id}" x1="${x1 + dx * r1}" y1="${y1 + dy * r1}" x2="${x1 + dx * r2}" y2="${y1 + dy * r2}" stroke="var(--muted)" stroke-width="2.5" marker-end="url(#${a}-ah)"/>` };
      el.innerHTML = svg(600, 270, "可調整的 DAG") + `<defs><marker id="${a}-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker></defs>` +
        E.map((e, i) => line(e, "e" + i)).join("") +
        Object.entries(N).map(([k, [x, y, t]]) => `<g id="${a}-n-${k}"><rect x="${x - 48}" y="${y - 18}" width="96" height="36" rx="8" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/><text x="${x}" y="${y + 6}" text-anchor="middle" class="lbl">${t}</text></g>`).join("") + `</svg>` +
        ctl(`<label class="chk"><input type="checkbox" id="${a}-c-rural"> 調整「鄉村區」</label><label class="chk"><input type="checkbox" id="${a}-c-rhythm"> 調整「初始心律」</label><label class="chk"><input type="checkbox" id="${a}-c-hosp"> 只分析「有送醫」者</label>`) + out(a + "-o");
      const upd = () => {
        const c = k => el.querySelector(`#${a}-c-${k}`).checked;
        const back = !c("rural"), med = c("rhythm"), col = c("hosp");
        const st = (ids, cls) => ids.forEach(i => { const l = el.querySelector(`#${a}-e${i}`); l.setAttribute("stroke", cls === "open" ? "var(--bad)" : cls === "cause" ? "var(--accent)" : "var(--line)"); l.setAttribute("stroke-width", cls === "open" ? 4 : 2.5) });
        st([0, 1], back ? "open" : "closed"); st([2, 3], med ? "closed" : "cause"); st([4], "cause"); st([5, 6], col ? "open" : "closed");
        ["rural", "rhythm", "hosp"].forEach(k => el.querySelector(`#${a}-n-${k} rect`).setAttribute("stroke", c(k) ? "var(--ink)" : "var(--line)"));
        const msg = [];
        msg.push(back ? "後門路徑「反應時間 ← 鄉村區 → 存活」<b>開著</b>：鄉村區造成干擾，請調整它。" : "後門路徑已被擋住 ✓");
        if (med) msg.push("你調整了中介因子「初始心律」：經由心律的那部分效果被擋掉，<b>總效應會被低估</b>。");
        if (col) msg.push("只分析有送醫者＝以對撞因子為條件，<b>打開了假路徑</b>「反應時間 → 送醫 ← 存活」。");
        if (!back && !med && !col) msg.push("<b>正確</b>：只調整鄉村區，就能估計反應時間對存活的總效應（綠色路徑全部保留）。");
        el.querySelector(`#${a}-o`).innerHTML = msg.join("<br>");
      };
      el.querySelectorAll("input").forEach(x => x.addEventListener("change", upd)); upd();
    } };

  // 9. 分層（Simpson）
  A.simpson = { title: "分層：粗分析與分層分析為什麼不同", desc: "旁觀者 CPR 與存活。先看合併的粗結果，再按「依目擊狀況分層」。目擊倒下者較常接受 CPR、也較容易存活，所以粗 OR 被放大了。",
    mount(el) {
      const a = uid("sm");
      const S = { w: { y: [45, 300], n: [12, 200] }, u: { y: [9, 240], n: [14, 460] } };
      const r = (s, d) => s / d;
      el.innerHTML = svg(560, 250, "分層長條圖") + `<g id="${a}-g"></g></svg>` + ctl(`<button id="${a}-c" class="anim-btn">合併（粗分析）</button><button id="${a}-s" class="anim-btn ghost">依目擊狀況分層</button>`) + out(a + "-o");
      const g = el.querySelector(`#${a}-g`);
      const bars = (x, ry, rn, lab) => { const h = v => v * 900; return `<rect x="${x}" y="${210 - h(ry)}" width="50" height="${h(ry)}" fill="var(--accent)" style="transition:all .5s"/><rect x="${x + 56}" y="${210 - h(rn)}" width="50" height="${h(rn)}" fill="var(--muted)" style="transition:all .5s"/>
        <text x="${x + 25}" y="${204 - h(ry)}" text-anchor="middle" class="lbl">${pct(ry)}</text><text x="${x + 81}" y="${204 - h(rn)}" text-anchor="middle" class="lbl">${pct(rn)}</text><text x="${x + 53}" y="232" text-anchor="middle" class="lbl">${lab}</text>` };
      const or = (a1, n1, a0, n0) => (a1 * (n0 - a0)) / ((n1 - a1) * a0);
      const draw = m => {
        if (m === "c") { const y = S.w.y[0] + S.u.y[0], ny = S.w.y[1] + S.u.y[1], n = S.w.n[0] + S.u.n[0], nn = S.w.n[1] + S.u.n[1];
          g.innerHTML = bars(200, y / ny, n / nn, "全部") + `<text x="20" y="30" class="lbl"><tspan fill="var(--accent)">■</tspan> 有 CPR　<tspan fill="var(--muted)">■</tspan> 無 CPR</text>`;
          el.querySelector(`#${a}-o`).innerHTML = `粗 OR = <b>${fmt(or(y, ny, n, nn), 2)}</b>`;
        } else {
          g.innerHTML = bars(90, r(...S.w.y), r(...S.w.n), "目擊") + bars(320, r(...S.u.y), r(...S.u.n), "未目擊") + `<text x="20" y="30" class="lbl"><tspan fill="var(--accent)">■</tspan> 有 CPR　<tspan fill="var(--muted)">■</tspan> 無 CPR</text>`;
          el.querySelector(`#${a}-o`).innerHTML = `目擊層 OR <b>${fmt(or(...S.w.y, ...S.w.n), 2)}</b>，未目擊層 OR <b>${fmt(or(...S.u.y, ...S.u.n), 2)}</b>；合併的 MH OR 為 2.11。兩層差很多 → 除了干擾，還有效應修飾，應分層報告。`;
        }
        el.querySelector(`#${a}-c`).classList.toggle("ghost", m !== "c"); el.querySelector(`#${a}-s`).classList.toggle("ghost", m === "c");
      };
      el.querySelector(`#${a}-c`).addEventListener("click", () => draw("c")); el.querySelector(`#${a}-s`).addEventListener("click", () => draw("s")); draw("c");
    } };

  // 10. 群集抽樣
  A.cluster = { title: "CASPER：30 × 7 群集抽樣", desc: "颱風後 150 個街廓，顏色越深代表停電戶越多（真實比例已知）。按「抽一次」：先依戶數比例抽 30 個街廓，再各抽 7 戶。多抽幾次，看估計值如何跳動。",
    mount(el) {
      const a = uid("cl"); const B = D.blocks || { hh: [], no_power: [] };
      const n = B.hh.length, tot = B.hh.reduce((s, x) => s + x, 0), truth = B.no_power.reduce((s, x) => s + x, 0) / tot;
      el.innerHTML = `<div class="grid15" id="${a}-g">${B.hh.map((h, i) => `<span style="--p:${(B.no_power[i] / h).toFixed(2)}" title="街廓 ${i + 1}：${h} 戶"></span>`).join("")}</div>` +
        ctl(`<button id="${a}-s" class="anim-btn">抽一次</button><button id="${a}-x" class="anim-btn ghost">連抽 20 次</button>`) + svg(560, 90, "估計值分布") + `<line x1="20" y1="60" x2="540" y2="60" stroke="var(--line)"/><line id="${a}-t" y1="20" y2="70" stroke="var(--ink)" stroke-width="2"/><g id="${a}-pts"></g>${[0.3, 0.4, 0.5, 0.6, 0.7].map(v => `<text x="${20 + (v - 0.3) * 1300}" y="84" text-anchor="middle" class="lbl">${v * 100}%</text>`).join("")}</svg>` + out(a + "-o");
      const X = v => 20 + (v - 0.3) * 1300; const t = el.querySelector(`#${a}-t`); t.setAttribute("x1", X(truth)); t.setAttribute("x2", X(truth));
      const cells = el.querySelector(`#${a}-g`).children; const ests = [];
      const one = () => {
        [...cells].forEach(c => c.classList.remove("pick"));
        const chosen = []; for (let k = 0; k < 30; k++) { let r = Math.random() * tot, i = 0; while (r > B.hh[i]) { r -= B.hh[i]; i++ } chosen.push(i) }
        let yes = 0; chosen.forEach(i => { cells[i].classList.add("pick"); const p = B.no_power[i] / B.hh[i]; for (let j = 0; j < 7; j++) if (Math.random() < p) yes++ });
        const e = yes / 210; ests.push(e);
        el.querySelector(`#${a}-pts`).innerHTML = ests.map(v => `<circle cx="${X(v)}" cy="${48 - Math.random() * 20}" r="4" fill="var(--accent)" opacity=".7"/>`).join("");
        const m = ests.reduce((s, x) => s + x, 0) / ests.length, sd = ests.length > 1 ? Math.sqrt(ests.reduce((s, x) => s + (x - m) ** 2, 0) / (ests.length - 1)) : NaN;
        el.querySelector(`#${a}-o`).innerHTML = `最新估計 <b>${pct(e)}</b>　真實值 ${pct(truth)}　已抽 ${ests.length} 次${ests.length > 1 ? `，估計值標準差 ${pct(sd)}（簡單隨機抽 210 戶約 ${pct(Math.sqrt(truth * (1 - truth) / 210))}）` : ""}`;
      };
      el.querySelector(`#${a}-s`).addEventListener("click", one);
      el.querySelector(`#${a}-x`).addEventListener("click", () => { let k = 0; loop(() => { one(); return ++k < 20 }, 120) });
      el.querySelector(`#${a}-o`).innerHTML = `真實停電比例 ${pct(truth)}（${n} 個街廓、${tot} 戶）。按「抽一次」開始。`;
    } };

  // 11. 中斷時間序列
  A.its = { title: "中斷時間序列：政策效果不是前後相減", desc: "每個點是一個月的旁觀者 CPR 率。打開「政策前趨勢延伸」，虛線是「沒有政策時」的預期；實際值與虛線的落差才是政策效果。",
    mount(el) {
      const a = uid("it"); const T = D.its || { t: [], post_policy: [], ohca_eligible: [], bystander_cpr: [] };
      const r = T.t.map((_, i) => T.bystander_cpr[i] / T.ohca_eligible[i]); const X = t => 40 + (t - 1) * 8.4, Y = v => 220 - (v - 0.2) * 450;
      const pre = T.t.map((t, i) => [t, r[i]]).filter((_, i) => !T.post_policy[i]);
      const n = pre.length, mx = pre.reduce((s, p) => s + p[0], 0) / n, my = pre.reduce((s, p) => s + p[1], 0) / n;
      const b = pre.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pre.reduce((s, p) => s + (p[0] - mx) ** 2, 0), a0 = my - b * mx;
      const t0 = T.t[T.post_policy.indexOf(1)];
      el.innerHTML = svg(560, 250, "中斷時間序列") + [0.2, 0.3, 0.4, 0.5, 0.6].map(v => `<line x1="40" x2="540" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="34" y="${Y(v) + 4}" text-anchor="end" class="lbl">${v * 100}%</text>`).join("") +
        `<line x1="${X(t0) - 4}" x2="${X(t0) - 4}" y1="10" y2="230" stroke="var(--signal)" stroke-dasharray="5 4"/><text x="${X(t0)}" y="22" class="lbl">政策上路 2024/7</text>` +
        T.t.map((t, i) => `<circle cx="${X(t)}" cy="${Y(r[i])}" r="4" fill="${T.post_policy[i] ? "var(--accent)" : "var(--muted)"}"/>`).join("") +
        `<line x1="${X(1)}" y1="${Y(a0 + b)}" x2="${X(t0)}" y2="${Y(a0 + b * t0)}" stroke="var(--ink)" stroke-width="2"/>
         <line id="${a}-cf" x1="${X(t0)}" y1="${Y(a0 + b * t0)}" x2="${X(60)}" y2="${Y(a0 + b * 60)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6 5" opacity="0"/>
         <text x="290" y="246" text-anchor="middle" class="lbl">2021–2025 年（月）</text></svg>` +
        ctl(`<label class="chk"><input type="checkbox" id="${a}-c"> 顯示政策前趨勢延伸（反事實）</label>`) + out(a + "-o");
      const postMean = r.filter((_, i) => T.post_policy[i]).reduce((s, x, _, arr) => s + x / arr.length, 0);
      const cfMean = T.t.filter((_, i) => T.post_policy[i]).reduce((s, t, _, arr) => s + (a0 + b * t) / arr.length, 0);
      const preLast = r.filter((_, i) => !T.post_policy[i]).slice(-12).reduce((s, x) => s + x / 12, 0), postFirst = r.filter((_, i) => T.post_policy[i]).slice(0, 12).reduce((s, x) => s + x / 12, 0);
      const upd = () => { const on = el.querySelector(`#${a}-c`).checked; el.querySelector(`#${a}-cf`).setAttribute("opacity", on ? 1 : 0);
        el.querySelector(`#${a}-o`).innerHTML = on ? `政策後實際平均 <b>${pct(postMean)}</b>，若無政策預期 <b>${pct(cfMean)}</b>：政策效果約 <b>${((postMean - cfMean) * 100).toFixed(1)} 個百分點</b>。` :
          `只比較政策前後各 12 個月：${pct(preLast)} → ${pct(postFirst)}，差 ${((postFirst - preLast) * 100).toFixed(1)} 個百分點，其中一部分只是原本就在上升的趨勢。` };
      el.querySelector(`#${a}-c`).addEventListener("change", upd); upd();
    } };

  // 12. 流行曲線
  A.epicurve = { title: "流行曲線一小時一小時長出來", desc: "避難所 61 位病例的發病時間（晚餐後經過的小時數）。按「播放」看病例逐時出現：單一高峰、集中在 24–48 小時，指向同一餐的共同來源。",
    mount(el) {
      const a = uid("ep"); const on = D.onset || []; const maxH = 84, bw = 6;
      const bins = Array.from({ length: maxH / bw }, (_, i) => on.filter(h => h >= i * bw && h < (i + 1) * bw).length); const m = Math.max(...bins, 1);
      el.innerHTML = svg(560, 250, "流行曲線") + `<line x1="40" y1="210" x2="540" y2="210" stroke="var(--line)"/>` +
        bins.map((c, i) => `<rect id="${a}-b${i}" x="${40 + i * (500 / bins.length) + 2}" y="210" width="${500 / bins.length - 4}" height="0" fill="var(--accent)"/>`).join("") +
        Array.from({ length: maxH / 12 + 1 }, (_, i) => `<text x="${40 + i * 12 / maxH * 500}" y="228" text-anchor="middle" class="lbl">${i * 12}</text>`).join("") +
        `<text x="290" y="246" text-anchor="middle" class="lbl">晚餐後經過時數</text><text id="${a}-n" x="530" y="30" text-anchor="end" class="big"></text></svg>` +
        ctl(`<button id="${a}-p" class="anim-btn">播放</button>`) + out(a + "-o");
      const show = (k) => { let n = 0; bins.forEach((c, i) => { const vis = i < k ? c : 0; n += vis; const r = el.querySelector(`#${a}-b${i}`); r.setAttribute("height", vis / m * 170); r.setAttribute("y", 210 - vis / m * 170) });
        el.querySelector(`#${a}-n`).textContent = `${n} 例`;
        el.querySelector(`#${a}-o`).innerHTML = k >= bins.length ? `中位潛伏期約 ${on[Math.floor(on.length / 2)] ?? "—"} 小時，最短 ${on[0] ?? "—"}、最長 ${on[on.length - 1] ?? "—"} 小時；符合諾羅病毒 12–48 小時的潛伏期。` : `已過 ${k * bw} 小時` };
      el.querySelector(`#${a}-p`).addEventListener("click", () => { let k = 0; loop(() => { show(++k); return k < bins.length }, 280) });
      show(reduce ? bins.length : bins.length);
    } };

  window.ANIM = A;
})();
