# 🛡️ CyberForge — Interactive Web Security Simulation Range

[![Live Demo](https://img.shields.io/badge/Live_Demo-cyberforge--inky.vercel.app-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://cyberforge-inky.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-18181b?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Bharatkushwah02/cyberforge)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

> **🌐 Live Deployment**: [https://cyberforge-inky.vercel.app/](https://cyberforge-inky.vercel.app/)

CyberForge is a high-fidelity, hands-on cybersecurity simulation platform modeled after **PortSwigger Web Security Academy**, **OWASP Juice Shop**, and **DVWA (Damn Vulnerable Web Application)**. 

Unlike passive quiz platforms, CyberForge functions as an authentic, living corporate e-commerce infrastructure (`CyberForge Enterprises`). Exploits entered by learners **actually execute** against a live simulated relational engine and virtual filesystem — bypassing authentication, dumping database credentials, stealing session cookies via XSS, traversing restricted directories, and executing shell commands in an interactive Unix-like terminal.

---

## 🌟 The 5 Hands-on Security Labs

| # | Lab Title | Category | CWE / OWASP | Target Endpoint | Exploit Mechanism |
|:---:|:---|:---|:---:|:---|:---|
| **01** | **SQL Injection (SQLi)** | Injection | CWE-89 (A03) | `/login` & `/catalog?search=` | Bypass login with `' OR 1=1 --` or dump internal users table with `' UNION SELECT id, username, password FROM users --` to leak administrator credentials and User `1001`. |
| **02** | **Insecure Direct Object Reference (IDOR)** | Broken Access Control | CWE-639 (A01) | `/orders?id=1042` & URL Bar | Discover User `1001` via SQLi, then query `id=1001` in the order lookup or Simulated Address Bar to access the CEO's confidential $129,984 server infrastructure invoice. |
| **03** | **Stored Cross-Site Scripting (XSS)** | Injection | CWE-79 (A03) | `/product/1#reviews` | Submit an unsanitized review containing `<img src=x onerror=alert(document.cookie)>`. When rendered in the browser DOM, it executes JavaScript and exfiltrates the active session token. |
| **04** | **Path Traversal (Directory Traversal / LFI)** | Broken Access Control | CWE-22 (A01) | `/manuals?file=` & URL Bar | Inject dot-dot-slash traversal sequences (`../../../../etc/passwd` or `../../config/database.json`) into the documentation viewer to disclose sensitive Linux system files and database passwords. |
| **05** | **OS Command Injection (Remote Code Execution)** | Injection | CWE-78 (A03) | `/diagnostics?host=` | Exploit shell operator chaining (`&&`, `;`, `|`) inside the server ping utility (e.g. `127.0.0.1 && cat secret_root_flag.txt` or `whoami; id; ls -la`) in a live interactive hacker terminal to capture the root system flag. |

---

## 🚀 Key Features

- **🌐 Live Vercel Deployment**: 100% cloud-hosted and accessible anywhere at [cyberforge-inky.vercel.app](https://cyberforge-inky.vercel.app/).
- **🎨 Pure Stealth OLED Black Aesthetic**: Engineered with `#000000` deep black, dark zinc neutrals, and emerald green (`#10b981`) cyber accents (zero blue/cyan).
- **🏆 PortSwigger Top Lab Header**: Dynamic objective banner tracking mission progress with an animated **"LAB SOLVED! 🎉"** celebration upon completion.
- **🔍 DVWA-Style "View Vulnerable Source"**: Side-by-side backend source code inspector showing the vulnerable code vs. the secure patched implementation.
- **💡 Progressive Hint & Solution Drawer**: Dual-level hints (Hint 1 ➔ Hint 2 ➔ Full Exploit Guide) ensuring students learn without upfront spoilers.
- **🔌 Built-in HTTP Request Interceptor**: Mini Burp Suite / Repeater allowing users to intercept, inspect, and tamper with HTTP parameters right inside the browser.
- **🌐 Simulated Browser Address Bar**: Realistic real-time URL bar (`https://cyberforge.internal/...`) enabling URL parameter manipulation directly without 404 errors.
- **🔊 Procedural Cyber Audio**: Web Audio API sound synthesis for "Lab Solved" fanfares, alerts, and keyboard clicks (zero external audio file dependencies).
- **🗄️ Zero-Dependency Relational Sandbox**: 100% safe, client-side in-memory execution with `localStorage` persistence. Zero external MySQL or server setup required.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6.4
- **Styling**: Tailwind CSS (OLED Stealth Cyber Theme)
- **State Management**: React Context API + LocalStorage
- **Audio**: Native HTML5 Web Audio API
- **Deployment**: Vercel SPA (`vercel.json`)

---

## 🏃 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/Bharatkushwah02/cyberforge.git

# 2. Navigate to the project directory
cd cyberforge

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

The application will launch on `http://localhost:5173` (or `http://localhost:5174`).

---

## 📄 License & Disclaimer

Strictly for educational and defensive cybersecurity training purposes. All targets, databases, users, and transactions are simulated inside an isolated client-side sandbox.

**Developed by:** Bharat Kushwah  
**Internship Organization:** Trinetlayer  
**Mentor:** Yash Sir  
