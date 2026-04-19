# 🍳 Hawkins Order Manager

A mobile-first order management app built for **Hawkins** cookware dealers. Browse the complete product catalog, build orders, generate bills with discount breakdowns, track daily sales, and receive automated email notifications — all from your phone, **even offline**.

---

## ✨ Features

### 📦 Core Order & Billing
- **Full Product Catalog** — 300+ Hawkins products organized by category (Cookers, Cookware, Futura, Tri-Ply, Cast Iron, etc.)
- **Instant Search** — Filter products by name or product code
- **Order Builder** — Add items by Box or Pieces with one-tap quantity controls
- **Bill Generator** — Enter MRP & discount per item; auto-calculates final price & grand total
- **Two Bill Modes**:
  - **View Bill PDF** — Clean bill: #, Product Name, Code, MRP, Final Price
  - **Bill (Discount)** — Detailed bill: #, Product Name, Code, MRP, Discount%, Final Price

### 📄 PDF & Documents
- **PDF Viewer** — View bundled reference PDFs (Price List, Cookware Images, Cooker Images) natively on Android with **zoom in/out controls**
- **PDF History** — All generated order/bill PDFs saved locally (IndexedDB)
- **Attach PDFs** — Add your own reference PDFs to the app

### 🧾 Client Ledger
- **Client Profiles** — Create and manage client accounts
- **Transaction Timeline** — View full bill & receipt history per client
- **Editable History** — Modify the date, time, and amount of past bill/receipt entries
- **Reason/Remarks** — Add remarks to any manual ledger transaction
- **Custom Products** — Add unlisted products on the fly with custom variants

### ☁️ Cloud Sync (MongoDB + Express)
- **Dual Storage** — Offline-first with IndexedDB; automatic cloud backup to MongoDB
- **Cloud Restore** — Restore full app state from the cloud on any new device
- **Debounced Sync** — Intelligently batches updates (5-second debounce) to avoid excessive API calls
- **Force Flush** — Data is immediately pushed before the app closes
- **Sync Status Indicator** — Live UI badge shows `Pending → Syncing → Synced` states

### 📊 Daily Sales Tracking
- **Auto Aggregation** — Bills are automatically aggregated into daily sales summaries in MongoDB
- **Orders Tracked Separately** — Pure Orders (unbilled quotes) are stored in a dedicated `orderrecords` collection
- **Manual Sales Entry** — Add sales manually (e.g., cash sales not tied to a bill) with date, amount, and remarks
- **Delete Sales** — Remove any manual sales entry from cloud and local store
- **Daily Notes** — Attach a text note to any date for operational records
- **Delete Note** — Remove daily notes individually
- **Midnight Auto-Check** — On app startup, checks if the previous day's sales have been recorded and auto-logs if not

### 📧 Email Notifications (EmailJS)
- **Auto Bill Email** — Automatically emails owner when a new bill PDF is generated
- **Auto Order Email** — Automatically emails owner when an order PDF is saved
- **Daily Sales Report Email** — Sends a formatted daily sales summary email
- **"Send as Email" Button** — Manually trigger email from the PDF History tab for any past record
- **Rich HTML Emails** — Emails include a formatted table: S.No, Product Name, Code, Quantity, MRP, Discount%, Final Price

### 📲 App & Platform
- **Offline-First** — Fully functional without internet; data stored locally on device
- **Android APK** — Runs natively on Android via Capacitor
- **Mobile-First UI** — Optimized for small screens with touch-friendly controls

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (mobile-first) |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |
| **PDF Rendering** | pdf.js (canvas-based, in-app) with zoom controls |
| **Native Wrapper** | Capacitor 8 (Android) |
| **Native Plugins** | `@capacitor/filesystem`, `@capacitor-community/file-opener` |
| **Local Storage** | IndexedDB (offline-first, all app data) |
| **Cloud Sync** | Express.js + MongoDB (via Mongoose) |
| **Email Notifications** | EmailJS (client-side, no SMTP server needed) |
| **Environment Config** | `.env` (Vite + Node) |

---

## 📁 Project Structure

```
hawkins-order-manager/
├── android/                        # Capacitor Android project
├── public/
│   └── pdf/                        # Bundled reference PDFs
│       ├── Pricelist.pdf
│       ├── COOKWARE IMAGES.pdf
│       └── COOKERS IMAGES.pdf
├── src/
│   ├── App.jsx                     # Main app component (all UI + state logic)
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # All styles (mobile-first)
│   ├── api.js                      # Frontend API layer (MongoDB cloud sync)
│   ├── emailService.js             # EmailJS integration (bill/order/daily email)
│   ├── idb.js                      # IndexedDB helpers (offline-first storage)
│   ├── nativePdf.js                # Native PDF save/open helpers (Capacitor)
│   └── data/
│       └── parseProducts.js        # Markdown table → product array parser
├── server/
│   ├── index.js                    # Express API server
│   ├── package.json                # Server dependencies
│   ├── .env                        # Server secrets (MONGODB_URI, PORT)
│   ├── .env.example                # Template for server .env
│   └── models/
│       ├── AppData.js              # Schema: full app state (clients, products)
│       ├── BillRecord.js           # Schema: individual bill (with line items)
│       ├── OrderRecord.js          # Schema: pure order/quote records
│       ├── DailyNote.js            # Schema: daily text notes
│       └── ManualSale.js           # Schema: manually entered sales entries
├── data.md                         # Product catalog data (markdown tables)
├── .env                            # Frontend env vars (API URL, EmailJS keys)
├── .gitignore
├── capacitor.config.json           # Capacitor config (appId, webDir)
├── vite.config.js                  # Vite build config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **MongoDB Atlas** account (free tier works fine)
- **Android Studio** (for building the APK)
- **Java 21** (required by Android Gradle)

---

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Configure Frontend Environment
Create a `.env` file in the root:
```env
VITE_API_URL=http://localhost:3001

# EmailJS (get these from emailjs.com)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_OWNER_EMAIL=you@example.com
VITE_OWNER_NAME=Your Name
```

### 3. Set Up the Backend API Server
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hawkins
PORT=3001
```

Start the server:
```bash
npm run dev       # development (auto-restart on change)
# or
npm start         # production
```

### 4. Run Frontend in Browser (Development)
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 5. Build for Android
```bash
npm run build
npx cap sync android
npx cap open android
```
Then in Android Studio: **Build → Build Bundle/APK → Build APK(s)**

### 6. Quick APK Build (Command Line)
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

### MongoDB Cloud Sync
All client data, bills, orders, daily notes, and manual sales entries are synced to MongoDB automatically. Configure the connection in `server/.env`.

### EmailJS (Automated Notifications)
Email notifications are sent client-side via [EmailJS](https://www.emailjs.com/) — no SMTP server needed. Set up a free account, create a template with the following variables, and add your keys to the frontend `.env`:

| Template Variable | Description |
|---|---|
| `{{type}}` | Bill / Order / Daily Sales Report |
| `{{date}}` | Date of the transaction |
| `{{owner_name}}` | Owner's name (greeting) |
| `{{customer_name}}` | Customer name or "Order (Unbilled)" |
| `{{total_items}}` | Number of line items |
| `{{total_pieces}}` | Total pieces |
| `{{grand_total}}` | Grand total amount |
| `{{items_rows}}` | HTML table rows (injected into email body) |
| `{{name}}` | Sender name (From Name field in EmailJS) |

### Product Catalog
All product data lives in `data.md` as markdown tables. Edit this file to update products, prices, or categories. The app parses it automatically at build time.

---

## 🗺️ Changelog

### v3.0 — Email Notifications, Manual Sales & Midnight Check
- ✅ Auto-send email when a Bill or Order PDF is generated
- ✅ "Send as Email" button on every PDF History entry
- ✅ Daily Sales Report email trigger
- ✅ Manual Sale entry (add custom cash sales with date, amount, remarks)
- ✅ Delete individual manual sales
- ✅ Daily Notes with delete support
- ✅ Midnight auto-sales check on app startup

### v2.1 — Orders Tracked Separately
- ✅ Pure Orders (unbilled quotes) saved to dedicated `orderrecords` MongoDB collection
- ✅ Bills saved to `billrecords` collection with full line-item data

### v2.0 — MongoDB Cloud Sync & Daily Sales
- ✅ Full migration from Supabase to self-hosted Express + MongoDB backend
- ✅ Dual storage: IndexedDB (offline) + MongoDB (cloud backup)
- ✅ Daily sales aggregation and dashboard
- ✅ Cloud restore on new device
- ✅ Debounced sync with live status indicator

### v1.2 — PDF Improvements
- ✅ Zoom in/out controls for PDF viewer
- ✅ Editable bill/receipt dates and amounts in client ledger
- ✅ Reason/Remarks field for ledger entries

### v1.1 — Custom Products & Security
- ✅ Custom product variants
- ✅ Moved Firebase/API credentials to environment variables
- ✅ `.gitignore` secured to exclude `.env` files

### v1.0 — Initial Release
- ✅ Full product catalog (300+ Hawkins products)
- ✅ Order builder & bill generator
- ✅ PDF generation & history (IndexedDB)
- ✅ Client ledger
- ✅ Capacitor Android build

---

## 📄 License

Private — Built for Hawkins dealer use.
