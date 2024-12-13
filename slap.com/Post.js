//this file is to set up the tabs when you initially navigate from login into feed
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Entypo from "@expo/vector-icons/Entypo"; //for the icons i chose the same website to find icons from A4
import { StatusBar } from "expo-status-bar";
import Feed from "./Feed";
import Profile from "./Profile";
import Theme from "./assets/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Future from "./Future";

export default function App() {
  const [currentTab, setCurrentTab] = useState("Feed"); // default you initially navigate from login into feed
  //i used A4 designs as inspiration for the tabs
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {currentTab === "Feed" && <Feed shouldNavigateToComments={true} />}
        {currentTab === "Profile" && <Profile />}
        {currentTab === "Future" && <Future />}
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab("Feed")}
        >
          <AntDesign
            name="smileo"
            size={24}
            color={
              currentTab === "Feed"
                ? Theme.colors.tabBarActive
                : Theme.colors.textSecondary
            }
          />
          <Text
            style={{
              color:
                currentTab === "Feed"
                  ? Theme.colors.tabBarActive
                  : Theme.colors.textSecondary,
            }}
          >
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab("Future")}
        >
          <AntDesign
            name="hourglass"
            size={24}
            color={
              currentTab === "Future"
                ? Theme.colors.tabBarActive
                : Theme.colors.textSecondary
            }
          />
          <Text
            style={{
              color:
                currentTab === "Future"
                  ? Theme.colors.tabBarActive
                  : Theme.colors.textSecondary,
            }}
          >
            Future
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentTab("Profile")}
        >
          <Entypo
            name="fingerprint"
            size={24}
            color={
              currentTab === "Profile"
                ? Theme.colors.tabBarActive
                : Theme.colors.textSecondary
            }
          />
          <Text
            style={{
              color:
                currentTab === "Profile"
                  ? Theme.colors.tabBarActive
                  : Theme.colors.textSecondary,
            }}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    marginTop: 40,
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  headerTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: Theme.sizes.small,
  },
  content: {
    flex: 1,
    width: "100%",
    paddingTop: Theme.sizes.small,
  },
  tabContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    height: 70,
    backgroundColor: Theme.colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.tabBarBorder,
    paddingTop: Theme.sizes.small,
    paddingBottom: Theme.sizes.large,
    fontFamily: "Cochin",
  },
  tabButton: {
    fontFamily: "Cochin",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
