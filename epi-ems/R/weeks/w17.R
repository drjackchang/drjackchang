## ---- 病例定義與攻擊率
#' 病例：9/3 晚餐後 72 小時內出現嘔吐或腹瀉的避難所住民。
so <- read.csv("data/shelter_outbreak.csv")
c(evacuees = nrow(so), cases = sum(so$ill), attack_rate = round(mean(so$ill), 3))

## ---- 流行曲線
#' 單一高峰、潛伏期集中在 24–48 小時：符合單一共同來源（point source），像諾羅病毒。
onset <- as.POSIXct(so$onset[so$ill == 1], tz = "Asia/Taipei")
hist(onset, breaks = "hours", freq = TRUE, col = "#4a7fb5", border = "white",
     main = "Epidemic curve: shelter gastroenteritis", xlab = "Onset (hour)", ylab = "Cases")
summary(as.numeric(difftime(onset, as.POSIXct("2025-09-03 18:00", tz = "Asia/Taipei"), units = "hours")))

## ---- 各餐點的食用者／未食用者攻擊率與 RR
#' 找出 RR 最大、且大多數病例都吃過的餐點。
foods <- c("bento", "egg_salad", "fried_chicken", "fruit", "tap_water")
res <- t(sapply(foods, function(f) {
  ar1 <- mean(so$ill[so[[f]] == 1]); ar0 <- mean(so$ill[so[[f]] == 0])
  c(AR_ate = ar1, AR_not = ar0, RR = ar1 / ar0, pct_cases_ate = mean(so[[f]][so$ill == 1]))
}))
round(res[order(-res[, "RR"]), ], 2)
