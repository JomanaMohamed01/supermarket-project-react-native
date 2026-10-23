import { Redirect, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { colors, shadow } from "@/constants/theme";
import { formatMoney } from "@/lib/format";
import { setOrderPlacing } from "@/lib/orderPlacement";
import { useApp } from "@/providers/AppProvider";

export default function CheckoutScreen() {
  const router = useRouter();
  const { ready, user, cartItems, placeOrder } = useApp();
  const [error, setError] = useState<string | null>(null);
  const placing = useRef(false);

  if (ready && !user) return <Redirect href="/login" />;

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  async function onPlaceOrder() {
    if (placing.current) return;
    placing.current = true;
    setError(null);
    setOrderPlacing(true);
    try {
      const result = await placeOrder();
      router.replace({
        pathname: "/order-success",
        params: { order: result.orderId, total: String(result.total) },
      });
    } catch (err) {
      setOrderPlacing(false);
      placing.current = false;
      setError(err instanceof Error ? err.message : "Could not place order");
    }
  }

  return (
    <AppShell>
        <View style={styles.center}>
          <Text style={styles.eyebrow}>Checkout</Text>
          <Text style={styles.title}>Review & pay</Text>
          <Text style={styles.subtitle}>
            Confirm your items. The total appears below, right before payment.
          </Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing to checkout</Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push("/categories")}
            >
              <Text style={styles.primaryBtnText}>Browse aisles</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <ProductImage
                    name={item.product.name}
                    imageUrl={item.product.image_url}
                    size="row"
                  />
                  <View>
                    <Text style={styles.name}>{item.product.name}</Text>
                    <Text style={styles.meta}>
                      {item.quantity} × {formatMoney(Number(item.product.price))}
                    </Text>
                  </View>
                </View>
                <Text style={styles.lineTotal}>
                  {formatMoney(Number(item.product.price) * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={[styles.totalCard, shadow]}>
              <Text style={styles.totalLabel}>Order total</Text>
              <Text style={styles.total}>{formatMoney(total)}</Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={styles.payBtn}
              onPress={() => void onPlaceOrder()}
            >
              <Text style={styles.payBtnText}>Proceed payment</Text>
            </Pressable>
          </View>
        )}
      </AppShell>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", marginBottom: 24 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.leaf,
  },
  title: {
    marginTop: 8,
    fontSize: 36,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Fraunces_600SemiBold",
    color: colors.ink,
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryBtnText: { color: colors.cream, fontWeight: "700" },
  content: { gap: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 14,
    gap: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  name: { fontWeight: "700", color: colors.ink, fontSize: 15 },
  meta: { marginTop: 4, fontSize: 13, color: colors.inkSoft },
  lineTotal: { fontWeight: "700", color: colors.ink },
  totalCard: {
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 18,
    padding: 20,
  },
  totalLabel: { fontSize: 13, color: colors.inkSoft },
  total: {
    marginTop: 4,
    fontSize: 36,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  errorBox: {
    backgroundColor: "rgba(180,35,24,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  payBtn: {
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  payBtnText: { color: colors.cream, fontSize: 17, fontWeight: "700" },
});
