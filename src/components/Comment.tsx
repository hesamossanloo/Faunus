// create a FC for comments
import { Colors } from "@/constants/Colors";
import { auth, db } from "@/services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface CommentProps {
  comment: string;
  setComment: (comment: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comment, setComment }) => {
  const [commentSaved, setCommentSaved] = useState(false);
  const theme = useColorScheme() ?? "light";
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data) {
              setComment(data.comment);
            }
          }
        })
        .catch((error) => {
          console.error("Error getting user document: ", error);
        });
    }
  }, []);

  const handleSaveComment = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(
          userDocRef,
          {
            comment,
          },
          { merge: true },
        );
        console.log("Comment saved successfully for user: ", user.uid);
        setCommentSaved(true);
        setTimeout(() => {
          setCommentSaved(false);
        }, 2000);
      } catch (error) {
        console.error("Error saving comment: ", error);
        Alert.alert("Error saving comment");
      }
    } else {
      Alert.alert("User not logged in");
    }
  };
  return (
    <View
      style={{
        flex: 1,
        position: "absolute",
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 5,
      }}
    >
      <TextInput
        placeholder="Write a comment"
        multiline
        value={comment}
        onChangeText={setComment}
        style={{
          height: 100,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          padding: 5,
        }}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveComment}>
        <Text>Save Comment</Text>
      </TouchableOpacity>
      {commentSaved && (
        <Ionicons
          name="checkmark-circle"
          style={{ marginTop: 10, alignSelf: "center" }}
          size={28}
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default Comment;
