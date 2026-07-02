import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar,TextInput,Alert,ActivityIndicator,Modal,KeyboardAvoidingView,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';

const AEPS_BANKS = [
  {id:'sbi',name:'State Bank of India (SBI)'},
  {id:'hdfc',name:'HDFC Bank'},
  {id:'icici',name:'ICICI Bank'},
  {id:'axis',name:'Axis Bank'},
  {id:'pnb',name:'Punjab National Bank'},
  {id:'bob',name:'Bank of Baroda'},
  {id:'canara',name:'Canara Bank'},
  {id:'union',name:'Union Bank of India'},
  {id:'indian',name:'Indian Bank'},
  {id:'kotak',name:'Kotak Mahindra Bank'},
];

const BIOMETRIC_DEVICES = [
  {id:'pb500',name:'Precision PB500 — Fingerprint Scanner'},
  {id:'mantra',name:'Mantra MFS100 — Fingerprint Scanner'},
  {id:'morpho',name:'Morpho MSO1300 — Fingerprint Scanner'},
  {id:'startek',name:'Startek FM220 — Fingerprint Scanner'},
];

const TXN_TYPES = [
  {id:'withdrawal',label:'Cash Withdrawal',icon:'💵'},
  {id:'balance',label:'Balance Enquiry',icon:'📊'},
  {id:'ministatement',label:'Mini Statement',icon:'📋'},
];

// ── STEP BAR ──────────────────────────────────────────────
function StepBar({step,theme}:{step:number;theme:any}){
  const steps=[
    {n:1,label:'Operator Identity'},
    {n:2,label:'Biometric Auth'},
    {n:3,label:'AEPS Service'},
  ];
  return (
    <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:18}}>
      {steps.map((s,i)=>{
        const done=step>s.n;
        const active=step===s.n;
        const color=done||active?theme.primary:theme.muted2;
        return (
          <React.Fragment key={s.n}>
            <View style={{alignItems:'center',width:78}}>
              <View style={{width:40,height:40,borderRadius:20,borderWidth:2,borderColor:color,backgroundColor:done?'rgba(16,185,129,0.15)':active?'rgba(16,185,129,0.1)':'transparent',alignItems:'center',justifyContent:'center',marginBottom:6}}>
                <Text style={{fontSize:16,color}}>{done?'✓':s.n===1?'🔐':s.n===2?'👆':'💳'}</Text>
              </View>
              <Text style={{fontSize:10,fontWeight:'700',color,textAlign:'center'}}>{s.label}</Text>
            </View>
            {i<steps.length-1&&(
              <View style={{flex:1,height:2,backgroundColor:step>s.n?theme.primary:theme.border,marginTop:19}}/>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── BANK SEARCH (Modal-based, floats above keyboard) ──
function BankSearch({theme,value,onSelect}:{theme:any;value:string;onSelect:(name:string)=>void}){
  const [query,setQuery] = useState(value);
  const [open,setOpen] = useState(false);
  const filtered = AEPS_BANKS.filter(b=>b.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Customer Bank</Text>
      <TouchableOpacity
        style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,backgroundColor:theme.bg3,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}
        onPress={()=>setOpen(true)}>
        <Text style={{color:query?theme.text:theme.muted,fontSize:14}}>{query||'🔍 Select bank...'}</Text>
        <Text style={{color:theme.muted2,fontSize:12}}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType='slide' onRequestClose={()=>setOpen(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:theme.bg,borderTopLeftRadius:20,borderTopRightRadius:20,maxHeight:'70%'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:theme.border}}>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text}}>Select Bank</Text>
              <TouchableOpacity onPress={()=>setOpen(false)}>
                <Text style={{fontSize:16,color:theme.muted2}}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal:16,paddingVertical:10}}>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:10,padding:10,color:theme.text,fontSize:14,backgroundColor:theme.bg3}}
                placeholder='Search bank...'
                placeholderTextColor={theme.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            <ScrollView keyboardShouldPersistTaps='handled'>
              {filtered.length===0?(
                <Text style={{padding:16,color:theme.muted2,fontSize:13,textAlign:'center'}}>No banks found</Text>
              ):filtered.map(b=>(
                <TouchableOpacity key={b.id} onPress={()=>{onSelect(b.name);setQuery(b.name);setOpen(false);}}
                  style={{padding:16,borderBottomWidth:1,borderBottomColor:theme.border,flexDirection:'row',alignItems:'center'}}>
                  <Text style={{fontSize:16,marginRight:12}}>🏦</Text>
                  <Text style={{color:theme.text,fontSize:14}}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function AEPSScreen({navigation}:any) {
  const {theme} = useTheme();
  const user = useSelector((s:RootState)=>s.auth.user);

  // wizard step: 1=operator identity, 2=biometric auth, 3=aeps service, 4=success
  const [step,setStep] = useState(1);

  // step 1 - operator identity
  const [operatorAadhaar,setOperatorAadhaar] = useState('');
  const [biometricDevice,setBiometricDevice] = useState('');
  const [deviceDropdownOpen,setDeviceDropdownOpen] = useState(false);

  // step 2 - biometric auth (simulated; replace with real RD-service bridge later)
  const [scanning,setScanning] = useState(false);

  // step 3 - aeps service
  const [customerMobile,setCustomerMobile] = useState('');
  const [customerAadhaarLast4,setCustomerAadhaarLast4] = useState('');
  const [txnType,setTxnType] = useState('withdrawal');
  const [amount,setAmount] = useState('');
  const [customerBank,setCustomerBank] = useState('');
  const [processing,setProcessing] = useState(false);

  const shopName = user?.shopName || user?.name || 'Retailer Shop';

  // ── Step 1 submit: validate operator aadhaar + device, move to biometric ──
  const submitOperatorIdentity = () => {
    if(!operatorAadhaar||operatorAadhaar.length!==12){
      Alert.alert('Invalid','Enter your 12-digit Aadhaar number');
      return;
    }
    if(!biometricDevice){
      Alert.alert('Device required','Select your biometric device');
      return;
    }
    setStep(2);
  };

  // ── Step 2: simulate operator fingerprint scan ──
  // TODO: Replace this simulation with a real RD-Service bridge call
  // (Mantra MFS100 / Morpho / Startek native module) that returns a signed PID block.
  const scanOperatorFingerprint = () => {
    setScanning(true);
    setTimeout(()=>{
      setScanning(false);
      setStep(3);
    },1800);
  };

  // ── Step 3 submit: validate customer details, simulate customer biometric + process ──
  const processCustomerTransaction = () => {
    if(!customerMobile||customerMobile.length!==10){
      Alert.alert('Invalid','Enter customer 10-digit mobile number');
      return;
    }
    if(!customerAadhaarLast4||customerAadhaarLast4.length!==4){
      Alert.alert('Invalid','Enter last 4 digits of customer Aadhaar');
      return;
    }
    if(txnType==='withdrawal'&&(!amount||parseFloat(amount)<=0)){
      Alert.alert('Invalid','Enter withdrawal amount');
      return;
    }
    if(!customerBank){
      Alert.alert('Bank required','Select customer bank');
      return;
    }
    setProcessing(true);
    // TODO: Replace with real RD-Service call to capture customer fingerprint,
    // then call the AEPS switch/backend with the signed PID block.
    setTimeout(()=>{
      setProcessing(false);
      setStep(4);
    },2000);
  };

  const resetWizard = () => {
    setStep(1);
    setOperatorAadhaar('');
    setBiometricDevice('');
    setCustomerMobile('');
    setCustomerAadhaarLast4('');
    setAmount('');
    setCustomerBank('');
  };

  // ── SUCCESS SCREEN ──
  if(step===4) return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:24}}>
        <View style={{width:80,height:80,borderRadius:40,backgroundColor:'rgba(16,185,129,0.15)',alignItems:'center',justifyContent:'center',marginBottom:20}}>
          <Text style={{fontSize:40}}>✅</Text>
        </View>
        <Text style={{fontSize:22,fontWeight:'900',color:theme.text,marginBottom:8}}>Transaction Successful!</Text>
        <Text style={{fontSize:15,color:theme.muted2,marginBottom:4}}>AEPS {TXN_TYPES.find(t=>t.id===txnType)?.label}</Text>
        {amount&&txnType==='withdrawal'?<Text style={{fontSize:28,fontWeight:'900',color:'#10b981',marginBottom:4}}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>:null}
        <Text style={{fontSize:13,color:theme.muted2,marginBottom:8}}>{customerBank}</Text>
        <View style={{backgroundColor:theme.bg3,borderRadius:12,padding:16,width:'100%',marginBottom:24}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{color:theme.muted2,fontSize:13}}>Customer Mobile</Text>
            <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>{customerMobile}</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{color:theme.muted2,fontSize:13}}>Aadhaar</Text>
            <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>XXXX XXXX {customerAadhaarLast4}</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{color:theme.muted2,fontSize:13}}>TXN ID</Text>
            <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>TXN{Date.now().toString().slice(-8)}</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:theme.muted2,fontSize:13}}>RTAI Status</Text>
            <Text style={{color:'#10b981',fontSize:13,fontWeight:'700'}}>✓ Verified</Text>
          </View>
        </View>
        <TouchableOpacity style={{backgroundColor:theme.primary,borderRadius:12,padding:14,width:'100%',alignItems:'center',marginBottom:12}} onPress={()=>navigation.goBack()}>
          <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetWizard}>
          <Text style={{color:theme.primary,fontSize:14,fontWeight:'600'}}>New Transaction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── MAIN WIZARD (steps 1-3) ──
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:theme.border}}>
        <TouchableOpacity onPress={()=>step>1?setStep(step-1):navigation.goBack()} style={{marginRight:16}}>
          <Text style={{fontSize:18,color:theme.primary}}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:18,fontWeight:'800',color:theme.text}}>AEPS</Text>
          <Text style={{fontSize:11,color:theme.primary}}>✓ RTAI Verified · Aadhaar Banking</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{padding:20,paddingBottom:400}} keyboardShouldPersistTaps='handled'>
        <StepBar step={step} theme={theme}/>

        {/* ── STEP 1: OPERATOR IDENTITY ── */}
        {step===1&&(
          <>
            <View style={{borderWidth:1,borderColor:'rgba(245,158,11,0.3)',backgroundColor:'rgba(245,158,11,0.08)',borderRadius:12,padding:14,marginBottom:16}}>
              <Text style={{color:'#f59e0b',fontSize:12,fontWeight:'700',marginBottom:4}}>📋 UIDAI / RBI REGULATION</Text>
              <Text style={{color:theme.muted2,fontSize:12,lineHeight:18}}>
                As per UIDAI Circular & RBI AEPS Guidelines, the operator (you) must authenticate your own identity via Aadhaar biometric before performing any customer transaction.
              </Text>
            </View>

            <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(16,185,129,0.08)',borderRadius:12,padding:14,marginBottom:20}}>
              <View style={{width:38,height:38,borderRadius:19,backgroundColor:theme.primary,alignItems:'center',justifyContent:'center',marginRight:12}}>
                <Text style={{color:'#000',fontWeight:'800'}}>{shopName[0]?.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={{color:theme.text,fontWeight:'700',fontSize:14}}>{shopName}</Text>
                <Text style={{color:theme.primary,fontSize:11}}>RETAILER · Operator Identity Verification Required</Text>
              </View>
            </View>

            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Your Aadhaar Number (Operator)</Text>
            <TextInput
              style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:16,backgroundColor:theme.bg3,marginBottom:6,letterSpacing:4}}
              placeholder='12-digit Aadhaar number'
              placeholderTextColor={theme.muted}
              keyboardType='numeric'
              maxLength={12}
              value={operatorAadhaar}
              onChangeText={setOperatorAadhaar}
            />
            <Text style={{fontSize:11,color:theme.muted2,marginBottom:18}}>🔒 Your Aadhaar is encrypted and used only for biometric authentication. Not stored.</Text>

            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Biometric Device</Text>
            <TouchableOpacity onPress={()=>setDeviceDropdownOpen(o=>!o)}
              style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,backgroundColor:theme.bg3,marginBottom:8}}>
              <Text style={{color:biometricDevice?theme.text:theme.muted,fontSize:14}}>
                {BIOMETRIC_DEVICES.find(d=>d.id===biometricDevice)?.name||'-- Select Your Biometric Device --'}
              </Text>
            </TouchableOpacity>
            {deviceDropdownOpen&&(
              <View style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,marginBottom:8,overflow:'hidden'}}>
                {BIOMETRIC_DEVICES.map(d=>(
                  <TouchableOpacity key={d.id} onPress={()=>{setBiometricDevice(d.id);setDeviceDropdownOpen(false);}}
                    style={{padding:12,borderBottomWidth:1,borderBottomColor:theme.border,backgroundColor:theme.bg2}}>
                    <Text style={{color:theme.text,fontSize:13}}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {biometricDevice&&(
              <View style={{borderWidth:1,borderColor:theme.border2,backgroundColor:theme.bg2,borderRadius:12,padding:12,marginBottom:18}}>
                <Text style={{color:theme.primary,fontSize:12,fontWeight:'700',marginBottom:4}}>👆 {BIOMETRIC_DEVICES.find(d=>d.id===biometricDevice)?.name}</Text>
                <Text style={{color:theme.muted2,fontSize:11}}>Install the RD Service driver before using this device.</Text>
              </View>
            )}

            <TouchableOpacity onPress={submitOperatorIdentity}
              style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center',marginTop:6}}>
              <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>Submit & Proceed to Biometric →</Text>
            </TouchableOpacity>
            <Text style={{fontSize:10,color:theme.muted2,textAlign:'center',marginTop:10}}>🛡️ RTAI Secured · UIDAI Compliant · AES-256 Encrypted</Text>
          </>
        )}

        {/* ── STEP 2: BIOMETRIC AUTH (operator) ── */}
        {step===2&&(
          <>
            <View style={{borderWidth:1,borderColor:theme.border2,backgroundColor:'rgba(16,185,129,0.06)',borderRadius:16,padding:24,alignItems:'center',marginBottom:18}}>
              <Text style={{fontSize:42,marginBottom:10}}>{scanning?'👆':'👆'}</Text>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.primary,marginBottom:4}}>
                {scanning?'Scanning…':'Place Your Finger on the Device'}
              </Text>
              <Text style={{fontSize:12,color:theme.muted2,textAlign:'center',marginBottom:10}}>
                Operator: {shopName} · Aadhaar: XXXX XXXX {operatorAadhaar.slice(-4)}
              </Text>
              <View style={{backgroundColor:theme.bg3,borderRadius:100,paddingHorizontal:12,paddingVertical:4}}>
                <Text style={{fontSize:11,color:theme.muted2}}>📟 {BIOMETRIC_DEVICES.find(d=>d.id===biometricDevice)?.name} · UIDAI Registered</Text>
              </View>
            </View>

            <View style={{flexDirection:'row',gap:8,marginBottom:18}}>
              <View style={{flex:1,alignItems:'center',backgroundColor:theme.card,borderRadius:12,padding:10}}>
                <Text style={{fontSize:18,marginBottom:2}}>🔐</Text>
                <Text style={{fontSize:10,fontWeight:'700',color:theme.text,textAlign:'center'}}>Aadhaar Linked</Text>
                <Text style={{fontSize:9,color:theme.primary}}>UIDAI Verified</Text>
              </View>
              <View style={{flex:1,alignItems:'center',backgroundColor:theme.card,borderRadius:12,padding:10}}>
                <Text style={{fontSize:18,marginBottom:2}}>📡</Text>
                <Text style={{fontSize:10,fontWeight:'700',color:theme.text,textAlign:'center'}}>Device Ready</Text>
                <Text style={{fontSize:9,color:theme.primary}}>Connected</Text>
              </View>
              <View style={{flex:1,alignItems:'center',backgroundColor:theme.card,borderRadius:12,padding:10}}>
                <Text style={{fontSize:18,marginBottom:2}}>🛡️</Text>
                <Text style={{fontSize:10,fontWeight:'700',color:theme.text,textAlign:'center'}}>RTAI Active</Text>
                <Text style={{fontSize:9,color:theme.primary}}>Monitoring</Text>
              </View>
            </View>

            <TouchableOpacity onPress={scanOperatorFingerprint} disabled={scanning}
              style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center',marginBottom:10,opacity:scanning?0.7:1}}>
              {scanning?<ActivityIndicator color='#000'/>:<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>👆 Scan Fingerprint (Operator Auth)</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setStep(1)} style={{padding:12,alignItems:'center'}}>
              <Text style={{color:theme.muted2,fontSize:13}}>← Back</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── STEP 3: AEPS SERVICE (customer) ── */}
        {step===3&&(
          <>
            <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(16,185,129,0.08)',borderRadius:10,padding:12,marginBottom:18}}>
              <Text style={{fontSize:16,marginRight:8}}>✅</Text>
              <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',flex:1}}>Operator identity verified · Now serving customer</Text>
            </View>

            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Customer Mobile</Text>
            <TextInput
              style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:16,backgroundColor:theme.bg3,marginBottom:16}}
              placeholder='10-digit mobile'
              placeholderTextColor={theme.muted}
              keyboardType='numeric'
              maxLength={10}
              value={customerMobile}
              onChangeText={setCustomerMobile}
            />

            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Customer Aadhaar (Last 4 Digits)</Text>
            <TextInput
              style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:18,backgroundColor:theme.bg3,marginBottom:6,letterSpacing:8,textAlign:'center'}}
              placeholder='XXXX'
              placeholderTextColor={theme.muted}
              keyboardType='numeric'
              maxLength={4}
              value={customerAadhaarLast4}
              onChangeText={setCustomerAadhaarLast4}
            />
            <Text style={{fontSize:10,color:theme.muted2,marginBottom:16}}>🔒 Last 4 digits only — UIDAI compliant</Text>

            <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Transaction Type</Text>
            <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
              {TXN_TYPES.map(t=>(
                <TouchableOpacity key={t.id} onPress={()=>setTxnType(t.id)}
                  style={{paddingHorizontal:14,paddingVertical:10,borderRadius:10,borderWidth:2,borderColor:txnType===t.id?theme.primary:theme.border,backgroundColor:theme.card}}>
                  <Text style={{color:txnType===t.id?theme.primary:theme.text,fontSize:12,fontWeight:'700'}}>{t.icon} {t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {txnType==='withdrawal'&&(
              <>
                <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,textTransform:'uppercase',marginBottom:6}}>Amount (₹)</Text>
                <TextInput
                  style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,padding:12,color:theme.text,fontSize:16,backgroundColor:theme.bg3,marginBottom:8}}
                  placeholder='Enter withdrawal amount'
                  placeholderTextColor={theme.muted}
                  keyboardType='numeric'
                  value={amount}
                  onChangeText={setAmount}
                />
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
                  {['100','500','1000','2000','5000'].map(a=>(
                    <TouchableOpacity key={a} onPress={()=>setAmount(a)} style={{paddingHorizontal:14,paddingVertical:6,borderRadius:100,borderWidth:1,borderColor:theme.border2,backgroundColor:theme.bg3}}>
                      <Text style={{color:theme.text,fontSize:12,fontWeight:'600'}}>₹{parseInt(a).toLocaleString('en-IN')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <BankSearch theme={theme} value={customerBank} onSelect={setCustomerBank}/>

            <TouchableOpacity onPress={processCustomerTransaction} disabled={processing}
              style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:'center',opacity:processing?0.7:1}}>
              {processing?<ActivityIndicator color='#000'/>:<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>👆 Customer Biometric & Process →</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
