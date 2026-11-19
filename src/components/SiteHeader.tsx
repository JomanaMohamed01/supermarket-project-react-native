import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

function isUsableAvatarUrl(url: string | null | undefined) {
  if (!url?.trim()) return false;
  // blob: / temporary file URIs do not survive refresh
  if (url.startsWith("blob:") || url.startsWith("file:")) return false;
  return true;
}

export function SiteHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, cartCount, signOut } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    setAvatarBroken(false);
  }, [user?.avatar_url]);

  if (!user) return null;

  const initials =
    user.full_name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email.charAt(0).toUpperCase() ||
    "U";

  function askSignOut() {
    setMenuOpen(false);
    setConfirmSignOut(true);
  }

  async function handleSignOut() {
    setConfirmSignOut(false);
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
        {isUsableAvatarUrl(user.avatar_url) && !avatarBroken ? (
          <Image
            source={{ uri: user.avatar_url! }}
            style={styles.avatar}
            onError={() => setAvatarBroken(true)}
          />
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
              divider
              onPress={() => {
                setMenuOpen(false);
                router.push("/categories");
              }}
            />
            <MenuItem
              label="My cart"
              divider
              badge={cartCount > 0 ? cartCount : undefined}
              onPress={() => {
                setMenuOpen(false);
                router.push("/cart");
              }}
            />
            <MenuItem
              label="My orders"
              divider
              onPress={() => {
                setMenuOpen(false);
                router.push("/orders");
              }}
            />
            <MenuItem
              label="My profile"
              divider
              onPress={() => {
                setMenuOpen(false);
                router.push("/account");
              }}
            />
            <MenuItem label="Sign out" onPress={askSignOut} />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={confirmSignOut}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmSignOut(false)}
      >
        <Pressable
          style={styles.confirmBackdrop}
          onPress={() => setConfirmSignOut(false)}
        >
          <Pressable style={[styles.confirmCard, shadow]} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Do you want to sign out?</Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.noBtn}
                onPress={() => setConfirmSignOut(false)}
              >
                <Text style={styles.noText}>No</Text>
              </Pressable>
              <Pressable style={styles.yesBtn} onPress={() => void handleSignOut()}>
                <Text style={styles.yesText}>Yes</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function MenuItem({
  label,
  onPress,
  badge,
  divider = false,
}: {
  label: string;
  onPress: () => void;
  badge?: number;
  divider?: boolean;
}) {
  return (
    <View>
      <Pressable style={styles.menuItem} onPress={onPress}>
        <Text style={styles.menuText}>{label}</Text>
        {badge !== undefined && (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        )}
      </Pressable>
      {divider ? <View style={styles.menuDivider} /> : null}
    </View>
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 10,
    backgroundColor: "rgba(64, 145, 108, 0.22)",
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
  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,34,26,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.cream,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
  },
  confirmTitle: {
    fontSize: 22,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
    textAlign: "center",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  noBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  noText: {
    fontWeight: "700",
    color: colors.ink,
    fontSize: 15,
  },
  yesBtn: {
    flex: 1,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  yesText: {
    fontWeight: "700",
    color: colors.cream,
    fontSize: 15,
  },
});
