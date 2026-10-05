import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const AddEmployeeModal = ({ onClose, employeeToEdit = null }) => {
  const { addEmployee, updateEmployee, employees } = useContext(AppContext);
  const [name, setName] = useState(employeeToEdit?.name || '');
  const [dept, setDept] = useState(employeeToEdit?.dept || '');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [password, setPassword] = useState(employeeToEdit?.password || '');
  
  const initialBalance = employeeToEdit?.balance || { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 };
  const [totalAnnual, setTotalAnnual] = useState(initialBalance.totalAnnual ?? initialBalance.annual ?? 21);
  const [casualTaken, setCasualTaken] = useState(initialBalance.casualTaken || 0);
  const [regularTaken, setRegularTaken] = useState(initialBalance.regularTaken || 0);
  const [sickTaken, setSickTaken] = useState(initialBalance.sickTaken || 0);

  const generateUid = (p) => p + Math.random().toString(36).slice(2, 9);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedDept = dept.trim() || 'غير محدد';
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedName) { alert('اكتب اسم الموظف'); return; }
    if (!trimmedEmail || !password.trim()) { alert('لازم إيميل وكلمة مرور للموظف'); return; }
    if (employees.some(e => e.email && e.email.toLowerCase() === trimmedEmail && e.id !== employeeToEdit?.id)) { alert('الإيميل ده متسجل قبل كده'); return; }

    const employeeData = {
      name: trimmedName,
      dept: trimmedDept,
      email: trimmedEmail,
      password: password.trim(),
      balance: { totalAnnual, casualTaken, regularTaken, sickTaken }
    };

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, employeeData);
    } else {
      employeeData.id = generateUid('e');
      addEmployee(employeeData);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <div className="modal-head">
          <h3>{employeeToEdit ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h3>
          <div className="close-x" onClick={onClose}>✕</div>
        </div>
        
        <div className="field">
          <label>الاسم</label>
          <input type="text" placeholder="اسم الموظف" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>القسم</label>
          <input type="text" placeholder="مثال: التسويق" value={dept} onChange={e => setDept(e.target.value)} />
        </div>
        <div className="field">
          <label>البريد الإلكتروني</label>
          <input type="email" placeholder="name@kerrnel.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>كلمة المرور</label>
          <input type="text" placeholder="كلمة مرور مبدئية" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="row2">
          <div className="field"><label>الرصيد الكلي (سنوي)</label><input type="number" value={totalAnnual} onChange={e => setTotalAnnual(Number(e.target.value))} /></div>
          <div className="field"><label>المستهلك عارضة</label><input type="number" value={casualTaken} onChange={e => setCasualTaken(Number(e.target.value))} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>المستهلك اعتيادي</label><input type="number" value={regularTaken} onChange={e => setRegularTaken(Number(e.target.value))} /></div>
          <div className="field"><label>المستهلك مرضي</label><input type="number" value={sickTaken} onChange={e => setSickTaken(Number(e.target.value))} /></div>
        </div>
        
        <button className="btn btn-primary btn-block" onClick={handleSave}>{employeeToEdit ? 'حفظ التعديلات' : 'إضافة'}</button>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
