import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View,Text,Platform} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import HomeScreen from '../screens/Dashboard/HomeScreen';
import ServicesScreen from '../screens/Services/ServicesScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
const Tab = createBottomTabNavigator();
const TabIcon = ({icon,label,focused,color}:any) => (
  <View style={{alignItems:'center',justifyContent:'center',paddingTop:4,width:60}}>
    <Text style={{fontSize:20,marginBottom:2,opacity:focused?1:0.5}}>{icon}</Text>
    <Text style={{fontSize:9,fontWeight:'700',color,opacity:focused?1:0.5,textAlign:'center'}}>{label}</Text>
  </View>
);
export default function BottomNavigation() {
  const {theme} = useTheme();
  const user = useSelector((s:RootState)=>s.auth.user);
  return (
    <Tab.Navigator screenOptions={{headerShown:false,tabBarShowLabel:false,tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted,tabBarStyle:{position:'absolute',bottom:0,left:0,right:0,backgroundColor:theme.tabBar,borderTopColor:theme.tabBorder,borderTopWidth:1,height:Platform.OS==='ios'?85:60,paddingBottom:Platform.OS==='ios'?25:6,paddingTop:6,elevation:10}}}>
      <Tab.Screen name='Home' component={HomeScreen} options={{tabBarIcon:({focused,color})=><TabIcon icon='🏠' label='Home' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Services' component={ServicesScreen} options={{tabBarIcon:({focused,color})=><TabIcon icon='⚡' label='Services' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Transactions' component={TransactionsScreen} options={{tabBarIcon:({focused,color})=><TabIcon icon='📊' label='History' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Wallet' component={WalletScreen} options={{tabBarIcon:({focused,color})=><TabIcon icon='💰' label='Wallet' focused={focused} color={color}/>}}/>
      <Tab.Screen name='Profile' component={ProfileScreen} options={{tabBarIcon:({focused,color})=>(
        <View style={{alignItems:'center',paddingTop:4}}>
          <View style={{width:26,height:26,borderRadius:13,borderWidth:1.5,borderColor:focused?theme.primary:theme.muted,backgroundColor:focused?theme.primary+'20':'transparent',alignItems:'center',justifyContent:'center',marginBottom:2}}>
            <Text style={{fontSize:12,fontWeight:'900',color:theme.primary}}>{(user?.name||'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={{fontSize:9,fontWeight:'700',color,opacity:focused?1:0.5}}>Profile</Text>
        </View>
      )}}/>
    </Tab.Navigator>
  );
}