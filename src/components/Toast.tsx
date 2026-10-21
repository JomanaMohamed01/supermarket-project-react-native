import { useEffect, type ReactNode } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    translateY.value = withTiming(0, { duration: 350 });
    opacity.value = withTiming(1, { duration: 350 });

    const exit = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 400 });
      opacity.value = withTiming(0, { duration: 400 });
    }, durationMs);

    const hide = setTimeout(() => {
      onHide?.();
    }, durationMs + 450);

    return () => {
      clearTimeout(exit);
      clearTimeout(hide);
    };
  }, [visible, durationMs, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const body = (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        Platform.OS === "web" ? styles.webWrap : styles.nativeWrap,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          tone === "error" ? styles.error : styles.success,
          shadow,
          animatedStyle,
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );

  if (Platform.OS === "web") {
    if (!visible) return null;
    return <WebPortal>{body}</WebPortal>;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onHide}
    >
      {body}
    </Modal>
  );
}

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
    flex: 1,
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
