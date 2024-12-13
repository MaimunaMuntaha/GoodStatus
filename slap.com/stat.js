import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
} from "react-native";
import db from "./db.js";
import Theme from "./assets/theme.js";
import useSession from "./useSession.js";
import * as ImagePicker from "expo-image-picker"; //i used https://docs.expo.dev/versions/latest/sdk/imagepicker/ for picking imgs because it laid out how to use 3rd party functions in my app

export default function NewPostModal({ visible, onClose }) {
  const [username, setUsername] = useState(""); // Default username
  const [inputText, setInputText] = useState("");
  const [feeling, setFeeling] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);

  const session = useSession(); //to get the current session/authorization

  // to get the username as soon as the modal opens up in feed
  useEffect(() => {
    const fetchUsername = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await db
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        setUsername(data?.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [session]);

  const emojis = [
    //i am biased but these are my favorite emojis
    "🫥",
    "😭",
    "😡",
    "🤑",
    "🤔",
    "🥰",
    "😴",
    "🤩",
    "😱",
    "😜",
    "🤯",
    "😈",
    "🤗",
    "😻",
    "🥳",
    "😔",
    "💖",
    "🫶",
    "🎶",
    "🤝",
  ];
  const pickImage = async () => {
    //i used https://docs.expo.dev/versions/latest/sdk/imagepicker/ for how to use image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitPost = async () => {
    setIsLoading(true);
    try {
      const userId = session?.user?.id;

      if (!userId) {
        console.error("User not logged in.");
        setIsLoading(false);
        return;
      }

      // fetch the current user post
      const { data: existingPost, error: fetchError } = await db
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingPost) {
        // update the past user post with this new one
        const { error: updateError } = await db
          .from("posts")
          .update({
            text: inputText,
            feeling: feeling,
            image: image,
            updated_at: new Date(),
          })
          .eq("id", existingPost.id);

        if (updateError) {
          console.error("Error updating post:", updateError);
          setIsLoading(false);
          return;
        }
      } else {
        // or if the user doesn't have any posts, then insert one into supabase
        const { error: errorInserting } = await db.from("posts").insert([
          {
            username: username,
            text: inputText,
            feeling: feeling,
            image: image,
            user_id: userId,
          },
        ]);
        if (errorInserting) {
          console.error("Error making a new post:", errorInserting);
          setIsLoading(false);
          return;
        }
      }

      onClose(); // Close the modal after the new post
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setIsLoading(false);
  };

  const submitDisabled = isLoading || inputText.length === 0 || !feeling;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Status Update</Text>
            <TouchableOpacity onPress={submitPost} disabled={submitDisabled}>
              <Text
                style={[
                  submitDisabled ? styles.disabledSubmit : styles.Submit,
                  { fontWeight: "bold" },
                ]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <Text style={styles.usernameStatus}>
              <Text style={styles.username}>{username}'s </Text> Status Update
            </Text>
            <TextInput
              style={[styles.input]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="How is everything going?"
              placeholderTextColor={Theme.colors.text}
              multiline //this is so the how is everything going text is at the top of the input box
              textAlignVertical="top"
            />
            <Text style={styles.label}>Feeling:</Text>
            <View style={styles.emojiContainer}>
              {emojis.map(
                (
                  emoji //so for maps, i created an array of my favorite emojis from https://getemoji.com/ and then i used the map function so users could select one of the emojis from the array https://www.geeksforgeeks.org/how-to-use-map-to-create-lists-in-reactjs/
                ) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiButton,
                      feeling === emoji && styles.selectedEmoji,
                    ]}
                    onPress={() => setFeeling(emoji)}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadButtonText}>Upload an Image</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} /> //upload an image for your status
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: Theme.colors.textBlue,
    padding: Theme.sizes.small,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Theme.sizes.small,
  },
  uploadButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.medium,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    borderRadius: Theme.sizes.large,
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: Theme.sizes.large,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Theme.sizes.small,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    textAlign: "center",
  },
  cancelButton: {
    padding: Theme.sizes.small,
  },
  cancelText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.medium,
  },
  Submit: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.medium,
  },
  disabledSubmit: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.sizes.medium,
  },
  content: {
    marginTop: Theme.sizes.medium,
  },
  usernameStatus: {
    fontSize: Theme.sizes.medium,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.sizes.small,
  },
  username: {
    fontWeight: "bold",
    color: Theme.colors.textGreen,
  },
  input: {
    marginTop: 5,
    color: Theme.colors.textGreen,
    backgroundColor: Theme.colors.backgroundSecondary,
    padding: Theme.sizes.medium,
    textAlignVertical: "top",
    fontSize: Theme.sizes.medium,
    borderRadius: Theme.sizes.small,
    height: 100,
  },
  label: {
    fontSize: Theme.sizes.textMedium,
    color: Theme.colors.textPrimary,
    marginVertical: Theme.sizes.small,
  },
  emojiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Theme.sizes.small,
  },
  emojiButton: {
    padding: Theme.sizes.small,
    margin: 5,
    borderRadius: Theme.sizes.small,
    backgroundColor: Theme.colors.backgroundSecondary,
    alignItems: "center",
  },
  selectedEmoji: {
    backgroundColor: Theme.colors.textGreen,
  },
  emoji: {
    fontSize: 24,
  },
});
