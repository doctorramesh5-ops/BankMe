import React from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector,useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import {logout} from '../../store/authSlice';

export default function ProfileScreen({navigation}:any) {
  const {theme,themeKey,setTheme} = useTheme();
  const user = useSelector((s:RootState)=>s.auth.user);
  const dispatch = useDispatch();
  const rc:any={admin:'#ef4444',whitelabel:'#8b5cf6',superdist:'#f59e0b',distributor:'#06b6d4',retailer:'#10b981',customer:'#3b82f6'};
  const roleColor = rc[user?.role||'customer'];
  const themes = [{key:'dark',label:'Dark',color:'#040810'},{key:'light',label:'Light',color:'#ffffff'},{key:'blue',label:'Blue',color:'#0a1628'}];
  const doLogout = () => {
    Alert.alert('Logout','Are you sure you want to logout?',[
      {text:'Cancel',style:'cancel'},
      {text:'Logout',style:'destructive',onPress:()=>dispatch(logout())}
    ]);
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        <View style={{paddingHorizontal:20,paddingVertical:16}}>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text}}>Profile</Text>
        </View>
        <View style={{alignItems:'center',paddingVertical:24}}>
          <View style={{width:80,height:80,borderRadius:40,borderWidth:3,borderColor:roleColor,backgroundColor:roleColor+'20',alignItems:'center',justifyContent:'center',marginBottom:12}}>
            <Text style={{fontSize:32,fontWeight:'900',color:roleColor}}>{(user?.name||'U')[0].toUpperCase()}</Text>
          </View>
          <Text style={{fontSize:20,fontWeight:'800',color:theme.text,marginBottom:4}}>{user?.name}</Text>
          <Text style={{fontSize:14,color:theme.muted2,marginBottom:8}}>{user?.phone}</Text>
          <View style={{paddingHorizontal:12,paddingVertical:4,borderRadius:100,backgroundColor:roleColor+'20',borderWidth:1,borderColor:roleColor}}>
            <Text style={{fontSize:12,fontWeight:'700',color:roleColor}}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>
        <View style={{marginHorizontal:20,borderRadius:16,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:16,marginBottom:16}}>
          <Text style={{fontSize:13,fontWeight:'700',color:theme.muted2,marginBottom:12,textTransform:'uppercase',letterSpacing:0.5}}>Account Info</Text>
          {[
            {label:'Mobile',value:user?.phone||'-'},
            {label:'Email',value:user?.email||'Not set'},
            {label:'KYC Status',value:user?.kyc?.toUpperCase()||'PENDING'},
            {label:'Wallet',value:'₹'+(user?.wallet||0).toLocaleString('en-IN')},
            {label:'RTAI Score',value:(user?.rtaiScore||0).toString()},
            {label:'Member Since',value:user?.joined||'-'},
          ].map((item,i)=>(
            <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:i<5?1:0,borderBottomColor:theme.border}}>
              <Text style={{fontSize:14,color:theme.muted2}}>{item.label}</Text>
              <Text style={{fontSize:14,fontWeight:'600',color:theme.text}}>{item.value}</Text>
            </View>
          ))}
        </View>
        <View style={{marginHorizontal:20,borderRadius:16,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:16,marginBottom:16}}>
          <Text style={{fontSize:13,fontWeight:'700',color:theme.muted2,marginBottom:12,textTransform:'uppercase',letterSpacing:0.5}}>🎨 Theme</Text>
          <View style={{flexDirection:'row',gap:10}}>
            {themes.map(t=>(
              <TouchableOpacity key={t.key} onPress={()=>setTheme(t.key as any)}
                style={{flex:1,padding:12,borderRadius:12,borderWidth:2,borderColor:themeKey===t.key?theme.primary:theme.border,backgroundColor:t.color,alignItems:'center'}}>
                <Text style={{fontSize:12,fontWeight:'700',color:themeKey===t.key?theme.primary:'#888'}}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{marginHorizontal:20,marginBottom:16}}>
          <TouchableOpacity onPress={doLogout}
            style={{backgroundColor:'rgba(239,68,68,0.1)',borderWidth:1,borderColor:'rgba(239,68,68,0.3)',borderRadius:14,padding:16,alignItems:'center'}}>
            <Text style={{color:'#ef4444',fontWeight:'700',fontSize:15}}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={{alignItems:'center',paddingBottom:20}}>
          <Text style={{fontSize:11,color:theme.muted}}>BankMe v2.0.0 · PayPe Technologies</Text>
          <Text style={{fontSize:11,color:theme.muted,marginTop:2}}>PCI DSS · RTAI · RBI Compliant</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}