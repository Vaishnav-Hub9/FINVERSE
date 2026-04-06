import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LayoutDashboard, LineChart, Building2, TrendingUp, DollarSign, Brain, CheckCircle2, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart as RechartsLineChart, Line } from 'recharts';

export default function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState({ name: '', email: '', onboardingAnswers: {} });

  const [transactions, setTransactions] = useState([
    { id: 1, payee: 'Amazon', amount: 3400, category: 'Wants', isRegret: true, time: '23:00', date: '2026-04-01', cleared: true, inflow: 0, outflow: 3400, memo: 'Late night buy' },
    { id: 2, payee: 'Uber Eats', amount: 1200, category: 'Wants', isRegret: true, time: '22:30', date: '2026-04-02', cleared: true, inflow: 0, outflow: 1200, memo: 'Midnight order' },
    { id: 3, payee: 'Grocery Store', amount: 4500, category: 'Needs', isRegret: false, time: '10:00', date: '2026-04-03', cleared: true, inflow: 0, outflow: 4500, memo: 'Weekly groceries' },
    { id: 4, payee: 'Netflix', amount: 649, category: 'Bills', isRegret: false, time: '09:00', date: '2026-04-01', cleared: false, inflow: 0, outflow: 649, memo: 'Monthly subscription' },
    { id: 5, payee: 'Salary', amount: 55000, category: 'Income', isRegret: false, time: '09:00', date: '2026-04-01', cleared: true, inflow: 55000, outflow: 0, memo: 'Monthly salary' }
  ]);

  const [budgetCategories, setBudgetCategories] = useState([
    { id: 1, name: 'Utilities', group: 'Bills', assigned: 3000 },
    { id: 2, name: 'TV & Internet', group: 'Bills', assigned: 1500 },
    { id: 3, name: 'Insurance', group: 'Bills', assigned: 2000 },
    { id: 4, name: 'Student Loans', group: 'Bills', assigned: 5000 },
    { id: 5, name: 'TV Streaming', group: 'Bills', assigned: 649 },
    { id: 6, name: 'Transportation', group: 'Needs', assigned: 2000 },
    { id: 7, name: 'Groceries', group: 'Needs', assigned: 6000 },
    { id: 8, name: 'Medical', group: 'Needs', assigned: 1500 },
    { id: 9, name: 'Entertainment', group: 'Wants', assigned: 2000 },
    { id: 10, name: 'Dining Out', group: 'Wants', assigned: 3000 },
    { id: 11, name: 'Shopping', group: 'Wants', assigned: 2500 }
  ]);

  const [stocks, setStocks] = useState([
    { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries', buyPrice: 2400, quantity: 5, currentPrice: 2561 },
    { id: 2, symbol: 'TCS', name: 'Tata Consultancy', buyPrice: 3500, quantity: 3, currentPrice: 3389 },
    { id: 3, symbol: 'INFY', name: 'Infosys', buyPrice: 1450, quantity: 10, currentPrice: 1523 }
  ]);

  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: 'HDFC Savings', balance: 15000, type: 'savings', cleared: true },
    { id: 2, name: 'SBI Current', balance: 2000, type: 'current', cleared: false }
  ]);

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
          totalIncome={totalIncome} totalSpent={totalSpent} buffer={buffer}
          totalRegret={totalRegret} potentialSavings={potentialSavings}
          regretRatio={regretRatio} disciplineScore={disciplineScore}
          futureValue={futureValue} moneyLost={moneyLost}
          clearedBalance={clearedBalance} unclearedBalance={unclearedBalance} workingBalance={workingBalance}
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setErr('Please enter a valid email address.'); return; }
    if (!password) { setErr('Password is required.'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => {
      setUser({ ...user, email });
      setView('dashboard');
    }, 1500);
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 p-3">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '420px' }}>
        <h2 className="text-cyan text-center fw-bold mb-1">FINVERSE</h2>
        <p className="text-center text-gray mb-4">Financial Intelligence Platform</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="email" placeholder="Email" className="form-control p-3" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="mb-3 position-relative">
            <input type={showPwd ? 'text' : 'password'} placeholder="Password" className="form-control p-3" value={password} onChange={e=>setPassword(e.target.value)} />
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
    if(p.length>5) s++; if(p.length>8) s++;
    if(/[A-Z]/.test(p)) s++; if(/[0-9]/.test(p)) s++; if(/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const pwdColor = pwdScore <= 2 ? '#ef4444' : pwdScore <= 4 ? '#f59e0b' : '#10b981';
  const pwdLabel = pwdScore <= 2 ? 'Weak' : pwdScore <= 4 ? 'Good' : 'Strong';

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!form.name.trim()) return setErr('Please enter your full name.');
    if(!form.email.includes('@')) return setErr('Please enter a valid email address.');
    if(form.password.length < 6) return setErr('Password must be at least 6 characters.');
    if(form.password !== form.confirm) return setErr('Passwords do not match.');
    if(!form.agree) return setErr('You must agree to Terms & Conditions.');
    setErr(''); setLoading(true);
    setTimeout(() => setView('onboarding'), 1500);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3 py-5">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '460px' }}>
        <h3 className="text-center fw-bold mb-4">Create Account</h3>
        <form onSubmit={handleSubmit}>
          <input className="form-control mb-3 p-3" placeholder="Full Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
          <input className="form-control mb-3 p-3" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
          <input className="form-control mb-2 p-3" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
          {form.password && (
            <div className="mb-3">
              <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                <div className="progress-bar" style={{ width: `${(pwdScore/5)*100}%`, backgroundColor: pwdColor }} />
              </div>
              <small style={{ color: pwdColor }}>{pwdLabel}</small>
            </div>
          )}
          <input className="form-control mb-3 p-3" type="password" placeholder="Confirm Password" value={form.confirm} onChange={e=>setForm({...form, confirm: e.target.value})} />
          <div className="form-check mb-4">
            <input className="form-check-input" type="checkbox" id="agree" checked={form.agree} onChange={e=>setForm({...form, agree: e.target.checked})} />
            <label className="form-check-label text-gray" htmlFor="agree">I agree to Terms & Conditions</label>
          </div>
          {err && <div className="p-3 mb-3 text-center rounded alert-danger-glass">{err}</div>}
          <button type="submit" className="btn btn-cyan w-100 rounded-pill p-3 mb-3 fw-bold" disabled={loading}>
            {loading ? <div className="spinner-border spinner-border-sm" /> : 'Create Account'}
          </button>
        </form>
        <div className="text-center"><a href="#" className="text-cyan text-decoration-none" onClick={e=>{e.preventDefault(); setView('login')}}>Already have account? Login</a></div>
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
    if(!selections.length) return "Awaiting your input...";
    if(step === 0) {
      if(selections.includes('Get out of debt')) return "Debt Elimination Mode: System will prioritize debt payoff over discretionary spending.";
      if(selections.includes('Make the most of my money')) return "Optimization Mode: System will track opportunity costs on every rupee.";
      if(selections.includes('Create more breathing room')) return "Buffer Mode: System will protect your Safe-to-Spend metric aggressively.";
      return "Discipline Mode: Every unplanned transaction will be flagged automatically.";
    }
    if(step === 1) {
      if(selections.includes('Kids') || selections.includes('Teens')) return "Family Budget Mode: Medical and education limits calibrated for dependents.";
      if(selections.includes('My partner')) return "Shared Finance Mode: Dual-income tracking enabled.";
      return "Individual Mode: Limits calibrated for single person.";
    }
    if(step === 2) {
      if(selections.includes('Credit card')) return "High-Interest Alert: Discipline Engine will flag any non-essential spend while credit card debt exists.";
      if(selections.includes('Student loans')) return "Long-Term Liability Detected: Loan repayment factored into your savings velocity.";
      if(selections.includes('No debt')) return "Clean Slate: Full income available for goals and investments.";
      return "Debt Portfolio Registered: System will recommend payoff priority order.";
    }
    if(step === 3) return "Baseline Expenditure Map: Establishing your non-negotiable monthly outflows.";
    if(step === 4) return "Fixed Liability Scan: Calculating total recurring subscription drain per month.";
    if(step === 5) {
      if(selections.includes('Emergency fund')) return "Priority Flag: Emergency fund will be protected from reallocation.";
      if(selections.includes('Investments') || selections.includes('Retirement')) return "Wealth Mode: Opportunity Cost Engine linked to your goal timeline.";
      return "Goal Timeline: System will calculate monthly savings velocity needed.";
    }
    if(step === 6) return "Guilt-Free Zone Registered: These categories will never be flagged as anomalies by the system.";
    return "";
  };

  const toggleOption = (opt) => {
    if(steps[step].type === 'single') setSelections([opt]);
    else setSelections(prev => prev.includes(opt) ? prev.filter(o=>o!==opt) : [...prev, opt]);
  };

  const nextStep = (skip = false) => {
    const newAnswers = { ...answers, [step]: skip ? ['SYS_DEFAULT'] : selections };
    setAnswers(newAnswers);
    if(step === 6) {
      setUser({ ...user, onboardingAnswers: newAnswers });
      setView('dashboard');
    } else {
      setStep(step + 1);
      setSelections([]);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="glass-card w-100 d-flex flex-column" style={{ maxWidth: '900px', minHeight: '600px' }}>
        <div className="progress" style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div className="progress-bar" style={{ width: `${((step + 1)/7)*100}%`, backgroundColor: '#38bdf8', boxShadow: '0 0 10px #38bdf8' }} />
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

          <div dangerouslySetInnerHTML={{__html: `<!-- User Interaction Box -->`}} />
          <div className="mt-4 p-3 rounded" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <div className="d-flex align-items-start gap-2">
              <Brain className="text-cyan mt-1" size={20} />
              <p className="mb-0 text-cyan">{getInsight()}</p>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button className="btn text-gray px-0" onClick={() => nextStep(true)}>Skip this step</button>
            <button className="btn btn-cyan rounded-pill px-4 fw-bold" onClick={() => nextStep()} disabled={!selections.length}>Next <ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ 
  user, view, setView, transactions, setTransactions, budgetCategories, setBudgetCategories,
  stocks, setStocks, bankAccounts, setBankAccounts, totalIncome, totalSpent, buffer,
  totalRegret, potentialSavings, regretRatio, disciplineScore, futureValue, moneyLost, clearedBalance, unclearedBalance, workingBalance 
}) {
  const [tab, setTab] = useState('plan');
  return (
    <div className="app-container">
      <div className="sidebar p-3 glass-card">
        <div className="text-center mb-4 mt-2">
          <div className="rounded-circle bg-cyan text-black d-inline-flex align-items-center justify-content-center fw-bold fs-3 mb-2" style={{width: 60, height: 60, backgroundColor: '#38bdf8'}}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h6 className="mb-0 fw-bold">{user.name || 'User'}</h6>
          <small className="text-gray">{user.email || 'user@example.com'}</small>
        </div>
        
        <div className="nav flex-column flex-grow-1 gap-1">
          <a href="#" className={`nav-link ${tab==='plan'?'active':''}`} onClick={()=>setTab('plan')}><LayoutDashboard size={20}/> Plan</a>
          <a href="#" className={`nav-link ${tab==='reflect'?'active':''}`} onClick={()=>setTab('reflect')}><LineChart size={20}/> Reflect</a>
          <a href="#" className={`nav-link ${tab==='accounts'?'active':''}`} onClick={()=>setTab('accounts')}><Building2 size={20}/> All Accounts</a>
          <a href="#" className={`nav-link ${tab==='trading'?'active':''}`} onClick={()=>setTab('trading')}><TrendingUp size={20}/> Trading Engine</a>
        </div>
        
        <div className="mt-auto">
          <div className="badge bg-transparent border border-info text-info p-2 w-100 rounded text-start d-flex align-items-center gap-2">
             <Brain size={16}/> Mode: {user.onboardingAnswers?.[0]?.includes('Stop impulsive spending') ? 'Discipline Engine' : 'Optimization Mode'}
          </div>
        </div>
      </div>

      <div className="main-content">
        {tab === 'plan' && (
          <PlanTab 
            transactions={transactions} setTransactions={setTransactions} 
            budgetCategories={budgetCategories} setBudgetCategories={setBudgetCategories}
            buffer={buffer} totalRegret={totalRegret} regretRatio={regretRatio} potentialSavings={potentialSavings}
            bankAccounts={bankAccounts}
          />
        )}
        {tab === 'reflect' && (
          <ReflectTab 
            transactions={transactions} disciplineScore={disciplineScore} totalSpent={totalSpent} 
            totalRegret={totalRegret} buffer={buffer} user={user} totalIncome={totalIncome}
          />
        )}
        {tab === 'accounts' && (
          <AccountsTab 
            transactions={transactions} setTransactions={setTransactions} 
            bankAccounts={bankAccounts} setBankAccounts={setBankAccounts}
            clearedBalance={clearedBalance} unclearedBalance={unclearedBalance} workingBalance={workingBalance}
          />
        )}
        {tab === 'trading' && (
          <TradingTab 
            stocks={stocks} setStocks={setStocks} totalRegret={totalRegret} futureValue={futureValue}
            moneyLost={moneyLost} transactions={transactions}
          />
        )}
      </div>
    </div>
  );
}

function PlanTab({ transactions, setTransactions, budgetCategories, setBudgetCategories, buffer, totalRegret, regretRatio, potentialSavings, bankAccounts }) {
  const handleAssignChange = (id, val) => {
    setBudgetCategories(prev => prev.map(c => c.id === id ? { ...c, assigned: Number(val) || 0 } : c));
  };
  const [showAdd, setShowAdd] = useState(false);

  const getGroupStats = (group) => {
    const cats = budgetCategories.filter(c => c.group === group);
    const sumAssigned = cats.reduce((s,c)=>s+c.assigned, 0);
    const sumActivity = cats.reduce((s,c)=>{
      const t = transactions.filter(tr => tr.category === group && tr.outflow > 0).reduce((ts,tr)=>ts+tr.outflow, 0) 
        + transactions.filter(tr => tr.category === c.name && tr.outflow > 0).reduce((ts,tr)=>ts+tr.outflow, 0);
      return s + t;
    }, 0);
    return { sumAssigned, sumActivity, sumAvailable: sumAssigned - sumActivity };
  };

  const groups = ['Bills', 'Needs', 'Wants'];
  const lateNightRegrets = transactions.filter(t => t.isRegret && parseInt(t.time) >= 22);
  const lateNightTotal = lateNightRegrets.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="row h-100">
      <div className="col-lg-8 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-4 glass-card p-3">
          <h4 className="mb-0 fw-bold">April 2026</h4>
          <div className="text-center">
            <span className="text-gray small text-uppercase">Safe to Spend</span>
            <h3 className={`mb-0 fw-bold ${buffer >= 0 ? 'text-success' : 'text-danger'}`}>₹{buffer}</h3>
          </div>
          <button className="btn btn-cyan rounded-pill" onClick={()=>setShowAdd(true)}>＋ Add Transaction</button>
        </div>

        <div className="glass-card flex-grow-1 overflow-auto">
          <div className="p-3 border-bottom border-secondary">
            <button className="btn btn-sm btn-cyan-outline me-2 rounded-pill">All</button>
            <button className="btn btn-sm btn-outline-secondary me-2 rounded-pill text-gray">Underfunded</button>
            <button className="btn btn-sm btn-outline-secondary rounded-pill text-gray">Overfunded</button>
          </div>
          <table className="table">
            <thead><tr><th width="30"></th><th>CATEGORY</th><th className="text-end">ASSIGNED</th><th className="text-end">ACTIVITY</th><th className="text-end">AVAILABLE</th></tr></thead>
            <tbody>
              {groups.map(g => {
                const stats = getGroupStats(g);
                return (
                  <React.Fragment key={g}>
                    <tr className="group-header">
                      <td><ChevronRight size={16}/></td>
                      <td>{g.toUpperCase()}</td>
                      <td className="text-end">₹{stats.sumAssigned}</td>
                      <td className="text-end">₹{stats.sumActivity}</td>
                      <td className={`text-end fw-bold ${stats.sumAvailable>0?'text-success':stats.sumAvailable<0?'text-danger':'text-gray'}`}>₹{stats.sumAvailable}</td>
                    </tr>
                    {budgetCategories.filter(c => c.group === g).map(c => {
                      const activity = transactions.filter(t => (t.category === c.name || t.category === g) && t.memo?.includes(c.name)).reduce((s,t)=>s+t.outflow, 0)
                                      + (g === 'Bills' && c.name==='TV Streaming' ? transactions.find(t=>t.payee==='Netflix')?.outflow || 0 : 0); 
                      // Rough logic for prototype to match realistic numbers based on sample data if categories map loosely.
                      // For a real app, transactions would have exact sub-category IDs.
                      const act = transactions.filter(t => t.category === g).reduce((s,t)=> s + (t.amount/budgetCategories.filter(bc=>bc.group===g).length), 0); // Mock distribution for visual fill
                      const available = c.assigned - act;
                      return (
                        <tr key={c.id}>
                          <td></td>
                          <td>{c.name}</td>
                          <td className="text-end"><input className="inline-input text-end" value={c.assigned} onChange={(e)=>handleAssignChange(c.id, e.target.value)}/></td>
                          <td className="text-end text-gray">₹{Math.round(act)}</td>
                          <td className={`text-end badge-col`}><span className={`badge rounded-pill ${available>0?'bg-success':available<0?'bg-danger':'bg-secondary'}`}>₹{Math.round(available)}</span></td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="p-3">
             <button className="btn btn-sm btn-outline-secondary text-gray rounded-pill border-0"><DollarSign size={14}/> Add Category</button>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="glass-card h-100 p-4 d-flex flex-column">
          <h5 className="mb-0 d-flex align-items-center gap-2"><Brain className="text-purple"/> Behavioral Regrets</h5>
          <p className="text-gray small mb-4">Transactions you flagged as impulsive</p>
          
          <div className="flex-grow-1 overflow-auto mb-4">
            {transactions.filter(t=>t.isRegret).length === 0 ? (
              <div className="text-success p-3 text-center border rounded border-success border-opacity-25" style={{background: 'rgba(16,185,129,0.1)'}}>No regrets logged. Keep it up.</div>
            ) : transactions.filter(t=>t.isRegret).map(t => (
              <div key={t.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <div>
                  <div className="fw-bold">{t.payee}</div>
                  <div className="small text-gray">{t.date} {t.time} • <span className="badge bg-dark border">{t.category}</span></div>
                </div>
                <div className="text-end">
                  <div className="text-danger fw-bold">−₹{t.amount}</div>
                  <button className="btn btn-sm text-gray small py-0 px-1 border-0 text-decoration-underline" onClick={() => setTransactions(prev=>prev.map(tr=>tr.id===t.id?{...tr, isRegret:false}:tr))}>Remove</button>
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
      {showAdd && <AddTransactionModal close={()=>setShowAdd(false)} addTransaction={(t)=>setTransactions(prev=>[...prev, t])} bankAccounts={bankAccounts} />}
    </div>
  );
}

function ReflectTab({ transactions, disciplineScore, totalSpent, totalRegret, buffer, user, totalIncome }) {
  const pieData = ['Bills', 'Needs', 'Wants'].map(cat => ({
    name: cat, value: transactions.filter(t => t.category === cat).reduce((s, t) => s + t.outflow, 0)
  })).filter(d => d.value > 0);
  const COLORS = ['#38bdf8', '#10b981', '#a855f7'];

  const barData = ['Bills', 'Needs', 'Wants'].map(cat => ({
    category: cat,
    normal: transactions.filter(t => t.category === cat && !t.isRegret).reduce((s,t) => s + t.outflow, 0),
    regret: transactions.filter(t => t.category === cat && t.isRegret).reduce((s,t) => s + t.outflow, 0)
  }));

  const catCounts = transactions.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
  const mostFrequent = Object.keys(catCounts).sort((a,b)=>catCounts[b]-catCounts[a])[0];
  const maxOut = Math.max(...transactions.map(t=>t.outflow||0), 0);

  return (
    <div>
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-4 text-center h-100">
            <h6 className="text-gray text-uppercase small">Discipline Score</h6>
            <h1 className="fw-bold my-2" style={{color: disciplineScore > 75 ? '#10b981' : disciplineScore > 50 ? '#f59e0b' : '#ef4444', textShadow: `0 0 15px ${disciplineScore > 75 ? '#10b981' : '#ef4444'}`}}>{disciplineScore}/100</h1>
            <small className="text-gray" style={{fontSize: '0.7rem'}}>Based on regret ratio of your total spending</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Total Spent</h6><h2 className="fw-bold my-2">₹{totalSpent}</h2></div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Total Regret</h6><h2 className="fw-bold my-2 text-danger">₹{totalRegret}</h2></div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4 h-100"><h6 className="text-gray text-uppercase small">Safe Buffer</h6><h2 className={`fw-bold my-2 ${buffer>=0?'text-success':'text-danger'}`}>₹{buffer}</h2></div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-7">
          <div className="glass-card p-4 h-100">
            <h5 className="mb-4">Spending by Category</h5>
            <div style={{height: 300}}>
              <PieChart width={500} height={300}>
                <Pie data={pieData} cx={250} cy={140} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => `₹${val}`} contentStyle={{background: '#1e1b4b', border: 'none', borderRadius: '8px', color: '#fff'}}/>
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>
        <div className="col-md-5">
           <div className="glass-card p-4 h-100 d-flex flex-column gap-3">
             <h5 className="mb-2">Fast Facts</h5>
             <div className="p-3 bg-dark bg-opacity-25 rounded border border-secondary border-opacity-25 d-flex justify-content-between">
               <span className="text-gray">Average daily spending</span><span className="fw-bold">₹{Math.round(totalSpent/30)}</span>
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

      <div className="row g-4">
        <div className="col-md-8">
           <div className="glass-card p-4">
             <h5 className="mb-4">Regret Timeline (Normal vs Regret)</h5>
             <BarChart width={700} height={250} data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="category" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{background: '#1e1b4b', border: 'none'}} />
                <Legend />
                <Bar dataKey="normal" name="Intentional Spend" stackId="a" fill="#38bdf8" />
                <Bar dataKey="regret" name="Regret Spend" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
             </BarChart>
           </div>
        </div>
        <div className="col-md-4">
           <div className="glass-card p-4 h-100 border border-info border-opacity-50">
             <h5 className="mb-3 d-flex align-items-center gap-2"><Brain className="text-info"/> Onboarding Insights</h5>
             {user.onboardingAnswers?.['2']?.includes('Credit card') && <div className="badge bg-danger p-2 mb-2 w-100 text-wrap text-start">⚠ Credit Card Debt Active — avoid discretionary spending</div>}
             {user.onboardingAnswers?.['5']?.includes('Emergency fund') && <div className="badge bg-info p-2 mb-2 w-100 text-wrap text-start text-dark">Emergency Fund Goal Active — assign ₹{Math.round(totalIncome * 0.2)} monthly</div>}
             {user.onboardingAnswers?.['6']?.includes('Dining out') && <div className="badge bg-success p-2 mb-2 w-100 text-wrap text-start">Dining Out is your guilt-free zone — not flagged as regret</div>}
           </div>
        </div>
      </div>
    </div>
  );
}

function AccountsTab({ transactions, bankAccounts, clearedBalance, unclearedBalance, workingBalance }) {
  const sortedTx = [...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div className="h-100 d-flex flex-column">
      <div className="glass-card p-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold mb-1 d-flex gap-4 align-items-end">
            <span className="text-success">₹{clearedBalance} <span className="fs-6 fw-normal text-gray">Cleared</span></span>
            <span className="text-gray fw-normal fs-4">+</span>
            <span className="text-white">₹{unclearedBalance} <span className="fs-6 fw-normal text-gray">Uncleared</span></span>
            <span className="text-gray fw-normal fs-4">=</span>
            <span className="text-success" style={{textShadow:'0 0 10px rgba(16,185,129,0.5)'}}>₹{workingBalance} <span className="fs-6 fw-normal text-gray">Working Balance</span></span>
          </h2>
        </div>
        <div className="d-flex gap-2">
          <input type="text" className="form-control" placeholder="Search..." style={{width: 200}}/>
          <button className="btn btn-outline-light rounded-pill">＋ Add Account</button>
          <button className="btn btn-cyan rounded-pill">＋ Add Transaction</button>
        </div>
      </div>

      <div className="glass-card flex-grow-1 p-0 overflow-auto">
        <table className="table table-hover mb-0">
          <thead style={{position: 'sticky', top: 0, background: 'rgba(20,25,45,0.95)', zIndex: 10}}>
            <tr><th width="40"><input type="checkbox" className="form-check-input" /></th><th width="40">🚩</th><th>ACCOUNT</th><th>DATE</th><th>PAYEE</th><th>CATEGORY</th><th>MEMO</th><th className="text-end">OUTFLOW</th><th className="text-end">INFLOW</th><th className="text-center">CLEARED</th></tr>
          </thead>
          <tbody>
            {sortedTx.map(t => (
              <tr key={t.id} className="cursor-pointer">
                <td><input type="checkbox" className="form-check-input" /></td>
                <td>{t.isRegret ? '⚠️' : ''}</td>
                <td>{bankAccounts[0].name}</td>
                <td className="text-gray">{t.date}</td>
                <td className="fw-bold">{t.payee}</td>
                <td><span className="badge border border-secondary text-gray">{t.category}</span></td>
                <td className="text-gray small">{t.memo}</td>
                <td className="text-end text-danger fw-bold">{t.outflow > 0 ? `₹${t.outflow}` : ''}</td>
                <td className="text-end text-success fw-bold">{t.inflow > 0 ? `₹${t.inflow}` : ''}</td>
                <td className="text-center">{t.cleared ? <CheckCircle2 size={16} className="text-success" /> : <div className="rounded-circle border border-gray d-inline-block" style={{width:16,height:16}}></div>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TradingTab({ stocks, totalRegret, futureValue, moneyLost, transactions }) {
  const growthData = Array.from({length: 11}, (_, i) => ({
    year: `Y${i}`, value: Math.round(totalRegret * Math.pow(1.08, i))
  }));
  return (
    <div className="d-flex flex-column gap-4">
      <div className="glass-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">My Portfolio</h5>
          <button className="btn btn-sm btn-cyan rounded-pill">＋ Add Stock</button>
        </div>
        <table className="table table-hover">
          <thead><tr><th>SYMBOL</th><th>COMPANY</th><th className="text-end">BUY PRICE</th><th className="text-center">QTY</th><th className="text-end">CURRENT</th><th className="text-end">P&L</th><th className="text-end">P&L %</th><th>ACTION</th></tr></thead>
          <tbody>
            {stocks.map(s => {
              const pl = (s.currentPrice - s.buyPrice) * s.quantity;
              const plPct = (((s.currentPrice - s.buyPrice) / s.buyPrice) * 100).toFixed(2);
              const isProfit = pl >= 0;
              return (
                <tr key={s.id}>
                  <td className="fw-bold text-cyan">{s.symbol}</td>
                  <td>{s.name}</td>
                  <td className="text-end">₹{s.buyPrice}</td>
                  <td className="text-center">{s.quantity}</td>
                  <td className="text-end fw-bold">₹{s.currentPrice}</td>
                  <td className={`text-end fw-bold ${isProfit?'text-success':'text-danger'}`}>{isProfit?'+':''}₹{pl}</td>
                  <td className={`text-end fw-bold ${isProfit?'text-success':'text-danger'}`}>{isProfit?'+':''}{plPct}%</td>
                  <td><button className="btn btn-sm btn-outline-light rounded-pill px-3">Trade</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="mt-2 row">
          {stocks.map(s => {
             const plPct = (((s.currentPrice - s.buyPrice) / s.buyPrice) * 100);
             let msg = "Holding zone. Monitor for 5% movement before acting.";
             if(plPct > 15) msg = `Consider taking partial profits. You are up ${plPct.toFixed(1)}%.`;
             if(plPct < -10) msg = `Down ${Math.abs(plPct).toFixed(1)}%. Evaluate if fundamentals changed before averaging down.`;
             return <div key={s.id} className="col-4 small text-gray border-end border-secondary border-opacity-50 px-3"><span className="text-white fw-bold">{s.symbol}:</span> {msg}</div>
          })}
        </div>
      </div>

      <div className="glass-card p-4 border border-info border-opacity-50 position-relative overflow-hidden" style={{borderColor: '#a855f7 !important'}}>
        <div className="position-absolute top-0 end-0 p-4 opacity-25" style={{color: '#a855f7'}}><TrendingUp size={120} /></div>
        <h5 className="mb-4 d-flex align-items-center gap-2" style={{color: '#a855f7'}}><Brain/> What Could Your Regrets Have Built?</h5>
        <div className="row z-1 position-relative">
          <div className="col-md-5">
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
            <div className="overflow-auto" style={{maxHeight: 150}}>
              {transactions.filter(t=>t.isRegret).map(t => (
                <div key={t.id} className="small mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-white">{t.payee}</span> on {t.date} — <span className="text-danger">₹{t.amount}</span> <br/>
                  <span className="text-info">→ Would be ₹{Math.round(t.amount * Math.pow(1.08, 5))} in 5 years</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-7">
             <RechartsLineChart width={600} height={400} data={growthData} margin={{top:20, right:30, left:20, bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                <XAxis dataKey="year" stroke="#888"/>
                <YAxis stroke="#888"/>
                <Tooltip contentStyle={{background: '#1e1b4b', border: '1px solid #a855f7'}} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} activeDot={{r: 8}} name="Projected Value" />
             </RechartsLineChart>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>; }

function AddTransactionModal({ close, addTransaction, bankAccounts }) {
  const [form, setForm] = useState({ payee:'', amount:'', category:'Bills', date:'', time:'', memo:'', account: bankAccounts[0]?.name||'', cleared: true, isRegret: false, type: 'Outflow' });
  const submit = (e) => {
    e.preventDefault();
    if(!form.payee || !form.amount) return;
    const isOut = form.type === 'Outflow';
    addTransaction({
      id: Date.now(), payee: form.payee, amount: Number(form.amount), category: form.category,
      date: form.date, time: form.time, memo: form.memo, cleared: form.cleared, isRegret: form.isRegret,
      outflow: isOut ? Number(form.amount) : 0, inflow: isOut ? 0 : Number(form.amount)
    });
    close();
  };
  return (
    <div className="modal show d-block" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(5px)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-card">
          <div className="modal-header border-bottom border-secondary border-opacity-50">
            <h5 className="modal-title fw-bold">Add Transaction</h5>
            <button type="button" className="btn-close" onClick={close}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={submit}>
              <div className="mb-3 btn-group w-100" role="group">
                <input type="radio" className="btn-check" id="btnradio1" checked={form.type==='Outflow'} onChange={()=>setForm({...form, type:'Outflow'})}/>
                <label className="btn btn-outline-danger" htmlFor="btnradio1">Outflow</label>
                <input type="radio" className="btn-check" id="btnradio2" checked={form.type==='Inflow'} onChange={()=>setForm({...form, type:'Inflow'})}/>
                <label className="btn btn-outline-success" htmlFor="btnradio2">Inflow</label>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-8"><input className="form-control p-2" placeholder="Payee Name" value={form.payee} onChange={e=>setForm({...form, payee:e.target.value})} required/></div>
                <div className="col-4"><input className="form-control p-2 text-end fw-bold" type="number" placeholder="₹ Amount" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required/></div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <select className="form-select p-2" value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
                    {['Bills', 'Needs', 'Wants', 'Income'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <select className="form-select p-2" value={form.account} onChange={e=>setForm({...form, account:e.target.value})}>
                    {bankAccounts.map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6"><input type="date" className="form-control p-2" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required/></div>
                <div className="col-6"><input type="time" className="form-control p-2" value={form.time} onChange={e=>setForm({...form, time:e.target.value})} required/></div>
              </div>
              <div className="mb-3">
                <input type="text" className="form-control p-2" placeholder="Memo (optional)" value={form.memo} onChange={e=>setForm({...form, memo:e.target.value})}/>
              </div>
              <div className="d-flex justify-content-between px-2 bg-dark bg-opacity-25 p-2 rounded mb-4 border border-secondary border-opacity-25">
                <div className="form-check form-switch cursor-pointer"><input className="form-check-input" type="checkbox" id="cleared" checked={form.cleared} onChange={e=>setForm({...form, cleared: e.target.checked})}/><label className="form-check-label text-white cursor-pointer" htmlFor="cleared">Cleared</label></div>
                <div className="form-check form-switch cursor-pointer"><input className="form-check-input" type="checkbox" id="regret" checked={form.isRegret} onChange={e=>setForm({...form, isRegret: e.target.checked})}/><label className="form-check-label text-white cursor-pointer" htmlFor="regret">Mark as Regret?</label></div>
              </div>
              <button type="submit" className="btn btn-cyan w-100 rounded-pill fw-bold p-2">Save Transaction</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
