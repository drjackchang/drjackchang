# 流行病學方法論（EMS 與災難數據版）課程網站

- `index.html`：網站本體
- `weeks.js`：每週文字、年報連結、動手改一改、資料說明
- `indicators.js`：指標辭典（定義、公式、為什麼用、怎麼解讀、常見錯誤、北濱市範例）
- `outputs.js`、`img/`：每週 R 範例與參考輸出（由 `R/build_outputs.R` 產生）
- `data/`：15 份模擬資料 CSV
- `epi-ems-rstudio.zip`：學生下載的 R 專案（epi-ems.Rproj、data/、R/weeks/）

修改 R 範例後，在開發資料夾執行 `Rscript R/build_outputs.R` 與 `./build_gh.sh`，再把 gh/ 的內容覆蓋到這裡。
