import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar,TextInput,Alert,ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeContext';

const DMT_PARTNERS = [
  {id:'eko',name:'Eko India',icon:'🏦',color:'#1e40af'},
  {id:'fino',name:'Fino Payments',icon:'💼',color:'#7c3aed'},
  {id:'rbl',name:'RBL Bank',icon:'🔶',color:'#d97706'},
  {id:'nsdl',name:'NSDL Payments',icon:'📋',color:'#059669'},
];

export default function DMTScreen({navigation}:any) {
  const {theme} = useTheme();
  const [step,setStep] = useState(0);
  const [partner,setPartner] = useState<any>(null);
  const [mobile,setMobile] = useState('');
  const [accNo,setAccNo] = useState('');
  const [ifsc,setIfsc] = useState('');
  const [bname,setBname] = useState('');
  const [name,setName] = useState('');
  const [amount,setAmount] = useState('');
  const [loading,setLoading] = useState(false);
  const [txnId,setTxnId] = useState('');

  const verify = () => {
    if(!mobile||mobile.length!==10){Alert.alert('Invalid','Enter 10-digit mobile');return;}
    setLoading(true);
    setTimeout(()=>{setLoading(false);setStep(2);},1500);
  };

  const send = () => {
    if(!accNo||!ifsc||!name||!amount){Alert.alert('Required','Fill all fields');return;}
    if(parseFloat(amount)>10000){Alert.alert('Limit','Max ₹10,000 per transaction');return;}
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      setTxnId('DMT'+Date.now().toString().slice(-8));
      setStep(3);
    },2000);
  };

  if(step===3) return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:24}}>
        <Text style={{fontSize:56,marginBottom:16}}>✅</Text>
        <Text style={{fontSize:22,fontWeight:'900',color:theme.text,marginBottom:4}}>Transfer Successful!</Text>
        <Text style={{fontSize:28,fontWeight:'900',color:'#10b981',marginBottom:16}}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
        <View style={{backgroundColor:theme.bg3,borderRadius:14,padding:16,width:'100%',marginBottom:24,gap:10}}>
          {[['To',name],['Account',accNo.slice(0,4)+'****'+accNo.slice(-4)],['IFSC',ifsc],['Bank',bname||'N/A'],['TXN ID',txnId],['RTAI','✓ Verified & Secure']].map(([l,v],i)=>(
            <View key={i} style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text style={{color:theme.muted2,fontSize:13}}>{l}</Text>
              <Text style={{color:l==='RTAI'?'#10b981':theme.text,fontSize:13,fontWeight:'600'}}>{v}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={{backgroundColor:theme.primary,borderRadius:12,padding:14,width:'100%',alignItems:'center',marginBottom:12}} onPress={()=>navigation.goBack()}>
          <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setStep(0);setMobile('');setAccNo('');setAmount('');}}>
          <Text style={{color:theme.primary,fontSize:14,fontWeight:'600'}}>New Transfer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:theme.border}}>
        <TouchableOpacity onPress={()=>step>0?setStep(step-1):navigation.goBack()} style={{marginRight:16}}>
          <Text style={{fontSize:18,color:theme.primary}}>← Back</Text>
        </TouchableOpacity>
        <Text style={{fontSize:18,fontWeight:'800',color:theme.text}}>Money Transfer (DMT)</Text>
      </View>
      <ScrollView contentContainerStyle={{padding:20,paddingBottom:100}}>
        {step===0&&(
          <>
            <Text style={{fontSize:15,fontWeight:'700',color:theme.text,marginBottom:16}}>Select DMT Partner</Text>
            {DMT_PARTNERS.map(p=>(
              <TouchableOpacity key={p.id} onPress={()=>{setPartner(p);setStep(1);}}
                style={{flexDirection:'row',alignItems:'center',padding:16,borderRadius:14,borderWidth:1,borderColor:theme.border,backgroundColor:theme.card,marginBottom:10}}>
                <View style={{width:44,height:44,borderRadius:12,backgroundColor:p.color+'20',alignItems:'center',justifyContent:'center',marginRight:14}}>
                  <Text style={{fontSize:22}}>{p.icon}</Text>
                </View>
                <Text style={{fontSize:15,fontWeight:'600',color:theme.text}}>{p.name}</Text>
                <Text style={{marginLeft:'auto',color:theme.muted2}}>→</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
        {step===1&&(
          <>
            <Text style={{fontSize:15,fontWeight:'700',color:theme.text,marginBottom:16}}>Sender Mobile Verification</Text>
            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Sender Mobile Number</Text>
            <View style={{flexDirection:'row',borderWidth:1,borderColor:theme.border2,borderRadius:12,overflow:'hidden',marginBottom:16}}>
              <View style={{backgroundColor:theme.bg3,paddingHorizontal:12,justifyContent:'center'}}>
                <Text style={{color:theme.text,fontWeight:'600'}}>+91</Text>
              </View>
              <TextInput style={{flex:1,padding:12,color:theme.text,fontSize:16}} placeholder='10-digit mobile' placeholderTextColor={theme.muted} keyboardType='numeric' maxLength={10} value={mobile} onChangeText={setMobile}/>
            </View>
            <View style={{backgroundColor:'rgba(59,130,246,0.1)',borderRadius:10,padding:12,marginBottom:16}}>
              <Text style={{color:'#3b82f6',fontSize:12}}>💡 Sender must be registered. Monthly limit: ₹1,00,000</Text>
            </View>
            <TouchableOpacity onPress={verify} disabled={loading} style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center',opacity:loading?0.7:1}}>
              {loading?<ActivityIndicator color='#000'/>:<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Verify Sender →</Text>}
            </TouchableOpacity>
          </>
        )}
        {step===2&&(
          <>
            <View style={{backgroundColor:'rgba(16,185,129,0.1)',borderRadius:10,padding:12,marginBottom:16,flexDirection:'row',alignItems:'center'}}>
              <Text style={{fontSize:18,marginRight:8}}>✅</Text>
              <Text style={{color:'#10b981',fontSize:13,fontWeight:'600'}}>Sender verified: +91 {mobile}</Text>
            </View>
            {[
              {label:'Account Number',val:accNo,set:setAccNo,key:'numeric',max:18},
              {label:'IFSC Code',val:ifsc,set:setIfsc,key:'default',max:11,upper:true},
              {label:'Beneficiary Name',val:name,set:setName,key:'default',max:50},
              {label:'Bank Name (Optional)',val:bname,set:setBname,key:'default',max:50},
            ].map((f,i)=>(
              <View key={i} style={{marginBottom:14}}>
                <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>{f.label}</Text>
                <TextInput style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:15,backgroundColor:theme.bg3,textTransform:f.upper?'uppercase':'none'}} placeholder={'Enter '+f.label} placeholderTextColor={theme.muted} keyboardType={f.key as any} maxLength={f.max} value={f.val} onChangeText={f.set}/>
              </View>
            ))}
            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Amount (₹)</Text>
            <TextInput style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:18,fontWeight:'700',backgroundColor:theme.bg3,marginBottom:8}} placeholder='Max ₹10,000' placeholderTextColor={theme.muted} keyboardType='numeric' value={amount} onChangeText={setAmount}/>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {['500','1000','2000','5000','10000'].map(a=>(
                <TouchableOpacity key={a} onPress={()=>setAmount(a)} style={{paddingHorizontal:14,paddingVertical:6,borderRadius:100,borderWidth:1,borderColor:theme.border2,backgroundColor:theme.bg3}}>
                  <Text style={{color:theme.text,fontSize:12,fontWeight:'600'}}>₹{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{backgroundColor:'rgba(239,68,68,0.08)',borderRadius:10,padding:12,marginBottom:16}}>
              <Text style={{color:'#f87171',fontSize:12}}>🔒 RTAI fraud detection active · Transaction limit: ₹10,000</Text>
            </View>
            <TouchableOpacity onPress={send} disabled={loading} style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center',opacity:loading?0.7:1}}>
              {loading?<ActivityIndicator color='#000'/>:<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Send Money →</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}