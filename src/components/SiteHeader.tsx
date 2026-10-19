import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export function SiteHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, cartCount, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const initials =
    user.full_name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email.charAt(0).toUpperCase() ||
    "U";

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.replace("/login");
  }

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable
        style={styles.brand}
        onPress={() => router.push("/categories")}
      >
        <View style={styles.mark}>
          <Text style={styles.markText}>F</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>FreshLane</Text>
          <Text style={styles.brandSub}>Market aisle, online</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => setMenuOpen(true)}
        style={styles.avatarButton}
        accessibilityLabel="Account menu"
      >
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 64 }, shadow]}>
            <MenuItem
              label="Shop"
              onPress={() => {
                setMenuOpen(false);
                router.push("/categories");
              }}
            />
            <MenuItem
              label="Cart"
              badge={cartCount > 0 ? cartCount : undefined}
              onPress={() => {
                setMenuOpen(false);
                router.push("/cart");
              }}
            />
            <MenuItem
              label="My profile"
              onPress={() => {
                setMenuOpen(false);
                router.push("/account");
              }}
            />
            <MenuItem label="Sign out" onPress={() => void handleSignOut()} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuItem({
  label,
  onPress,
  badge,
}: {
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      {badge !== undefined && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.cream,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: colors.cream,
    fontSize: 18,
    fontFamily: "Fraunces_700Bold",
  },
  brandTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  brandSub: {
    marginTop: 2,
    fontSize: 12,
    color: colors.inkSoft,
  },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatarFallback: {
    backgroundColor: colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.leaf,
    fontWeight: "700",
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.citrus,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.ink,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    right: 16,
    width: 192,
    backgroundColor: colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 8,
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.citrus,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink,
  },
});
