import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';

const FILTERS = ['All','Today','This Week','This Month'];
const SAMPLE_TXNS = [
  {id:'1',title:'AEPS Cash Withdrawal',icon:'👆',amount:2000,type:'debit',status:'success',date:'09 Jun 2026',color:'#10b981'},
  {id:'2',title:'Mobile Recharge',icon:'📱',amount:499,type:'debit',status:'success',date:'09 Jun 2026',color:'#f59e0b'},
  {id:'3',title:'Wallet Top Up',icon:'💰',amount:5000,type:'credit',status:'success',date:'08 Jun 2026',color:'#3b82f6'},
  {id:'4',title:'Bill Payment - Electricity',icon:'🧾',amount:1200,type:'debit',status:'success',date:'08 Jun 2026',color:'#f59e0b'},
  {id:'5',title:'DMT Transfer',icon:'💸',amount:3000,type:'debit',status:'pending',date:'07 Jun 2026',color:'#3b82f6'},
];

export default function TransactionsScreen() {
  const {theme} = useTheme();
  const [filter,setFilter] = useState('All');
  const totalCredit = SAMPLE_TXNS.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const totalDebit = SAMPLE_TXNS.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        <View style={{paddingHorizontal:20,paddingVertical:16}}>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text}}>Transactions</Text>
        </View>
        <View style={{flexDirection:'row',marginHorizontal:20,gap:10,marginBottom:16}}>
          <View style={{flex:1,borderRadius:12,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:14,alignItems:'center'}}>
            <Text style={{fontSize:16,fontWeight:'800',color:'#10b981'}}>{'₹'+totalCredit.toLocaleString('en-IN')}</Text>
            <Text style={{fontSize:11,color:theme.muted2,marginTop:2}}>Total Credit</Text>
          </View>
          <View style={{flex:1,borderRadius:12,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:14,alignItems:'center'}}>
            <Text style={{fontSize:16,fontWeight:'800',color:'#ef4444'}}>{'₹'+totalDebit.toLocaleString('en-IN')}</Text>
            <Text style={{fontSize:11,color:theme.muted2,marginTop:2}}>Total Debit</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20,gap:8,marginBottom:16}}>
          {FILTERS.map(f=>(
            <TouchableOpacity key={f} onPress={()=>setFilter(f)}
              style={{paddingHorizontal:16,paddingVertical:8,borderRadius:100,borderWidth:1,borderColor:filter===f?theme.primary:theme.border,backgroundColor:filter===f?theme.primary+'20':theme.card}}>
              <Text style={{fontSize:13,fontWeight:'600',color:filter===f?theme.primary:theme.muted2}}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{marginHorizontal:20,gap:10}}>
          {SAMPLE_TXNS.map(t=>(
            <View key={t.id} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderRadius:14,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:14}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
                <View style={{width:42,height:42,borderRadius:12,backgroundColor:t.color+'18',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:20}}>{t.icon}</Text>
                </View>
                <View>
                  <Text style={{fontSize:14,fontWeight:'600',color:theme.text,marginBottom:2}}>{t.title}</Text>
                  <Text style={{fontSize:12,color:theme.muted2}}>{t.date}</Text>
                  <View style={{marginTop:4,paddingHorizontal:6,paddingVertical:2,borderRadius:100,backgroundColor:t.status==='success'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)',alignSelf:'flex-start'}}>
                    <Text style={{fontSize:10,fontWeight:'700',color:t.status==='success'?'#10b981':'#f59e0b'}}>{t.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <Text style={{fontSize:15,fontWeight:'800',color:t.type==='credit'?'#10b981':'#ef4444'}}>{t.type==='credit'?'+':'-'}{'₹'+t.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}