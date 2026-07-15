import React, { useEffect, useRef } from "react";
import { Animated, Platform, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoginScreen from "../screens/Login";
import Homepage from "../screens/Homepage";
import Cardpage from "../screens/Card";
import ChatbotPage from "../screens/Chatbot";
import AnnouncementsScreen from "../screens/announcements/Announcements";

import Settingpage from "../screens/Settings/Setting";
import NotificationSettingPage from "../screens/Settings/NotificationSettingPage";
import LanguagePage from "../screens/Settings/LanguagePage";
import SecurityPage from "../screens/Settings/SecurityPage";
import ContactUsPage from "../screens/Settings/ContactUsPage";
import Research from "../screens/expert/Research";
import ResearchList from "../screens/expert/ResearchList";
import ProfileForm from "../screens/expert/profile/ProfileForm";
import EducationForm from "../screens/expert/profile/EducationForm";
import WorkHistoryForm from "../screens/expert/profile/WorkHistoryForm";
import AdminHistoryForm from "../screens/expert/profile/AdminHistoryForm";
import ExpertiseForm from "../screens/expert/forms/ExpertiseForm";
import InterestForm from "../screens/expert/forms/InterestForm";
import ResearchForm from "../screens/expert/forms/ResearchForm";
import JournalForm from "../screens/expert/forms/JournalForm";
import ProceedingForm from "../screens/expert/forms/ProceedingForm";
import BookForm from "../screens/expert/forms/BookForm";
import PatentForm from "../screens/expert/forms/PatentForm";
import AwardForm from "../screens/expert/forms/AwardForm";
import SpeakerForm from "../screens/expert/forms/SpeakerForm";
import TrainingForm from "../screens/expert/forms/TrainingForm";
import ServiceForm from "../screens/expert/forms/ServiceForm";
import HumanSubjectsForm from "../screens/expert/forms/HumanSubjectsForm";
import NotificationsScreen from "../screens/notifications/Notifications";
import InAppBrowser from "../screens/shared/InAppBrowser";
import EResearch from "../screens/e-research/EResearch";
import ProfileDetail from "../screens/expert/ProfileDetail";

const RootStack = createNativeStackNavigator();
const SettingStackNav = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AnimatedTabIcon({ name, focused, color }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pillScale = useRef(new Animated.Value(focused ? 1 : 0.7)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          useNativeDriver: Platform.OS !== "web",
          tension: 180,
          friction: 8,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(pillScale, {
          toValue: 1,
          useNativeDriver: Platform.OS !== "web",
          tension: 200,
          friction: 7,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: Platform.OS !== "web",
          tension: 180,
          friction: 8,
        }),
        Animated.timing(pillOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(pillScale, {
          toValue: 0.7,
          useNativeDriver: Platform.OS !== "web",
          tension: 200,
          friction: 7,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 38,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 54,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(15, 122, 85, 0.12)",
          opacity: pillOpacity,
          transform: [{ scale: pillScale }],
        }}
      />
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={name} size={23} color={color} />
      </Animated.View>
    </View>
  );
}

function SettingStack() {
  return (
    <SettingStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingStackNav.Screen name="SettingPage" component={Settingpage} />
      <SettingStackNav.Screen
        name="NotificationSetting"
        component={NotificationSettingPage}
      />
      <SettingStackNav.Screen name="Language" component={LanguagePage} />
      <SettingStackNav.Screen name="Security" component={SecurityPage} />
      <SettingStackNav.Screen name="ContactUs" component={ContactUsPage} />
    </SettingStackNav.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarSafeAreaInsets: { bottom: 0 },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e8ecf0",
          height: 58 + bottom,
          paddingBottom: bottom,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#064e35",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -3 },
          shadowRadius: 8,
        },
        tabBarActiveTintColor: "#0f7a55",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: -0.2,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            HomeTab: focused ? "home" : "home-outline",
            CardTab: focused ? "card" : "card-outline",
            ChatbotTab: focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline",
            SettingTab: focused ? "settings" : "settings-outline",
          };
          return (
            <AnimatedTabIcon
              name={icons[route.name]}
              focused={focused}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen
        name="HomeTab"
        component={Homepage}
        options={{ tabBarLabel: t("tab.home") }}
      />
      <Tabs.Screen
        name="CardTab"
        component={Cardpage}
        options={{ tabBarLabel: t("tab.card") }}
      />
      <Tabs.Screen
        name="ChatbotTab"
        component={ChatbotPage}
        options={{ tabBarLabel: t("tab.chatbot") }}
      />
      <Tabs.Screen
        name="SettingTab"
        component={SettingStack}
        options={{ tabBarLabel: t("tab.settings") }}
      />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="Announcements" component={AnnouncementsScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
      <RootStack.Screen name="Research" component={Research} />
      <RootStack.Screen name="ResearchList" component={ResearchList} />
      <RootStack.Screen name="ProfileForm" component={ProfileForm} />
      <RootStack.Screen name="EducationForm" component={EducationForm} />
      <RootStack.Screen name="WorkHistoryForm" component={WorkHistoryForm} />
      <RootStack.Screen name="AdminHistoryForm" component={AdminHistoryForm} />
      <RootStack.Screen name="ExpertiseForm" component={ExpertiseForm} />
      <RootStack.Screen name="InterestForm" component={InterestForm} />
      <RootStack.Screen name="ResearchForm" component={ResearchForm} />
      <RootStack.Screen name="JournalForm" component={JournalForm} />
      <RootStack.Screen name="ProceedingForm" component={ProceedingForm} />
      <RootStack.Screen name="BookForm" component={BookForm} />
      <RootStack.Screen name="PatentForm" component={PatentForm} />
      <RootStack.Screen name="AwardForm" component={AwardForm} />
      <RootStack.Screen name="SpeakerForm" component={SpeakerForm} />
      <RootStack.Screen name="TrainingForm" component={TrainingForm} />
      <RootStack.Screen name="ServiceForm" component={ServiceForm} />
      <RootStack.Screen
        name="HumanSubjectsForm"
        component={HumanSubjectsForm}
      />
      <RootStack.Screen name="InAppBrowser" component={InAppBrowser} />
      <RootStack.Screen name="EResearch" component={EResearch} />
      <RootStack.Screen name="ProfileDetail" component={ProfileDetail} />
    </RootStack.Navigator>
  );
}
