import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Auth from './pages/Auth'; // Your auth component
import Home from './pages/Home'
import React from 'react';
import WorkerTasksScreen from './pages/WorkerTasksScreen'; // Your task list component
import User from './pages/User';
import { Provider as PaperProvider } from 'react-native-paper';

const Stack = createStackNavigator();


export default function App() {
    return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen name="Auth" component={Auth} options={{ headerShown:false}}/> 
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="User" component={User} /> 
          <Stack.Screen name="WorkerTasks" component={WorkerTasksScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider> 
    );
}


