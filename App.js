import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Homepage from './src/screens/Homepage'
import Cardpage from './src/screens/Card'
import Schedulepage from './src/screens/Schedule';
import Settingpage from './src/screens/Setting';

const Stacks = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function HomeTab(){
  return(
    <Stacks.Navigator>
      <Stacks.Screen name="Homepage" component={Homepage}/>  
    </Stacks.Navigator>
  )
}

function CardTab(){
  return(
    <Stacks.Navigator>
      <Stacks.Screen name="Cardpage" component={Cardpage}/>  
    </Stacks.Navigator>
  )
}

function ScheduleTab(){
  return(
    <Stacks.Navigator>
      <Stacks.Screen name="Schedulepage" component={Schedulepage}/>  
    </Stacks.Navigator>
  )
}

function SettingTab(){
  return(
    <Stacks.Navigator>
      <Stacks.Screen name="Settingpage" component={Settingpage}/>  
    </Stacks.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tabs.Navigator screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="HomeTab" component={HomeTab} />
        <Tabs.Screen name="CardTab" component={CardTab} />
        <Tabs.Screen name="ScheduleTab" component={ScheduleTab}/>
        <Tabs.Screen name="SettingTab" component={SettingTab}/>
      </Tabs.Navigator>
    </NavigationContainer>
  );
}