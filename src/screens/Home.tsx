import { StyleSheet, Text, View } from "react-native";
import { useNotification } from "../context/context/NotificationContext";

const Home = () => {
  const { expoPushToken, notification, error } = useNotification();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PushToken: {expoPushToken}</Text>
      <Text style={styles.text}>
        Latest Notification: {notification?.request.content.title}{" "}
        {JSON.stringify(notification?.request.content.data, null, 2)}
      </Text>
      <Text style={styles.text}>Error: {error?.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    color: "white",
  },
});

export default Home;
