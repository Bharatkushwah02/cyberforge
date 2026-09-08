import { Lab, Order, Product, Review, User } from '../types/store';

export const LABS: Lab[] = [
  {
    id: 'sqli',
    number: 1,
    title: 'SQL Injection: Authentication Bypass & Catalog Leak',
    category: 'SQL Injection',
    difficulty: 'Beginner',
    targetEndpoint: '/login or /catalog?search=',
    objective: 'Bypass login authentication as the administrator using SQL injection, or exploit the product search bar to leak unreleased VIP prototypes.',
    overview: 'SQL Injection (SQLi) occurs when user-supplied input is directly concatenated into a dynamic SQL query without proper parameterized sanitization.',
    whyItMatters: 'SQLi allows attackers to spoof identities, tamper with existing data, cause repudiation issues, and completely extract the server database.',
    hints: [
      "Look at the login form. The server expects: SELECT * FROM users WHERE username = '...' AND password = '...'",
      "What character can you use in SQL to prematurely close the string literal? (Hint: the single quote ')",
      "Try entering `' OR 1=1 --` into the username field with any password to bypass the check.",
      "For the search bar, try using UNION SELECT to append results: `' UNION SELECT 99, 'Prototype Drone', 0, 'Classified Drone', 'Drones', '', 5, 1, 1 --`"
    ],
    solutionSteps: [
      "Navigate to the Login page from the top navbar.",
      "In the Username field, type: ' OR 1=1 --",
      "Enter any dummy password (e.g. password123).",
      "Click 'Sign In'. You will be authenticated immediately as the 'administrator' user and the lab will be solved!"
    ],
    samplePayloads: [
      { title: "Classic Auth Bypass", payload: "' OR 1=1 --", explanation: "Forces the WHERE condition to evaluate to TRUE for every row and comments out the password check." },
      { title: "Admin Target Bypass", payload: "admin' --", explanation: "Directly matches the admin account and ignores password verification." },
      { title: "Search Bar UNION Leak", payload: "' UNION SELECT 99, 'Classified Quantum Chip', 0, 'Internal Prototype Only', 'Electronics', '', 5, 1, 1 --", explanation: "Extracts internal hidden items via SQL UNION operator." }
    ],
    vulnerableCode: {
      language: 'javascript',
      file: 'server/controllers/authController.js',
      code: `// VULNERABLE: Direct string interpolation into raw SQL query
const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "';";

const user = await db.raw(query);
if (user.length > 0) {
  req.session.userId = user[0].id;
  req.session.role = user[0].role;
  return res.json({ success: true, user: user[0] });
}`,
      vulnerabilityHighlight: "Concatenating req.body.username directly into the SQL string allows attackers to inject SQL syntax like ' OR 1=1 -- to alter logic."
    },
    secureCode: {
      language: 'javascript',
      file: 'server/controllers/authController.js',
      code: `// SECURE: Parameterized queries (Prepared Statements)
const query = "SELECT * FROM users WHERE username = ? AND password_hash = ?";

const user = await db.query(query, [req.body.username, hashedPassword]);
if (user.length > 0) {
  req.session.userId = user[0].id;
  req.session.role = user[0].role;
  return res.json({ success: true, user: user[0] });
}`,
      remediationExplanation: "Using parameterized queries treats untrusted input strictly as data, never as executable SQL code."
    }
  },
  {
    id: 'idor',
    number: 2,
    title: 'IDOR: Insecure Direct Object Reference (BOLA)',
    category: 'Broken Access Control',
    difficulty: 'Beginner',
    targetEndpoint: '/orders?id=1042',
    objective: 'As normal customer buyer_42 (Order #1042), access the confidential enterprise invoice of the CEO/Admin (Order #1001) by manipulating the order reference identifier.',
    overview: 'Insecure Direct Object References (IDOR) occur when an application exposes a reference to an internal object (like an order ID, customer ID, or file key) without validating that the logged-in user actually owns that object.',
    whyItMatters: 'An attacker can enumerate IDs (e.g. 1001, 1002, 1003) and harvest the personal information, order history, credit card snippets, and confidential notes of all platform users.',
    hints: [
      "How do you discover which user IDs exist in the database? Go to the Store Catalog search bar and execute a SQL Injection UNION attack (' UNION SELECT id, username, password FROM users --) to dump all user records and uncover the Administrator's ID (1001) or CFO's ID (1002).",
      "Navigate to 'Orders / Invoices' in the navigation bar. Notice you are authenticated and viewing your own order.",
      "In the 'Fetch Record' order lookup field or URL bar, enter the target Administrator's discovered ID (1001) or CFO ID (1002) instead of your own.",
      "Observe that the server returns the executive's private invoice without verifying ownership!"
    ],
    solutionSteps: [
      "First discover target IDs: go to Catalog Search and enter: ' UNION SELECT id, username, password FROM users --",
      "Notice the dumped user table lists Administrator with ID: 1001 and CFO with ID: 1002.",
      "Click on 'Orders / Invoices' in the store navbar.",
      "In the Order ID query field, enter '1001' and click 'Fetch Record'.",
      "The server returns the confidential executive order and reveals the CTF Flag!"
    ],
    samplePayloads: [
      { title: "Target CEO Order", payload: "1001", explanation: "Directly requests the first administrative order record in the database." },
      { title: "Sequential Enumeration", payload: "1002, 1003, ...", explanation: "Predictable integer keys allow automated scrapers to dump all customer orders." }
    ],
    vulnerableCode: {
      language: 'javascript',
      file: 'server/controllers/orderController.js',
      code: `// VULNERABLE: Direct lookup without checking user ownership
app.get('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const order = await db.findOrderById(orderId);
  
  if (!order) return res.status(404).send('Order not found');
  
  // Bug: Returns any order regardless of who req.session.user is!
  return res.json({ order });
});`,
      vulnerabilityHighlight: "The server queries db.findOrderById(orderId) without checking if order.customerId === req.session.user.id."
    },
    secureCode: {
      language: 'javascript',
      file: 'server/controllers/orderController.js',
      code: `// SECURE: Server-side object-level ownership authorization
app.get('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const currentUserId = req.session.user.id;
  
  const order = await db.findOrderById(orderId);
  if (!order) return res.status(404).send('Order not found');

  // Verify ownership or administrative privilege
  if (order.customerId !== currentUserId && req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: You do not own this order' });
  }

  return res.json({ order });
});`,
      remediationExplanation: "Always enforce server-side access control: ensure the requesting user's session matches the owner of the requested object."
    }
  },
  {
    id: 'xss',
    number: 3,
    title: 'Stored XSS: Customer Review & Cookie Theft',
    category: 'Cross-Site Scripting',
    difficulty: 'Intermediate',
    targetEndpoint: '/product/1#reviews',
    objective: 'Inject a stored Cross-Site Scripting (XSS) payload into the product review section that executes JavaScript and extracts the simulated victim session cookie.',
    overview: 'Stored XSS occurs when an application receives untrusted input from a user, stores it in a database, and later embeds it into web pages served to other users without HTML entity encoding or sanitization.',
    whyItMatters: 'Stored XSS is critical because the malicious script runs inside the browser of every visitor who views the page, allowing session hijacking, credential theft, or page defacement.',
    hints: [
      "Navigate to any product (e.g. the Cyber Stealth Laptop) and scroll down to the 'Customer Reviews' section.",
      "Try entering standard HTML tags like <b>test</b> to see if formatting works.",
      "The server does not sanitize HTML. Try entering an image tag with an onerror event handler: <img src=x onerror=alert(document.cookie)>",
      "Or try <script>alert('XSS')</script> to execute arbitrary JavaScript!"
    ],
    solutionSteps: [
      "Open the product page for 'Cyber Stealth Pro Laptop'.",
      "Scroll down to 'Leave a Customer Review'.",
      "In the comment box, paste: <img src=x onerror=alert(document.cookie)>",
      "Click 'Submit Review'. The browser sandbox will execute the payload, pop an authentic alert dialog with the secret cookie, and solve the lab!"
    ],
    samplePayloads: [
      { title: "Standard Image OnError", payload: "<img src=x onerror=alert(document.cookie)>", explanation: "Fails to load image 'x' and immediately executes JavaScript in onerror." },
      { title: "Script Tag Alert", payload: "<script>alert('XSS_TRIGGERED')</script>", explanation: "Direct inline script execution in browsers lacking Content Security Policy." },
      { title: "SVG Vector", payload: "<svg onload=alert('XSS_PWNED')>", explanation: "SVG element that triggers execution immediately upon rendering." }
    ],
    vulnerableCode: {
      language: 'javascript',
      file: 'server/views/productDetail.ejs',
      code: `<!-- VULNERABLE: Outputting raw HTML without escaping -->
<div class="review-comment">
  <!-- The unescaped '<%-' tag allows raw HTML and scripts to be rendered -->
  <%- review.comment %>
</div>`,
      vulnerabilityHighlight: "Rendering raw user input directly with unescaped HTML allows injected script tags and event handlers to execute."
    },
    secureCode: {
      language: 'javascript',
      file: 'server/views/productDetail.ejs',
      code: `<!-- SECURE: Context-aware HTML entity encoding -->
<div class="review-comment">
  <!-- The '<%=' tag safely escapes <, >, &, \", and ' into HTML entities -->
  <%= review.comment %>
</div>

<!-- Extra Defense: Content Security Policy Header -->
<!-- Content-Security-Policy: default-src 'self'; script-src 'self'; -->`,
      remediationExplanation: "Context-aware HTML encoding converts '<' into '&lt;', ensuring the browser renders the payload strictly as visual text, not executable code."
    }
  },
  {
    id: 'traversal',
    number: 4,
    title: 'Path Traversal: Arbitrary File Read & Sensitive Data Leak',
    category: 'File Inclusion / Path Traversal',
    difficulty: 'Beginner',
    targetEndpoint: '/manuals?file=spec_sheet.pdf (GET /api/docs)',
    objective: 'The CyberForge hardware store provides documentation and specification manuals. Manipulate the file parameter using directory traversal sequences (../../../../etc/passwd) to access restricted internal server configuration files and capture the server master flag.',
    overview: 'Path Traversal (also known as Directory Traversal) allows an attacker to read arbitrary files on the server that runs the application, by manipulating variables that reference files with dot-dot-slash (../) sequences.',
    whyItMatters: 'An attacker can read application code, database credentials, server configuration files, password hashes, and sensitive operating system files.',
    hints: [
      "Navigate to 'Hardware Docs & Manuals' in the store navigation bar.",
      "Notice that selecting a documentation file makes a request with a filename parameter: '?file=hardware_guide.pdf'.",
      "The server does not validate path boundaries. Try traversing out of the web directory using relative dot-dot-slash sequences: '../../../../etc/passwd'.",
      "You can also inspect internal app secrets by requesting: '../../config/database.json' or '../../secrets/server_flag.txt'."
    ],
    solutionSteps: [
      "Click on 'Hardware Docs & Manuals' in the store navbar.",
      "In the Document File query box or Simulated Address Bar, enter: ../../../../etc/passwd",
      "Click 'Fetch Document'. The server reads outside the web root and returns the Linux passwd file containing root user definitions!",
      "Also try: ../../secrets/server_flag.txt to dump the CTF Master Flag and solve the lab!"
    ],
    samplePayloads: [
      { title: "Standard Linux Passwd", payload: "../../../../etc/passwd", explanation: "Navigates up to root directory and reads standard Unix user account definitions." },
      { title: "Internal Database Credentials", payload: "../../config/database.json", explanation: "Accesses internal application configuration holding database passwords." },
      { title: "CTF Master Flag File", payload: "../../secrets/server_flag.txt", explanation: "Directly retrieves the restricted server flag file." },
      { title: "Windows System INI", payload: "..\\..\\..\\..\\windows\\system.ini", explanation: "Targeting Windows NT based systems using backslash path separators." }
    ],
    vulnerableCode: {
      language: 'javascript',
      file: 'server/controllers/docController.js',
      code: `// VULNERABLE: Direct path concatenation without sanitization
app.get('/api/docs', (req, res) => {
  const filename = req.query.file;
  // Flaw: path.join resolves '../' sequences outside public/docs!
  const filePath = path.join(__dirname, 'public/docs', filename);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).send('File not found');
    return res.send(data);
  });
});`,
      vulnerabilityHighlight: "Using path.join with unsanitized user input allows directory traversal (../) to escape the intended directory."
    },
    secureCode: {
      language: 'javascript',
      file: 'server/controllers/docController.js',
      code: `// SECURE: Whitelisting and canonical path verification
app.get('/api/docs', (req, res) => {
  const filename = path.basename(req.query.file); // Strips directory paths
  const safeDir = path.resolve(__dirname, 'public/docs');
  const safePath = path.resolve(safeDir, filename);

  // Verify the resolved canonical path starts with the safe directory
  if (!safePath.startsWith(safeDir)) {
    return res.status(403).send('Access Denied');
  }
  return res.sendFile(safePath);
});`,
      remediationExplanation: "Use path.basename to strip directory separators, and verify that the canonical resolved path starts with the designated safe root directory."
    }
  },
  {
    id: 'command',
    number: 5,
    title: 'OS Command Injection: Remote Code Execution (RCE)',
    category: 'Command Injection',
    difficulty: 'Intermediate',
    targetEndpoint: '/diagnostics (POST /api/diagnostics)',
    objective: 'The CyberForge internal network diagnostic utility pings remote edge servers to verify connectivity. Inject operating system shell operators (&&, ;, |) into the host parameter to execute arbitrary terminal commands and capture the root CTF flag.',
    overview: 'OS Command Injection occurs when an application passes unsafe user-supplied data to a system shell. The system shell executes operating system commands with the privileges of the vulnerable application.',
    whyItMatters: 'Command injection leads to full Remote Code Execution (RCE). An attacker can view, modify, or delete sensitive files, establish a reverse shell, install backdoors, and take total control over the host infrastructure.',
    hints: [
      "Open the 'Network Diagnostics' utility from the top navigation bar.",
      "Test a normal IP address like '8.8.8.8' or '127.0.0.1' and observe the simulated ping output.",
      "Notice that the backend passes this input directly into a system shell: 'ping -c 2 [host]'.",
      "Try appending shell command separator operators like '&&' or ';' followed by a terminal command: '127.0.0.1 && whoami' or '8.8.8.8; cat secret_root_flag.txt'."
    ],
    solutionSteps: [
      "Go to 'Network Diagnostics' in the navigation bar.",
      "In the Target Host / IP field, enter: 127.0.0.1 && cat secret_root_flag.txt",
      "Click 'Run Diagnostic Ping'.",
      "The shell executes the ping followed by your injected command, outputting the root server flag: FLAG{OS_COMMAND_INJECTION_ROOT_RCE_9981}!"
    ],
    samplePayloads: [
      { title: "Root Flag Exfiltration", payload: "127.0.0.1 && cat secret_root_flag.txt", explanation: "Chains the ping with cat to read the CTF flag file." },
      { title: "User Context Identification", payload: "127.0.0.1 && whoami", explanation: "Identifies the current Linux/Windows user privilege running the web server." },
      { title: "Directory Contents Listing", payload: "127.0.0.1 | ls -la", explanation: "Pipes stdout to ls, listing all files in the current working directory." },
      { title: "Windows Semicolon Chaining", payload: "8.8.8.8 & dir", explanation: "Windows cmd.exe single-ampersand chaining operator." }
    ],
    vulnerableCode: {
      language: 'javascript',
      file: 'server/controllers/diagnosticController.js',
      code: `// VULNERABLE: Direct string concatenation into child_process.exec()
const { exec } = require('child_process');

app.post('/api/diagnostics', (req, res) => {
  const host = req.body.host;
  // Critical Flaw: Passes unsanitized input directly into the OS shell!
  exec(\`ping -c 2 \${host}\`, (error, stdout, stderr) => {
    return res.json({ output: stdout || stderr });
  });
});`,
      vulnerabilityHighlight: "Using exec() with string concatenation allows shell metacharacters (&&, ;, |) to spawn arbitrary operating system subprocesses."
    },
    secureCode: {
      language: 'javascript',
      file: 'server/controllers/diagnosticController.js',
      code: `// SECURE: Strict regex validation and execFile with argument array
const { execFile } = require('child_process');

app.post('/api/diagnostics', (req, res) => {
  const host = req.body.host;
  
  // 1. Validate that input is strictly a valid IP or hostname (no shell operators)
  const ipRegex = /^[a-zA-Z0-9.-]+$/;
  if (!ipRegex.test(host)) {
    return res.status(400).json({ error: 'Invalid host format' });
  }

  // 2. execFile does NOT invoke a shell interpreter, preventing command chaining!
  execFile('ping', ['-c', '2', host], (error, stdout, stderr) => {
    return res.json({ output: stdout || stderr });
  });
});`,
      remediationExplanation: "Validate inputs against a strict alphanumeric/IP whitelist, and use execFile() with arguments passed as an array instead of invoking a shell interpreter."
    }
  }
];

export const MOCK_SERVER_FILES: Record<string, { title: string; category: string; content: string; isRestricted?: boolean }> = {
  'hardware_guide.pdf': {
    title: 'Hardware Security Key Reference Manual',
    category: 'Public Manuals',
    content: `[CYBERFORGE HARDWARE REFERENCE MANUAL v2.4]
Section 1: Hardware Security Keys
- Cryptographic co-processor: ATECC608A
- FIPS 140-2 Level 3 physical enclosure
- Supported protocols: FIDO2, U2F, WebAuthn

Section 2: Operating Instructions
Insert key into USB-C port, wait for green LED pulse, touch capacitive sensor.`,
    isRestricted: false,
  },
  'firmware_v2.bin': {
    title: 'Hardware Cryptographic Firmware Specs',
    category: 'Public Specifications',
    content: `[BINARY FIRMWARE IMAGE DUMP - 0x7F454C46]
HEADER: CYBERFORGE_SEC_FW_REV_2.14.0
CHECKSUM: 0xA99B12C0948FF82
BOOTLOADER: SECURE_ENCLAVE_ACTIVE`,
    isRestricted: false,
  },
  'datasheet_laptop.txt': {
    title: 'Cyber Stealth Workstation Datasheet',
    category: 'Product Datasheets',
    content: `CYBER STEALTH PRO SPECIFICATION SHEET
CPU: Quantum Octa-Core 4.2GHz
RAM: 64GB ECC LPDDR5X
Storage: 2TB NVMe Self-Encrypting Drive (SED)
RF Shielding: MIL-STD-810H Faraday mesh housing`,
    isRestricted: false,
  },
  '../../../../etc/passwd': {
    title: '/etc/passwd (System Accounts File)',
    category: 'Operating System Core',
    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
cyberforge:x:1000:1000:CyberForge Production Server:/home/cyberforge:/bin/bash
admin:x:1001:1001:System Administrator:/home/admin:/bin/bash
cfo_elena:x:1002:1002:Elena Rostova:/home/cfo_elena:/bin/bash
cso_vikram:x:1003:1003:Vikram Rao:/home/cso_vikram:/bin/bash`,
    isRestricted: true,
  },
  '../../config/database.json': {
    title: 'Internal Database Configuration & Master Key',
    category: 'Application Configuration',
    content: `{
  "database": {
    "host": "db-internal.cyberforge.local",
    "port": 5432,
    "user": "db_master_admin",
    "password": "SUPER_SECRET_DATABASE_ROOT_KEY_2026!",
    "db_name": "cyberforge_production",
    "ssl": true
  },
  "encryption": {
    "master_aes_key": "4f9b8c2d1e0a7f6b5c4d3e2a1f0b9a8c"
  }
}`,
    isRestricted: true,
  },
  '../../secrets/server_flag.txt': {
    title: 'Server Master CTF Flag',
    category: 'Restricted Vault',
    content: `=====================================================
[+] CYBERFORGE PATH TRAVERSAL CTF CHALLENGE SOLVED!
[+] SENSITIVE SYSTEM FILE EXFILTRATED VIA DIRECTORY TRAVERSAL
[+] FLAG: FLAG{DIRECTORY_PATH_TRAVERSAL_ARBITRARY_READ_4829}
=====================================================`,
    isRestricted: true,
  },
  '../../../../windows/system.ini': {
    title: 'Windows system.ini Configuration',
    category: 'Operating System Core',
    content: `; for 16-bit app support
[drivers]
wave=mmdrv.dll
timer=timer.drv
[mci]
[driver32]
[386enh]
woafont=dosapp.fon
EGA80WOA.FON=EGA80WOA.FON
EGA40WOA.FON=EGA40WOA.FON
CGA80WOA.FON=CGA80WOA.FON
CGA40WOA.FON=CGA40WOA.FON`,
    isRestricted: true,
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Cyber Stealth Pro Gaming Laptop',
    price: 1999.00,
    originalPrice: 2499.00,
    description: 'Ultra-high-end neural-core workstation with encrypted BIOS, RTX 5090, 64GB DDR5 RAM. Used by elite security researchers.',
    category: 'Workstations',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stock: 7,
  },
  {
    id: 2,
    name: 'Hacker Cyberdeck Terminal V3',
    price: 449.00,
    originalPrice: 599.00,
    description: 'Custom mechanical cyberdeck running hardened Linux with built-in SDR receiver, dual OLED screens, and hot-swappable battery.',
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    stock: 12,
  },
  {
    id: 3,
    name: 'Tactical Hardware Security Key (Pack of 2)',
    price: 79.00,
    description: 'FIDO2 / U2F certified biometric hardware authenticator with tamper-evident titanium casing.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    stock: 35,
  },
  {
    id: 4,
    name: 'Glitch-Art Cyberpunk Stealth Hoodie',
    price: 65.00,
    description: 'RFID-blocking inner pockets, waterproof cybernetic weave with reflective circuit board patterns.',
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    stock: 20,
  },
  {
    id: 5,
    name: 'WiFi Penetration Tester Duck (USB Injection)',
    price: 54.00,
    description: 'Hardware keystroke injection tool with dual-band 2.4GHz/5GHz remote payload delivery.',
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    stock: 18,
  },
  // Hidden unreleased product that can be leaked via SQLi!
  {
    id: 99,
    name: '⚠️ [CLASSIFIED] Quantum Decryption ASIC Prototype',
    price: 99999.00,
    description: 'INTERNAL ONLY - CONFIDENTIAL R&D SPECIFICATION. NOT FOR PUBLIC RELEASE.',
    category: 'Classified R&D',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    stock: 1,
    isHidden: true,
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 1,
    author: 'Alex Mercer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    comment: 'The build quality on this machine is insane. The cooling system handles heavy binary analysis without breaking a sweat.',
    rating: 5,
    createdAt: '2 days ago',
  },
  {
    id: 'rev-2',
    productId: 1,
    author: 'Sarah Jenkins',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
    comment: 'Battery life is around 8 hours under normal development workloads. Screen is crisp and glare-resistant.',
    rating: 4,
    createdAt: '1 week ago',
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: '1042',
    orderNumber: 'ORD-2026-1042',
    customerId: '1042',
    customerName: 'Alex Chen (buyer_42)',
    customerEmail: 'buyer_42@cyberforge.corp',
    date: '2026-03-01',
    items: [
      { productId: 4, name: 'Glitch-Art Cyberpunk Stealth Hoodie', quantity: 1, price: 65.00 }
    ],
    total: 65.00,
    status: 'Delivered',
    shippingAddress: 'Apartment 4B, 742 Evergreen Terrace, Sector 7',
    isConfidential: false,
    internalNotes: 'Standard customer order. Delivered via drone.'
  },
  // Confidential Admin/CEO Order for IDOR exploitation!
  {
    id: '1001',
    orderNumber: 'ORD-2026-1001',
    customerId: '1001',
    customerName: 'Marcus Vance (CEO / Executive Admin)',
    customerEmail: 'ceo.vance@cyberforge.corp',
    date: '2026-03-05',
    items: [
      { productId: 1, name: 'Cyber Stealth Pro Gaming Laptop (Enterprise Batch x 15)', quantity: 15, price: 1999.00 },
      { productId: 99, name: 'Quantum Decryption ASIC Prototype', quantity: 1, price: 99999.00 }
    ],
    total: 129984.00,
    status: 'Processing',
    shippingAddress: 'EXECUTIVE SUITE 99, PENTHOUSE CYBER TOWER, FINANCIAL DISTRICT',
    isConfidential: true,
    internalNotes: 'CONFIDENTIAL: Charge corporate card ending *4019. Delivery code: VIP-ALPHA-9942. Security clearance Level 5 required.',
    vipToken: 'FLAG{IDOR_HORIZONTAL_ESCALATION_SUCCESS_1001}'
  },
  // CFO Order
  {
    id: '1002',
    orderNumber: 'ORD-2026-1002',
    customerId: '1002',
    customerName: 'Elena Rostova (Chief Financial Officer)',
    customerEmail: 'elena.cfo@cyberforge.corp',
    date: '2026-03-04',
    items: [
      { productId: 2, name: 'Hacker Cyberdeck Terminal V3 (x 4)', quantity: 4, price: 449.00 }
    ],
    total: 1796.00,
    status: 'Shipped',
    shippingAddress: 'CFO Suite 12, Financial District, Cyber Sector',
    isConfidential: true,
    internalNotes: 'Executive finance hardware requisition. Auth signature: ROSTOVA_CFO_99.'
  }
];

export const DEFAULT_USER: User = {
  id: '1042',
  username: 'buyer_42',
  name: 'Alex Chen',
  email: 'buyer_42@cyberforge.corp',
  role: 'customer',
  walletBalance: 50.00, // Important: $50 wallet balance for the $1,999 price tampering exploit!
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYnV5ZXJfNDIiLCJyb2xlIjoiY3VzdG9tZXIifQ'
};

export const ADMIN_USER: User = {
  id: '1001',
  username: 'administrator',
  name: 'Marcus Vance (CEO / Executive Admin)',
  email: 'ceo.vance@cyberforge.corp',
  role: 'admin',
  walletBalance: 250000.00,
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
  token: 'SECRET_SESSION_ADMIN_FLAG_SQLI_BYPASS_8849'
};
