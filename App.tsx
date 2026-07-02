import React from "react";
import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { store } from "./src/store";
import { ThemeProvider } from "./src/theme/ThemeContext";
import RootNavigation from "./src/navigation/RootNavigation";

LogBox.ignoreLogs(["ViewPropTypes","ColorPropType","AsyncStorage"]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <RootNavigation />
            <Toast />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}