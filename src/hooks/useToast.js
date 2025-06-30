import { toast } from 'react-toastify';

// Custom hook for toast notifications
export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      icon: '✅',
      ...options
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      icon: '❌',
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    toast.warning(message, {
      icon: '⚠️',
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    toast.info(message, {
      icon: 'ℹ️',
      ...options
    });
  };

  const showLoading = (message = 'Đang xử lý...', options = {}) => {
    return toast.loading(message, {
      icon: '⏳',
      ...options
    });
  };

  const updateToast = (toastId, message, type = 'success', options = {}) => {
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      icon: iconMap[type],
      autoClose: 3000,
      ...options
    });
  };

  const dismiss = (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateToast,
    dismiss
  };
};

// Default toast functions for backward compatibility
export const showToast = {
  success: (message, options = {}) => toast.success(message, { icon: '✅', ...options }),
  error: (message, options = {}) => toast.error(message, { icon: '❌', ...options }),
  warning: (message, options = {}) => toast.warning(message, { icon: '⚠️', ...options }),
  info: (message, options = {}) => toast.info(message, { icon: 'ℹ️', ...options }),
  loading: (message = 'Đang xử lý...', options = {}) => toast.loading(message, { icon: '⏳', ...options })
};

export default useToast;
