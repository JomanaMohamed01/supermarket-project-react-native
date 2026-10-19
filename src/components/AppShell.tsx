import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SiteHeader } from "@/components/SiteHeader";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { colors } from "@/constants/theme";

type AppShellProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function AppShell({ children, scroll = true }: AppShellProps) {
  return (
    <View style={styles.root}>
      <SiteHeader />
      <WelcomeBanner />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
          <Text style={styles.footer}>
            FreshLane Market — shop by aisle, checkout in minutes.
          </Text>
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  flex: {
    flex: 1,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    textAlign: "center",
    fontSize: 13,
    color: colors.inkSoft,
  },
});
