import { ref } from "vue";

type QueuedMutation = {
  id: string;
  execute: () => Promise<void>;
};

const queue: QueuedMutation[] = [];
const _isOffline = ref(!navigator.onLine);
let flushing = false;

export const isOffline = _isOffline;

function onOnline() {
  _isOffline.value = false;
  void flushQueue();
}

function onOffline() {
  _isOffline.value = true;
}

let listenersRegistered = false;

export function registerOfflineListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
}

export function enqueue(id: string, execute: () => Promise<void>) {
  const existing = queue.findIndex((m) => m.id === id);
  if (existing >= 0) {
    queue[existing] = { id, execute };
  } else {
    queue.push({ id, execute });
  }
}

export async function flushQueue(): Promise<{ errors: Error[] }> {
  if (flushing || queue.length === 0) return { errors: [] };
  flushing = true;

  const errors: Error[] = [];

  while (queue.length > 0) {
    const mutation = queue.shift()!;
    try {
      await mutation.execute();
    } catch (err) {
      errors.push(err instanceof Error ? err : new Error(String(err)));
    }
  }

  flushing = false;
  return { errors };
}

export function clearQueue() {
  queue.length = 0;
}

export function queueSize() {
  return queue.length;
}
