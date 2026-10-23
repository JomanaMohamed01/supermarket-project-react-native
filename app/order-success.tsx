import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppShell } from "@/components/AppShell";
import { colors, shadow } from "@/constants/theme";
import { formatMoney } from "@/lib/format";
import { setOrderPlacing } from "@/lib/orderPlacement";
import { useApp } from "@/providers/AppProvider";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { ready, user } = useApp();
  const params = useLocalSearchParams<{
    order?: string;
    total?: string;
    error?: string;
  }>();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setOrderPlacing(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (ready && !user) return <Redirect href="/login" />;

  const total =
    params.total !== undefined && params.total !== ""
      ? Number(params.total)
      : null;

  return (
    <>
      <Stack.Screen options={{ animation: "none" }} />
      <AppShell>
      <View style={[styles.card, shadow]}>
        <Text style={styles.eyebrow}>Order placed</Text>
        <Text style={styles.title}>Thanks for shopping FreshLane</Text>
        <Text style={styles.body}>
          {params.error
            ? params.error
            : `Your order is saved${
                params.order ? ` (#${String(params.order).slice(-8)})` : ""
              }. You can keep browsing the aisles whenever you're ready.`}
        </Text>
        {total !== null && !Number.isNaN(total) && (
          <Text style={styles.total}>{formatMoney(total)}</Text>
        )}
        <Pressable
          style={styles.btn}
          onPress={() => router.replace("/categories")}
        >
          <Text style={styles.btnText}>Back to aisles</Text>
        </Pressable>
      </View>
    </AppShell>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 28,
    paddingVertical: 40,
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.leaf,
  },
  title: {
    marginTop: 12,
    fontSize: 32,
    textAlign: "center",
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  body: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.inkSoft,
  },
  total: {
    marginTop: 22,
    fontSize: 30,
    color: colors.leaf,
    fontFamily: "Fraunces_600SemiBold",
  },
  btn: {
    marginTop: 28,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  btnText: { color: colors.cream, fontWeight: "700", fontSize: 15 },
});
