import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useToastLayer } from "@/components/ToastLayer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow } from "@/constants/theme";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  visible: boolean;
  onHide?: () => void;
  durationMs?: number;
};

export function Toast({
  message,
  tone = "success",
  visible,
  onHide,
  durationMs = 2500,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const layer = useToastLayer();
  const id = useRef(0);
  if (id.current === 0) id.current = nextToastId++;
  const translateY = useSharedValue(-120);
  const dragY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const dismissed = useRef(false);
  const dismissRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    clearTimers();
    dragY.value = withTiming(-180, { duration: 180 });
    opacity.value = withTiming(0, { duration: 180 });
    timers.current.push(
      setTimeout(() => {
        onHide?.();
      }, 180),
    );
  }, [clearTimers, dragY, onHide, opacity]);

  dismissRef.current = dismiss;

  const dismissFromGesture = useCallback(() => {
    dismissRef.current();
  }, []);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(-10)
        .failOffsetY(16)
        .onUpdate((event) => {
          dragY.value = Math.min(0, event.translationY);
        })
        .onEnd((event) => {
          if (event.translationY < -28 || event.velocityY < -800) {
            runOnJS(dismissFromGesture)();
            return;
          }
          dragY.value = withTiming(0, { duration: 180 });
        }),
    [dismissFromGesture, dragY],
  );

  useEffect(() => {
    if (!visible) {
      dismissed.current = false;
      return;
    }

    dismissed.current = false;
    dragY.value = 0;
    translateY.value = withTiming(0, { duration: 350 });
    opacity.value = withTiming(1, { duration: 350 });

    timers.current.push(
      setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 400 });
        opacity.value = withTiming(0, { duration: 400 });
      }, durationMs),
    );
    timers.current.push(
      setTimeout(() => {
        onHide?.();
      }, durationMs + 450),
    );

    return () => clearTimers();
  }, [visible, durationMs, onHide, opacity, translateY, dragY, clearTimers]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + dragY.value }],
    opacity: opacity.value,
  }));

  const body = (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        Platform.OS === "web" ? styles.webWrap : styles.nativeWrap,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.toast,
            tone === "error" ? styles.error : styles.success,
            shadow,
            animatedStyle,
          ]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );

  useLayoutEffect(() => {
    if (Platform.OS === "web" || !layer) return;
    if (!visible) {
      layer.unmount(id.current);
      return;
    }
    layer.mount(id.current, body);
  }, [layer, message, tone, visible, insets.top]);

  useEffect(() => {
    const toastId = id.current;
    return () => layer?.unmount(toastId);
  }, [layer]);

  if (Platform.OS === "web") {
    if (!visible) return null;
    return <WebPortal>{body}</WebPortal>;
  }

  return null;
}

let nextToastId = 1;

function WebPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  const { createPortal } = require("react-dom") as {
    createPortal: (node: ReactNode, container: HTMLElement) => ReactNode;
  };
  return createPortal(children, document.body);
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  nativeWrap: {
    width: "100%",
  },
  webWrap: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toast: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
  },
  success: {
    backgroundColor: colors.leaf,
    borderColor: "rgba(45, 106, 79, 0.2)",
  },
  error: {
    backgroundColor: colors.danger,
    borderColor: "rgba(180, 35, 24, 0.2)",
  },
  text: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: "600",
  },
});
