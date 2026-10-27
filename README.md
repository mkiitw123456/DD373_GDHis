# DD373 金價觀測

React + Vite 暗色系歷史查詢頁，部署於 Vercel；Firebase Realtime Database 保存按日版本化的公開金價紀錄。

## 使用

`npm ci`、`npm run dev`、`npm run build`、`npm test`。
日期輸入固定為台灣時間。套用起訖範圍、全部、縮放圖表及每日彙整都在瀏覽器本地計算。

## 資料與快取

- 首次進入下載 manifest 與每日資料，存入 IndexedDB。
- 再次進入立即顯示快取，再讀取小型 manifest；僅下載 hash 已變動的日期。
- 不使用 Firebase realtime listener，不定時輪詢；手動更新也只下載有變動的日期。
- Vercel API 對 manifest 快取 5 分鐘，瀏覽器 1 分鐘；每日資料以 SHA256 版本路徑提供不可變快取。
- 離線時保留上次資料，顯示更新失敗及最後紀錄時間；快取不可用時退回記憶體。
- 只發布時間及金／人民幣比值，不上傳 Discord webhook、商品帳號或本機私鑰。
- 不保證零流量或永久免費。首次訪問、清除快取和新資料仍有流量；公開讀取資料仍可能遭直接請求。

## Firebase 與本機同步

Vercel 設定 `FIREBASE_DATABASE_URL`。`firebase.rules.json` 僅開放指定公開資料路徑讀取，拒絕所有客戶端寫入。

本機 `sync.config.json`（已忽略）包含 databaseURL、serviceAccountPath、pythonPath 與可選 databasePath。
`node scripts/sync.mjs` 只讀 SQLite，按日匯出後原子更新 Firebase manifest 與有變動的日期。
`scripts/sync-loop.ps1` 每 5 分鐘同步，單一執行個體。憑證僅保留在本機，不能放進 public、Git 或 Vercel 前端。

`public/data` 是本機開發預覽資料，正式網站透過 `/api/data` 讀取 Firebase；匯出時以 SQLite 現存紀錄為準。原有 90 假單已由使用者確認並自來源資料庫移除。
