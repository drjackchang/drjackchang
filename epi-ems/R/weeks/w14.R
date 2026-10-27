## ---- 隨機分派是否成功？基線特徵比較
#' 隨機分派後，兩組的已知與未知因子應該相近。
rct <- read.csv("data/paramedic_rct.csv")
aggregate(cbind(age, witnessed, shockable = rhythm == "shockable") ~ arm, data = rct, FUN = mean)

## ---- 意向分析（ITT）：30 天存活與好的神經預後
#' 依「分派的組別」分析，不管實際有沒有給藥。注意兩個結果的結論可能不同——這正是 PARAMEDIC2 引發討論的地方。
itt <- function(y) {
  t <- table(factor(rct$arm, c("adrenaline", "placebo")), factor(y, 1:0))
  r <- t[, 1] / rowSums(t); p <- prop.test(t[, 1], rowSums(t))$p.value
  round(c(risk_adrenaline = r[[1]] * 100, risk_placebo = r[[2]] * 100, RR = r[[1]] / r[[2]], p = p), 3)
}
rbind(survival_30d = itt(rct$survived_30d), good_neuro = itt(rct$good_neuro))

## ---- 依計畫分析（per-protocol）
#' 只分析有依分派接受處置的人。若不依從與預後有關，結果可能偏誤。
pp <- subset(rct, received_allocated == 1)
round(tapply(pp$survived_30d, pp$arm, mean) * 100, 2)

## ---- 中斷時間序列：派遣員指導 CPR 政策（2024 年 7 月上路）
#' 分段迴歸：t 為長期趨勢，post_policy 為政策後的「水準變化」，months_since 為「斜率變化」。
its <- read.csv("data/dacpr_its.csv")
fit <- glm(cbind(bystander_cpr, ohca_eligible - bystander_cpr) ~ t + post_policy + months_since,
           family = binomial, data = its)
round(exp(cbind(OR = coef(fit), confint.default(fit))), 3)

## ---- 圖：旁觀者 CPR 率與政策介入
its$rate <- its$bystander_cpr / its$ohca_eligible
plot(its$t, its$rate * 100, pch = 19, col = "#4a7fb5", xlab = "Month (2021-2025)",
     ylab = "Bystander CPR (%)", main = "Interrupted time series: dispatcher-assisted CPR")
lines(its$t, fitted(fit) * 100, col = "#c0504d", lwd = 2)
abline(v = its$t[its$post_policy == 1][1] - 0.5, lty = 2)
