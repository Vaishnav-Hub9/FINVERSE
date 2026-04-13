import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LayoutDashboard, LineChart, Building2, TrendingUp, DollarSign, Brain, CheckCircle2, ChevronRight, Menu, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line, ResponsiveContainer } from 'recharts';
import { api } from './api';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState({ name: '', email: '', onboardingAnswers: {} });

  const [transactions, setTransactions] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([{ _id: 1, name: 'HDFC Checking', balance: 0, type: 'savings', cleared: true }])
  const [appLoading, setAppLoading] = useState(false)
  const [pins, setPins] = useState(() => {
    const saved = localStorage.getItem('finverse_pins')
    return saved ? JSON.parse(saved) : { trading: null, accounts: null }
  })

  const savePins = (newPins) => {
    setPins(newPins)
    localStorage.setItem('finverse_pins', JSON.stringify(newPins))
  }

  useEffect(() => {
    const token = localStorage.getItem('finverse_token')
    if (token) {
      // Token exists, decode it to get basic user info and go straight to dashboard
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp * 1000 > Date.now()) {
          // Token not expired, go to dashboard
          setView('dashboard')
        } else {
          // Token expired, clear it
          localStorage.removeItem('finverse_token')
        }
      } catch (e) {
        localStorage.removeItem('finverse_token')
      }
    }
  }, [])

  useEffect(() => {
    if (view === 'dashboard') {
      loadAllData()
    }
  }, [view])

  const loadAllData = async () => {
    setAppLoading(true)
    try {
      const [txRes, budgetRes, stocksRes, remindersRes] = await Promise.all([
        api.getTransactions(),
        api.getBudget(),
        api.getStocks(),
        api.getReminders()
      ])
      if (Array.isArray(txRes)) setTransactions(txRes)
      if (Array.isArray(budgetRes)) setBudgetCategories(budgetRes)
      if (Array.isArray(stocksRes)) setStocks(stocksRes)
      if (Array.isArray(remindersRes)) setReminders(remindersRes)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
    setAppLoading(false)
  }

  useEffect(() => {
    const billKeywords = ['netflix', 'spotify', 'amazon prime', 'hotstar', 'jio', 'airtel', 'electricity', 'internet', 'insurance'];
    const recurring = transactions.filter(t =>
      billKeywords.some(k => t.payee.toLowerCase().includes(k))
    );
    recurring.forEach(t => {
      setReminders(prev => {
        const alreadyExists = prev.some(r => r.title.toLowerCase() === t.payee.toLowerCase());
        if (!alreadyExists) {
          const nextDue = new Date(t.date);
          nextDue.setMonth(nextDue.getMonth() + 1);
          return [...prev, {
            _id: Date.now() + Math.random(),
            title: t.payee,
            amount: t.amount,
            dueDate: nextDue.toISOString().split('T')[0],
            category: t.category,
            recurring: 'monthly',
            autoDetected: true,
            paid: false
          }];
        }
        return prev;
      });
    });
  }, [transactions]);


  const totalIncome = transactions.filter(t => t.category === 'Income').reduce((s, t) => s + t.inflow, 0);
  const totalSpent = transactions.filter(t => t.outflow > 0 && t.category !== 'Income').reduce((s, t) => s + t.outflow, 0);
  const buffer = totalIncome - totalSpent;
  const totalRegret = transactions.filter(t => t.isRegret).reduce((s, t) => s + t.amount, 0);
  const potentialSavings = Math.round(totalRegret * 0.15);
  const regretRatio = totalSpent > 0 ? totalRegret / totalSpent : 0;
  const disciplineScore = Math.min(100, Math.max(0, Math.round((1 - regretRatio) * 100)));
  const annualRate = 0.08;
  const years = 5;
  const futureValue = Math.round(totalRegret * Math.pow(1 + annualRate, years));
  const moneyLost = futureValue - totalRegret;
  const clearedBalance = bankAccounts.filter(a => a.cleared).reduce((s, a) => s + a.balance, 0);
  const unclearedBalance = bankAccounts.filter(a => !a.cleared).reduce((s, a) => s + a.balance, 0);
  const workingBalance = clearedBalance + unclearedBalance;

  if (appLoading) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-cyan mb-3" style={{ width: '3rem', height: '3rem' }} />
        <h5 className="text-cyan">Loading your financial data...</h5>
      </div>
    </div>
  )

  return (
    <>
      {view === 'login' && <Login setView={setView} user={user} setUser={setUser} />}
      {view === 'signup' && <Signup setView={setView} />}
      {view === 'onboarding' && <Onboarding setView={setView} user={user} setUser={setUser} />}
      {view === 'dashboard' && (
        <Dashboard
          setView={setView} user={user} setUser={setUser}
          transactions={transactions} setTransactions={setTransactions}
          budgetCategories={budgetCategories} setBudgetCategories={setBudgetCategories}
          stocks={stocks} setStocks={setStocks}
          bankAccounts={bankAccounts} setBankAccounts={setBankAccounts}
          reminders={reminders} setReminders={setReminders}
          totalIncome={totalIncome} totalSpent={totalSpent} buffer={buffer}
          totalRegret={totalRegret} potentialSavings={potentialSavings}
          regretRatio={regretRatio} disciplineScore={disciplineScore}
          futureValue={futureValue} moneyLost={moneyLost}
          clearedBalance={clearedBalance} unclearedBalance={unclearedBalance} workingBalance={workingBalance}
          pins={pins} savePins={savePins}
        />
      )}
    </>
  );
}

function Login({ setView, user, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { setErr('Please enter a valid email address.'); return }
    if (!password) { setErr('Password is required.'); return }
    setErr('')
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      if (res.token) {
        localStorage.setItem('finverse_token', res.token)
        setUser({
          name: res.user.fullName,
          email: res.user.email,
          onboardingAnswers: res.user.onboardingAnswers || {}
        })
        setView('dashboard')
      } else {
        setErr(res.message || 'Login failed. Check your credentials.')
      }
    } catch (err) {
      setErr('Cannot reach server. Make sure backend is running on port 5000.')
    }
    setLoading(false)
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 p-3">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '420px' }}>
        <h2 className="text-cyan text-center fw-bold mb-1">FINVERSE</h2>
        <p className="text-center text-gray mb-4">Financial Intelligence Platform</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="email" placeholder="Email" className="form-control p-3" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mb-3 position-relative">
            <input type={showPwd ? 'text' : 'password'} placeholder="Password" className="form-control p-3" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="btn btn-icon position-absolute top-50 end-0 translate-middle-y me-2" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {err && <div className="p-3 mb-3 text-center rounded alert-danger-glass">{err}</div>}
          <button type="submit" className="btn btn-cyan w-100 rounded-pill p-3 mb-3 fw-bold" disabled={loading}>
            {loading ? <div className="spinner-border spinner-border-sm" /> : 'Initialize Session'}
          </button>
        </form>
        <div className="text-center">
          <a href="#" className="text-cyan text-decoration-none" onClick={(e) => { e.preventDefault(); setView('signup'); }}>New here? Create Account</a>
        </div>
      </div>
    </div>
  );
}

function Signup({ setView }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', agree: false });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdScore = (() => {
    let s = 0; const p = form.password;
    if (p.length > 5) s++; if (p.length > 8) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const pwdColor = pwdScore <= 2 ? '#ef4444' : pwdScore <= 4 ? '#f59e0b' : '#10b981';
  const pwdLabel = pwdScore <= 2 ? 'Weak' : pwdScore <= 4 ? 'Good' : 'Strong';

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setErr('Please enter your full name.')
    if (!form.email.includes('@')) return setErr('Please enter a valid email address.')
    if (form.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setErr('Passwords do not match.')
    if (!form.agree) return setErr('You must agree to Terms & Conditions.')
    setErr('')
    setLoading(true)
    try {
      const res = await api.signup({
        fullName: form.name,
        email: form.email,
        password: form.password
      })
      if (res.token) {
        localStorage.setItem('finverse_token', res.token)
        setView('onboarding')
      } else {
        setErr(res.message || 'Signup failed.')
      }
    } catch (err) {
      setErr('Cannot reach server. Make sure backend is running on port 5000.')
    }
    setLoading(false)
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3 py-5">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '460px' }}>
        <h3 className="text-center fw-bold mb-4">Create Account</h3>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3 p-3" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="form-control mb-3 p-3" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="form-control mb-2 p-3" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {form.password && (
            <div className="mb-3">
              <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                <div className="progress-bar" style={{ width: `${(pwdScore / 5) * 100}%`, backgroundColor: pwdColor }} />
              </div>
              <small style={{ color: pwdColor }}>{pwdLabel}</small>
            </div>
          )}
          <input className="form-control mb-3 p-3" type="password" placeholder="Confirm Password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
          <div className="form-check mb-4">
            <input className="form-check-input" type="checkbox" id="agree" checked={form.agree} onChange={e => setForm({ ...form, agree: e.target.checked })} />
            <label className="form-check-label text-gray" htmlFor="agree">I agree to Terms & Conditions</label>
          </div>
          {err && <div className="p-3 mb-3 text-center rounded alert-danger-glass">{err}</div>}
          <button type="submit" className="btn btn-cyan w-100 rounded-pill p-3 mb-3 fw-bold" disabled={loading}>
            {loading ? <div className="spinner-border spinner-border-sm" /> : 'Create Account'}
          </button>
        </form>
        <div className="text-center"><a href="#" className="text-cyan text-decoration-none" onClick={e => { e.preventDefault(); setView('login') }}>Already have account? Login</a></div>
      </div>
    </div>
  );
}

function Onboarding({ setView, user, setUser }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selections, setSelections] = useState([]);

  const steps = [
    { title: 'What is your primary financial goal?', type: 'single', options: ['Get out of debt', 'Make the most of my money', 'Create more breathing room', 'Stop impulsive spending'] },
    { title: 'Who are you managing money for?', type: 'multi', options: ['Myself', 'My partner', 'Kids', 'Teens', 'Other adults', 'Pets'] },
    { title: 'Do you currently have any debt?', type: 'multi', options: ['Credit card', 'Medical debt', 'Auto loans', 'Student loans', 'Personal loans', 'Buy now pay later', 'No debt'] },
    { title: 'What are your regular monthly expenses?', type: 'multi', options: ['Groceries', 'TV, phone or internet', 'Personal care', 'Clothing', 'Rent or mortgage', 'Self storage', 'Fuel or transport'] },
    { title: 'Which subscriptions do you pay for?', type: 'multi', options: ['Music streaming', 'TV streaming', 'Fitness or gym', 'Cloud storage', 'Gaming', 'News or magazines', 'Other subscriptions'] },
    { title: 'What are your financial goals?', type: 'multi', options: ['Dream vacation', 'Emergency fund', 'New car', 'New home', 'Retirement', 'Investments', 'Wedding', 'New baby'] },
    { title: 'What guilt-free spending matters to you?', type: 'multi', options: ['Dining out', 'Travel and holidays', 'Entertainment', 'Hobbies', 'Gifts and charity', 'Home decor', 'Fitness'] }
  ];

  const getInsight = () => {
    if (!selections.length) return "Awaiting your input...";
    if (step === 0) {
      if (selections.includes('Get out of debt')) return "Debt Elimination Mode: System will prioritize debt payoff over discretionary spending.";
      if (selections.includes('Make the most of my money')) return "Optimization Mode: System will track opportunity costs on every rupee.";
      if (selections.includes('Create more breathing room')) return "Buffer Mode: System will protect your Safe-to-Spend metric aggressively.";
      return "Discipline Mode: Every unplanned transaction will be flagged automatically.";
    }
    if (step === 1) {
      if (selections.includes('Kids') || selections.includes('Teens')) return "Family Budget Mode: Medical and education limits calibrated for dependents.";
      if (selections.includes('My partner')) return "Shared Finance Mode: Dual-income tracking enabled.";
      return "Individual Mode: Limits calibrated for single person.";
    }
    if (step === 2) {
      if (selections.includes('Credit card')) return "High-Interest Alert: Discipline Engine will flag any non-essential spend while credit card debt exists.";
      if (selections.includes('Student loans')) return "Long-Term Liability Detected: Loan repayment factored into your savings velocity.";
      if (selections.includes('No debt')) return "Clean Slate: Full income available for goals and investments.";
      return "Debt Portfolio Registered: System will recommend payoff priority order.";
    }
    if (step === 3) return "Baseline Expenditure Map: Establishing your non-negotiable monthly outflows.";
    if (step === 4) return "Fixed Liability Scan: Calculating total recurring subscription drain per month.";
    if (step === 5) {
      if (selections.includes('Emergency fund')) return "Priority Flag: Emergency fund will be protected from reallocation.";
      if (selections.includes('Investments') || selections.includes('Retirement')) return "Wealth Mode: Opportunity Cost Engine linked to your goal timeline.";
      return "Goal Timeline: System will calculate monthly savings velocity needed.";
    }
    if (step === 6) return "Guilt-Free Zone Registered: These categories will never be flagged as anomalies by the system.";
    return "";
  };

  const toggleOption = (opt) => {
    if (steps[step].type === 'single') setSelections([opt]);
    else setSelections(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const nextStep = async (skip = false) => {
    const newAnswers = { ...answers, [step]: skip ? ['SYS_DEFAULT'] : selections }
    setAnswers(newAnswers)

    if (step === 6) {
      // Seed default budget categories for new user
      const defaultCategories = [
        { name: 'Utilities', group: 'Bills', assigned: 3000 },
        { name: 'TV & Internet', group: 'Bills', assigned: 1500 },
        { name: 'Insurance', group: 'Bills', assigned: 2000 },
        { name: 'Student Loans', group: 'Bills', assigned: 5000 },
        { name: 'TV Streaming', group: 'Bills', assigned: 649 },
        { name: 'Transportation', group: 'Needs', assigned: 2000 },
        { name: 'Groceries', group: 'Needs', assigned: 6000 },
        { name: 'Medical', group: 'Needs', assigned: 1500 },
        { name: 'Entertainment', group: 'Wants', assigned: 2000 },
        { name: 'Dining Out', group: 'Wants', assigned: 3000 },
        { name: 'Shopping', group: 'Wants', assigned: 2500 }
      ]
      try {
        for (const cat of defaultCategories) {
          await api.addCategory(cat)
        }
      } catch (err) {
        console.error('Failed to seed categories:', err)
      }

      // Map numeric keys to named onboarding fields
      const mapped = {
        primaryGoal: newAnswers[0]?.[0] || '',
        household: newAnswers[1] || [],
        debts: newAnswers[2] || [],
        regularExpenses: newAnswers[3] || [],
        subscriptions: newAnswers[4] || [],
        financialGoals: newAnswers[5] || [],
        guiltFreeSpending: newAnswers[6] || []
      }
      setUser({ ...user, onboardingAnswers: mapped })
      setView('dashboard')
    } else {
      setStep(step + 1)
      setSelections([])
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="glass-card w-100 d-flex flex-column" style={{ maxWidth: '900px', minHeight: '600px' }}>
        <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div className="progress-bar" style={{ width: `${((step + 1) / 7) * 100}%`, backgroundColor: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
        </div>
        <div className="p-4 flex-grow-1 d-flex flex-column">
          <div className="text-gray small text-center mb-2">Step {step + 1} of 7</div>
          <h3 className="text-center fw-bold mb-4">{steps[step].title}</h3>

          <div className="row g-3 mb-auto">
            {steps[step].options.map(opt => (
              <div key={opt} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`glass-card p-3 text-center onboarding-card ${selections.includes(opt) ? 'selected' : ''}`}
                  onClick={() => toggleOption(opt)}
                >
                  {opt}
                </div>
              </div>
            ))}
          </div>

          <div dangerouslySetInnerHTML={{ __html: `<!-- User Interaction Box -->` }} />
          <div className="mt-4 p-3 rounded" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="d-flex align-items-start gap-2">
              <Brain className="text-cyan mt-1" size={20} />
              <p className="mb-0 text-cyan">{getInsight()}</p>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn text-gray px-0" onClick={() => nextStep(true)}>Skip this step</button>
            <button className="btn btn-cyan rounded-pill px-4 fw-bold" onClick={() => nextStep()} disabled={!selections.length}>Next <ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({
  user, view, setView, transactions, setTransactions, budgetCategories, setBudgetCategories,
  stocks, setStocks, bankAccounts, setBankAccounts, reminders, setReminders, totalIncome, totalSpent, buffer,
  totalRegret, potentialSavings, regretRatio, disciplineScore, futureValue, moneyLost, clearedBalance, unclearedBalance, workingBalance,
  pins, savePins
}) {
  const [tab, setTab] = useState('plan');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unlockedSections, setUnlockedSections] = useState({ trading: false, accounts: false })
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinTarget, setPinTarget] = useState(null)

  const handleTabChange = (newTab) => {
    if (newTab !== 'trading') setUnlockedSections(prev => ({ ...prev, trading: false }))
    if (newTab !== 'accounts') setUnlockedSections(prev => ({ ...prev, accounts: false }))
    setTab(newTab)
  }

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`sidebar p-3 glass-card ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="text-center mb-4 mt-2 px-2">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-2"
            style={{ width: 56, height: 56, backgroundColor: '#38bdf8', color: '#000', flexShrink: 0 }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="fw-bold text-white text-truncate" style={{ maxWidth: '100%' }}>{user.name || 'User'}</div>
          <div className="text-gray text-truncate small" style={{ maxWidth: '100%', fontSize: '0.72rem' }} title={user.email}>
            {user.email || 'user@example.com'}
          </div>
        </div>

        <div className="nav flex-column flex-grow-1 gap-1">
          <a href="#" className={`nav-link ${tab === 'plan' ? 'active' : ''}`} onClick={() => handleTabChange('plan')}><LayoutDashboard size={20} /> Plan</a>
          <a href="#" className={`nav-link ${tab === 'reflect' ? 'active' : ''}`} onClick={() => handleTabChange('reflect')}><LineChart size={20} /> Reflect</a>
          <a href="#" className={`nav-link ${tab === 'accounts' ? 'active' : ''}`} onClick={() => handleTabChange('accounts')}><Building2 size={20} /> All Accounts</a>
          <a href="#" className={`nav-link ${tab === 'trading' ? 'active' : ''}`} onClick={() => handleTabChange('trading')}><TrendingUp size={20} /> Trading Engine</a>
          <a href="#" className={`nav-link ${tab === 'settings' ? 'active' : ''}`} onClick={() => handleTabChange('settings')}>⚙ Settings</a>
        </div>

        <div className="mt-auto">
          <div className="badge bg-transparent border border-info text-info p-2 w-100 rounded text-start d-flex align-items-center gap-2">
            <Brain size={16} /> Mode: {user.onboardingAnswers?.[0]?.includes('Stop impulsive spending') ? 'Discipline Engine' : 'Optimization Mode'}
          </div>
          <button
            className="btn btn-outline-danger rounded-pill w-100 mt-2 btn-sm"
            onClick={() => {
              localStorage.removeItem('finverse_token')
              setView('login')
              setUser({ name: '', email: '', onboardingAnswers: {} })
              setTransactions([])
              setBudgetCategories([])
              setStocks([])
              setReminders([])
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="d-lg-none d-flex mb-3">
          <button className="btn btn-icon" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
        </div>
        {tab === 'plan' && (
          <PlanTab
            transactions={transactions} setTransactions={setTransactions}
            budgetCategories={budgetCategories} setBudgetCategories={setBudgetCategories}
            buffer={buffer} totalRegret={totalRegret} regretRatio={regretRatio} potentialSavings={potentialSavings}
            bankAccounts={bankAccounts} reminders={reminders} setReminders={setReminders}
          />
        )}
        {tab === 'reflect' && (
          <ReflectTab
            transactions={transactions} disciplineScore={disciplineScore} totalSpent={totalSpent}
            totalRegret={totalRegret} buffer={buffer} user={user} totalIncome={totalIncome} budgetCategories={budgetCategories}
          />
        )}
        {tab === 'accounts' && (
          unlockedSections.accounts
            ? <AccountsTab
              transactions={transactions} setTransactions={setTransactions}
              bankAccounts={bankAccounts} setBankAccounts={setBankAccounts}
              clearedBalance={clearedBalance} unclearedBalance={unclearedBalance} workingBalance={workingBalance}
            />
            : <PinLockScreen
              section="accounts"
              pins={pins}
              onUnlock={(s) => setUnlockedSections(prev => ({ ...prev, [s]: true }))}
              onSetPin={(s, pin) => savePins({ ...pins, [s]: pin })}
            />
        )}
        {tab === 'trading' && (
          unlockedSections.trading
            ? <TradingTab
              stocks={stocks} setStocks={setStocks} totalRegret={totalRegret} futureValue={futureValue}
              moneyLost={moneyLost} transactions={transactions}
            />
            : <PinLockScreen
              section="trading"
              pins={pins}
              onUnlock={(s) => setUnlockedSections(prev => ({ ...prev, [s]: true }))}
              onSetPin={(s, pin) => savePins({ ...pins, [s]: pin })}
            />
        )}
        {tab === 'settings' && (
          <SettingsTab pins={pins} savePins={savePins} user={user} />
        )}
      </div>

    </div>
  );
}

function PlanTab({ transactions, setTransactions, budgetCategories, setBudgetCategories, buffer, totalRegret, regretRatio, potentialSavings, bankAccounts, reminders, setReminders }) {
  const handleAssignChange = (id, val) => {
    setBudgetCategories(prev => prev.map(c => c._id === id ? { ...c, assigned: Number(val) || 0 } : c));
  };
  const handleAssignBlur = async (id, val) => {
    try {
      await api.updateCategory(id, { assigned: Number(val) || 0 })
    } catch (err) { console.error('Failed to update category', err) }
  };
  const [showAdd, setShowAdd] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', group: 'Bills', assigned: '' });
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminder, setNewReminder] = useState({ title: '', amount: '', dueDate: '', category: 'Bills', recurring: 'None' });

  const getFilteredCategories = (group) => {
    return budgetCategories.filter(c => {
      if (c.group !== group) return false;
      const act = transactions.filter(t => t.category === c.name && t.outflow > 0).reduce((s, t) => s + t.outflow, 0)
        + (transactions.filter(t => t.category === group && t.outflow > 0).reduce((s, t) => s + t.outflow, 0) / budgetCategories.filter(bc => bc.group === group).length);
      const available = c.assigned - act;
      if (budgetFilter === 'underfunded') return available < 0;
      if (budgetFilter === 'overfunded') return available > c.assigned * 0.5;
      return true;
    });
  };

  const getUnderfundedCount = () => {
    return budgetCategories.filter(c => {
      const act = transactions.filter(t => t.category === c.name && t.outflow > 0).reduce((s, t) => s + t.outflow, 0)
        + (transactions.filter(t => t.category === c.group && t.outflow > 0).reduce((s, t) => s + t.outflow, 0) / budgetCategories.filter(bc => bc.group === c.group).length);
      return c.assigned - act < 0;
    }).length;
  };

  const getGroupStats = (group) => {
    const cats = budgetCategories.filter(c => c.group === group);
    const sumAssigned = cats.reduce((s, c) => s + c.assigned, 0);
    const sumActivity = cats.reduce((s, c) => {
      const t = transactions.filter(tr => tr.category === group && tr.outflow > 0).reduce((ts, tr) => ts + tr.outflow, 0)
        + transactions.filter(tr => tr.category === c.name && tr.outflow > 0).reduce((ts, tr) => ts + tr.outflow, 0);
      return s + t;
    }, 0);
    return { sumAssigned, sumActivity, sumAvailable: sumAssigned - sumActivity };
  };

  const groups = ['Bills', 'Needs', 'Wants'];
  const lateNightRegrets = transactions.filter(t => t.isRegret && parseInt(t.time) >= 22);
  const lateNightTotal = lateNightRegrets.reduce((s, t) => s + t.amount, 0);

  const unpaidTotal = reminders.filter(r => !r.paid).reduce((s, r) => s + r.amount, 0);
  const overdue = reminders.filter(r => !r.paid && new Date(r.dueDate) < new Date());

  return (
    <div className="row h-100">
      <div className="col-12 col-lg-8 d-flex flex-column mb-4 mb-lg-0">

        {/* Reminders Section */}
        <div className="mb-4 w-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0 fw-bold">📅 Upcoming Bills & Reminders</h5>
            <button className="btn btn-sm btn-outline-info rounded-pill" onClick={() => setShowAddReminder(true)}>＋ Add Reminder</button>
          </div>
          <div className="d-flex overflow-auto gap-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {reminders.map(r => {
              const daysUntil = Math.ceil((new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const badgeColor = daysUntil <= 3 ? 'bg-danger' : daysUntil <= 7 ? 'bg-warning' : 'bg-success';
              const badgeText = daysUntil <= 3 ? 'Due Soon!' : daysUntil <= 7 ? 'This Week' : 'Upcoming';
              return (
                <div key={r._id} className="glass-card p-3 position-relative flex-shrink-0" style={{ width: 250, opacity: r.paid ? 0.5 : 1 }}>
                  {r.paid && <div className="position-absolute top-50 start-0 w-100 border-top border-success border-2 z-1"></div>}
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold text-truncate w-75">{r.title}</span>
                    <span className={`badge ${badgeColor}`}>{badgeText}</span>
                  </div>
                  <div className="text-danger fw-bold mb-1">₹{r.amount}</div>
                  <div className="small text-gray mb-2 d-flex justify-content-between">
                    <span>Due: {r.dueDate}</span>
                    {daysUntil > 0 && <span>({daysUntil} days)</span>}
                  </div>
                  {r.autoDetected && <small className="badge bg-cyan text-dark mb-2 d-inline-block">Auto-detected</small>}
                  <div className="d-flex gap-2">
                    {!r.paid && <button className="btn btn-sm btn-outline-success border-0 p-0 text-decoration-underline w-50" onClick={() => { const newRema = [...reminders]; const idx = newRema.findIndex(x => x._id === r._id); newRema[idx].paid = true; const item = newRema.splice(idx, 1)[0]; newRema.push(item); setReminders(newRema); }}>Mark Paid</button>}
                    <button className="btn btn-sm btn-outline-danger border-0 p-0 text-decoration-underline w-50" onClick={() => setReminders(prev => prev.filter(x => x._id !== r._id))}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="small text-gray mt-1">
            You have ₹{unpaidTotal} in upcoming bills. {overdue.length > 0 ? overdue.length + ' bills are overdue!' : 'No overdue bills.'}
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center align-items-start gap-3 mb-4 glass-card p-3">
          <h4 className="mb-0 fw-bold">April 2026</h4>
          <div className="text-center w-100 w-md-auto text-md-center text-start">
            <span className="text-gray small text-uppercase">Safe to Spend</span>
            <h3 className={`mb-0 fw-bold ${buffer >= 0 ? 'text-success' : 'text-danger'}`}>₹{buffer}</h3>
          </div>
          <button className="btn btn-cyan rounded-pill w-100 w-md-auto text-nowrap" onClick={() => setShowAdd(true)}>＋ Add Transaction</button>
        </div>

        <div className="glass-card flex-grow-1 overflow-auto">
          <div className="p-3 border-bottom border-secondary">
            <div className="btn-group mb-0 flex-wrap" role="group">
              <button
                className={`btn btn-sm rounded-pill me-2 mb-2 mb-md-0 ${budgetFilter === 'all' ? 'btn-cyan' : 'btn-outline-secondary text-gray'}`}
                onClick={() => setBudgetFilter('all')}
              >All</button>
              <button
                className={`btn btn-sm rounded-pill me-2 mb-2 mb-md-0 ${budgetFilter === 'underfunded' ? 'btn-danger' : 'btn-outline-secondary text-gray'}`}
                onClick={() => setBudgetFilter('underfunded')}
              >
                Underfunded {budgetFilter !== 'all' && <span className="badge bg-dark ms-1">{getUnderfundedCount()}</span>}
              </button>
              <button
                className={`btn btn-sm rounded-pill mb-2 mb-md-0 ${budgetFilter === 'overfunded' ? 'btn-success' : 'btn-outline-secondary text-gray'}`}
                onClick={() => setBudgetFilter('overfunded')}
              >Overfunded</button>
            </div>
          </div>
          <table className="table">
            <thead><tr><th width="30"></th><th>CATEGORY</th><th className="text-end d-none d-lg-table-cell">ASSIGNED</th><th className="text-end d-none d-lg-table-cell">ACTIVITY</th><th className="text-end">AVAILABLE</th></tr></thead>
            <tbody>
              {groups.map(g => {
                const filteredCats = getFilteredCategories(g);
                const stats = getGroupStats(g);
                return (
                  <React.Fragment key={g}>
                    <tr className="group-header">
                      <td><ChevronRight size={16} /></td>
                      <td>{g.toUpperCase()}</td>
                      <td className="text-end d-none d-lg-table-cell">₹{stats.sumAssigned}</td>
                      <td className="text-end d-none d-lg-table-cell">₹{Math.round(stats.sumActivity)}</td>
                      <td className={`text-end fw-bold ${stats.sumAvailable > 0 ? 'text-success' : stats.sumAvailable < 0 ? 'text-danger' : 'text-gray'}`}>₹{Math.round(stats.sumAvailable)}</td>
                    </tr>
                    {filteredCats.length === 0 && budgetFilter !== 'all' && (
                      <tr><td colSpan={5} className="text-center text-gray py-4">No {budgetFilter} categories found.</td></tr>
                    )}
                    {filteredCats.map(c => {
                      const activity = transactions.filter(t => (t.category === c.name || t.category === g) && t.memo?.includes(c.name)).reduce((s, t) => s + t.outflow, 0)
                        + (g === 'Bills' && c.name === 'TV Streaming' ? transactions.find(t => t.payee === 'Netflix')?.outflow || 0 : 0);
                      // Rough logic for prototype to match realistic numbers based on sample data if categories map loosely.
                      // For a real app, transactions would have exact sub-category IDs.
                      const act = transactions.filter(t => t.category === g).reduce((s, t) => s + (t.amount / budgetCategories.filter(bc => bc.group === g).length), 0); // Mock distribution for visual fill
                      const available = c.assigned - act;
                      return (
                        <tr key={c._id}>
                          <td></td>
                          <td>{c.name}</td>
                          <td className="text-end d-none d-lg-table-cell"><input className="inline-input text-end w-100" type="number" value={c.assigned} onChange={(e) => handleAssignChange(c._id, e.target.value)} onBlur={(e) => handleAssignBlur(c._id, e.target.value)} /></td>
                          <td className="text-end text-gray d-none d-lg-table-cell">₹{Math.round(act)}</td>
                          <td className={`text-end badge-col`}><span className={`badge rounded-pill ${available > 0 ? 'bg-success' : available < 0 ? 'bg-danger' : 'bg-secondary'}`}>₹{Math.round(available)}</span></td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="p-3">
            <button className="btn btn-sm btn-outline-secondary text-gray rounded-pill border-0" onClick={() => setShowAddCategory(true)}><DollarSign size={14} /> Add Category</button>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="glass-card h-100 p-4 d-flex flex-column">
          <h5 className="mb-0 d-flex align-items-center gap-2"><Brain className="text-purple" /> Behavioral Regrets</h5>
          <p className="text-gray small mb-4">Transactions you flagged as impulsive</p>

          <div className="flex-grow-1 overflow-auto mb-4">
            {transactions.filter(t => t.isRegret).length === 0 ? (
              <div className="text-success p-3 text-center border rounded border-success border-opacity-25" style={{ background: 'rgba(16,185,129,0.1)' }}>No regrets logged. Keep it up.</div>
            ) : transactions.filter(t => t.isRegret).map(t => (
              <div key={t._id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <div>
                  <div className="fw-bold">{t.payee}</div>
                  <div className="small text-gray">{t.date} {t.time} • <span className="badge bg-dark border">{t.category}</span></div>
                </div>
                <div className="text-end">
                  <div className="text-danger fw-bold">−₹{t.amount}</div>
                  <button className="btn btn-sm text-gray small py-0 px-1 border-0 text-decoration-underline" onClick={async () => {
                    await api.updateTransaction(t._id, { isRegret: false })
                    setTransactions(prev => prev.map(tr => tr._id === t._id ? { ...tr, isRegret: false } : tr))
                  }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded alert-danger-glass border border-danger">
            <h6 className="fw-bold text-danger mb-2">System Analysis</h6>
            <div className="small text-white opacity-75">
              <div className="mb-1">• Total impulse spend: <span className="fw-bold">₹{totalRegret}</span></div>
              <div className="mb-1">• Regret ratio: {Math.round(regretRatio * 100)}% of your total spending</div>
              <div className="mb-2">• Potential monthly recovery: <span className="text-success fw-bold">₹{potentialSavings}</span></div>
              <div className="p-2 bg-dark bg-opacity-25 rounded border border-danger border-opacity-25 mt-2">
                Recommendation: {
                  regretRatio > 0.3 ? 'Impulse spending exceeds 30% of outflows. Consider a 24-hour rule before purchases above ₹500.' :
                    regretRatio > 0.1 ? `Impulse spending is moderate. Setting category limits could recover ₹${potentialSavings} monthly.` :
                      'Impulse spending is under control. Maintain current discipline.'
                }
              </div>
              {lateNightRegrets.length > 0 && (
                <div className="mt-2 text-warning">
                  <ClockIcon /> {lateNightRegrets.length} of your regrets happened after 10 PM, totalling ₹{lateNightTotal}. A late-night spending lock could prevent this.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showAdd && <AddTransactionModal close={() => setShowAdd(false)} addTransaction={(t) => setTransactions(prev => [...prev, t])} bankAccounts={bankAccounts} budgetCategories={budgetCategories} />}

      {showAddCategory && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card">
              <div className="modal-header border-bottom border-secondary border-opacity-50">
                <h5 className="modal-title fw-bold">Add Budget Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddCategory(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input className="form-control p-2" placeholder="e.g. Gym Membership" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Group</label>
                  <select className="form-select p-2" value={newCategory.group} onChange={e => setNewCategory({ ...newCategory, group: e.target.value })}>
                    <option>Bills</option>
                    <option>Needs</option>
                    <option>Wants</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Monthly Budget (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-white">₹</span>
                    <input type="number" className="form-control p-2" placeholder="0" value={newCategory.assigned} onChange={e => setNewCategory({ ...newCategory, assigned: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-50">
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => setShowAddCategory(false)}>Cancel</button>
                <button className="btn btn-cyan rounded-pill fw-bold px-4" onClick={async () => {
                  if (!newCategory.name.trim() || !newCategory.assigned) return
                  try {
                    const saved = await api.addCategory({
                      name: newCategory.name.trim(),
                      group: newCategory.group,
                      assigned: Number(newCategory.assigned)
                    })
                    if (saved._id) {
                      setBudgetCategories(prev => [...prev, saved])
                      setNewCategory({ name: '', group: 'Bills', assigned: '' })
                      setShowAddCategory(false)
                    }
                  } catch (err) {
                    console.error('Failed to add category:', err)
                  }
                }}>Add Category</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddReminder && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card">
              <div className="modal-header border-bottom border-secondary border-opacity-50">
                <h5 className="modal-title fw-bold">Add Reminder</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddReminder(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control p-2" placeholder="e.g. Rent" value={newReminder.title} onChange={e => setNewReminder({ ...newReminder, title: e.target.value })} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Amount</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-white">₹</span>
                      <input type="number" className="form-control p-2" placeholder="0" value={newReminder.amount} onChange={e => setNewReminder({ ...newReminder, amount: e.target.value })} />
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control p-2" value={newReminder.dueDate} onChange={e => setNewReminder({ ...newReminder, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Category</label>
                    <select className="form-select p-2" value={newReminder.category} onChange={e => setNewReminder({ ...newReminder, category: e.target.value })}>
                      <option>Bills</option><option>Needs</option><option>Wants</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Recurring</label>
                    <select className="form-select p-2" value={newReminder.recurring} onChange={e => setNewReminder({ ...newReminder, recurring: e.target.value })}>
                      <option>None</option><option>Monthly</option><option>Yearly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-50">
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => setShowAddReminder(false)}>Cancel</button>
                <button className="btn btn-cyan rounded-pill fw-bold px-4" onClick={() => {
                  if (!newReminder.title.trim() || !newReminder.amount || !newReminder.dueDate) return;
                  setReminders(prev => [...prev, {
                    id: Date.now(),
                    ...newReminder,
                    amount: Number(newReminder.amount),
                    autoDetected: false, paid: false
                  }]);
                  setNewReminder({ title: '', amount: '', dueDate: '', category: 'Bills', recurring: 'None' });
                  setShowAddReminder(false);
                }}>Add Reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReflectTab({ transactions, disciplineScore, totalSpent, totalRegret, buffer, user, totalIncome, budgetCategories }) {
  const [chartWidth, setChartWidth] = useState(500);
  const containerRef = React.useRef(null);
  useEffect(() => {
    const handleResize = () => { if (containerRef.current) setChartWidth(containerRef.current.offsetWidth); };
    setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGroupForCategory = (catName) => {
    const bc = budgetCategories?.find(c => c.name === catName);
    return bc ? bc.group : (['Bills', 'Needs', 'Wants'].includes(catName) ? catName : 'Wants');
  };

  const pieData = ['Bills', 'Needs', 'Wants'].map(group => ({
    name: group,
    value: transactions
      .filter(t => getGroupForCategory(t.category) === group && t.outflow > 0)
      .reduce((s, t) => s + t.outflow, 0)
  })).filter(d => d.value > 0);
  const COLORS = ['#38bdf8', '#10b981', '#a855f7'];

  const barData = ['Bills', 'Needs', 'Wants'].map(group => ({
    category: group,
    normal: transactions.filter(t => getGroupForCategory(t.category) === group && !t.isRegret).reduce((s, t) => s + t.outflow, 0),
    regret: transactions.filter(t => getGroupForCategory(t.category) === group && t.isRegret).reduce((s, t) => s + t.outflow, 0)
  }));

  const catCounts = transactions.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
  const mostFrequent = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a])[0];
  const maxOut = Math.max(...transactions.map(t => t.outflow || 0), 0);

  const monthlyData = (() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({ month: d.toLocaleString('default', { month: 'short' }), spent: 0, regret: 0 });
    }
    transactions.forEach(t => {
      if (t.outflow > 0) {
        const monthStr = new Date(t.date).toLocaleString('default', { month: 'short' });
        const target = data.find(m => m.month === monthStr);
        if (target) {
          target.spent += t.outflow;
          if (t.isRegret) target.regret += t.outflow;
        }
      }
    });
    return data;
  })();

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) : 0;
  const targetSavingsRate = 20;
  const velocityGap = targetSavingsRate - savingsRate;

  const lateNightCount = transactions.filter(t => parseInt(t.time) >= 22 && t.outflow > 0).length;
  const lateNightAmount = transactions.filter(t => parseInt(t.time) >= 22 && t.outflow > 0).reduce((s, t) => s + t.outflow, 0);
  const weekendTx = transactions.filter(t => [0, 6].includes(new Date(t.date).getDay()) && t.outflow > 0);
  const weekendAmount = weekendTx.reduce((s, t) => s + t.outflow, 0);
  const dateGroups = transactions.filter(t => t.outflow > 0).reduce((acc, t) => { acc[t.date] = (acc[t.date] || 0) + t.outflow; return acc; }, {});
  const mostExpDate = Object.keys(dateGroups).sort((a, b) => dateGroups[b] - dateGroups[a])[0] || 'N/A';

  return (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-4 text-center h-100">
            <h6 className="text-gray text-uppercase small">Discipline Score</h6>
            <h1 className="fw-bold my-2" style={{ color: disciplineScore > 75 ? '#10b981' : disciplineScore > 50 ? '#f59e0b' : '#ef4444', textShadow: `0 0 15px ${disciplineScore > 75 ? '#10b981' : '#ef4444'}` }}>{disciplineScore}/100</h1>
            <small className="text-gray" style={{ fontSize: '0.7rem' }}>Based on regret ratio of your total spending</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Total Spent</h6><h2 className="fw-bold my-2">₹{totalSpent}</h2></div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Total Regret</h6><h2 className="fw-bold my-2 text-danger">₹{totalRegret}</h2></div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Safe Buffer</h6><h2 className={`fw-bold my-2 ${buffer >= 0 ? 'text-success' : 'text-danger'}`}>₹{buffer}</h2></div>
        </div>
      </div>

      <div ref={containerRef} className="row g-4 mb-4">
        <div className="col-12 col-md-7">
          <div className="glass-card p-4 h-100">
            <h5 className="mb-4">Spending by Category</h5>
            <div style={{ height: 300 }}>
              {pieData.length === 0 ? (
                <div className="text-center text-gray py-5 h-100 d-flex flex-column justify-content-center">
                  <p>No spending data yet. Add transactions to see your breakdown.</p>
                </div>
              ) : chartWidth > 0 && <PieChart width={chartWidth * (7 / 12) > 300 ? chartWidth * (7 / 12) : chartWidth} height={300}>
                <Pie data={pieData} cx={(chartWidth * (7 / 12) > 300 ? chartWidth * (7 / 12) : chartWidth) / 2} cy={140} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => `₹${val}`} contentStyle={{ background: '#1e1b4b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
              </PieChart>}
            </div>
          </div>
        </div>
        <div className="col-12 col-md-5">
          <div className="glass-card p-4 h-100 d-flex flex-column gap-3">
            <h5 className="mb-2">Fast Facts</h5>
            <div className="p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
              <span className="text-gray">Average daily spending</span><span className="fw-bold">₹{Math.round(totalSpent / 30)}</span>
            </div>
            <div className="p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
              <span className="text-gray">Most frequent category</span><span className="fw-bold">{mostFrequent}</span>
            </div>
            <div className="p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
              <span className="text-gray">Largest single outflow</span><span className="fw-bold text-danger">₹{maxOut}</span>
            </div>
            <div className="p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
              <span className="text-gray">Total transactions</span><span className="fw-bold">{transactions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-8">
          <div className="glass-card p-4">
            <h5 className="mb-4">Regret Timeline (Normal vs Regret)</h5>
            {chartWidth > 0 && <BarChart width={chartWidth * (8 / 12) > 300 ? chartWidth * (8 / 12) : chartWidth - 30} height={250} data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="category" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none' }} />
              <Legend />
              <Bar dataKey="normal" name="Intentional Spend" stackId="a" fill="#38bdf8" />
              <Bar dataKey="regret" name="Regret Spend" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>}
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="glass-card p-4 h-100 border border-info border-opacity-50">
            <h5 className="mb-3 d-flex align-items-center gap-2"><Brain className="text-info" /> Onboarding Insights</h5>
            {user.onboardingAnswers?.['2']?.includes('Credit card') && <div className="badge bg-danger p-2 mb-2 w-100 text-wrap text-start">⚠ Credit Card Debt Active — avoid discretionary spending</div>}
            {user.onboardingAnswers?.['5']?.includes('Emergency fund') && <div className="badge bg-info p-2 mb-2 w-100 text-wrap text-start text-dark">Emergency Fund Goal Active — assign ₹{Math.round(totalIncome * 0.2)} monthly</div>}
            {user.onboardingAnswers?.['6']?.includes('Dining out') && <div className="badge bg-success p-2 mb-2 w-100 text-wrap text-start">Dining Out is your guilt-free zone — not flagged as regret</div>}
            {(!user.onboardingAnswers?.['2']?.includes('Credit card') && !user.onboardingAnswers?.['5']?.includes('Emergency fund') && !user.onboardingAnswers?.['6']?.includes('Dining out')) && (
              <div className="text-gray small text-center p-3 border border-secondary border-opacity-25 rounded bg-dark bg-opacity-25">
                No specific behavioral constraints detected from your onboarding profile.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="glass-card p-4 h-100">
            <h5 className="mb-4">6-Month Spending Trend</h5>
            {monthlyData.length === 0 ? (
              <div className="text-center text-gray py-5 h-100 d-flex flex-column justify-content-center">
                <p>No transaction history for the 6-month trend.</p>
              </div>
            ) : chartWidth > 0 && (
              <RechartsLineChart width={chartWidth * (8 / 12) > 300 ? chartWidth * (8 / 12) : chartWidth - 30} height={300} data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip contentStyle={{ background: '#1e1b4b', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="spent" name="Total Spent" stroke="#38bdf8" strokeWidth={2} />
                <Line type="monotone" dataKey="regret" name="Regret" stroke="#ef4444" strokeWidth={2} />
              </RechartsLineChart>
            )}
          </div>
        </div>
        <div className="col-12 col-lg-4 d-flex flex-column gap-4">
          <div className={`glass-card p-4 h-100 border ${savingsRate >= 20 ? 'border-success' : 'border-warning'} border-opacity-50`}>
            <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: savingsRate >= 20 ? '#10b981' : '#f59e0b' }}><TrendingUp /> Savings Velocity</h5>
            <h2 className="fw-bold mb-1">{savingsRate}%</h2>
            <p className="small text-gray mb-3">Current vs 20% Target</p>
            {savingsRate >= 20 ? (
              <div className="alert-success-glass p-3 rounded small">On Track. You are saving {savingsRate}% of income.</div>
            ) : (
              <div className="alert-warning-glass p-3 rounded small">You need to save ₹{Math.round(totalIncome * (velocityGap / 100))} more per month to hit the 20% target.</div>
            )}
          </div>

          <div className="glass-card p-4 h-100">
            <h5 className="mb-3 d-flex align-items-center gap-2 text-purple"><Brain /> Behavioral Patterns</h5>
            <div className="small text-white opacity-75">
              <div className="mb-2 pb-2 border-bottom border-secondary border-opacity-25">🌙 {lateNightCount} transactions worth <span className="fw-bold text-danger">₹{lateNightAmount}</span> happened after 10 PM</div>
              <div className="mb-2 pb-2 border-bottom border-secondary border-opacity-25">🎉 <span className="fw-bold text-warning">₹{weekendAmount}</span> spent on weekends across {weekendTx.length} transactions</div>
              <div className="mb-2 pb-2">📅 Your most expensive day was <span className="fw-bold text-cyan">{mostExpDate}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountsTab({ transactions, setTransactions, bankAccounts, setBankAccounts }) {
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [search, setSearch] = useState('')
  const [newAccount, setNewAccount] = useState({ name: '', type: 'savings', balance: '', bank: 'HDFC', cleared: true })

  // All balances calculated live from transactions
  const clearedBalance = transactions.filter(t => t.cleared).reduce((s, t) => s + t.inflow - t.outflow, 0)
  const unclearedBalance = transactions.filter(t => !t.cleared).reduce((s, t) => s + t.inflow - t.outflow, 0)
  const workingBalance = clearedBalance + unclearedBalance

  const filtered = [...transactions]
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      return t.payee?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.memo?.toLowerCase().includes(q)
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const submitAccount = async () => {
    if (!newAccount.name.trim() || !newAccount.balance) return
    try {
      // Add as an inflow transaction representing opening balance
      const saved = await api.addTransaction({
        payee: `${newAccount.bank} - ${newAccount.name}`,
        amount: Number(newAccount.balance),
        category: 'Income',
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        memo: `Opening balance - ${newAccount.type} account`,
        cleared: newAccount.cleared,
        isRegret: false,
        outflow: 0,
        inflow: Number(newAccount.balance)
      })
      if (saved._id) {
        setTransactions(prev => [...prev, saved])
        setBankAccounts(prev => [...prev, { _id: Date.now(), ...newAccount, balance: Number(newAccount.balance) }])
        setNewAccount({ name: '', type: 'savings', balance: '', bank: 'HDFC', cleared: true })
        setShowAddAccount(false)
      }
    } catch (err) {
      alert('Failed to add account.')
    }
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Balance Header */}
      <div className="glass-card p-4">
        <div className="d-flex flex-wrap gap-4 align-items-center mb-3">
          <div className="text-center">
            <div className={`fs-3 fw-bold ${clearedBalance >= 0 ? 'text-success' : 'text-danger'}`}>₹{clearedBalance.toLocaleString('en-IN')}</div>
            <small className="text-gray">Cleared Balance</small>
          </div>
          <div className="text-gray fs-4">+</div>
          <div className="text-center">
            <div className="fs-3 fw-bold text-white">₹{unclearedBalance.toLocaleString('en-IN')}</div>
            <small className="text-gray">Uncleared Balance</small>
          </div>
          <div className="text-gray fs-4">=</div>
          <div className="text-center">
            <div className={`fs-3 fw-bold ${workingBalance >= 0 ? 'text-success' : 'text-danger'}`} style={{ textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>₹{workingBalance.toLocaleString('en-IN')}</div>
            <small className="text-gray">Working Balance</small>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <input type="text" className="form-control" style={{ maxWidth: 250 }} placeholder="🔍 Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-outline-light rounded-pill" onClick={() => setShowAddAccount(true)}>＋ Add Account</button>
          <button className="btn btn-cyan rounded-pill" onClick={() => setShowAddTx(true)}>＋ Add Transaction</button>
        </div>
      </div>

      {/* Linked Accounts Row */}
      {bankAccounts.length > 0 && (
        <div className="d-flex gap-3 flex-wrap">
          {bankAccounts.map((a, i) => (
            <div key={a._id || i} className="glass-card p-3" style={{ minWidth: 180 }}>
              <div className="text-cyan fw-bold small">{a.bank || 'Bank'}</div>
              <div className="fw-bold">{a.name}</div>
              <div className={`fs-5 fw-bold ${a.balance >= 0 ? 'text-success' : 'text-danger'}`}>₹{Number(a.balance).toLocaleString('en-IN')}</div>
              <span className="badge bg-secondary">{a.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Ledger */}
      <div className="glass-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(20,25,45,0.98)', zIndex: 10 }}>
              <tr>
                <th width="40"><input type="checkbox" className="form-check-input" /></th>
                <th width="40"></th>
                <th>DATE</th>
                <th>PAYEE</th>
                <th>CATEGORY</th>
                <th className="d-none d-md-table-cell">MEMO</th>
                <th className="text-end">OUTFLOW</th>
                <th className="text-end">INFLOW</th>
                <th className="text-center">CLEARED</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray py-5">No transactions yet. Add your first transaction above.</td></tr>
              ) : filtered.map(t => (
                <tr key={t._id} className="cursor-pointer">
                  <td><input type="checkbox" className="form-check-input" /></td>
                  <td>{t.isRegret ? '⚠️' : ''}</td>
                  <td className="text-gray small">{t.date}</td>
                  <td className="fw-bold">{t.payee}</td>
                  <td><span className="badge border border-secondary text-gray">{t.category}</span></td>
                  <td className="d-none d-md-table-cell text-gray small">{t.memo}</td>
                  <td className="text-end text-danger fw-bold">{t.outflow > 0 ? `₹${t.outflow.toLocaleString('en-IN')}` : ''}</td>
                  <td className="text-end text-success fw-bold">{t.inflow > 0 ? `₹${t.inflow.toLocaleString('en-IN')}` : ''}</td>
                  <td className="text-center">
                    {t.cleared
                      ? <span className="text-success">✓</span>
                      : <span className="text-gray">○</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Link Bank Account</h5>
                <button className="btn-close" onClick={() => setShowAddAccount(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Bank</label>
                  <select className="form-select" value={newAccount.bank} onChange={e => setNewAccount({ ...newAccount, bank: e.target.value })}>
                    {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara', 'Other'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Account Name</label>
                  <input className="form-control" placeholder="e.g. HDFC Savings" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Account Type</label>
                  <select className="form-select" value={newAccount.type} onChange={e => setNewAccount({ ...newAccount, type: e.target.value })}>
                    {['savings', 'current', 'credit', 'loan'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Opening Balance (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text glass-card border-0 text-white">₹</span>
                    <input type="number" className="form-control" placeholder="Current balance" value={newAccount.balance} onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })} />
                  </div>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" checked={newAccount.cleared} onChange={e => setNewAccount({ ...newAccount, cleared: e.target.checked })} />
                  <label className="form-check-label">Cleared / Confirmed Balance</label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => setShowAddAccount(false)}>Cancel</button>
                <button className="btn btn-cyan rounded-pill fw-bold px-4" onClick={submitAccount}>Link Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal reused */}
      {showAddTx && <AddTransactionModal close={() => setShowAddTx(false)} addTransaction={(t) => setTransactions(prev => [...prev, t])} bankAccounts={bankAccounts} />}
    </div>
  )
}

function TradingTab({ stocks, setStocks, totalRegret, futureValue, moneyLost, transactions }) {
  const ALPHA_VANTAGE_KEY = process.env.TRADING_API_KEY;
  const BSE_SYMBOL_MAP = {
    'RELIANCE': 'RELIANCE.BSE',
    'TCS': 'TCS.BSE',
    'INFY': 'INFY.BSE',
    'HDFC': 'HDFCBANK.BSE',
    'WIPRO': 'WIPRO.BSE'
  };

  const [livePrices, setLivePrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ symbol: '', name: '', buyPrice: '', quantity: '' });

  const fetchLivePrice = async (symbol) => {
    const bseSymbol = BSE_SYMBOL_MAP[symbol] || `${symbol}.BSE`;
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${bseSymbol}&apikey=${ALPHA_VANTAGE_KEY}`);
      const data = await res.json();
      const price = parseFloat(data['Global Quote']?.['05. price']);
      if (!isNaN(price)) {
        setLivePrices(prev => ({ ...prev, [symbol]: price }));
      }
    } catch (e) {
      console.log('Price fetch failed for', symbol);
    }
  };

  const fetchAllPrices = async () => {
    setPriceLoading(true);
    for (const stock of stocks) {
      await fetchLivePrice(stock.symbol);
      await new Promise(r => setTimeout(r, 1200));
    }
    setLastUpdated(new Date().toLocaleTimeString());
    setPriceLoading(false);
  };

  useEffect(() => {
    if (stocks.length > 0) fetchAllPrices();
  }, [stocks.length]);

  const growthData = Array.from({ length: 11 }, (_, i) => ({
    year: `Y${i}`, value: Math.round(totalRegret * Math.pow(1.08, i))
  }));
  return (
    <div className="d-flex flex-column gap-4">
      <div className="glass-card p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
          <div className="d-flex align-items-center">
            <h5 className="mb-0">My Portfolio</h5>
            <button className="btn btn-sm btn-outline-info rounded-pill ms-3" onClick={fetchAllPrices} disabled={priceLoading}>
              {priceLoading ? <span className="spinner-border spinner-border-sm" /> : '↻ Refresh Prices'}
            </button>
            {lastUpdated && <small className="text-gray ms-3">Last updated: {lastUpdated}</small>}
          </div>
          <button className="btn btn-sm btn-cyan rounded-pill w-100 w-md-auto" onClick={() => setShowAddStock(true)}>＋ Add Stock</button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead><tr><th>SYMBOL</th><th className="d-none d-md-table-cell">COMPANY</th><th className="text-end">BUY PRICE</th><th className="text-center">QTY</th><th className="text-end">CURRENT</th><th className="text-end">P&L</th><th className="text-end">P&L %</th><th>ACTION</th></tr></thead>
            <tbody>
              {stocks.map(s => {
                const displayPrice = livePrices[s.symbol] || s.currentPrice;
                const pl = Math.round((displayPrice - s.buyPrice) * s.quantity * 100) / 100;
                const plPct = (((displayPrice - s.buyPrice) / s.buyPrice) * 100).toFixed(2);
                const isProfit = pl >= 0;
                return (
                  <tr key={s._id}>
                    <td className="fw-bold text-cyan">{s.symbol}</td>
                    <td className="d-none d-md-table-cell">{s.name}</td>
                    <td className="text-end">₹{s.buyPrice}</td>
                    <td className="text-center">{s.quantity}</td>
                    <td className="text-end fw-bold">
                      {livePrices[s.symbol]
                        ? <span className="text-cyan">₹{livePrices[s.symbol]} <span className="badge bg-success ms-1" style={{ fontSize: '0.6rem' }}>LIVE</span></span>
                        : <span className="text-gray">₹{s.currentPrice} <span className="badge bg-secondary ms-1" style={{ fontSize: '0.6rem' }}>MOCK</span></span>
                      }
                    </td>
                    <td className={`text-end fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>{isProfit ? '+' : ''}₹{pl}</td>
                    <td className={`text-end fw-bold ${isProfit ? 'text-success' : 'text-danger'}`}>{isProfit ? '+' : ''}{plPct}%</td>
                    <td><button className="btn btn-sm btn-outline-light rounded-pill px-3">Trade</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 row">
          {stocks.map(s => {
            const plPct = (((s.currentPrice - s.buyPrice) / s.buyPrice) * 100);
            let msg = "Holding zone. Monitor for 5% movement before acting.";
            if (plPct > 15) msg = `Consider taking partial profits. You are up ${plPct.toFixed(1)}%.`;
            if (plPct < -10) msg = `Down ${Math.abs(plPct).toFixed(1)}%. Evaluate if fundamentals changed before averaging down.`;
            return <div key={s._id} className="col-4 small text-gray border-end border-secondary border-opacity-50 px-3"><span className="text-white fw-bold">{s.symbol}:</span> {msg}</div>
          })}
        </div>
      </div>

      <div className="glass-card p-4 border border-info border-opacity-50 position-relative overflow-hidden" style={{ borderColor: '#a855f7 !important' }}>
        <div className="position-absolute top-0 end-0 p-4 opacity-25" style={{ color: '#a855f7' }}><TrendingUp size={120} /></div>
        <h5 className="mb-4 d-flex align-items-center gap-2" style={{ color: '#a855f7' }}><Brain /> What Could Your Regrets Have Built?</h5>
        <div className="row z-1 position-relative">
          <div className="col-12 col-md-5 mb-4 mb-md-0">
            <div className="p-4 bg-dark bg-opacity-50 rounded mb-4 border border-secondary border-opacity-25">
              <h6 className="text-gray mb-3">Total Regret Spending: <span className="text-danger fw-bold fs-5">₹{totalRegret}</span></h6>
              <p className="small mb-2">If invested at 8% annual return:</p>
              <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-secondary border-opacity-25 text-gray"><span className="font-monospace">→ In 1 year</span> <span className="text-white fw-bold">₹{Math.round(totalRegret * Math.pow(1.08, 1))}</span></div>
              <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-secondary border-opacity-25 text-gray"><span className="font-monospace">→ In 3 years</span> <span className="text-white fw-bold">₹{Math.round(totalRegret * Math.pow(1.08, 3))}</span></div>
              <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-secondary border-opacity-25 text-gray"><span className="font-monospace">→ In 5 years</span> <span className="text-info fw-bold fs-6">₹{futureValue}</span></div>
              <div className="d-flex justify-content-between mb-3 text-gray"><span className="font-monospace">→ In 10 years</span> <span className="text-white fw-bold">₹{Math.round(totalRegret * Math.pow(1.08, 10))}</span></div>

              <div className="alert-danger-glass p-3 rounded mt-3">
                Opportunity cost of impulse spending: <strong>₹{moneyLost}</strong> over 5 years.
              </div>
            </div>

            <h6 className="text-gray small text-uppercase">Individual Regret Breakdown</h6>
            <div className="overflow-auto" style={{ maxHeight: 150 }}>
              {transactions.filter(t => t.isRegret).map(t => (
                <div key={t._id} className="small mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-white">{t.payee}</span> on {t.date} — <span className="text-danger">₹{t.amount}</span> <br />
                  <span className="text-info">→ Would be ₹{Math.round(t.amount * Math.pow(1.08, 5))} in 5 years</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-md-7">
            <div className="w-100 overflow-auto" style={{ maxWidth: '100vw' }}>
              <RechartsLineChart width={600} height={300} data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="year" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid #a855f7' }} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} activeDot={{ r: 8 }} name="Projected Value" />
              </RechartsLineChart>
            </div>
          </div>
        </div>
      </div>

      {showAddStock && (
        <AddStockModal
          close={() => setShowAddStock(false)}
          savedStock={async (ns) => {
            try {
              const saved = await api.addStock({
                symbol: ns.symbol,
                name: ns.name || ns.symbol,
                buyPrice: Number(ns.buyPrice),
                quantity: Number(ns.quantity),
                currentPrice: Number(ns.buyPrice)
              })
              if (saved._id) {
                setStocks(prev => [...prev, saved])
                setShowAddStock(false)
              }
            } catch (e) { console.error(e) }
          }}
        />
      )}
    </div>
  );
}

function ClockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>; }

function AddTransactionModal({ close, addTransaction, bankAccounts, budgetCategories }) {
  const [form, setForm] = useState({ payee: '', amount: '', category: '', date: '', time: '', memo: '', account: bankAccounts[0]?.name || '', cleared: true, isRegret: false, type: 'Outflow' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!form.category && budgetCategories && budgetCategories.length > 0) {
      setForm(prev => ({ ...prev, category: budgetCategories[0].name }));
    }
  }, [budgetCategories]);

  const submit = async (e) => {
    e.preventDefault()
    if (!form.payee || !form.amount) return
    setSaving(true)
    try {
      const isIncome = form.type === 'Inflow'
      const saved = await api.addTransaction({
        payee: form.payee,
        amount: Number(form.amount),
        category: isIncome ? 'Income' : form.category || 'Bills',
        type: isIncome ? 'income' : 'expense',
        date: form.date,
        time: form.time,
        memo: form.memo,
        cleared: form.cleared,
        isRegret: isIncome ? false : form.isRegret,
        outflow: isIncome ? 0 : Number(form.amount),
        inflow: isIncome ? Number(form.amount) : 0
      })
      if (saved._id) {
        addTransaction(saved)
        close()
      } else {
        alert('Failed to save transaction: ' + (saved.message || 'Unknown error'))
      }
    } catch (err) {
      alert('Server error saving transaction.')
    }
    setSaving(false)
  }
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card">
          <div className="modal-header border-bottom border-secondary border-opacity-50">
            <h5 className="modal-title fw-bold">Add Transaction</h5>
            <button type="button" className="btn-close" onClick={close}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={submit}>
              <div className="mb-3 btn-group w-100" role="group">
                <input type="radio" className="btn-check" id="btnradio1" checked={form.type === 'Outflow'} onChange={() => setForm({ ...form, type: 'Outflow' })} />
                <label className="btn btn-outline-danger" htmlFor="btnradio1">Outflow</label>
                <input type="radio" className="btn-check" id="btnradio2" checked={form.type === 'Inflow'} onChange={() => setForm({ ...form, type: 'Inflow' })} />
                <label className="btn btn-outline-success" htmlFor="btnradio2">Inflow</label>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-8"><input className="form-control p-2" placeholder="Payee Name" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} required /></div>
                <div className="col-4"><input className="form-control p-2 text-end fw-bold" type="number" placeholder="₹ Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  {form.type === 'Outflow' ? (
                    <select className="form-select p-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="" disabled>Select Category</option>
                      {budgetCategories?.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  ) : (
                    <select className="form-select p-2" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="Income">Income</option>
                    </select>
                  )}
                </div>
                <div className="col-6">
                  <select className="form-select p-2" value={form.account} onChange={e => setForm({ ...form, account: e.target.value })}>
                    {bankAccounts.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6"><input type="date" className="form-control p-2" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="col-6"><input type="time" className="form-control p-2" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required /></div>
              </div>
              <div className="mb-3">
                <input type="text" className="form-control p-2" placeholder="Memo (optional)" value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} />
              </div>
              <div className="d-flex justify-content-between px-2 bg-dark bg-opacity-25 p-2 rounded mb-4 border border-secondary border-opacity-25">
                <div className="form-check form-switch cursor-pointer"><input className="form-check-input" type="checkbox" id="cleared" checked={form.cleared} onChange={e => setForm({ ...form, cleared: e.target.checked })} /><label className="form-check-label text-white cursor-pointer" htmlFor="cleared">Cleared</label></div>
                <div className="form-check form-switch cursor-pointer"><input className="form-check-input" type="checkbox" id="regret" checked={form.isRegret} onChange={e => setForm({ ...form, isRegret: e.target.checked })} /><label className="form-check-label text-white cursor-pointer" htmlFor="regret">Mark as Regret?</label></div>
              </div>
              <button type="submit" className="btn btn-cyan w-100 rounded-pill fw-bold p-2" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {saving ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ pins, savePins, user }) {
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [targetSection, setTargetSection] = useState(null)
  const [pinDraft, setPinDraft] = useState('')
  const [confirmDraft, setConfirmDraft] = useState('')
  const [error, setError] = useState('')

  const handleSetup = (section) => {
    setTargetSection(section)
    setPinDraft('')
    setConfirmDraft('')
    setError('')
    setShowPinSetup(true)
  }

  const saveNewPin = () => {
    if (pinDraft.length !== 4) return setError('PIN must be 4 digits')
    if (pinDraft !== confirmDraft) return setError('PINs do not match')
    savePins({ ...pins, [targetSection]: pinDraft })
    setShowPinSetup(false)
  }

  const removePin = (section) => {
    if (window.confirm(`Remove PIN protection for ${section}?`)) {
      savePins({ ...pins, [section]: null })
    }
  }

  return (
    <div className="container-fluid py-4 max-w-4xl max-w-md-100">
      <h2 className="mb-4 fw-bold">Settings & Security</h2>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className="glass-card p-4 h-100">
            <h5 className="mb-4">Profile Overview</h5>
            <div className="mb-3 d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
              <span className="text-gray">Name:</span>
              <span className="fw-bold">{user.name || 'User'}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
              <span className="text-gray">Email:</span>
              <span className="fw-bold">{user.email || 'N/A'}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between pb-2">
              <span className="text-gray">Account Created:</span>
              <span className="fw-bold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="glass-card p-4 h-100">
            <h5 className="mb-4 d-flex align-items-center gap-2">
              <span className="badge bg-danger">Pro</span> Security Locks
            </h5>
            <p className="text-gray small mb-4">Protect sensitive areas with a 4-digit PIN lock. Requires entry upon every dashboard return.</p>

            <div className="d-flex align-items-center justify-content-between mb-3 bg-dark bg-opacity-25 p-3 rounded border border-secondary border-opacity-25">
              <div>
                <div className="fw-bold mb-1">Trading Engine</div>
                <div className="small text-gray">Lock high-risk stock trades</div>
              </div>
              {pins?.trading ? (
                <button className="btn btn-sm btn-outline-danger" onClick={() => removePin('trading')}>Remove PIN</button>
              ) : (
                <button className="btn btn-sm btn-outline-cyan" onClick={() => handleSetup('trading')}>Setup PIN</button>
              )}
            </div>

            <div className="d-flex align-items-center justify-content-between bg-dark bg-opacity-25 p-3 rounded border border-secondary border-opacity-25">
              <div>
                <div className="fw-bold mb-1">All Accounts</div>
                <div className="small text-gray">Lock total net worth visibility</div>
              </div>
              {pins?.accounts ? (
                <button className="btn btn-sm btn-outline-danger" onClick={() => removePin('accounts')}>Remove PIN</button>
              ) : (
                <button className="btn btn-sm btn-outline-cyan" onClick={() => handleSetup('accounts')}>Setup PIN</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <h5 className="mb-4">Behavioral Profile Answers</h5>
        <div className="row g-3">
          {Object.entries(user.onboardingAnswers || {}).map(([q, a]) => (
            <div key={q} className="col-12 col-md-6">
              <div className="p-3 bg-dark bg-opacity-50 rounded h-100 border border-secondary border-opacity-25">
                <div className="text-cyan small mb-1">Question {q}</div>
                <div className="fw-bold">{Array.isArray(a) ? a.join(', ') : a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPinSetup && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content glass-card">
              <div className="modal-header border-bottom border-secondary border-opacity-50">
                <h6 className="modal-title fw-bold">Set PIN for {targetSection}</h6>
                <button className="btn-close" onClick={() => setShowPinSetup(false)}></button>
              </div>
              <div className="modal-body text-center">
                {error && <div className="text-danger small mb-3">{error}</div>}
                <input type="password" maxLength={4} className="form-control text-center fs-3 letter-spacing-lg mb-3" placeholder="••••" value={pinDraft} onChange={e => setPinDraft(e.target.value.replace(/\D/g, ''))} />
                <input type="password" maxLength={4} className="form-control text-center fs-3 letter-spacing-lg mb-3" placeholder="Confirm" value={confirmDraft} onChange={e => setConfirmDraft(e.target.value.replace(/\D/g, ''))} />
                <button className="btn btn-cyan w-100 fw-bold rounded-pill" onClick={saveNewPin}>Save PIN Lock</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PinLockScreen({ section, onUnlock, pins, onSetPin }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [setupMode, setSetupMode] = useState(!pins[section])

  const submit = () => {
    if (setupMode) {
      if (input.length === 4) {
        onSetPin(section, input)
        onUnlock(section)
      }
    } else {
      if (input === pins[section]) {
        onUnlock(section)
      } else {
        setError(true)
        setInput('')
        setTimeout(() => setError(false), 1000)
      }
    }
  }

  const handleKey = (n) => {
    if (input.length < 4) setInput(prev => prev + n)
  }

  const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>

  return (
    <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4">
      <div className="glass-card p-5 text-center" style={{ maxWidth: 400, width: '100%' }}>
        <div className="mb-4 d-inline-block p-3 rounded-circle" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
          <LockIcon />
        </div>
        <h3 className="mb-2 fw-bold text-white">{setupMode ? 'Create PIN' : 'Enter PIN'}</h3>
        <p className="text-gray mb-4">{setupMode ? `Secure the ${section} tab` : `This section is protected`}</p>

        <div className="d-flex justify-content-center gap-3 mb-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`rounded-circle border ${input.length > i ? 'bg-cyan border-cyan' : 'border-secondary'} ${error ? 'border-danger bg-danger' : ''}`} style={{ width: 20, height: 20, transition: 'all 0.2s' }}></div>
          ))}
        </div>

        <div className="row g-2 mb-4 px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((btn, i) => (
            <div key={i} className="col-4">
              <button
                className={`btn btn-outline-secondary w-100 rounded fw-bold fs-5 py-2 ${btn === 'OK' ? 'text-cyan border-cyan bg-cyan bg-opacity-10' : ''}`}
                onClick={() => {
                  if (btn === 'C') setInput(prev => prev.slice(0, -1))
                  else if (btn === 'OK') submit()
                  else handleKey(btn.toString())
                }}
              >
                {btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AddStockModal({ close, savedStock }) {
  const [newStock, setNewStock] = useState({ symbol: '', name: '', buyPrice: '', quantity: '' })
  const [loadingPrice, setLoadingPrice] = useState(false)

  const handleSymbolBlur = async () => {
    if (!newStock.symbol) return;
    setLoadingPrice(true)
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${newStock.symbol.toUpperCase()}&apikey=SSO8U5P51QQ8B691`)
      const data = await res.json()
      const quote = data['Global Quote']
      if (quote && quote['05. price']) {
        setNewStock(prev => ({ ...prev, buyPrice: parseFloat(quote['05. price']).toFixed(2) }))
      }
    } catch (err) {
      console.error(err)
    }
    setLoadingPrice(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!newStock.symbol || !newStock.buyPrice || !newStock.quantity) return
    savedStock(newStock)
  }

  const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card border border-cyan border-opacity-25 shadow-lg">
          <div className="modal-header border-bottom border-cyan border-opacity-25 pb-3">
            <h5 className="modal-title fw-bold text-cyan d-flex align-items-center gap-2">
              <TrendingUpIcon /> Add Stock Position
            </h5>
            <button className="btn-close btn-close-white" onClick={close}></button>
          </div>
          <div className="modal-body py-4">
            <form onSubmit={submit}>
              <div className="mb-4">
                <label className="form-label text-gray small text-uppercase fw-bold letter-spacing-sm">Stock Symbol (e.g. RELIANCE.BSE)</label>
                <input
                  type="text"
                  className="form-control p-3 bg-dark border border-secondary text-white fw-bold fs-5"
                  placeholder="Enter Symbol..."
                  value={newStock.symbol}
                  onChange={e => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  onBlur={handleSymbolBlur}
                  required
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <label className="form-label text-gray small text-uppercase fw-bold letter-spacing-sm">Buy Price (₹)</label>
                  <div className="position-relative">
                    {loadingPrice && <span className="position-absolute end-0 top-50 translate-middle-y me-3 spinner-border spinner-border-sm text-cyan" />}
                    <input type="number" step="0.01" className="form-control p-3 bg-dark border border-secondary text-white" placeholder="0.00" value={newStock.buyPrice} onChange={e => setNewStock({ ...newStock, buyPrice: e.target.value })} required />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-gray small text-uppercase fw-bold letter-spacing-sm">Quantity Shares</label>
                  <input type="number" className="form-control p-3 bg-dark border border-secondary text-white" placeholder="0" value={newStock.quantity} onChange={e => setNewStock({ ...newStock, quantity: e.target.value })} required />
                </div>
              </div>

              <button type="submit" className="btn btn-cyan w-100 rounded-pill fw-bold fs-5 py-3 shadow-sm" style={{ boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)' }}>Add to Portfolio</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
