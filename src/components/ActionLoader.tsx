import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

type ActionLoaderProps = {
  message: string;
  visible?: boolean;
};

export function ActionLoader({ message, visible = true }: ActionLoaderProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.ring}>
          <View style={styles.core}>
            <Text style={styles.coreText}>F</Text>
          </View>
          <ActivityIndicator
            size="large"
            color={colors.leaf}
            style={styles.spinner}
          />
        </View>
        <Text style={styles.message}>{message}</Text>
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
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    position: "absolute",
    transform: [{ scale: 1.6 }],
  },
  core: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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
