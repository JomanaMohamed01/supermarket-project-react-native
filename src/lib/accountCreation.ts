type Listener = (creating: boolean) => void;

let creating = false;
const listeners = new Set<Listener>();

export function isAccountCreating() {
  return creating;
}

export function setAccountCreating(next: boolean) {
  creating = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribeAccountCreating(listener: Listener) {
  listeners.add(listener);
  listener(creating);
  return () => {
    listeners.delete(listener);
  };
}
