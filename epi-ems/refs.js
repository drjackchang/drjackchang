// 每週的教科書對應章節與文獻證據
// 教科書：G = Gordis《流行病學》第 5 版中譯（高上淨、林庭均譯，藝軒）；S = 史麗珠《流行病學原理》二版（雙葉書廊，2022）
window.TEXTBOOKS = {
  G: { name: "Gordis《流行病學》第 5 版中譯（高上淨、林庭均譯）", url: "https://www.yihsient.com.tw/m/2001-1972-205309,c6830-1.php" },
  S: { name: "史麗珠《流行病學原理》二版（雙葉書廊，2022）", url: "https://www.books.com.tw/products/0010924835" }
};
window.WEEK_REFS = {
  1: { G: "第 1 章 導論", S: "第 1 章 流行病學概論；第 8 章 描述性流行病學（人、時、地）", ext: "",
    refs: [
      { cite: "Gräsner JT, et al. Survival after out-of-hospital cardiac arrest in Europe — results of the EuReCa TWO study. Resuscitation. 2020;148:218–226.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Survival+after+out-of-hospital+cardiac+arrest+in+Europe+Results+of+the+EuReCa+TWO+study", uses: "以人、時、地描述 28 國 OHCA 的發生率與存活率，是 EMS 描述流行病學的典型例子。" },
      { cite: "Ambulance Victoria. Annual Report 2024–25.", url: "https://www.ambulance.vic.gov.au/sites/default/files/2025-10/Ambulance-Victoria-Annual-Report-2024-2025.pdf", uses: "系統層級的案件量、反應時間等指標，練習分辨每個指標的分子與分母。" } ] },
  2: { G: "無專章（資料來源散見第 3、17 章）", S: "第 7 章 衛生醫療數據（抽樣、公衛監測、數據特性）", ext: "Utstein 範本與 EQUATOR 報告指引為補充教材。",
    refs: [
      { cite: "Bray JE, et al. Cardiac Arrest and Cardiopulmonary Resuscitation Outcome Reports: 2024 Update of the Utstein Out-of-Hospital Cardiac Arrest Registry Template. Circulation. 2024.", url: "https://professional.heart.org/en/guidelines-statements/cardiac-arrest-and-cardiopulmonary-resuscitation-outcome-reports-2024-update-ofcir0000000000001243", uses: "OHCA 登錄的核心變項與統一定義，是本課 ohca.csv 的設計依據。" },
      { cite: "Benchimol EI, et al. The REporting of studies Conducted using Observational Routinely-collected health Data (RECORD) statement. PLoS Med. 2015;12:e1001885.", url: "https://pubmed.ncbi.nlm.nih.gov/26440803/", uses: "使用救護紀錄、健保、登錄等例行收集資料的研究應報告哪些項目。" },
      { cite: "Kiguchi T, et al. Out-of-hospital cardiac arrest across the World: first report from the ILCOR Research Registry. Resuscitation. 2020;152:39–49.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Out-of-hospital+cardiac+arrest+across+the+World%3A+First+report+from+the+International+Liaison+Committee+on+Resuscitation", uses: "以 Utstein 定義比較各國登錄資料，示範定義不一致時如何比較。" } ] },
  3: { G: "第 2 章 疾病傳播的動力學", S: "第 2 章 疾病自然史、三段五級防治；第 9 章 致病模式與因果關係", ext: "Haddon 矩陣（傷害流行病學）與災害管理循環為延伸。",
    refs: [
      { cite: "Runyan CW. Using the Haddon matrix: introducing the third dimension. Inj Prev. 1998;4:302–307.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1730420", uses: "說明 Haddon 矩陣的事前、事中、事後 × 宿主、媒介、環境如何用來規劃傷害預防。" },
      { cite: "Experience of distributing 499 burn casualties of the June 28, 2015 Formosa Color Dust Explosion in Taiwan. Burns.", url: "https://scholar.nycu.edu.tw/zh/publications/experience-of-distributing-499-burn-casualties-of-the-june-28-201/", uses: "八仙塵爆的傷患分流經驗，可拆解成 Haddon 矩陣的「事後」介入。" },
      { cite: "Utstein-Style Template for Uniform Data Reporting of Acute Medical Response in Disasters. PLoS Curr Disasters.", url: "https://currents.plos.org/disasters/article/utstein-style-template-for-uniform-data-reporting-of-acute-medical-response-in-disasters/index.html", uses: "災難醫療應變的統一記錄項目，對應災害管理循環的應變階段。" } ] },
  4: { G: "第 3 章 疾病的發生 I：疾病監測與罹病率測量方法", S: "第 4 章 健康事件的量化指標（比、比例、率）；第 7 章 公衛監測", ext: "",
    refs: [
      { cite: "Victorian Ambulance Cardiac Arrest Registry. VACAR Annual Report 2023–24.", url: "https://ambulance.vic.gov.au/sites/default/files/2025-04/VACAR-Annual-Report-2023-2024.pdf", uses: "以每十萬人口發生率報告 OHCA（114／10 萬），並逐年監測趨勢。" },
      { cite: "Kiguchi T, et al. Out-of-hospital cardiac arrest across the World. Resuscitation. 2020;152:39–49.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Out-of-hospital+cardiac+arrest+across+the+World%3A+First+report+from+the+International+Liaison+Committee+on+Resuscitation", uses: "各國 OHCA 發生率的比較，說明分子分母定義的影響。" },
      { cite: "Utility of 911 ambulance dispatch data for the syndromic surveillance of heat-related illness in Toronto, Ontario, 2002–2005（研討會摘要）.", url: "https://knowledgerepository.syndromicsurveillance.org/sites/default/files/2022-10/Utility_Of_911_Ambulance_Dispatch_Data_For_The_Syndromic_Surveillance_Of_Heat-Related_Illness_In_Toronto_Ontario_2002-2005.pdf", uses: "以救護派遣資料做熱傷害症候群監測，與本週熱浪警示實作相同。" } ] },
  5: { G: "第 4 章 疾病的發生 II：死亡事件與疾病影響的測量", S: "第 5 章 生命統計指標及死亡率的年齡標準化", ext: "超額死亡為延伸。",
    refs: [
      { cite: "Kishore N, et al. Mortality in Puerto Rico after Hurricane Maria. N Engl J Med. 2018;379:162–170.", url: "https://doi.org/10.1056/NEJMsa1803972", uses: "以家戶調查估計超額死亡約 4,645 人，對照官方 64 人。" },
      { cite: "Santos-Burgoa C, et al. Differential and persistent risk of excess mortality from Hurricane Maria in Puerto Rico: a time-series analysis. Lancet Planet Health. 2018.", url: "https://doaj.org/article/ae7fc955cea44f89abc80d9616592ae7", uses: "以時間序列模型估計預期死亡，與本週 Poisson 模型做法相同。" },
      { cite: "Victorian State Trauma Registry. Annual Report 2023–24.", url: "https://www.monash.edu/__data/assets/pdf_file/0005/4417637/VSTR_AnnualReport_23-24_D4.pdf", uses: "報告粗死亡率與風險校正死亡，說明標準化的用途。" } ] },
  6: { G: "第 5 章 評估診斷與篩檢試驗的效度與信度；第 18 章 評估篩檢計畫", S: "第 3 章 疾病篩檢（信度、效度、預測、多重篩檢）", ext: "",
    refs: [
      { cite: "Newgard CD, et al. National Guideline for the Field Triage of Injured Patients: Recommendations of the National Expert Panel on Field Triage, 2021. J Trauma Acute Care Surg. 2022.", url: "https://asprtracie.hhs.gov/technical-resources/resource/11940/national-guideline-for-the-field-triage-of-injured-patients-recommendations-of-the-national-expert-panel-on-field-triage-2021", uses: "以不足檢傷與過度檢傷（敏感度、特異度）設定現場檢傷目標。" },
      { cite: "Bhalla MC, et al. Simple triage algorithm and rapid treatment and sort, assess, lifesaving interventions, treatment, and transportation mass casualty triage methods for sensitivity, specificity, and predictive values. Am J Emerg Med. 2015.", url: "https://ajemjournal.com/article/S0735-6757(15)00687-7/fulltext", uses: "比較 START 與 SALT 的敏感度、特異度與預測值。" },
      { cite: "Inter-rater reliability and agreement among mass-casualty incident algorithms using a pediatric trauma dataset: a pilot study. Prehosp Disaster Med.", url: "https://resolve.cambridge.org/core/journals/prehospital-and-disaster-medicine/article/abs/interrater-reliability-and-agreement-among-masscasualty-incident-algorithms-using-a-pediatric-trauma-dataset-a-pilot-study/D1A3F9705252F8559C6BB208B39E24DB", uses: "以 Kappa 評估大量傷病患檢傷的評估者間一致性。" } ] },
  7: { G: "第 6 章 疾病自然史：預後的表達方式", S: "無存活分析專章（第 13 章羅吉斯迴歸可補充）", ext: "Utstein 存活指標與 Cox 模型為補充。",
    refs: [
      { cite: "Gräsner JT, et al. EuReCa TWO. Resuscitation. 2020;148:218–226.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Survival+after+out-of-hospital+cardiac+arrest+in+Europe+Results+of+the+EuReCa+TWO+study", uses: "依 Utstein 報告 ROSC、存活出院與比較組存活率。" },
      { cite: "Predictors of early onset multiple organ dysfunction in major burn patients with ventilator support: experience from a mass casualty explosion. Sci Rep. 2018.", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6053465/", uses: "八仙塵爆重度燒傷世代的預後因子分析。" },
      { cite: "Victorian Ambulance Cardiac Arrest Registry. VACAR Annual Report 2023–24.", url: "https://ambulance.vic.gov.au/sites/default/files/2025-04/VACAR-Annual-Report-2023-2024.pdf", uses: "生存鏈與 Utstein 比較組存活率 41%。" } ] },
  8: { G: "第 1–6 章", S: "第 1–8 章", ext: "", refs: [] },
  9: { G: "第 11 章 風險評估：相關性存在嗎？；第 12 章 可歸因危險性：對預防的潛力之估計", S: "第 6 章 暴露與疾病的關連指標（危險比、勝算比、危險差、NNT）", ext: "",
    refs: [
      { cite: "Hasselqvist-Ax I, et al. Early cardiopulmonary resuscitation in out-of-hospital cardiac arrest. N Engl J Med. 2015;372:2307–2315.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Early+cardiopulmonary+resuscitation+in+out-of-hospital+cardiac+arrest+Hasselqvist-Ax", uses: "瑞典 OHCA 登錄：比較有無旁觀者 CPR 的 30 天存活，報告 OR 與存活率差。" },
      { cite: "Global Resuscitation Alliance. Acting on the Call 2018（中文版）.", url: "https://www.globalresuscitationalliance.org/wp-content/pdf/acting_on_the_call_2018_mandarin.pdf", uses: "以「可多救幾人」說明旁觀者 CPR 與派遣員指導 CPR 的族群效益。" } ] },
  10: { G: "第 14 章 相關性至因果關係：從流行病學研究推論", S: "第 9 章 致病模式與因果關係的邏輯思考（Mill 法則、因果判斷）", ext: "DAG 與目標試驗模擬為延伸。",
    refs: [
      { cite: "Pons PT, et al. Paramedic response time: does it affect patient survival? Acad Emerg Med. 2005.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Paramedic+response+time%3A+does+it+affect+patient+survival", uses: "反應時間與存活的觀察研究，說明嚴重度造成的干擾。" },
      { cite: "Hernán MA, Robins JM. Using big data to emulate a target trial when a randomized trial is not available. Am J Epidemiol. 2016;183:758–764.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Using+big+data+to+emulate+a+target+trial+when+a+randomized+trial+is+not+available", uses: "以登錄資料模擬隨機試驗的因果推論架構。" } ] },
  11: { G: "第 15 章 更多有關因果的推論：偏差、干擾與交互作用", S: "第 11 章 暴露與疾病關連結果的偏差；第 12 章 交互作用與混擾作用", ext: "",
    refs: [
      { cite: "Hasegawa K, et al. Association of prehospital advanced airway management with neurologic outcome and survival in patients with out-of-hospital cardiac arrest. JAMA. 2013;309:257–266.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Hasegawa+prehospital+advanced+airway+management+neurologic+outcome+JAMA+2013", uses: "日本全國登錄：進階氣道與較差預後相關，用來討論適應症干擾。" },
      { cite: "Andersen LW, et al. Resuscitation time bias — a unique challenge for observational cardiac arrest research. Resuscitation. 2018;125:79–82.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Resuscitation+time+bias+unique+challenge+observational+cardiac+arrest+research", uses: "說明復甦時間偏誤的機制與分析對策。" },
      { cite: "Knol MJ, VanderWeele TJ. Recommendations for presenting analyses of effect modification and interaction. Int J Epidemiol. 2012;41:514–520.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Recommendations+for+presenting+analyses+of+effect+modification+and+interaction", uses: "加成與相乘交互作用應如何報告。" } ] },
  12: { G: "第 10 章 病例對照與其他的研究設計", S: "第 10 章 分析性流行病學的研究設計（橫斷、病例對照）；第 7 章 抽樣方法", ext: "CASPER 為延伸。",
    refs: [
      { cite: "Chang YT, Hu YJ. Burnout and health issues among prehospital personnel in Taiwan fire departments during a sudden spike in community COVID-19 cases: a cross-sectional study. Int J Environ Res Public Health. 2022;19:2257.", url: "https://doi.org/10.3390/ijerph19042257", uses: "授課教師的橫斷研究：救護人員倦怠盛行率與相關因子。" },
      { cite: "Semenza JC, et al. Heat-related deaths during the July 1995 heat wave in Chicago. N Engl J Med. 1996;335:84–90.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Heat-related+deaths+during+the+July+1995+heat+wave+in+Chicago", uses: "經典配對病例對照：獨居、冷氣、社會接觸與熱浪死亡。" },
      { cite: "Barros AJ, Hirakata VN. Alternatives for logistic regression in cross-sectional studies. BMC Med Res Methodol. 2003;3:21.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Alternatives+for+logistic+regression+in+cross-sectional+studies", uses: "結果常見時應以 Poisson 或 log-binomial 迴歸估計 PR。" },
      { cite: "CDC. Community Assessment for Public Health Emergency Response (CASPER) Toolkit, 3rd ed.", url: "https://www.atsdr.cdc.gov/community-stress-resource-center/php/resources/casper-toolkit3.html", uses: "災後 30 × 7 兩階段群集抽樣的標準作業。" } ] },
  13: { G: "第 9 章 世代研究；第 10 章 病例對照（配對）；第 13 章 世代與病例對照研究之比較", S: "第 10 章 配對病例對照、世代研究、巢式病例對照", ext: "傾向分數為延伸。",
    refs: [
      { cite: "Galvagno SM Jr, et al. Association between helicopter vs ground emergency medical services and survival for adults with major trauma. JAMA. 2012;307:1602–1610.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Association+between+helicopter+vs+ground+emergency+medical+services+and+survival+for+adults+with+major+trauma", uses: "以創傷登錄世代與傾向分數配對比較直升機與地面轉送。" },
      { cite: "Austin PC. An introduction to propensity score methods for reducing the effects of confounding in observational studies. Multivariate Behav Res. 2011;46:399–424.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=An+introduction+to+propensity+score+methods+for+reducing+the+effects+of+confounding+in+observational+studies", uses: "傾向分數配對、卡尺與 SMD 平衡檢查的標準說明。" },
      { cite: "Ringdal KG, et al. The Utstein template for uniform reporting of data following major trauma. Scand J Trauma Resusc Emerg Med. 2008.", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2568949/", uses: "創傷登錄世代應收集的核心變項。" } ] },
  14: { G: "第 7 章 評估預防與治療措施：隨機試驗；第 8 章 隨機試驗：延伸議題", S: "第 14 章 實驗性流行病學（隨機分組、盲性、偏差）", ext: "中斷時間序列為延伸。",
    refs: [
      { cite: "Perkins GD, et al. A randomized trial of epinephrine in out-of-hospital cardiac arrest (PARAMEDIC2). N Engl J Med. 2018;379:711–721.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=A+randomized+trial+of+epinephrine+in+out-of-hospital+cardiac+arrest+Perkins", uses: "到院前雙盲 RCT：30 天存活與神經預後結論不同。" },
      { cite: "Wang HE, et al. Effect of a strategy of initial laryngeal tube insertion vs endotracheal intubation on 72-hour survival (PART). JAMA. 2018;320:769–778.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=initial+laryngeal+tube+insertion+vs+endotracheal+intubation+72-hour+survival", uses: "群集交叉隨機試驗設計。" },
      { cite: "Benger JR, et al. Effect of a strategy of a supraglottic airway device vs tracheal intubation (AIRWAYS-2). JAMA. 2018;320:779–791.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=supraglottic+airway+device+vs+tracheal+intubation+AIRWAYS-2", uses: "以救護人員為單位的群集隨機試驗。" },
      { cite: "Bernal JL, Cummins S, Gasparrini A. Interrupted time series regression for the evaluation of public health interventions: a tutorial. Int J Epidemiol. 2017;46:348–355.", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Interrupted+time+series+regression+for+the+evaluation+of+public+health+interventions+a+tutorial", uses: "分段迴歸估計水準與斜率變化的標準做法。" } ] },
  15: { G: "第 13 章 複習：世代與病例對照研究之比較", S: "第 10 章 研究設計比較", ext: "EQUATOR 報告指引為補充。",
    refs: [
      { cite: "EQUATOR Network（STROBE、STARD、CONSORT、RECORD 等報告指引）.", url: "https://www.equator-network.org/", uses: "文獻導讀時逐項比對的檢核表來源。" } ] },
  16: { G: "第 7–15 章", S: "第 6、9–14 章", ext: "", refs: [] },
  17: { G: "第 2 章 疾病傳播的動力學（攻擊率、突發事件調查）", S: "第 8 章 描述性流行病學", ext: "",
    refs: [
      { cite: "Yee EL, et al. Widespread outbreak of norovirus gastroenteritis among evacuees of Hurricane Katrina residing in a large \"megashelter\" in Houston, Texas. Clin Infect Dis. 2007.", url: "https://stacks.cdc.gov/view/cdc/188766", uses: "颶風避難所的諾羅病毒群聚調查，與本週情境相同。" },
      { cite: "CDC. Principles of Epidemiology in Public Health Practice, Lesson 6: Investigating an Outbreak.", url: "https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson6/section2.html", uses: "突發事件調查的標準步驟、病例定義與流行曲線。" } ] },
  18: { G: "第 3、4 章（率的計算）", S: "第 7 章 衛生醫療數據；第 13 章 卡方檢定與羅吉斯迴歸", ext: "",
    refs: [
      { cite: "NEMSIS. 2025 Public-Release Research Dataset.", url: "https://nemsis.org/?p=13666", uses: "美國全國 EMS 開放研究資料，可作為專題資料來源。" },
      { cite: "EM-DAT. The International Disaster Database — documentation.", url: "https://doc.emdat.be/", uses: "全球災難事件、死亡與受影響人數資料。" } ] }
};
