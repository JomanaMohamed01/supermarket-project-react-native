import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export function WelcomeBanner() {
  const insets = useSafeAreaInsets();
  const { welcomeName, clearWelcome } = useApp();
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!welcomeName) return;

    setVisible(true);
    translateY.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });

    const exit = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 450 });
      opacity.value = withTiming(0, { duration: 450 });
    }, 3500);

    const hide = setTimeout(() => {
      setVisible(false);
      clearWelcome();
    }, 4000);

    return () => {
      clearTimeout(exit);
      clearTimeout(hide);
    };
  }, [welcomeName, clearWelcome, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible || !welcomeName) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { paddingTop: insets.top + 12 }]}
    >
      <Animated.View style={[styles.toast, shadow, animatedStyle]}>
        <Text style={styles.text}>Welcome back, {welcomeName}!</Text>
      </Animated.View>
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
