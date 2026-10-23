import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";

type ToastSlot = {
  id: number;
  node: ReactNode;
};

type ToastLayerApi = {
  mount: (id: number, node: ReactNode) => void;
  unmount: (id: number) => void;
};

const ToastLayerContext = createContext<ToastLayerApi | null>(null);

export function ToastLayer({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<ToastSlot[]>([]);

  const mount = useCallback((id: number, node: ReactNode) => {
    setSlots((current) => {
      const index = current.findIndex((slot) => slot.id === id);
      if (index === -1) return [...current, { id, node }];
      const next = current.slice();
      next[index] = { id, node };
      return next;
    });
  }, []);

  const unmount = useCallback((id: number) => {
    setSlots((current) => current.filter((slot) => slot.id !== id));
  }, []);

  const api = useMemo(() => ({ mount, unmount }), [mount, unmount]);

  return (
    <ToastLayerContext.Provider value={api}>
      <View style={styles.host}>
        {children}
        <View pointerEvents="box-none" style={styles.overlay}>
          {slots.map((slot) => (
            <View key={slot.id} pointerEvents="box-none">
              {slot.node}
            </View>
          ))}
        </View>
      </View>
    </ToastLayerContext.Provider>
  );
}

export function useToastLayer() {
  return useContext(ToastLayerContext);
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
  },
});
