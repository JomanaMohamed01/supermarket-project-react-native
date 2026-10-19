import { useEffect } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onHide}
    >
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingTop: insets.top + 12 }]}
      >
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
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
