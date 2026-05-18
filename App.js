import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "./src/screens/Login";
import Homepage from "./src/screens/Homepage";
import Cardpage from "./src/screens/Card";
import Schedulepage from "./src/screens/Schedule";
import Settingpage from "./src/screens/Setting";
import Research from "./src/screens/research/Research";
//import ResearchList from "./src/screens/research/ResearchList";
import ProfileForm from "./src/screens/research/profile/ProfileForm";
import EducationForm from "./src/screens/research/profile/EducationForm";
import WorkHistoryForm from "./src/screens/research/profile/WorkHistoryForm";
import AdminHistoryForm from "./src/screens/research/profile/AdminHistoryForm";
import ExpertiseForm from "./src/screens/research/forms/ExpertiseForm";
import InterestForm from "./src/screens/research/forms/InterestForm";
import ResearchForm from "./src/screens/research/forms/ResearchForm";
import JournalForm from "./src/screens/research/forms/JournalForm";
import ProceedingForm from "./src/screens/research/forms/ProceedingForm";
import BookForm from "./src/screens/research/forms/BookForm";
import PatentForm from "./src/screens/research/forms/PatentForm";
import AwardForm from "./src/screens/research/forms/AwardForm";
import SpeakerForm from "./src/screens/research/forms/SpeakerForm";
import TrainingForm from "./src/screens/research/forms/TrainingForm";
import ServiceForm from "./src/screens/research/forms/ServiceForm";
import HumanSubjectsForm from "./src/screens/research/forms/HumanSubjectsForm";

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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CardTab"
        component={Cardpage}
        options={{
          tabBarLabel: "บัตร",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ScheduleTab"
        component={Schedulepage}
        options={{
          tabBarLabel: "ตาราง",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SettingTab"
        component={Settingpage}
        options={{
          tabBarLabel: "ตั้งค่า",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stacks.Navigator screenOptions={{ headerShown: false }}>
        <Stacks.Screen name="Login" component={LoginScreen} />
        <Stacks.Screen name="MainTabs" component={MainTabs} />
        <Stacks.Screen name="Research" component={Research} />
        <Stacks.Screen name="ProfileForm" component={ProfileForm} />
        <Stacks.Screen name="EducationForm" component={EducationForm} />
        <Stacks.Screen name="WorkHistoryForm" component={WorkHistoryForm} />
        <Stacks.Screen name="AdminHistoryForm" component={AdminHistoryForm} />
        <Stacks.Screen name="ExpertiseForm" component={ExpertiseForm} />
        <Stacks.Screen name="InterestForm" component={InterestForm} />
        <Stacks.Screen name="ResearchForm" component={ResearchForm} />
        <Stacks.Screen name="JournalForm" component={JournalForm} />
        <Stacks.Screen name="ProceedingForm" component={ProceedingForm} />
        <Stacks.Screen name="BookForm" component={BookForm} />
        <Stacks.Screen name="PatentForm" component={PatentForm} />
        <Stacks.Screen name="AwardForm" component={AwardForm} />
        <Stacks.Screen name="SpeakerForm" component={SpeakerForm} />
        <Stacks.Screen name="TrainingForm" component={TrainingForm} />
        <Stacks.Screen name="ServiceForm" component={ServiceForm} />
        <Stacks.Screen name="HumanSubjectsForm" component={HumanSubjectsForm} />
      </Stacks.Navigator>
    </NavigationContainer>
  );
}
