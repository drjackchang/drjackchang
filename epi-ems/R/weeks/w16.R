## ---- 期末複習 1：可歸因風險
#' 無旁觀者 CPR 的 OHCA 死亡風險 0.96，有 CPR 為 0.89。
r_exp <- .96; r_unexp <- .89
c(AR = r_exp - r_unexp, AR_percent = (r_exp - r_unexp) / r_exp)

## ---- 期末複習 2：生命表法 3 年存活
#' 180 位重度燒傷病人，各年度期初人數、死亡、設限如下（設限者視為追蹤半年）。
n0 <- c(180, 150, 120); deaths <- c(20, 12, 6); censored <- c(10, 18, 30)
eff <- n0 - censored / 2
q <- deaths / eff
data.frame(year = 1:3, at_risk = eff, q = round(q, 3), survival = round(cumprod(1 - q), 3))

## ---- 期末複習 3：兩位 EMT 檢傷一致性
#' 100 名傷患，兩人皆判紅 30、皆判非紅 50、A 紅 B 非紅 12、A 非紅 B 紅 8。
k <- matrix(c(30, 8, 12, 50), 2)
po <- sum(diag(k)) / 100; pe <- sum(rowSums(k) * colSums(k)) / 100^2
c(kappa = (po - pe) / (1 - pe))

## ---- 期末複習 4：交互作用
#' 兩因子皆無的發生率 3、只有 A 為 9、只有 B 為 15（每千人）。兩者皆有時，加成與相乘模式的預期值？
r00 <- 3; r10 <- 9; r01 <- 15
c(additive = r10 + r01 - r00, multiplicative = r10 * r01 / r00)
