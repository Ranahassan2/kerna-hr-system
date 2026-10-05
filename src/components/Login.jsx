import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const Login = () => {
  const { loginEmployee, loginHr } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = () => {
    setError(false);
    // Try HR first
    if (loginHr(email, password)) {
      return;
    }
    // Try Employee
    if (loginEmployee(email, password)) {
      return;
    }
    setError(true);
  };

  return (
    <div className="login-wrap">
      <div className="panel login-card">
        <div className="login-mark">K</div>
        <h1>عقل الشركة الرقمي</h1>
        <p>نظام إدارة الإجازات والأذونات والتأخير — Kerrnel</p>

        <div className="field">
          <label>البريد الإلكتروني</label>
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label>كلمة المرور</label>
          <div className="pwd-wrap">
            <input 
              type={showPwd ? "text" : "password"} 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <span className="pwd-eye" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        
        {error && (
          <p style={{ color: 'var(--red)', fontSize: '12px', margin: '-8px 0 14px' }}>
            البريد أو كلمة المرور غلط
          </p>
        )}

        <button className="btn btn-primary btn-block" onClick={handleLogin}>
          دخول
        </button>

      </div>
    </div>
  );
};

export default Login;
