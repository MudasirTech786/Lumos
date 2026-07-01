'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import progressToast from '@/lib/progressToast';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    variant: 'danger',
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    loading: false,
    errorMessage: '',
  });

  const actionRef = useRef(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      actionRef.current = opts.confirmAction || null;
      setState({
        open: true,
        variant: opts.variant || 'danger',
        title: opts.title || 'Are you sure?',
        description: opts.description || '',
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        confirmAction: opts.confirmAction || null,
        loading: false,
        errorMessage: '',
      });
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    const action = actionRef.current;

    if (action) {
      setState((prev) => ({ ...prev, loading: true, errorMessage: '' }));

      const toastId = progressToast.loading({
        title: state.title,
        message: 'Processing...',
      });

      try {
        await action();

        progressToast.success(toastId, {
          title: state.title,
          message: 'Completed successfully.',
        });

        resolveRef.current?.(true);
        setState((prev) => ({ ...prev, open: false }));
      } catch (err) {
        progressToast.error(toastId, {
          title: 'Operation Failed',
          message: err?.response?.data?.message || err?.message || 'Something went wrong',
        });

        setState((prev) => ({
          ...prev,
          loading: false,
          errorMessage: err?.response?.data?.message || err?.message || 'Something went wrong',
        }));
      }
    } else {
      resolveRef.current?.(true);
      setState((prev) => ({ ...prev, open: false }));
    }
  }, [state.title]);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        variant={state.variant}
        title={state.title}
        description={state.description}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        loading={state.loading}
        errorMessage={state.errorMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
