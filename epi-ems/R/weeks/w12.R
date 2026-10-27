## ---- 橫斷研究：救護人員倦怠盛行率
#' 盛行率 = 調查當下高倦怠者 ÷ 受訪者。
bs <- read.csv("data/burnout_survey.csv")
round(mean(bs$high_burnout) * 100, 1)

## ---- 盛行率比（PR）vs 盛行勝算比（POR）
#' 當結果很常見（> 10%）時，POR 會明顯高估 PR；橫斷研究應優先報告 PR。
tab <- table(exposure = factor(bs$high_covid_exposure, 1:0), burnout = factor(bs$high_burnout, 1:0))
tab
p1 <- tab[1, 1] / sum(tab[1, ]); p0 <- tab[2, 1] / sum(tab[2, ])
round(c(PR = p1 / p0, POR = (tab[1, 1] * tab[2, 2]) / (tab[1, 2] * tab[2, 1])), 2)
fit <- glm(high_burnout ~ high_covid_exposure + weekly_hours + sleep_hours, family = poisson, data = bs)
round(exp(coef(fit)), 2)   # 調整後 PR（點估計；正式報告需穩健標準誤）

## ---- CASPER：30 × 7 兩階段群集抽樣
#' 第一階段依戶數比例（PPS）抽 30 個街廓，第二階段每街廓隨機抽 7 戶；這個設計可自我加權，直接取平均即可。
cf <- read.csv("data/casper_frame.csv")
set.seed(1)
hh_per_block <- table(cf$block_id)
blk <- sample(as.numeric(names(hh_per_block)), 30, prob = hh_per_block)
smp <- do.call(rbind, lapply(blk, function(b) { x <- cf[cf$block_id == b, ]; x[sample(nrow(x), 7), ] }))
round(rbind(sample_estimate = colMeans(smp[, 3:6]), true_value = colMeans(cf[, 3:6])) * 100, 1)

## ---- 設計效應：群集抽樣比簡單隨機抽樣不精準多少？
#' 重複抽樣 500 次，比較兩種抽樣下「停電比例」估計值的變異數。停電在街廓內高度群聚，所以設計效應大。
set.seed(2)
est_cluster <- replicate(500, {
  b <- sample(as.numeric(names(hh_per_block)), 30, prob = hh_per_block)
  mean(unlist(lapply(b, function(k) sample(cf$no_power[cf$block_id == k], 7))))
})
est_srs <- replicate(500, mean(sample(cf$no_power, 210)))
round(c(DEFF_no_power = var(est_cluster) / var(est_srs)), 2)

## ---- 病例對照：熱浪死亡的危險因子（忽略配對）
#' 每位死亡者配對 2 位同區、年齡相近的對照。先用一般 2×2 算 OR。
hc <- read.csv("data/heat_casecontrol.csv")
sapply(c("living_alone", "has_ac", "top_floor", "daily_contact"), function(v) {
  t <- table(factor(hc[[v]], 1:0), factor(hc$case, 1:0)); round((t[1, 1] * t[2, 2]) / (t[1, 2] * t[2, 1]), 2)
})
