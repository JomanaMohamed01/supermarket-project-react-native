import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { colors } from "@/constants/theme";
import { ActionLoader } from "@/components/ActionLoader";
import { OrderPlacingGate } from "@/components/OrderPlacingGate";
import { ToastLayer } from "@/components/ToastLayer";
import { subscribeAccountCreating } from "@/lib/accountCreation";
import { AppProvider } from "@/providers/AppProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [creatingAccount, setCreatingAccount] = useState(false);

  useEffect(() => subscribeAccountCreating(setCreatingAccount), []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <AppProvider>
        <View style={{ flex: 1 }}>
          <ToastLayer>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.cream },
                animation: creatingAccount ? "none" : "fade",
              }}
            />
          </ToastLayer>
          <OrderPlacingGate />
          {creatingAccount ? (
            <ActionLoader message="Creating account..." />
          ) : null}
        </View>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
