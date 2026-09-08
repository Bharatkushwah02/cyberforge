# 🛡️ CyberForge — Hands-on Cyber Security Simulation Range

> **Interactive E-Commerce Vulnerability Training Platform (PortSwigger & DVWA Style)**

CyberForge is a modern, realistic, hands-on cybersecurity simulation environment designed for beginners to learn practical web application security. Unlike static multiple-choice quiz sites, CyberForge functions as a **living, vulnerable e-commerce application** where typing an exploit **actually executes the vulnerability** — dumping database records, hijacking user accounts via IDOR, popping authentic XSS alerts with session cookie theft, tampering with checkout pricing, and running interactive web shells.

---

## 🌟 The 5 Hands-on Security Labs

| # | Lab Title | Category | Difficulty | Target Endpoint | Exploit Mechanism |
|:---:|:---|:---|:---:|:---|:---|
| **01** | **SQL Injection (SQLi)** | Injection | Beginner | `/login` & `/catalog?search=` | Input `' OR 1=1 --` to bypass login authentication as Administrator, or inject `' UNION SELECT ...` in the catalog search bar to extract classified unreleased prototypes from the database. |
| **02** | **Insecure Direct Object Reference (IDOR)** | Broken Access Control | Beginner | `/orders?id=1042` | Change the order reference from standard user `1042` to `1001` to access the CEO's confidential enterprise order, credit card details, and secret delivery codes. |
| **03** | **Stored Cross-Site Scripting (XSS)** | Client-Side Injection | Intermediate | `/product/1#reviews` | Submit an unsanitized review containing `<img src=x onerror=alert(document.cookie)>`. When rendered in the browser DOM, it executes JavaScript and exfiltrates session tokens. |
| **04** | **Parameter Tampering (Price Manipulation)** | Business Logic Flaw | Beginner | `/checkout` | The flagship gaming laptop costs **$1,999.00**, but your wallet only has **$50.00**. Tamper with the client-side price parameter to **$1.00** to bypass payment constraints and ship the order. |
| **05** | **Insecure File Upload (Web Shell RCE)** | File Execution | Intermediate | `/support` | Bypass client-side image validation to upload `shell.php` to `/uploads/`. Open the interactive Web Shell Terminal and execute server commands (`cat secret_flag.txt`, `whoami`) for Remote Code Execution. |

---

## 🚀 Key Features

- **🏆 PortSwigger Top Lab Header**: Dynamic objective banner that displays the current challenge goal and triggers an animated green **"LAB SOLVED! 🎉"** celebration upon completion.
- **🔍 DVWA-Style "View Vulnerable Source"**: Side-by-side backend source code inspector showing the vulnerable PHP/Node.js code vs the secure patched implementation.
- **💡 PortSwigger-Style Solution & Hints**: Progressive hints and quick 1-click copyable exploit payloads for beginners.
- **🔌 Built-in HTTP Request Interceptor**: Mini Burp Suite / Repeater allowing users to intercept, inspect, and tamper with HTTP parameters (`price`, `order_id`, `username`) right inside the browser.
- **🔊 Procedural Cyber Audio**: Web Audio API sound synthesis for "Lab Solved" fanfares, alerts, and keyboard clicks (zero external audio file dependencies).
- **🗄️ In-Memory Reactive Relational Sandbox**: 100% safe, client-side in-memory execution. Zero external MySQL or server setup required. Works offline and deploys anywhere.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (Glassmorphism & Cyberpunk Theme)
- **State Management**: React Context API + LocalStorage
- **Audio**: Native HTML5 Web Audio API

---

## 🏃 Quick Start (Local Development)

```bash
# 1. Navigate to the project directory
cd cyberforge

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev
```

The application will launch on `http://localhost:5173`.

---

## 🚢 Deploy to Vercel (1-Click Free Hosting)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your repository and select **Vite** as framework preset.
4. Click **Deploy**. Your live cyber lab will be online instantly!

---

## 📄 License & Disclaimer

Strictly for educational and defensive cybersecurity training purposes. All targets, databases, users, and transactions are simulated inside an isolated client-side sandbox.
