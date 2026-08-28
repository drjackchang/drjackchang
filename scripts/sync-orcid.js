// 從 ORCID 公開 API 抓取著作清單，把尚未收錄的新項目加進 data/publications.json
// 在 GitHub Actions（Node 20+，內建 fetch）以伺服器端執行，不受瀏覽器 CORS 限制。
"use strict";

const fs = require("fs");
const path = require("path");

const ORCID_ID = "0000-0002-7540-6035";
const PUB_PATH = path.join(__dirname, "..", "data", "publications.json");

const TYPE_MAP = {
  "journal-article": "journal",
  "review": "journal",
  "conference-paper": "conference",
  "conference-abstract": "conference",
  "conference-poster": "conference",
  "book": "book",
  "book-chapter": "book",
  "edited-book": "book"
};

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
}

async function main() {
  const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`ORCID API 回應錯誤: ${res.status}`);
  }
  const body = await res.json();
  const groups = body.group || [];

  const existing = JSON.parse(fs.readFileSync(PUB_PATH, "utf8"));
  const existingDois = new Set(
    existing.filter((p) => p.doi).map((p) => p.doi.toLowerCase())
  );
  const existingTitles = new Set(
    existing.map((p) => normalize(p.title_en || p.title_zh))
  );

  let added = 0;

  groups.forEach((group) => {
    const summary = (group["work-summary"] || [])[0];
    if (!summary) return;

    const title = summary.title && summary.title.title && summary.title.title.value;
    if (!title) return;

    let doi = "";
    (group["external-ids"] && group["external-ids"]["external-id"] || []).forEach((ext) => {
      if (ext["external-id-type"] === "doi" && !doi) {
        doi = ext["external-id-value"];
      }
    });

    const isDupeByDoi = doi && existingDois.has(doi.toLowerCase());
    const isDupeByTitle = existingTitles.has(normalize(title));
    if (isDupeByDoi || isDupeByTitle) return;

    const year =
      summary["publication-date"] &&
      summary["publication-date"].year &&
      Number(summary["publication-date"].year.value);

    const venue =
      (summary["journal-title"] && summary["journal-title"].value) || "";

    const orcidType = summary.type || "";
    const type = TYPE_MAP[orcidType] || "journal";

    existing.push({
      id: `orcid-${summary["put-code"]}`,
      type: type,
      authors: "",
      title_en: title,
      title_zh: "",
      venue: venue,
      year: year || null,
      doi: doi || undefined,
      source: "orcid-sync",
      needs_review: true
    });

    if (doi) existingDois.add(doi.toLowerCase());
    existingTitles.add(normalize(title));
    added += 1;
  });

  if (added > 0) {
    fs.writeFileSync(PUB_PATH, JSON.stringify(existing, null, 2) + "\n", "utf8");
    console.log(`新增了 ${added} 筆著作，請記得之後手動補上中文標題與作者順序。`);
  } else {
    console.log("沒有新的著作，publications.json 未變更。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
