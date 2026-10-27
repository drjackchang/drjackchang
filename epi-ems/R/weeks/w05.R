## ---- 粗率比較：Hill 區 vs NewTown 區
#' Hill 區的粗 OHCA 發生率是 NewTown 的兩倍多——但 Hill 區老人多得多。
ohca <- read.csv("data/ohca.csv")
pop  <- read.csv("data/population.csv")
agegrp <- c("0-14", "15-44", "45-64", "65-74", "75+")
cases <- table(factor(ohca$district), factor(ohca$age_group, levels = agegrp))
popa  <- tapply(pop$pop, list(pop$district, factor(pop$age_group, levels = agegrp)), sum) * 3
crude <- rowSums(cases) / rowSums(popa) * 1e5
round(crude[c("Hill", "NewTown")], 1)

## ---- 直接標準化：套用全市年齡結構
#' 年齡別率 × 標準人口權重，再加總。標準化後差距大幅縮小——剩下的才是「真正」的差異。
std <- colSums(popa) / sum(popa)
asr <- (cases / popa) %*% std * 1e5
round(cbind(crude = crude, age_standardized = asr[, 1]), 1)

## ---- 間接標準化：各區的 SMR
#' 用全市年齡別率算出各區「預期」件數，SMR = 觀察 ÷ 預期。小區較適合用間接法。
ref_rate <- colSums(cases) / colSums(popa)
expected <- popa %*% ref_rate
smr <- rowSums(cases) / expected[, 1]
round(cbind(observed = rowSums(cases), expected = expected[, 1], SMR = smr), 2)

## ---- 颱風後的超額死亡
#' 官方只記錄 12 名直接死亡。用颱風前 8 年資料建立 Poisson 模型（含季節與趨勢）預測「沒有颱風時」的死亡數，觀察 − 預期 = 超額死亡。
dm <- read.csv("data/disaster_mortality.csv")
dm$t <- seq_len(nrow(dm))
dm$s1 <- sin(2 * pi * dm$month_num / 12); dm$c1 <- cos(2 * pi * dm$month_num / 12)
base <- subset(dm, month < "2024-09")
fit <- glm(deaths ~ t + s1 + c1 + offset(log(population)), family = poisson, data = base)
dm$expected <- predict(fit, newdata = dm, type = "response")
post <- subset(dm, month >= "2024-09" & month <= "2024-12")
post$excess <- post$deaths - post$expected
post[, c("month", "deaths", "expected", "excess", "official_disaster_deaths")]
sum(post$excess)

## ---- 圖：觀察 vs 預期死亡
plot(as.Date(paste0(dm$month, "-01")), dm$deaths, type = "l", col = "grey50",
     main = "Monthly deaths: observed vs expected", xlab = "", ylab = "Deaths")
lines(as.Date(paste0(dm$month, "-01")), dm$expected, col = "#4a7fb5", lwd = 2)
abline(v = as.Date("2024-09-01"), lty = 2, col = "#c0504d")
legend("topleft", c("Observed", "Expected", "Typhoon"), col = c("grey50", "#4a7fb5", "#c0504d"),
       lty = c(1, 1, 2), bty = "n")
