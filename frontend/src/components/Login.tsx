import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo">Preferio</div>
          <p className="logo-subtitle">Management System</p>
        </div>
        
        <div className="login-form-section">
          <h2 className="welcome-title">ลงชื่อเข้าใช้งาน</h2>
          <p className="welcome-subtitle">ยินดีต้อนรับกลับ! กรุณากรอกข้อมูลเข้าสู่ระบบของคุณ</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">อีเมลหรือชื่อผู้ใช้งาน</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลหรือชื่อผู้ใช้งาน"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                required
              />
            </div>
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
