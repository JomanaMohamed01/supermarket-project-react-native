import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

type ActionLoaderProps = {
  message?: string;
  visible?: boolean;
};

const CORE_SIZE = 44;
const ORBIT_SIZE = 96;

export function ActionLoader({ message, visible = true }: ActionLoaderProps) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    spin.setValue(0);
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [spin, visible]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.ring}>
          <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]} />
          <View style={styles.core}>
            <Text style={styles.coreText}>F</Text>
          </View>
        </View>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  ring: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  orbit: {
    position: "absolute",
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    borderRadius: ORBIT_SIZE / 2,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: colors.leaf,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: 14,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center",
  },
  coreText: {
    color: colors.cream,
    fontSize: 18,
    fontFamily: "Fraunces_700Bold",
  },
  message: {
    color: colors.ink,
    fontSize: 17,
    fontFamily: "Fraunces_600SemiBold",
    letterSpacing: 0.3,
  },
});
