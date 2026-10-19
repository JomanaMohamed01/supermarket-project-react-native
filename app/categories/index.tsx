import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppShell } from "@/components/AppShell";
import { CategoryIcon } from "@/components/CategoryIcon";
import { colors, shadow } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export default function CategoriesScreen() {
  const router = useRouter();
  const { ready, user, categories } = useApp();

  if (ready && !user) return <Redirect href="/login" />;

  return (
    <AppShell>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>Aisles</Text>
        <Text style={styles.title}>FreshLane</Text>
        <Text style={styles.subtitle}>
          Pick a category to start filling your cart.
        </Text>
      </View>

      <View style={styles.grid}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.card, shadow]}
            onPress={() => router.push(`/categories/${category.id}`)}
          >
            <View style={styles.iconWrap}>
              <CategoryIcon name={category.name} slug={category.slug} />
            </View>
            <Text style={styles.cardTitle}>{category.name}</Text>
            <Text style={styles.cardSub}>Browse items →</Text>
          </Pressable>
        ))}
      </View>

      {categories.length === 0 && (
        <Text style={styles.empty}>No categories yet. Seed them in Supabase.</Text>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: 28, maxWidth: 420 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: colors.leaf,
  },
  title: {
    marginTop: 8,
    fontSize: 40,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  grid: { gap: 14 },
  card: {
    backgroundColor: "rgba(255,253,248,0.9)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  cardSub: {
    marginTop: 8,
    fontSize: 13,
    color: colors.inkSoft,
  },
  empty: { color: colors.inkSoft, marginTop: 12 },
});
