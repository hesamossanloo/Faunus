// app/(tabs)/index.tsx

import { auth, db } from "@/services/firebaseConfig";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { doc, getDoc } from "firebase/firestore";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    // Get the currently logged-in user from Firebase Auth
    const currentUser = auth.currentUser;
    setUser(currentUser);

    // Fetch user-specific data from Firestore if the user is logged in
    if (currentUser) {
      fetchUserData(currentUser.uid);
    }
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("You have been logged out.");
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return user ? (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to SkogApp!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.userInfoContainer}>
        <HelloWave />
        <ThemedText type="subtitle">Logged in as:</ThemedText>
        <ThemedText>Username: {user.email}</ThemedText>
        {userData && (
          <View style={styles.userDataContainer}>
            <ThemedText>Firstname: {userData.firstName}</ThemedText>
            <ThemedText>Lastname: {userData.lastName}</ThemedText>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  ) : null;
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userInfoContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  userDataContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    marginTop: 16,
    borderRadius: 5,
    alignItems: "center",
  },
});
