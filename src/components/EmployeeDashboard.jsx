import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppProvider';
import RequestModal from './RequestModal';

const EmployeeDashboard = () => {
  const { currentEmployee, logout, requests, deleteRequest } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState(null);

  if (!currentEmployee) return null;

  const getInitials = (name) => name.trim().split(' ').slice(0, 2).map(w => w[0]).join('');
  
  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });
  };

  const myRequests = requests.filter(r => r.employeeId === currentEmployee.id).sort((a, b) => b.createdAt - a.createdAt);

  const getRingGradient = (pct, color) => `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`;

  const currentMonth = new Date().getMonth();
  const currentPeriodStartMonth = currentMonth < 4 ? 0 : currentMonth < 8 ? 4 : 8;
  const currentPeriodEndMonth = currentPeriodStartMonth + 3;
  const currentYear = new Date().getFullYear();

  const regularDaysThisPeriod = requests.filter(r => 
    r.employeeId === currentEmployee.id && 
    r.type === 'leave' && 
    r.subtype === 'إجازة عادية' && 
    (r.status === 'approved' || r.status === 'pending')
  ).reduce((total, r) => {
    const d = new Date(r.startDate);
    if (d.getFullYear() === currentYear && d.getMonth() >= currentPeriodStartMonth && d.getMonth() <= currentPeriodEndMonth) {
      const days = Math.max(1, Math.round((new Date(r.endDate) - d) / 86400000));
      return total + days;
    }
    return total;
  }, 0);

  const balanceData = currentEmployee.balance || {};
  const totalAnnual = balanceData.totalAnnual ?? balanceData.annual ?? 21;

  // Calculate dynamically including pending requests so the UI updates immediately
  const myLeaves = requests.filter(r => r.employeeId === currentEmployee.id && r.type === 'leave' && (r.status === 'approved' || r.status === 'pending'));
  const calcDays = (r) => Math.max(1, Math.round((new Date(r.endDate) - new Date(r.startDate)) / 86400000));
  
  const casualTaken = myLeaves.filter(r => r.subtype === 'عارضة').reduce((acc, r) => acc + calcDays(r), 0);
  const sickTaken = myLeaves.filter(r => r.subtype === 'مرضية').reduce((acc, r) => acc + calcDays(r), 0);
  const regularTaken = myLeaves.filter(r => r.subtype === 'إجازة عادية').reduce((acc, r) => acc + calcDays(r), 0);

  const totalTaken = casualTaken + regularTaken + sickTaken;
  
  const remainingTotal = Math.max(0, totalAnnual - totalTaken);
  const casualRemaining = Math.max(0, 6 - casualTaken);
  const regularRemaining = Math.max(0, 15 - (regularTaken + sickTaken));

  const balances = [
    { key: 'annual', label: 'إجمالي الرصيد (كلي)', total: totalAnnual, remain: remainingTotal, color: 'var(--cyan)' },
    { key: 'casual', label: 'رصيد العارضة', total: 6, remain: casualRemaining, color: 'var(--gold)' },
    { key: 'regular', label: 'رصيد الاعتيادي والمرضي', total: 15, remain: regularRemaining, color: 'var(--purple)' },
  ];

  return (
    <div className="app active">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div className="brand-text"><b>Kerrnel</b><span>بوابة الموظف</span></div>
        </div>
        <div className="topbar-right">
          <div className="user-chip">
            <div className="avatar">{getInitials(currentEmployee.name)}</div>
            <span>{currentEmployee.name}</span>
          </div>
          <button className="btn-ghost" onClick={logout}>خروج</button>
        </div>
      </div>

      <div className="shell">
        <div className="section-head">
          <div>
            <div className="eyebrow">رصيدك الحالي</div>
            <h2>أهلاً بيك، {currentEmployee.name.split(' ')[0]} 👋</h2>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ طلب جديد</button>
        </div>

        <div className="balance-grid">
          {balances.map(b => {
            const pct = Math.max(0, Math.min(100, Math.round((b.remain / b.total) * 100)));
            return (
              <div key={b.key} className="panel ring-card">
                <div className="ring" style={{ background: getRingGradient(pct, b.color) }}>
                  <b>{b.remain}</b>
                </div>
                <div className="ring-info">
                  <b>{b.label}</b>
                  <span>من أصل {b.total} يوم متاحة</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-head">
          <div><div className="eyebrow">سجل الطلبات</div><h2>طلباتي</h2></div>
        </div>
        
        <div className="panel table-wrap">
          {myRequests.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🗂️</div>لسه معملتش أي طلب — دوس على "طلب جديد" فوق
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="req-table">
              <thead>
                <tr>
                  <th>النوع</th><th>التفاصيل</th><th>السبب</th><th>الحالة</th><th>ملاحظة HR</th><th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(r => (
                  <tr key={r.id}>
                    <td>
                      <span className={`type-badge type-${r.type}`}>
                        {r.type === 'leave' ? '🏖️' : r.type === 'permission' ? '🚪' : r.type === 'deduction' ? '⚠️' : '⏰'} 
                        {r.type === 'leave' ? 'إجازة' : r.type === 'permission' ? 'إذن' : r.type === 'deduction' ? 'خصم إداري' : 'تأخير'}
                      </span>
                    </td>
                    <td>
                      {r.type === 'leave' && `${r.subtype} • ${formatDate(r.startDate)} → ${formatDate(r.endDate)}`}
                      {r.type === 'permission' && `${formatDate(r.startDate)} • ${r.hours} ساعة`}
                      {r.type === 'lateness' && `${formatDate(r.startDate)} • ${r.minutes} دقيقة`}
                      {r.type === 'deduction' && `${formatDate(r.startDate)} • ${r.hours} (مقدار الخصم)`}
                    </td>
                    <td style={{ color: 'var(--text-dim)', maxWidth: '220px' }}>{r.reason || '—'}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        <span className="status-dot"></span>
                        {r.status === 'pending' ? 'قيد الانتظار' : r.status === 'approved' ? 'موافق عليها' : r.status === 'deducted' ? 'تم الخصم' : 'مرفوضة'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{r.reviewNote || '—'}</td>
                    <td>
                      {r.status === 'pending' && (
                        <div className="row-actions">
                          <button className="btn btn-sm" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)', padding: '4px 8px', fontSize: '11px' }} onClick={() => { setRequestToEdit(r); setIsModalOpen(true); }}>تعديل</button>
                          <button className="btn btn-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)', padding: '4px 8px', fontSize: '11px' }} onClick={() => { if(window.confirm('متأكد من حذف الطلب ده؟')) deleteRequest(r.id); }}>حذف</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && <RequestModal requestToEdit={requestToEdit} onClose={() => { setIsModalOpen(false); setRequestToEdit(null); }} />}
    </div>
  );
};

export default EmployeeDashboard;
