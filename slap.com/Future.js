import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai"; //https://ai.google.dev/gemini-api/docs#node.js
import Theme from "./assets/theme";

export default function Future() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [savedMessages, setSavedMessages] = useState([]);

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(
    "AIzaSyBKYfJJHlQoSWJkwMnb7eW8onC2gtyBEPU"
  ); //i should probably make an env but oh well
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // generate a journal prompt. i used https://ai.google.dev/gemini-api/docs#node.js
  const generatePrompt = async () => {
    try {
      const journalPrompt =
        "Write a 1-2 sentence journal entry PROMPT that you can use to write to your future self about your current hopes.";
      const result = await model.generateContent(journalPrompt);
      setPrompt(result.response.text());
    } catch (error) {
      console.error("Error generating prompt:", error);
    }
  };

  // Save the user's response
  const saveResponse = () => {
    const newMessage = {
      id: Date.now().toString(),
      prompt,
      response,
      alertTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week later
    };

    setSavedMessages((prev) => [...prev, newMessage]);
    setResponse("");
    Alert.alert(
      "Your journal entry will be sent to your future self in a week!"
    ); //send an alert that confirms the system got your entry submission

    // still need to implement the notificaiton logic fully. maybe instead of notifs ill make a supabase database?
    scheduleNotification(newMessage);
  };

  const scheduleNotification = (message) => {
    console.log("Notification scheduled for:", message.alertTime);
  };

  // generate a prompt using my openai api
  useEffect(() => {
    generatePrompt();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>

      <Button
        title="Generate A New Journal Entry Prompt"
        onPress={generatePrompt}
      />

      <TextInput
        style={styles.input}
        placeholder="Write your journal entry here!"
        value={response}
        onChangeText={setResponse}
        multiline
      />

      <Button title="Save Response" onPress={saveResponse} />

      <Text style={styles.savedMessagesHeader}>Saved Messages:</Text>
      <FlatList
        data={savedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.messagePrompt}>Prompt: {item.prompt}</Text>
            <Text style={styles.messageResponse}>
              Response: {item.response}
            </Text>
            <Text style={styles.messageTime}>
              Alert Time: {item.alertTime.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  ); //okay the notification logic still needs to be fleshed out/ make make a supabase table instead where users can store journal entries?
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.sizes.medium,
    backgroundColor: Theme.colors.backgroundGreen,
  },
  prompt: {
    fontSize: Theme.sizes.medium,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 3,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  savedMessagesHeader: {
    fontSize: 18,
    marginVertical: Theme.sizes.medium,
    fontWeight: "bold",
  },
  message: {
    backgroundColor: Theme.colors.backgroundGreen,
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  messagePrompt: {
    fontSize: 14,
    fontWeight: "bold",
  },
  messageResponse: {
    fontSize: 14,
    marginVertical: 4,
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
  },
});
