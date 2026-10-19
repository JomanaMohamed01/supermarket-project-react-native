import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionLoader } from "@/components/ActionLoader";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { colors } from "@/constants/theme";
import { formatMoney } from "@/lib/format";
import { useApp } from "@/providers/AppProvider";

export default function CartScreen() {
  const router = useRouter();
  const {
    ready,
    user,
    cartItems,
    updateCartQuantity,
    removeFromCart,
  } = useApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loaderMessage, setLoaderMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (ready && !user) return <Redirect href="/login" />;

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  async function changeQty(id: string, quantity: number) {
    const current = cartItems.find((item) => item.id === id)?.quantity ?? 0;
    setBusyId(id);
    setError(null);
    setLoaderMessage(
      quantity < 1 || quantity < current ? "Removing item..." : "Adding item...",
    );
    try {
      await updateCartQuantity(id, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update cart");
    } finally {
      setBusyId(null);
      setLoaderMessage(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setLoaderMessage("Removing item...");
    setError(null);
    try {
      await removeFromCart(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove item");
    } finally {
      setBusyId(null);
      setLoaderMessage(null);
    }
  }

  return (
    <>
      {loaderMessage && <ActionLoader message={loaderMessage} />}
      <AppShell>
        <Text style={styles.eyebrow}>Cart</Text>
        <Text style={styles.title}>Your shopping cart</Text>
        <Text style={styles.subtitle}>
          Adjust quantities or remove items before checkout.
        </Text>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyBody}>
              Browse an aisle and add a few items.
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push("/categories")}
            >
              <Text style={styles.primaryBtnText}>Start shopping</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowMain}>
                  <ProductImage
                    name={item.product.name}
                    imageUrl={item.product.image_url}
                    size="row"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.product.name}</Text>
                    <Text style={styles.meta}>
                      {formatMoney(Number(item.product.price))}
                      {item.product.unit ? ` / ${item.product.unit}` : ""}
                    </Text>
                    <Text style={styles.line}>
                      Line:{" "}
                      {formatMoney(Number(item.product.price) * item.quantity)}
                    </Text>
                  </View>
                </View>

                <View style={styles.controls}>
                  <View style={styles.qty}>
                    <Pressable
                      disabled={busyId === item.id}
                      onPress={() => void changeQty(item.id, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      disabled={busyId === item.id}
                      onPress={() => void changeQty(item.id, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    disabled={busyId === item.id}
                    onPress={() => void remove(item.id)}
                  >
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.footer}>
              <View>
                <Text style={styles.subtotalLabel}>Cart subtotal</Text>
                <Text style={styles.subtotal}>{formatMoney(total)}</Text>
              </View>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.push("/checkout")}
              >
                <Text style={styles.primaryBtnText}>Go to checkout</Text>
              </Pressable>
            </View>
          </View>
        )}
      </AppShell>
    </>
  );
}

const styles = StyleSheet.create({
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
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    color: colors.inkSoft,
  },
  emptyCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
    backgroundColor: "rgba(255,253,248,0.6)",
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Fraunces_600SemiBold",
    color: colors.ink,
  },
  emptyBody: { marginTop: 8, color: colors.inkSoft },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: colors.cream, fontWeight: "700", fontSize: 15 },
  list: { gap: 20 },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 20,
    gap: 14,
  },
  rowMain: { flexDirection: "row", gap: 14, alignItems: "center" },
  name: {
    fontSize: 22,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  meta: { marginTop: 4, fontSize: 13, color: colors.inkSoft },
  line: { marginTop: 8, fontWeight: "700", color: colors.leaf },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: colors.inkSoft },
  qtyValue: { minWidth: 28, textAlign: "center", fontWeight: "700" },
  remove: { color: colors.danger, fontWeight: "700", fontSize: 13 },
  errorBox: {
    backgroundColor: "rgba(180,35,24,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 20,
    gap: 8,
  },
  subtotalLabel: { fontSize: 13, color: colors.inkSoft },
  subtotal: {
    fontSize: 30,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
});
