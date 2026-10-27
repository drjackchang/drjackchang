# 執行每週 R 範例，擷取文字輸出與圖檔，輸出 site/outputs.js 供網站顯示「參考輸出」
suppressMessages(library(jsonlite))
files <- sort(list.files("R/weeks", pattern = "^w\\d+\\.R$", full.names = TRUE))
site <- if (dir.exists("site")) "site" else "."   # 課程 repo 根目錄或開發用 site/
dir.create(file.path(site, "img"), recursive = TRUE, showWarnings = FALSE)
all <- list()
for (f in files) {
  wk <- sub("\\.R$", "", basename(f))
  lines <- readLines(f, encoding = "UTF-8")
  starts <- grep("^## ---- ", lines)
  ends <- c(starts[-1] - 1, length(lines))
  env <- new.env(parent = globalenv())
  chunks <- list()
  for (i in seq_along(starts)) {
    seg <- lines[starts[i]:ends[i]]
    title <- sub("^## ---- ", "", seg[1])
    txt <- sub("^#' ?", "", seg[grepl("^#'", seg)])
    code <- seg[-1][!grepl("^#'", seg[-1])]
    while (length(code) && code[length(code)] == "") code <- code[-length(code)]
    png_file <- file.path(site, sprintf("img/%s_%02d.png", wk, i))
    png(png_file, width = 900, height = 560, res = 130)
    out <- tryCatch(capture.output({
      exprs <- parse(text = code)
      for (e in exprs) { v <- withVisible(eval(e, env)); if (v$visible) print(v$value) }
    }, type = "output"), error = function(e) paste("ERROR:", conditionMessage(e)))
    dev.off()
    has_plot <- file.exists(png_file) && file.info(png_file)$size > 3000
    if (!has_plot && file.exists(png_file)) file.remove(png_file)
    if (any(grepl("^ERROR", out))) message(wk, " chunk ", i, ": ", paste(out, collapse = " "))
    chunks[[i]] <- list(title = title, text = paste(txt, collapse = "\n"), code = paste(code, collapse = "\n"),
                        output = paste(out, collapse = "\n"),
                        plot = if (has_plot) sprintf("img/%s_%02d.png", wk, i) else "")
  }
  all[[wk]] <- chunks
}
writeLines(paste0("window.WEEK_CODE = ", toJSON(all, auto_unbox = TRUE), ";"), file.path(site, "outputs.js"), useBytes = TRUE)
cat("built", length(all), "weeks\n")
