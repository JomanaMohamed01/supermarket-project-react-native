import { Link, Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { useApp } from "@/providers/AppProvider";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, user, signIn, usingMockData } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) {
      router.replace("/categories");
    }
  }, [ready, user, router]);

  if (ready && user) {
    return <Redirect href="/categories" />;
  }

  async function onSubmit() {
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    const requiredMessage = "This field needs to be filled";
    let hasEmpty = false;
    if (!email.trim()) {
      setEmailError(requiredMessage);
      hasEmpty = true;
    }
    if (!password) {
      setPasswordError(requiredMessage);
      hasEmpty = true;
    }
    if (hasEmpty) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <ActionLoader message="Signing in..." />}
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
              Sign in to browse meat, produce, dairy, pantry staples, and more —
              then checkout when you&apos;re ready.
            </Text>
            {usingMockData && (
              <Text style={styles.mockNote}>
                Running with local demo data. Connect Supabase when you&apos;re
                ready.
              </Text>
            )}
          </View>

          <View style={[styles.card, shadow]}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>
              New here?{" "}
              <Link href="/signup" style={styles.link}>
                Sign up
              </Link>
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (emailError) setEmailError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholder="you@email.com"
                placeholderTextColor={colors.inkSoft}
                style={[styles.input, emailError && styles.inputError]}
              />
              {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (passwordError) setPasswordError(null);
                    if (error) setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
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
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
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
                {loading ? "Please wait..." : "Sign in"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
    overflow: "hidden",
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
  mockNote: {
    marginTop: 16,
    color: colors.citrus,
    fontSize: 13,
    fontWeight: "600",
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
  cardSub: {
    marginTop: 8,
    fontSize: 14,
    color: colors.inkSoft,
  },
  link: {
    color: colors.leaf,
    fontWeight: "700",
  },
  field: { marginTop: 16 },
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
  submitText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: { opacity: 0.6 },
});
