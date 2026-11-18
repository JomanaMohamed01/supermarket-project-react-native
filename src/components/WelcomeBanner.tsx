import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatTopMessage } from "@/components/Toast";
import { colors, shadow } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export function WelcomeBanner() {
  const insets = useSafeAreaInsets();
  const { welcomeName, clearWelcome } = useApp();
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(-120);
  const dragY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const dismissed = useRef(false);
  const clearRef = useRef(clearWelcome);
  clearRef.current = clearWelcome;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const finishHide = useCallback(() => {
    setVisible(false);
    clearRef.current();
  }, []);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    clearTimers();
    dragY.value = withTiming(-180, { duration: 180 });
    opacity.value = withTiming(0, { duration: 180 });
    timers.current.push(setTimeout(finishHide, 180));
  }, [clearTimers, dragY, finishHide, opacity]);

  const dismissRef = useRef(dismiss);
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
    if (!welcomeName) return;

    dismissed.current = false;
    setVisible(true);
    dragY.value = 0;
    translateY.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });

    timers.current.push(
      setTimeout(() => {
        translateY.value = withTiming(-120, { duration: 450 });
        opacity.value = withTiming(0, { duration: 450 });
      }, 3500),
    );
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        clearRef.current();
      }, 4000),
    );

    return () => clearTimers();
  }, [welcomeName, clearTimers, dragY, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + dragY.value }],
    opacity: opacity.value,
  }));

  if (!visible || !welcomeName) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { paddingTop: insets.top + 12 }]}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.toast, shadow, animatedStyle]}>
          <Text style={styles.text}>
            {formatTopMessage(`Welcome back, ${welcomeName}!`)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 150,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  toast: {
    backgroundColor: colors.leaf,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(45, 106, 79, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    color: colors.cream,
    fontSize: 15,
    fontWeight: "600",
  },
});
