import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar,TextInput,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector,useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import {updateWallet} from '../../store/authSlice';

export default function WalletScreen() {
  const {theme} = useTheme();
  const user = useSelector((s:RootState)=>s.auth.user);
  const dispatch = useDispatch();
  const [amount,setAmount] = useState('');
  const [tab,setTab] = useState('add');
  const addMoney = () => {
    const amt = parseFloat(amount);
    if(!amt||amt<=0){Alert.alert('Invalid','Enter valid amount');return;}
    dispatch(updateWallet((user?.wallet||0)+amt));
    setAmount('');
    Alert.alert('Success','₹'+amt.toLocaleString('en-IN')+' added to wallet!');
  };
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{paddingBottom:100}}>
        <View style={{paddingHorizontal:20,paddingVertical:16}}>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text}}>Wallet</Text>
        </View>
        <View style={{marginHorizontal:20,borderRadius:20,padding:24,backgroundColor:theme.primary,marginBottom:20,alignItems:'center'}}>
          <Text style={{color:'rgba(0,0,0,0.6)',fontSize:13,marginBottom:8}}>Available Balance</Text>
          <Text style={{color:'#000',fontSize:36,fontWeight:'900',marginBottom:4}}>{'₹'+(user?.wallet||0).toLocaleString('en-IN')}</Text>
          <View style={{paddingHorizontal:12,paddingVertical:4,borderRadius:100,backgroundColor:'rgba(0,0,0,0.15)'}}>
            <Text style={{color:'#000',fontSize:11,fontWeight:'700'}}>✓ RTAI Secured Wallet</Text>
          </View>
        </View>
        <View style={{flexDirection:'row',marginHorizontal:20,marginBottom:16,borderRadius:12,borderWidth:1,borderColor:theme.border,overflow:'hidden'}}>
          {['add','history'].map(t=>(
            <TouchableOpacity key={t} onPress={()=>setTab(t)}
              style={{flex:1,padding:12,alignItems:'center',backgroundColor:tab===t?theme.primary:theme.card}}>
              <Text style={{fontWeight:'700',fontSize:13,color:tab===t?'#000':theme.muted2}}>{t==='add'?'Add Money':'History'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab==='add'?(
          <View style={{marginHorizontal:20,borderRadius:16,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:16}}>
            <Text style={{fontSize:13,color:theme.muted2,fontWeight:'600',marginBottom:8}}>ENTER AMOUNT</Text>
            <View style={{flexDirection:'row',borderWidth:1,borderColor:theme.border2,borderRadius:12,overflow:'hidden',marginBottom:16}}>
              <View style={{backgroundColor:theme.bg3,paddingHorizontal:14,justifyContent:'center'}}>
                <Text style={{color:theme.text,fontWeight:'700',fontSize:18}}>₹</Text>
              </View>
              <TextInput style={{flex:1,padding:12,color:theme.text,fontSize:20,fontWeight:'700'}} placeholder='0.00' placeholderTextColor={theme.muted} keyboardType='numeric' value={amount} onChangeText={setAmount}/>
            </View>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {['100','500','1000','2000','5000','10000'].map(a=>(
                <TouchableOpacity key={a} onPress={()=>setAmount(a)}
                  style={{paddingHorizontal:16,paddingVertical:8,borderRadius:100,borderWidth:1,borderColor:theme.border2,backgroundColor:theme.bg3}}>
                  <Text style={{color:theme.text,fontWeight:'600',fontSize:13}}>+₹{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={addMoney}
              style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center'}}>
              <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Add Money →</Text>
            </TouchableOpacity>
          </View>
        ):(
          <View style={{marginHorizontal:20,borderRadius:16,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,padding:24,alignItems:'center'}}>
            <Text style={{fontSize:32,marginBottom:12}}>📊</Text>
            <Text style={{fontSize:15,fontWeight:'700',color:theme.text,marginBottom:4}}>No transactions yet</Text>
            <Text style={{fontSize:13,color:theme.muted2,textAlign:'center'}}>Your wallet transactions will appear here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}