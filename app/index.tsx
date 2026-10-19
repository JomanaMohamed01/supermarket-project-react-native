import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/constants/theme";
import { useApp } from "@/providers/AppProvider";

export default function Index() {
  const { ready, user } = useApp();

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.cream,
        }}
      >
        <ActivityIndicator color={colors.leaf} size="large" />
      </View>
    );
  }

  return <Redirect href={user ? "/categories" : "/login"} />;
}
