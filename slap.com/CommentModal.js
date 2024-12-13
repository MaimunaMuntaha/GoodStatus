import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Theme from "./assets/theme.js";
import Comment from "./Comment.js";
import db from "./db.js";
import useSession from "./useSession";

export default function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession(); // for current session
  const user = session?.user; // find the user's username

  // fetch "shared stories" for a specific user
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db
        .from("comments")
        .select(
          `
          id,
          user_id,
          text,
          created_at,
          profiles!comments_user_id_fkey (
            username
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setComments(data || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  // to add a new comment
  const addComment = async () => {
    try {
      const { data, error } = await db
        .from("comments")
        .insert([{ post_id: postId, text: newComment, user_id: user.id }])
        .select();
      if (error) throw error;
      setComments((prev) => [data[0], ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    //how the app looks/renders
    <View style={styles.container}>
      <Text style={styles.title}>Shared Stories</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Comment
            username={item.profiles?.username}
            timestamp={new Date(item.created_at).toLocaleString()}
            text={item.text}
          />
        )}
        contentContainerStyle={styles.commentsList}
      />

      <TextInput
        style={styles.input}
        placeholder="Write a comment..."
        value={newComment}
        onChangeText={setNewComment}
      />
      <TouchableOpacity style={styles.button} onPress={addComment}>
        <Text style={styles.buttonText}>Share your Story</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
    padding: Theme.sizes.large,
  },
  title: {
    marginTop: 50,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: Theme.sizes.large,
    color: Theme.colors.textPrimary,
  },
  commentsList: {
    marginBottom: Theme.sizes.medium,
  },
  input: {
    borderColor: Theme.colors.borderPrimary,
    borderWidth: 1,
    borderRadius: Theme.sizes.small,
    padding: Theme.sizes.small,
  },
  button: {
    backgroundColor: Theme.colors.backgroundSecondary,
    borderRadius: 100,
    padding: Theme.sizes.small,
    marginTop: Theme.sizes.small,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontFamily: "Cochin",
  },
  closeButton: {
    marginTop: Theme.sizes.large,
    alignItems: "center",
    backgroundColor: Theme.colors.textSecondary,
    borderRadius: Theme.sizes.large,
  },
  closeText: {
    fontSize: Theme.sizes.medium,
    padding: Theme.sizes.small,
    fontFamily: "Cochin",
  },
});
