import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionLoader } from "@/components/ActionLoader";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { colors } from "@/constants/theme";
import { formatMoney } from "@/lib/format";
import { useApp } from "@/providers/AppProvider";

export default function CategoryProductsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, user, getCategory, getProductsByCategory } = useApp();

  if (!ready) return <ActionLoader message="Loading..." />;
  if (!user) return <Redirect href="/login" />;

  const category = getCategory(id);
  const products = getProductsByCategory(id);

  if (!category) {
    return (
      <AppShell>
        <Text style={styles.missing}>Category not found.</Text>
        <Pressable onPress={() => router.push("/categories")}>
          <Text style={styles.back}>← All aisles</Text>
        </Pressable>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Pressable onPress={() => router.push("/categories")}>
        <Text style={styles.back}>← All aisles</Text>
      </Pressable>
      <Text style={styles.title}>{category.name}</Text>
      <Text style={styles.subtitle}>
        Choose items to add to your shopping cart.
      </Text>

      <View style={styles.list}>
        {products.map((product, index) => (
          <View
            key={product.id}
            style={[
              styles.item,
              index === products.length - 1 && styles.itemLast,
            ]}
          >
            <ProductImage name={product.name} imageUrl={product.image_url} />
            <Text style={styles.name}>{product.name}</Text>
            {product.description ? (
              <Text style={styles.description}>{product.description}</Text>
            ) : null}
            <Text style={styles.price}>
              {formatMoney(Number(product.price))}
              {product.unit ? (
                <Text style={styles.unit}> / {product.unit}</Text>
              ) : null}
            </Text>
            <View style={styles.cta}>
              <AddToCartButton productId={product.id} />
            </View>
          </View>
        ))}
      </View>

      {products.length === 0 && (
        <Text style={styles.empty}>No products in this aisle yet.</Text>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  back: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.leaf,
    marginBottom: 12,
  },
  title: {
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
  list: { gap: 0 },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 28,
    marginBottom: 20,
  },
  itemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  name: {
    fontSize: 24,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 20,
  },
  price: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: colors.leaf,
  },
  unit: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.inkSoft,
  },
  cta: { marginTop: 16 },
  empty: { color: colors.inkSoft },
  missing: {
    fontSize: 18,
    color: colors.ink,
    marginBottom: 12,
  },
});
