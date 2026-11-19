import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ActionLoader } from "@/components/ActionLoader";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { colors, shadow } from "@/constants/theme";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/providers/AppProvider";

type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

type OrderRow = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItemRow[] | null;
};

type OrderCardItem = OrderItemRow & {
  key: string;
  imageUrl: string | null;
};

type OrderCard = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderCardItem[];
};

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  const trimmed = status.trim();
  if (!trimmed) return "Saved";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export default function OrdersScreen() {
  const router = useRouter();
  const { ready, user } = useApp();
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load(userId: string) {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabase();
        if (!supabase) {
          if (!cancelled) setOrders([]);
          return;
        }

        const { data, error: ordersError } = await supabase
          .from("orders")
          .select(
            "id, status, total_amount, created_at, order_items(product_id, product_name, unit_price, quantity, line_total)",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (ordersError) throw ordersError;

        const rows = (data ?? []) as OrderRow[];
        const productIds = [
          ...new Set(
            rows.flatMap((order) =>
              (order.order_items ?? [])
                .map((item) => item.product_id)
                .filter((id): id is string => Boolean(id)),
            ),
          ),
        ];

        const imageByProductId = new Map<string, string | null>();
        if (productIds.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("id, image_url")
            .in("id", productIds);
          for (const product of products ?? []) {
            imageByProductId.set(product.id, product.image_url);
          }
        }

        const cards = rows.map((order) => ({
          id: order.id,
          date: formatOrderDate(order.created_at),
          status: statusLabel(order.status),
          total: Number(order.total_amount),
          items: (order.order_items ?? []).map((item, index) => ({
            ...item,
            key: `${order.id}-${item.product_id ?? index}`,
            imageUrl: item.product_id
              ? (imageByProductId.get(item.product_id) ?? null)
              : null,
          })),
        }));

        if (!cancelled) setOrders(cards);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Could not load your orders"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load(user.id);
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (ready && !user) return <Redirect href="/login" />;

  return (
    <>
      {loading && user ? <ActionLoader message="Loading..." /> : null}
      <AppShell>
        <Text style={styles.eyebrow}>Orders</Text>
        <Text style={styles.title}>My orders</Text>
        <Text style={styles.subtitle}>
          Every order you have placed since you created your account.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyBody}>
              When you check out, your orders will be kept here.
            </Text>
            <Pressable
              style={styles.browse}
              onPress={() => router.push("/categories")}
            >
              <Text style={styles.browseText}>Browse aisles</Text>
            </Pressable>
          </View>
        ) : null}

        {orders.map((order) => (
          <OrderAccordion key={order.id} order={order} />
        ))}
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
  errorBox: {
    marginBottom: 16,
    backgroundColor: "rgba(180,35,24,0.1)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  emptyBody: {
    marginTop: 8,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: "center",
  },
  browse: {
    marginTop: 20,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  browseText: { color: colors.cream, fontWeight: "700", fontSize: 15 },
  card: {
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  arrowSlot: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  date: { fontSize: 13, color: colors.inkSoft },
  total: {
    marginTop: 4,
    fontSize: 28,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  status: {
    backgroundColor: colors.bgDeep,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.leaf,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  measure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  itemCopy: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.ink },
  itemDetail: { marginTop: 2, fontSize: 13, color: colors.inkSoft },
  lineTotal: { fontSize: 14, fontWeight: "700", color: colors.ink },
});

function OrderAccordion({ order }: { order: OrderCard }) {
  const progress = useSharedValue(0);
  const measuredHeight = useSharedValue(0);
  const open = useSharedValue(false);

  function toggle() {
    const next = !open.value;
    open.value = next;
    progress.value = withTiming(next ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }

  const bodyStyle = useAnimatedStyle(() => ({
    height: measuredHeight.value * progress.value,
    opacity: progress.value,
    overflow: "hidden",
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <View style={[styles.card, shadow]}>
      <Pressable
        style={styles.cardTop}
        onPress={toggle}
        accessibilityRole="button"
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{order.date}</Text>
          <Text style={styles.total}>{formatMoney(order.total)}</Text>
        </View>
        <View style={styles.cardSide}>
          <View style={styles.status}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
          <View style={styles.arrowSlot}>
            <Animated.View style={arrowStyle}>
              <ChevronDown size={22} color={colors.ink} />
            </Animated.View>
          </View>
        </View>
      </Pressable>

      <Animated.View style={bodyStyle}>
        <View
          style={styles.measure}
          onLayout={(event) => {
            measuredHeight.value = event.nativeEvent.layout.height;
          }}
        >
          {order.items.length > 0 ? (
            order.items.map((item) => (
              <View key={item.key} style={styles.item}>
                <ProductImage
                  name={item.product_name}
                  imageUrl={item.imageUrl}
                  size="row"
                />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <Text style={styles.itemDetail}>
                    {item.quantity} × {formatMoney(Number(item.unit_price))}
                  </Text>
                </View>
                <Text style={styles.lineTotal}>
                  {formatMoney(Number(item.line_total))}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.itemDetail}>This order has no saved items.</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
