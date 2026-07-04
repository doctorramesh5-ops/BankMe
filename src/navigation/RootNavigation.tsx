import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {useTheme} from '../theme/ThemeContext';
import {View,Text,Platform} from 'react-native';

import SplashScreen from '../screens/Auth/SplashScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/Dashboard/HomeScreen';
import ServicesScreen from '../screens/Services/ServicesScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AEPSScreen from '../screens/Services/AEPSScreen';
import DMTScreen from '../screens/Services/DMTScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import BBPSScreen from '../screens/Services/BBPSScreen';
import UPIScreen from '../screens/Services/UPIScreen';
import ERupeeScreen from '../screens/Services/ERupeeScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({icon,label,focused,color}:any) => (
  <View style={{alignItems:'center',justifyContent:'center',paddingTop:4,width:60}}>
    <Text style={{fontSize:22,marginBottom:2,opacity:focused?1:0.5}}>{icon}</Text>
    <Text style={{fontSize:9,fontWeight:'700',color,opacity:focused?1:0.5}}>{label}</Text>
  </View>
);

function MainTabs() {
  const {theme} = useTheme();
  const user = useSelector((s:RootState)=>s.auth.user);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:false,
        tabBarShowLabel:false,
        tabBarActiveTintColor:theme.primary,
        tabBarInactiveTintColor:theme.muted,
        tabBarStyle:{
          position:'absolute',
          bottom:0,left:0,right:0,
          backgroundColor:theme.tabBar,
          borderTopColor:theme.tabBorder,
          borderTopWidth:1,
          height:Platform.OS==='ios'?85:62,
          paddingBottom:Platform.OS==='ios'?28:8,
          paddingTop:6,
          elevation:12,
          shadowColor:'#000',
          shadowOffset:{width:0,height:-3},
          shadowOpacity:0.15,
          shadowRadius:8,
        },
      }}>
      <Tab.Screen name='Home' component={HomeScreen}
        options={{tabBarIcon:({focused,color})=><TabIcon icon='🏠' label='Home' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Services' component={ServicesScreen}
        options={{tabBarIcon:({focused,color})=><TabIcon icon='⚡' label='Services' focused={focused} color={color}/>}}/>
      <Tab.Screen name='History' component={HistoryScreen}
        options={{tabBarIcon:({focused,color})=><TabIcon icon='📊' label='History' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Wallet' component={WalletScreen}
        options={{tabBarIcon:({focused,color})=><TabIcon icon='💰' label='Wallet' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Profile' component={ProfileScreen}
        options={{tabBarIcon:({focused,color})=>(
          <View style={{alignItems:'center',paddingTop:4}}>
            <View style={{width:28,height:28,borderRadius:14,borderWidth:2,borderColor:focused?theme.primary:theme.muted,backgroundColor:focused?theme.primary+'20':'transparent',alignItems:'center',justifyContent:'center',marginBottom:2}}>
              <Text style={{fontSize:13,fontWeight:'900',color:theme.primary}}>{(user?.name||'U')[0].toUpperCase()}</Text>
            </View>
            <Text style={{fontSize:9,fontWeight:'700',color,opacity:focused?1:0.5}}>Profile</Text>
          </View>
        )}}/>
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  const {isAuthenticated} = useSelector((s:RootState)=>s.auth);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        {isAuthenticated?(
          <>
            <Stack.Screen name='Main' component={MainTabs}
              options={{animation:'fade'}}/>
            <Stack.Screen name='AEPS' component={AEPSScreen}
              options={{animation:'slide_from_right',gestureEnabled:true,gestureDirection:'horizontal'}}/>
            <Stack.Screen name='DMT' component={DMTScreen}
              options={{animation:'slide_from_right'}}/>
            <Stack.Screen name='BBPS' component={BBPSScreen}
              options={{animation:'slide_from_right'}}/>
           <Stack.Screen name='UPI' component={UPIScreen}
              options={{animation:'slide_from_right'}}/>
            <Stack.Screen name='ERupee' component={ERupeeScreen}
              options={{animation:'slide_from_right'}}/>
      </>
          
        ):(
          <>
            <Stack.Screen name='Splash' component={SplashScreen} options={{animation:'fade'}}/>
            <Stack.Screen name='Onboarding' component={OnboardingScreen} options={{animation:'slide_from_right'}}/>
            <Stack.Screen name='Login' component={LoginScreen} options={{animation:'slide_from_right'}}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}