import { Image, StyleSheet, View } from "react-native";
import { productImageSource } from "@/lib/productImage";

type ProductImageProps = {
  name: string;
  imageUrl?: string | null;
  size?: "card" | "row";
};

export function ProductImage({
  name,
  imageUrl,
  size = "card",
}: ProductImageProps) {
  const source = productImageSource(name, imageUrl);
  if (!source) return null;

  if (size === "row") {
    return (
      <View style={styles.row}>
        <Image source={source} style={styles.rowImage} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={source} style={styles.cardImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    marginBottom: 16,
    overflow: "hidden",
    padding: 16,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  row: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    padding: 6,
  },
  rowImage: {
    width: "100%",
    height: "100%",
  },
});
