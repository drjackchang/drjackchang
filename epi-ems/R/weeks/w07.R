## ---- Utstein 流程：從全部 OHCA 到存活出院
#' 每往下一層，分母就換一次。對照 VACAR 年報的 Utstein 流程圖。
ohca <- read.csv("data/ohca.csv")
att  <- subset(ohca, resus_attempted == 1)
ut   <- subset(att, witness == "bystander" & rhythm == "shockable")
data.frame(step = c("All OHCA", "Resuscitation attempted", "Any ROSC", "Survived to discharge",
                    "Good neuro outcome (CPC 1-2)"),
           n = c(nrow(ohca), nrow(att), sum(att$any_rosc), sum(att$survived_discharge), sum(att$good_neuro)))
c(survival_attempted = round(mean(att$survived_discharge) * 100, 1),
  survival_utstein_comparator = round(mean(ut$survived_discharge) * 100, 1))

## ---- 存活率依初始心律
#' 可電擊心律的存活率是非可電擊的數倍——這是 OHCA 最強的預後因子。
round(tapply(att$survived_discharge, att$rhythm, mean) * 100, 1)

## ---- Kaplan–Meier：創傷登錄 30 天存活（手寫版）
#' 每個死亡時點：條件存活機率 = 1 − 死亡數 / 當時仍在追蹤的人數；累乘即 KM 存活曲線。設限者在離開後不再列入分母。
tr <- read.csv("data/trauma_registry.csv")
km <- function(time, event) {
  ut <- sort(unique(time[event == 1]))
  at_risk <- sapply(ut, function(u) sum(time >= u))
  died <- sapply(ut, function(u) sum(time == u & event == 1))
  data.frame(time = ut, n_risk = at_risk, n_event = died, surv = cumprod(1 - died / at_risk))
}
grp <- factor(tr$iss_group, levels = c("9-15", "16-24", "25-40", ">40"))
cols <- c("#4a7fb5", "#6aa84f", "#d9822b", "#c0504d")
plot(NA, xlim = c(0, 30), ylim = c(0, 1), xlab = "Days", ylab = "Survival",
     main = "Kaplan-Meier survival by ISS group")
for (i in seq_along(levels(grp))) {
  s <- km(tr$time_days[grp == levels(grp)[i]], tr$died[grp == levels(grp)[i]])
  lines(c(0, s$time), c(1, s$surv), type = "s", col = cols[i], lwd = 2)
}
legend("bottomleft", paste("ISS", levels(grp)), col = cols, lwd = 2, bty = "n")

## ---- 30 天存活率（KM 估計）
sapply(levels(grp), function(g) {
  s <- km(tr$time_days[grp == g], tr$died[grp == g]); round(tail(s$surv, 1), 3)
})

## ---- 進階：log-rank 與 Cox（需 survival 套件）
#' 在電腦 R 中可直接執行；瀏覽器版會嘗試自動安裝 survival。
library(survival)
survdiff(Surv(time_days, died) ~ iss_group, data = tr)
summary(coxph(Surv(time_days, died) ~ iss + age + gcs, data = tr))$conf.int
