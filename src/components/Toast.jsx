import React, { useContext } from 'react';
import { AppContext } from '../context/AppProvider';

const Toast = () => {
  const { toastMessage, isToastVisible } = useContext(AppContext);

  return (
    <div className={`toast ${isToastVisible ? 'show' : ''}`}>
      {toastMessage}
    </div>
  );
};

export default Toast;
