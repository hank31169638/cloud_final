# GitHub OAuth 設定教學 (使用 Supabase Auth)

## 🎯 功能說明

現在 Nexus AI 使用 **Supabase Auth + GitHub OAuth** 授權方式,讓使用者可以:
- ✅ 在 GitHub 授權頁面**選擇要分享的 Repository**(全部或特定幾個)
- ✅ 存取私有倉庫(如果使用者授權)
- ✅ 隨時從 GitHub 設定中撤銷授權
- ✅ **無需建立後端伺服器** - Supabase 會處理所有 OAuth 流程

---

## 📋 步驟 1: 建立 GitHub OAuth App

### 1.1 前往 GitHub Developer Settings
訪問: https://github.com/settings/developers

### 1.2 點擊 "New OAuth App"
或直接訪問: https://github.com/settings/applications/new

### 1.3 填寫應用程式資訊

⚠️ **重要**: Authorization callback URL 必須使用 Supabase 的 callback URL

```
Application name: Nexus AI X-Ops Platform
Homepage URL: http://localhost:5173
Authorization callback URL: https://rqjweigodbrsigtoidml.supabase.co/auth/v1/callback
Application description: AI Infrastructure X-Ops Mapping Platform
```

### 1.4 點擊 "Register application"

### 1.5 複製 Client ID 和 Client Secret
註冊完成後,頁面會顯示 **Client ID** 和 **Client Secret**
- 點擊 "Generate a new client secret" 來產生 Secret
- **保存這兩個值** - 等等要在 Supabase 中使用

---

## 📋 步驟 2: 設定 Supabase Authentication

### 2.1 前往 Supabase Dashboard
訪問: https://supabase.com/dashboard/project/rqjweigodbrsigtoidml/auth/providers

### 2.2 開啟 GitHub Provider
1. 找到 "GitHub" 選項
2. 開啟 "Enable Sign in with GitHub"

### 2.3 填入 OAuth 憑證
```
Client ID: (從步驟 1.5 複製的 Client ID)
Client Secret: (從步驟 1.5 複製的 Client Secret)
```

### 2.4 設定 Scopes (可選)
在 "Additional Scopes" 欄位填入:
```
repo read:user
```

### 2.5 點擊 "Save" 儲存設定

---

## ✅ 完成!無需後端伺服器

使用 Supabase Auth 的好處:
- ✅ **Supabase 會處理所有 OAuth 流程** (包括 token exchange)
- ✅ 不需要建立後端 API
- ✅ Client Secret 安全地儲存在 Supabase
- ✅ 自動處理 token 刷新

## 🎉 就是這麼簡單!

使用 Supabase Auth,您不需要:
- ❌ 建立後端伺服器
- ❌ 處理 token exchange
- ❌ 管理 Client Secret 安全性
- ❌ 處理 OAuth state parameter

所有這些都由 Supabase 自動處理!

---

## 🔄 完整使用流程

1. **開啟應用**: 訪問 http://localhost:5173
2. **點擊 "Sign in with GitHub"**: 
   - Supabase Auth 會導向 GitHub 授權頁面
3. **在 GitHub 授權頁面選擇 Repository**: 
   - 可以選擇 "All repositories" (所有倉庫)
   - 或 "Only select repositories" (只授權特定幾個)
4. **點擊 "Authorize"**: 
   - GitHub 會跳轉回 Supabase callback URL
   - Supabase 自動處理 token exchange
   - 然後導回您的應用程式
5. **自動載入授權的 Repository**: 
   - 應用程式使用 Supabase session 中的 `provider_token`
   - 顯示已授權的倉庫清單
6. **選擇專案並開始分析**: Dashboard 顯示專案資訊

---

## 🔐 安全性說明

- ✅ **Access Token** 儲存在 localStorage (僅限瀏覽器)
- ✅ **Client Secret** 只存在後端,絕不暴露在前端
- ✅ 使用者可隨時從 https://github.com/settings/applications 撤銷授權
- ✅ OAuth callback URL 限制只有授權的 domain 才能使用

---

## 🐛 常見問題除錯

### 問題: "Redirect URI mismatch"
**原因**: GitHub OAuth App 的 callback URL 設定錯誤  
**解決方法**: 
1. 前往 https://github.com/settings/developers
2. 確認 Authorization callback URL 是: `https://rqjweigodbrsigtoidml.supabase.co/auth/v1/callback`
3. **完全一致**,包含 https 和結尾沒有斜線

### 問題: "OAuth state parameter missing" 或跳到 localhost:3000
**原因**: 沒有正確設定 Supabase GitHub Provider  
**解決方法**:
1. 前往 Supabase Dashboard: https://supabase.com/dashboard/project/rqjweigodbrsigtoidml/auth/providers
2. 確認 GitHub Provider 已開啟
3. 確認填入了正確的 Client ID 和 Client Secret
4. 儲存設定後等待 1-2 分鐘讓變更生效

### 問題: 401 Unauthorized 當存取 repositories
**原因**: Token 可能已過期或 scope 不足  
**解決方法**: 
1. 點擊 "Logout" 按鈕
2. 重新登入
3. 確認 GitHub OAuth App 有 `repo` 和 `read:user` scopes

### 問題: 無法看到私有倉庫
**原因**: OAuth scopes 設定不正確  
**解決方法**:
1. 在 Supabase GitHub Provider 設定中的 "Additional Scopes" 填入: `repo read:user`
2. 重新授權

---

## 📚 參考資料

- [GitHub OAuth Apps 官方文件](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Authorizing OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub REST API](https://docs.github.com/en/rest)
