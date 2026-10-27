## ---- 實作專題範本：讀入你的開放資料
#' 把下載的 CSV 放到工作目錄，修改檔名與欄位名稱即可。這裡先用北濱市資料示範。
dat <- read.csv("data/ems_calls.csv")      # ← 換成你的檔案
pop <- read.csv("data/population.csv")     # ← 換成你的分母

## ---- 步驟 1：定義分子與分母，計算率與 95% CI
num <- table(dat$district[dat$category == "trauma"])
den <- tapply(pop$pop, pop$district, sum)[names(num)]
ci  <- t(sapply(names(num), function(k) poisson.test(num[[k]], den[[k]])$conf.int * 1000))
out <- data.frame(area = names(num), events = as.vector(num), population = as.vector(den),
                  rate_per_1000 = round(as.vector(num / den * 1000), 2),
                  lower = round(ci[, 1], 2), upper = round(ci[, 2], 2))
out[order(-out$rate_per_1000), ]

## ---- 步驟 2：一張圖
o <- out[order(out$rate_per_1000), ]
dotchart(o$rate_per_1000, labels = o$area, xlim = range(c(o$lower, o$upper)), pch = 19,
         main = "Trauma call rate per 1,000 (95% CI)", xlab = "Rate per 1,000")
segments(o$lower, seq_len(nrow(o)), o$upper, seq_len(nrow(o)))

## ---- 步驟 3：寫下三個限制
#' 1. 分子定義（例如派遣類別 vs 到院診斷）？ 2. 分母是否為同一時期、同一範圍的人口？ 3. 是否需要年齡標準化？
cat("Limitations: numerator definition / denominator period / age structure\n")
