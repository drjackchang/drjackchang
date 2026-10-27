## ---- 反應時間與存活：粗分析
#' 每多 1 分鐘，存活的 OR 是多少？先不調整任何變項。
ohca <- read.csv("data/ohca.csv")
d <- subset(ohca, resus_attempted == 1 & witness != "ems")
crude <- glm(survived_discharge ~ response_min, family = binomial, data = d)
exp(cbind(OR = coef(crude), confint.default(crude)))[2, ]

## ---- 誰的反應時間比較長？
#' 鄉村區反應時間長，同時旁觀者 CPR 少、年齡較老——它同時影響「暴露」與「結果」，是干擾因子。
aggregate(cbind(response_min, bystander_cpr, age, survived_discharge) ~ rural, data = d, FUN = mean)

## ---- 依 DAG 選出的調整集
#' 假設 DAG：rural → response_min；rural → bystander_cpr → survival；age → survival；response_min → rhythm → survival。
#' 要估「反應時間的總效應」，調整 rural、age、location，但「不要」調整中介的初始心律（rhythm）。
adj <- glm(survived_discharge ~ response_min + rural + age + location, family = binomial, data = d)
over <- glm(survived_discharge ~ response_min + rural + age + location + rhythm, family = binomial, data = d)
round(rbind(crude = exp(coef(crude))[2], adjusted = exp(coef(adj))[2],
            adjusted_plus_mediator = exp(coef(over))[2]), 3)

## ---- 圖：反應時間分組的存活率
d$rt_group <- cut(d$response_min, c(0, 5, 7, 9, 12, 40))
barplot(tapply(d$survived_discharge, d$rt_group, mean) * 100, col = "#4a7fb5", border = NA,
        main = "Survival by EMS response time", xlab = "Response time (min)", ylab = "Survival (%)")
