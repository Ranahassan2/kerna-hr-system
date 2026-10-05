import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const AppContext = createContext();

const STORAGE_KEY = 'kerrnel_hr_data_v3';
const SESSION_KEY = 'zawolf_hr_session_react';

const seedEmployees = () => ([
  { id: 'e1', name: 'Ahmed Samir', dept: 'العام', email:'ahmed.samir@kerrnel.com', password:'Ahmed@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e2', name: 'Hana Sameh', dept: 'العام', email:'hana.sameh@kerrnel.com', password:'Hana@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e3', name: 'Sara Aboelanwar', dept: 'العام', email:'sara.aboelanwar@kerrnel.com', password:'Sara@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e4', name: 'Marwa Elbaz', dept: 'العام', email:'marwa.elbaz@kerrnel.com', password:'Marwa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e5', name: 'Hind Essam', dept: 'العام', email:'hind.essam@kerrnel.com', password:'Hind@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e6', name: 'Nadine Mostafa', dept: 'العام', email:'nadine.mostafa@kerrnel.com', password:'Nadine@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e7', name: 'Bassant', dept: 'العام', email:'bassant@kerrnel.com', password:'Bassant@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e8', name: 'Haydi', dept: 'العام', email:'haydi@kerrnel.com', password:'Haydi@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e9', name: 'Nada Yousef', dept: 'العام', email:'nada.yousef@kerrnel.com', password:'Nada@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e10', name: 'Aya Gamal', dept: 'العام', email:'aya.gamal@kerrnel.com', password:'Aya@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e11', name: 'Sondos', dept: 'العام', email:'sondos@kerrnel.com', password:'Sondos@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e12', name: 'Nada Nasser', dept: 'العام', email:'nada.nasser@kerrnel.com', password:'Nada@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e13', name: 'Farah Elshafy', dept: 'العام', email:'farah.elshafy@kerrnel.com', password:'Farah@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e14', name: 'Sara Ahmed', dept: 'العام', email:'sara.ahmed@kerrnel.com', password:'Sara@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e15', name: 'Rana Essam', dept: 'العام', email:'rana.essam@kerrnel.com', password:'Rana@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e16', name: 'Merna Osama', dept: 'العام', email:'merna.osama@kerrnel.com', password:'Merna@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e17', name: 'Mariam Nageeb', dept: 'العام', email:'mariam.nageeb@kerrnel.com', password:'Mariam@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e18', name: 'Reem Atta', dept: 'العام', email:'reem.atta@kerrnel.com', password:'Reem@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e19', name: 'Amal Essam', dept: 'العام', email:'amal.essam@kerrnel.com', password:'Amal@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e20', name: 'Salma Mostafa', dept: 'العام', email:'salma.mostafa@kerrnel.com', password:'Salma@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e21', name: 'Alyaa Essam', dept: 'العام', email:'alyaa.essam@kerrnel.com', password:'Alyaa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e22', name: 'Alyaa Ebrahim', dept: 'العام', email:'alyaa.ebrahim@kerrnel.com', password:'Alyaa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e23', name: 'Esraa Emad', dept: 'العام', email:'esraa.emad@kerrnel.com', password:'Esraa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e24', name: 'Rawan Nabil', dept: 'العام', email:'rawan.nabil@kerrnel.com', password:'Rawan@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e25', name: 'Nada Ehab', dept: 'العام', email:'nada.ehab@kerrnel.com', password:'Nada@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e26', name: 'Donia Hatem', dept: 'العام', email:'donia.hatem@kerrnel.com', password:'Donia@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e27', name: 'Basmala Elwakeel', dept: 'العام', email:'basmala.elwakeel@kerrnel.com', password:'Basmala@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e28', name: 'Farah Zahed', dept: 'العام', email:'farah.zahed@kerrnel.com', password:'Farah@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e29', name: 'inji Khaled', dept: 'العام', email:'inji.khaled@kerrnel.com', password:'Inji@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e30', name: 'Omar', dept: 'العام', email:'omar@kerrnel.com', password:'Omar@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e31', name: 'Mallak Hassona', dept: 'العام', email:'mallak.hassona@kerrnel.com', password:'Mallak@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e32', name: 'Tasnem', dept: 'العام', email:'tasnem@kerrnel.com', password:'Tasnem@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e33', name: 'Aya Samir', dept: 'العام', email:'aya.samir@kerrnel.com', password:'Aya@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e34', name: 'Fatma Essam', dept: 'العام', email:'fatma.essam@kerrnel.com', password:'Fatma@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e35', name: 'Khloud Zaky', dept: 'العام', email:'khloud.zaky@kerrnel.com', password:'Khloud@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e36', name: 'Semoon', dept: 'العام', email:'semoon@kerrnel.com', password:'Semoon@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e37', name: 'Nada emad', dept: 'العام', email:'nada.emad@kerrnel.com', password:'Nada@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e38', name: 'sara shrif', dept: 'العام', email:'sara.shrif@kerrnel.com', password:'Sara@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e39', name: 'Rawan yahia', dept: 'العام', email:'rawan.yahia@kerrnel.com', password:'Rawan@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e40', name: 'Shaza', dept: 'العام', email:'shaza@kerrnel.com', password:'Shaza@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e41', name: 'Malak ehab', dept: 'العام', email:'malak.ehab@kerrnel.com', password:'Malak@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e42', name: 'Mariam shaker', dept: 'العام', email:'mariam.shaker@kerrnel.com', password:'Mariam@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e43', name: 'Khaled Hosny', dept: 'العام', email:'khaled.hosny@kerrnel.com', password:'Khaled@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e44', name: 'Maya', dept: 'العام', email:'maya@kerrnel.com', password:'Maya@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e45', name: 'Hader ali', dept: 'العام', email:'hader.ali@kerrnel.com', password:'Hader@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e46', name: 'Basmalla osama', dept: 'العام', email:'basmalla.osama@kerrnel.com', password:'Basmalla@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e47', name: 'Lojain', dept: 'العام', email:'lojain@kerrnel.com', password:'Lojain@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e48', name: 'Rana ismial', dept: 'العام', email:'rana.ismial@kerrnel.com', password:'Rana@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e49', name: 'Nader', dept: 'العام', email:'nader@kerrnel.com', password:'Nader@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e50', name: 'Ahmed amer', dept: 'العام', email:'ahmed.amer@kerrnel.com', password:'Ahmed@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e51', name: 'Mariam saad', dept: 'العام', email:'mariam.saad@kerrnel.com', password:'Mariam@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e52', name: 'Rawan Swelam', dept: 'العام', email:'rawan.swelam@kerrnel.com', password:'Rawan@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e53', name: 'Mariam Waleed', dept: 'العام', email:'mariam.waleed@kerrnel.com', password:'Mariam@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e54', name: 'Zahraa', dept: 'العام', email:'zahraa@kerrnel.com', password:'Zahraa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e55', name: 'Amany Gamal', dept: 'العام', email:'amany.gamal@kerrnel.com', password:'Amany@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e56', name: 'Ismail Othman', dept: 'العام', email:'ismail.othman@kerrnel.com', password:'Ismail@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e57', name: 'Kareem', dept: 'العام', email:'kareem@kerrnel.com', password:'Kareem@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e58', name: 'Farah khaled', dept: 'العام', email:'farah.khaled@kerrnel.com', password:'Farah@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e59', name: 'Lama', dept: 'العام', email:'lama@kerrnel.com', password:'Lama@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e60', name: 'Menna Hosny', dept: 'العام', email:'menna.hosny@kerrnel.com', password:'Menna@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e61', name: 'Safaa', dept: 'العام', email:'safaa@kerrnel.com', password:'Safaa@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e62', name: 'Nada Hossam', dept: 'العام', email:'nada.hossam@kerrnel.com', password:'Nada@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e63', name: 'Rawan Tharwat', dept: 'العام', email:'rawan.tharwat@kerrnel.com', password:'Rawan@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e64', name: 'Rania Ahmed', dept: 'العام', email:'rania.ahmed@kerrnel.com', password:'Rania@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e65', name: 'Yahya', dept: 'العام', email:'yahya@kerrnel.com', password:'Yahya@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e66', name: 'Mohamed Rada', dept: 'العام', email:'mohamed.rada@kerrnel.com', password:'Mohamed@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e67', name: 'Shahd Ehab', dept: 'العام', email:'shahd.ehab@kerrnel.com', password:'Shahd@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e68', name: 'Yara Louay', dept: 'العام', email:'yara.louay@kerrnel.com', password:'Yara@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e69', name: 'Sama Ahmed', dept: 'العام', email:'sama.ahmed@kerrnel.com', password:'Sama@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
  { id: 'e70', name: 'Omar Megahd', dept: 'العام', email:'omar.megahd@kerrnel.com', password:'Omar@123', balance: { totalAnnual: 21, casualTaken: 0, regularTaken: 0, sickTaken: 0 } },
]);

const HR_CREDENTIALS = { email: 'hr@kerrnel.com', password: 'Kerrnel@2026' };

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    return savedSession ? JSON.parse(savedSession) : { role: null, employeeId: null };
  });
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    // Load Data from Supabase
    const loadData = async () => {
      try {
        const { data: empData, error: empErr } = await supabase.from('employees').select('*');
        if (empErr) throw empErr;
        
        const { data: reqData, error: reqErr } = await supabase.from('requests').select('*');
        if (reqErr) throw reqErr;
        
        // If DB is empty, use seed data (only once)
        if (!empData || empData.length === 0) {
          const seeds = seedEmployees();
          const { error: insertErr } = await supabase.from('employees').insert(seeds);
          if (insertErr) console.error("Error seeding DB", insertErr);
          setEmployees(seeds);
        } else {
          setEmployees(empData);
        }
        
        setRequests(reqData || []);
      } catch (error) {
        console.error("Error loading from Supabase:", error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    // Save session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2400);
  };

  const loginEmployee = (email, password) => {
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === password);
    if (emp) {
      setSession({ role: 'employee', employeeId: emp.id });
      return true;
    }
    return false;
  };

  const loginHr = (email, password) => {
    if (email.toLowerCase() === HR_CREDENTIALS.email && password === HR_CREDENTIALS.password) {
      setSession({ role: 'hr', employeeId: null });
      return true;
    }
    return false;
  };

  const logout = () => {
    setSession({ role: null, employeeId: null });
  };

  const currentEmployee = employees.find(e => e.id === session.employeeId);

  const addRequest = async (req) => {
    setRequests(prev => [...prev, req]);
    const { error } = await supabase.from('requests').insert([req]);
    if (error) { 
      console.error('Supabase Insert Error:', error); 
      showToast('❌ خطأ: ' + (error.message || 'حدث خطأ في قاعدة البيانات')); 
      return; 
    }
    showToast('✅ تم إرسال طلبك بنجاح');
  };

  const updateRequest = async (id, data) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    const { error } = await supabase.from('requests').update(data).eq('id', id);
    if (error) { console.error(error); showToast('❌ حدث خطأ'); return; }
    showToast('✅ تم تعديل الطلب بنجاح');
  };

  const deleteRequest = async (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) { console.error(error); showToast('❌ حدث خطأ'); return; }
    showToast('✅ تم حذف الطلب');
  };

  const addEmployee = async (emp) => {
    setEmployees(prev => [...prev, emp]);
    const { error } = await supabase.from('employees').insert([emp]);
    if (error) { console.error(error); showToast('❌ حدث خطأ'); return; }
    showToast('✅ تم إضافة الموظف');
  };

  const bulkAddEmployees = async (newEmployees) => {
    setEmployees(prev => [...prev, ...newEmployees]);
    const { error } = await supabase.from('employees').insert(newEmployees);
    if (error) { console.error(error); showToast('❌ حدث خطأ أثناء إضافة الموظفين'); return; }
    showToast(`✅ تم رفع ${newEmployees.length} موظف بنجاح`);
  };

  const updateEmployee = async (id, updatedData) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updatedData } : e));
    const { error } = await supabase.from('employees').update(updatedData).eq('id', id);
    if (error) { console.error(error); showToast('❌ حدث خطأ'); return; }
    showToast('✅ تم تحديث بيانات الموظف');
  };

  const deleteEmployee = async (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) { console.error(error); showToast('❌ حدث خطأ'); return; }
    showToast('✅ تم حذف الموظف بنجاح');
  };

  const updateRequestStatus = async (id, status, note = '') => {
    let empToUpdate = null;
    let empBalance = null;

    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, status, reviewNote: note };
        // Deduct balance if approved leave
        if (status === 'approved' && updated.type === 'leave') {
          const days = Math.max(1, Math.round((new Date(updated.endDate) - new Date(updated.startDate)) / 86400000));
          empToUpdate = employees.find(e => e.id === updated.employeeId);
          if (empToUpdate) {
            empBalance = { ...empToUpdate.balance };
            if (updated.subtype === 'عارضة') empBalance.casualTaken = (empBalance.casualTaken || 0) + days;
            else if (updated.subtype === 'إجازة عادية') empBalance.regularTaken = (empBalance.regularTaken || 0) + days;
            else if (updated.subtype === 'مرضية') empBalance.sickTaken = (empBalance.sickTaken || 0) + days;
            
            setEmployees(empPrev => empPrev.map(e => e.id === empToUpdate.id ? { ...e, balance: empBalance } : e));
          }
        }
        return updated;
      }
      return r;
    }));

    // Update Request in DB
    await supabase.from('requests').update({ status, reviewNote: note }).eq('id', id);
    
    // Update Employee Balance in DB if changed
    if (empToUpdate && empBalance) {
      await supabase.from('employees').update({ balance: empBalance }).eq('id', empToUpdate.id);
    }

    let toastMsg = '✅ تم قبول الطلب';
    if (status === 'rejected') toastMsg = '🚫 تم رفض الطلب';
    else if (status === 'deducted') toastMsg = '⚠️ تم خصم الطلب';
    
    showToast(toastMsg);
  };

  return (
    <AppContext.Provider value={{
      employees, requests, session, currentEmployee,
      loginEmployee, loginHr, logout, addRequest,
      updateRequest,
      deleteRequest,
      addEmployee,
      bulkAddEmployees,
      updateEmployee,
      deleteEmployee,
      updateRequestStatus,
      toastMessage, isToastVisible, showToast
    }}>
      {children}
      <div className={`toast ${isToastVisible ? 'show' : ''}`} style={{ fontSize: '15px', fontWeight: 'bold' }}>
        {toastMessage}
      </div>
    </AppContext.Provider>
  );
};
