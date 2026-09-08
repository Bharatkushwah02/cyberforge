import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CartItem,
  LabId,
  Order,
  Product,
  Review,
  UploadedFile,
  User,
  ServerDocument,
  DiagnosticResult,
} from '../types/store';
import {
  ADMIN_USER,
  DEFAULT_USER,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  LABS,
  MOCK_SERVER_FILES,
} from '../lib/mockData';
import {
  getSoundEnabled,
  playAlertChime,
  playClickSound,
  playSolvedFanfare,
  setSoundEnabled as setSoundSetting,
} from '../lib/sounds';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'flag';
}

const INITIAL_DATABASE_USERS: User[] = [
  {
    id: '1001',
    username: 'administrator',
    name: 'Marcus Vance (CEO & Executive Admin)',
    email: 'ceo.vance@cyberforge.corp',
    password: 'super_secret_admin_hash_9942',
    role: 'admin',
    walletBalance: 250000.00,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
    token: 'SECRET_SESSION_ADMIN_FLAG_SQLI_BYPASS_8849',
  },
  {
    id: '1002',
    username: 'elena_cfo',
    name: 'Elena Rostova (Chief Financial Officer)',
    email: 'elena.cfo@cyberforge.corp',
    password: 'Finance#Vault_Secure99',
    role: 'customer',
    walletBalance: 85000.00,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elena',
  },
  {
    id: '1003',
    username: 'vikram_sec',
    name: 'Vikram Rao (Chief Security Officer)',
    email: 'vikram.cso@cyberforge.corp',
    password: 'SecOps_Quantum_Key2026!',
    role: 'customer',
    walletBalance: 12500.00,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vikram',
  },
  {
    id: '1042',
    username: 'buyer_42',
    name: 'Alex Chen (Security Analyst / Demo User)',
    email: 'buyer_42@cyberforge.corp',
    password: 'student_password123',
    role: 'customer',
    walletBalance: 50.00,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYnV5ZXJfNDIiLCJyb2xlIjoiY3VzdG9tZXIifQ'
  }
];

interface StoreContextType {
  activeLabId: LabId | 'catalog';
  solvedLabs: LabId[];
  products: Product[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  reviews: Review[];
  uploadedFiles: UploadedFile[];
  databaseUsers: User[];
  currentView: 'store' | 'login' | 'product' | 'cart' | 'orders' | 'docs' | 'diagnostics' | 'labs';
  selectedProductId: number;
  soundEnabled: boolean;
  toasts: ToastMessage[];
  isSourceModalOpen: boolean;
  isSolutionDrawerOpen: boolean;
  isInterceptorOpen: boolean;
  
  // Actions
  setActiveLabId: (labId: LabId | 'catalog') => void;
  markLabSolved: (labId: LabId) => void;
  resetAllProgress: () => void;
  setCurrentView: (view: 'store' | 'login' | 'product' | 'cart' | 'orders' | 'docs' | 'diagnostics' | 'labs') => void;
  setSelectedProductId: (id: number) => void;
  toggleSound: () => void;
  setIsSourceModalOpen: (open: boolean) => void;
  setIsSolutionDrawerOpen: (open: boolean) => void;
  setIsInterceptorOpen: (open: boolean) => void;
  addToast: (title: string, message: string, type?: 'success' | 'danger' | 'info' | 'flag') => void;
  removeToast: (id: string) => void;

  // E-commerce & Security Interactions
  registerUser: (username: string, name: string, email: string, pass: string) => {
    success: boolean;
    error?: string;
    user?: User;
  };
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemPrice: (productId: number, newPrice: number) => void;
  checkout: (customPriceOverride?: number) => { success: boolean; error?: string; order?: Order };
  loginWithSql: (usernameInput: string, passwordInput: string) => {
    success: boolean;
    user?: User;
    error?: string;
    queryExecuted: string;
    isBypass: boolean;
  };
  logout: () => void;
  searchProducts: (query: string) => {
    results: Product[];
    queryExecuted: string;
    isSqlLeak: boolean;
    leakedUsers?: User[];
  };
  addReview: (productId: number, author: string, comment: string, rating: number) => {
    review: Review;
    triggeredXss: boolean;
    cookieStolen?: string;
  };
  lookupOrder: (orderIdInput: string) => { order?: Order; isIdor: boolean; error?: string };
  fetchServerDocument: (filenameInput: string) => {
    document?: ServerDocument;
    isTraversal: boolean;
    error?: string;
    requestedPath: string;
  };
  runNetworkDiagnostics: (hostInput: string) => DiagnosticResult;
  uploadSupportFile: (file: { name: string; size: number; content: string; mimeType: string }) => {
    file: UploadedFile;
    isShell: boolean;
  };
  executeWebShell: (fileId: string, command: string) => { output: string; flag?: string };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [activeLabId, setActiveLabIdState] = useState<LabId | 'catalog'>('sqli');
  const [solvedLabs, setSolvedLabs] = useState<LabId[]>(() => {
    try {
      const saved = localStorage.getItem('cyberforge_solved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [databaseUsers, setDatabaseUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('cyberforge_db_users');
      return saved ? JSON.parse(saved) : INITIAL_DATABASE_USERS;
    } catch {
      return INITIAL_DATABASE_USERS;
    }
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 }
  ]);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cyberforge_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('cyberforge_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const [currentView, setCurrentViewState] = useState<'store' | 'login' | 'product' | 'cart' | 'orders' | 'docs' | 'diagnostics' | 'labs'>(() => {
    try {
      const savedUser = localStorage.getItem('cyberforge_active_user');
      return savedUser ? 'store' : 'login';
    } catch {
      return 'login';
    }
  });
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getSoundEnabled);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isSolutionDrawerOpen, setIsSolutionDrawerOpen] = useState(false);
  const [isInterceptorOpen, setIsInterceptorOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cyberforge_solved', JSON.stringify(solvedLabs));
    } catch (e) {}
  }, [solvedLabs]);

  useEffect(() => {
    try {
      localStorage.setItem('cyberforge_db_users', JSON.stringify(databaseUsers));
    } catch (e) {}
  }, [databaseUsers]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('cyberforge_active_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('cyberforge_active_user');
      }
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('cyberforge_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setSoundSetting(next);
  };

  const addToast = (title: string, message: string, type: 'success' | 'danger' | 'info' | 'flag' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev: ToastMessage[]) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev: ToastMessage[]) => prev.filter((t: ToastMessage) => t.id !== id));
  };

  const markLabSolved = (labId: LabId) => {
    if (!solvedLabs.includes(labId)) {
      setSolvedLabs((prev: LabId[]) => [...prev, labId]);
      playSolvedFanfare();
      const lab = LABS.find((l) => l.id === labId);
      addToast(
        'LAB SOLVED!',
        `Congratulations! You solved "${lab?.title || labId}". Objective achieved!`,
        'flag'
      );
    }
  };

  const setCurrentView = (view: 'store' | 'login' | 'product' | 'cart' | 'orders' | 'docs' | 'diagnostics' | 'labs') => {
    if (!user && view !== 'login') {
      addToast('Authentication Required', 'Please register an account or sign in to access the labs.', 'info');
      setCurrentViewState('login');
      return;
    }
    setCurrentViewState(view);
  };

  const setActiveLabId = (labId: LabId | 'catalog') => {
    playClickSound();
    setActiveLabIdState(labId);
    if (!user) {
      if (labId === 'sqli') {
        setCurrentViewState('login');
      } else {
        addToast('Authentication Required', 'Please create an account or sign in first.', 'info');
        setCurrentViewState('login');
      }
      return;
    }
    if (labId === 'sqli') setCurrentViewState('store');
    else if (labId === 'idor') setCurrentViewState('orders');
    else if (labId === 'xss') {
      setSelectedProductId(1);
      setCurrentViewState('product');
    } else if (labId === 'traversal') setCurrentViewState('docs');
    else if (labId === 'command') setCurrentViewState('diagnostics');
    else if (labId === 'catalog') setCurrentViewState('labs');
  };

  const resetAllProgress = () => {
    playClickSound();
    setSolvedLabs([]);
    setDatabaseUsers(INITIAL_DATABASE_USERS);
    setProducts(INITIAL_PRODUCTS);
    setCart([{ product: INITIAL_PRODUCTS[0], quantity: 1 }]);
    setUser(null);
    setOrders(INITIAL_ORDERS);
    setReviews(INITIAL_REVIEWS);
    setUploadedFiles([]);
    localStorage.removeItem('cyberforge_solved');
    localStorage.removeItem('cyberforge_db_users');
    localStorage.removeItem('cyberforge_orders');
    localStorage.removeItem('cyberforge_active_user');
    setCurrentViewState('login');
    addToast('State Reset', 'Store and lab progress have been reset to factory defaults. Please register or sign in.', 'info');
  };

  // Real-Time Account Registration
  const registerUser = (username: string, name: string, email: string, pass: string) => {
    playClickSound();
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !pass) {
      return { success: false, error: 'Username and password are required' };
    }

    if (databaseUsers.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'Username already exists in the database' };
    }

    const nextId = (1043 + Math.max(0, databaseUsers.length - 4)).toString();

    const newUser: User = {
      id: nextId,
      username: cleanUser,
      name: name.trim() || cleanUser,
      email: email.trim() || `${cleanUser}@cyberforge.corp`,
      password: pass,
      role: 'customer',
      walletBalance: 50.00, // $50 balance enables the $1,999 laptop price manipulation challenge!
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
      token: `AUTH_${Math.random().toString(36).substring(2).toUpperCase()}`
    };

    // Also create a personal starter order for this user for IDOR testing
    const newOrder: Order = {
      id: nextId,
      orderNumber: `ORD-2026-${nextId}`,
      customerId: newUser.id,
      customerName: newUser.name,
      customerEmail: newUser.email,
      date: new Date().toISOString().split('T')[0],
      items: [
        { productId: 4, name: 'Glitch-Art Cyberpunk Stealth Hoodie', quantity: 1, price: 65.00 }
      ],
      total: 65.00,
      status: 'Delivered',
      shippingAddress: `Residence of ${newUser.name}, Sector 7`,
      isConfidential: false,
      internalNotes: `Account registered dynamically on ${new Date().toLocaleTimeString()}`
    };

    setDatabaseUsers((prev) => [...prev, newUser]);
    setOrders((prev) => [...prev, newOrder]);
    setUser(newUser);
    setCurrentViewState('store');

    addToast(
      'Account Created & Committed to Database!',
      `Welcome, ${newUser.name}! Your account (ID: ${newUser.id}) is live in the database.`,
      'success'
    );

    return { success: true, user: newUser };
  };

  const addToCart = (product: Product, quantity = 1) => {
    playClickSound();
    setCart((prev: CartItem[]) => {
      const existing = prev.find((item: CartItem) => item.product.id === product.id);
      if (existing) {
        return prev.map((item: CartItem) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast('Added to Cart', `${product.name} (x${quantity}) was added to your cart.`, 'info');
  };

  const removeFromCart = (productId: number) => {
    playClickSound();
    setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.product.id !== productId));
  };

  const updateCartItemPrice = (productId: number, newPrice: number) => {
    setCart((prev: CartItem[]) =>
      prev.map((item: CartItem) =>
        item.product.id === productId ? { ...item, tamperedPrice: newPrice } : item
      )
    );
  };

  const checkout = (customPriceOverride?: number) => {
    if (!user) {
      return { success: false, error: 'Please sign in or register before checking out!' };
    }

    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty!' };
    }

    let total = 0;
    cart.forEach((item: CartItem) => {
      const price = customPriceOverride !== undefined
        ? customPriceOverride
        : (item.tamperedPrice !== undefined ? item.tamperedPrice : item.product.price);
      total += price * item.quantity;
    });

    if (user.walletBalance < total) {
      playAlertChime();
      return {
        success: false,
        error: `Insufficient Funds! Total is $${total.toFixed(2)}, but your wallet only has $${user.walletBalance.toFixed(2)}.`,
      };
    }

    const hasHighEndLaptop = cart.some((i: CartItem) => i.product.id === 1);
    const isPriceTampered = hasHighEndLaptop && total <= 50.00;

    const newOrder: Order = {
      id: (orders.length + 1043).toString(),
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      date: new Date().toISOString().split('T')[0],
      items: cart.map((i: CartItem) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: i.tamperedPrice !== undefined ? i.tamperedPrice : (customPriceOverride || i.product.price),
      })),
      total: total,
      status: 'Processing',
      shippingAddress: '742 Evergreen Terrace, Cyber Sector',
      isConfidential: false,
    };

    setUser((prev) => prev ? { ...prev, walletBalance: prev.walletBalance - total } : null);
    setOrders((prev: Order[]) => [newOrder, ...prev]);
    setCart([]);

    if (isPriceTampered) {
      addToast(
        'Price Tampered',
        `Purchased $1,999.00 laptop for only $${total.toFixed(2)}!`,
        'info'
      );
    } else {
      addToast('Order Placed', `Order ${newOrder.orderNumber} placed successfully.`, 'success');
    }

    return { success: true, order: newOrder };
  };

  const loginWithSql = (usernameInput: string, passwordInput: string) => {
    playClickSound();
    const queryExecuted = `SELECT * FROM users WHERE username = '${usernameInput}' AND password = '${passwordInput}';`;

    const isSqliBypass =
      /'\s*(OR|or)\s*('?1'?\s*=\s*'?1'?|[a-zA-Z0-9_]+\s*=\s*[a-zA-Z0-9_]+)/i.test(usernameInput) ||
      usernameInput.includes("' OR '1'='1") ||
      usernameInput.includes("' OR 1=1") ||
      usernameInput.trim().startsWith("admin' --") ||
      usernameInput.trim().startsWith("admin'--");

    if (isSqliBypass) {
      const targetAdmin = databaseUsers.find((u) => u.role === 'admin') || ADMIN_USER;
      setUser(targetAdmin);
      markLabSolved('sqli');
      setCurrentViewState('store');
      addToast(
        'SQL Injection Auth Bypass!',
        `Query evaluated to TRUE! Authenticated as "${targetAdmin.name}".`,
        'success'
      );
      return {
        success: true,
        user: targetAdmin,
        queryExecuted,
        isBypass: true,
      };
    }

    // Check against real databaseUsers table
    const matched = databaseUsers.find(
      (u) =>
        (u.username.toLowerCase() === usernameInput.toLowerCase().trim() || u.email.toLowerCase() === usernameInput.toLowerCase().trim()) &&
        (u.password === passwordInput || passwordInput === 'password123')
    );

    if (matched) {
      setUser(matched);
      setCurrentViewState('store');
      addToast('Logged In', `Welcome back, ${matched.name}!`, 'info');
      return { success: true, user: matched, queryExecuted, isBypass: false };
    }

    playAlertChime();
    return {
      success: false,
      error: 'Invalid credentials! SQL Query returned 0 rows in users table.',
      queryExecuted,
      isBypass: false,
    };
  };

  const logout = () => {
    playClickSound();
    setUser(null);
    localStorage.removeItem('cyberforge_active_user');
    setCurrentViewState('login');
    addToast('Signed Out', 'Session terminated. Please sign in or register to continue.', 'info');
  };

  const searchProducts = (query: string) => {
    const rawSql = `SELECT * FROM products WHERE is_hidden = 0 AND name LIKE '%${query}%';`;
    const isUnionLeak =
      /'\s*(UNION|union)\s*(SELECT|select)/i.test(query) ||
      query.includes("' OR 1=1") ||
      query.includes("' OR '1'='1");

    if (isUnionLeak) {
      markLabSolved('sqli');
      addToast(
        'SQL UNION Injection!',
        'Internal classified products AND user credentials dumped from database!',
        'success'
      );
      return {
        results: products,
        queryExecuted: rawSql,
        isSqlLeak: true,
        leakedUsers: databaseUsers,
      };
    }

    if (!query.trim()) {
      return {
        results: products.filter((p: Product) => !p.isHidden),
        queryExecuted: rawSql,
        isSqlLeak: false,
      };
    }

    const filtered = products.filter(
      (p: Product) => !p.isHidden && p.name.toLowerCase().includes(query.toLowerCase())
    );
    return { results: filtered, queryExecuted: rawSql, isSqlLeak: false };
  };

  const addReview = (productId: number, author: string, comment: string, rating: number) => {
    playClickSound();
    const xssRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<[a-z]+[^>]+(onerror|onload|onclick|onmouseover)\s*=\s*['"]?[^'"]+['"]?/i;
    const isXss = xssRegex.test(comment) || comment.includes('<script>') || comment.includes('onerror=');

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      author: author || user?.name || 'Anonymous Researcher',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${author || user?.name || 'Anonymous'}`,
      comment,
      rating,
      createdAt: 'Just now',
      isMalicious: isXss,
    };

    setReviews((prev: Review[]) => [newRev, ...prev]);

    let cookieStolen: string | undefined;
    if (isXss) {
      cookieStolen = 'session_id=FLAG{STORED_XSS_COOKIE_STEALER_7749}; admin_token=SEC_098_ROOT';
      playAlertChime();
      markLabSolved('xss');
      addToast(
        'Stored XSS Executed!',
        `XSS Payload rendered! Victim session cookie exfiltrated: "${cookieStolen.substring(0, 30)}..."`,
        'danger'
      );
    } else {
      addToast('Review Posted', 'Thank you for your feedback.', 'info');
    }

    return { review: newRev, triggeredXss: isXss, cookieStolen };
  };

  const lookupOrder = (orderIdInput: string) => {
    playClickSound();
    const cleanId = orderIdInput.trim();
    const found = orders.find((o: Order) => o.id === cleanId || o.orderNumber.toLowerCase() === cleanId.toLowerCase());

    if (!found) {
      playAlertChime();
      return { isIdor: false, error: `Order #${cleanId} not found in the database!` };
    }

    const currentUserId = user?.id || '';
    const isIdorBreach = (found.customerId !== currentUserId || cleanId === '1001' || cleanId === '1002') && user?.role !== 'admin';
    if (isIdorBreach) {
      markLabSolved('idor');
      addToast(
        'IDOR Vulnerability Triggered!',
        `Horizontal Privilege Escalation: Confidential invoice of "${found.customerName}" accessed without authorization!`,
        'flag'
      );
    } else {
      addToast('Order Found', `Retrieved order record #${found.id}`, 'info');
    }

    return { order: found, isIdor: isIdorBreach };
  };

  const fetchServerDocument = (filenameInput: string) => {
    playClickSound();
    const cleanInput = filenameInput.trim();
    const isTraversal =
      cleanInput.includes('../') ||
      cleanInput.includes('..\\') ||
      cleanInput.includes('etc/passwd') ||
      cleanInput.includes('database.json') ||
      cleanInput.includes('server_flag.txt') ||
      cleanInput.includes('system.ini');

    let matchedKey: string | undefined;
    if (MOCK_SERVER_FILES[cleanInput]) {
      matchedKey = cleanInput;
    } else {
      const keys = Object.keys(MOCK_SERVER_FILES);
      matchedKey = keys.find((k) => cleanInput.endsWith(k) || k.endsWith(cleanInput));
    }

    if (matchedKey && MOCK_SERVER_FILES[matchedKey]) {
      const file = MOCK_SERVER_FILES[matchedKey];
      const doc: ServerDocument = {
        filename: cleanInput,
        title: file.title,
        category: file.category,
        content: file.content,
        isRestricted: file.isRestricted,
      };

      if (isTraversal || file.isRestricted) {
        markLabSolved('traversal');
        playSolvedFanfare();
        addToast(
          'PATH TRAVERSAL EXPLOIT!',
          `Directory boundary breached! Read restricted server file: "${cleanInput}"`,
          'flag'
        );
      } else {
        addToast('Document Loaded', `Fetched ${file.title} successfully.`, 'info');
      }

      return { document: doc, isTraversal: isTraversal || !!file.isRestricted, requestedPath: cleanInput };
    }

    return {
      error: `ENOENT: no such file or directory, open '/var/www/cyberforge/public/docs/${cleanInput}'`,
      isTraversal,
      requestedPath: cleanInput,
    };
  };

  const runNetworkDiagnostics = (hostInput: string): DiagnosticResult => {
    playClickSound();
    const cleanHost = hostInput.trim();
    const hasCommandInjection =
      /[;&|]/.test(cleanHost) ||
      /\b(cat|whoami|id|ls|dir|uname|echo|hostname)\b/i.test(cleanHost);

    if (hasCommandInjection) {
      markLabSolved('command');
      playSolvedFanfare();

      let executedCommand = 'whoami';
      let injectedOutput = '';
      const flag = 'FLAG{OS_COMMAND_INJECTION_ROOT_RCE_9981}';

      if (/cat\s+.*flag|type\s+.*flag/i.test(cleanHost) || cleanHost.includes('secret')) {
        executedCommand = 'cat secret_root_flag.txt';
        injectedOutput = `=====================================================
[+] REMOTE CODE EXECUTION (RCE) ACHIEVED!
[+] ROOT OPERATING SYSTEM COMMAND EXECUTED!
[+] CAPTURED FLAG: ${flag}
=====================================================`;
      } else if (/whoami/i.test(cleanHost)) {
        executedCommand = 'whoami';
        injectedOutput = 'www-data (uid=33, gid=33)';
      } else if (/id\b/i.test(cleanHost)) {
        executedCommand = 'id';
        injectedOutput = 'uid=33(www-data) gid=33(www-data) groups=33(www-data),1000(cyberforge)';
      } else if (/ls|dir/i.test(cleanHost)) {
        executedCommand = 'ls -la';
        injectedOutput = `total 36
drwxr-xr-x 4 www-data www-data  4096 Mar 8 18:30 .
drwxr-xr-x 3 root     root      4096 Mar 1 10:00 ..
-rwxr-xr-x 1 www-data www-data 12048 Mar 8 18:15 server.js
-rw------- 1 root     root       148 Mar 8 18:20 secret_root_flag.txt
drwxr-xr-x 2 www-data www-data  4096 Mar 8 17:00 public
drwxr-xr-x 3 www-data www-data  4096 Mar 8 17:10 controllers`;
      } else {
        executedCommand = cleanHost.split(/[;&|]/).pop()?.trim() || 'whoami';
        injectedOutput = `[Command Execution: '${executedCommand}']\nuid=33(www-data) gid=33(www-data)\n${flag}`;
      }

      const pingPreamble = `PING ${cleanHost.split(/[;&|]/)[0].trim() || '127.0.0.1'} (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms\n\n--- Subprocess Output (PID 4491) ---`;

      addToast(
        'COMMAND INJECTION (RCE)!',
        `Arbitrary OS shell command executed! Host output captured.`,
        'flag'
      );

      return {
        host: cleanHost,
        output: `${pingPreamble}\n${injectedOutput}`,
        commandInjected: true,
        executedCommand,
        flag,
      };
    }

    // Normal Ping
    const pingHost = cleanHost || '127.0.0.1';
    const normalOutput = `PING ${pingHost} (${pingHost === 'localhost' ? '127.0.0.1' : pingHost}) 56(84) bytes of data.
64 bytes from ${pingHost}: icmp_seq=1 ttl=64 time=0.824 ms
64 bytes from ${pingHost}: icmp_seq=2 ttl=64 time=0.791 ms

--- ${pingHost} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 0.791/0.807/0.824/0.016 ms`;

    addToast('Ping Complete', `Diagnostic response received from ${pingHost}.`, 'info');

    return {
      host: cleanHost,
      output: normalOutput,
      commandInjected: false,
    };
  };

  const uploadSupportFile = (file: { name: string; size: number; content: string; mimeType: string }) => {
    playClickSound();
    const lower = file.name.toLowerCase();
    const isPhp = lower.endsWith('.php') || lower.endsWith('.phtml') || lower.includes('.php.');

    const uploaded: UploadedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.mimeType || 'application/octet-stream',
      uploadedAt: new Date().toLocaleTimeString(),
      url: `/uploads/${file.name}`,
      isExecutable: isPhp,
      content: file.content || '/* Diagnostic Web Shell */',
    };

    setUploadedFiles((prev: UploadedFile[]) => [uploaded, ...prev]);

    if (isPhp) {
      addToast(
        'Script Uploaded',
        `Executable script "${file.name}" saved to /uploads/.`,
        'info'
      );
    } else {
      addToast('File Attached', `Saved ${file.name} to support ticket.`, 'info');
    }

    return { file: uploaded, isShell: isPhp };
  };

  const executeWebShell = (fileId: string, command: string) => {
    const cmd = command.trim().toLowerCase();
    let output = '';
    let flag: string | undefined;

    if (cmd === 'whoami') {
      output = 'www-data (uid=33, gid=33)';
    } else if (cmd === 'id') {
      output = 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
    } else if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'dir') {
      output = 'total 28\ndrwxr-xr-x 2 www-data www-data 4096 Mar 8 18:00 .\ndrwxr-xr-x 4 root root 4096 Mar 8 17:30 ..\n-rw-r--r-- 1 www-data www-data   45 Mar 8 18:00 shell.php\n-rw------- 1 root root   64 Mar 8 17:00 secret_flag.txt\n-rw-r--r-- 1 www-data www-data 1204 Mar 8 17:15 index.php';
    } else if (cmd.includes('cat secret_flag.txt') || cmd.includes('type secret_flag.txt')) {
      flag = 'FLAG{LEGACY_UPLOAD_DEMO_FLAG}';
      output = flag;
    } else if (cmd === 'uname -a') {
      output = 'Linux cybermart-node-01 6.5.0-generic #42-Ubuntu SMP x86_64 GNU/Linux';
    } else if (cmd === 'pwd') {
      output = '/var/www/html/uploads';
    } else if (cmd === 'help') {
      output = 'Simulated Commands: whoami, id, ls, ls -la, pwd, cat secret_flag.txt, uname -a';
    } else {
      output = `sh: command not found: ${command}. Type 'help' for available simulated commands.`;
    }

    return { output, flag };
  };

  return (
    <StoreContext.Provider
      value={{
        activeLabId,
        solvedLabs,
        products,
        cart,
        user,
        orders,
        reviews,
        uploadedFiles,
        databaseUsers,
        currentView,
        selectedProductId,
        soundEnabled,
        toasts,
        isSourceModalOpen,
        isSolutionDrawerOpen,
        isInterceptorOpen,
        setActiveLabId,
        markLabSolved,
        resetAllProgress,
        setCurrentView,
        setSelectedProductId,
        toggleSound,
        setIsSourceModalOpen,
        setIsSolutionDrawerOpen,
        setIsInterceptorOpen,
        addToast,
        removeToast,
        registerUser,
        addToCart,
        removeFromCart,
        updateCartItemPrice,
        checkout,
        loginWithSql,
        logout,
        searchProducts,
        addReview,
        lookupOrder,
        fetchServerDocument,
        runNetworkDiagnostics,
        uploadSupportFile,
        executeWebShell,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
