# drjackchang.org — 個人網站

純 HTML + CSS + 原生 JS 靜態網站，透過 GitHub Pages 部署，不需要任何建置工具。

## 上傳到 GitHub Pages

1. 到 GitHub 新增一個 repository（例如 `drjackchang-website`），把這整個資料夾的內容上傳上去（可以直接在 GitHub 網頁上拖拉上傳，或用 GitHub Desktop）
2. Repo 頁面 → **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 `main` / `/(root)`
3. `CNAME` 檔案內容已經是 `drjackchang.org`，會沿用你現有的自訂網域，DNS 設定不用改
4. 等 1–2 分鐘，網站就會生效

## 怎麼新增內容（不用碰 HTML/CSS）

所有內容都在 `data/` 資料夾裡的四個 JSON 檔，打開對應檔案，照現有格式加一個新物件就好：

- **新增一篇著作** → 編輯 `data/publications.json`，複製一筆現有格式，改內容、`id` 換一個沒用過的名字
- **新增一個研究專案** → 編輯 `data/projects.json`（有對外連結的話可以加 `"url"` 欄位，卡片會自動出現「查看 →」按鈕）
- **新增一門課程／課程網站** → 編輯 `data/courses.json`，格式跟研究專案一樣
- **新增一則動態消息** → 編輯 `data/news.json`
- **改個人簡介、聯絡方式、研究關鍵字** → 編輯 `data/site.json`

存檔、`git push` 上去，網站就會自動更新，不用改任何程式碼。

## ORCID 自動同步著作

`.github/workflows/sync-orcid.yml` 每週一會自動執行 `scripts/sync-orcid.js`，呼叫 ORCID 公開 API（`0000-0002-7540-6035`），把還沒收錄的新著作加進 `data/publications.json` 並自動 commit。

幾點提醒：

- 瀏覽器端沒辦法直接呼叫 ORCID API（會被 CORS 擋掉），所以同步這件事是在 GitHub Actions 的伺服器端做的 —— 網站本身仍然是純靜態檔案
- ORCID 的 works API 不包含完整作者名單，所以自動加入的新項目 `authors` 欄位會是空的、`title_zh` 也是空的，且會標記 `"needs_review": true`，你之後要自己補上作者順序跟中文標題
- 判斷「是不是新項目」是用 DOI 或標題比對，不是 100% 精準，建議每次自動 commit 後抽空看一眼 `data/publications.json` 的變更
- 如果想立刻測試，去 repo 的 **Actions** 頁籤，選 `Sync ORCID publications` → **Run workflow** 手動觸發一次

## 本機預覽

因為網站是用 `fetch()` 讀取 JSON，**不能**直接雙擊打開 `index.html`（瀏覽器的 file:// 保護機制會擋掉 fetch）。要在本機看效果，用任一種簡單的本機伺服器即可，例如：

```
python3 -m http.server 8000
```

然後開瀏覽器到 `http://localhost:8000`。

## 大頭照

`index.html` 目前直接引用你現有網站上的照片網址（`https://drjackchang.org/Jack.jpg`），部署後會照常顯示。如果之後想換照片，把新檔案放進 `assets/`，再把 `index.html` 裡 `<img class="hero-photo">` 的 `src` 改成 `assets/你的檔名.jpg` 即可。
