import { useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const APP_URL = "https://ycstartup-app.vercel.app";

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdfdf8" />
      <WebView
        ref={webviewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
        allowsBackForwardNavigationGestures
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdf8",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fdfdf8",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#fdfdf8",
    alignItems: "center",
    justifyContent: "center",
  },
});
