import React, { useState, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Home,
  Paid,
  Receipt,
  Store,
  Work,
  People,
  History,
  Settings,
  Brightness4,
  Brightness7,
  ContentCopy,
  ContactMail,
  TrendingUp,
  BarChart,
  Close,
  AddCircle,
  CheckCircle,
  Error as ErrorIcon,
  Info as InfoIcon,
  FileDownload,
} from "@mui/icons-material";

// --- THEME SETUP (Minecraft-inspired) ---
const mcTheme = (darkMode) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#388e3c", // Minecraft green
      },
      secondary: {
        main: "#212121", // Minecraft black
      },
      background: {
        default: darkMode ? "#181c1b" : "#e8f5e9",
        paper: darkMode ? "#232927" : "#f5f5f5",
      },
    },
    typography: {
      fontFamily: "Roboto, Minecraftia, Arial, sans-serif",
      h4: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
    },
  });

// --- UTILS: LOCALSTORAGE + TEST DATA ---
const TEST_USER = {
  bankId: "BANK006443",
  password: "26",
  bankName: "Creeper Bank",
  mcEdition: "Java",
  mcName: "Steve",
  balance: 5000,
  profilePic: "",
};
const TEST_TAX = [
  {
    bankId: "BANK006443",
    selling: 120,
    buying: 80,
    total: 200,
    paid: 100,
    history: [
      { date: daysAgo(1), selling: 20, buying: 10, total: 30, paid: 30 },
      { date: daysAgo(2), selling: 30, buying: 20, total: 50, paid: 0 },
      { date: daysAgo(3), selling: 40, buying: 30, total: 70, paid: 50 },
      { date: daysAgo(4), selling: 10, buying: 20, total: 30, paid: 20 },
      { date: daysAgo(5), selling: 20, buying: 0, total: 20, paid: 0 },
      { date: daysAgo(6), selling: 0, buying: 0, total: 0, paid: 0 },
      { date: daysAgo(7), selling: 0, buying: 0, total: 0, paid: 0 },
    ],
    payments: [
      { date: daysAgo(1), amount: 30 },
      { date: daysAgo(3), amount: 50 },
      { date: daysAgo(4), amount: 20 },
      { date: daysAgo(0), amount: 0 },
    ],
  },
];
const TEST_LOANS = [
  {
    bankId: "BANK006443",
    type: "Personal Loan",
    amount: 1000,
    duration: 2,
    interest: 7,
    status: "Pending",
    reason: "Need to buy diamond pickaxe",
    appliedAt: daysAgo(2),
    extra: { name: "Steve", job: "Miner", perDayIncome: 200 },
  },
  {
    bankId: "BANK006443",
    type: "Home Loan",
    amount: 5000,
    duration: 3,
    interest: 4,
    status: "Approved",
    reason: "Expand my Minecraft house",
    appliedAt: daysAgo(5),
    extra: { coords: ["100,64,100", "110,64,110"], pic: "" },
  },
];
const TEST_TRANSACTIONS = [
  {
    bankId: "BANK006443",
    type: "Shop",
    amount: -200,
    date: daysAgo(1),
    desc: "Bought enchanted book",
  },
  {
    bankId: "BANK006443",
    type: "Job",
    amount: 500,
    date: daysAgo(2),
    desc: "Mined diamonds",
  },
  {
    bankId: "BANK006443",
    type: "Player",
    amount: -100,
    date: daysAgo(3),
    desc: "Paid Alex",
  },
  {
    bankId: "BANK006443",
    type: "Shop",
    amount: -50,
    date: daysAgo(4),
    desc: "Bought food",
  },
  {
    bankId: "BANK006443",
    type: "Job",
    amount: 300,
    date: daysAgo(5),
    desc: "Sold iron",
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function getLS(key, fallback) {
  try {
    const val = JSON.parse(localStorage.getItem(key));
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}
function setLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function injectTestData() {
  if (!getLS("users", []).length) setLS("users", [TEST_USER]);
  if (!getLS("taxes", []).length) setLS("taxes", TEST_TAX);
  if (!getLS("loans", []).length) setLS("loans", TEST_LOANS);
  if (!getLS("transactions", []).length) setLS("transactions", TEST_TRANSACTIONS);
}

// --- BANK ID GENERATOR ---
function generateBankId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return "BANK" + n;
}

// --- INTEREST RATES ---
const INTEREST = {
  "Personal Loan": [6, 7, 9, 13, 16],
  "Home Loan": [2, 3, 4, 5, 6.5],
  "Business Loan": [5, 7, 8, 10.5, 13],
  "Business Startup Loan": [3, 4, 6, 7, 9],
  "Home Startup Loan": [2, 3, 5, 7, 8],
};

// --- MAIN APP ---
export default function App() {
  // --- THEME ---
  const [darkMode, setDarkMode] = useState(true);
  const theme = mcTheme(darkMode);

  // --- AUTH ---
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // --- SIDEBAR ---
  const [drawer, setDrawer] = useState(false);

  // --- NAVIGATION ---
  const [page, setPage] = useState("home");

  // --- SNACKBAR ---
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  // --- DIALOGS ---
  const [dialog, setDialog] = useState({ open: false, content: null });

  // --- INIT TEST DATA ---
  useEffect(() => {
    injectTestData();
    // Auto-login test user for demo
    // setUser(TEST_USER);
  }, []);

  // --- HANDLERS ---
  function handleLogin(bankId, password) {
    const users = getLS("users", []);
    const u = users.find((u) => u.bankId === bankId && u.password === password);
    if (u) {
      setUser(u);
      setPage("home");
      setSnack({ open: true, msg: "Login successful!", severity: "success" });
    } else {
      setSnack({ open: true, msg: "Invalid Bank ID or password.", severity: "error" });
    }
  }
  function handleRegister(data) {
    const users = getLS("users", []);
    if (users.find((u) => u.bankId === data.bankId)) {
      setSnack({ open: true, msg: "Bank ID already exists.", severity: "error" });
      return;
    }
    users.push(data);
    setLS("users", users);
    setSnack({ open: true, msg: "Account created! Please login.", severity: "success" });
    setShowRegister(false);
  }
  function handleLogout() {
    setUser(null);
    setPage("login");
    setSnack({ open: true, msg: "Logged out.", severity: "info" });
  }

  // --- RENDER ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* HEADER */}
        <Header
          user={user}
          onMenu={() => setDrawer(true)}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* SIDEBAR */}
        <Drawer anchor="left" open={drawer} onClose={() => setDrawer(false)}>
          <Sidebar
            user={user}
            setPage={setPage}
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            closeDrawer={() => setDrawer(false)}
          />
        </Drawer>

        {/* MAIN CONTENT */}
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
          {!user ? (
            showRegister ? (
              <RegisterForm
                onRegister={handleRegister}
                onBack={() => setShowRegister(false)}
              />
            ) : (
              <LoginForm
                onLogin={handleLogin}
                onShowRegister={() => setShowRegister(true)}
              />
            )
          ) : (
            <>
              {page === "home" && (
                <HomePage user={user} setPage={setPage} />
              )}
              {page === "bank" && (
                <BankStatus user={user} />
              )}
              {page === "tax" && (
                <TaxDashboard user={user} />
              )}
              {page === "loan" && (
                <LoanDashboard user={user} />
              )}
              {page === "settings" && (
                <AccountSettings user={user} setUser={setUser} />
              )}
              {page === "top-tax" && (
                <TopPayers type="tax" />
              )}
              {page === "top-advance" && (
                <TopPayers type="advance" />
              )}
              {page === "contact" && (
                <ContactUs />
              )}
              {page === "theme" && (
                <ThemeSettings darkMode={darkMode} setDarkMode={setDarkMode} />
              )}
            </>
          )}
        </Box>

        {/* SNACKBAR */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            sx={{ width: "100%" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>

        {/* DIALOG */}
        <Dialog open={dialog.open} onClose={() => setDialog({ open: false, content: null })}>
          {dialog.content}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

// --- HEADER ---
function Header({ user, onMenu, onLogout, darkMode, setDarkMode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        py: 1,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        boxShadow: 2,
      }}
    >
      {user && (
        <IconButton onClick={onMenu} sx={{ color: "inherit", mr: 1 }}>
          <MenuIcon />
        </IconButton>
      )}
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
        Minecraft Bank
      </Typography>
      <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
        <IconButton
          onClick={() => setDarkMode((d) => !d)}
          sx={{ color: "inherit" }}
        >
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
      {user && (
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <Avatar sx={{ bgcolor: "#43a047", mr: 1 }}>
            {user.mcName ? user.mcName[0].toUpperCase() : "?"}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.mcName}
          </Typography>
          <IconButton onClick={onLogout} sx={{ color: "inherit", ml: 2 }}>
            <Logout />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}

// --- SIDEBAR ---
function Sidebar({
  user,
  setPage,
  onLogout,
  darkMode,
  setDarkMode,
  closeDrawer,
}) {
  return (
    <Box sx={{ width: 260 }}>
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Avatar sx={{ bgcolor: "#43a047", width: 48, height: 48, mb: 1 }}>
          {user?.mcName ? user.mcName[0].toUpperCase() : "?"}
        </Avatar>
        <Typography variant="h6">{user?.mcName || "Guest"}</Typography>
        <Typography variant="body2">{user?.bankId || ""}</Typography>
      </Box>
      <List>
        <ListItem button onClick={() => { setPage("home"); closeDrawer(); }}>
          <ListItemIcon><Home /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => { setPage("bank"); closeDrawer(); }}>
          <ListItemIcon><Store /></ListItemIcon>
          <ListItemText primary="Bank Status" />
        </ListItem>
        <ListItem button onClick={() => { setPage("tax"); closeDrawer(); }}>
          <ListItemIcon><Receipt /></ListItemIcon>
          <ListItemText primary="View Tax" />
        </ListItem>
        <ListItem button onClick={() => { setPage("loan"); closeDrawer(); }}>
          <ListItemIcon><Paid /></ListItemIcon>
          <ListItemText primary="Apply Loan" />
        </ListItem>
        <Divider />
        <ListItem button onClick={() => { setPage("settings"); closeDrawer(); }}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary="Account Settings" />
        </ListItem>
        <ListItem button onClick={() => { setPage("top-tax"); closeDrawer(); }}>
          <ListItemIcon><TrendingUp /></ListItemIcon>
          <ListItemText primary="Top Tax Payers" />
        </ListItem>
        <ListItem button onClick={() => { setPage("top-advance"); closeDrawer(); }}>
          <ListItemIcon><BarChart /></ListItemIcon>
          <ListItemText primary="Top Advance Payers" />
        </ListItem>
        <ListItem button onClick={() => { setPage("contact"); closeDrawer(); }}>
          <ListItemIcon><ContactMail /></ListItemIcon>
          <ListItemText primary="Contact Us" />
        </ListItem>
        <ListItem button onClick={() => { setPage("theme"); closeDrawer(); }}>
          <ListItemIcon>{darkMode ? <Brightness7 /> : <Brightness4 />}</ListItemIcon>
          <ListItemText primary="Theme Setting" />
        </ListItem>
        <Divider />
        <ListItem button onClick={onLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );
}

// --- LOGIN FORM ---
function LoginForm({ onLogin, onShowRegister }) {
  const [bankId, setBankId] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Login to Minecraft Bank
      </Typography>
      <TextField
        label="Bank ID"
        value={bankId}
        onChange={(e) => setBankId(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() => onLogin(bankId, password)}
        sx={{ mb: 2 }}
      >
        Login
      </Button>
      <Typography align="center" sx={{ mb: 1 }}>
        Don't have an account?
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={onShowRegister}
      >
        Create One
      </Button>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Test Account: <b>BANK006443</b> / <b>26</b>
        </Typography>
      </Box>
    </Paper>
  );
}

// --- REGISTER FORM ---
function RegisterForm({ onRegister, onBack }) {
  const [bankName, setBankName] = useState("");
  const [password, setPassword] = useState("");
  const [mcEdition, setMcEdition] = useState("Java");
  const [mcName, setMcName] = useState("");
  const [bankId, setBankId] = useState(generateBankId());
  const [showCopied, setShowCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(bankId);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1000);
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Create Account
      </Typography>
      <TextField
        label="Bank Name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TextField
          label="Bank ID"
          value={bankId}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
        <Tooltip title="Copy Bank ID">
          <IconButton onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
        {showCopied && (
          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
            Copied!
          </Typography>
        )}
      </Box>
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Minecraft Edition</InputLabel>
        <Select
          value={mcEdition}
          label="Minecraft Edition"
          onChange={(e) => setMcEdition(e.target.value)}
        >
          <MenuItem value="Java">Java</MenuItem>
          <MenuItem value="Bedrock">Bedrock</MenuItem>
        </Select>
      </FormControl>
      {mcEdition === "Bedrock" ? (
        <TextField
          label="Bedrock MC Name"
          value={mcName}
          onChange={(e) => setMcName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="/box box <mc name> /box"
        />
      ) : (
        <TextField
          label="Minecraft Name"
          value={mcName}
          onChange={(e) => setMcName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={() =>
          onRegister({
            bankId,
            password,
            bankName,
            mcEdition,
            mcName,
            balance: 2000 + Math.floor(Math.random() * 3000),
            profilePic: "",
          })
        }
        sx={{ mb: 2 }}
      >
        Create Account
      </Button>
      <Button variant="text" fullWidth onClick={onBack}>
        Back to Login
      </Button>
    </Paper>
  );
}

// --- HOME PAGE ---
function HomePage({ user, setPage }) {
  return (
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome, {user.mcName}!
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        What would you like to do?
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Store />}
          onClick={() => setPage("bank")}
        >
          Bank Status
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Receipt />}
          onClick={() => setPage("tax")}
        >
          View Tax
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Paid />}
          onClick={() => setPage("loan")}
        >
          Apply Loan
        </Button>
      </Box>
    </Paper>
  );
}

// --- BANK STATUS ---
function BankStatus({ user }) {
  const [tab, setTab] = useState("shop");
  const transactions = getLS("transactions", []).filter(
    (t) => t.bankId === user.bankId
  );
  const shopTx = transactions.filter((t) => t.type === "Shop");
  const jobTx = transactions.filter((t) => t.type === "Job");
  const playerTx = transactions.filter((t) => t.type === "Player");

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Bank Status
      </Typography>
      <Typography>
        <b>Bank Name:</b> {user.bankName}
      </Typography>
      <Typography>
        <b>Bank Balance:</b> {user.balance} coins
      </Typography>
      <Typography>
        <b>Bank Info:</b> Secure Minecraft bank for all your needs!
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant={tab === "shop" ? "contained" : "outlined"}
          onClick={() => setTab("shop")}
          sx={{ mr: 1 }}
        >
          Shop Transactions
        </Button>
        <Button
          variant={tab === "job" ? "contained" : "outlined"}
          onClick={() => setTab("job")}
          sx={{ mr: 1 }}
        >
          Job Transactions
        </Button>
        <Button
          variant={tab === "player" ? "contained" : "outlined"}
          onClick={() => setTab("player")}
        >
          Player-to-Player Transactions
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        {tab === "shop" && <TransactionList txs={shopTx} />}
        {tab === "job" && <TransactionList txs={jobTx} />}
        {tab === "player" && <TransactionList txs={playerTx} />}
      </Box>
    </Paper>
  );
}
function TransactionList({ txs }) {
  if (!txs.length)
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No transactions found.
      </Typography>
    );
  return (
    <Box>
      {txs.map((t, i) => (
        <Paper
          key={i}
          sx={{
            p: 2,
            mb: 1,
            display: "flex",
            alignItems: "center",
            bgcolor: t.amount < 0 ? "#ffebee" : "#e8f5e9",
          }}
        >
          <Typography sx={{ flexGrow: 1 }}>
            {t.desc} ({t.date})
          </Typography>
          <Typography color={t.amount < 0 ? "error.main" : "success.main"}>
            {t.amount > 0 ? "+" : ""}
            {t.amount} coins
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

// --- TAX DASHBOARD ---
function TaxDashboard({ user }) {
  const [tab, setTab] = useState("main");
  const [showChart, setShowChart] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  const taxes = getLS("taxes", []);
  const tax = taxes.find((t) => t.bankId === user.bankId) || {
    selling: 0,
    buying: 0,
    total: 0,
    paid: 0,
    history: [],
    payments: [],
  };
  const due = tax.total - tax.paid;

  function handlePayTax() {
    // Simulate payment
    const newTaxes = taxes.map((t) =>
      t.bankId === user.bankId
        ? {
            ...t,
            paid: t.total,
            payments: [
              ...(t.payments || []),
              { date: new Date().toISOString().split("T")[0], amount: due },
            ],
          }
        : t
    );
    setLS("taxes", newTaxes);
    setSnack({ open: true, msg: "Tax paid!", severity: "success" });
  }
  function handleAdvancePay() {
    setSnack({ open: true, msg: "Advance tax paid!", severity: "success" });
  }
  function handleDownloadChart() {
    setSnack({ open: true, msg: "Chart downloaded (simulated).", severity: "info" });
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Tax Dashboard
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography>
          <b>Selling Tax:</b> {tax.selling} coins
        </Typography>
        <Typography>
          <b>Buying Tax:</b> {tax.buying} coins
        </Typography>
        <Typography>
          <b>Total Tax:</b> {tax.total} coins
        </Typography>
        <Typography>
          <b>Tax Paid:</b> {tax.paid} coins
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {due > 0 ? (
          <Button variant="contained" color="primary" onClick={handlePayTax}>
            Pay Tax
          </Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={handleAdvancePay}>
            Advance Pay
          </Button>
        )}
        <Button variant="outlined" onClick={() => setTab("full")}>
          Full History
        </Button>
        <Button variant="outlined" onClick={() => setTab("history")}>
          Tax History
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Switch
          checked={showChart}
          onChange={() => setShowChart((v) => !v)}
        />
        <Typography variant="body2" sx={{ display: "inline" }}>
          {showChart ? "Disable" : "Enable"} Chart
        </Typography>
        <Tooltip title="Download Chart">
          <IconButton onClick={handleDownloadChart}>
            <FileDownload />
          </IconButton>
        </Tooltip>
      </Box>
      {showChart && <TaxChart history={tax.history} />}
      {tab === "full" && <TaxFullHistory payments={tax.payments} />}
      {tab === "history" && <TaxHistory history={tax.history} />}
      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
function TaxChart({ history }) {
  // Simulate a line chart with SVG
  if (!history || !history.length)
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No tax data for chart.
      </Typography>
    );
  // Prepare data
  const max = Math.max(...history.map((h) => h.total), 100);
  const points = history.map((h, i) => [
    40 + (i * 60),
    120 - (h.total / max) * 100 * 0.4 - 10,
  ]);
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        1-Week Tax Chart
      </Typography>
      <svg width="480" height="140" style={{ background: "#263238", borderRadius: 8 }}>
        {/* Axes */}
        <line x1="40" y1="20" x2="40" y2="120" stroke="#fff" />
        <line x1="40" y1="120" x2="440" y2="120" stroke="#fff" />
        {/* Line */}
        <polyline
          fill="none"
          stroke="#43a047"
          strokeWidth="3"
          points={points.map((p) => p.join(",")).join(" ")}
          style={{ filter: "drop-shadow(0 2px 4px #0008)" }}
        />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="5" fill="#43a047" />
        ))}
        {/* Labels */}
        {history.map((h, i) => (
          <text
            key={i}
            x={40 + i * 60}
            y={130}
            fill="#fff"
            fontSize="12"
            textAnchor="middle"
          >
            {h.date.slice(5)}
          </text>
        ))}
      </svg>
    </Box>
  );
}
function TaxFullHistory({ payments }) {
  if (!payments || !payments.length)
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No payment history.
      </Typography>
    );
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Full Payment History
      </Typography>
      {payments.slice(-5).map((p, i) => (
        <Paper key={i} sx={{ p: 1, mb: 1 }}>
          <Typography>
            {p.date}: <b>{p.amount} coins</b>
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
function TaxHistory({ history }) {
  if (!history || !history.length)
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No tax history.
      </Typography>
    );
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Per-Day Tax Calculated
      </Typography>
      {history.map((h, i) => (
        <Paper key={i} sx={{ p: 1, mb: 1 }}>
          <Typography>
            {h.date}: Selling {h.selling}, Buying {h.buying}, Total {h.total}, Paid {h.paid}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

// --- LOAN DASHBOARD ---
function LoanDashboard({ user }) {
  const [tab, setTab] = useState("main");
  const [showApply, setShowApply] = useState(false);
  const loans = getLS("loans", []).filter((l) => l.bankId === user.bankId);

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Loan Dashboard
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button
          variant={tab === "main" ? "contained" : "outlined"}
          onClick={() => setTab("main")}
          sx={{ mr: 1 }}
        >
          My Loans
        </Button>
        <Button
          variant={tab === "apply" ? "contained" : "outlined"}
          onClick={() => setTab("apply")}
        >
          Apply for Loan
        </Button>
      </Box>
      {tab === "main" && <LoanList loans={loans} />}
      {tab === "apply" && (
        <LoanApplyForm user={user} onApplied={() => setTab("main")} />
      )}
    </Paper>
  );
}
function LoanList({ loans }) {
  if (!loans.length)
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No loans found.
      </Typography>
    );
  return (
    <Box>
      {loans.map((l, i) => (
        <Paper key={i} sx={{ p: 2, mb: 1 }}>
          <Typography>
            <b>{l.type}</b> ({l.amount} coins, {l.duration} week{l.duration > 1 ? "s" : ""}, {l.interest}%)
          </Typography>
          <Typography>
            Status:{" "}
            <b
              style={{
                color:
                  l.status === "Pending"
                    ? "#ffa000"
                    : l.status === "Approved"
                    ? "#43a047"
                    : "#e53935",
              }}
            >
              {l.status}
            </b>
          </Typography>
          <Typography>
            Reason: <i>{l.reason}</i>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Applied: {l.appliedAt}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
function LoanApplyForm({ user, onApplied }) {
  const [type, setType] = useState("Personal Loan");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(1);
  const [reason, setReason] = useState("");
  const [extra, setExtra] = useState({});
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Interest auto-calc
  const interest = INTEREST[type][duration - 1];

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setFile(ev.target.result);
      reader.readAsDataURL(f);
    }
  }
  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => {
      const loans = getLS("loans", []);
      loans.push({
        bankId: user.bankId,
        type,
        amount: Number(amount),
        duration,
        interest,
        status: "Pending",
        reason,
        appliedAt: new Date().toISOString().split("T")[0],
        extra: { ...extra, pic: file },
      });
      setLS("loans", loans);
      setSubmitting(false);
      onApplied();
    }, 1200);
  }

  // Type-specific fields
  let extraFields = null;
  if (type === "Home Loan" || type === "Business Loan") {
    extraFields = (
      <>
        <TextField
          label="Start Coords"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setExtra({ ...extra, start: e.target.value })}
        />
        <TextField
          label="End Coords"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setExtra({ ...extra, end: e.target.value })}
        />
        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Upload {type === "Home Loan" ? "Home" : "Business"} Picture
          <input type="file" hidden accept="image/*" onChange={handleFile} />
        </Button>
        {file && (
          <img
            src={file}
            alt="upload"
            style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 8 }}
          />
        )}
      </>
    );
  } else if (
    type === "Personal Loan" ||
    type === "Business Startup Loan" ||
    type === "Home Startup Loan"
  ) {
    extraFields = (
      <>
        <TextField
          label="Your Name"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setExtra({ ...extra, name: e.target.value })}
        />
        <TextField
          label="Job"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setExtra({ ...extra, job: e.target.value })}
        />
        <TextField
          label="Per Day Income"
          type="number"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setExtra({ ...extra, perDayIncome: e.target.value })}
        />
        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Upload {type.includes("Home") ? "Home" : "Business"} Picture
          <input type="file" hidden accept="image/*" onChange={handleFile} />
        </Button>
        {file && (
          <img
            src={file}
            alt="upload"
            style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 8 }}
          />
        )}
      </>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Apply for a Loan
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Loan Type</InputLabel>
        <Select
          value={type}
          label="Loan Type"
          onChange={(e) => setType(e.target.value)}
        >
          {Object.keys(INTEREST).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Duration (weeks)</InputLabel>
        <Select
          value={duration}
          label="Duration (weeks)"
          onChange={(e) => setDuration(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((w) => (
            <MenuItem key={w} value={w}>
              {w} week{w > 1 ? "s" : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Interest Rate (%)"
        value={interest}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{ readOnly: true }}
      />
      <TextField
        label="Why do you need this loan?"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        multiline
        minRows={2}
      />
      {extraFields}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={submitting}
        startIcon={submitting ? <LinearProgress sx={{ width: 20 }} /> : <AddCircle />}
      >
        {submitting ? "Submitting..." : "Apply"}
      </Button>
    </Box>
  );
}

// --- ACCOUNT SETTINGS ---
function AccountSettings({ user, setUser }) {
  const [edit, setEdit] = useState(false);
  const [mcName, setMcName] = useState(user.mcName);
  const [password, setPassword] = useState(user.password);

  function handleSave() {
    const users = getLS("users", []);
    const idx = users.findIndex((u) => u.bankId === user.bankId);
    if (idx !== -1) {
      users[idx].mcName = mcName;
      users[idx].password = password;
      setLS("users", users);
      setUser(users[idx]);
      setEdit(false);
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Account Settings
      </Typography>
      <Typography>
        <b>Bank Name:</b> {user.bankName}
      </Typography>
      <Typography>
        <b>Bank ID:</b> {user.bankId}
      </Typography>
      <Typography>
        <b>Minecraft Edition:</b> {user.mcEdition}
      </Typography>
      <Typography>
        <b>Balance:</b> {user.balance} coins
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Social Info
      </Typography>
      {edit ? (
        <>
          <TextField
            label="Minecraft Name"
            value={mcName}
            onChange={(e) => setMcName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSave} sx={{ mr: 1 }}>
            Save
          </Button>
          <Button variant="outlined" onClick={() => setEdit(false)}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Typography>
            <b>Minecraft Name:</b> {user.mcName}
          </Typography>
          <Button variant="outlined" onClick={() => setEdit(true)} sx={{ mt: 2 }}>
            Edit Info
          </Button>
        </>
      )}
    </Paper>
  );
}

// --- TOP PAYERS ---
function TopPayers({ type }) {
  // Simulate top 3
  const users = getLS("users", []);
  const taxes = getLS("taxes", []);
  let top = [];
  if (type === "tax") {
    top = taxes
      .map((t) => ({
        ...t,
        user: users.find((u) => u.bankId === t.bankId),
        paid: t.paid,
      }))
      .sort((a, b) => b.paid - a.paid)
      .slice(0, 3);
  } else {
    // Advance payers: simulate by total payments
    top = taxes
      .map((t) => ({
        ...t,
        user: users.find((u) => u.bankId === t.bankId),
        advance: (t.payments || []).reduce((a, p) => a + (p.amount || 0), 0),
      }))
      .sort((a, b) => b.advance - a.advance)
      .slice(0, 3);
  }
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {type === "tax" ? "Top 3 Tax Payers" : "Top 3 Advance Tax Payers"}
      </Typography>
      {top.map((t, i) => (
        <Paper key={i} sx={{ p: 2, mb: 1 }}>
          <Typography>
            <b>{t.user?.mcName || "Unknown"}</b> ({t.user?.bankName || ""})
          </Typography>
          <Typography>
            {type === "tax"
              ? `Tax Paid: ${t.paid} coins`
              : `Advance Paid: ${t.advance} coins`}
          </Typography>
        </Paper>
      ))}
    </Paper>
  );
}

// --- CONTACT US ---
function ContactUs() {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Contact Us
      </Typography>
      <Typography>
        For support, contact <b>admin@minecraftbank.com</b> or join our Discord!
      </Typography>
    </Paper>
  );
}

// --- THEME SETTINGS ---
function ThemeSettings({ darkMode, setDarkMode }) {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Theme Settings
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Switch
          checked={darkMode}
          onChange={() => setDarkMode((d) => !d)}
        />
        <Typography>{darkMode ? "Dark Mode" : "Light Mode"}</Typography>
      </Box>
    </Paper>
  );
}
