//this file is mainly for the main login page whereas the auth stuff is
//i also used stack navigation which is one of my advanced implmenetations
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useState } from "react";
import { NavigationContainer, StackActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Post from "./Post";
import useSession from "./useSession";
import db from "./db";
import Theme from "./assets/theme";
const Stack = createStackNavigator(); //i used https://reactnative.dev/docs/navigation to learn about navigation

function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both an email and password");
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await db.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          Alert.alert("Login Failed", error.message);
        } else {
          Alert.alert("Logged in successfully!");
          //navigation.dispatch(StackActions.replace("Good Status"));
        }
      } else {
        //signup for an account
        const { data, error } = await db.auth.signUp({
          email,
          password,
        });
        if (error) {
          Alert.alert("Signup Failed", error.message);
        } else {
          Alert.alert("Account created successfully!");
        }
      }
    } catch (error) {
      //console.error(error);
    }
  };

  return (
    //user has two options: make an account or login to current account (which is logged into supabase db and pw is case sensitive)
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <FontAwesome name="handshake-o" size={24} color="#0f2018" />
        <Text style={styles.title}>Good Status</Text>
        <FontAwesome name="handshake-o" size={24} color="#0f2018" />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.header}>
          {isLogin ? "Login to Your Account" : "Sign Up for a New Account"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isLogin ? "Login" : "Sign Up"}</Text>
        </Pressable>
        <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const session = useSession(); // Get the current session
  //https://reactnative.dev/docs/navigation for return navigation help
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={session ? "Good Status" : "Good Status Account"}
        screenOptions={{
          headerStyle: { backgroundColor: "#065535" },
          headerTintColor: "#c9e3d7",
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Cochin",
            fontSize: 25,
          },
        }}
      >
        {!session ? (
          <Stack.Screen
            name="Good Status Account"
            component={LoginScreen}
            options={{ title: "Good Status Account" }}
          />
        ) : (
          <Stack.Screen
            name="Good Status"
            component={Post} // to go to feed
            options={{
              headerLeft: null,
              gestureEnabled: false,
              title: "Good Status",
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4ea27a",
    padding: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.sizes.large,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: Theme.sizes.small,
    marginRight: Theme.sizes.small,
    color: Theme.colors.textGreen,
  },
  formContainer: {
    width: "80%",
    padding: Theme.sizes.large,
    backgroundColor: Theme.colors.backgroundSecondary,
    borderRadius: Theme.sizes.small,
    shadowColor: Theme.colors.textGreen,
    shadowOpacity: 0.1,
  },
  header: {
    fontSize: Theme.sizes.large,
    fontWeight: "bold",
    marginBottom: Theme.sizes.small,
    textAlign: "center",
    color: "#173024",
  },
  input: {
    borderWidth: 1,
    borderColor: "#fbf7f5",
    borderRadius: 5,
    padding: Theme.sizes.small,
    marginVertical: Theme.sizes.small,
    fontSize: Theme.sizes.medium,
  },
  button: {
    backgroundColor: Theme.colors.textGreen,
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: Theme.sizes.small,
  },
  buttonText: {
    color: "#fbf7f5",
    fontSize: Theme.sizes.medium,
    fontWeight: "bold",
  },
  toggleText: {
    marginTop: Theme.sizes.small,
    color: Theme.colors.textGreen,
    textAlign: "center",
  },
});
