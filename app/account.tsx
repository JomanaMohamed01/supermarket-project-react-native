import * as ImagePicker from "expo-image-picker";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActionLoader } from "@/components/ActionLoader";
import { AppShell } from "@/components/AppShell";
import { Toast } from "@/components/Toast";
import { colors, shadow } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export default function AccountScreen() {
  const router = useRouter();
  const {
    ready,
    user,
    updateAddress,
    updateAvatar,
    deleteAccount,
  } = useApp();

  const [address, setAddress] = useState(user?.address ?? "");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    setAddress(user?.address ?? "");
  }, [user?.address]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressToast, setAddressToast] = useState(false);

  if (ready && !user) return <Redirect href="/login" />;
  if (!user) return null;

  const initials =
    user.full_name?.trim()?.charAt(0)?.toUpperCase() ||
    user.email.charAt(0).toUpperCase();

  async function saveAddress() {
    setMessage(null);
    setError(null);
    setAddressError(null);

    if (!address.trim()) {
      setAddressError("This field must be filled");
      return;
    }

    setSavingAddress(true);
    try {
      await updateAddress(address);
      setAddressToast(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function changePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      await updateAvatar(result.assets[0].uri);
      setMessage("Profile picture updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not upload profile picture",
      );
    } finally {
      setUploading(false);
    }
  }

  async function onDelete() {
    setConfirmOpen(false);
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      router.replace("/signup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete account");
      setDeleting(false);
    }
  }

  return (
    <>
      {deleting && <ActionLoader message="Deleting account..." />}
      <Toast
        visible={addressToast}
        message="Address updated successfully."
        onHide={() => setAddressToast(false)}
        durationMs={3500}
      />

      <AppShell>
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.title}>My account</Text>
        <Text style={styles.subtitle}>
          View your details, update your address, and add a profile picture.
        </Text>

        <View style={[styles.card, shadow]}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.initials}>{initials}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {user.full_name?.trim() || "Your profile"}
              </Text>
              <Text style={styles.profileHint}>
                Upload a photo so it shows on your account.
              </Text>
              <Pressable
                style={[styles.leafBtn, uploading && styles.disabled]}
                onPress={() => void changePhoto()}
                disabled={uploading}
              >
                <Text style={styles.leafBtnText}>
                  {uploading ? "Uploading..." : "Change photo"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.card, shadow]}>
          <Text style={styles.cardTitle}>Account details</Text>
          <Detail label="Full name" value={user.full_name?.trim() || "—"} />
          <Detail label="Phone" value={user.phone?.trim() || "—"} />
          <Detail label="Email" value={user.email} />
        </View>

        <View style={[styles.card, shadow]}>
          <Text style={styles.cardTitle}>Delivery address</Text>
          <Text style={styles.cardHint}>
            Update where your orders should be delivered.
          </Text>
          <Text style={styles.label}>Address</Text>
          <TextInput
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              if (addressError) setAddressError(null);
            }}
            multiline
            numberOfLines={3}
            placeholder="Street, city"
            placeholderTextColor={colors.inkSoft}
            style={[styles.textarea, addressError && styles.inputError]}
          />
          {addressError && <Text style={styles.errorText}>{addressError}</Text>}
          <Pressable
            style={[styles.leafBtn, savingAddress && styles.disabled]}
            onPress={() => void saveAddress()}
            disabled={savingAddress}
          >
            <Text style={styles.leafBtnText}>
              {savingAddress ? "Saving..." : "Save address"}
            </Text>
          </Pressable>
        </View>

        {message && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={[styles.dangerCard, shadow]}>
          <Text style={styles.dangerTitle}>Delete account</Text>
          <Text style={styles.cardHint}>
            Permanently delete your account, cart, and profile data. This cannot
            be undone.
          </Text>
          <Pressable
            style={styles.dangerBtn}
            onPress={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            <Text style={styles.dangerBtnText}>Delete my account</Text>
          </Pressable>
        </View>
      </AppShell>

      <Modal visible={confirmOpen} transparent animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setConfirmOpen(false)}
        >
          <Pressable style={[styles.modalCard, shadow]} onPress={() => {}}>
            <Text style={styles.modalTitle}>Delete your account?</Text>
            <Text style={styles.modalBody}>
              This will permanently remove your profile, cart, and account
              access. You won&apos;t be able to undo this.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dangerBtn} onPress={() => void onDelete()}>
                <Text style={styles.dangerBtnText}>Yes, delete account</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  card: {
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 22,
    marginBottom: 16,
  },
  profileRow: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  initials: { fontSize: 32, fontWeight: "700", color: colors.leaf },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  profileHint: { marginTop: 4, fontSize: 13, color: colors.inkSoft },
  leafBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leafBtnText: { color: colors.cream, fontWeight: "700", fontSize: 13 },
  cardTitle: {
    fontSize: 20,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  cardHint: { marginTop: 6, fontSize: 13, color: colors.inkSoft, lineHeight: 18 },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkSoft,
  },
  value: { color: colors.ink, fontSize: 15 },
  textarea: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 88,
    textAlignVertical: "top",
    color: colors.ink,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  successBox: {
    backgroundColor: "rgba(45,106,79,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: colors.leaf, fontWeight: "700", fontSize: 13 },
  errorBox: {
    backgroundColor: "rgba(180,35,24,0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: "500" },
  dangerCard: {
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(180,35,24,0.25)",
    padding: 22,
  },
  dangerTitle: {
    fontSize: 20,
    color: colors.danger,
    fontFamily: "Fraunces_600SemiBold",
  },
  dangerBtn: {
    marginTop: 16,
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  disabled: { opacity: 0.6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,34,26,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.cream,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  modalBody: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkSoft,
  },
  modalActions: { marginTop: 20, gap: 10 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: { fontWeight: "700", color: colors.ink, fontSize: 14 },
});
