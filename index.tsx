import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from "react-native";
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/todo");
    }
  }, [isLoaded, isSignedIn]);

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace("/todo");
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  if (!isLoaded) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png" }}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to TaskMate</Text>
      <Text style={styles.subtitle}>Stay organized. Stay productive.</Text>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Image
          source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_%22G%22_Logo.svg" }}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e2f",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 40,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});
