import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Toast } from "@/components/Toast";
import { colors } from "@/constants/theme";
import { getErrorMessage } from "@/lib/errors";
import { useApp } from "@/providers/AppProvider";

type AddToCartButtonProps = {
  productId: string;
};

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { addToCart } = useApp();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  async function handlePress() {
    setLoading(true);
    try {
      await addToCart(productId);
      setToast({ text: "Added to cart", tone: "success" });
    } catch (err) {
      setToast({
        text: getErrorMessage(err, "Could not add item"),
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Pressable
        style={[styles.button, loading && styles.disabled]}
        onPress={() => void handlePress()}
        disabled={loading}
      >
        <Text style={styles.text}>{loading ? "Adding..." : "Add to cart"}</Text>
      </Pressable>

      <Toast
        visible={Boolean(toast)}
        message={toast?.text ?? ""}
        tone={toast?.tone}
        onHide={() => setToast(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: "600",
  },
});
