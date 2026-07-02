import React from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeContext';

const CATEGORIES = [
  {
    label:'Banking & Payments',
    color:'#10b981',
    services:[
      {id:'aeps',name:'AEPS',icon:'👆',color:'#10b981',desc:'Aadhaar Banking',screen:'AEPS'},
      {id:'dmt',name:'Money Transfer',icon:'💸',color:'#3b82f6',desc:'Send Money',screen:'DMT'},
      {id:'bbps',name:'Bill Pay',icon:'🧾',color:'#f59e0b',desc:'Utility Bills',screen:null},
      {id:'upi',name:'UPI',icon:'📲',color:'#6366f1',desc:'UPI Payments',screen:null},
      {id:'cashin',name:'Cash In',icon:'💵',color:'#22c55e',desc:'Deposit Cash',screen:null},
      {id:'cashout',name:'Cash Out',icon:'💴',color:'#f43f5e',desc:'Withdraw Cash',screen:null},
      {id:'creditcard',name:'Credit Card',icon:'💳',color:'#8b5cf6',desc:'Card Services',screen:null},
      {id:'cms',name:'Cash Mgmt',icon:'🏧',color:'#0ea5e9',desc:'CMS Services',screen:null},
    ]
  },
  {
    label:'Finance & Investment',
    color:'#8b5cf6',
    services:[
      {id:'insurance',name:'Insurance',icon:'🛡️',color:'#06b6d4',desc:'Life & Health',screen:null},
      {id:'loan',name:'Loans',icon:'🏦',color:'#10b981',desc:'All Loans',screen:null},
      {id:'mutualfund',name:'Mutual Fund',icon:'📊',color:'#ec4899',desc:'Investments',screen:null},
    ]
  },
  {
    label:'Travel & Documents',
    color:'#f59e0b',
    services:[
      {id:'travel',name:'Travel',icon:'✈️',color:'#6366f1',desc:'Flights & Hotels',screen:null},
      {id:'train',name:'Train',icon:'🚂',color:'#ef4444',desc:'IRCTC Booking',screen:null},
      {id:'pancard',name:'PAN Card',icon:'🆔',color:'#f59e0b',desc:'PAN Services',screen:null},
    ]
  },
];

export default function ServicesScreen({navigation}:any) {
  const {theme} = useTheme();

  const openService = (screen:string|null, name:string) => {
    if(screen) navigation.navigate(screen);
    else alert(name+' coming soon!');
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{paddingBottom:100}} showsVerticalScrollIndicator={false}>
        <View style={{paddingHorizontal:20,paddingVertical:16}}>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text}}>All Services</Text>
          <Text style={{fontSize:13,color:theme.muted2,marginTop:4}}>RTAI verified · RBI compliant · 24/7</Text>
        </View>
        {CATEGORIES.map((cat,ci)=>(
          <View key={ci} style={{marginBottom:24}}>
            <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:20,marginBottom:12}}>
              <View style={{width:4,height:18,borderRadius:2,backgroundColor:cat.color,marginRight:8}}/>
              <Text style={{fontSize:15,fontWeight:'800',color:cat.color}}>{cat.label}</Text>
            </View>
            <View style={{flexDirection:'row',flexWrap:'wrap',paddingHorizontal:12,gap:10}}>
              {cat.services.map(svc=>(
                <TouchableOpacity key={svc.id}
                  style={{width:'45%',borderRadius:16,borderWidth:1,borderColor:svc.screen?theme.primary+'40':theme.border,backgroundColor:theme.card,padding:16,alignItems:'center'}}
                  activeOpacity={0.7}
                  onPress={()=>openService(svc.screen,svc.name)}>
                  <View style={{width:52,height:52,borderRadius:14,backgroundColor:svc.color+'18',alignItems:'center',justifyContent:'center',marginBottom:8}}>
                    <Text style={{fontSize:26}}>{svc.icon}</Text>
                  </View>
                  <Text style={{fontSize:13,fontWeight:'700',color:svc.screen?theme.primary:theme.text,textAlign:'center',marginBottom:2}}>{svc.name}</Text>
                  <Text style={{fontSize:11,color:theme.muted2,textAlign:'center',marginBottom:6}}>{svc.desc}</Text>
                  <View style={{paddingHorizontal:8,paddingVertical:3,borderRadius:100,backgroundColor:svc.screen?theme.primary+'18':'rgba(16,185,129,0.1)'}}>
                    <Text style={{fontSize:10,fontWeight:'700',color:svc.screen?theme.primary:'#10b981'}}>{svc.screen?'TAP TO USE':'RTAI ✓'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}