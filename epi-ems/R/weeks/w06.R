## ---- 現場檢傷指引 vs 重大創傷（ISS > 15）
#' 把「檢傷陽性」當作篩檢結果、「ISS > 15」當作金標準，做出 2×2 表。
tt <- read.csv("data/trauma_triage.csv")
tab <- table(triage = factor(tt$field_triage_pos, 1:0, c("pos", "neg")),
             major  = factor(tt$major_trauma, 1:0, c("yes", "no")))
tab

## ---- 敏感度、特異度、預測值、概似比
#' 不足檢傷 = 1 − 敏感度（重傷被送到一般醫院）；過度檢傷 = 1 − 特異度（輕傷占用創傷中心）。
a <- tab[1, 1]; b <- tab[1, 2]; c <- tab[2, 1]; d <- tab[2, 2]
sens <- a / (a + c); spec <- d / (b + d)
round(c(sensitivity = sens, specificity = spec, PPV = a / (a + b), NPV = d / (c + d),
        LR_pos = sens / (1 - spec), LR_neg = (1 - sens) / spec,
        undertriage = 1 - sens, overtriage = 1 - spec), 3)

## ---- 休克指數預測大量輸血：ROC 曲線
#' 每個切點都算一次敏感度與特異度，連起來就是 ROC。AUC 等於「隨機抽一位輸血者與一位非輸血者，前者休克指數較高的機率」。
cuts <- sort(unique(c(0, tt$shock_index, Inf)))
roc <- t(sapply(cuts, function(k) {
  pos <- tt$shock_index >= k
  c(cut = k, sens = mean(pos[tt$massive_transfusion == 1]), spec = mean(!pos[tt$massive_transfusion == 0]))
}))
plot(1 - roc[, "spec"], roc[, "sens"], type = "s", lwd = 2, col = "#4a7fb5",
     xlab = "1 - Specificity", ylab = "Sensitivity", main = "ROC: shock index for massive transfusion")
abline(0, 1, lty = 2, col = "grey60")
x1 <- tt$shock_index[tt$massive_transfusion == 1]; x0 <- tt$shock_index[tt$massive_transfusion == 0]
auc <- mean(outer(x1, x0, ">") + 0.5 * outer(x1, x0, "=="))
round(auc, 3)

## ---- 最佳切點：Youden 指數
youden <- roc[, "sens"] + roc[, "spec"] - 1
roc[which.max(youden), ]

## ---- 兩位 EMT 的 START 檢傷一致性：Cohen's Kappa
#' 觀察一致率會被「碰巧一致」灌水；Kappa 扣掉期望一致後再比。
ag <- read.csv("data/triage_agreement.csv")
lv <- c("green", "yellow", "red", "black")
k <- table(factor(ag$emt_a, lv), factor(ag$emt_b, lv))
k
po <- sum(diag(k)) / sum(k)
pe <- sum(rowSums(k) * colSums(k)) / sum(k)^2
round(c(observed = po, expected = pe, kappa = (po - pe) / (1 - pe)), 3)
