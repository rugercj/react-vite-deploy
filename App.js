import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/registerscreen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import LoginScreen from './screens/loginscreen';
import SuccessfullScreen from './screens/successfull';
import AdminDashboard from './screens/adminDashboard';
import DrawerNavigator from './screens/drawerNavigator';
import { useWindowDimensions } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {

    const width = useWindowDimensions();
    const isMobile = width < 768;


    useEffect(() => {
      GoogleSignin.configure({
        webClientId: '131854464799-39i3bpnjqv2sm8595ppke4sbp9hl1lmb.apps.googleusercontent.com',
      
    });
  },[]);


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown:false}} />
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false, animation:"slide_from_right"}}/>
        <Stack.Screen name="SuccessfullScreen" component={SuccessfullScreen} options={{headerShown:false, animation:"slide_from_right"}}/>
        <Stack.Screen name="MainApp" component={DrawerNavigator} options={{ headerShown: false,}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}