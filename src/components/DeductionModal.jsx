import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const DeductionModal = ({ employeeId, onClose }) => {
  const { addRequest, employees } = useContext(AppContext);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('1'); // Could be days or just a value

  const employee = employees.find(e => e.id === employeeId);

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert('الرجاء إدخال سبب الخصم');
      return;
    }
    const newReq = {
      id: 'r' + Math.random().toString(36).slice(2, 9),
      employeeId,
      employeeName: employee ? employee.name : 'مجهول',
      type: 'deduction',
      status: 'approved', // Auto approved since HR made it
      reason: reason.trim(),
      hours: amount, // Use 'hours' column to store the amount to avoid db schema errors
      createdAt: Date.now(),
      startDate: new Date().toISOString().slice(0, 10),
    };
    addRequest(newReq);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <div className="modal-head">
          <h3>تطبيق خصم على الموظف</h3>
          <div className="close-x" onClick={onClose}>✕</div>
        </div>
        
        <div className="field">
          <label>مقدار الخصم (أيام/ساعات)</label>
          <input type="text" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>

        <div className="field">
          <label>سبب الخصم</label>
          <textarea rows="3" placeholder="اكتب السبب..." value={reason} onChange={e => setReason(e.target.value)}></textarea>
        </div>
        
        <button 
          className="btn btn-block btn-reject" 
          onClick={handleConfirm}
        >
          تأكيد الخصم
        </button>
      </div>
    </div>
  );
};

export default DeductionModal;
