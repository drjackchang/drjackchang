## ---- 配對病例對照：McNemar（每組取第一位對照）
#' 配對資料只有「不一致對」提供資訊；配對 OR = 病例有暴露、對照沒有 ÷ 病例沒有、對照有。
hc <- read.csv("data/heat_casecontrol.csv")
ca <- hc[hc$case == 1, ]; co <- hc[hc$case == 0, ]; co1 <- co[!duplicated(co$set_id), ]
pair <- table(case_ac = factor(ca$has_ac, 1:0), control_ac = factor(co1$has_ac[match(ca$set_id, co1$set_id)], 1:0))
pair
c(matched_OR = pair[1, 2] / pair[2, 1])
mcnemar.test(pair)

## ---- 條件式羅吉斯迴歸（使用全部 1:2 配對，需 survival 套件）
library(survival)
round(summary(clogit(case ~ living_alone + has_ac + top_floor + daily_contact + strata(set_id),
                     data = hc))$conf.int[, c(1, 3, 4)], 2)

## ---- 登錄式世代：直升機（HEMS）vs 地面救護的 30 天死亡
#' 粗分析中 HEMS 死亡率是地面救護的兩倍多——因為重傷、偏遠的病人才會叫直升機。
tr <- read.csv("data/trauma_registry.csv")
round(tapply(tr$died, tr$transport, mean) * 100, 1)
aggregate(cbind(iss, gcs, distance_km, age) ~ transport, data = tr, FUN = mean)

## ---- 傾向分數配對（1:1 最近鄰，caliper 0.05）
set.seed(3)
ps <- glm(I(transport == "hems") ~ iss + gcs + sbp + age + distance_km, family = binomial, data = tr)
tr$ps <- fitted(ps)
treated <- which(tr$transport == "hems"); pool <- which(tr$transport == "ground")
match_id <- sapply(sample(treated), function(i) {
  if (length(pool) == 0) return(NA)
  dist <- abs(tr$ps[pool] - tr$ps[i]); j <- which.min(dist)
  if (dist[j] > 0.05) return(NA)
  m <- pool[j]; pool <<- pool[-j]; m
})
ok <- !is.na(match_id)
matched <- tr[c(treated[ok], match_id[ok]), ]
c(pairs = sum(ok))

## ---- 配對後的平衡與結果
#' 標準化平均差（SMD）< 0.1 表示平衡良好。配對後再比較死亡率。
smd <- function(v, g) (mean(v[g]) - mean(v[!g])) / sqrt((var(v[g]) + var(v[!g])) / 2)
vars <- c("iss", "gcs", "sbp", "age", "distance_km")
round(rbind(before = sapply(vars, function(v) smd(tr[[v]], tr$transport == "hems")),
            after  = sapply(vars, function(v) smd(matched[[v]], matched$transport == "hems"))), 2)
round(tapply(matched$died, matched$transport, mean) * 100, 1)

## ---- 醫院表現比較：依 ISS 間接標準化
#' 對照 VSTR 年報的風險校正死亡：A 院粗死亡率較高，但收治的病人也較重。
grp <- tr$iss_group
ref <- tapply(tr$died, grp, mean)
sapply(c("A", "B"), function(h) {
  x <- tr[tr$hospital == h, ]
  c(crude = mean(x$died), SMR = sum(x$died) / sum(ref[x$iss_group]))
})
