# INTERNSHIP TECHNICAL PROJECT REPORT

**PROJECT TITLE:** CyberForge: Interactive Web Security Simulation & Vulnerability Lab Platform  
**ORGANIZATION:** Trinetlayer  
**INTERN NAME:** Bharat Kushwah  
**PROJECT MENTOR / SUPERVISOR:** Yash Sir  
**SUBMISSION DATE:** September 2026  
**REPOSITORY URL:** [https://github.com/Bharatkushwah02/cyberforge](https://github.com/Bharatkushwah02/cyberforge)  
**FRAMEWORK & TECH STACK:** React 19 / TypeScript / Tailwind CSS / Vite / Client-Side Relational Engine  

---

## 1. EXECUTIVE SUMMARY

During my internship tenure at **Trinetlayer**, under the technical supervision and mentorship of **Yash Sir**, I was tasked with designing, architecting, and engineering **CyberForge**—an enterprise-grade, interactive web application penetration testing training platform. 

Traditional cybersecurity training environments (such as legacy DVWA or juice-shop installations) frequently suffer from heavy server-side deployment prerequisites (e.g., Docker containers, virtual machines, local PHP/MySQL servers), making distribution and cloud hosting cumbersome. **CyberForge** resolves this challenge by delivering a zero-dependency, high-fidelity security laboratory that runs entirely within the modern web browser while preserving authentic server vulnerability behaviors, relational database logic, and realistic network inspection workflows.

The platform simulates an e-commerce infrastructure (`CyberForge Enterprises`) and embeds **five critical OWASP Top 10 vulnerabilities**:
1. **SQL Injection (SQLi - CWE-89)**: Authentication Bypass & UNION-based Database Extraction
2. **Insecure Direct Object Reference (IDOR - CWE-639)**: Horizontal Privilege Escalation to confidential corporate assets
3. **Stored Cross-Site Scripting (XSS - CWE-79)**: Persistent Script Injection & Session Cookie Exfiltration
4. **Path Traversal / Directory Traversal (CWE-22 / CWE-23)**: Arbitrary System File Disclosure (`/etc/passwd`, database configs)
5. **OS Command Injection (RCE - CWE-78)**: Shell Operator Chaining (`&&`, `;`, `|`) in an interactive Unix-like terminal

---

## 2. PROJECT OBJECTIVES & PROBLEM STATEMENT

### 2.1 Core Problem Statement
Beginner and intermediate cybersecurity researchers require realistic hands-on environments to learn offensive security techniques and defensive mitigations. However:
- Most existing training labs provide on-screen spoiler buttons or pre-filled exploit payloads that prevent genuine exploratory learning.
- Cloud hosting of multi-tier vulnerable apps requires costly infrastructure or complex containerization.
- Many platforms lack integrated tooling, forcing users to switch constantly between external proxies (Burp Suite) and web browsers.

### 2.2 Project Goals Achieved
- **Realistic Discovery Workflow**: Eliminated all on-screen exploit presets and spoiler buttons. Learners must logically discover attack chains (e.g., extracting user IDs via SQLi before exploiting IDOR).
- **Built-in Security Tooling**: Developed a custom **Simulated Browser Address Bar** and a **Mini Burp Suite Request Interceptor**, allowing query tampering and header inspection directly within the interface.
- **PortSwigger & DVWA Instructional Methodology**: Integrated live objective status tracking, dual-level progressive hints, and side-by-side **Vulnerable vs. Patched Code** comparisons for every lab.
- **Pure Stealth OLED Hacker Aesthetic**: Built with strict black (`#000000`) and emerald green (`#10b981`) palettes, completely free of generic blue designs.
- **Zero-Dependency 1-Click Deployment**: Designed with client-side relational storage and persistent `localStorage`, enabling instantaneous deployment to platforms like Vercel with zero database configuration.

---

## 3. SYSTEM ARCHITECTURE & TECHNICAL STACK

### 3.1 Architectural Overview
CyberForge is engineered around a reactive state management model implemented via React's Context API (`StoreContext.tsx`). The platform emulates backend server responses, HTTP request lifecycles, and database queries in real time.

```
+-------------------------------------------------------------------+
|                     CyberForge Client Engine                      |
+-------------------------------------------------------------------+
|  [Simulated URL Bar]  <--->  [Mini Burp Interceptor]             |
|  [PortSwigger Banner] <--->  [DVWA View Source Modal]             |
+-------------------------------------------------------------------+
|                         UI Layer Views                            |
|  * StoreCatalog      * OrderHistory      * ProductDetails         |
|  * PathTraversal     * CommandTerminal   * AccountGateway         |
+-------------------------------------------------------------------+
|                     Security Simulation Core                      |
|  * SQL Query Parser & UNION Evaluator                             |
|  * Session Management & Authorization Validator                   |
|  * Command Execution Engine & Shell Operator Chainer              |
|  * Path Normalization & Directory Traversal Resolver              |
+-------------------------------------------------------------------+
|               Simulated Relational Database (Local)               |
|  * Table: users (id, username, password_hash, role, balance)     |
|  * Table: orders (order_id, user_id, items, invoice_amount)       |
|  * Table: reviews (id, product_id, author, comment_html)          |
|  * Virtual Filesystem: /etc/passwd, /config/database.json, etc.   |
+-------------------------------------------------------------------+
```

### 3.2 Technology Stack
- **Frontend Framework**: React 19 with TypeScript for strong static typing and contract adherence.
- **Styling Architecture**: Tailwind CSS utilizing an OLED Black (`#000000`) stealth theme with `#10b981` accents.
- **Build System**: Vite 6.4 offering sub-second Hot Module Replacement (HMR) and optimized rollup production bundling.
- **State & Storage**: React Context API synchronized with `localStorage` for cross-session persistence.
- **Audio Feedback**: Synthesized Web Audio API sound effects for solved fanfare and security alert chimes.

---

## 4. DETAILED VULNERABILITY LAB BREAKDOWN

### 4.1 LAB 01: SQL Injection (SQLi)
- **Vulnerability Classification**: CWE-89 (Improper Neutralization of Special Elements used in an SQL Command)
- **OWASP Category**: A03:2021 – Injection
- **Vulnerable Endpoints**: `/login` (Authentication) & `/catalog?search=` (Product Search)

#### Exploitation Scenario:
The search functionality constructs raw database queries using unsanitized user inputs:
```sql
SELECT * FROM products WHERE name LIKE '%<USER_INPUT>%'
```

#### Attack Methodology:
1. **Authentication Bypass**: An attacker enters `' OR 1=1 --` into the username field on the login page to authenticate as the primary administrator without a password.
2. **UNION-based Data Extraction**: An attacker enters the following payload into the catalog search bar:
   ```sql
   ' UNION SELECT id, username, password FROM users --
   ```
   The engine executes a UNION query across the `users` table, exposing confidential account credentials:
   - `User 1001`: `administrator` (`super_secret_admin_hash_9942`)
   - `User 1002`: `elena_cfo` (`Finance#Vault_Secure99`)
   - `User 1003`: `vikram_sec` (`SecOps_Quantum_Key2026!`)

#### Defensive Remediation:
Parameterized queries and Prepared Statements must replace string concatenation:
```typescript
// SECURE REMEDIATION
const query = 'SELECT * FROM products WHERE name LIKE ?';
const results = db.prepare(query).all(`%${userInput}%`);
```

---

### 4.2 LAB 02: Insecure Direct Object Reference (IDOR)
- **Vulnerability Classification**: CWE-639 (Authorization Bypass Through User-Controlled Key)
- **OWASP Category**: A01:2021 – Broken Access Control
- **Vulnerable Endpoint**: `/orders?id=<ORDER_ID>` & Simulated Address Bar

#### Exploitation Scenario:
The system allows users to view invoice receipts by passing an order or user identifier parameter. The backend server verifies that the user is authenticated, but fails to check whether the requesting user owns the requested invoice.

#### Attack Methodology:
1. The student utilizes credentials or IDs acquired during the Lab 1 SQLi phase (`id = 1001`).
2. Navigating to `/orders?id=1001` directly or manipulating the ID in the Simulated URL Bar requests Marcus Vance's (CEO) confidential invoice.
3. The invoice for an unreleased $129,984 server infrastructure deployment is leaked, successfully capturing the CTF flag.

#### Defensive Remediation:
Implement contextual ownership validation before fulfilling object requests:
```typescript
// SECURE REMEDIATION
if (record.userId !== currentUser.id && currentUser.role !== 'admin') {
  throw new ForbiddenError("403 Forbidden: Access Denied to Requested Resource.");
}
```

---

### 4.3 LAB 03: Stored Cross-Site Scripting (Stored XSS)
- **Vulnerability Classification**: CWE-79 (Improper Neutralization of Input During Web Page Generation)
- **OWASP Category**: A03:2021 – Injection
- **Vulnerable Endpoint**: `/product/1#reviews` (Customer Reviews)

#### Exploitation Scenario:
Product reviews submitted by customers are stored directly in the database without sanitization or HTML entity encoding. When subsequent visitors view the product page, the raw HTML and JavaScript are rendered directly in the DOM.

#### Attack Methodology:
1. The user navigates to the flagship laptop review section.
2. The user submits a review containing an image payload with an error handler:
   ```html
   <img src="x" onerror="alert('XSS: Session Cookie = ' + document.cookie)">
   ```
3. The payload is stored in the database. Upon rendering, the malicious JavaScript executes inside the context of the user session, displaying the captured session token in an on-screen modal.

#### Defensive Remediation:
Sanitize all user-generated content and apply contextual HTML encoding:
```typescript
// SECURE REMEDIATION
import DOMPurify from 'dompurify';
const sanitizedHtml = DOMPurify.sanitize(userReviewComment);
```

---

### 4.4 LAB 04: Path Traversal (Directory Traversal / LFI)
- **Vulnerability Classification**: CWE-22 (Improper Limitation of a Pathname to a Restricted Directory)
- **OWASP Category**: A01:2021 – Broken Access Control
- **Vulnerable Endpoint**: `/manuals?file=<FILENAME>` & Simulated URL Bar

#### Exploitation Scenario:
The server documentation portal retrieves product documentation and hardware manuals from a file storage directory based on a user-supplied filename parameter without path validation.

#### Attack Methodology:
1. The user observes the regular URL: `/manuals?file=hardware_guide.pdf`.
2. The user applies directory traversal sequences (`../`) to escape the intended documents directory:
   ```
   ../../../../etc/passwd
   ```
   or
   ```
   ../../config/database.json
   ```
3. The server resolves the relative traversal path and prints root Unix user accounts (`root:x:0:0:root:/root:/bin/bash`) and confidential JSON database configuration credentials, capturing the traversal flag.

#### Defensive Remediation:
Enforce strict filename whitelisting and verify canonical absolute paths:
```typescript
// SECURE REMEDIATION
const SAFE_DIR = path.resolve('/var/www/docs');
const resolvedPath = path.resolve(SAFE_DIR, path.basename(userInputFilename));

if (!resolvedPath.startsWith(SAFE_DIR)) {
  throw new SecurityError("Path Traversal Attempt Detected!");
}
```

---

### 4.5 LAB 05: OS Command Injection (Remote Code Execution - RCE)
- **Vulnerability Classification**: CWE-78 (Improper Neutralization of Special Elements used in an OS Command)
- **OWASP Category**: A03:2021 – Injection
- **Vulnerable Endpoint**: `/diagnostics?host=<HOST_INPUT>` (Network Ping Utility)

#### Exploitation Scenario:
The administration diagnostics view offers a ping tool to verify node availability. The backend service passes the user input string directly to a system shell execution function (`exec("ping -c 2 " + host)`).

#### Attack Methodology:
1. The user inputs standard IP addresses (e.g., `127.0.0.1`).
2. The user injects shell chaining operators (`&&`, `;`, `|`) to execute unauthorized secondary commands:
   ```bash
   127.0.0.1 && cat secret_root_flag.txt
   ```
   or
   ```bash
   127.0.0.1; whoami; id; ls -la
   ```
3. The interactive hacker terminal simulates execution of the chained command, exposing the root system flag: `FLAG{OS_COMMAND_INJECTION_RCE_ROOT_SERVER_PWNED_8821}`.

#### Defensive Remediation:
Avoid passing user input to shell interpreters. Use parameterized APIs that bypass the shell:
```typescript
// SECURE REMEDIATION
import { execFile } from 'child_process';
// Pass arguments strictly as an array, preventing operator chaining
execFile('/bin/ping', ['-c', '2', sanitizedIpAddress], (error, stdout) => { ... });
```

---

## 5. DESIGN & USER EXPERIENCE HIGHLIGHTS

1. **Zero Blue/Cyan Stealth Aesthetic**:
   - Replaced all standard blue palettes with deep `#000000` OLED black and emerald green (`#10b981`), ensuring visual distinction and a true security operations center (SOC) appearance.
2. **Standardized Layout & Margin Optimization**:
   - Implemented a wide-screen bounding layout (`max-w-[1750px]`) that comfortably occupies modern laptop displays without lateral blank space.
3. **Progressive Solution Drawer**:
   - Adheres to modern educational pedagogy: hints are staggered (Hint 1 ➔ Hint 2 ➔ Full Exploit Guide) so learners can test their own analytical capabilities before reading solutions.
4. **Mandatory Authentication Gateway**:
   - Unauthenticated visitors cannot access lab endpoints directly, enforcing authentic web application flow.

---

## 6. VERIFICATION, BUILD & DEPLOYMENT STATUS

- **Production Build Testing**:
  - `tsc -b && vite build` executed with **0 TypeScript and 0 Vite compilation errors**.
  - Generated production bundle in `/dist` consisting of 47 optimized modules.
- **Git Version Control**:
  - Repository initialized with `.gitignore` properly excluding `node_modules` and build caches.
  - Successfully committed and pushed to GitHub:
    - **Remote**: `https://github.com/Bharatkushwah02/cyberforge.git`
    - **Branch**: `main`
- **Cloud Deployment Preparedness**:
  - Configured with `vercel.json` routing rewrites, making it ready for 1-click cloud deployment.

---

## 7. KEY LEARNINGS & INTERNSHIP TAKEAWAYS

During the development of this project at **Trinetlayer** under **Yash Sir**:
1. **Deeper Grasp of Web Vulnerability Mechanics**: Developed an intimate understanding of how input validation failures across different application tiers give rise to Injection, Broken Access Control, and Traversal vulnerabilities.
2. **Defensive Coding Mastery**: Gained practical experience implementing and documenting industry-standard remediations (Prepared Statements, Object Access Controls, Path Whitelisting, and Shell Avoidance).
3. **Full-Stack Architecture Skills**: Honed TypeScript and React architecture skills by engineering a zero-dependency in-browser simulation engine that mimics complex server-side behaviors.
4. **Product Engineering & UX Standards**: Learned to balance educational guidance with exploratory realism, ensuring that cybersecurity learners remain engaged without having answers spoiled.

---

## 8. CONCLUSION

The **CyberForge** project successfully achieves all project goals outlined by **Trinetlayer**. It stands as a production-ready, feature-complete web security training lab that can be utilized internally for training security analysts or shared with the open-source cybersecurity community.

I express my sincere gratitude to **Yash Sir** for his guidance, mentorship, and support throughout the design and realization of this project.

---
**Report Submitted By:** Bharat Kushwah  
**Internship Organization:** Trinetlayer  
**Date:** September 2026
