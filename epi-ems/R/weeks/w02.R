## ---- 讀入 OHCA 登錄資料並對照 Utstein 變項
#' 先用 str() 檢查每個欄位的型態；這份資料的欄位名稱對應 Utstein 2024 核心變項。
ohca <- read.csv("data/ohca.csv")
str(ohca)

## ---- 遺漏值是「設計」還是「錯誤」？
#' 未施救（resus_attempted = 0）的個案，處置欄位本來就該是 NA；EMS 目擊者則沒有「旁觀者 CPR」。
colSums(is.na(ohca))
table(attempted = ohca$resus_attempted, cpr_missing = is.na(ohca$bystander_cpr))
table(witness = ohca$witness, cpr_missing = is.na(ohca$bystander_cpr))

## ---- 資料品質檢查：範圍與邏輯
#' 登錄資料清理的第一步：年齡、反應時間是否合理？存活者是否都有 ROSC？
summary(ohca$age)
summary(ohca$response_min)
with(subset(ohca, resus_attempted == 1), table(any_rosc, survived_discharge))

## ---- 同一個「存活率」，分母不同答案就不同
#' 臺北市以 ROSC 定義「急救成功」，Utstein 以存活出院為主要結果；分母可以是全部 OHCA 或只算有施救者。
att <- subset(ohca, resus_attempted == 1)
c(survival_all_ohca      = mean(ohca$survived_discharge),
  survival_attempted     = mean(att$survived_discharge),
  any_rosc_attempted     = mean(att$any_rosc))
