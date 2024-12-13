import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import NewPostModal from "./stat.js";
import CommentModal from "./CommentModal.js";
import db from "./db.js";
import useSession from "./useSession.js";
import Theme from "./assets/theme.js";

export default function Feed() {
  const [isModalVisible, setModalVisible] = useState(true);
  const [Posts, setPosts] = useState([]);
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const session = useSession();

  const openComments = (postId) => {
    setSelectedPostId(postId); //choose comments from a specific user. if you click on the user's post, you can access all of their current stories and past shared stories
  };

  const closeComments = () => {
    setSelectedPostId(null);
  };

  // Fetch user's own posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      try {
        const { data, error } = await db
          .from("posts")
          .select("id, user_id, text, feeling, image, created_at, username")
          .eq("user_id", session.user.id); // use user's id to find that user's specific post

        if (error) throw error;

        setPosts(data);
      } catch (err) {
        console.error("Error fetching my posts:", err);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [session]);

  // Fetch friends' posts (using friendships tables from db)
  useEffect(() => {
    const fetchFriendsPosts = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      try {
        const { data, error } = await db
          .from("friendships")
          .select(
            "friend_id, friend_posts:posts(id, user_id, text, feeling, image, created_at, username)"
          );

        if (error) throw error;

        const allFriendsPosts = data
          .map((friendship) => friendship.friend_posts)
          .flat();
        setFriendsPosts(allFriendsPosts);
      } catch (err) {
        console.error("Error fetching friends' posts:", err);
      }
      setIsLoading(false);
    };

    fetchFriendsPosts();
  }, [session]);

  //show the actual posts using posts db table
  const renderPost = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.postContainer}
      onPress={() => openComments(item.id)}
    >
      <Text style={styles.postUsername}>{item.username}'s Status:</Text>
      <View style={styles.postContent}>
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.postText}>{item.text}</Text>
        <Text style={styles.postFeeling}>Feeling: {item.feeling}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    //how app renders
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>My Status</Text>
      <NewPostModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#065535" />
      ) : Posts.length > 0 ? (
        Posts.map(renderPost)
      ) : (
        <Text style={styles.noPostsText}>You didn't make any posts yet 😔</Text>
      )}
      <Text style={styles.headerText}>Friends' Status</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#065535" />
      ) : friendsPosts.length > 0 ? (
        friendsPosts.map(renderPost)
      ) : (
        <Text style={styles.noPostsText}>
          Your friends haven't posted yet 😔
        </Text>
      )}
      <Modal
        visible={!!selectedPostId}
        animationType="slide"
        transparent={false}
      >
        <CommentModal postId={selectedPostId} onClose={closeComments} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Theme.colors.textLightGreen,
    padding: 20,
  },
  headerText: {
    fontSize: 32,
    color: "#065535",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Cochin",
    fontWeight: "bold",
  },
  postContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  postUsername: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065535",
    marginBottom: 10,
  },
  postContent: {
    flexDirection: "column",
    backgroundColor: "#eef5e7",
    padding: 15,
    borderRadius: 8,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
  },
  postFeeling: {
    fontSize: 16,
    textAlign: "right",
    color: "#6d8e6e",
  },
  noPostsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
