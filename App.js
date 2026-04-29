import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import LoginScreen from "./src/screens/Login";
import Homepage from "./src/screens/Homepage";
import Cardpage from "./src/screens/Card";
import Schedulepage from "./src/screens/Schedule";
import Settingpage from "./src/screens/Setting";

const Stacks = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#e8ecf0",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#1a6b3c",
        tabBarInactiveTintColor: "#aaa",
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={Homepage}
        options={{
          tabBarLabel: "หน้าหลัก",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="CardTab"
        component={Cardpage}
        options={{
          tabBarLabel: "บัตร",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🪪</Text>,
        }}
      />
      <Tabs.Screen
        name="ScheduleTab"
        component={Schedulepage}
        options={{
          tabBarLabel: "ตาราง",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="SettingTab"
        component={Settingpage}
        options={{
          tabBarLabel: "ตั้งค่า",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stacks.Navigator screenOptions={{ headerShown: false }}>
        {/* Login ไม่มี tab bar */}
        <Stacks.Screen name="Login" component={LoginScreen} />
        {/* หลัง login เข้า MainTabs */}
        <Stacks.Screen name="MainTabs" component={MainTabs} />
      </Stacks.Navigator>
    </NavigationContainer>
  );
}
