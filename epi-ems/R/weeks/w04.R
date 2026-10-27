## ---- OHCA 發生率：每十萬人年
#' 三年資料，分母要用「人年」= 人口 × 3。VACAR 2023–24 年報的全州發生率為 114／10 萬。
ohca <- read.csv("data/ohca.csv")
pop  <- read.csv("data/population.csv")
py   <- tapply(pop$pop, pop$district, sum) * 3
n    <- table(ohca$district)
inc  <- n / py[names(n)] * 1e5
round(sort(inc, decreasing = TRUE), 1)
round(sum(n) / sum(py) * 1e5, 1)   # 全市

## ---- 發生率的 95% 信賴區間
#' 小區的率波動大，報告率時要附上信賴區間（Poisson 精確法）。
ci <- t(sapply(names(n), function(d) poisson.test(n[[d]], py[[d]])$conf.int * 1e5))
round(cbind(rate = inc[rownames(ci)], lower = ci[, 1], upper = ci[, 2]), 1)

## ---- 熱傷害症候群監測：每日件數 vs 氣溫
#' 把個案資料彙整成每日件數，與當日最高氣溫並列，就是最簡單的症候群監測。
calls <- read.csv("data/ems_calls.csv")
w     <- read.csv("data/weather_2025.csv")
heat  <- table(factor(calls$date[calls$category == "heat"], levels = w$date))
w$heat_calls <- as.vector(heat)
plot(as.Date(w$date), w$heat_calls, type = "h", col = "#d9822b",
     main = "Daily heat-related EMS calls, 2025", xlab = "", ylab = "Calls")
par(new = TRUE)
plot(as.Date(w$date), w$tmax, type = "l", axes = FALSE, xlab = "", ylab = "", col = "grey40")

## ---- 異常偵測：超過前 28 天平均 + 2 SD 即警示
#' 這是 EARS 類演算法的簡化版。件數很少時只要多 1–2 件就會誤報，所以先數一下純統計門檻標記了幾天。
w$threshold <- NA
for (i in 29:nrow(w)) {
  b <- w$heat_calls[(i - 28):(i - 1)]
  w$threshold[i] <- mean(b) + 2 * sd(b)
}
sum(w$heat_calls > w$threshold, na.rm = TRUE)

## ---- 加上最低件數規則，減少誤報
#' 同時要求當日至少 5 件。剩下的警示日是否落在 7/14–7/22 熱浪期間？這就是敏感度與特異度在監測系統中的取捨。
w[which(w$heat_calls > w$threshold & w$heat_calls >= 5), c("date", "tmax", "heat_calls", "threshold")]
