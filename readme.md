# 🍳 Hawkins Order Manager

A mobile-first order management app built for **Hawkins** cookware dealers. Browse the complete product catalog, build orders, generate bills with discount breakdowns, and view reference PDFs — all from your phone, **even offline**.

---

## 📱 Screenshots

| Catalog | Order | Bill | History |
|---------|-------|------|---------|
| Browse 300+ products by category | Review & edit selected items | Generate bills with MRP & discount | View saved PDFs locally |

---

## ✨ Features

- **📦 Full Product Catalog** — 300+ Hawkins products organized by category (Cookers, Cookware, Futura, Tri-Ply, Cast Iron, etc.)
- **🔍 Instant Search** — Filter products by name or product code
- **📋 Order Builder** — Add items by Box or Pieces with one-tap quantity controls
- **💸 Bill Generator** — Enter MRP & discount per item, auto-calculates final price & grand total
- **📄 Two Bill Modes**:
  - **View Bill PDF** — Clean bill with #, Product Name, Code, MRP, Final Price
  - **Bill (Discount)** — Detailed bill with #, Product Name, Code, MRP, Discount%, Final Price
- **📂 PDF Viewer** — View bundled PDFs (Price List, Cookware Images, Cooker Images) natively on Android
- **📥 PDF History** — All generated order/bill PDFs saved locally (IndexedDB) with optional Supabase cloud backup
- **➕ Custom Products** — Add unlisted products on the fly
- **📎 Attach PDFs** — Add your own reference PDFs to the app
- **📲 Offline-First** — Works without internet; data stored locally on device

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (mobile-first) |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **PDF Rendering** | pdf.js (canvas-based, in-app) |
| **Native Wrapper** | Capacitor 8 (Android) |
| **Native Plugins** | `@capacitor/filesystem`, `@capacitor-community/file-opener` |
| **Cloud Storage** | Supabase Storage (optional, for bill backup) |
| **Local Storage** | IndexedDB (offline PDF history) |

---

## 📁 Project Structure

```
hawkins app/
├── android/                  # Capacitor Android project
├── public/
│   └── pdf/                  # Bundled reference PDFs
│       ├── Pricelist .pdf
│       ├── COOKWARE IMAGES.pdf
│       └── COOKERS IMAGES .pdf
├── src/
│   ├── App.jsx               # Main app component (all UI + logic)
│   ├── main.jsx              # React entry point
│   ├── index.css             # All styles (mobile-first)
│   ├── nativePdf.js          # Native PDF save/open helpers (Capacitor)
│   ├── supabase.js           # Supabase client + cloud storage helpers
│   ├── idb.js                # IndexedDB helpers (offline PDF history)
│   ├── firebase.js           # Firebase config (legacy)
│   └── data/
│       └── parseProducts.js  # Markdown table → product array parser
├── data.md                   # Product catalog data (markdown tables)
├── capacitor.config.json     # Capacitor config (appId, webDir)
├── vite.config.js            # Vite build config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **Android Studio** (for building the APK)
- **Java 21** (required by Android Gradle)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Browser (Development)
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Android
```bash
npm run build
npx cap sync android
npx cap open android
```
Then in Android Studio: **Build → Build Bundle/APK → Build APK(s)**

### 4. Quick APK Build (Command Line)
```bash
npm run build
npx cap sync android
cd android
./gradlew.bat assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 Installing on Another Phone

1. Build the APK using either method above
2. Transfer `app-debug.apk` to the target phone (via WhatsApp, Drive, USB, etc.)
3. On the phone, open the APK and tap **Install**
4. Enable **"Install from unknown sources"** if prompted

---

## 🔧 Configuration

### Supabase (Optional)
Cloud bill backup is configured in `src/supabase.js`. To use your own Supabase instance:
1. Create a Supabase project
2. Create a storage bucket called `bills`
3. Update the `supabaseUrl` and `supabaseAnonKey` in `src/supabase.js`

### Product Catalog
All product data lives in `data.md` as markdown tables. Edit this file to update products, prices, or categories. The app parses it automatically at build time.

---

## 📄 License

Private — Built for Hawkins dealer use.
