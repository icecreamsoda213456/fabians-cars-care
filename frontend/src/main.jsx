import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Banknote,
  ArrowLeft,
  BarChart3,
  Barcode,
  Bell,
  Boxes,
  Building2,
  Car,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  History,
  ImagePlus,
  LockKeyhole,
  MonitorPlay,
  Minus,
  Pencil,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Trash2,
  Upload,
  Users,
  UserPlus,
  Wifi,
  X,
} from 'lucide-react';
import AuthScreen from './components/AuthScreen.jsx';
import './styles.css';
import './app-theme.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://cristian-portfolio-opal.vercel.app/#projects';
const SALE_SYNC_KEY = 'fabians-sale-sync';

const demoSession = {
  token: 'frontend-demo-session',
  user: {
    id: 1,
    username: 'demo-owner',
    name: 'Demo Owner',
    role: 'owner',
  },
};

const fallbackProducts = [
  { id: 105, name: 'C-312 Oil Filter', category: 'C Oil Filter', barcode: '4971295131204', stock: 6, salePrice: 230, imageUrl: '/product-images/oil-filter.svg', status: 'Healthy' },
  { id: 121, name: 'YAMALUBE AT 20W-40 1L', category: 'Yamaha', barcode: '90793AP42900', stock: 7, salePrice: 300, imageUrl: '/product-images/yamalube.svg', status: 'Healthy' },
  { id: 126, name: 'Petron Sprint 4T 1L', category: 'Petron', barcode: '4806505973629', stock: 11, salePrice: 200, imageUrl: '/product-images/petron-oil.svg', status: 'Healthy' },
  { id: 131, name: 'Repsol Motorcycle Oil', category: 'Repsol', barcode: '8886351385063', stock: 1, salePrice: 270, imageUrl: '/product-images/repsol-oil.svg', status: 'Low stock' },
  { id: 108, name: 'BOSNY Spray Paint Silver Grey', category: 'BOSNY Spray Paint', barcode: '8850747502228', stock: 10, salePrice: 125, imageUrl: '/product-images/spray-paint.svg', status: 'Healthy' },
];

const fallbackSales = [
  { id: 'S-1008', receipt_no: 'FC-1008', total_items: 2, total_amount: 460, sale_date: 'Today, 10:42 AM', payment_method: 'cash', status: 'paid' },
  { id: 'S-1007', receipt_no: 'FC-1007', total_items: 1, total_amount: 300, sale_date: 'Today, 9:18 AM', payment_method: 'cash', status: 'paid' },
  { id: 'S-1006', receipt_no: 'FC-1006', total_items: 2, total_amount: 400, sale_date: 'Yesterday, 4:55 PM', payment_method: 'gcash', status: 'paid' },
];

const fallbackReport = {
  overview: {
    revenue: 1160,
    transactions: 3,
    unitsSold: 5,
    averageOrder: 387,
  },
  dailySales: [
    { label: 'Mon', revenue: 280, transactions: 1 },
    { label: 'Tue', revenue: 0, transactions: 0 },
    { label: 'Wed', revenue: 460, transactions: 1 },
    { label: 'Thu', revenue: 125, transactions: 1 },
    { label: 'Fri', revenue: 300, transactions: 1 },
    { label: 'Sat', revenue: 520, transactions: 2 },
    { label: 'Sun', revenue: 200, transactions: 1 },
  ],
  topProducts: [
    { name: 'C-312 Oil Filter', quantity: 2, revenue: 460 },
    { name: 'YAMALUBE AT 20W-40 1L', quantity: 1, revenue: 300 },
    { name: 'Petron Sprint 4T 1L', quantity: 2, revenue: 400 },
  ],
  categoryStock: [
    { category: 'C Oil Filter', stock: 6, stockValue: 1380 },
    { category: 'Petron', stock: 11, stockValue: 2200 },
    { category: 'BOSNY Spray Paint', stock: 10, stockValue: 1250 },
  ],
  categorySales: [
    { category: 'C Oil Filter', revenue: 460 },
    { category: 'Petron', revenue: 400 },
    { category: 'Yamaha', revenue: 300 },
  ],
  weeklyBestSellers: [
    { name: 'C-312 Oil Filter', quantity: 2, revenue: 460 },
    { name: 'Petron Sprint 4T 1L', quantity: 2, revenue: 400 },
    { name: 'YAMALUBE AT 20W-40 1L', quantity: 1, revenue: 300 },
  ],
  monthlyBestSellers: [
    { name: 'C-312 Oil Filter', quantity: 8, revenue: 1840 },
    { name: 'Petron Sprint 4T 1L', quantity: 6, revenue: 1200 },
    { name: 'BOSNY Spray Paint Silver Grey', quantity: 5, revenue: 625 },
  ],
  monthlySales: [
    { label: 'Feb 2026', revenue: 980, transactions: 4 },
    { label: 'Mar 2026', revenue: 1260, transactions: 5 },
    { label: 'Apr 2026', revenue: 1580, transactions: 7 },
    { label: 'May 2026', revenue: 1320, transactions: 6 },
    { label: 'Jun 2026', revenue: 2110, transactions: 9 },
    { label: 'Jul 2026', revenue: 1160, transactions: 3 },
  ],
  lowStock: [
    { name: 'Repsol Motorcycle Oil', stock: 1, reorderLevel: 3 },
  ],
  recentSales: fallbackSales.map((sale) => ({
    receiptNo: sale.receipt_no,
    saleDate: sale.sale_date,
    totalAmount: sale.total_amount,
    paymentMethod: sale.payment_method,
    status: sale.status,
  })),
  range: {
    from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  },
};

const defaultPosSettings = {
  id: 1,
  shopName: "Fabian's Car Care",
  shopAddress: '',
  contactNumber: '',
  tin: '',
  shopLogoUrl: '',
  receiptFooter: "Thank you for choosing Fabian's Car Care.",
  receiptPaperSize: '80mm',
  autoOpenReceipt: true,
  autoPrintReceipt: false,
  enabledPaymentMethods: ['cash', 'gcash', 'card'],
  defaultPaymentMethod: 'cash',
  commonBills: [100, 200, 500, 1000],
  barcodeAutoAdd: true,
  defaultReorderLevel: 3,
  recycleRetentionDays: 30,
  inactivityTimeoutMinutes: 30,
  cashierVoidReasonRequired: true,
  updatedBy: null,
  updatedByName: null,
  updatedAt: null,
};

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'POS Scanner', icon: ShoppingCart },
  { label: 'Products', icon: Boxes },
  { label: 'Owner Recycle Bin', icon: Trash2 },
  { label: 'Sales', icon: Receipt },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Users', icon: Users },
  { label: 'Settings', icon: Settings },
];

function formatPeso(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '');

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

async function apiGet(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
  return data;
}

async function apiPost(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
  return data;
}

async function apiPatch(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
  return data;
}

async function apiDelete(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
  return data;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Image must be below 5MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });
}

function canAccess(role, label) {
  if (label === 'Owner Recycle Bin' || label === 'Users') return role === 'owner';
  if (role === 'owner' || role === 'admin') return true;
  return label === 'POS Scanner';
}

function App() {
  const savedSession = DEMO_MODE ? demoSession : readSavedSession();
  const [session, setSession] = React.useState(savedSession);
  const [activeView, setActiveView] = React.useState(savedSession?.user.role === 'cashier' ? 'POS Scanner' : 'Dashboard');
  const [query, setQuery] = React.useState('');
  const [notice, setNotice] = React.useState('Ready for barcode input');
  const [apiStatus, setApiStatus] = React.useState('Checking API');
  const [products, setProducts] = React.useState(fallbackProducts);
  const [deletedProducts, setDeletedProducts] = React.useState([]);
  const [sales, setSales] = React.useState(fallbackSales);
  const [report, setReport] = React.useState(fallbackReport);
  const [reportRange, setReportRange] = React.useState(fallbackReport.range);
  const [dashboard, setDashboard] = React.useState({
    products: fallbackProducts.length,
    lowStock: fallbackProducts.filter((product) => product.stock <= 3).length,
    todaySales: fallbackSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
    activeUsers: 2,
  });
  const [cart, setCart] = React.useState([]);
  const [activeReceipt, setActiveReceipt] = React.useState(null);
  const [posSettings, setPosSettings] = React.useState(defaultPosSettings);
  const [isProductFormOpen, setIsProductFormOpen] = React.useState(false);
  const globalScanner = React.useRef({
    value: '',
    lastKeyAt: 0,
    largestGap: 0,
  });

  const visibleNavItems = navItems.filter((item) => canAccess(session?.user.role, item.label));

  async function refreshOperationalData() {
    if (!session?.token) return;

    const [dashboardData, productData, saleData, reportData] = await Promise.all([
      apiGet('/dashboard'),
      apiGet('/products'),
      apiGet('/sales', session.token),
      apiGet(`/reports/summary?from=${reportRange.from}&to=${reportRange.to}`),
    ]);
    setDashboard(dashboardData);
    setProducts(productData);
    setSales(saleData);
    setReport(mergeReport(reportData));
  }

  React.useEffect(() => {
    if (!session?.token) return undefined;
    if (DEMO_MODE) {
      setApiStatus('Frontend demo mode - sample data');
      return undefined;
    }

    let alive = true;

    async function loadData() {
      try {
        const [health, dashboardData, productData, saleData, reportData] = await Promise.all([
          apiGet('/health'),
          apiGet('/dashboard'),
          apiGet('/products'),
          apiGet('/sales', session.token),
          apiGet(`/reports/summary?from=${reportRange.from}&to=${reportRange.to}`),
        ]);

        if (!alive) return;
        setApiStatus(`Connected - ${new Date(health.databaseTime).toLocaleTimeString()}`);
        setDashboard(dashboardData);
        setProducts(productData);
        setSales(saleData);
        setReport(mergeReport(reportData));
      } catch {
        if (!alive) return;
        setApiStatus('Using demo data - start backend API on port 4000');
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [session?.token]);

  React.useEffect(() => {
    if (!session?.token || DEMO_MODE) return undefined;

    let alive = true;
    apiGet('/settings', session.token)
      .then((settings) => {
        if (alive) setPosSettings({ ...defaultPosSettings, ...settings });
      })
      .catch((error) => {
        if (alive) setNotice(`Unable to load POS settings: ${error.message}`);
      });

    return () => {
      alive = false;
    };
  }, [session?.token]);

  React.useEffect(() => {
    if (!session?.token) return undefined;

    const timeoutMilliseconds = Math.max(
      Number(posSettings.inactivityTimeoutMinutes || 30),
      5
    ) * 60 * 1000;
    let inactivityTimer;

    function resetInactivityTimer() {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        setNotice('Session ended after a period of inactivity');
        logout();
      }, timeoutMilliseconds);
    }

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    return () => {
      window.clearTimeout(inactivityTimer);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [session?.token, posSettings.inactivityTimeoutMinutes]);

  React.useEffect(() => {
    if (!session?.token) return undefined;

    function handleSaleSync(event) {
      if (event.key !== SALE_SYNC_KEY || !event.newValue) return;

      try {
        const update = JSON.parse(event.newValue);
        const refreshTasks = [refreshOperationalData()];
        if (Number(activeReceipt?.id) === Number(update.saleId)) {
          refreshTasks.push(
            apiGet(`/sales/${Number(update.saleId)}`, session.token).then(setActiveReceipt)
          );
        }

        Promise.all(refreshTasks).catch((error) => {
          setNotice(`Unable to refresh sale updates: ${error.message}`);
        });
      } catch {
        // Ignore malformed cross-tab notifications.
      }
    }

    window.addEventListener('storage', handleSaleSync);
    return () => window.removeEventListener('storage', handleSaleSync);
  }, [session?.token, reportRange.from, reportRange.to, activeReceipt?.id]);

  React.useEffect(() => {
    if (session?.user.role !== 'owner' || DEMO_MODE) return undefined;

    let alive = true;

    async function loadDeletedProducts() {
      try {
        const deletedProductData = await fetch(`${API_BASE}/products/deleted`, {
          headers: { Authorization: `Bearer ${session.token}` },
        }).then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
          return data;
        });

        if (alive) setDeletedProducts(deletedProductData);
      } catch (error) {
        if (alive) setNotice(`Unable to load recycle bin: ${error.message}`);
      }
    }

    loadDeletedProducts();
    return () => {
      alive = false;
    };
  }, [session?.token, session?.user.role]);

  async function loadReportRange(range, options = {}) {
    if (DEMO_MODE) {
      setReportRange(range);
      setReport(mergeReport({ ...fallbackReport, range }));
      if (!options.silent) setNotice(`Demo report updated from ${range.from} to ${range.to}`);
      return;
    }

    try {
      const reportData = await apiGet(`/reports/summary?from=${range.from}&to=${range.to}`);
      setReportRange(reportData.range || range);
      setReport(mergeReport(reportData));
      if (!options.silent) {
        setNotice(`Reports updated from ${range.from} to ${range.to}`);
      }
    } catch (error) {
      if (!options.silent) {
        setNotice(`Unable to update reports: ${error.message}`);
      }
    }
  }

  React.useEffect(() => {
    if (activeView !== 'Reports') return undefined;

    const refreshTimer = window.setInterval(() => {
      loadReportRange(reportRange, { silent: true });
    }, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [activeView, reportRange]);

  React.useEffect(() => {
    if (activeView !== 'Products' && query) setQuery('');
  }, [activeView, query]);

  React.useEffect(() => {
    const supportsGlobalScan = activeView === 'Dashboard' || activeView === 'Products';
    if (!session?.token || !supportsGlobalScan) return undefined;

    function resetGlobalScanner() {
      globalScanner.current = {
        value: '',
        lastKeyAt: 0,
        largestGap: 0,
      };
    }

    function handleGlobalScanner(event) {
      if (
        event.defaultPrevented
        || event.repeat
        || event.isComposing
        || event.ctrlKey
        || event.altKey
        || event.metaKey
      ) return;

      const isInsideProductForm = event.target?.closest?.('.product-edit-form');
      if ((activeView === 'Products' && isProductFormOpen) || isInsideProductForm) {
        resetGlobalScanner();
        return;
      }

      const now = performance.now();
      const scannerState = globalScanner.current;

      if (event.key === 'Enter') {
        const code = scannerState.value.trim();
        const enteredImmediately = scannerState.lastKeyAt
          && now - scannerState.lastKeyAt <= 180;
        const scannerSpeed = scannerState.largestGap <= 100;
        const isLikelyBarcode = code.length >= 4 && enteredImmediately && scannerSpeed;
        resetGlobalScanner();

        if (!isLikelyBarcode) return;
        event.preventDefault();
        event.stopPropagation();
        scanBarcode(code, {
          navigateToPos: true,
          source: 'global barcode scan',
        });
        return;
      }

      if (event.key.length !== 1) {
        if (event.key === 'Escape' || event.key === 'Tab') resetGlobalScanner();
        return;
      }

      const gap = scannerState.lastKeyAt ? now - scannerState.lastKeyAt : 0;
      if (gap > 120) {
        resetGlobalScanner();
      }

      const currentState = globalScanner.current;
      currentState.value += event.key;
      currentState.largestGap = Math.max(currentState.largestGap, gap > 120 ? 0 : gap);
      currentState.lastKeyAt = now;
    }

    window.addEventListener('keydown', handleGlobalScanner, true);
    return () => {
      window.removeEventListener('keydown', handleGlobalScanner, true);
      resetGlobalScanner();
    };
  }, [
    activeView,
    cart,
    isProductFormOpen,
    products,
    session?.token,
  ]);

  async function updateProduct(productId, updates) {
    const updatedProduct = await apiPatch(`/products/${productId}`, updates, session.token);
    setProducts((currentProducts) => currentProducts.map((product) => (
      product.id === updatedProduct.id ? updatedProduct : product
    )));
    setCart((currentCart) => currentCart.flatMap((item) => {
      if (item.id !== updatedProduct.id) return [item];

      const stock = Number(updatedProduct.stock);
      if (stock <= 0) return [];

      const qty = Math.min(item.qty, stock);
      const unitPrice = Number(updatedProduct.salePrice);
      return [{
        ...item,
        name: updatedProduct.name,
        barcode: updatedProduct.barcode,
        imageUrl: updatedProduct.imageUrl,
        stock,
        unitPrice,
        qty,
        total: unitPrice * qty,
      }];
    }));
    setNotice(`${updatedProduct.name} updated`);
  }

  async function savePosSettings(nextSettings) {
    const savedSettings = await apiPatch('/settings', nextSettings, session.token);
    setPosSettings({ ...defaultPosSettings, ...savedSettings });
    setNotice('POS settings saved');
    return savedSettings;
  }

  async function createProduct(product) {
    const createdProduct = await apiPost('/products', product, session.token);
    setProducts((currentProducts) => [...currentProducts, createdProduct].sort((a, b) => a.name.localeCompare(b.name)));
    setDashboard((currentDashboard) => ({
      ...currentDashboard,
      products: currentDashboard.products + 1,
      lowStock: createdProduct.stock <= createdProduct.reorderLevel
        ? currentDashboard.lowStock + 1
        : currentDashboard.lowStock,
    }));
    setNotice(`${createdProduct.name} added`);
  }

  async function deleteProduct(productId) {
    const response = await apiDelete(`/products/${productId}`, session.token);
    setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
    setNotice(
      `${response.product?.name || 'Product'} moved to recycle bin for `
      + `${posSettings.recycleRetentionDays} days`
    );

    if (session.user.role === 'owner') {
      const deletedProductData = await fetch(`${API_BASE}/products/deleted`, {
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((result) => result.json());
      setDeletedProducts(deletedProductData);
    }
  }

  async function restoreProduct(productId) {
    const restoredProduct = await apiPost(`/products/${productId}/restore`, {}, session.token);
    setProducts((currentProducts) => [...currentProducts, restoredProduct].sort((a, b) => a.name.localeCompare(b.name)));
    setDeletedProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
    setNotice(`${restoredProduct.name} restored to products`);
  }

  async function purgeExpiredProducts() {
    const response = await apiPost('/products/recycle-bin/purge-expired', {}, session.token);
    setDeletedProducts((currentProducts) => currentProducts.filter((product) => product.daysRemaining > 0));
    setNotice(`${response.purged} expired deleted product(s) removed from recycle bin`);
  }

  if (!session) {
    return (
      <AuthScreen
        authenticate={(credentials) => (
          DEMO_MODE ? Promise.resolve(demoSession) : apiPost('/auth/login', credentials)
        )}
        onLogin={(nextSession) => {
          setSession(nextSession);
          setActiveView(nextSession.user.role === 'cashier' ? 'POS Scanner' : 'Dashboard');
        }}
      />
    );
  }

  const normalizedQuery = activeView === 'Products' ? query.trim().toLowerCase() : '';
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) return true;
    return [product.name, product.category, product.barcode, product.status]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const filteredSales = sales;
  const filteredDeletedProducts = deletedProducts;
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  function addProductToCart(product, source = 'manual') {
    const stock = Number(product.stock);
    const existing = cart.find((item) => item.id === product.id);

    if (stock <= 0) {
      setNotice(`${product.name} is out of stock`);
      return false;
    }

    if (existing && existing.qty >= stock) {
      setNotice(`Only ${stock} item(s) of ${product.name} are available`);
      return false;
    }

    setCart((currentCart) => {
      const currentItem = currentCart.find((item) => item.id === product.id);
      if (currentItem) {
        const qty = currentItem.qty + 1;
        return currentCart.map((item) => (
          item.id === product.id
            ? { ...item, qty, total: item.unitPrice * qty }
            : item
        ));
      }

      const unitPrice = Number(product.salePrice);
      return [...currentCart, {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        stock,
        unitPrice,
        qty: 1,
        total: unitPrice,
      }];
    });
    setNotice(`${product.name} added through ${source}`);
    return true;
  }

  function scanBarcode(code, {
    navigateToPos = false,
    source = 'barcode',
  } = {}) {
    const normalizedCode = String(code || '').trim().toLowerCase();
    if (!normalizedCode) {
      setNotice('Scan or enter a barcode first');
      return false;
    }

    const scannedProduct = products.find((product) => (
      String(product.barcode || '').trim().toLowerCase() === normalizedCode
      || String(product.sku || '').trim().toLowerCase() === normalizedCode
    ));

    if (!scannedProduct) {
      setNotice(`No active product found for barcode ${String(code).trim()}`);
      return false;
    }

    const added = addProductToCart(scannedProduct, source);
    if (navigateToPos) setActiveView('POS Scanner');
    return added;
  }

  function updateCartQuantity(productId, requestedQuantity) {
    const cartItem = cart.find((item) => item.id === productId);
    if (!cartItem) return;

    if (String(requestedQuantity).trim() === '') return;
    const parsedQuantity = Math.trunc(Number(requestedQuantity));
    if (!Number.isFinite(parsedQuantity)) return;
    if (parsedQuantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
      setNotice(`${cartItem.name} removed from cart`);
      return;
    }

    const quantity = Math.min(parsedQuantity, cartItem.stock);
    setCart((currentCart) => currentCart.map((item) => (
      item.id === productId
        ? { ...item, qty: quantity, total: item.unitPrice * quantity }
        : item
    )));

    if (parsedQuantity > cartItem.stock) {
      setNotice(`Quantity limited to ${cartItem.stock}, the available stock for ${cartItem.name}`);
    }
  }

  function removeCartItem(productId) {
    const cartItem = cart.find((item) => item.id === productId);
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
    if (cartItem) setNotice(`${cartItem.name} removed from cart`);
  }

  function clearCart() {
    setCart([]);
    setNotice('Current order cleared');
  }

  async function viewReceipt(saleId) {
    try {
      const receiptData = await apiGet(`/sales/${saleId}`, session.token);
      setActiveReceipt(receiptData);
      setActiveView('POS Scanner');
      setNotice('');
      return receiptData;
    } catch (error) {
      setNotice(`Unable to load receipt: ${error.message}`);
      return null;
    }
  }

  async function checkout({ paymentMethod = 'cash', cashReceived = cartTotal } = {}) {
    if (!cart.length) {
      setNotice('Cart is empty');
      return false;
    }

    try {
      const receiptData = await apiPost(
        '/checkout',
        {
          paymentMethod,
          cashReceived: Number(cashReceived),
          items: cart.map((item) => ({ productId: item.id, quantity: item.qty })),
        },
        session.token
      );

      setActiveReceipt(receiptData);
      setCart([]);
      setNotice(`Sale completed - receipt ${receiptData.receiptNo}`);

      try {
        const [dashboardData, productData, saleData, reportData] = await Promise.all([
          apiGet('/dashboard'),
          apiGet('/products'),
          apiGet('/sales', session.token),
          apiGet(`/reports/summary?from=${reportRange.from}&to=${reportRange.to}`),
        ]);
        setDashboard(dashboardData);
        setProducts(productData);
        setSales(saleData);
        setReport(mergeReport(reportData));
      } catch {
        setNotice(`Sale completed - receipt ${receiptData.receiptNo}. Refresh the page to reload summaries.`);
      }

      return receiptData;
    } catch (error) {
      setNotice(`Checkout failed: ${error.message}`);
      return false;
    }
  }

  async function voidSale(saleId, reason) {
    try {
      const voidedReceipt = await apiPost(`/sales/${saleId}/void`, { reason }, session.token);
      setActiveReceipt(voidedReceipt);
      await refreshOperationalData();
      localStorage.setItem(SALE_SYNC_KEY, JSON.stringify({
        type: 'sale-voided',
        saleId: voidedReceipt.id,
        updatedAt: Date.now(),
      }));
      setNotice(
        `${voidedReceipt.receiptNo} voided - ${voidedReceipt.totalItems} item(s) returned to inventory`
      );
      return voidedReceipt;
    } catch (error) {
      setNotice(`Unable to void sale: ${error.message}`);
      throw error;
    }
  }

  async function logout() {
    try {
      await apiPost('/auth/logout', {}, session.token);
    } catch {
      // The local session must still close when the API is unavailable.
    } finally {
      localStorage.removeItem('fabians-session');
      setSession(null);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Car size={24} />
          </div>
          <div>
            <strong>{posSettings.shopName}</strong>
            <span>Point of Sale</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.label ? 'nav-item active' : 'nav-item'}
                key={item.label}
                onClick={() => setActiveView(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <a className="portfolio-link" href={PORTFOLIO_URL}>
          <ArrowLeft size={18} />
          <span>Back to Portfolio</span>
        </a>

        <button className="logout-button" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Car Shop POS</span>
            <h1>{activeView}</h1>
          </div>
          <div className="topbar-actions">
            {activeView === 'Products' && (
              <label className="search-box">
                <Search size={18} />
                <input
                  placeholder="Search product, barcode, or category..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            )}
            <button
              className="icon-button notification-button"
              aria-label="View system status"
              title="System status"
              onClick={() => setNotice(apiStatus)}
            >
              <Bell size={20} />
            </button>
            <div className="topbar-profile" title={`${session.user.name} - ${session.user.role}`}>
              <div className="avatar" aria-hidden="true">
                {session.user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="topbar-profile-copy">
                <strong>{session.user.name}</strong>
                <span>{session.user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {DEMO_MODE && (
          <div className="demo-banner" role="status">
            <div className="demo-banner-mark">
              <MonitorPlay size={17} />
            </div>
            <div>
              <strong>Live demo mode</strong>
              <span>You are browsing as a Guest Owner. Changes are temporary.</span>
            </div>
            <span className="demo-banner-badge">Sample data</span>
          </div>
        )}

        {session.user.role !== 'cashier' && activeView === 'Dashboard' && (
          <section className="metric-grid">
            <MetricCard title="Today's Sales" value={formatPeso(dashboard.todaySales)} trend={apiStatus} icon={Receipt} tone="green" />
            <MetricCard title="Products In Stock" value={dashboard.products} trend={`${filteredProducts.length} visible`} icon={Boxes} tone="blue" />
            <MetricCard title="Low Stock Items" value={dashboard.lowStock} trend="Tracked by reorder level" icon={ClipboardList} tone="amber" />
            <MetricCard title="Active Users" value={dashboard.activeUsers} trend="Role-based access ready" icon={Users} tone="slate" />
          </section>
        )}

        {notice && <div className="notice-banner">{notice}</div>}

        <section className="content-grid">
          {activeView === 'Dashboard' && (
            <DashboardPanel
              products={products}
              sales={sales}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'POS Scanner' && (
            <PosPanel
              products={products}
              cart={cart}
              cartTotal={cartTotal}
              sales={sales}
              receipt={activeReceipt}
              userRole={session.user.role}
              settings={posSettings}
              onBarcodeScan={scanBarcode}
              onAddProduct={addProductToCart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeCartItem}
              onClearCart={clearCart}
              onCheckout={checkout}
              onViewReceipt={viewReceipt}
              onVoidSale={voidSale}
            />
          )}

          {activeView === 'Products' && (
            <ProductsPanel
              products={filteredProducts}
              role={session.user.role}
              onCreateProduct={createProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              defaultReorderLevel={posSettings.defaultReorderLevel}
              recycleRetentionDays={posSettings.recycleRetentionDays}
              onFormStateChange={setIsProductFormOpen}
              setNotice={setNotice}
            />
          )}

          {activeView === 'Owner Recycle Bin' && session.user.role === 'owner' && (
            <RecycleBinPanel
              products={filteredDeletedProducts}
              onRestoreProduct={restoreProduct}
              onPurgeExpiredProducts={purgeExpiredProducts}
              retentionDays={posSettings.recycleRetentionDays}
              setNotice={setNotice}
            />
          )}

          {activeView === 'Sales' && (
            <SalesPanel
              sales={filteredSales}
              setActiveView={setActiveView}
              onViewReceipt={viewReceipt}
            />
          )}

          {activeView === 'Reports' && <ReportsPanel report={report} reportRange={reportRange} onApplyRange={loadReportRange} />}
          {activeView === 'Users' && <UsersPanel token={session.token} />}
          {activeView === 'Settings' && (
            <SettingsPanel
              apiStatus={apiStatus}
              settings={posSettings}
              onSave={savePosSettings}
            />
          )}
        </section>
      </main>
    </div>
  );
}

function readSavedSession() {
  try {
    return JSON.parse(localStorage.getItem('fabians-session'));
  } catch {
    return null;
  }
}

function mergeReport(reportData) {
  return {
    ...fallbackReport,
    ...reportData,
    overview: {
      ...fallbackReport.overview,
      ...(reportData?.overview || {}),
    },
    dailySales: reportData?.dailySales || fallbackReport.dailySales,
    topProducts: reportData?.topProducts || fallbackReport.topProducts,
    categoryStock: reportData?.categoryStock || fallbackReport.categoryStock,
    categorySales: reportData?.categorySales || fallbackReport.categorySales,
    weeklyBestSellers: reportData?.weeklyBestSellers || fallbackReport.weeklyBestSellers,
    monthlyBestSellers: reportData?.monthlyBestSellers || fallbackReport.monthlyBestSellers,
    monthlySales: reportData?.monthlySales || fallbackReport.monthlySales,
    lowStock: reportData?.lowStock || fallbackReport.lowStock,
    recentSales: reportData?.recentSales || fallbackReport.recentSales,
  };
}

function MetricCard({ title, value, trend, icon: Icon, tone }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon">
        <Icon size={22} />
      </div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{trend}</small>
    </article>
  );
}

function DashboardPanel({ products, sales, onNavigate }) {
  const inventoryWatch = [...products]
    .sort((first, second) => first.stock - second.stock)
    .slice(0, 5);
  const recentSales = sales.slice(0, 5);

  return (
    <div className="dashboard-overview full-span">
      <section className="panel dashboard-summary-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Inventory Status</span>
            <h2>Stock Attention</h2>
          </div>
          <button className="link-button" onClick={() => onNavigate('Products')}>
            View products
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="dashboard-list">
          {inventoryWatch.map((product) => (
            <div className="dashboard-product-row" key={product.id}>
              <ProductThumb product={product} />
              <div>
                <strong>{product.name}</strong>
                <span>{product.barcode || product.sku}</span>
              </div>
              <div className="dashboard-row-value">
                <b>{product.stock}</b>
                <span>{product.status}</span>
              </div>
            </div>
          ))}
          {!inventoryWatch.length && <div className="empty-state">No products available</div>}
        </div>
      </section>

      <section className="panel dashboard-summary-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Sales Activity</span>
            <h2>Recent Transactions</h2>
          </div>
          <button className="link-button" onClick={() => onNavigate('Sales')}>
            View sales
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="dashboard-list">
          {recentSales.map((sale) => (
            <div className="dashboard-sale-row" key={sale.id}>
              <div className="dashboard-receipt-icon">
                <Receipt size={18} />
              </div>
              <div>
                <strong>{sale.receipt_no}</strong>
                <span>{formatDateTime(sale.sale_date)} · {sale.total_items} item(s)</span>
              </div>
              <div className="dashboard-row-value">
                <b>{formatPeso(sale.total_amount)}</b>
                <span>{sale.status}</span>
              </div>
            </div>
          ))}
          {!recentSales.length && <div className="empty-state">No completed sales yet</div>}
        </div>
      </section>
    </div>
  );
}

function PosPanel({
  products,
  cart,
  cartTotal,
  sales,
  receipt,
  userRole,
  settings,
  onBarcodeScan,
  onAddProduct,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onViewReceipt,
  onVoidSale,
}) {
  const [saleMode, setSaleMode] = React.useState('barcode');
  const [barcode, setBarcode] = React.useState('');
  const [manualQuery, setManualQuery] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [cashReceived, setCashReceived] = React.useState('');
  const [isCompleting, setIsCompleting] = React.useState(false);
  const barcodeInput = React.useRef(null);
  const appliedPaymentSettings = React.useRef('');
  const cartQuantity = cart.reduce((total, item) => total + item.qty, 0);
  const cashValue = Number(cashReceived || 0);
  const isCashShort = Boolean(cart.length && paymentMethod === 'cash' && cashValue < cartTotal);
  const outstandingAmount = paymentMethod === 'cash' ? Math.max(cartTotal - cashValue, 0) : 0;
  const changeAmount = paymentMethod === 'cash' ? Math.max(cashValue - cartTotal, 0) : 0;
  const normalizedManualQuery = manualQuery.trim().toLowerCase();
  const manualProducts = products
    .filter((product) => (
      !normalizedManualQuery
      || [product.name, product.barcode, product.category]
        .join(' ')
        .toLowerCase()
        .includes(normalizedManualQuery)
    ))
    .sort((first, second) => {
      const stockOrder = Number(second.stock > 0) - Number(first.stock > 0);
      return stockOrder || first.name.localeCompare(second.name);
    });
  const allPaymentOptions = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'gcash', label: 'GCash', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard },
  ];
  const enabledPaymentMethods = settings?.enabledPaymentMethods || defaultPosSettings.enabledPaymentMethods;
  const paymentOptions = allPaymentOptions.filter((option) => (
    enabledPaymentMethods.includes(option.value)
  ));
  const cashDenominations = settings?.commonBills || defaultPosSettings.commonBills;

  React.useEffect(() => {
    if (saleMode === 'barcode') barcodeInput.current?.focus();
  }, [saleMode]);

  React.useEffect(() => {
    const paymentSettingsKey = JSON.stringify({
      enabledPaymentMethods,
      defaultPaymentMethod: settings?.defaultPaymentMethod,
    });
    if (appliedPaymentSettings.current === paymentSettingsKey) return;

    const configuredMethod = enabledPaymentMethods.includes(settings?.defaultPaymentMethod)
      ? settings.defaultPaymentMethod
      : enabledPaymentMethods[0] || 'cash';
    setPaymentMethod(configuredMethod);
    setCashReceived(configuredMethod === 'cash' ? '' : String(cartTotal));
    appliedPaymentSettings.current = paymentSettingsKey;
  }, [settings?.defaultPaymentMethod, settings?.enabledPaymentMethods]);

  React.useEffect(() => {
    if (paymentMethod !== 'cash') {
      setCashReceived(String(cartTotal));
    } else if (!cart.length) {
      setCashReceived('');
    }
  }, [cart.length, cartTotal, paymentMethod]);

  function submitBarcode(event) {
    event.preventDefault();
    if (!barcode.trim()) {
      barcodeInput.current?.focus();
      return;
    }
    const added = onBarcodeScan(barcode);
    if (added) setBarcode('');
    window.setTimeout(() => barcodeInput.current?.focus(), 0);
  }

  function updateBarcode(value) {
    setBarcode(value);
    const normalizedValue = value.trim().toLowerCase();
    const hasExactMatch = normalizedValue && products.some((product) => (
      String(product.barcode || '').trim().toLowerCase() === normalizedValue
      || String(product.sku || '').trim().toLowerCase() === normalizedValue
    ));

    if (settings?.barcodeAutoAdd && hasExactMatch && onBarcodeScan(value)) {
      setBarcode('');
      window.setTimeout(() => barcodeInput.current?.focus(), 0);
    }
  }

  async function completeSale() {
    if (isCompleting) return;
    const pendingReceiptUrl = new URL(window.location.href);
    pendingReceiptUrl.search = '';
    pendingReceiptUrl.hash = '';
    pendingReceiptUrl.searchParams.set('receipt', 'preparing');
    const receiptTab = settings?.autoOpenReceipt
      ? window.open(pendingReceiptUrl.toString(), '_blank')
      : null;
    setIsCompleting(true);

    try {
      const completedReceipt = await onCheckout({
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashValue : cartTotal,
      });

      if (completedReceipt) {
        setCashReceived('');
        setBarcode('');

        const receiptUrl = new URL(pendingReceiptUrl);
        receiptUrl.searchParams.set('receipt', String(completedReceipt.id));
        if (settings?.autoOpenReceipt) {
          if (receiptTab) {
            receiptTab.location.replace(receiptUrl.toString());
            receiptTab.focus();
          } else {
            window.open(receiptUrl.toString(), '_blank', 'noopener');
          }
        }
      } else if (receiptTab) {
        receiptTab.close();
      }
    } finally {
      setIsCompleting(false);
    }
  }

  function changePaymentMethod(method) {
    setPaymentMethod(method);
    setCashReceived(method === 'cash' ? '' : String(cartTotal));
  }

  function clearCurrentOrder() {
    if (!cart.length) return;
    if (!window.confirm('Clear all items from the current order?')) return;
    onClearCart();
    setCashReceived('');
    setBarcode('');
    window.setTimeout(() => barcodeInput.current?.focus(), 0);
  }

  return (
    <div className="panel pos-panel full-span">
      <div className="pos-page-header">
        <div>
          <span className="eyebrow">Sales Counter</span>
          <h2>New Sale</h2>
          <div className="pos-order-status">
            <span className="scanner-status-dot" />
            {cart.length ? `${cartQuantity} unit(s) in current order` : 'Ready for new transaction'}
          </div>
        </div>
        <div className="pos-order-total">
          <span>Current Total</span>
          <strong>{formatPeso(cartTotal)}</strong>
        </div>
      </div>

      <div className="pos-transaction-grid">
        <section className="sale-entry">
          <div className="pos-stage-header">
            <div className="pos-stage-title">
              <span className="pos-step">1</span>
              <div>
                <span className="eyebrow">Products</span>
                <h3>Add Products</h3>
              </div>
            </div>
            <div className="pos-mode-switch" role="tablist" aria-label="Sale entry mode">
              <button
                className={saleMode === 'barcode' ? 'active' : ''}
                onClick={() => setSaleMode('barcode')}
                type="button"
                role="tab"
                aria-selected={saleMode === 'barcode'}
              >
                <Barcode size={17} />
                Barcode
              </button>
              <button
                className={saleMode === 'manual' ? 'active' : ''}
                onClick={() => setSaleMode('manual')}
                type="button"
                role="tab"
                aria-selected={saleMode === 'manual'}
              >
                <Search size={17} />
                Manual
              </button>
            </div>
          </div>

          {saleMode === 'barcode' ? (
            <form className="barcode-entry" onSubmit={submitBarcode}>
              <div className="barcode-entry-heading">
                <div className="barcode-icon"><Barcode size={28} /></div>
                <div>
                  <span className="eyebrow">Scanner Input</span>
                  <h3>Barcode or SKU</h3>
                </div>
                <span className="scanner-ready-badge">Ready</span>
              </div>
              <label htmlFor="pos-barcode">Product code</label>
              <div className="barcode-input-row">
                <Barcode size={21} />
                <input
                  id="pos-barcode"
                  ref={barcodeInput}
                  value={barcode}
                  onChange={(event) => updateBarcode(event.target.value)}
                  placeholder="Scan barcode or enter code"
                  autoComplete="off"
                />
                <button className="primary-button" type="submit">
                  <Plus size={18} />
                  Add Item
                </button>
              </div>
              <div className="scanner-footer">
                <div className="scanner-status">
                  <span className="scanner-status-dot" />
                  Scanner active
                </div>
                <span>{cartQuantity} unit(s) added</span>
              </div>
            </form>
          ) : (
            <div className="manual-entry">
              <div className="manual-toolbar">
                <div className="manual-search">
                  <Search size={18} />
                  <input
                    value={manualQuery}
                    onChange={(event) => setManualQuery(event.target.value)}
                    placeholder="Search name, category, or barcode"
                    aria-label="Search products"
                  />
                  {manualQuery && (
                    <button
                      type="button"
                      onClick={() => setManualQuery('')}
                      title="Clear search"
                      aria-label="Clear product search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <span className="manual-result-count">{manualProducts.length} product(s)</span>
              </div>
              <div className="manual-product-list">
                {manualProducts.map((product) => (
                  <article className="manual-product" key={product.id}>
                    <ProductThumb product={product} />
                    <div className="manual-product-info">
                      <strong>{product.name}</strong>
                      <span>{product.category || 'Uncategorized'} &middot; {product.barcode || 'No barcode'}</span>
                    </div>
                    <div className="manual-product-meta">
                      <b>{formatPeso(product.salePrice)}</b>
                      <span className={product.stock > 0 ? 'stock-available' : 'stock-unavailable'}>
                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                    <button
                      className="add-product-button"
                      onClick={() => onAddProduct(product, 'manual selection')}
                      disabled={product.stock <= 0}
                      type="button"
                      title={`Add ${product.name}`}
                      aria-label={`Add ${product.name}`}
                    >
                      <Plus size={18} />
                      <span>Add</span>
                    </button>
                  </article>
                ))}
                {!manualProducts.length && <div className="empty-state">No matching products</div>}
              </div>
            </div>
          )}
        </section>

        <section className="transaction-cart">
          <div className="pos-stage-header cart-stage-header">
            <div className="pos-stage-title">
              <span className="pos-step">2</span>
              <div>
                <span className="eyebrow">Current Order</span>
                <h3>Review Items</h3>
              </div>
            </div>
            <div className="cart-heading-actions">
              <span className="cart-count">{cartQuantity} item(s)</span>
              {cart.length > 0 && (
                <button className="clear-order-button" type="button" onClick={clearCurrentOrder}>
                  <Trash2 size={16} />
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="cart-preview">
            {cart.length ? (
              cart.map((item) => (
                <CartLine
                  key={item.id}
                  item={item}
                  onDecrease={() => onUpdateQuantity(item.id, item.qty - 1)}
                  onIncrease={() => onUpdateQuantity(item.id, item.qty + 1)}
                  onQuantityChange={(quantity) => onUpdateQuantity(item.id, quantity)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))
            ) : (
              <div className="pos-cart-empty">
                <ShoppingCart size={24} />
                <strong>No items in this order</strong>
                <span>0 items</span>
              </div>
            )}
          </div>

          <div className="payment-section">
            <div className="payment-stage-heading">
              <span className="pos-step">3</span>
              <div>
                <span className="eyebrow">Checkout</span>
                <h3>Payment</h3>
              </div>
            </div>
            <div className="payment-methods" role="radiogroup" aria-label="Payment method">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    className={paymentMethod === option.value ? 'active' : ''}
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === option.value}
                    onClick={() => changePaymentMethod(option.value)}
                  >
                    <Icon size={17} />
                    {option.label}
                  </button>
                );
              })}
            </div>
            {paymentMethod === 'cash' && (
              <label className="cash-received-field">
                Amount Received
                <div className="cash-input">
                  <span aria-hidden="true">&#8369;</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashReceived}
                    onChange={(event) => setCashReceived(event.target.value)}
                    placeholder="0.00"
                  />
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => setCashReceived(String(cartTotal))}
                    disabled={!cart.length}
                  >
                    Exact
                  </button>
                </div>
              </label>
            )}
            {paymentMethod === 'cash' && (
              <div className="cash-tender-presets">
                <span>Common Bills</span>
                <div className="cash-bill-grid">
                  {cashDenominations.map((amount) => (
                    <button
                      className={cashValue === amount ? 'active' : ''}
                      key={amount}
                      type="button"
                      onClick={() => setCashReceived(String(amount))}
                      disabled={!cart.length || amount < cartTotal}
                    >
                      {formatPeso(amount)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {paymentMethod === 'cash' && cart.length > 0 && (
              <div className={isCashShort ? 'tender-status amount-due' : 'tender-status change-due'}>
                <span>{isCashShort ? 'Amount Remaining' : 'Change (Sukli)'}</span>
                <strong>{formatPeso(isCashShort ? outstandingAmount : changeAmount)}</strong>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div><span>Items</span><b>{cartQuantity}</b></div>
            <div><span>Subtotal</span><b>{formatPeso(cartTotal)}</b></div>
            <div className="checkout-total"><span>Total</span><strong>{formatPeso(cartTotal)}</strong></div>
          </div>
          <button
            className="primary-button complete-sale-button"
            onClick={completeSale}
            disabled={!cart.length || isCashShort || isCompleting}
            type="button"
          >
            <Banknote size={19} />
            <span>{isCompleting ? 'Processing Sale...' : 'Complete Sale'}</span>
            {!isCompleting && <b>{formatPeso(cartTotal)}</b>}
          </button>
        </section>
      </div>

      <div className="pos-records-heading">
        <div>
          <span className="eyebrow">Sales Records</span>
          <h2>Receipt &amp; Recent Sales</h2>
        </div>
      </div>
      <div className="pos-records-grid">
        <ReceiptCard
          receipt={receipt}
          onVoidSale={onVoidSale}
          userRole={userRole}
          settings={settings}
        />
        <section className="purchase-history">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Purchase History</span>
              <h3>Recent Transactions</h3>
            </div>
            <History size={20} />
          </div>
          <div className="history-list">
            {sales.slice(0, 8).map((sale) => (
              <button className="history-item" key={sale.id} onClick={() => onViewReceipt(sale.id)}>
                <span className="history-receipt-icon"><Receipt size={17} /></span>
                <div className="history-item-main">
                  <strong>{sale.receipt_no}</strong>
                  <span>{formatDateTime(sale.sale_date)} &middot; {sale.cashier_name || 'Cashier'}</span>
                </div>
                <div className="history-item-amount">
                  <b>{formatPeso(sale.total_amount)}</b>
                  <span>{sale.total_items} item(s) &middot; {String(sale.status).toUpperCase()}</span>
                </div>
                <ChevronRight className="history-chevron" size={17} />
              </button>
            ))}
            {!sales.length && <div className="empty-state">No completed transactions</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

function ReceiptCard({
  receipt,
  onVoidSale,
  userRole,
  settings = defaultPosSettings,
}) {
  const [isVoidDialogOpen, setIsVoidDialogOpen] = React.useState(false);
  const [voidReason, setVoidReason] = React.useState('');
  const [voidError, setVoidError] = React.useState('');
  const [isVoiding, setIsVoiding] = React.useState(false);

  React.useEffect(() => {
    setIsVoidDialogOpen(false);
    setVoidReason('');
    setVoidError('');
    setIsVoiding(false);
  }, [receipt?.id, receipt?.status]);

  React.useEffect(() => {
    if (!isVoidDialogOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape' && !isVoiding) setIsVoidDialogOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isVoidDialogOpen, isVoiding]);

  if (!receipt) {
    return (
      <section className="receipt-card receipt-empty">
        <Receipt size={28} />
        <div>
          <span className="eyebrow">Sales Receipt</span>
          <h3>No receipt selected</h3>
        </div>
      </section>
    );
  }

  const paymentMethod = String(receipt.paymentMethod || 'cash').toUpperCase();
  const isCashPayment = paymentMethod === 'CASH';
  const isVoided = receipt.status === 'voided';
  const canVoidSale = receipt.status === 'paid' && typeof onVoidSale === 'function';
  const isOwner = userRole === 'owner';
  const isVoidReasonOptional = isOwner
    || (userRole === 'cashier' && !settings.cashierVoidReasonRequired);
  const normalizedVoidReason = voidReason.trim();
  const isVoidReasonValid = isVoidReasonOptional
    ? normalizedVoidReason.length === 0 || normalizedVoidReason.length >= 3
    : normalizedVoidReason.length >= 3;

  async function submitVoidSale(event) {
    event.preventDefault();

    if (!isVoidReasonValid) {
      setVoidError(
        isVoidReasonOptional
          ? 'Leave the reason blank or enter at least 3 characters.'
          : 'Enter a cancellation reason with at least 3 characters.'
      );
      return;
    }

    setVoidError('');
    setIsVoiding(true);
    try {
      await onVoidSale(receipt.id, normalizedVoidReason);
    } catch (error) {
      setVoidError(error.message || 'Unable to void this sale');
      setIsVoiding(false);
    }
  }

  return (
    <section
      className={`receipt-card receipt-paper-${settings.receiptPaperSize}`}
      id="printable-receipt"
    >
      <div className="receipt-toolbar">
        <div className="receipt-toolbar-copy">
          <span className="eyebrow">Completed Sale</span>
          <strong>{receipt.receiptNo}</strong>
        </div>
        <div className="receipt-toolbar-actions">
          {canVoidSale && (
            <button className="receipt-void-button" type="button" onClick={() => setIsVoidDialogOpen(true)}>
              <CircleAlert size={17} />
              Void Sale
            </button>
          )}
          <button className="ghost-button receipt-print-button" onClick={() => window.print()} title="Print receipt" aria-label="Print receipt">
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>
      <div className="receipt-shop">
        {settings.shopLogoUrl ? (
          <img
            className="receipt-shop-logo"
            src={settings.shopLogoUrl}
            alt={`${settings.shopName} logo`}
          />
        ) : (
          <div className="receipt-brand-icon"><Car size={22} /></div>
        )}
        <strong>{settings.shopName.toUpperCase()}</strong>
        {settings.shopAddress && <span>{settings.shopAddress}</span>}
        {(settings.contactNumber || settings.tin) && (
          <span>
            {[settings.contactNumber, settings.tin ? `TIN ${settings.tin}` : '']
              .filter(Boolean)
              .join(' | ')}
          </span>
        )}
        <b>OFFICIAL SALES RECEIPT</b>
      </div>
      <div className="receipt-reference">
        <div>
          <span>Receipt No.</span>
          <strong>{receipt.receiptNo}</strong>
        </div>
        <span className={isVoided ? 'receipt-paid voided' : 'receipt-paid'}>
          {String(receipt.status || 'paid').toUpperCase()}
        </span>
      </div>
      {isVoided && (
        <div className="receipt-void-details">
          <div><span>Voided</span><b>{receipt.voidedAt ? formatDateTime(receipt.voidedAt) : 'Not recorded'}</b></div>
          <div><span>Authorized By</span><b>{receipt.voidedBy || 'Authorized user'}</b></div>
          <p><span>Reason</span>{receipt.voidReason || 'No reason provided'}</p>
        </div>
      )}
      <dl className="receipt-meta">
        <div><dt>Date</dt><dd>{formatDateTime(receipt.saleDate)}</dd></div>
        <div><dt>Cashier</dt><dd>{receipt.cashier}</dd></div>
        <div><dt>Payment</dt><dd>{paymentMethod}</dd></div>
        <div><dt>Items</dt><dd>{receipt.totalItems}</dd></div>
      </dl>
      <div className="receipt-items">
        <div className="receipt-item receipt-item-head">
          <span>Qty</span>
          <span>Item</span>
          <span>Amount</span>
        </div>
        {receipt.items.map((item) => (
          <div className="receipt-item" key={`${receipt.id}-${item.productId}`}>
            <span>{item.quantity}</span>
            <span>
              {item.name}
              <small>
                {item.barcode ? `${item.barcode} · ` : ''}
                {formatPeso(item.unitPrice)} each
              </small>
            </span>
            <b>{formatPeso(item.lineTotal)}</b>
          </div>
        ))}
      </div>
      <div className="receipt-totals">
        <div className="receipt-total-primary"><span>Total</span><strong>{formatPeso(receipt.totalAmount)}</strong></div>
        <div><span>{isCashPayment ? 'Cash Received' : 'Amount Paid'}</span><b>{formatPeso(receipt.cashReceived)}</b></div>
        {isCashPayment && <div><span>Change (Sukli)</span><b>{formatPeso(receipt.changeAmount)}</b></div>}
      </div>
      <footer className="receipt-footer">
        <strong>{settings.receiptFooter || 'Thank you for your purchase.'}</strong>
        <span>{settings.shopName}</span>
      </footer>
      {isVoidDialogOpen && (
        <div
          className="void-sale-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isVoiding) setIsVoidDialogOpen(false);
          }}
        >
          <form className="void-sale-dialog" onSubmit={submitVoidSale} role="dialog" aria-modal="true" aria-labelledby="void-sale-title">
            <div className="void-dialog-header">
              <div className="void-dialog-icon"><CircleAlert size={22} /></div>
              <div>
                <span className="eyebrow">Emergency Action</span>
                <h2 id="void-sale-title">Void completed sale</h2>
              </div>
              <button
                className="icon-button compact"
                type="button"
                onClick={() => setIsVoidDialogOpen(false)}
                disabled={isVoiding}
                title="Close"
                aria-label="Close void sale dialog"
              >
                <X size={17} />
              </button>
            </div>
            <div className="void-sale-summary">
              <div><span>Receipt</span><b>{receipt.receiptNo}</b></div>
              <div><span>Items to restore</span><b>{receipt.totalItems}</b></div>
              <div><span>Sale amount</span><b>{formatPeso(receipt.totalAmount)}</b></div>
            </div>
            <label className="void-reason-field">
              {isVoidReasonOptional ? 'Cancellation reason (optional)' : 'Cancellation reason'}
              <textarea
                value={voidReason}
                onChange={(event) => setVoidReason(event.target.value)}
                maxLength={300}
                rows={3}
                autoFocus
                placeholder={
                  isVoidReasonOptional
                    ? 'Optional note for this void'
                    : 'Example: Customer cancelled the order'
                }
              />
              <span>{voidReason.length}/300</span>
            </label>
            {!isCashPayment && (
              <div className="void-payment-warning">
                This restores inventory and voids the receipt. Process the {paymentMethod} payment reversal separately.
              </div>
            )}
            {voidError && <div className="error-state">{voidError}</div>}
            <div className="void-dialog-actions">
              <button className="ghost-button" type="button" onClick={() => setIsVoidDialogOpen(false)} disabled={isVoiding}>
                Keep Sale
              </button>
              <button className="confirm-void-button" type="submit" disabled={isVoiding || !isVoidReasonValid}>
                <RotateCcw size={17} />
                {isVoiding ? 'Restoring Stock...' : 'Void & Restore Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function StandaloneReceiptPage({ saleId }) {
  const [receipt, setReceipt] = React.useState(null);
  const [settings, setSettings] = React.useState(defaultPosSettings);
  const [error, setError] = React.useState('');
  const hasAutoPrinted = React.useRef(false);
  const isPreparing = saleId === 'preparing';
  const savedSession = readSavedSession();

  React.useEffect(() => {
    if (isPreparing) {
      document.title = 'Preparing Receipt | Fabian\'s Car Care';
      return undefined;
    }

    const normalizedSaleId = Number(saleId);
    if (!Number.isInteger(normalizedSaleId) || normalizedSaleId <= 0) {
      setError('Invalid receipt reference');
      return undefined;
    }

    if (!savedSession?.token) {
      setError('Your session has expired. Sign in again from the POS.');
      return undefined;
    }

    let isActive = true;
    Promise.all([
      apiGet(`/sales/${normalizedSaleId}`, savedSession.token),
      apiGet('/settings', savedSession.token),
    ])
      .then(([receiptData, settingsData]) => {
        if (!isActive) return;
        setReceipt(receiptData);
        setSettings({ ...defaultPosSettings, ...settingsData });
        document.title = `${receiptData.receiptNo} | ${settingsData.shopName}`;
      })
      .catch((receiptError) => {
        if (isActive) setError(receiptError.message);
      });

    return () => {
      isActive = false;
    };
  }, [isPreparing, saleId, savedSession?.token]);

  React.useEffect(() => {
    if (!receipt || !settings.autoPrintReceipt || hasAutoPrinted.current) return undefined;

    hasAutoPrinted.current = true;
    const printTimer = window.setTimeout(() => window.print(), 350);
    return () => window.clearTimeout(printTimer);
  }, [receipt, settings.autoPrintReceipt]);

  React.useEffect(() => {
    if (isPreparing) return undefined;

    function handleSaleSync(event) {
      if (event.key !== SALE_SYNC_KEY || !event.newValue) return;

      try {
        const update = JSON.parse(event.newValue);
        if (Number(update.saleId) !== Number(saleId)) return;
        const currentSession = readSavedSession();
        if (!currentSession?.token) return;
        apiGet(`/sales/${Number(saleId)}`, currentSession.token)
          .then(setReceipt)
          .catch((receiptError) => setError(receiptError.message));
      } catch {
        // Ignore malformed cross-tab notifications.
      }
    }

    window.addEventListener('storage', handleSaleSync);
    return () => window.removeEventListener('storage', handleSaleSync);
  }, [isPreparing, saleId]);

  async function voidStandaloneSale(receiptId, reason) {
    const currentSession = readSavedSession();
    if (!currentSession?.token) throw new Error('Your session has expired. Sign in again from the POS.');

    const voidedReceipt = await apiPost(`/sales/${receiptId}/void`, { reason }, currentSession.token);
    setReceipt(voidedReceipt);
    localStorage.setItem(SALE_SYNC_KEY, JSON.stringify({
      type: 'sale-voided',
      saleId: voidedReceipt.id,
      updatedAt: Date.now(),
    }));
    return voidedReceipt;
  }

  if (isPreparing || (!receipt && !error)) {
    return (
      <main className="standalone-receipt-page">
        <section className="standalone-receipt-state">
          <div className="receipt-loading-mark"><Receipt size={24} /></div>
          <span className="eyebrow">Completed Sale</span>
          <h1>Preparing receipt</h1>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="standalone-receipt-page">
        <section className="standalone-receipt-state receipt-load-error">
          <div className="receipt-loading-mark"><Receipt size={24} /></div>
          <span className="eyebrow">Receipt Unavailable</span>
          <h1>Unable to load receipt</h1>
          <p>{error}</p>
          <button className="ghost-button" type="button" onClick={() => window.close()}>
            <X size={17} />
            Close Tab
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={`standalone-receipt-page receipt-paper-${settings.receiptPaperSize}`}>
      <div className="standalone-receipt-shell">
        <header className="standalone-receipt-header">
          <div>
            <span className="eyebrow">{settings.shopName}</span>
            <strong>Sale Receipt</strong>
          </div>
          <button className="icon-button" type="button" onClick={() => window.close()} title="Close receipt tab" aria-label="Close receipt tab">
            <X size={18} />
          </button>
        </header>
        <ReceiptCard
          receipt={receipt}
          onVoidSale={voidStandaloneSale}
          userRole={savedSession?.user?.role}
          settings={settings}
        />
      </div>
    </main>
  );
}

function ProductThumb({ product }) {
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [product.imageUrl]);

  return (
    <div className="product-thumb" aria-hidden="true">
      {product.imageUrl && !imageFailed ? (
        <img src={product.imageUrl} alt="" onError={() => setImageFailed(true)} />
      ) : (
        <Boxes size={20} />
      )}
    </div>
  );
}

function createEmptyProductForm(defaultReorderLevel = 3) {
  return {
    name: '',
    barcode: '',
    categoryName: '',
    stock: 0,
    reorderLevel: defaultReorderLevel,
    buyPrice: 0,
    salePrice: '',
    imageUrl: '',
  };
}

function ProductsPanel({
  products,
  role,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  defaultReorderLevel,
  recycleRetentionDays,
  onFormStateChange,
  setNotice,
}) {
  const canManageProducts = role === 'owner' || role === 'admin';
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [editForm, setEditForm] = React.useState(
    createEmptyProductForm(defaultReorderLevel)
  );
  const [busyId, setBusyId] = React.useState(null);
  const barcodeField = React.useRef(null);
  const productFormOpen = Boolean(editingProduct || isAddingProduct);
  const formTitle = isAddingProduct ? 'Add Product' : 'Edit Product';

  React.useEffect(() => {
    onFormStateChange?.(productFormOpen);
    return () => {
      if (productFormOpen) onFormStateChange?.(false);
    };
  }, [onFormStateChange, productFormOpen]);

  React.useEffect(() => {
    if (!productFormOpen) return undefined;

    const focusFrame = window.requestAnimationFrame(() => {
      barcodeField.current?.focus();
      barcodeField.current?.select();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [productFormOpen, editingProduct?.id]);

  function startEdit(product) {
    setIsAddingProduct(false);
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      barcode: product.barcode || '',
      categoryName: product.category || '',
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      buyPrice: product.buyPrice || 0,
      salePrice: product.salePrice,
      imageUrl: product.imageUrl || '',
    });
  }

  function startAddProduct() {
    setEditingProduct(null);
    setIsAddingProduct(true);
    setEditForm(createEmptyProductForm(defaultReorderLevel));
  }

  function closeProductForm() {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setEditForm(createEmptyProductForm(defaultReorderLevel));
  }

  async function chooseProductImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    try {
      const imageUrl = await readImageFile(file);
      setEditForm((form) => ({ ...form, imageUrl }));
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (!editingProduct && !isAddingProduct) return;

    if (isAddingProduct && !editForm.imageUrl) {
      setNotice('Please upload a product image before saving');
      return;
    }

    const activeId = editingProduct?.id || 'new-product';
    setBusyId(activeId);
    try {
      if (isAddingProduct) {
        await onCreateProduct(editForm);
      } else {
        await onUpdateProduct(editingProduct.id, editForm);
      }
      closeProductForm();
    } catch (error) {
      setNotice(`Unable to save product: ${error.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function softDeleteProduct(product) {
    if (
      !window.confirm(
        `Move ${product.name} to recycle bin for ${recycleRetentionDays} days?`
      )
    ) return;

    setBusyId(product.id);
    try {
      await onDeleteProduct(product.id);
      if (editingProduct?.id === product.id) setEditingProduct(null);
    } catch (error) {
      setNotice(`Unable to delete product: ${error.message}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="panel products-panel full-span">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Inventory</span>
          <h2>Product Stock</h2>
        </div>
        <button className="ghost-button" onClick={startAddProduct}>
          <PackagePlus size={18} />
          Add Product
        </button>
      </div>
      {(editingProduct || isAddingProduct) && (
        <form className="product-edit-form" onSubmit={saveProduct}>
          <div className="product-form-title">
            <span className="eyebrow">{formTitle}</span>
            <ProductThumb product={{ imageUrl: editForm.imageUrl }} />
          </div>
          <label>
            Product Name
            <input
              required
              value={editForm.name}
              onChange={(event) => setEditForm((form) => ({ ...form, name: event.target.value }))}
            />
          </label>
          <label>
            Barcode
            <input
              ref={barcodeField}
              required
              autoComplete="off"
              value={editForm.barcode}
              onChange={(event) => setEditForm((form) => ({ ...form, barcode: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
            />
          </label>
          <label>
            Category
            <input
              value={editForm.categoryName}
              onChange={(event) => setEditForm((form) => ({ ...form, categoryName: event.target.value }))}
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              min="0"
              value={editForm.stock}
              onChange={(event) => setEditForm((form) => ({ ...form, stock: event.target.value }))}
            />
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={editForm.salePrice}
              onChange={(event) => setEditForm((form) => ({ ...form, salePrice: event.target.value }))}
            />
          </label>
          <label>
            Image File
            <input
              type="file"
              accept="image/*"
              onChange={chooseProductImage}
            />
          </label>
          <div className="product-edit-actions">
            <button className="primary-button" disabled={busyId === (editingProduct?.id || 'new-product')}>
              {busyId === (editingProduct?.id || 'new-product') ? 'Saving' : 'Save'}
            </button>
            {editForm.imageUrl && (
              <button
                className="ghost-button"
                type="button"
                onClick={() => setEditForm((form) => ({ ...form, imageUrl: '' }))}
              >
                Remove Image
              </button>
            )}
            <button className="ghost-button" type="button" onClick={closeProductForm}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              {canManageProducts && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <ProductThumb product={product} />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.barcode || product.sku}</span>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>{formatPeso(product.salePrice)}</td>
                <td>
                  <span className={product.status === 'Low stock' ? 'pill warning' : 'pill success'}>{product.status}</span>
                </td>
                {canManageProducts && (
                  <td>
                    <div className="table-actions">
                      <button className="icon-action" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)}>
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-action danger"
                        aria-label={`Delete ${product.name}`}
                        disabled={busyId === product.id}
                        onClick={() => softDeleteProduct(product)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan={canManageProducts ? 6 : 5}>
                  <div className="empty-state">No products found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecycleBinPanel({
  products,
  onRestoreProduct,
  onPurgeExpiredProducts,
  retentionDays,
  setNotice,
}) {
  const [busyId, setBusyId] = React.useState(null);
  const [isPurging, setIsPurging] = React.useState(false);

  async function restoreDeletedProduct(product) {
    setBusyId(product.id);
    try {
      await onRestoreProduct(product.id);
    } catch (error) {
      setNotice(`Unable to restore product: ${error.message}`);
    } finally {
      setBusyId(null);
    }
  }

  async function purgeExpiredProducts() {
    setIsPurging(true);
    try {
      await onPurgeExpiredProducts();
    } catch (error) {
      setNotice(`Unable to purge expired products: ${error.message}`);
    } finally {
      setIsPurging(false);
    }
  }

  return (
    <div className="panel recycle-bin-panel full-span">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Owner Only</span>
          <h2>Deleted Products</h2>
          <p className="panel-supporting-copy">
            Products stay recoverable for {retentionDays} days before permanent removal.
          </p>
        </div>
        <button className="ghost-button" onClick={purgeExpiredProducts} disabled={isPurging}>
          <Trash2 size={18} />
          {isPurging ? 'Purging' : 'Purge Expired'}
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Deleted By</th>
              <th>Permanent After</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <ProductThumb product={product} />
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.stock} stock on hand</span>
                    </div>
                  </div>
                </td>
                <td>{product.barcode}</td>
                <td>{formatPeso(product.salePrice)}</td>
                <td>{product.deletedBy}</td>
                <td>
                  <strong>{new Date(product.purgeAfter).toLocaleDateString()}</strong>
                  <span>{product.daysRemaining} day(s) left</span>
                </td>
                <td>
                  <button
                    className="ghost-button"
                    disabled={busyId === product.id}
                    onClick={() => restoreDeletedProduct(product)}
                  >
                    <RotateCcw size={16} />
                    {busyId === product.id ? 'Restoring' : 'Restore'}
                  </button>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">Recycle bin is empty</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesPanel({ sales, setActiveView, onViewReceipt }) {
  return (
    <div className="panel sales-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Transactions</span>
          <h2>Recent Sales</h2>
        </div>
        <button className="link-button" onClick={() => setActiveView('Reports')}>
          View reports
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="sales-list">
        {sales.map((sale) => (
          <div className="sale-item" key={sale.id}>
            <div>
              <strong>{sale.receipt_no}</strong>
              <span>{formatDateTime(sale.sale_date)} · {sale.cashier_name || 'Cashier'}</span>
              <span>{sale.total_items} item(s) · {sale.payment_method} · {sale.status}</span>
            </div>
            <div className="sale-item-action">
              <b>{formatPeso(sale.total_amount)}</b>
              <button className="link-button" onClick={() => onViewReceipt(sale.id)}>
                View receipt
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        {!sales.length && <div className="empty-state">No sales found</div>}
      </div>
    </div>
  );
}

function ReportsPanel({ report, reportRange, onApplyRange }) {
  const [selectedMonth, setSelectedMonth] = React.useState(report.monthlySales.at(-1)?.label || '');
  const [draftRange, setDraftRange] = React.useState(reportRange);
  const [isApplying, setIsApplying] = React.useState(false);
  const maxDailyRevenue = Math.max(...report.dailySales.map((day) => day.revenue), 1);
  const maxWeeklyRevenue = Math.max(...report.weeklyBestSellers.map((product) => product.revenue), 1);
  const maxMonthlyRevenue = Math.max(...report.monthlyBestSellers.map((product) => product.revenue), 1);
  const maxCategoryValue = Math.max(...report.categoryStock.map((category) => category.stockValue), 1);
  const pieGradient = getPieGradient(report.categorySales);
  const selectedMonthData = report.monthlySales.find((month) => month.label === selectedMonth) || report.monthlySales.at(-1);

  React.useEffect(() => {
    if (!report.monthlySales.some((month) => month.label === selectedMonth)) {
      setSelectedMonth(report.monthlySales.at(-1)?.label || '');
    }
  }, [report.monthlySales, selectedMonth]);

  React.useEffect(() => {
    setDraftRange(reportRange);
  }, [reportRange]);

  async function applyDateRange(event) {
    event.preventDefault();
    setIsApplying(true);

    try {
      await onApplyRange(draftRange);
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="reports-board full-span">
      <section className="report-hero">
        <div>
          <span className="eyebrow">Sales & Inventory Tracker</span>
          <h2>Performance overview</h2>
          <p>Monitor revenue, sales activity, best sellers, and restock priorities in one place.</p>
        </div>
        <form className="report-date-filter" onSubmit={applyDateRange}>
          <label>
            From
            <input
              type="date"
              value={draftRange.from}
              max={draftRange.to}
              onChange={(event) => setDraftRange((range) => ({ ...range, from: event.target.value }))}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={draftRange.to}
              min={draftRange.from}
              onChange={(event) => setDraftRange((range) => ({ ...range, to: event.target.value }))}
            />
          </label>
          <button className="primary-button" disabled={isApplying}>
            {isApplying ? 'Updating' : 'Apply'}
          </button>
        </form>
      </section>

      <section className="report-kpi-grid">
        <ReportKpi label="Revenue" value={formatPeso(report.overview.revenue)} detail="Paid sales total" />
        <ReportKpi label="Orders" value={report.overview.transactions} detail="Completed transactions" />
        <ReportKpi label="Units Sold" value={report.overview.unitsSold} detail="Items sold" />
        <ReportKpi label="Avg Order" value={formatPeso(report.overview.averageOrder)} detail="Average receipt value" />
      </section>

      <section className="report-grid">
        <div className="panel chart-panel large-chart">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Revenue Trend</span>
              <h2>Daily Sales Bar Chart</h2>
            </div>
          </div>
          <div className="bar-chart">
            {report.dailySales.map((day) => (
              <div className="bar-column" key={day.label}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${Math.max((day.revenue / maxDailyRevenue) * 100, 4)}%` }} />
                </div>
                <strong>{formatPeso(day.revenue)}</strong>
                <span>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel large-chart">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Monthly Sales</span>
              <h2>Sales Line Graph</h2>
            </div>
          </div>
          <LineChart data={report.monthlySales} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
          {selectedMonthData && (
            <div className="selected-month-card">
              <div>
                <span>Selected Month</span>
                <strong>{selectedMonthData.label}</strong>
              </div>
              <div>
                <span>Sales</span>
                <strong>{formatPeso(selectedMonthData.revenue)}</strong>
              </div>
              <div>
                <span>Transactions</span>
                <strong>{selectedMonthData.transactions}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Best Sellers</span>
              <h2>This Week</h2>
            </div>
          </div>
          <div className="rank-list">
            {report.weeklyBestSellers.map((product, index) => (
              <div className="rank-row" key={product.name}>
                <div className="rank-number">{index + 1}</div>
                <div className="rank-content">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.quantity} sold</span>
                  </div>
                  <b>{formatPeso(product.revenue)}</b>
                  <div className="progress-track">
                    <div style={{ width: `${Math.max((product.revenue / maxWeeklyRevenue) * 100, 6)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {!report.weeklyBestSellers.length && <div className="empty-state">No weekly sales yet</div>}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Best Sellers</span>
              <h2>This Month</h2>
            </div>
          </div>
          <div className="rank-list">
            {report.monthlyBestSellers.map((product, index) => (
              <div className="rank-row" key={product.name}>
                <div className="rank-number">{index + 1}</div>
                <div className="rank-content">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.quantity} sold</span>
                  </div>
                  <b>{formatPeso(product.revenue)}</b>
                  <div className="progress-track">
                    <div style={{ width: `${Math.max((product.revenue / maxMonthlyRevenue) * 100, 6)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {!report.monthlyBestSellers.length && <div className="empty-state">No monthly sales yet</div>}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Sales Mix</span>
              <h2>Category Pie Chart</h2>
            </div>
          </div>
          <div className="pie-layout">
            <div className="pie-chart" style={{ background: pieGradient }}>
              <div>
                <strong>{formatPeso(report.categorySales.reduce((sum, item) => sum + item.revenue, 0))}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="pie-legend">
              {report.categorySales.map((category, index) => (
                <div key={category.category}>
                  <i style={{ background: chartColors[index % chartColors.length] }} />
                  <span>{category.category}</span>
                  <b>{formatPeso(category.revenue)}</b>
                </div>
              ))}
              {!report.categorySales.length && <div className="empty-state">No category sales yet</div>}
            </div>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Inventory Value</span>
              <h2>Stock By Category</h2>
            </div>
          </div>
          <div className="category-list">
            {report.categoryStock.map((category) => (
              <div className="category-row" key={category.category}>
                <div>
                  <strong>{category.category}</strong>
                  <span>{category.stock} units available</span>
                </div>
                <b>{formatPeso(category.stockValue)}</b>
                <div className="progress-track">
                  <div style={{ width: `${Math.max((category.stockValue / maxCategoryValue) * 100, 6)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Restock</span>
              <h2>Low Stock Watchlist</h2>
            </div>
          </div>
          <div className="watch-list">
            {report.lowStock.length ? report.lowStock.map((product) => (
              <div className="watch-row" key={product.name}>
                <div>
                  <strong>{product.name}</strong>
                  <span>Reorder at {product.reorderLevel}</span>
                </div>
                <b>{product.stock} left</b>
              </div>
            )) : <div className="empty-state">No low stock items</div>}
          </div>
        </div>

        <div className="panel chart-panel recent-report-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Transactions</span>
              <h2>Recent Sales</h2>
            </div>
          </div>
          <div className="report-table">
            <table>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {report.recentSales.map((sale) => (
                  <tr key={sale.receiptNo}>
                    <td>
                      <strong>{sale.receiptNo}</strong>
                      <span>{new Date(sale.saleDate).toLocaleString()}</span>
                    </td>
                    <td>{sale.paymentMethod}</td>
                    <td><span className="pill success">{sale.status}</span></td>
                    <td>{formatPeso(sale.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

const chartColors = ['#0d9488', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

function getPieGradient(items) {
  const total = items.reduce((sum, item) => sum + item.revenue, 0);
  if (!total) return 'conic-gradient(#e2e8f0 0deg 360deg)';

  let current = 0;
  const stops = items.map((item, index) => {
    const start = current;
    const end = current + (item.revenue / total) * 360;
    current = end;
    return `${chartColors[index % chartColors.length]} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

function LineChart({ data, selectedMonth, onSelectMonth }) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);
  const width = 720;
  const height = 260;
  const padding = 34;
  const points = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - (point.revenue / maxRevenue) * (height - padding * 2);
    return { ...point, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly sales line chart">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3;
          return <line className="chart-grid-line" x1={padding} x2={width - padding} y1={y} y2={y} key={line} />;
        })}
        <polyline className="line-chart-line" points={polyline} />
        {points.map((point) => (
          <g
            className={point.label === selectedMonth ? 'line-chart-point active' : 'line-chart-point'}
            key={point.label}
            onClick={() => onSelectMonth(point.label)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectMonth(point.label);
              }
            }}
            role="button"
            tabIndex="0"
            aria-label={`Select ${point.label}`}
          >
            <circle className="line-chart-hit-area" cx={point.x} cy={point.y} r="16" />
            <circle className="line-chart-dot" cx={point.x} cy={point.y} r="5" />
            <text className="line-chart-label" x={point.x} y={height - 8} textAnchor="middle">{point.label.split(' ')[0]}</text>
          </g>
        ))}
      </svg>
      <div className="line-chart-values">
        {points.map((point) => (
          <button
            className={point.label === selectedMonth ? 'month-chip active' : 'month-chip'}
            key={point.label}
            onClick={() => onSelectMonth(point.label)}
          >
            <span>{point.label}</span>
            <strong>{formatPeso(point.revenue)}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportKpi({ label, value, detail }) {
  return (
    <article className="report-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function formatActivityLabel(action) {
  const labels = {
    login: 'Login',
    logout: 'Logout',
    sale_completed: 'Sale completed',
    sale_voided: 'Sale voided',
    product_created: 'Product added',
    product_updated: 'Product updated',
    stock_adjusted: 'Stock adjusted',
    product_deleted: 'Product deleted',
    product_restored: 'Product restored',
    recycle_bin_purged: 'Recycle bin purged',
    account_created: 'Account created',
    settings_updated: 'POS settings updated',
  };

  return labels[action] || String(action || 'Activity').replaceAll('_', ' ');
}

const emptyStaffAccountForm = {
  name: '',
  username: '',
  password: '',
  role: 'cashier',
};

function UsersPanel({ token }) {
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [activityData, setActivityData] = React.useState({
    users: [],
    activities: [],
    databaseTime: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showCreateAccount, setShowCreateAccount] = React.useState(false);
  const [showAccountPassword, setShowAccountPassword] = React.useState(false);
  const [accountForm, setAccountForm] = React.useState(emptyStaffAccountForm);
  const [creatingAccount, setCreatingAccount] = React.useState(false);
  const [accountNotice, setAccountNotice] = React.useState(null);

  const loadActivity = React.useCallback(async (options = {}) => {
    if (!options.silent) setLoading(true);
    setError('');

    try {
      const roleQuery = roleFilter === 'all' ? '' : `&role=${roleFilter}`;
      const data = await apiGet(`/users/activity?limit=100${roleQuery}`, token);
      setActivityData(data);
    } catch (activityError) {
      setError(activityError.message || 'Unable to load staff activity');
    } finally {
      if (!options.silent) setLoading(false);
    }
  }, [roleFilter, token]);

  React.useEffect(() => {
    loadActivity();
    const refreshTimer = window.setInterval(() => {
      loadActivity({ silent: true });
    }, 30000);

    return () => window.clearInterval(refreshTimer);
  }, [loadActivity]);

  async function createStaffAccount(event) {
    event.preventDefault();
    if (creatingAccount) return;

    setCreatingAccount(true);
    setAccountNotice(null);

    try {
      const createdAccount = await apiPost('/users', {
        name: accountForm.name.trim(),
        username: accountForm.username.trim(),
        password: accountForm.password,
        role: accountForm.role,
      }, token);

      setAccountNotice({
        type: 'success',
        text: `${createdAccount.name} was added as ${createdAccount.role}.`,
      });
      setAccountForm(emptyStaffAccountForm);
      setShowAccountPassword(false);
      setShowCreateAccount(false);
      await loadActivity();
    } catch (accountError) {
      setAccountNotice({
        type: 'error',
        text: accountError.message || 'Unable to create staff account',
      });
    } finally {
      setCreatingAccount(false);
    }
  }

  function closeCreateAccount() {
    setShowCreateAccount(false);
    setShowAccountPassword(false);
    setAccountForm(emptyStaffAccountForm);
    setAccountNotice(null);
  }

  const visibleUsers = roleFilter === 'all'
    ? activityData.users
    : activityData.users.filter((user) => user.role === roleFilter);
  const activeStaff = visibleUsers.filter((user) => user.isActive).length;
  const todayKey = new Date().toDateString();
  const todayActivities = activityData.activities.filter(
    (activity) => new Date(activity.createdAt).toDateString() === todayKey
  ).length;
  const lastActivity = activityData.activities[0] || null;

  return (
    <div className="panel users-activity-panel full-span">
      <div className="panel-header">
        <div>
          <span className="eyebrow">Owner Audit</span>
          <h2>Staff Activity</h2>
        </div>
        <div className="users-header-actions">
          <button
            className={showCreateAccount ? 'ghost-button staff-account-toggle' : 'primary-button staff-account-toggle'}
            type="button"
            onClick={() => {
              if (showCreateAccount) {
                closeCreateAccount();
              } else {
                setShowCreateAccount(true);
                setAccountNotice(null);
              }
            }}
          >
            {showCreateAccount
              ? <X size={17} aria-hidden="true" />
              : <UserPlus size={17} aria-hidden="true" />}
            {showCreateAccount ? 'Close' : 'Add Account'}
          </button>
          <div className="activity-role-filter" role="group" aria-label="Filter staff activity">
            {['all', 'admin', 'cashier'].map((role) => (
              <button
                className={roleFilter === role ? 'active' : ''}
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
              >
                {role === 'all' ? 'All Staff' : role}
              </button>
            ))}
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => loadActivity()}
            disabled={loading}
            title="Refresh activity"
            aria-label="Refresh staff activity"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {showCreateAccount && (
        <form className="staff-create-form" onSubmit={createStaffAccount}>
          <div className="staff-create-heading">
            <div>
              <span className="eyebrow">Account Access</span>
              <h3>Create staff account</h3>
            </div>
            <span className="owner-fixed-note">
              <ShieldCheck size={17} aria-hidden="true" />
              Owner account is fixed
            </span>
          </div>

          <div className="staff-create-grid">
            <label>
              <span>Full Name</span>
              <input
                required
                minLength="2"
                maxLength="120"
                autoComplete="off"
                value={accountForm.name}
                onChange={(event) => setAccountForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))}
              />
            </label>

            <label>
              <span>Username</span>
              <input
                required
                minLength="3"
                maxLength="80"
                pattern="[A-Za-z0-9._-]{3,80}"
                title="Use 3-80 letters, numbers, dots, underscores, or hyphens"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                value={accountForm.username}
                onChange={(event) => setAccountForm((current) => ({
                  ...current,
                  username: event.target.value.toLowerCase(),
                }))}
              />
            </label>

            <label>
              <span>Temporary Password</span>
              <div className="staff-password-input">
                <input
                  required
                  type={showAccountPassword ? 'text' : 'password'}
                  minLength="8"
                  maxLength="72"
                  pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}"
                  title="Use 8-72 characters with at least one letter and one number"
                  autoComplete="new-password"
                  value={accountForm.password}
                  onChange={(event) => setAccountForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))}
                />
                <button
                  type="button"
                  onClick={() => setShowAccountPassword((current) => !current)}
                  aria-label={showAccountPassword ? 'Hide temporary password' : 'Show temporary password'}
                  aria-pressed={showAccountPassword}
                  title={showAccountPassword ? 'Hide password' : 'Show password'}
                >
                  {showAccountPassword
                    ? <EyeOff size={17} aria-hidden="true" />
                    : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
            </label>

            <label>
              <span>Role</span>
              <select
                required
                value={accountForm.role}
                onChange={(event) => setAccountForm((current) => ({
                  ...current,
                  role: event.target.value,
                }))}
              >
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <div className="staff-create-actions">
            <button className="ghost-button" type="button" onClick={closeCreateAccount}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={creatingAccount}>
              <UserPlus size={17} aria-hidden="true" />
              {creatingAccount ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      {accountNotice && (
        <div
          className={`staff-account-notice ${accountNotice.type}`}
          role={accountNotice.type === 'error' ? 'alert' : 'status'}
        >
          <span>{accountNotice.text}</span>
          <button
            type="button"
            onClick={() => setAccountNotice(null)}
            aria-label="Dismiss account notice"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="staff-summary">
        <div><span>Active Staff</span><strong>{activeStaff}</strong></div>
        <div><span>Activity Today</span><strong>{todayActivities}</strong></div>
        <div>
          <span>Latest Event</span>
          <strong>{lastActivity ? formatDateTime(lastActivity.createdAt) : 'No activity yet'}</strong>
        </div>
      </div>

      {error && <div className="error-state">{error}</div>}

      <section className="staff-directory">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Staff Accounts</span>
            <h3>Login and logout records</h3>
          </div>
          <ShieldCheck size={20} />
        </div>
        <div className="table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Last Logout</th>
                <th>Activities</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="staff-user">
                      <strong>{user.name}</strong>
                      <span>@{user.username}</span>
                    </div>
                  </td>
                  <td><span className={`staff-role ${user.role}`}>{user.role}</span></td>
                  <td>{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}</td>
                  <td>{user.lastLogoutAt ? formatDateTime(user.lastLogoutAt) : 'Never'}</td>
                  <td>{user.activityCount}</td>
                  <td>
                    <span className={user.isActive ? 'staff-status active' : 'staff-status inactive'}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
              {!visibleUsers.length && !loading && (
                <tr>
                  <td colSpan="6"><div className="empty-state">No staff accounts found</div></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="activity-log-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Audit Timeline</span>
            <h3>Recent staff activity</h3>
          </div>
          <History size={20} />
        </div>
        <div className="staff-activity-list">
          {activityData.activities.map((activity) => (
            <article className="staff-activity-row" key={activity.id}>
              <span className={`activity-action-mark ${activity.action}`}>
                {formatActivityLabel(activity.action)}
              </span>
              <div className="staff-activity-copy">
                <div>
                  <strong>{activity.userName}</strong>
                  <span className={`staff-role ${activity.userRole}`}>{activity.userRole}</span>
                </div>
                <p>{activity.description}</p>
              </div>
              <time
                dateTime={activity.createdAt}
                title={new Date(activity.createdAt).toISOString()}
              >
                {formatDateTime(activity.createdAt)}
              </time>
            </article>
          ))}
          {!activityData.activities.length && !loading && (
            <div className="empty-state">No recorded staff activity yet</div>
          )}
          {loading && !activityData.activities.length && (
            <div className="empty-state">Loading staff activity...</div>
          )}
        </div>
      </section>
    </div>
  );
}

const posSettingKeys = [
  'shopName',
  'shopAddress',
  'contactNumber',
  'tin',
  'shopLogoUrl',
  'receiptFooter',
  'receiptPaperSize',
  'autoOpenReceipt',
  'autoPrintReceipt',
  'enabledPaymentMethods',
  'defaultPaymentMethod',
  'commonBills',
  'barcodeAutoAdd',
  'defaultReorderLevel',
  'recycleRetentionDays',
  'inactivityTimeoutMinutes',
  'cashierVoidReasonRequired',
];

function posSettingsSnapshot(settings) {
  return Object.fromEntries(posSettingKeys.map((key) => [key, settings[key]]));
}

function SettingsPanel({ apiStatus, settings, onSave }) {
  const normalizedSettings = { ...defaultPosSettings, ...settings };
  const [activeTab, setActiveTab] = React.useState('business');
  const [draft, setDraft] = React.useState(normalizedSettings);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveState, setSaveState] = React.useState({ type: 'idle', message: '' });
  const logoInput = React.useRef(null);
  const tabs = [
    { id: 'business', label: 'Shop & Receipt', icon: Building2 },
    { id: 'checkout', label: 'Checkout', icon: CreditCard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'security', label: 'Security', icon: LockKeyhole },
    { id: 'system', label: 'System Status', icon: Database },
  ];
  const paymentChoices = [
    { value: 'cash', label: 'Cash', icon: Banknote },
    { value: 'gcash', label: 'GCash', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard },
  ];
  const isDirty = JSON.stringify(posSettingsSnapshot(draft))
    !== JSON.stringify(posSettingsSnapshot(normalizedSettings));

  React.useEffect(() => {
    setDraft({ ...defaultPosSettings, ...settings });
  }, [settings]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveState({ type: 'idle', message: '' });
  }

  function resetDraft() {
    setDraft(normalizedSettings);
    setSaveState({ type: 'idle', message: '' });
  }

  async function chooseShopLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setSaveState({ type: 'error', message: 'Choose a PNG, JPG, or WebP logo.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveState({ type: 'error', message: 'Shop logo must be 2MB or smaller.' });
      return;
    }

    try {
      updateDraft('shopLogoUrl', await readImageFile(file));
    } catch (error) {
      setSaveState({ type: 'error', message: error.message });
    }
  }

  function togglePaymentMethod(method) {
    const isEnabled = draft.enabledPaymentMethods.includes(method);
    if (isEnabled && draft.enabledPaymentMethods.length === 1) {
      setSaveState({ type: 'error', message: 'Keep at least one payment method enabled.' });
      return;
    }

    const enabledPaymentMethods = isEnabled
      ? draft.enabledPaymentMethods.filter((item) => item !== method)
      : [...draft.enabledPaymentMethods, method];
    const defaultPaymentMethod = enabledPaymentMethods.includes(draft.defaultPaymentMethod)
      ? draft.defaultPaymentMethod
      : enabledPaymentMethods[0];
    setDraft((current) => ({
      ...current,
      enabledPaymentMethods,
      defaultPaymentMethod,
    }));
    setSaveState({ type: 'idle', message: '' });
  }

  function updateCommonBill(index, value) {
    setDraft((current) => ({
      ...current,
      commonBills: current.commonBills.map((amount, amountIndex) => (
        amountIndex === index ? value : amount
      )),
    }));
    setSaveState({ type: 'idle', message: '' });
  }

  function removeCommonBill(index) {
    if (draft.commonBills.length === 1) {
      setSaveState({ type: 'error', message: 'Keep at least one common bill amount.' });
      return;
    }
    updateDraft(
      'commonBills',
      draft.commonBills.filter((_, amountIndex) => amountIndex !== index)
    );
  }

  function addCommonBill() {
    if (draft.commonBills.length >= 6) {
      setSaveState({ type: 'error', message: 'You can configure up to six common bills.' });
      return;
    }
    updateDraft('commonBills', [...draft.commonBills, '']);
  }

  function prepareSettingsPayload() {
    const commonBills = draft.commonBills.map(Number);
    if (!draft.shopName.trim()) throw new Error('Shop name is required.');
    if (
      commonBills.some((amount) => !Number.isInteger(amount) || amount <= 0)
      || new Set(commonBills).size !== commonBills.length
    ) {
      throw new Error('Common bills must be unique positive whole numbers.');
    }

    return {
      ...posSettingsSnapshot(draft),
      shopName: draft.shopName.trim(),
      shopAddress: draft.shopAddress.trim(),
      contactNumber: draft.contactNumber.trim(),
      tin: draft.tin.trim(),
      receiptFooter: draft.receiptFooter.trim(),
      commonBills: commonBills.sort((first, second) => first - second),
      defaultReorderLevel: Number(draft.defaultReorderLevel),
      recycleRetentionDays: Number(draft.recycleRetentionDays),
      inactivityTimeoutMinutes: Number(draft.inactivityTimeoutMinutes),
    };
  }

  async function saveSettings(event) {
    event.preventDefault();
    setIsSaving(true);
    setSaveState({ type: 'idle', message: '' });

    try {
      const savedSettings = await onSave(prepareSettingsPayload());
      setDraft({ ...defaultPosSettings, ...savedSettings });
      setSaveState({ type: 'success', message: 'Settings saved to PostgreSQL.' });
    } catch (error) {
      setSaveState({ type: 'error', message: error.message || 'Unable to save settings.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="settings-console full-span">
      <aside className="settings-navigation" aria-label="Settings sections">
        <div className="settings-navigation-heading">
          <span className="eyebrow">POS Control</span>
          <h2>Configuration</h2>
        </div>
        <div className="settings-tabs" role="tablist" aria-orientation="vertical">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={activeTab === tab.id ? 'settings-tab active' : 'settings-tab'}
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </div>
        <div className="settings-database-state">
          <span className="settings-status-dot" />
          <div>
            <strong>PostgreSQL</strong>
            <span>{apiStatus.startsWith('Connected') ? 'Connected' : 'Check connection'}</span>
          </div>
        </div>
      </aside>

      <form className="settings-workspace" onSubmit={saveSettings}>
        <div className="settings-toolbar">
          <div>
            <span className="eyebrow">{tabs.find((tab) => tab.id === activeTab)?.label}</span>
            <h2>
              {activeTab === 'business' && 'Shop identity and receipts'}
              {activeTab === 'checkout' && 'Payment and scanner controls'}
              {activeTab === 'inventory' && 'Stock safeguards'}
              {activeTab === 'security' && 'Access and accountability'}
              {activeTab === 'system' && 'Connection overview'}
            </h2>
          </div>
          <div className="settings-toolbar-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={resetDraft}
              disabled={!isDirty || isSaving}
            >
              <RotateCcw size={17} />
              Reset
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={!isDirty || isSaving}
            >
              <Save size={17} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveState.message && (
          <div className={`settings-save-state ${saveState.type}`} role="status">
            {saveState.type === 'success' ? <Check size={17} /> : <CircleAlert size={17} />}
            <span>{saveState.message}</span>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="settings-section">
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><Building2 size={19} /></div>
                <div>
                  <h3>Business Information</h3>
                  <span>Printed on customer receipts</span>
                </div>
              </div>
              <div className="shop-logo-editor">
                <div className="shop-logo-preview">
                  {draft.shopLogoUrl ? (
                    <img src={draft.shopLogoUrl} alt="Shop logo preview" />
                  ) : (
                    <ImagePlus size={26} />
                  )}
                </div>
                <div className="shop-logo-actions">
                  <strong>Shop Logo</strong>
                  <span>PNG, JPG, or WebP up to 2MB</span>
                  <div>
                    <input
                      ref={logoInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={chooseShopLogo}
                      hidden
                    />
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => logoInput.current?.click()}
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                    {draft.shopLogoUrl && (
                      <button
                        className="icon-action danger"
                        type="button"
                        title="Remove shop logo"
                        aria-label="Remove shop logo"
                        onClick={() => updateDraft('shopLogoUrl', '')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="settings-field-grid">
                <label className="settings-field full">
                  <span>Shop Name</span>
                  <input
                    required
                    maxLength={120}
                    value={draft.shopName}
                    onChange={(event) => updateDraft('shopName', event.target.value)}
                  />
                </label>
                <label className="settings-field full">
                  <span>Address</span>
                  <textarea
                    rows={2}
                    maxLength={240}
                    value={draft.shopAddress}
                    onChange={(event) => updateDraft('shopAddress', event.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Contact Number</span>
                  <input
                    maxLength={40}
                    value={draft.contactNumber}
                    onChange={(event) => updateDraft('contactNumber', event.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>TIN</span>
                  <input
                    maxLength={40}
                    value={draft.tin}
                    onChange={(event) => updateDraft('tin', event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><Receipt size={19} /></div>
                <div>
                  <h3>Receipt Preferences</h3>
                  <span>Layout and checkout behavior</span>
                </div>
              </div>
              <fieldset className="settings-field settings-paper-field">
                <legend>Paper Size</legend>
                <div className="settings-segmented-control">
                  {[
                    ['58mm', '58 mm'],
                    ['80mm', '80 mm'],
                    ['a4', 'A4'],
                  ].map(([value, label]) => (
                    <button
                      className={draft.receiptPaperSize === value ? 'active' : ''}
                      key={value}
                      type="button"
                      onClick={() => updateDraft('receiptPaperSize', value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <SettingToggle
                checked={draft.autoOpenReceipt}
                title="Open receipt after sale"
                description="Launch the completed receipt in a new tab"
                onChange={(checked) => {
                  setDraft((current) => ({
                    ...current,
                    autoOpenReceipt: checked,
                    autoPrintReceipt: checked ? current.autoPrintReceipt : false,
                  }));
                  setSaveState({ type: 'idle', message: '' });
                }}
              />
              <SettingToggle
                checked={draft.autoPrintReceipt}
                title="Open print dialog automatically"
                description="Available when receipt tabs are enabled"
                disabled={!draft.autoOpenReceipt}
                onChange={(checked) => updateDraft('autoPrintReceipt', checked)}
              />
              <label className="settings-field full">
                <span>Receipt Footer</span>
                <textarea
                  rows={3}
                  maxLength={240}
                  value={draft.receiptFooter}
                  onChange={(event) => updateDraft('receiptFooter', event.target.value)}
                />
              </label>
            </section>
          </div>
        )}

        {activeTab === 'checkout' && (
          <div className="settings-section">
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><CreditCard size={19} /></div>
                <div>
                  <h3>Payment Methods</h3>
                  <span>Shown at the sales counter</span>
                </div>
              </div>
              <div className="settings-choice-grid">
                {paymentChoices.map((choice) => {
                  const Icon = choice.icon;
                  const isEnabled = draft.enabledPaymentMethods.includes(choice.value);
                  return (
                    <button
                      className={isEnabled ? 'settings-choice active' : 'settings-choice'}
                      type="button"
                      key={choice.value}
                      aria-pressed={isEnabled}
                      onClick={() => togglePaymentMethod(choice.value)}
                    >
                      <Icon size={20} />
                      <span>{choice.label}</span>
                      <span className="settings-choice-check">
                        {isEnabled && <Check size={14} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <label className="settings-field settings-select-field">
                <span>Default Payment Method</span>
                <select
                  value={draft.defaultPaymentMethod}
                  onChange={(event) => updateDraft('defaultPaymentMethod', event.target.value)}
                >
                  {paymentChoices
                    .filter((choice) => draft.enabledPaymentMethods.includes(choice.value))
                    .map((choice) => (
                      <option key={choice.value} value={choice.value}>{choice.label}</option>
                    ))}
                </select>
              </label>
            </section>

            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><Banknote size={19} /></div>
                <div>
                  <h3>Cash Tender</h3>
                  <span>Common bill shortcuts</span>
                </div>
              </div>
              <div className="common-bill-editor">
                {draft.commonBills.map((amount, index) => (
                  <label className="common-bill-input" key={`${index}-${draft.commonBills.length}`}>
                    <span aria-hidden="true">&#8369;</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      aria-label={`Common bill ${index + 1}`}
                      value={amount}
                      onChange={(event) => updateCommonBill(index, event.target.value)}
                    />
                    <button
                      type="button"
                      title="Remove bill"
                      aria-label={`Remove common bill ${amount}`}
                      onClick={() => removeCommonBill(index)}
                    >
                      <X size={15} />
                    </button>
                  </label>
                ))}
                <button className="add-common-bill" type="button" onClick={addCommonBill}>
                  <Plus size={16} />
                  Add Bill
                </button>
              </div>
              <SettingToggle
                checked={draft.barcodeAutoAdd}
                title="Add exact barcode matches automatically"
                description="The scanner adds a matched product without pressing Add Item"
                onChange={(checked) => updateDraft('barcodeAutoAdd', checked)}
              />
            </section>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="settings-section">
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><Boxes size={19} /></div>
                <div>
                  <h3>Stock Defaults</h3>
                  <span>Inventory thresholds and retention</span>
                </div>
              </div>
              <div className="settings-field-grid">
                <label className="settings-field">
                  <span>Default Reorder Level</span>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    step="1"
                    value={draft.defaultReorderLevel}
                    onChange={(event) => updateDraft('defaultReorderLevel', event.target.value)}
                  />
                </label>
                <label className="settings-field">
                  <span>Recycle Bin Retention (days)</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    step="1"
                    value={draft.recycleRetentionDays}
                    onChange={(event) => updateDraft('recycleRetentionDays', event.target.value)}
                  />
                </label>
              </div>
            </section>
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><ShieldCheck size={19} /></div>
                <div>
                  <h3>Inventory Safeguards</h3>
                  <span>Enforced by the checkout API</span>
                </div>
              </div>
              <div className="settings-readonly-row">
                <div>
                  <strong>Prevent negative stock</strong>
                  <span>Checkout stops when requested quantity exceeds available stock</span>
                </div>
                <span className="status-chip healthy"><Check size={14} /> Active</span>
              </div>
              <div className="settings-readonly-row">
                <div>
                  <strong>Product image upload</strong>
                  <span>New products require an uploaded image</span>
                </div>
                <span className="status-chip healthy"><Check size={14} /> Active</span>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-section">
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><LockKeyhole size={19} /></div>
                <div>
                  <h3>Session Security</h3>
                  <span>Applies to signed-in POS users</span>
                </div>
              </div>
              <label className="settings-field settings-compact-field">
                <span>Sign Out After Inactivity (minutes)</span>
                <input
                  type="number"
                  min="5"
                  max="720"
                  step="1"
                  value={draft.inactivityTimeoutMinutes}
                  onChange={(event) => updateDraft('inactivityTimeoutMinutes', event.target.value)}
                />
              </label>
              <SettingToggle
                checked={draft.cashierVoidReasonRequired}
                title="Require a reason when a cashier voids a sale"
                description="Owner cancellation notes remain optional"
                onChange={(checked) => updateDraft('cashierVoidReasonRequired', checked)}
              />
            </section>
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><ShieldCheck size={19} /></div>
                <div>
                  <h3>Role Protection</h3>
                  <span>Server-enforced permissions</span>
                </div>
              </div>
              <div className="settings-role-grid">
                <div><strong>Owner</strong><span>Full access and staff audit</span></div>
                <div><strong>Admin</strong><span>Operations and POS settings</span></div>
                <div><strong>Cashier</strong><span>Sales counter access only</span></div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="settings-section">
            <section className="settings-group">
              <div className="settings-group-heading">
                <div className="settings-section-icon"><Wifi size={19} /></div>
                <div>
                  <h3>Service Health</h3>
                  <span>Read-only connection information</span>
                </div>
              </div>
              <div className="settings-system-grid">
                <div>
                  <Wifi size={19} />
                  <span>API Connection</span>
                  <strong>{apiStatus}</strong>
                </div>
                <div>
                  <Database size={19} />
                  <span>Settings Storage</span>
                  <strong>SQLite / local device</strong>
                </div>
                <div>
                  <ShieldCheck size={19} />
                  <span>Access</span>
                  <strong>Owner and Admin</strong>
                </div>
                <div>
                  <History size={19} />
                  <span>Last Saved</span>
                  <strong>
                    {normalizedSettings.updatedAt
                      ? formatDateTime(normalizedSettings.updatedAt)
                      : 'Initial configuration'}
                  </strong>
                  {normalizedSettings.updatedByName && (
                    <small>by {normalizedSettings.updatedByName}</small>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </form>
    </div>
  );
}

function SettingToggle({
  checked,
  title,
  description,
  onChange,
  disabled = false,
}) {
  return (
    <label className={disabled ? 'setting-toggle disabled' : 'setting-toggle'}>
      <span className="setting-toggle-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="setting-toggle-control" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

function RoleCard({ title, access }) {
  return (
    <div className="role-card">
      <strong>{title}</strong>
      <span>{access}</span>
    </div>
  );
}

function CartLine({ item, onDecrease, onIncrease, onQuantityChange, onRemove }) {
  return (
    <div className="cart-line">
      <ProductThumb product={item} />
      <div className="cart-product">
        <strong>{item.name}</strong>
        <span>{formatPeso(item.unitPrice)} · Stock {item.stock}</span>
        <div className="quantity-control">
          <button onClick={onDecrease} title="Decrease quantity" aria-label={`Decrease ${item.name} quantity`}>
            <Minus size={15} />
          </button>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.qty}
            onChange={(event) => onQuantityChange(event.target.value)}
            aria-label={`${item.name} quantity`}
          />
          <button
            onClick={onIncrease}
            disabled={item.qty >= item.stock}
            title="Increase quantity"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="cart-line-total">
        <button className="remove-cart-item" onClick={onRemove} title="Remove item" aria-label={`Remove ${item.name}`}>
          <X size={16} />
        </button>
        <b>{formatPeso(item.total)}</b>
      </div>
    </div>
  );
}

function Root() {
  const receiptId = new URLSearchParams(window.location.search).get('receipt');
  return receiptId ? <StandaloneReceiptPage saleId={receiptId} /> : <App />;
}

createRoot(document.getElementById('root')).render(<Root />);
