## ---- 讀入 2025 年北濱市救護出勤資料
#' 每一列是一次救護出勤。先看資料有幾筆、有哪些欄位——這就是「描述流行病學」的原料。
calls <- read.csv("data/ems_calls.csv")
dim(calls)
head(calls, 3)

## ---- 人（Who）：案件類別 × 性別、年齡
#' 不同類別的傷病患，年齡與性別組成差很多；OHCA 的病人明顯較老。
table(calls$category, calls$sex)
round(tapply(calls$age, calls$category, median), 1)

## ---- 時（When）：月份與時段
#' 熱傷害集中在夏季；全部案件則在白天到傍晚最多，深夜最少。
calls$month <- as.numeric(substr(calls$date, 6, 7))
table(calls$category[calls$category == "heat"], calls$month[calls$category == "heat"])
barplot(table(calls$hour), main = "EMS calls by hour of day, 2025",
        xlab = "Hour", ylab = "Calls", col = "#4a7fb5", border = NA)

## ---- 地（Where）：各區每千人出勤率
#' 只看件數會被人口多寡誤導，要除以人口變成「率」。
pop <- read.csv("data/population.csv")
pop_d <- tapply(pop$pop, pop$district, sum)
n_d <- table(calls$district)
rate <- round(n_d / pop_d[names(n_d)] * 1000, 1)
sort(rate, decreasing = TRUE)
