import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const showToast = {
    success: (message) => {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
      });
    },
    error: (message) => {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
      });
    },
    loading: (message) => {
      return toast.loading(message, {
        position: 'top-right',
      });
    },
    promise: (promise, messages) => {
      return toast.promise(
        promise,
        {
          loading: messages.loading || 'Loading...',
          success: messages.success || 'Success!',
          error: messages.error || 'Something went wrong',
        },
        {
          position: 'top-right',
        }
      );
    },
    dismiss: (toastId) => {
      toast.dismiss(toastId);
    },
  };

  return (
    <ToastContext.Provider value={showToast}>
      <Toaster
        toastOptions={{
          className: '',
          style: {
            padding: '16px',
            color: '#363636',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </ToastContext.Provider>
  );
};
