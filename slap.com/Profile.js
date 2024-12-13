import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import db from "./db"; // Supabase
import Theme from "./assets/theme";
import useSession from "./useSession"; // Import the session hook

export default function Profile() {
  const navigation = useNavigation();
  const [fetchedUsername, setFetchedUsername] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search field
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [friends, setFriends] = useState([]); // Friends list state
  const [isFetchingFriends, setIsFetchingFriends] = useState(false); // Friends loading state

  const session = useSession(); // Get the current session using the hook

  // friends list
  const fetchFriends = async () => {
    if (!session?.user) return;

    setIsFetchingFriends(true);
    try {
      // friend user ids from friendships table in db
      const { data: friendsData, error: friendsError } = await db
        .from("friendships")
        .select("friend_id")
        .eq("user_id", session.user.id);

      if (friendsError) throw friendsError;

      if (friendsData?.length) {
        const friendIds = friendsData.map((f) => f.friend_id);

        // friend usernames
        const { data: profilesData, error: profilesError } = await db
          .from("profiles")
          .select("id, username")
          .in("id", friendIds);

        if (profilesError) throw profilesError;

        setFriends(profilesData || []);
      } else {
        setFriends([]); // start off with no friends
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsFetchingFriends(false);
    }
  };

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

        setFetchedUsername(data?.username || "");
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
    fetchFriends(); // fetch all the user's friends
  }, [session]);

  const handleCreateUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Username cannot be empty!");
      return;
    }

    if (!session?.user) {
      Alert.alert("No user session found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await db
        .from("profiles")
        .insert({ id: session.user.id, username }, { upsert: true });

      if (error) throw new Error(error.message);
      setUsername("");
    } catch (error) {
      console.error("Error updating username:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const { data, error } = await db
        .from("profiles")
        .select("id, username")
        .ilike("username", `%${searchQuery.trim()}%`);

      if (error) throw new Error(error.message);

      setSearchResults(data || []);
    } catch (error) {
      console.error("Error during search:", error);
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const handleAddFriend = async (friendId) => {
    if (!session || !session.user) {
      Alert.alert("Error", "You must be logged in to add friends.");
      return;
    }

    try {
      const { error } = await db
        .from("friendships")
        .insert([{ user_id: session.user.id, friend_id: friendId }]);

      if (error) throw new Error(error.message);
      fetchFriends(); // new friends were added to the list!
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await db.auth.signOut();
      if (error) {
        return;
      }
      Alert.alert("Success", "Logged out successfully!");
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Good Status Account" }],
        });
      }, 100);
    } catch (error) {}
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Welcome to your Profile:{" "}
        {fetchedUsername || "Please make a username below!"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Create your username here!!"
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />
      <Pressable
        style={styles.button}
        onPress={handleCreateUsername}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Create Username"}
        </Text>
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Search for a username"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item.username}</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => handleAddFriend(item.id)}
            >
              <Text style={styles.addButtonText}>Add Friend</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? "No results found." : ""}
          </Text>
        }
        nestedScrollEnabled
      />

      <Text style={styles.text}>Your Friends:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text>{item.username}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>You have no friends added yet.</Text>
        }
        nestedScrollEnabled
      />

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundSecondary,
    padding: Theme.sizes.large,
  },
  text: {
    fontSize: 30,
    marginBottom: Theme.sizes.large,
    textAlign: "center",
    fontFamily: "Cochin",
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    padding: Theme.sizes.small,
    borderWidth: 1,
    borderColor: Theme.colors.textWhite,
    borderRadius: 5,
    marginBottom: Theme.sizes.large,
    backgroundColor: Theme.colors.textPrimary,
  },
  button: {
    backgroundColor: Theme.colors.textGreen,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: Theme.sizes.large,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.sizes.large,
  },
  buttonText: {
    color: Theme.colors.textLightGreen,
    fontSize: Theme.sizes.medium,
    fontWeight: "bold",
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Theme.sizes.small,
    fontFamily: "Cochin",
    backgroundColor: Theme.colors.backgroundGreen,
  },
  addButton: {
    backgroundColor: Theme.colors.textGreen,
    marginLeft: Theme.sizes.medium,
    borderRadius: 5,
    padding: 5,
  },
  addButtonText: {
    color: Theme.colors.textLightGreen,
    fontWeight: "bold",
  },
  friendItem: {
    backgroundColor: Theme.colors.backgroundGreen,
    padding: Theme.sizes.small,
    width: 200,
    borderBottomColor: Theme.colors.textWhite,
  },
  emptyText: {
    textAlign: "center",
    color: "#999", //grey text
  },
  logoutButton: {
    backgroundColor: Theme.colors.textGreen,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: Theme.sizes.large,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 70,
  },
  logoutButtonText: {
    color: Theme.colors.textLightGreen,
    fontSize: Theme.sizes.medium,
    fontWeight: "bold",
  },
});
