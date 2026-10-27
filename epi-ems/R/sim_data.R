# =============================================================
# 流行病學方法論（EMS／災難數據版）— 模擬資料產生器
# 虛構城市「北濱市 Beibin City」，6 個行政區，約 60 萬人
# 所有資料皆為教學用模擬資料，不代表任何真實個人或機構
# 執行：Rscript R/sim_data.R   （輸出至 data/）
# =============================================================
set.seed(20270225)
out <- "data"
dir.create(out, showWarnings = FALSE)
wcsv <- function(x, f) write.csv(x, file.path(out, f), row.names = FALSE, fileEncoding = "UTF-8")
inv_logit <- function(x) 1 / (1 + exp(-x))

# -------------------------------------------------------------
# 1. 人口資料 population.csv（行政區 × 年齡組 × 性別）
# -------------------------------------------------------------
districts <- c("Central", "Harbor", "Hill", "River", "Industrial", "NewTown")
rural     <- c(Central = 0, Harbor = 1, Hill = 1, River = 0, Industrial = 0, NewTown = 0)
total_pop <- c(Central = 150000, Harbor = 70000, Hill = 45000, River = 120000,
               Industrial = 90000, NewTown = 125000)
agegrp <- c("0-14", "15-44", "45-64", "65-74", "75+")
age_lo <- c(0, 15, 45, 65, 75); age_hi <- c(14, 44, 64, 74, 95)
# 年齡結構：鄉村區（Harbor, Hill）較老，NewTown 較年輕
age_mix <- list(
  Central    = c(.12, .40, .28, .11, .09),
  Harbor     = c(.09, .30, .30, .16, .15),
  Hill       = c(.08, .27, .31, .17, .17),
  River      = c(.12, .39, .28, .12, .09),
  Industrial = c(.13, .43, .28, .10, .06),
  NewTown    = c(.17, .46, .25, .08, .04))
population <- do.call(rbind, lapply(districts, function(d) {
  n_age <- round(total_pop[d] * age_mix[[d]])
  data.frame(district = d, rural = unname(rural[d]), age_group = rep(agegrp, each = 2),
             sex = rep(c("M", "F"), 5),
             pop = as.vector(rbind(round(n_age * c(.50, .50, .49, .47, .43)),
                                   n_age - round(n_age * c(.50, .50, .49, .47, .43)))))
}))
rownames(population) <- NULL
wcsv(population, "population.csv")

# 2025 年中標準人口（全市合計，供直接標準化）
std_pop <- aggregate(pop ~ age_group, population, sum)

# -------------------------------------------------------------
# 2. 每日氣溫與救護出勤 ems_calls.csv（2025 全年，個案層級）
# -------------------------------------------------------------
dates <- seq(as.Date("2025-01-01"), as.Date("2025-12-31"), by = "day")
doy <- as.numeric(format(dates, "%j"))
tmax <- 26 + 7 * sin(2 * pi * (doy - 110) / 365) + rnorm(length(dates), 0, 1.3)
heatwave <- dates >= as.Date("2025-07-14") & dates <= as.Date("2025-07-22")
tmax[heatwave] <- tmax[heatwave] + runif(sum(heatwave), 3, 5)
tmax <- round(tmax, 1)
weather <- data.frame(date = dates, tmax = tmax)

pop_d <- tapply(population$pop, population$district, sum)
calls <- list()
for (i in seq_along(dates)) {
  for (d in districts) {
    base <- pop_d[d] / 1000 * 62 / 365            # 約每千人每年 62 件
    dow <- as.numeric(format(dates[i], "%u"))
    lam_med  <- base * 0.55 * ifelse(dow >= 6, 1.05, 1) * (1 + 0.15 * (rural[d]))
    lam_tra  <- base * 0.28 * ifelse(dow >= 6, 1.15, 1)
    lam_heat <- base * 0.004 * exp(0.32 * pmax(tmax[i] - 30, 0))
    lam_ohca <- base * 0.012 * (1 + 0.6 * rural[d])
    lam_oth  <- base * 0.10
    n <- rpois(5, c(lam_med, lam_tra, lam_heat, lam_ohca, lam_oth))
    cat_v <- rep(c("medical", "trauma", "heat", "ohca", "other"), n)
    if (length(cat_v) == 0) next
    calls[[length(calls) + 1]] <- data.frame(date = dates[i], district = d, category = cat_v)
  }
}
ems_calls <- do.call(rbind, calls)
N <- nrow(ems_calls)
ems_calls$call_id <- sprintf("C25%06d", seq_len(N))
ems_calls$hour <- sample(0:23, N, replace = TRUE,
                         prob = c(2,1.5,1.2,1,1,1.3,2.5,4,5,5.5,5.5,5.5,5,5,5,5,5.2,5.5,5.5,5,4.5,4,3.5,2.8))
ems_calls$age <- with(ems_calls, round(ifelse(category == "trauma", rgamma(N, 4, 0.09),
                    ifelse(category == "heat", rnorm(N, 58, 18),
                    ifelse(category == "ohca", rnorm(N, 72, 14), rgamma(N, 6, 0.1))))))
ems_calls$age <- pmin(pmax(ems_calls$age, 0), 99)
ems_calls$sex <- ifelse(runif(N) < ifelse(ems_calls$category %in% c("trauma", "heat"), .62, .52), "M", "F")
ems_calls$response_min <- round(rlnorm(N, log(ifelse(rural[ems_calls$district] == 1, 10.5, 6.8)) +
                         ifelse(ems_calls$hour %in% 7:9 | ems_calls$hour %in% 17:19, 0.12, 0), 0.38), 1)
ems_calls$transported <- rbinom(N, 1, ifelse(ems_calls$category == "other", .45, .82))
ems_calls <- merge(ems_calls, weather, by = "date")
ems_calls <- ems_calls[order(ems_calls$date, ems_calls$call_id),
                       c("call_id", "date", "hour", "district", "category", "age", "sex",
                         "response_min", "transported", "tmax")]
wcsv(ems_calls, "ems_calls.csv")
wcsv(weather, "weather_2025.csv")

# -------------------------------------------------------------
# 3. OHCA 登錄 ohca.csv（2023–2025，Utstein 變項）
#    設計重點：
#    - 年齡別發生率相同（Hill 稍高 10%）→ 粗率差異主要來自年齡結構（W5 標準化）
#    - 鄉村區：反應時間長、旁觀者 CPR 低 → 反應時間與存活的干擾（W10）
#    - 公共場所：較年輕、較多可電擊、較多 CPR → 旁觀者 CPR 粗 OR 高估（W9, W11）
#    - 早期 ROSC 者復甦時間短、多用 BVM → 進階氣道的適應症干擾（W11）
# -------------------------------------------------------------
age_rate <- c(.03, .12, .80, 2.4, 6.5) / 1000   # 每人年發生率（含未施救）
ohca_list <- list()
for (yr in 2023:2025) for (k in seq_len(nrow(population))) {
  r <- population[k, ]
  g <- match(r$age_group, agegrp)
  lam <- r$pop * age_rate[g] * ifelse(r$sex == "M", 1.25, 0.8) * ifelse(r$district == "Hill", 1.10, 1)
  n <- rpois(1, lam)
  if (n > 0) ohca_list[[length(ohca_list) + 1]] <-
    data.frame(year = yr, district = r$district, rural = r$rural, sex = r$sex,
               age = sample(age_lo[g]:age_hi[g], n, replace = TRUE))
}
oh <- do.call(rbind, ohca_list)
n <- nrow(oh)
oh$id <- sprintf("OH%05d", seq_len(n))
oh$location <- sample(c("home", "public", "nursing_home"), n, TRUE, prob = c(.68, .18, .14))
oh$location[oh$age < 50 & runif(n) < .25] <- "public"
oh$location[oh$age < 60 & oh$location == "nursing_home"] <- "home"
# 是否施救（明顯死亡徵象者不施救）
oh$resus_attempted <- rbinom(n, 1, ifelse(oh$location == "nursing_home", .55, .72))
oh$witness <- sample(c("none", "bystander", "ems"), n, TRUE, prob = c(.50, .42, .08))
oh$witness[oh$location == "public" & oh$witness == "none" & runif(n) < .6] <- "bystander"
oh$dispatcher_cpr <- rbinom(n, 1, .55)
p_cpr <- inv_logit(-0.9 + 1.4 * (oh$location == "public") + 0.5 * (oh$witness == "bystander") -
                   0.7 * oh$rural + 0.9 * oh$dispatcher_cpr - 0.01 * (oh$age - 70) +
                   0.35 * (oh$year - 2023))
oh$bystander_cpr <- ifelse(oh$witness == "ems", NA, rbinom(n, 1, p_cpr))
oh$public_aed <- ifelse(oh$location == "public" & oh$witness != "ems", rbinom(n, 1, .22), 0)
oh$response_min <- round(rlnorm(n, log(ifelse(oh$rural == 1, 10.2, 6.6)), 0.33), 1)
oh$response_min[oh$witness == "ems"] <- 0
p_shock <- inv_logit(-1.6 + 0.9 * (oh$location == "public") + 0.6 * (oh$witness != "none") -
                     0.025 * (oh$age - 65) + 0.5 * ifelse(is.na(oh$bystander_cpr), 0, oh$bystander_cpr) -
                     0.04 * oh$response_min)
oh$rhythm <- ifelse(rbinom(n, 1, p_shock) == 1, "shockable", "nonshockable")
# 早期 ROSC（潛在變項）
cpr0 <- ifelse(is.na(oh$bystander_cpr), 0, oh$bystander_cpr)
lp <- -3.0 + 1.6 * (oh$rhythm == "shockable") + 0.7 * (oh$witness == "bystander") +
      1.3 * (oh$witness == "ems") + 0.75 * cpr0 + 0.25 * cpr0 * (oh$witness == "bystander") +
      0.6 * oh$public_aed - 0.075 * oh$response_min - 0.018 * (oh$age - 65)
early_rosc <- rbinom(n, 1, inv_logit(lp))
oh$resus_duration_min <- round(ifelse(early_rosc == 1, rgamma(n, 4, 0.4), rgamma(n, 9, 0.3)))
oh$airway <- ifelse(early_rosc == 1,
                    sample(c("bvm", "sga", "eti"), n, TRUE, prob = c(.70, .22, .08)),
                    sample(c("bvm", "sga", "eti"), n, TRUE, prob = c(.25, .45, .30)))
oh$adrenaline <- ifelse(oh$rhythm == "nonshockable" | early_rosc == 0, rbinom(n, 1, .8), rbinom(n, 1, .35))
late_rosc <- ifelse(early_rosc == 0, rbinom(n, 1, .10), 0)
oh$rosc_prehosp <- pmax(early_rosc, late_rosc)
oh$any_rosc <- pmax(oh$rosc_prehosp, ifelse(oh$rosc_prehosp == 0, rbinom(n, 1, .08), 0))
p_surv <- ifelse(early_rosc == 1, inv_logit(0.3 - 0.03 * (oh$age - 65) + 0.6 * (oh$rhythm == "shockable") - 0.9 * oh$rural),
                 ifelse(late_rosc == 1, .08, ifelse(oh$any_rosc == 1, .03, 0)))
oh$survived_discharge <- rbinom(n, 1, p_surv)
oh$good_neuro <- ifelse(oh$survived_discharge == 1, rbinom(n, 1, ifelse(early_rosc == 1, .78, .35)), 0)
# 未施救者：結果皆為死亡、處置欄位為 NA
na_cols <- c("dispatcher_cpr", "bystander_cpr", "public_aed", "rhythm", "resus_duration_min",
             "airway", "adrenaline", "rosc_prehosp", "any_rosc")
for (cc in na_cols) oh[oh$resus_attempted == 0, cc] <- NA
oh$survived_discharge[oh$resus_attempted == 0] <- 0
oh$good_neuro[oh$resus_attempted == 0] <- 0
oh$response_min[oh$resus_attempted == 0 & oh$witness == "ems"] <- 0
oh$age_group <- cut(oh$age, c(-1, 14, 44, 64, 74, 120), labels = agegrp)
ohca <- oh[, c("id", "year", "district", "rural", "age", "age_group", "sex", "location", "witness",
               "resus_attempted", "dispatcher_cpr", "bystander_cpr", "public_aed", "response_min",
               "rhythm", "airway", "adrenaline", "resus_duration_min", "rosc_prehosp", "any_rosc",
               "survived_discharge", "good_neuro")]
wcsv(ohca, "ohca.csv")

# -------------------------------------------------------------
# 4. 災後月死亡 disaster_mortality.csv（2016–2025，2024/9 颱風）
# -------------------------------------------------------------
mon <- seq(as.Date("2016-01-01"), as.Date("2025-12-01"), by = "month")
t <- seq_along(mon); m <- as.numeric(format(mon, "%m"))
pop_m <- round(585000 + 1500 * (t / 12))
mu <- exp(log(pop_m) + log(7.6 / 1000 / 12) + 0.003 * t / 12 * 12 / 12 +
          0.13 * cos(2 * pi * (m - 1) / 12) + 0.01 * t / 12)
typhoon <- as.Date("2024-09-01")
excess <- ifelse(mon == typhoon, 70, ifelse(mon == as.Date("2024-10-01"), 45,
          ifelse(mon == as.Date("2024-11-01"), 25, ifelse(mon == as.Date("2024-12-01"), 12, 0))))
deaths <- rpois(length(mon), mu) + rpois(length(mon), excess)
disaster_mortality <- data.frame(month = format(mon, "%Y-%m"), year = as.numeric(format(mon, "%Y")),
                                 month_num = m, population = pop_m, deaths = deaths,
                                 official_disaster_deaths = ifelse(mon == typhoon, 12, 0))
wcsv(disaster_mortality, "disaster_mortality.csv")

# -------------------------------------------------------------
# 5. 現場創傷檢傷 trauma_triage.csv（W6）
# -------------------------------------------------------------
n <- 1200
tt <- data.frame(id = sprintf("TR%04d", 1:n), age = round(pmin(pmax(rgamma(n, 4, .085), 16), 95)),
                 sex = ifelse(runif(n) < .64, "M", "F"))
tt$mechanism <- sample(c("motorcycle", "car", "pedestrian", "fall_high", "fall_low", "other"), n, TRUE,
                       prob = c(.38, .12, .08, .07, .25, .10))
sev <- rgamma(n, 1.3, .9) + 0.8 * (tt$mechanism %in% c("pedestrian", "fall_high")) +
       0.5 * (tt$mechanism == "car") + 0.01 * (tt$age - 40)
tt$iss <- pmin(75, pmax(1, round(exp(0.9 + 0.75 * sev + rnorm(n, 0, .45)))))
tt$major_trauma <- as.integer(tt$iss > 15)
shock <- rbinom(n, 1, inv_logit(-4.2 + 1.9 * sev / 1.5))
tt$sbp <- round(ifelse(shock == 1, rnorm(n, 86, 14), rnorm(n, 132, 18)))
tt$hr  <- round(ifelse(shock == 1, rnorm(n, 118, 15), rnorm(n, 88, 13)))
tt$rr  <- round(pmax(6, rnorm(n, 18 + 4 * shock + 1.5 * sev, 3.5)))
tt$gcs <- pmin(15, pmax(3, round(15 - rexp(n, 1 / (0.4 + 1.1 * sev)))))
tt$shock_index <- round(tt$hr / tt$sbp, 2)
tt$massive_transfusion <- rbinom(n, 1, inv_logit(-6.2 + 3.6 * tt$shock_index + 0.03 * tt$iss))
tt$field_triage_pos <- as.integer(tt$gcs <= 13 | tt$sbp < 90 | tt$rr < 10 | tt$rr > 29 |
                                  (tt$mechanism %in% c("fall_high", "pedestrian") & runif(n) < .7))
wcsv(tt, "trauma_triage.csv")

# ROC 小練習（沿用原 ROC 練習檔數值，改為休克指數 ×100）
roc_small <- data.frame(id = 1:10, massive_transfusion = c(1, 1, 1, 1, 1, 0, 0, 0, 0, 0),
                        shock_index_x100 = c(95, 88, 82, 75, 60, 65, 58, 42, 35, 20))
wcsv(roc_small, "roc_small.csv")

# START 檢傷一致性 triage_agreement.csv（W6）
cats <- c("green", "yellow", "red", "black")
truth <- sample(cats, 80, TRUE, prob = c(.45, .28, .20, .07))
rater <- function(tr) sapply(tr, function(x) {
  i <- match(x, cats)
  if (runif(1) < .80) x else cats[pmin(4, pmax(1, i + sample(c(-1, 1), 1)))]
})
wcsv(data.frame(patient = 1:80, emt_a = rater(truth), emt_b = rater(truth)), "triage_agreement.csv")

# -------------------------------------------------------------
# 6. 創傷登錄 trauma_registry.csv（W5, W7, W13）
#    兩家醫院；A 為重度級收治較重病人；HEMS 用於遠距與重傷
# -------------------------------------------------------------
n <- 2400
tr <- data.frame(id = sprintf("RG%05d", 1:n), age = round(pmin(pmax(rgamma(n, 4.2, .08), 16), 98)),
                 sex = ifelse(runif(n) < .63, "M", "F"))
tr$mechanism <- sample(c("motorcycle", "car", "pedestrian", "fall_high", "fall_low", "other"), n, TRUE,
                       prob = c(.36, .10, .08, .08, .30, .08))
tr$mechanism[tr$age >= 70 & runif(n) < .5] <- "fall_low"
tr$distance_km <- round(rgamma(n, 2.2, .09), 1)
tr$iss <- pmin(75, round(16 + rgamma(n, 1.4, .095)))
tr$iss <- ifelse(runif(n) < .30, sample(9:15, n, TRUE), tr$iss)
tr$gcs <- pmin(15, pmax(3, round(15 - rexp(n, 1 / (0.5 + 0.12 * (tr$iss - 9))))))
tr$sbp <- round(rnorm(n, 128 - 0.6 * (tr$iss - 16), 22))
p_hems <- inv_logit(-4.5 + 0.06 * tr$distance_km + 0.05 * (tr$iss - 16) - 0.12 * (tr$gcs - 15))
tr$transport <- ifelse(rbinom(n, 1, p_hems) == 1, "hems", "ground")
p_A <- inv_logit(-0.4 + 0.08 * (tr$iss - 20) + 1.5 * (tr$transport == "hems"))
tr$hospital <- ifelse(rbinom(n, 1, p_A) == 1, "A", "B")
tr$prehosp_min <- round(ifelse(tr$transport == "hems", 35 + 0.35 * tr$distance_km, 18 + 1.4 * tr$distance_km) +
                        rnorm(n, 0, 8))
tr$prehosp_min <- pmax(tr$prehosp_min, 8)
# 30 天死亡風險（指數存活時間模型）；HEMS 真實 HR = 0.80，兩院無差異
lin <- -9.9 + 0.085 * tr$iss + 0.035 * (tr$age - 50) - 0.20 * (tr$gcs - 15) - 0.012 * (tr$sbp - 120) +
       log(0.5) * (tr$transport == "hems")
rate <- exp(lin)
t_death <- rexp(n, rate) * ifelse(runif(n) < .55, 0.15, 1)  # 早期死亡集中
t_cens <- ifelse(runif(n) < .05, runif(n, 2, 30), 30)       # 5% 轉院失聯
tr$time_days <- round(pmin(t_death, t_cens, 30), 1)
tr$time_days[tr$time_days == 0] <- 0.1
tr$died <- as.integer(t_death <= pmin(t_cens, 30))
tr$iss_group <- cut(tr$iss, c(0, 15, 24, 40, 75), labels = c("9-15", "16-24", "25-40", ">40"))
tr$age_group <- cut(tr$age, c(0, 44, 64, 74, 120), labels = c("16-44", "45-64", "65-74", "75+"))
trauma_registry <- tr[, c("id", "hospital", "age", "age_group", "sex", "mechanism", "iss", "iss_group",
                          "gcs", "sbp", "distance_km", "transport", "prehosp_min", "time_days", "died")]
wcsv(trauma_registry, "trauma_registry.csv")

# -------------------------------------------------------------
# 7. 救護人員倦怠調查 burnout_survey.csv（W12 橫斷）
# -------------------------------------------------------------
n <- 650
bs <- data.frame(id = 1:n, age = round(rnorm(n, 36, 8)), sex = ifelse(runif(n) < .82, "M", "F"))
bs$years_service <- pmax(1, round(bs$age - 22 - runif(n, 0, 6)))
bs$shift <- sample(c("24on24off", "12h", "day"), n, TRUE, prob = c(.6, .3, .1))
bs$weekly_hours <- round(ifelse(bs$shift == "24on24off", rnorm(n, 78, 8), rnorm(n, 56, 8)))
bs$high_covid_exposure <- rbinom(n, 1, .45)
bs$sleep_hours <- round(rnorm(n, 6.1 - 0.4 * (bs$shift == "24on24off"), 0.9), 1)
bs$burnout_score <- round(pmin(100, pmax(0, 38 + 0.35 * (bs$weekly_hours - 60) + 9 * bs$high_covid_exposure -
                                          5 * (bs$sleep_hours - 6) + rnorm(n, 0, 15))))
bs$high_burnout <- as.integer(bs$burnout_score >= 50)
wcsv(bs, "burnout_survey.csv")

# -------------------------------------------------------------
# 8. 熱浪死亡配對病例對照 heat_casecontrol.csv（W12, W13）
# -------------------------------------------------------------
sets <- 110
hc <- list()
for (s in 1:sets) {
  age0 <- round(runif(1, 62, 92))
  repeat {
    m <- data.frame(set_id = s, age = age0 + sample(-2:2, 3, TRUE),
                    living_alone = rbinom(3, 1, .30), has_ac = rbinom(3, 1, .72),
                    top_floor = rbinom(3, 1, .22), daily_contact = rbinom(3, 1, .55),
                    chronic_disease = rbinom(3, 1, .5))
    lp <- -0.5 + 0.95 * m$living_alone - 1.25 * m$has_ac + 0.6 * m$top_floor - 0.7 * m$daily_contact +
          0.5 * m$chronic_disease
    pr <- exp(lp) / sum(exp(lp))
    ci <- sample(1:3, 1, prob = pr)
    m$case <- 0; m$case[ci] <- 1
    break
  }
  hc[[s]] <- m[order(-m$case), ]
}
heat_cc <- do.call(rbind, hc)
heat_cc$district <- rep(sample(districts, sets, TRUE), each = 3)
heat_cc <- heat_cc[, c("set_id", "case", "age", "district", "living_alone", "has_ac", "top_floor",
                       "daily_contact", "chronic_disease")]
wcsv(heat_cc, "heat_casecontrol.csv")

# -------------------------------------------------------------
# 9. 颱風後社區評估抽樣框架 casper_frame.csv（W12）
# -------------------------------------------------------------
blocks <- 150
cf <- list()
for (b in 1:blocks) {
  hh <- rpois(1, 38) + 5
  re_power <- rnorm(1, 0, 1.3); re_water <- rnorm(1, 0, 1.0)
  cf[[b]] <- data.frame(block_id = b, hh_id = 1:hh,
                        no_power = rbinom(hh, 1, inv_logit(-0.3 + re_power)),
                        no_water = rbinom(hh, 1, inv_logit(-1.4 + re_water)),
                        needs_medication = rbinom(hh, 1, .14),
                        injury_since_storm = rbinom(hh, 1, .05))
}
casper_frame <- do.call(rbind, cf)
wcsv(casper_frame, "casper_frame.csv")

# -------------------------------------------------------------
# 10. 腎上腺素 RCT paramedic_rct.csv（W14，PARAMEDIC2 啟發之模擬）
# -------------------------------------------------------------
n <- 8000
rct <- data.frame(id = 1:n, arm = sample(rep(c("adrenaline", "placebo"), n / 2)),
                  age = round(rnorm(n, 69, 15)), sex = ifelse(runif(n) < .64, "M", "F"))
rct$rhythm <- ifelse(runif(n) < .20, "shockable", "nonshockable")
rct$witnessed <- rbinom(n, 1, .6)
rct$received_allocated <- rbinom(n, 1, .96)   # 4% 未依分派給藥
eff <- ifelse(rct$arm == "adrenaline" & rct$received_allocated == 1, 1, 0)
p30 <- inv_logit(-4.15 + 0.32 * eff + 1.5 * (rct$rhythm == "shockable") + 0.4 * rct$witnessed - 0.02 * (rct$age - 69))
rct$survived_30d <- rbinom(n, 1, p30)
rct$good_neuro <- ifelse(rct$survived_30d == 1, rbinom(n, 1, ifelse(eff == 1, .70, .85)), 0)
wcsv(rct, "paramedic_rct.csv")

# 派遣員指導 CPR 政策 中斷時間序列 dacpr_its.csv（W14）
mon2 <- seq(as.Date("2021-01-01"), as.Date("2025-12-01"), by = "month")
k <- seq_along(mon2); post <- as.integer(mon2 >= as.Date("2024-07-01"))
since <- pmax(0, k - match(as.Date("2024-07-01"), mon2) + 1) * post
ohca_n <- rpois(length(k), 95 + 12 * cos(2 * pi * (k - 1) / 12))
p_its <- inv_logit(-0.75 + 0.006 * k + 0.55 * post + 0.01 * since)
dacpr_its <- data.frame(month = format(mon2, "%Y-%m"), t = k, post_policy = post, months_since = since,
                        ohca_eligible = ohca_n, bystander_cpr = rbinom(length(k), ohca_n, p_its))
wcsv(dacpr_its, "dacpr_its.csv")

# -------------------------------------------------------------
# 11. 避難所腸胃炎群聚 shelter_outbreak.csv（W17）
# -------------------------------------------------------------
n <- 164
so <- data.frame(id = 1:n, age = round(pmin(pmax(rnorm(n, 52, 22), 2), 93)),
                 sex = ifelse(runif(n) < .5, "M", "F"))
so$bento <- rbinom(n, 1, .88); so$egg_salad <- rbinom(n, 1, .46)
so$fried_chicken <- rbinom(n, 1, .55); so$fruit <- rbinom(n, 1, .62); so$tap_water <- rbinom(n, 1, .30)
p_ill <- ifelse(so$egg_salad == 1, .62, .07) + 0.04 * so$tap_water
so$ill <- rbinom(n, 1, pmin(p_ill, .95))
meal <- as.POSIXct("2025-09-03 18:00", tz = "Asia/Taipei")
inc <- ifelse(so$ill == 1, round(rlnorm(n, log(33), .35)), NA)
so$onset <- ifelse(so$ill == 1, format(meal + inc * 3600, "%Y-%m-%d %H:00"), NA)
so$vomiting <- ifelse(so$ill == 1, rbinom(n, 1, .75), 0)
so$diarrhea <- ifelse(so$ill == 1, rbinom(n, 1, .80), 0)
so$fever <- ifelse(so$ill == 1, rbinom(n, 1, .35), 0)
wcsv(so, "shelter_outbreak.csv")

cat("Done. Files:\n"); print(list.files(out))
