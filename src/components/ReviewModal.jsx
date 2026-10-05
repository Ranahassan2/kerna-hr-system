import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const ReviewModal = ({ actionType, requestId, onClose }) => {
  const { updateRequestStatus } = useContext(AppContext);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    updateRequestStatus(requestId, actionType, note.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <div className="modal-head">
          <h3>{actionType === 'approved' ? 'قبول الطلب' : actionType === 'rejected' ? 'رفض الطلب' : 'خصم الطلب'}</h3>
          <div className="close-x" onClick={onClose}>✕</div>
        </div>
        
        <div className="field">
          <label>ملاحظة (اختياري)</label>
          <textarea rows="3" placeholder="اكتب ملاحظتك..." value={note} onChange={e => setNote(e.target.value)}></textarea>
        </div>
        
        <button 
          className={`btn btn-block ${actionType === 'approved' ? 'btn-approve' : 'btn-reject'}`} 
          onClick={handleConfirm}
        >
          {actionType === 'approved' ? 'تأكيد القبول' : actionType === 'rejected' ? 'تأكيد الرفض' : 'تأكيد الخصم'}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
