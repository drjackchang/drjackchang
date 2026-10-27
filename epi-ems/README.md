# 流行病學方法論（EMS／災難數據版）課程網站

## 部署到 GitHub Pages
1. 在 GitHub 建立新 repo（例如 `epi-ems`），把本資料夾所有內容（含 `webr/`、`.nojekyll`）上傳到 main 分支根目錄。
2. Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`。
3. 網址為 `https://<帳號>.github.io/epi-ems/`。

## 資料夾
- `index.html`：網站本體
- `weeks.js`：每週文字、年報連結、資料說明（改這個檔就能改網站內容）
- `data/`：15 份模擬資料 CSV（由 `R/sim_data.R` 以固定種子產生）
- `R/weeks/wNN.R`：每週範例程式；`R/build_outputs.R`：重新執行範例並產生 `outputs.js` 與 `img/`
- `webr/`：瀏覽器內執行 R 的引擎（webR 0.6.0），讓學生免安裝即可跑程式

## 修改範例後重建
在 repo 根目錄執行：

```
Rscript R/sim_data.R        # 重新產生資料（通常不需要）
Rscript R/build_outputs.R   # 重新產生參考輸出與圖
```
