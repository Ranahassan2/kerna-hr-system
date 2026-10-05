import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppProvider';
import AddEmployeeModal from './AddEmployeeModal';
import ReviewModal from './ReviewModal';
import DeductionModal from './DeductionModal';

const HrDashboard = () => {
  const { employees, requests, logout, deleteEmployee, deleteRequest, bulkAddEmployees, showToast } = useContext(AppContext);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToDeduct, setEmployeeToDeduct] = useState(null);
  const [reviewData, setReviewData] = useState(null); // { id, action }
  const monthInputRef = useRef(null);
  const fileUploadRef = useRef(null);
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchEmp, setSearchEmp] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const selectedYear = parseInt(selectedMonth.split('-')[0]);
  const selectedMonthNum = parseInt(selectedMonth.split('-')[1]) - 1;

  const isRequestInSelectedMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonthNum;
  };

  const getInitials = (name) => name.trim().split(' ').slice(0, 2).map(w => w[0]).join('');
  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' });
  };

  const today = new Date().toISOString().slice(0, 10);
  
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedThisMonth = requests.filter(r => r.status === 'approved' && isRequestInSelectedMonth(r.createdAt)).length;
  const leavesThisMonthCount = requests.filter(r => r.type === 'leave' && r.status === 'approved' && isRequestInSelectedMonth(r.startDate)).length;
  const latenessThisMonthCount = requests.filter(r => r.type === 'lateness' && isRequestInSelectedMonth(r.startDate)).length;
  const deductionThisMonthCount = requests.filter(r => (r.type === 'deduction' || r.status === 'deducted') && isRequestInSelectedMonth(r.startDate || r.createdAt)).length;

  const totalEmps = employees.length || 1;
  const onLeaveEmps = employees.filter(e => requests.some(r => r.employeeId === e.id && r.type === 'leave' && r.status === 'approved' && r.startDate <= today && r.endDate >= today)).length;
  const lateEmps = employees.filter(e => requests.some(r => r.employeeId === e.id && r.type === 'lateness' && r.startDate === today)).length;
  const pendingTodayEmps = employees.filter(e => requests.some(r => r.employeeId === e.id && r.status === 'pending')).length;
  const presentEmps = Math.max(0, totalEmps - onLeaveEmps - lateEmps);
  const pulsePct = Math.round((presentEmps / totalEmps) * 100);

  const pulseSegments = [
    { val: presentEmps, color: '#22d3ee', label: 'حاضرين' },
    { val: onLeaveEmps, color: '#a855f7', label: 'في إجازة' },
    { val: lateEmps, color: '#f5c518', label: 'متأخرين' },
    { val: pendingTodayEmps, color: '#5a6482', label: 'طلبات معلقة' },
  ];
  
  const circumference = 2 * Math.PI * 82;
  let offset = 0;
  const svgParts = pulseSegments.map(s => {
    const frac = s.val / totalEmps;
    const len = frac * circumference;
    const dash = `${len} ${circumference - len}`;
    const el = <circle key={s.label} cx="100" cy="100" r="82" fill="none" stroke={s.color} strokeWidth="16" strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="round" />;
    offset += len;
    return el;
  });

  const pendingRequests = requests.filter(r => r.status === 'pending').slice(0, 5);

  let filteredRequests = [...requests].sort((a, b) => b.createdAt - a.createdAt)
    .filter(r => isRequestInSelectedMonth(r.startDate || r.createdAt)); // filter by month

  if (filterStatus !== 'all') filteredRequests = filteredRequests.filter(r => r.status === filterStatus);
  if (filterType !== 'all') filteredRequests = filteredRequests.filter(r => r.type === filterType);
  if (filterEmployee !== 'all') filteredRequests = filteredRequests.filter(r => r.employeeId === filterEmployee);
  if (filterDate) {
    filteredRequests = filteredRequests.filter(r => {
      const d = new Date(r.startDate || r.createdAt);
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return localDate === filterDate;
    });
  }

  const exportEmployeesExcel = () => {
    const headers = ['الموظف', 'القسم', 'المتبقي الكلي', 'إجمالي الإجازات', 'مرات الخصم بالشهر', 'ساعات التأخير بالشهر'];
    const rows = employees.map(e => {
      const balanceData = e.balance || {};
      const totalAnnual = balanceData.totalAnnual ?? balanceData.annual ?? 21;
      const totalTaken = (balanceData.casualTaken || 0) + (balanceData.regularTaken || 0) + (balanceData.sickTaken || 0);
      const remainingTotal = Math.max(0, totalAnnual - totalTaken);
      
      const empLateness = requests.filter(r => r.employeeId === e.id && r.type === 'lateness' && isRequestInSelectedMonth(r.startDate));
      const totalLateHours = empLateness.reduce((acc, curr) => acc + (parseInt(curr.hours) || 0), 0);
      const empDeductions = requests.filter(r => r.employeeId === e.id && (r.type === 'deduction' || r.status === 'deducted') && isRequestInSelectedMonth(r.startDate || r.createdAt));
      
      return [e.name, e.dept || 'العام', remainingTotal, totalAnnual, empDeductions.length, totalLateHours];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length <= 1) {
        showToast('❌ الملف فارغ أو لا يحتوي على بيانات');
        return;
      }
      
      const newEmps = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2 && cols[0]) { 
          const emp = {
            id: 'e' + Date.now() + Math.random().toString(36).substring(2, 9),
            name: cols[0],
            dept: cols[1] || 'العام',
            email: cols[2] || `${cols[0].replace(/\s+/g, '').toLowerCase()}@kerrnel.com`,
            password: cols[3] || '123456',
            balance: {
              totalAnnual: parseInt(cols[4]) || 21,
              casualTaken: 0, regularTaken: 0, sickTaken: 0
            }
          };
          newEmps.push(emp);
        }
      }
      
      if (newEmps.length > 0) {
        bulkAddEmployees(newEmps);
      } else {
        showToast('❌ لم يتم العثور على بيانات صالحة');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <div className="app active">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">K</div>
          <div className="brand-text"><b>Kerrnel</b><span>لوحة HR والمدير</span></div>
        </div>
        <div className="topbar-right">
          <div className="user-chip"><div className="avatar">HR</div><span>لوحة التحكم</span></div>
          <button className="btn-ghost" onClick={logout}>خروج</button>
        </div>
      </div>

      {!isEmployeesModalOpen ? (
        <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow">نظرة عامة</div><h2>مؤشرات الشهر</h2></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn" style={{ background: 'var(--purple)', color: 'white', padding: '10px 16px', fontSize: '15px', fontWeight: 'bold', border: '1px solid var(--purple-dim)' }} onClick={() => setIsEmployeesModalOpen(true)}>
              👥 الموظفين وأرصدتهم
            </button>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--cyan-dim)', padding: '6px 16px', borderRadius: '12px', border: '1px solid var(--cyan)', boxShadow: '0 4px 12px rgba(34, 211, 238, 0.15)', cursor: 'pointer' }}
              onClick={() => { if(monthInputRef.current && monthInputRef.current.showPicker) monthInputRef.current.showPicker(); }}
            >
              <span style={{ fontSize: '15px', color: 'var(--cyan)', fontWeight: 'bold' }}>🗓️ فلتر الشهر:</span>
              <input ref={monthInputRef} type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ padding: '6px 0', border: 'none', background: 'transparent', color: 'white', outline: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }} />
            </div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="panel stat-card">
            <div className="top"><div className="stat-icon" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>⏳</div></div>
            <div className="stat-val" style={{ color: 'var(--gold)' }}>{pendingCount}</div>
            <div className="stat-label">طلبات قيد الانتظار</div>
          </div>
          <div className="panel stat-card">
            <div className="top"><div className="stat-icon" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>✅</div></div>
            <div className="stat-val" style={{ color: 'var(--cyan)' }}>{approvedThisMonth}</div>
            <div className="stat-label">موافق عليها هذا الشهر</div>
          </div>
          <div className="panel stat-card">
            <div className="top"><div className="stat-icon" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>🏖️</div></div>
            <div className="stat-val" style={{ color: 'var(--purple)' }}>{leavesThisMonthCount}</div>
            <div className="stat-label">إجازات هذا الشهر</div>
          </div>
          <div className="panel stat-card">
            <div className="top"><div className="stat-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>⏰</div></div>
            <div className="stat-val" style={{ color: 'var(--red)' }}>{latenessThisMonthCount}</div>
            <div className="stat-label">تأخيرات هذا الشهر</div>
          </div>
          <div className="panel stat-card">
            <div className="top"><div className="stat-icon" style={{ background: 'rgba(255,87,87,0.15)', color: 'var(--red)' }}>⚠️</div></div>
            <div className="stat-val" style={{ color: 'var(--red)' }}>{deductionThisMonthCount}</div>
            <div className="stat-label">خصومات هذا الشهر</div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="panel pulse-card">
            <h3 style={{ fontSize: '14.5px', fontWeight: '700', alignSelf: 'flex-start' }}>نبض الفريق اليوم</h3>
            <div className="pulse-ring-wrap">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                {svgParts}
              </svg>
              <div className="pulse-center"><b>{pulsePct}%</b><span>حاضرين اليوم</span></div>
            </div>
            <div className="pulse-legend">
              {pulseSegments.map(s => (
                <div key={s.label}><span className="sw" style={{ background: s.color }}></span>{s.label} ({s.val})</div>
              ))}
            </div>
          </div>

          <div className="panel side-list">
            <h3>📋 طلبات بانتظار موافقتك</h3>
            <div>
              {pendingRequests.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}><div className="icon">✨</div>مفيش طلبات معلقة دلوقتي</div>
              ) : (
                pendingRequests.map(r => (
                  <div key={r.id} className="side-item">
                    <div className="emp-cell" style={{ flex: 1 }}>
                      <div className="avatar">{getInitials(r.employeeName)}</div>
                      <div>
                        <b style={{ fontSize: '13px' }}>{r.employeeName}</b><br/>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                          {r.type === 'leave' ? 'إجازة' : r.type === 'permission' ? 'إذن' : 'تأخير'} • 
                          {r.type === 'leave' && `${r.subtype} • ${formatDate(r.startDate)}`}
                          {r.type === 'permission' && `${formatDate(r.startDate)} • ${r.hours} ساعة`}
                          {r.type === 'lateness' && `${formatDate(r.startDate)} • ${r.hours} ساعة`}
                        </span>
                      </div>
                    </div>
                    <div className="row-actions">
                      <button className="btn btn-approve btn-sm" onClick={() => setReviewData({ id: r.id, action: 'approved' })}>قبول</button>
                      <button className="btn btn-reject btn-sm" onClick={() => setReviewData({ id: r.id, action: 'rejected' })}>رفض</button>
                      <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white' }} onClick={() => setReviewData({ id: r.id, action: 'deducted' })}>خصم</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="section-head">
          <div><div className="eyebrow">إدارة الطلبات</div><h2>كل الطلبات</h2></div>
        </div>
        
        <div className="panel table-wrap">
          <div className="table-toolbar">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="approved">موافق عليها</option>
              <option value="rejected">مرفوضة</option>
              <option value="deducted">مخصومة</option>
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">كل الأنواع</option>
              <option value="leave">إجازة</option>
              <option value="permission">إذن</option>
              <option value="lateness">تأخير</option>
              <option value="deduction">خصم إداري</option>
            </select>
            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="all">كل الموظفين</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px 12px', fontSize: '13px', width: 'auto', borderRadius: '11px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text)', outline: 'none' }} />
            {filterDate && <button className="btn btn-sm" style={{ background: 'var(--glass)', color: 'var(--text)', border: '1px solid var(--glass-border)' }} onClick={() => setFilterDate('')}>إلغاء</button>}
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="empty-state"><div className="icon">🔍</div>مفيش طلبات مطابقة للفلتر ده</div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="req-table">
              <thead>
                <tr>
                  <th>الموظف</th><th>النوع</th><th>التفاصيل</th><th>السبب</th><th>تقرير طبي</th><th>الحالة</th><th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => (
                  <tr key={r.id}>
                    <td><div className="emp-cell"><div className="avatar">{getInitials(r.employeeName)}</div>{r.employeeName}</div></td>
                    <td>
                      <span className={`type-badge type-${r.type}`}>
                        {r.type === 'leave' ? '🏖️' : r.type === 'permission' ? '🚪' : r.type === 'deduction' ? '⚠️' : '⏰'} 
                        {r.type === 'leave' ? 'إجازة' : r.type === 'permission' ? 'إذن' : r.type === 'deduction' ? 'خصم إداري' : 'تأخير'}
                      </span>
                    </td>
                    <td>
                      {r.type === 'leave' && `${r.subtype} • ${formatDate(r.startDate)} → ${formatDate(r.endDate)}`}
                      {r.type === 'permission' && `${formatDate(r.startDate)} • ${r.hours} ساعة`}
                      {r.type === 'lateness' && `${formatDate(r.startDate)} • ${r.hours} ساعة`}
                      {r.type === 'deduction' && `${formatDate(r.startDate)} • ${r.hours} (مقدار الخصم)`}
                    </td>
                    <td style={{ color: 'var(--text-dim)', maxWidth: '200px' }}>{r.reason || '—'}</td>
                    <td>
                      {r.medicalReport ? (
                        <a href={r.medicalReport} target="_blank" rel="noreferrer" title="عرض التقرير الطبي">
                          <img
                            src={r.medicalReport}
                            alt="تقرير طبي"
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--cyan)', cursor: 'pointer' }}
                          />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        <span className="status-dot"></span>
                        {r.status === 'pending' ? 'قيد الانتظار' : r.status === 'approved' ? 'موافق عليها' : r.status === 'deducted' ? 'تم الخصم' : 'مرفوضة'}
                      </span>
                    </td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className="row-actions">
                          <button className="btn btn-approve btn-sm" onClick={() => setReviewData({ id: r.id, action: 'approved' })}>قبول</button>
                          <button className="btn btn-reject btn-sm" onClick={() => setReviewData({ id: r.id, action: 'rejected' })}>رفض</button>
                          <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white' }} onClick={() => setReviewData({ id: r.id, action: 'deducted' })}>خصم</button>
                          <button className="btn btn-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)' }} onClick={() => { if(window.confirm('متأكد إنك عايز تحذف الطلب ده نهائياً؟')) deleteRequest(r.id); }}>حذف</button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <span style={{ color: 'var(--text-faint)', fontSize: '12px' }}>{r.reviewNote || 'تمت المراجعة'}</span>
                          <button className="btn btn-sm" style={{ background: 'transparent', color: 'var(--red)', border: '1px solid var(--red-dim)' }} onClick={() => { if(window.confirm('متأكد إنك عايز تحذف الطلب ده نهائياً؟')) deleteRequest(r.id); }}>حذف</button>
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
      ) : (
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">إدارة الفريق</div><h2>الموظفين وأرصدتهم</h2></div>
            <button className="btn" style={{ background: 'var(--purple-dim)', border: '1px solid var(--purple)', color: 'var(--text)', fontSize: '15px', padding: '10px 20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)' }} onClick={() => setIsEmployeesModalOpen(false)}>
              ← رجوع للوحة التحكم
            </button>
          </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', justifyContent: 'space-between' }}>
                <input type="text" placeholder="ابحث باسم الموظف..." value={searchEmp} onChange={e => setSearchEmp(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--purple)', background: 'var(--purple-dim)', color: 'white', outline: 'none', width: '300px' }} />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="file" accept=".csv" style={{ display: 'none' }} ref={fileUploadRef} onChange={handleFileUpload} />
                  <button className="btn" style={{ padding: '10px 20px', fontSize: '14.5px', background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)', fontWeight: 'bold' }} onClick={() => fileUploadRef.current?.click()}>
                    📥 رفع شيت موظفين
                  </button>
                  <button className="btn" style={{ padding: '10px 20px', fontSize: '14.5px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid #22c55e', fontWeight: 'bold' }} onClick={exportEmployeesExcel}>
                    📊 تحميل كـ Excel
                  </button>
                  <button className="btn" style={{ padding: '10px 20px', fontSize: '14.5px', background: 'var(--cyan-dim)', color: 'var(--cyan)', border: '1px solid var(--cyan)' }} onClick={() => setIsAddEmpOpen(true)}>+ إضافة موظف</button>
                </div>
              </div>
              
              <div className="panel table-wrap" style={{ margin: 0 }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="req-table">
                  <thead>
                    <tr>
                      <th>الموظف</th><th>القسم</th><th>المتبقي الكلي</th><th>خصومات ({selectedMonth})</th><th>تأخيرات ({selectedMonth})</th><th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
              {employees.filter(e => e.name.toLowerCase().includes(searchEmp.toLowerCase())).map(e => {
                const balanceData = e.balance || {};
                const totalAnnual = balanceData.totalAnnual ?? balanceData.annual ?? 21;
                const casualTaken = balanceData.casualTaken || 0;
                const regularTaken = balanceData.regularTaken || 0;
                const sickTaken = balanceData.sickTaken || 0;
                
                const totalTaken = casualTaken + regularTaken + sickTaken;
                const remainingTotal = Math.max(0, totalAnnual - totalTaken);

                // Month specific data for payroll
                const empLatenessThisMonth = requests.filter(r => r.employeeId === e.id && r.type === 'lateness' && isRequestInSelectedMonth(r.startDate));
                const totalLateHours = empLatenessThisMonth.reduce((acc, curr) => acc + (parseInt(curr.hours) || 0), 0);
                
                const empDeductionsThisMonth = requests.filter(r => r.employeeId === e.id && (r.type === 'deduction' || r.status === 'deducted') && isRequestInSelectedMonth(r.startDate || r.createdAt));
                const totalDeductedDaysOrHours = empDeductionsThisMonth.length; // Could be sum of hours/days if needed, but for now it's count

                return (
                  <tr key={e.id}>
                    <td><div className="emp-cell"><div className="avatar">{getInitials(e.name)}</div>{e.name}</div></td>
                    <td style={{ color: 'var(--text-dim)' }}>{e.dept}</td>
                    <td>{remainingTotal} <span style={{fontSize: '11px', color: 'var(--text-dim)'}}>/ {totalAnnual}</span></td>
                    <td style={{ color: totalDeductedDaysOrHours > 0 ? 'var(--red)' : 'var(--text-dim)' }}>{totalDeductedDaysOrHours > 0 ? `${totalDeductedDaysOrHours} مرات` : '—'}</td>
                    <td style={{ color: totalLateHours > 0 ? 'var(--gold)' : 'var(--text-dim)' }}>{totalLateHours > 0 ? `${totalLateHours} ساعة (${empLatenessThisMonth.length} مرات)` : '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm" style={{ background: 'var(--red)', color: 'white' }} onClick={() => setEmployeeToDeduct(e)}>خصم</button>
                        <button className="btn btn-sm" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }} onClick={() => setEmployeeToEdit(e)}>تعديل</button>
                        <button className="btn btn-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)' }} onClick={() => { if(window.confirm('متأكد من حذف الموظف ده؟')) deleteEmployee(e.id); }}>حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
        </div>
      )}

      {(isAddEmpOpen || employeeToEdit) && <AddEmployeeModal employeeToEdit={employeeToEdit} onClose={() => { setIsAddEmpOpen(false); setEmployeeToEdit(null); }} />}
      {employeeToDeduct && <DeductionModal employeeId={employeeToDeduct.id} onClose={() => setEmployeeToDeduct(null)} />}
      {reviewData && <ReviewModal actionType={reviewData.action} requestId={reviewData.id} onClose={() => setReviewData(null)} />}
    </div>
  );
};

export default HrDashboard;
