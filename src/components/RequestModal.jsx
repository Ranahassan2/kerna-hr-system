import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const RequestModal = ({ onClose, requestToEdit = null }) => {
  const { currentEmployee, addRequest, updateRequest, requests, showToast } = useContext(AppContext);
  const [pickedType, setPickedType] = useState(requestToEdit?.type || 'leave');
  const [leaveSubtype, setLeaveSubtype] = useState(requestToEdit?.subtype || 'مرضية');
  const [leaveFrom, setLeaveFrom] = useState(requestToEdit?.type === 'leave' ? requestToEdit.startDate : '');
  const [leaveTo, setLeaveTo] = useState(requestToEdit?.type === 'leave' ? requestToEdit.endDate : '');
  const [permDate, setPermDate] = useState(requestToEdit?.type === 'permission' ? requestToEdit.startDate : '');
  const [permHours, setPermHours] = useState(requestToEdit?.type === 'permission' ? requestToEdit.hours : '');
  const [lateDate, setLateDate] = useState(requestToEdit?.type === 'lateness' ? requestToEdit.startDate : '');
  const [lateHours, setLateHours] = useState(requestToEdit?.type === 'lateness' ? requestToEdit.hours : '');
  const [reqReason, setReqReason] = useState(requestToEdit?.reason || '');
  const [medReport, setMedReport] = useState(requestToEdit?.medReport || null); // base64 image
  const [errorMsg, setErrorMsg] = useState('');

  const leaveDays = leaveFrom && leaveTo
    ? Math.max(1, Math.round((new Date(leaveTo) - new Date(leaveFrom)) / 86400000))
    : 0;
  const needsMedReport = leaveSubtype === 'مرضية' && leaveDays >= 2;

  const handleMedFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMedReport(ev.target.result);
    reader.readAsDataURL(file);
  };

  const generateUid = (p) => p + Math.random().toString(36).slice(2, 9);

  const submitRequest = () => {
    let req = {
      id: requestToEdit ? requestToEdit.id : generateUid('r'),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      type: pickedType,
      status: requestToEdit ? requestToEdit.status : 'pending',
      createdAt: requestToEdit ? requestToEdit.createdAt : Date.now(),
      reviewNote: requestToEdit ? requestToEdit.reviewNote : '',
      reason: reqReason
    };

    if (pickedType === 'leave') {
      if (!leaveFrom || !leaveTo) {
        setErrorMsg('اختار تواريخ الإجازة'); return;
      }
      
      const balanceData = currentEmployee.balance || {};
      const totalAnnual = balanceData.totalAnnual ?? balanceData.annual ?? 21;
      
      const myLeaves = requests.filter(r => r.employeeId === currentEmployee.id && r.type === 'leave' && (r.status === 'approved' || r.status === 'pending'));
      
      if (leaveSubtype !== 'بدون راتب' && leaveSubtype !== 'امتحان') {
        const remainingTotal = balanceData.totalAnnual - (balanceData.casualTaken + balanceData.regularTaken + balanceData.sickTaken);
        if (leaveDays > remainingTotal) {
          setErrorMsg(`رصيدك الإجمالي المتبقي (${remainingTotal} يوم) لا يكفي لطلب ${leaveDays} أيام.`); return;
        }
      }

      if (leaveSubtype === 'عارضة') {
        const casualRemaining = Math.max(0, 6 - (balanceData.casualTaken || 0));
        if (leaveDays > casualRemaining) {
          setErrorMsg(`رصيدك المتبقي للإجازة العارضة (${casualRemaining} يوم) لا يكفي لطلب ${leaveDays} أيام.`); return;
        }
      }

      if (leaveSubtype === 'إجازة عادية') {
        const currentMonth = new Date(leaveFrom).getMonth();
        const currentPeriodStartMonth = currentMonth < 4 ? 0 : currentMonth < 8 ? 4 : 8;
        const currentPeriodEndMonth = currentPeriodStartMonth + 3;
        const currentYear = new Date(leaveFrom).getFullYear();

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

        const periodRemaining = Math.max(0, 5 - regularDaysThisPeriod);
        if (leaveDays > periodRemaining) {
          setErrorMsg(`رصيدك للفترة الحالية (كل 4 شهور) متبقي فيه ${periodRemaining} أيام فقط للاعتيادي، وأنت طلبت ${leaveDays} أيام.`); return;
        }
      }

      if (['عارضة', 'بدون راتب', 'إجازة عادية'].includes(leaveSubtype) && !reqReason.trim()) {
        setErrorMsg('يجب كتابة السبب لهذا النوع من الإجازة'); return;
      }
      if (needsMedReport && !medReport) {
        setErrorMsg('إجازة مرضية يومين أو أكتر تستلزم رفع التقرير الطبي'); return;
      }
      req.subtype = leaveSubtype;
      req.startDate = leaveFrom;
      req.endDate = leaveTo;
      if (medReport) req.medicalReport = medReport;
    } else if (pickedType === 'permission') {
      if (!permDate || !permHours) {
        setErrorMsg('يرجى استكمال بيانات الإذن (التاريخ وعدد الساعات)'); return;
      }
      req.startDate = permDate;
      req.hours = permHours;
    } else {
      if (!lateDate || !lateHours) {
        setErrorMsg('يرجى استكمال بيانات التأخير (التاريخ والمدة)'); return;
      }
      req.startDate = lateDate;
      req.hours = lateHours;
    }

    if (requestToEdit) {
      updateRequest(requestToEdit.id, req);
    } else {
      addRequest(req);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal">
        <div className="modal-head">
          <h3>{requestToEdit ? 'تعديل الطلب' : 'طلب جديد'}</h3>
          <div className="close-x" onClick={onClose}>✕</div>
        </div>

        <div className="type-picker">
          <div className={`type-pick ${pickedType === 'leave' ? 'selected' : ''}`} onClick={() => { setPickedType('leave'); setErrorMsg(''); }}>
            <span className="icon">🏖️</span><span className="label">إجازة</span>
          </div>
          <div className={`type-pick ${pickedType === 'permission' ? 'selected' : ''}`} onClick={() => { setPickedType('permission'); setErrorMsg(''); }}>
            <span className="icon">🚪</span><span className="label">إذن</span>
          </div>
          <div className={`type-pick ${pickedType === 'lateness' ? 'selected' : ''}`} onClick={() => { setPickedType('lateness'); setErrorMsg(''); }}>
            <span className="icon">⏰</span><span className="label">تأخير</span>
          </div>
        </div>

        {pickedType === 'leave' && (
          <div>
            <div className="field">
              <label>نوع الإجازة</label>
              <select value={leaveSubtype} onChange={e => setLeaveSubtype(e.target.value)}>
                <option value="مرضية">مرضية</option>
                <option value="عارضة">عارضة</option>
                <option value="إجازة عادية">إجازة عادية</option>
                <option value="بدون راتب">بدون راتب</option>
                <option value="امتحان">امتحان</option>
              </select>
            </div>
            <div className="row2">
              <div className="field"><label>من تاريخ</label><input type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} /></div>
              <div className="field"><label>إلى تاريخ</label><input type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} /></div>
            </div>
            {needsMedReport && (
              <div className="field med-report-field">
                <label style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏥 التقرير الطبي <span style={{ fontSize: '11px', color: 'var(--red)' }}>(إلزامي)</span>
                </label>
                <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                  <button className="btn btn-outline" style={{ width: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>📄</span> 
                    {medReport ? 'تم اختيار الملف بنجاح' : 'اضغط لاختيار صورة التقرير'}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMedFile}
                    style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>
                {medReport && (
                  <img
                    src={medReport}
                    alt="التقرير الطبي"
                    style={{ marginTop: '12px', maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'cover', width: '100%' }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {pickedType === 'permission' && (
          <div>
            <div className="row2">
              <div className="field"><label>التاريخ</label><input type="date" value={permDate} onChange={e => setPermDate(e.target.value)} /></div>
              <div className="field"><label>عدد الساعات</label><input type="number" min="1" max="8" placeholder="مثال: 2" value={permHours} onChange={e => setPermHours(e.target.value)} /></div>
            </div>
          </div>
        )}

        {pickedType === 'lateness' && (
          <div>
            <div className="row2">
              <div className="field"><label>التاريخ</label><input type="date" value={lateDate} onChange={e => setLateDate(e.target.value)} /></div>
              <div className="field"><label>عدد الساعات</label><input type="number" min="1" max="8" placeholder="مثال: 2" value={lateHours} onChange={e => setLateHours(e.target.value)} /></div>
            </div>
          </div>
        )}


        <div className="field">
          <label>السبب</label>
          <textarea rows="3" placeholder="اكتب السبب هنا..." value={reqReason} onChange={e => { setReqReason(e.target.value); setErrorMsg(''); }}></textarea>
        </div>

        {errorMsg && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>⚠️ {errorMsg}</div>}

        <button className="btn btn-primary btn-block" onClick={submitRequest}>{requestToEdit ? 'تحديث الطلب' : 'إرسال الطلب'}</button>
      </div>
    </div>
  );
};

export default RequestModal;
