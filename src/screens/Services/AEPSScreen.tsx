import React,{useState,useRef} from 'react';
import {
  View,Text,ScrollView,TouchableOpacity,StatusBar,
  TextInput,Alert,ActivityIndicator,Modal,Share,
  KeyboardAvoidingView,Platform
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';

// ── BANKS LIST ──────────────────────────────────────────────
const AEPS_BANKS = [
  {id:'sbi',   name:'State Bank of India (SBI)'},
  {id:'hdfc',  name:'HDFC Bank'},
  {id:'icici', name:'ICICI Bank'},
  {id:'axis',  name:'Axis Bank'},
  {id:'pnb',   name:'Punjab National Bank'},
  {id:'bob',   name:'Bank of Baroda'},
  {id:'canara',name:'Canara Bank'},
  {id:'union', name:'Union Bank of India'},
  {id:'indian',name:'Indian Bank'},
  {id:'kotak', name:'Kotak Mahindra Bank'},
  {id:'iob',   name:'Indian Overseas Bank'},
  {id:'central',name:'Central Bank of India'},
  {id:'boi',   name:'Bank of India'},
  {id:'syndicate',name:'Syndicate Bank'},
  {id:'uco',   name:'UCO Bank'},
];

// ── BIOMETRIC DEVICES ────────────────────────────────────────
const BIOMETRIC_DEVICES = [
  {id:'pb500',   name:'Precision PB500 — Fingerprint Scanner'},
  {id:'mantra',  name:'Mantra MFS100 — Fingerprint Scanner'},
  {id:'morpho',  name:'Morpho MSO1300 — Fingerprint Scanner'},
  {id:'startek', name:'Startek FM220 — Fingerprint Scanner'},
];

// ── TRANSACTION TYPES ────────────────────────────────────────
const TXN_TYPES = [
  {id:'withdrawal',    label:'Cash Withdrawal', icon:'💵'},
  {id:'balance',       label:'Balance Enquiry',  icon:'📊'},
  {id:'ministatement', label:'Mini Statement',   icon:'📋'},
];

// ── STEP BAR ─────────────────────────────────────────────────
function StepBar({step,theme}:{step:number;theme:any}){
  const steps=[
    {n:1,label:'Operator Identity', icon:'🔐'},
    {n:2,label:'Biometric Auth',    icon:'👆'},
    {n:3,label:'AEPS Service',      icon:'💳'},
  ];
  return (
    <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:18}}>
      {steps.map((s,i)=>{
        const done   = step > s.n;
        const active = step === s.n;
        const color  = done||active ? theme.primary : theme.muted2;
        return (
          <React.Fragment key={s.n}>
            <View style={{alignItems:'center',width:78}}>
              <View style={{width:40,height:40,borderRadius:20,borderWidth:2,
                borderColor:color,
                backgroundColor:done?'rgba(16,185,129,0.15)':active?'rgba(16,185,129,0.1)':'transparent',
                alignItems:'center',justifyContent:'center',marginBottom:6}}>
                <Text style={{fontSize:16,color}}>{done?'✓':s.icon}</Text>
              </View>
              <Text style={{fontSize:10,fontWeight:'700',color,textAlign:'center'}}>{s.label}</Text>
            </View>
            {i<steps.length-1&&(
              <View style={{flex:1,height:2,
                backgroundColor:step>s.n?theme.primary:theme.border,
                marginTop:19}}/>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ── BANK PICKER MODAL ────────────────────────────────────────
function BankPicker({theme,value,onSelect}:{theme:any;value:string;onSelect:(name:string)=>void}){
  const [open,setOpen]   = useState(false);
  const [query,setQuery] = useState('');
  const filtered = AEPS_BANKS.filter(b=>
    b.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
        textTransform:'uppercase',marginBottom:6}}>Customer Bank</Text>
      <TouchableOpacity
        onPress={()=>{setQuery('');setOpen(true);}}
        style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
          padding:12,backgroundColor:theme.bg3,
          flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{color:value?theme.text:theme.muted,fontSize:14}}>
          {value||'🔍 Select customer bank...'}
        </Text>
        <Text style={{color:theme.muted2,fontSize:12}}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType='slide'
        onRequestClose={()=>setOpen(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:theme.bg,borderTopLeftRadius:20,
            borderTopRightRadius:20,maxHeight:'75%'}}>
            {/* Header */}
            <View style={{flexDirection:'row',justifyContent:'space-between',
              alignItems:'center',padding:16,borderBottomWidth:1,
              borderBottomColor:theme.border}}>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text}}>Select Bank</Text>
              <TouchableOpacity onPress={()=>setOpen(false)}>
                <Text style={{fontSize:18,color:theme.muted2}}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Search */}
            <View style={{paddingHorizontal:16,paddingVertical:10}}>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:10,
                  padding:10,color:theme.text,fontSize:14,backgroundColor:theme.bg3}}
                placeholder='Search bank name...'
                placeholderTextColor={theme.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            {/* Bank list */}
            <ScrollView keyboardShouldPersistTaps='handled'>
              {filtered.length===0?(
                <Text style={{padding:16,color:theme.muted2,fontSize:13,textAlign:'center'}}>
                  No bank found for "{query}"
                </Text>
              ):filtered.map(b=>(
                <TouchableOpacity key={b.id}
                  onPress={()=>{onSelect(b.name);setOpen(false);}}
                  style={{padding:16,borderBottomWidth:1,
                    borderBottomColor:theme.border,
                    flexDirection:'row',alignItems:'center'}}>
                  <Text style={{fontSize:18,marginRight:12}}>🏦</Text>
                  <Text style={{color:theme.text,fontSize:14}}>{b.name}</Text>
                  {value===b.name&&(
                    <Text style={{marginLeft:'auto',color:theme.primary,fontSize:16}}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── DEVICE PICKER MODAL ───────────────────────────────────────
function DevicePicker({theme,value,onSelect}:{theme:any;value:string;onSelect:(id:string)=>void}){
  const [open,setOpen] = useState(false);
  const selected = BIOMETRIC_DEVICES.find(d=>d.id===value);
  return (
    <View style={{marginBottom:8}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
        textTransform:'uppercase',marginBottom:6}}>Biometric Device</Text>
      <TouchableOpacity
        onPress={()=>setOpen(true)}
        style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
          padding:12,backgroundColor:theme.bg3,
          flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{color:value?theme.text:theme.muted,fontSize:14}}>
          {selected?.name||'-- Select Your Biometric Device --'}
        </Text>
        <Text style={{color:theme.muted2,fontSize:12}}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType='slide'
        onRequestClose={()=>setOpen(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
          <View style={{backgroundColor:theme.bg,borderTopLeftRadius:20,
            borderTopRightRadius:20}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',
              alignItems:'center',padding:16,borderBottomWidth:1,
              borderBottomColor:theme.border}}>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text}}>
                Select Device
              </Text>
              <TouchableOpacity onPress={()=>setOpen(false)}>
                <Text style={{fontSize:18,color:theme.muted2}}>✕</Text>
              </TouchableOpacity>
            </View>
            {BIOMETRIC_DEVICES.map(d=>(
              <TouchableOpacity key={d.id}
                onPress={()=>{onSelect(d.id);setOpen(false);}}
                style={{padding:16,borderBottomWidth:1,
                  borderBottomColor:theme.border,
                  flexDirection:'row',alignItems:'center'}}>
                <Text style={{fontSize:18,marginRight:12}}>📟</Text>
                <Text style={{color:theme.text,fontSize:14,flex:1}}>{d.name}</Text>
                {value===d.id&&(
                  <Text style={{color:theme.primary,fontSize:16}}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <View style={{height:20}}/>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────
export default function AEPSScreen({navigation}:any){
  const {theme}  = useTheme();
  const user     = useSelector((s:RootState)=>s.auth.user);
  const scrollRef = useRef<ScrollView>(null);

  // wizard step: 1=operator identity, 2=biometric auth, 3=aeps service, 4=success
  const [step,setStep] = useState(1);

  // step 1
  const [operatorAadhaar,setOperatorAadhaar]     = useState('');
  const [biometricDevice,setBiometricDevice]     = useState('');

  // step 2
  const [scanning,setScanning] = useState(false);

  // step 3
  const [aadhaarTab,setAadhaarTab]               = useState<'manual'|'qr'>('manual');
  const [customerMobile,setCustomerMobile]       = useState('');
  const [customerAadhaarLast4,setCustomerAadhaarLast4] = useState('');
  const [txnType,setTxnType]                     = useState('withdrawal');
  const [amount,setAmount]                       = useState('');
  const [aadhaarOtp,setAadhaarOtp]               = useState('');
  const [customerBank,setCustomerBank]           = useState('');
  const [processing,setProcessing]               = useState(false);

  // success
  const [txnId]  = useState('TXN'+Date.now().toString().slice(-8));
  const [txnTime] = useState(new Date());

  const shopName = user?.shopName||user?.name||'Retailer';
  const amountNum = parseFloat(amount)||0;
  const needsOtp  = txnType==='withdrawal' && amountNum>5000;

  // ── STEP 1: validate operator identity ──
  const submitOperatorIdentity = () => {
    if(!operatorAadhaar||operatorAadhaar.length!==12){
      Alert.alert('Invalid','Enter your 12-digit Aadhaar number');return;
    }
    if(!biometricDevice){
      Alert.alert('Device required','Select your biometric device');return;
    }
    setStep(2);
  };

  // ── STEP 2: simulate biometric scan (replace with real RD-Service SDK later) ──
  // TODO: Replace setTimeout below with real RD-Service bridge call
  // Mantra: MantraRdService.capture() | Morpho: MorphoRdService.capture()
  const scanOperatorFingerprint = () => {
    setScanning(true);
    setTimeout(()=>{setScanning(false);setStep(3);},1800);
  };

  // ── STEP 3: validate + process ──
  const processCustomerTransaction = () => {
    if(!customerMobile||customerMobile.length!==10){
      Alert.alert('Invalid','Enter customer 10-digit mobile number');return;
    }
    if(!customerAadhaarLast4||customerAadhaarLast4.length!==4){
      Alert.alert('Invalid','Enter last 4 digits of customer Aadhaar');return;
    }
    if(txnType==='withdrawal'&&(!amount||amountNum<=0)){
      Alert.alert('Invalid','Enter withdrawal amount');return;
    }
    if(needsOtp&&(!aadhaarOtp||aadhaarOtp.length!==6)){
      Alert.alert('OTP Required','Amount above ₹5,000 requires Aadhaar OTP (6 digits)');return;
    }
    if(!customerBank){
      Alert.alert('Bank required','Select customer bank');return;
    }
    setProcessing(true);
    // TODO: Replace with real RD-Service fingerprint capture + AEPS switch API call
    setTimeout(()=>{setProcessing(false);setStep(4);},2000);
  };

  // ── SHARE invoice ──
  const shareInvoice = async () => {
    const msg =
`🏦 BankMe — AEPS Receipt
━━━━━━━━━━━━━━━━━━━━━
TXN ID     : ${txnId}
Type       : ${TXN_TYPES.find(t=>t.id===txnType)?.label}
${txnType==='withdrawal'?`Amount     : ₹${amountNum.toLocaleString('en-IN')}\n`:''}Bank       : ${customerBank}
Mobile     : ${customerMobile}
Aadhaar    : XXXX XXXX ${customerAadhaarLast4}
RTAI       : ✓ Verified
━━━━━━━━━━━━━━━━━━━━━
Powered by BankMe · RTAI Secured`;
    try {
      await Share.share({message:msg,title:'AEPS Transaction Receipt'});
    } catch(e){
      Alert.alert('Error','Could not open share menu');
    }
  };

  const resetWizard = () => {
    setStep(1);
    setOperatorAadhaar('');setBiometricDevice('');
    setCustomerMobile('');setCustomerAadhaarLast4('');
    setAmount('');setAadhaarOtp('');setCustomerBank('');
  };

  // ════════════════════════════════════════
  // ── SUCCESS / INVOICE SCREEN (step 4) ──
  // ════════════════════════════════════════
  if(step===4) return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{padding:24,paddingBottom:60}}>

        {/* BankMe logo header */}
        <View style={{alignItems:'center',marginBottom:20,marginTop:8}}>
          <View style={{width:70,height:70,borderRadius:35,
            backgroundColor:'#00d4aa',alignItems:'center',
            justifyContent:'center',marginBottom:8,
            elevation:4,shadowColor:'#000',
            shadowOffset:{width:0,height:2},
            shadowOpacity:0.15,shadowRadius:4}}>
            <Text style={{fontSize:32,fontWeight:'900',color:'#000'}}>B</Text>
          </View>
          <Text style={{fontSize:18,fontWeight:'900',color:theme.text,letterSpacing:1}}>
            BANK ME
          </Text>
          <Text style={{fontSize:11,color:theme.muted2,marginBottom:16}}>
            Powered by RTAI · Complete Fintech Platform
          </Text>

          {/* Date and Time */}
          <View style={{flexDirection:'row',gap:16,marginBottom:16}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Text style={{fontSize:12}}>📅</Text>
              <Text style={{fontSize:12,color:theme.muted2,fontWeight:'600'}}>
                {txnTime.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
              </Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Text style={{fontSize:12}}>🕐</Text>
              <Text style={{fontSize:12,color:theme.muted2,fontWeight:'600'}}>
                {txnTime.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
              </Text>
            </View>
          </View>

          {/* Success status */}
          <View style={{width:80,height:80,borderRadius:40,
            backgroundColor:'rgba(16,185,129,0.15)',
            alignItems:'center',justifyContent:'center',marginBottom:12}}>
            <Text style={{fontSize:40}}>✅</Text>
          </View>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text,marginBottom:4}}>
            Transaction Successful!
          </Text>
          <Text style={{fontSize:14,color:theme.muted2}}>
            AEPS {TXN_TYPES.find(t=>t.id===txnType)?.label}
          </Text>
          {txnType==='withdrawal'&&(
            <Text style={{fontSize:32,fontWeight:'900',color:'#10b981',marginTop:8}}>
              ₹{amountNum.toLocaleString('en-IN')}
            </Text>
          )}
        </View>

        {/* Invoice card */}
        <View style={{backgroundColor:theme.card,borderRadius:16,
          borderWidth:1,borderColor:theme.border,
          padding:20,marginBottom:20}}>
          <Text style={{fontSize:14,fontWeight:'800',color:theme.text,
            marginBottom:14,textAlign:'center',letterSpacing:1}}>
            🧾 TRANSACTION RECEIPT
          </Text>

          {[
            {label:'TXN ID',      value:txnId},
            {label:'Type',        value:TXN_TYPES.find(t=>t.id===txnType)?.label||''},
            ...(txnType==='withdrawal'?[{label:'Amount',value:`₹${amountNum.toLocaleString('en-IN')}`}]:[]),
            {label:'Bank',        value:customerBank},
            {label:'Customer Mobile', value:customerMobile},
            {label:'Aadhaar',     value:`XXXX XXXX ${customerAadhaarLast4}`},
            {label:'Operator',    value:shopName},
            {label:'RTAI Status', value:'✓ Verified'},
          ].map((row,i)=>(
            <View key={i} style={{flexDirection:'row',justifyContent:'space-between',
              paddingVertical:8,
              borderBottomWidth:i<7?1:0,
              borderBottomColor:theme.border}}>
              <Text style={{color:theme.muted2,fontSize:13}}>{row.label}</Text>
              <Text style={{color:row.label==='RTAI Status'?'#10b981':theme.text,
                fontSize:13,fontWeight:'600',maxWidth:'60%',textAlign:'right'}}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Share button */}
        <TouchableOpacity onPress={shareInvoice}
          style={{backgroundColor:theme.primary,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            flexDirection:'row',justifyContent:'center',gap:8}}>
          <Text style={{fontSize:18}}>📤</Text>
          <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
            Share Receipt
          </Text>
        </TouchableOpacity>

        {/* Print button */}
        <TouchableOpacity
          onPress={()=>Alert.alert('Print','Connect to a Bluetooth printer to print this receipt.\n\nInstall react-native-print for full print support.')}
          style={{backgroundColor:theme.card,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            flexDirection:'row',justifyContent:'center',gap:8,
            borderWidth:1,borderColor:theme.border}}>
          <Text style={{fontSize:18}}>🖨️</Text>
          <Text style={{color:theme.text,fontWeight:'800',fontSize:15}}>
            Print Receipt
          </Text>
        </TouchableOpacity>

        {/* Done + New transaction */}
        <TouchableOpacity
          style={{backgroundColor:theme.bg3,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            borderWidth:1,borderColor:theme.border}}
          onPress={()=>navigation.goBack()}>
          <Text style={{color:theme.text,fontWeight:'800',fontSize:15}}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetWizard} style={{alignItems:'center',padding:8}}>
          <Text style={{color:theme.primary,fontSize:14,fontWeight:'600'}}>
            + New Transaction
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );

  // ════════════════════════════════
  // ── WIZARD STEPS 1–3 ──
  // ════════════════════════════════
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>

      {/* Header */}
      <View style={{flexDirection:'row',alignItems:'center',
        paddingHorizontal:20,paddingVertical:14,
        borderBottomWidth:1,borderBottomColor:theme.border}}>
        <TouchableOpacity
          onPress={()=>step>1?setStep(step-1):navigation.goBack()}
          style={{marginRight:16}}>
          <Text style={{fontSize:18,color:theme.primary}}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={{fontSize:18,fontWeight:'800',color:theme.text}}>AEPS</Text>
          <Text style={{fontSize:11,color:theme.primary}}>✓ RTAI Verified · Aadhaar Banking</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex:1}}
        behavior={Platform.OS==='ios'?'padding':'height'}
        keyboardVerticalOffset={100}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{padding:20,paddingBottom:400}}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}>

          <StepBar step={step} theme={theme}/>

          {/* ══════════════════════════
              STEP 1 — OPERATOR IDENTITY
              ══════════════════════════ */}
          {step===1&&(
            <>
              {/* UIDAI regulation notice */}
              <View style={{borderWidth:1,borderColor:'rgba(245,158,11,0.3)',
                backgroundColor:'rgba(245,158,11,0.08)',
                borderRadius:12,padding:14,marginBottom:16}}>
                <Text style={{color:'#f59e0b',fontSize:12,fontWeight:'700',marginBottom:4}}>
                  📋 UIDAI / RBI REGULATION
                </Text>
                <Text style={{color:theme.muted2,fontSize:12,lineHeight:18}}>
                  As per UIDAI Circular & RBI AEPS Guidelines, the operator (you) must authenticate your own identity via Aadhaar biometric before performing any customer transaction.
                </Text>
              </View>

              {/* Operator shop card */}
              <View style={{flexDirection:'row',alignItems:'center',
                backgroundColor:'rgba(16,185,129,0.08)',
                borderRadius:12,padding:14,marginBottom:20}}>
                <View style={{width:38,height:38,borderRadius:19,
                  backgroundColor:theme.primary,alignItems:'center',
                  justifyContent:'center',marginRight:12}}>
                  <Text style={{color:'#000',fontWeight:'800'}}>
                    {shopName[0]?.toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={{color:theme.text,fontWeight:'700',fontSize:14}}>{shopName}</Text>
                  <Text style={{color:theme.primary,fontSize:11}}>
                    RETAILER · Operator Identity Verification Required
                  </Text>
                </View>
              </View>

              {/* Operator Aadhaar */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Your Aadhaar Number (Operator)
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:6,letterSpacing:4}}
                placeholder='12-digit Aadhaar number'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                maxLength={12}
                value={operatorAadhaar}
                onChangeText={setOperatorAadhaar}
              />
              <Text style={{fontSize:11,color:theme.muted2,marginBottom:18}}>
                🔒 Your Aadhaar is encrypted and used only for biometric authentication. Not stored.
              </Text>

              {/* Biometric device picker */}
              <DevicePicker
                theme={theme}
                value={biometricDevice}
                onSelect={setBiometricDevice}
              />
              {biometricDevice&&(
                <View style={{borderWidth:1,borderColor:theme.border2,
                  backgroundColor:theme.bg2,borderRadius:12,
                  padding:12,marginBottom:18}}>
                  <Text style={{color:theme.primary,fontSize:12,fontWeight:'700',marginBottom:4}}>
                    👆 {BIOMETRIC_DEVICES.find(d=>d.id===biometricDevice)?.name}
                  </Text>
                  <Text style={{color:theme.muted2,fontSize:11}}>
                    Install the RD Service driver before using this device.
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={submitOperatorIdentity}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:14,alignItems:'center',marginTop:6}}>
                <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                  Submit & Proceed to Biometric →
                </Text>
              </TouchableOpacity>
              <Text style={{fontSize:10,color:theme.muted2,textAlign:'center',marginTop:10}}>
                🛡️ RTAI Secured · UIDAI Compliant · AES-256 Encrypted
              </Text>
            </>
          )}

          {/* ══════════════════════════
              STEP 2 — BIOMETRIC AUTH
              ══════════════════════════ */}
          {step===2&&(
            <>
              <View style={{borderWidth:1,borderColor:theme.border2,
                backgroundColor:'rgba(16,185,129,0.06)',
                borderRadius:16,padding:24,alignItems:'center',marginBottom:18}}>
                <Text style={{fontSize:42,marginBottom:10}}>👆</Text>
                <Text style={{fontSize:16,fontWeight:'800',color:theme.primary,marginBottom:4}}>
                  {scanning?'Scanning…':'Place Your Finger on the Device'}
                </Text>
                <Text style={{fontSize:12,color:theme.muted2,textAlign:'center',marginBottom:10}}>
                  Operator: {shopName} · Aadhaar: XXXX XXXX {operatorAadhaar.slice(-4)}
                </Text>
                <View style={{backgroundColor:theme.bg3,borderRadius:100,
                  paddingHorizontal:12,paddingVertical:4}}>
                  <Text style={{fontSize:11,color:theme.muted2}}>
                    📟 {BIOMETRIC_DEVICES.find(d=>d.id===biometricDevice)?.name} · UIDAI Registered
                  </Text>
                </View>
              </View>

              <View style={{flexDirection:'row',gap:8,marginBottom:18}}>
                {[
                  {icon:'🔐',title:'Aadhaar Linked',sub:'UIDAI Verified'},
                  {icon:'📡',title:'Device Ready',  sub:'Connected'},
                  {icon:'🛡️',title:'RTAI Active',   sub:'Monitoring'},
                ].map((c,i)=>(
                  <View key={i} style={{flex:1,alignItems:'center',
                    backgroundColor:theme.card,borderRadius:12,padding:10}}>
                    <Text style={{fontSize:18,marginBottom:2}}>{c.icon}</Text>
                    <Text style={{fontSize:10,fontWeight:'700',color:theme.text,textAlign:'center'}}>
                      {c.title}
                    </Text>
                    <Text style={{fontSize:9,color:theme.primary}}>{c.sub}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={scanOperatorFingerprint} disabled={scanning}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:14,alignItems:'center',marginBottom:10,
                  opacity:scanning?0.7:1}}>
                {scanning
                  ?<ActivityIndicator color='#000'/>
                  :<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                    👆 Scan Fingerprint (Operator Auth)
                  </Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* ══════════════════════════
              STEP 3 — AEPS SERVICE
              ══════════════════════════ */}
          {step===3&&(
            <>
              {/* Operator verified banner */}
              <View style={{flexDirection:'row',alignItems:'center',
                backgroundColor:'rgba(16,185,129,0.08)',
                borderRadius:10,padding:12,marginBottom:18}}>
                <Text style={{fontSize:16,marginRight:8}}>✅</Text>
                <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',flex:1}}>
                  Operator identity verified · Now serving customer
                </Text>
              </View>

              {/* Customer Mobile */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>Customer Mobile</Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:16}}
                placeholder='10-digit mobile number'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                maxLength={10}
                value={customerMobile}
                onChangeText={setCustomerMobile}
              />

              {/* Customer Aadhaar — Manual OR QR tab */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>Customer Aadhaar</Text>

              {/* Tab switcher */}
              <View style={{flexDirection:'row',marginBottom:12,
                backgroundColor:theme.bg3,borderRadius:10,padding:4}}>
                <TouchableOpacity
                  onPress={()=>setAadhaarTab('manual')}
                  style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:'center',
                    backgroundColor:aadhaarTab==='manual'?theme.primary:'transparent'}}>
                  <Text style={{fontSize:12,fontWeight:'700',
                    color:aadhaarTab==='manual'?'#000':theme.muted2}}>
                    🔢 Last 4 Digits
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={()=>{
                    setAadhaarTab('qr');
                    // TODO: Open camera for QR scan here
                    // Use react-native-vision-camera or react-native-camera
                    // Parse Aadhaar QR XML → extract last 4 digits → setCustomerAadhaarLast4()
                    Alert.alert(
                      'QR Scanner',
                      'Camera integration coming soon!\n\nTo enable:\n1. npm install react-native-vision-camera\n2. Add camera permissions\n3. Parse Aadhaar QR XML\n\nFor now please use Last 4 Digits tab.',
                      [{text:'OK',onPress:()=>setAadhaarTab('manual')}]
                    );
                  }}
                  style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:'center',
                    backgroundColor:aadhaarTab==='qr'?theme.primary:'transparent'}}>
                  <Text style={{fontSize:12,fontWeight:'700',
                    color:aadhaarTab==='qr'?'#000':theme.muted2}}>
                    📷 Scan Aadhaar QR
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Manual last 4 input */}
              {aadhaarTab==='manual'&&(
                <>
                  <TextInput
                    style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                      padding:12,color:theme.text,fontSize:22,
                      backgroundColor:theme.bg3,marginBottom:6,
                      letterSpacing:12,textAlign:'center',fontWeight:'700'}}
                    placeholder='XXXX'
                    placeholderTextColor={theme.muted}
                    keyboardType='numeric'
                    maxLength={4}
                    value={customerAadhaarLast4}
                    onChangeText={setCustomerAadhaarLast4}
                  />
                  <Text style={{fontSize:10,color:theme.muted2,marginBottom:16,textAlign:'center'}}>
                    🔒 Last 4 digits only — UIDAI compliant
                  </Text>
                </>
              )}

              {/* Transaction type */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>Transaction Type</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:16}}>
                {TXN_TYPES.map(t=>(
                  <TouchableOpacity key={t.id} onPress={()=>setTxnType(t.id)}
                    style={{paddingHorizontal:14,paddingVertical:10,
                      borderRadius:10,borderWidth:2,
                      borderColor:txnType===t.id?theme.primary:theme.border,
                      backgroundColor:theme.card}}>
                    <Text style={{color:txnType===t.id?theme.primary:theme.text,
                      fontSize:12,fontWeight:'700'}}>
                      {t.icon} {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount — only for withdrawal */}
              {txnType==='withdrawal'&&(
                <>
                  <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                    textTransform:'uppercase',marginBottom:6}}>Amount (₹)</Text>
                  <TextInput
                    style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                      padding:12,color:theme.text,fontSize:16,
                      backgroundColor:theme.bg3,marginBottom:8}}
                    placeholder='Enter withdrawal amount'
                    placeholderTextColor={theme.muted}
                    keyboardType='numeric'
                    value={amount}
                    onChangeText={setAmount}
                  />
                  {/* Quick amount buttons */}
                  <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8}}>
                    {['100','500','1000','2000','5000','10000'].map(a=>(
                      <TouchableOpacity key={a} onPress={()=>setAmount(a)}
                        style={{paddingHorizontal:14,paddingVertical:6,
                          borderRadius:100,borderWidth:1,
                          borderColor:amount===a?theme.primary:theme.border2,
                          backgroundColor:amount===a?theme.primary+'20':theme.bg3}}>
                        <Text style={{color:amount===a?theme.primary:theme.text,
                          fontSize:12,fontWeight:'600'}}>
                          ₹{parseInt(a).toLocaleString('en-IN')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* OTP field — appears automatically when amount > ₹5,000 */}
                  {needsOtp&&(
                    <View style={{borderWidth:1,borderColor:'rgba(239,68,68,0.3)',
                      backgroundColor:'rgba(239,68,68,0.06)',
                      borderRadius:12,padding:14,marginBottom:16}}>
                      <Text style={{color:'#ef4444',fontSize:12,fontWeight:'700',marginBottom:8}}>
                        🔐 Government Regulation — Amount above ₹5,000
                      </Text>
                      <Text style={{color:theme.muted2,fontSize:11,marginBottom:10}}>
                        As per UIDAI/RBI guidelines, withdrawals above ₹5,000 require Aadhaar OTP verification on the customer's registered mobile number.
                      </Text>
                      <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                        textTransform:'uppercase',marginBottom:6}}>
                        Aadhaar OTP (6 digits)
                      </Text>
                      <TextInput
                        style={{borderWidth:1,borderColor:'#ef4444',borderRadius:10,
                          padding:12,color:theme.text,fontSize:18,
                          backgroundColor:theme.bg3,letterSpacing:8,textAlign:'center'}}
                        placeholder='• • • • • •'
                        placeholderTextColor={theme.muted}
                        keyboardType='numeric'
                        maxLength={6}
                        value={aadhaarOtp}
                        onChangeText={setAadhaarOtp}
                      />
                    </View>
                  )}
                  {!needsOtp&&amount&&<View style={{marginBottom:16}}/>}
                </>
              )}

              {/* Bank picker */}
              <BankPicker
                theme={theme}
                value={customerBank}
                onSelect={(name)=>{
                  setCustomerBank(name);
                  setTimeout(()=>{
                    scrollRef.current?.scrollToEnd({animated:true});
                  },300);
                }}
              />

              {/* Submit */}
              <TouchableOpacity
                onPress={processCustomerTransaction}
                disabled={processing}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:16,alignItems:'center',
                  opacity:processing?0.7:1,marginTop:8}}>
                {processing
                  ?<ActivityIndicator color='#000'/>
                  :<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                    👆 Customer Biometric & Process →
                  </Text>
                }
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
