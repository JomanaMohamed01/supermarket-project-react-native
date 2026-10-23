type Listener = (placing: boolean) => void;

let placing = false;
const listeners = new Set<Listener>();

export function setOrderPlacing(next: boolean) {
  placing = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribeOrderPlacing(listener: Listener) {
  listeners.add(listener);
  listener(placing);
  return () => {
    listeners.delete(listener);
  };
}
