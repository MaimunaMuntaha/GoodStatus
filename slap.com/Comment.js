import { StyleSheet, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Theme from "./assets/theme.js";
export default function Comment({ username, timestamp, text }) {
  return (
    //similar logic to A4 with a few edits to match my current app ui/functionality
    <View style={styles.general}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.body}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.text}>{text}</Text>
          </View>
          <View style={styles.footer}>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  general: {
    backgroundColor: Theme.colors.backgroundSecondary,
    marginTop: Theme.sizes.large,
  },
  container: {
    width: "100%",
    alignItems: "flex-start",
    padding: Theme.sizes.medium,
    backgroundColor: Theme.colors.backgroundSecondary,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    marginTop: 4,
  },
  footer: {
    marginTop: 4,
  },

  text: {
    color: Theme.colors.textGreen,
    fontWeight: "bold",
    fontSize: Theme.sizes.textMedium,
  },
  username: {
    fontWeight: "bold",
    fontSize: Theme.sizes.large,
    color: "#007BFF",
  },
  timestamp: {
    color: Theme.colors.borderPrimary,
    fontSize: Theme.sizes.textSmall,
  },
});
