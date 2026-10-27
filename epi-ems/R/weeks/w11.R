## ---- 干擾：依目擊狀況分層的旁觀者 CPR OR
#' 目擊倒下者較常接受 CPR、也較容易存活。粗 OR 與分層後的 Mantel–Haenszel OR 差多少？
ohca <- read.csv("data/ohca.csv")
d <- subset(ohca, resus_attempted == 1 & witness != "ems")
arr <- table(cpr = factor(d$bystander_cpr, 1:0), surv = factor(d$survived_discharge, 1:0),
             witness = d$witness)
arr
or_fun <- function(t) (t[1, 1] * t[2, 2]) / (t[1, 2] * t[2, 1])
round(c(crude = or_fun(margin.table(arr, 1:2)),
        none = or_fun(arr[, , "none"]), bystander = or_fun(arr[, , "bystander"])), 2)
mantelhaen.test(arr)

## ---- 交互作用：加成 vs 相乘
#' 相乘尺度看 OR 是否一致；加成尺度看風險差是否一致。兩者的結論可能不同。
rd <- sapply(c("none", "bystander"), function(w) {
  t <- arr[, , w]; t[1, 1] / sum(t[1, ]) - t[2, 1] / sum(t[2, ])
})
round(rd, 3)
summary(glm(survived_discharge ~ bystander_cpr * witness, family = binomial, data = d))$coefficients

## ---- 適應症干擾：進階氣道看起來「有害」？
#' 粗分析中，ETI／SGA 的存活率遠低於 BVM。但沒有早期 ROSC 的病人才會被插管——這是復甦時間偏誤與適應症干擾。
round(tapply(d$survived_discharge, d$airway, mean) * 100, 1)
d$airway <- relevel(factor(d$airway), "bvm")
m1 <- glm(survived_discharge ~ airway, family = binomial, data = d)
m2 <- glm(survived_discharge ~ airway + resus_duration_min + rhythm + age + witness, family = binomial, data = d)
round(rbind(crude = exp(coef(m1))[-1], adjusted = exp(coef(m2))[2:3]), 2)

## ---- 圖：復甦時間與氣道選擇
boxplot(resus_duration_min ~ airway, data = d, col = c("#9fc5e8", "#f6b26b", "#e06666"),
        main = "Resuscitation duration by airway", ylab = "Minutes", xlab = "Airway")
