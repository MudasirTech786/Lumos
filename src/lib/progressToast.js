import toast from 'react-hot-toast';
import ProgressToast from '@/components/ui/ProgressToast';

const store = new Map();
const activeToasts = new Set();
const queue = [];
const MAX_VISIBLE = 3;
let idCounter = 0;

function generateId() {
  idCounter += 1;
  return `progress-toast-${idCounter}`;
}

function showToast(toastId, data) {
  store.set(toastId, data);
  activeToasts.add(toastId);

  toast.custom(
    (t) => <ProgressToast toast={t} data={store.get(toastId)} />,
    { id: toastId, duration: Infinity, position: 'top-right', style: { margin: 0 } }
  );
}

function renderToast(toastId) {
  toast.custom(
    (t) => <ProgressToast toast={t} data={store.get(toastId)} />,
    { id: toastId, duration: Infinity, position: 'top-right', style: { margin: 0 } }
  );
}

function dismissToast(toastId) {
  toast.dismiss(toastId);
  activeToasts.delete(toastId);

  setTimeout(() => {
    store.delete(toastId);
  }, 400);

  while (activeToasts.size < MAX_VISIBLE && queue.length > 0) {
    const next = queue.shift();
    showToast(next.toastId, next.data);
  }
}

const progressToast = {
  loading({ title = '', message = '' } = {}) {
    const toastId = generateId();
    const data = { type: 'loading', title, message, progress: 0 };

    if (activeToasts.size < MAX_VISIBLE) {
      showToast(toastId, data);
    } else {
      queue.push({ toastId, data });
    }

    return toastId;
  },

  update(toastId, { progress, message, eta } = {}) {
    const current = store.get(toastId);
    if (!current) return;

    const updated = { ...current, type: 'progress' };
    if (progress !== undefined) updated.progress = progress;
    if (message !== undefined) updated.message = message;
    if (eta !== undefined) updated.eta = eta;

    store.set(toastId, updated);
    renderToast(toastId);
  },

  success(toastId, { title, message } = {}) {
    const current = store.get(toastId);
    if (!current) return;

    store.set(toastId, {
      ...current,
      type: 'success',
      title,
      message,
      progress: 100,
      eta: undefined,
    });
    renderToast(toastId);

    setTimeout(() => dismissToast(toastId), 2000);
  },

  error(toastId, { title, message } = {}) {
    const current = store.get(toastId);
    if (!current) return;

    store.set(toastId, {
      ...current,
      type: 'error',
      title,
      message,
      eta: undefined,
    });
    renderToast(toastId);

    setTimeout(() => dismissToast(toastId), 2000);
  },

  dismiss(toastId) {
    dismissToast(toastId);
  },

  dismissAll() {
    const ids = [...activeToasts];
    ids.forEach((id) => dismissToast(id));
    queue.length = 0;
  },

  axios: {
    upload({ title = 'Uploading...', message = 'Starting upload...', progressMessage } = {}) {
      const toastId = progressToast.loading({ title, message });
      return {
        toastId,
        onUploadProgress(progressEvent) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progressToast.update(toastId, {
            progress: pct,
            message: (progressMessage || 'Uploading... {pct}%').replace('{pct}', pct),
          });
        },
      };
    },
  },
};

export default progressToast;
