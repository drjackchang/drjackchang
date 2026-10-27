## ---- 現場創傷資料：受傷機轉 × 年齡
#' Haddon 矩陣的「事前—宿主」格：誰在什麼情境下受傷？年輕人以機車為主，老年人以平地跌倒為主。
tt <- read.csv("data/trauma_triage.csv")
tt$age_group <- cut(tt$age, c(15, 44, 64, 120), labels = c("16-44", "45-64", "65+"))
round(prop.table(table(tt$age_group, tt$mechanism), 1) * 100, 1)

## ---- 「事中」：不同機轉的嚴重度
#' 同樣叫創傷，行人被撞與高處墜落的重大創傷（ISS > 15）比例遠高於平地跌倒。
sort(round(tapply(tt$major_trauma, tt$mechanism, mean) * 100, 1), decreasing = TRUE)

## ---- 「事前—環境」：創傷出勤的時段
#' 創傷出勤在上下班尖峰時段升高，是道路環境與交通量的線索。
calls <- read.csv("data/ems_calls.csv")
tra <- subset(calls, category == "trauma")
barplot(table(tra$hour), main = "Trauma calls by hour", xlab = "Hour",
        ylab = "Calls", col = "#c0504d", border = NA)
