import * as ImagePicker from "expo-image-picker";
import { Link, Redirect, useRouter } from "expo-router";
import { useEffect, useState, type ComponentProps } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionLoader } from "@/components/ActionLoader";
import { colors, shadow } from "@/constants/theme";
import {
  getEmailValidationError,
  getPasswordStrength,
  PASSWORD_STRENGTH_COPY,
  passwordHasNumberAndSpecialChar,
} from "@/lib/authValidation";
import { useApp } from "@/providers/AppProvider";

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, user, signUp } = useApp();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/categories");
  }, [ready, user, router]);

  if (ready && user) return <Redirect href="/categories" />;

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthUi = passwordStrength
    ? PASSWORD_STRENGTH_COPY[passwordStrength]
    : null;

  const initials =
    fullName.trim().charAt(0).toUpperCase() ||
    email.trim().charAt(0).toUpperCase() ||
    "?";

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function onSubmit() {
    setError(null);
    setFullNameError(null);
    setPhoneError(null);
    setAddressError(null);
    setEmailError(null);
    setPasswordError(null);

    const requiredMessage = "This field needs to be filled";
    let hasEmpty = false;
    if (!fullName.trim()) {
      setFullNameError(requiredMessage);
      hasEmpty = true;
    }
    if (!phone.trim()) {
      setPhoneError(requiredMessage);
      hasEmpty = true;
    }
    if (!address.trim()) {
      setAddressError(requiredMessage);
      hasEmpty = true;
    }
    if (!email.trim()) {
      setEmailError(requiredMessage);
      hasEmpty = true;
    }
    if (!password) {
      setPasswordError(requiredMessage);
      hasEmpty = true;
    }
    if (hasEmpty) return;

    const emailValidationError = getEmailValidationError(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    if (!passwordHasNumberAndSpecialChar(password)) {
      setPasswordError(
        "The password must contain characters and numbers (ex: /, _, *, etc..)",
      );
      return;
    }

    if (getPasswordStrength(password) !== "strong") {
      setPasswordError("Please choose a strong password");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName,
        phone,
        address,
        email,
        password,
        avatarUri,
      });
      router.replace("/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <ActionLoader message="Creating account..." />}
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.hero, shadow]}>
            <Text style={styles.eyebrow}>FreshLane</Text>
            <Text style={styles.heroTitle}>
              Groceries from every aisle, ready for your cart.
            </Text>
            <Text style={styles.heroBody}>
              Sign up to browse meat, produce, dairy, pantry staples, and more —
              then checkout when you&apos;re ready.
            </Text>
          </View>

          <View style={[styles.card, shadow]}>
            <Text style={styles.cardTitle}>Create a new account</Text>
            <Text style={styles.cardSub}>
              Already shopping with us?{" "}
              <Link href="/login" style={styles.link}>
                Sign in
              </Link>
            </Text>

            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Profile picture</Text>
                <View style={styles.avatarActions}>
                  <Pressable style={styles.secondaryBtn} onPress={() => void pickAvatar()}>
                    <Text style={styles.secondaryBtnText}>
                      {avatarUri ? "Change photo" : "Choose photo"}
                    </Text>
                  </Pressable>
                  {avatarUri && (
                    <Pressable onPress={() => setAvatarUri(null)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            <Field
              label="Full name"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                if (fullNameError) setFullNameError(null);
              }}
              error={fullNameError}
              placeholder="Your name"
              autoComplete="name"
            />
            <Field
              label="Phone number"
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                if (phoneError) setPhoneError(null);
              }}
              error={phoneError}
              placeholder="e.g. 05XXXXXXXX"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <Field
              label="Address"
              value={address}
              onChangeText={(v) => {
                setAddress(v);
                if (addressError) setAddressError(null);
              }}
              error={addressError}
              placeholder="Street, city"
              autoComplete="street-address"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (emailError) setEmailError(null);
              }}
              error={emailError}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (passwordError) setPasswordError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.inkSoft}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    passwordError && styles.inputError,
                  ]}
                />
                <Pressable
                  style={styles.eye}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.inkSoft} />
                  ) : (
                    <Eye size={20} color={colors.inkSoft} />
                  )}
                </Pressable>
              </View>
              {passwordError && (
                <Text style={styles.fieldError}>{passwordError}</Text>
              )}
              {!passwordError && passwordStrengthUi && (
                <Text
                  style={[
                    styles.strength,
                    { color: colors[passwordStrengthUi.colorKey] },
                  ]}
                >
                  {passwordStrengthUi.label}
                </Text>
              )}
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.fieldError}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.submit, loading && styles.disabled]}
              onPress={() => void onSubmit()}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? "Please wait..." : "Create account"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

function Field({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string | null;
} & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.inkSoft}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingHorizontal: 16, gap: 24 },
  hero: {
    backgroundColor: colors.leaf,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,253,248,0.15)",
    color: colors.cream,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroTitle: {
    color: colors.cream,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: "Fraunces_600SemiBold",
  },
  heroBody: {
    marginTop: 14,
    color: "rgba(255,253,248,0.85)",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "rgba(255,253,248,0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 24,
  },
  cardTitle: {
    fontSize: 28,
    color: colors.ink,
    fontFamily: "Fraunces_600SemiBold",
  },
  cardSub: { marginTop: 8, fontSize: 14, color: colors.inkSoft },
  link: { color: colors.leaf, fontWeight: "700" },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.leaf,
  },
  avatarActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: "600", color: colors.ink },
  removeText: { fontSize: 12, fontWeight: "600", color: colors.inkSoft, paddingVertical: 6 },
  field: { marginTop: 14 },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkSoft,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  passwordWrap: { position: "relative" },
  passwordInput: { paddingRight: 44 },
  eye: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  fieldError: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 13,
    fontWeight: "500",
  },
  strength: { marginTop: 6, fontSize: 13, fontWeight: "500" },
  errorBox: {
    marginTop: 12,
    backgroundColor: "rgba(180,35,24,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  submit: {
    marginTop: 20,
    backgroundColor: colors.leaf,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: colors.cream, fontSize: 16, fontWeight: "700" },
  disabled: { opacity: 0.6 },
});
