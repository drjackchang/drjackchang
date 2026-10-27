## ---- 2×2 表：旁觀者 CPR × 存活出院
#' 分析對象：有施救、且非 EMS 目擊的 OHCA（EMS 目擊者不會有旁觀者 CPR）。
ohca <- read.csv("data/ohca.csv")
d <- subset(ohca, resus_attempted == 1 & witness != "ems")
tab <- table(cpr = factor(d$bystander_cpr, 1:0, c("yes", "no")),
             survived = factor(d$survived_discharge, 1:0, c("yes", "no")))
tab

## ---- RR、OR、RD、AR%、PAF、NNT
#' PAF 回答政策問題：如果「沒有人缺少旁觀者 CPR」，全市 OHCA 死亡可以少多少比例？這裡把「沒有 CPR」視為暴露、「死亡」視為結果。
a <- tab[1, 1]; b <- tab[1, 2]; c <- tab[2, 1]; d0 <- tab[2, 2]
r1 <- a / (a + b); r0 <- c / (c + d0)
RR <- r1 / r0; OR <- (a * d0) / (b * c); RD <- r1 - r0
se_logRR <- sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d0))
se_logOR <- sqrt(1 / a + 1 / b + 1 / c + 1 / d0)
est <- rbind(RR = c(RR, exp(log(RR) + c(-1.96, 1.96) * se_logRR)),
             OR = c(OR, exp(log(OR) + c(-1.96, 1.96) * se_logOR)))
colnames(est) <- c("estimate", "lower95", "upper95")
round(est, 2)
round(c(risk_cpr = r1, risk_no_cpr = r0, RD = RD, NNT = 1 / RD), 3)

## ---- 以「死亡」為結果的可歸因風險
#' 暴露 = 沒有旁觀者 CPR。AR% = 暴露者的死亡中有多少比例歸因於暴露；PAF 擴及全體。
m1 <- 1 - r0; m0 <- 1 - r1          # 死亡風險：無 CPR、有 CPR
deaths_noCPR <- tab[2, 2]; deaths_all <- sum(tab[, 2])
RR_death <- m1 / m0
c(AR_percent = (RR_death - 1) / RR_death,
  PAF = (deaths_noCPR / deaths_all) * (RR_death - 1) / RR_death)
