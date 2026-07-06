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
import BankMeLogo from '../../components/BankMeLogo';

// ── POPULAR BANKS ─────────────────────────────────────────
const BANKS = [
  {id:'sbi',    name:'State Bank of India', ifsc:'SBIN0'},
  {id:'hdfc',   name:'HDFC Bank',           ifsc:'HDFC0'},
  {id:'icici',  name:'ICICI Bank',          ifsc:'ICIC0'},
  {id:'axis',   name:'Axis Bank',           ifsc:'UTIB0'},
  {id:'pnb',    name:'Punjab National Bank',ifsc:'PUNB0'},
  {id:'bob',    name:'Bank of Baroda',      ifsc:'BARB0'},
  {id:'canara', name:'Canara Bank',         ifsc:'CNRB0'},
  {id:'union',  name:'Union Bank of India', ifsc:'UBIN0'},
  {id:'indian', name:'Indian Bank',         ifsc:'IDIB0'},
  {id:'kotak',  name:'Kotak Mahindra Bank', ifsc:'KKBK0'},
  {id:'iob',    name:'Indian Overseas Bank',ifsc:'IOBA0'},
  {id:'yes',    name:'Yes Bank',            ifsc:'YESB0'},
  {id:'idfc',   name:'IDFC First Bank',     ifsc:'IDFB0'},
  {id:'rbl',    name:'RBL Bank',            ifsc:'RATN0'},
  {id:'federal',name:'Federal Bank',        ifsc:'FDRL0'},
];

// ── STEP BAR ──────────────────────────────────────────────
function StepBar({step,theme}:{step:number;theme:any}){
  const steps=[
    {n:1,label:'Sender',      icon:'👤'},
    {n:2,label:'Beneficiary', icon:'🏦'},
    {n:3,label:'Transfer',    icon:'💸'},
  ];
  return (
    <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:20}}>
      {steps.map((s,i)=>{
        const done   = step>s.n;
        const active = step===s.n;
        const color  = done||active?theme.primary:theme.muted2;
        return (
          <React.Fragment key={s.n}>
            <View style={{alignItems:'center',width:78}}>
              <View style={{width:40,height:40,borderRadius:20,
                borderWidth:2,borderColor:color,
                backgroundColor:done?'rgba(16,185,129,0.15)':active?'rgba(16,185,129,0.1)':'transparent',
                alignItems:'center',justifyContent:'center',marginBottom:6}}>
                <Text style={{fontSize:16,color}}>{done?'✓':s.icon}</Text>
              </View>
              <Text style={{fontSize:10,fontWeight:'700',color,textAlign:'center'}}>
                {s.label}
              </Text>
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

// ── BANK PICKER MODAL ─────────────────────────────────────
function BankPicker({theme,value,onSelect}:{
  theme:any;value:string;onSelect:(b:any)=>void
}){
  const [open,setOpen]   = useState(false);
  const [query,setQuery] = useState('');
  const filtered = BANKS.filter(b=>
    b.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
        textTransform:'uppercase',marginBottom:6}}>Bank Name</Text>
      <TouchableOpacity
        onPress={()=>{setQuery('');setOpen(true);}}
        style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
          padding:12,backgroundColor:theme.bg3,
          flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{color:value?theme.text:theme.muted,fontSize:14}}>
          {value||'🔍 Select bank...'}
        </Text>
        <Text style={{color:theme.muted2,fontSize:12}}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType='slide'
        onRequestClose={()=>setOpen(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'flex-end'}}>
          <View style={{backgroundColor:theme.bg,borderTopLeftRadius:20,
            borderTopRightRadius:20,maxHeight:'75%'}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',
              alignItems:'center',padding:16,
              borderBottomWidth:1,borderBottomColor:theme.border}}>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text}}>
                Select Bank
              </Text>
              <TouchableOpacity onPress={()=>setOpen(false)}>
                <Text style={{fontSize:18,color:theme.muted2}}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal:16,paddingVertical:10}}>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:10,
                  padding:10,color:theme.text,fontSize:14,
                  backgroundColor:theme.bg3}}
                placeholder='Search bank...'
                placeholderTextColor={theme.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            <ScrollView keyboardShouldPersistTaps='handled'>
              {filtered.map(b=>(
                <TouchableOpacity key={b.id}
                  onPress={()=>{onSelect(b);setOpen(false);}}
                  style={{padding:16,borderBottomWidth:1,
                    borderBottomColor:theme.border,
                    flexDirection:'row',alignItems:'center'}}>
                  <Text style={{fontSize:18,marginRight:12}}>🏦</Text>
                  <View style={{flex:1}}>
                    <Text style={{color:theme.text,fontSize:14,fontWeight:'600'}}>
                      {b.name}
                    </Text>
                    <Text style={{color:theme.muted2,fontSize:11}}>
                      IFSC: {b.ifsc}XXXXX
                    </Text>
                  </View>
                  {value===b.name&&(
                    <Text style={{color:theme.primary,fontSize:16}}>✓</Text>
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

// ── MAIN SCREEN ───────────────────────────────────────────
export default function DMTScreen({navigation}:any){
  const {theme}    = useTheme();
  const user       = useSelector((s:RootState)=>s.auth.user);
  const scrollRef  = useRef<ScrollView>(null);

  const [step,setStep] = useState(1);

  // Step 1 — Sender
  const [senderMobile,setSenderMobile] = useState('');
  const [senderName,setSenderName]     = useState('');
  const [senderKyc,setSenderKyc]       = useState(false);

  // Step 2 — Beneficiary
  const [beneName,setBeneName]         = useState('');
  const [beneAccount,setBeneAccount]   = useState('');
  const [beneConfirm,setBeneConfirm]   = useState('');
  const [beneIfsc,setBeneIfsc]         = useState('');
  const [beneBank,setBeneBank]         = useState('');
  const [saveBene,setSaveBene]         = useState(false);

  // Step 3 — Transfer
  const [amount,setAmount]             = useState('');
  const [remarks,setRemarks]           = useState('');
  const [otp,setOtp]                   = useState('');
  const [otpSent,setOtpSent]           = useState(false);
  const [processing,setProcessing]     = useState(false);
  const [sendingOtp,setSendingOtp]     = useState(false);

  // Success
  const [txnId]    = useState('DMT'+Date.now().toString().slice(-8));
  const [txnTime]  = useState(new Date());

  const amountNum  = parseFloat(amount)||0;

  // ── Step 1: Verify sender ──
  const verifySender = () => {
    if(!senderMobile||senderMobile.length!==10){
      Alert.alert('Invalid','Enter 10-digit sender mobile number');return;
    }
    // Simulate KYC check
    // TODO: Replace with real KYC API call
    setSenderName('Ramesh Kumar'); // simulated
    setSenderKyc(true);
    setTimeout(()=>setStep(2),500);
  };

  // ── Step 2: Validate beneficiary ──
  const validateBeneficiary = () => {
    if(!beneName.trim()){
      Alert.alert('Invalid','Enter beneficiary name');return;
    }
    if(!beneAccount||beneAccount.length<9){
      Alert.alert('Invalid','Enter valid account number');return;
    }
    if(beneAccount!==beneConfirm){
      Alert.alert('Mismatch','Account numbers do not match');return;
    }
    if(!beneIfsc||beneIfsc.length!==11){
      Alert.alert('Invalid','Enter valid 11-character IFSC code');return;
    }
    if(!beneBank){
      Alert.alert('Invalid','Select beneficiary bank');return;
    }
    setStep(3);
  };

  // ── Step 3: Send OTP ──
  const sendTransferOtp = () => {
    if(!amount||amountNum<=0){
      Alert.alert('Invalid','Enter transfer amount');return;
    }
    if(amountNum>25000){
      Alert.alert('Limit exceeded','DMT limit is ₹25,000 per transaction');return;
    }
    setSendingOtp(true);
    // TODO: Replace with real OTP API call
    setTimeout(()=>{
      setSendingOtp(false);
      setOtpSent(true);
      Alert.alert('OTP Sent',`OTP sent to ${senderMobile}`);
    },1500);
  };

  // ── Step 3: Process transfer ──
  const processTransfer = () => {
    if(!otp||otp.length!==6){
      Alert.alert('Invalid','Enter 6-digit OTP');return;
    }
    setProcessing(true);
    // TODO: Replace with real DMT API call
    setTimeout(()=>{
      setProcessing(false);
      setStep(4);
    },2000);
  };

  // ── Share receipt ──
  const shareReceipt = async () => {
    const msg =
`🏦 BankMe — DMT Receipt
━━━━━━━━━━━━━━━━━━━━━
TXN ID     : ${txnId}
Date       : ${txnTime.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
Time       : ${txnTime.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}
━━━━━━━━━━━━━━━━━━━━━
Amount     : ₹${amountNum.toLocaleString('en-IN')}
Sender     : ${senderName} (${senderMobile})
Beneficiary: ${beneName}
Account    : XXXX${beneAccount.slice(-4)}
Bank       : ${beneBank}
IFSC       : ${beneIfsc}
${remarks?`Remarks    : ${remarks}\n`:''}━━━━━━━━━━━━━━━━━━━━━
RTAI       : ✓ Verified
Powered by BankMe · RTAI Secured`;
    try {
      await Share.share({message:msg,title:'DMT Transfer Receipt'});
    } catch(e){
      Alert.alert('Error','Could not open share menu');
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSenderMobile('');setSenderName('');setSenderKyc(false);
    setBeneName('');setBeneAccount('');setBeneConfirm('');
    setBeneIfsc('');setBeneBank('');setSaveBene(false);
    setAmount('');setRemarks('');setOtp('');setOtpSent(false);
  };

  // ══════════════════════════════════
  // ── SUCCESS / RECEIPT (step 4) ──
  // ══════════════════════════════════
  if(step===4) return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{padding:24,paddingBottom:60}}>

        {/* BankMe logo header */}
        <View style={{alignItems:'center',marginBottom:20,marginTop:8}}>
          <BankMeLogo size={64} variant="card" showText />
          <Text style={{fontSize:11,color:theme.muted2,marginBottom:12}}>
            Powered by RTAI · Complete Fintech Platform
          </Text>

          {/* Date and Time */}
          <View style={{flexDirection:'row',gap:16,marginBottom:16}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Text style={{fontSize:12}}>📅</Text>
              <Text style={{fontSize:12,color:theme.muted2,fontWeight:'600'}}>
                {txnTime.toLocaleDateString('en-IN',{
                  day:'2-digit',month:'short',year:'numeric'
                })}
              </Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Text style={{fontSize:12}}>🕐</Text>
              <Text style={{fontSize:12,color:theme.muted2,fontWeight:'600'}}>
                {txnTime.toLocaleTimeString('en-IN',{
                  hour:'2-digit',minute:'2-digit',hour12:true
                })}
              </Text>
            </View>
          </View>

          {/* Success */}
          <View style={{width:80,height:80,borderRadius:40,
            backgroundColor:'rgba(16,185,129,0.15)',
            alignItems:'center',justifyContent:'center',marginBottom:12}}>
            <Text style={{fontSize:40}}>✅</Text>
          </View>
          <Text style={{fontSize:22,fontWeight:'900',color:theme.text,marginBottom:4}}>
            Transfer Successful!
          </Text>
          <Text style={{fontSize:14,color:theme.muted2,marginBottom:4}}>
            Domestic Money Transfer
          </Text>
          <Text style={{fontSize:32,fontWeight:'900',color:'#10b981',marginTop:4}}>
            ₹{amountNum.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Receipt card */}
        <View style={{backgroundColor:theme.card,borderRadius:16,
          borderWidth:1,borderColor:theme.border,
          padding:20,marginBottom:20}}>
          <Text style={{fontSize:14,fontWeight:'800',color:theme.text,
            marginBottom:14,textAlign:'center',letterSpacing:1}}>
            🧾 TRANSFER RECEIPT
          </Text>

          {[
            {label:'TXN ID',       value:txnId},
            {label:'Amount',       value:`₹${amountNum.toLocaleString('en-IN')}`},
            {label:'Sender',       value:`${senderName}`},
            {label:'Sender Mobile',value:senderMobile},
            {label:'Beneficiary',  value:beneName},
            {label:'Account',      value:`XXXX XXXX ${beneAccount.slice(-4)}`},
            {label:'Bank',         value:beneBank},
            {label:'IFSC',         value:beneIfsc},
            ...(remarks?[{label:'Remarks',value:remarks}]:[]),
            {label:'RTAI Status',  value:'✓ Verified'},
          ].map((row,i,arr)=>(
            <View key={i} style={{flexDirection:'row',
              justifyContent:'space-between',
              paddingVertical:8,
              borderBottomWidth:i<arr.length-1?1:0,
              borderBottomColor:theme.border}}>
              <Text style={{color:theme.muted2,fontSize:13}}>{row.label}</Text>
              <Text style={{
                color:row.label==='RTAI Status'?'#10b981':
                      row.label==='Amount'?'#10b981':theme.text,
                fontSize:13,fontWeight:'600',
                maxWidth:'60%',textAlign:'right'}}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <TouchableOpacity onPress={shareReceipt}
          style={{backgroundColor:theme.primary,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            flexDirection:'row',justifyContent:'center',gap:8}}>
          <Text style={{fontSize:18}}>📤</Text>
          <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
            Share Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>Alert.alert('Print',
            'Connect to a Bluetooth printer.\nInstall react-native-print for full support.')}
          style={{backgroundColor:theme.card,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            flexDirection:'row',justifyContent:'center',gap:8,
            borderWidth:1,borderColor:theme.border}}>
          <Text style={{fontSize:18}}>🖨️</Text>
          <Text style={{color:theme.text,fontWeight:'800',fontSize:15}}>
            Print Receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{backgroundColor:theme.bg3,borderRadius:12,
            padding:14,alignItems:'center',marginBottom:12,
            borderWidth:1,borderColor:theme.border}}
          onPress={()=>navigation.goBack()}>
          <Text style={{color:theme.text,fontWeight:'800',fontSize:15}}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetWizard} style={{alignItems:'center',padding:8}}>
          <Text style={{color:theme.primary,fontSize:14,fontWeight:'600'}}>
            + New Transfer
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );

  // ══════════════════════════
  // ── WIZARD STEPS 1–3 ──
  // ══════════════════════════
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
          <Text style={{fontSize:18,fontWeight:'800',color:theme.text}}>
            Money Transfer
          </Text>
          <Text style={{fontSize:11,color:theme.primary}}>
            💸 DMT · Domestic Money Transfer
          </Text>
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

          {/* ══════════════════════
              STEP 1 — SENDER
              ══════════════════════ */}
          {step===1&&(
            <>
              <View style={{borderWidth:1,borderColor:'rgba(59,130,246,0.3)',
                backgroundColor:'rgba(59,130,246,0.06)',
                borderRadius:12,padding:14,marginBottom:20}}>
                <Text style={{color:'#3b82f6',fontSize:12,fontWeight:'700',marginBottom:4}}>
                  ℹ️ DMT Information
                </Text>
                <Text style={{color:theme.muted2,fontSize:12,lineHeight:18}}>
                  Enter the sender's mobile number to verify their identity and KYC status before initiating the transfer.
                </Text>
              </View>

              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Sender Mobile Number
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:16}}
                placeholder='10-digit mobile number'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                maxLength={10}
                value={senderMobile}
                onChangeText={setSenderMobile}
              />

              {senderKyc&&(
                <View style={{flexDirection:'row',alignItems:'center',
                  backgroundColor:'rgba(16,185,129,0.08)',
                  borderRadius:12,padding:14,marginBottom:16}}>
                  <Text style={{fontSize:20,marginRight:12}}>✅</Text>
                  <View>
                    <Text style={{color:theme.text,fontWeight:'700',fontSize:14}}>
                      {senderName}
                    </Text>
                    <Text style={{color:'#10b981',fontSize:11}}>
                      KYC Verified · Ready to transfer
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={verifySender}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:14,alignItems:'center'}}>
                <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                  Verify Sender →
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ══════════════════════════
              STEP 2 — BENEFICIARY
              ══════════════════════════ */}
          {step===2&&(
            <>
              {/* Sender confirmed */}
              <View style={{flexDirection:'row',alignItems:'center',
                backgroundColor:'rgba(16,185,129,0.08)',
                borderRadius:10,padding:12,marginBottom:18}}>
                <Text style={{fontSize:16,marginRight:8}}>✅</Text>
                <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',flex:1}}>
                  Sender: {senderName} ({senderMobile})
                </Text>
              </View>

              {/* Beneficiary name */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Beneficiary Name
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:16}}
                placeholder='Account holder full name'
                placeholderTextColor={theme.muted}
                value={beneName}
                onChangeText={setBeneName}
              />

              {/* Account number */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Account Number
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:16}}
                placeholder='Enter account number'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                value={beneAccount}
                onChangeText={setBeneAccount}
              />

              {/* Confirm account number */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Confirm Account Number
              </Text>
              <TextInput
                style={{borderWidth:1,
                  borderColor:beneConfirm&&beneAccount!==beneConfirm?
                    '#ef4444':theme.border2,
                  borderRadius:12,padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:4}}
                placeholder='Re-enter account number'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                value={beneConfirm}
                onChangeText={setBeneConfirm}
              />
              {beneConfirm&&beneAccount!==beneConfirm&&(
                <Text style={{color:'#ef4444',fontSize:11,marginBottom:12}}>
                  ⚠️ Account numbers do not match
                </Text>
              )}
              {beneConfirm&&beneAccount===beneConfirm&&(
                <Text style={{color:'#10b981',fontSize:11,marginBottom:12}}>
                  ✓ Account numbers match
                </Text>
              )}
              {(!beneConfirm||beneAccount===beneConfirm)&&<View style={{marginBottom:12}}/>}

              {/* IFSC code */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                IFSC Code
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:16,
                  backgroundColor:theme.bg3,marginBottom:4,
                  textTransform:'uppercase',letterSpacing:2}}
                placeholder='e.g. SBIN0001234'
                placeholderTextColor={theme.muted}
                maxLength={11}
                value={beneIfsc}
                onChangeText={(t)=>setBeneIfsc(t.toUpperCase())}
              />
              <Text style={{fontSize:10,color:theme.muted2,marginBottom:16}}>
                🔍 11-character IFSC code from cheque book or passbook
              </Text>

              {/* Bank picker */}
              <BankPicker
                theme={theme}
                value={beneBank}
                onSelect={(b)=>{
                  setBeneBank(b.name);
                  if(!beneIfsc) setBeneIfsc(b.ifsc);
                  setTimeout(()=>{
                    scrollRef.current?.scrollToEnd({animated:true});
                  },300);
                }}
              />

              {/* Save beneficiary toggle */}
              <TouchableOpacity
                onPress={()=>setSaveBene(v=>!v)}
                style={{flexDirection:'row',alignItems:'center',
                  backgroundColor:theme.card,borderRadius:12,
                  padding:14,marginBottom:20,
                  borderWidth:1,borderColor:theme.border}}>
                <View style={{width:22,height:22,borderRadius:6,
                  borderWidth:2,borderColor:saveBene?theme.primary:theme.muted2,
                  backgroundColor:saveBene?theme.primary:'transparent',
                  alignItems:'center',justifyContent:'center',marginRight:12}}>
                  {saveBene&&<Text style={{color:'#000',fontSize:12,fontWeight:'900'}}>✓</Text>}
                </View>
                <View>
                  <Text style={{color:theme.text,fontSize:14,fontWeight:'600'}}>
                    Save Beneficiary
                  </Text>
                  <Text style={{color:theme.muted2,fontSize:11}}>
                    For faster transfers next time
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={validateBeneficiary}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:14,alignItems:'center'}}>
                <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                  Proceed to Transfer →
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ══════════════════════════
              STEP 3 — TRANSFER
              ══════════════════════════ */}
          {step===3&&(
            <>
              {/* Summary card */}
              <View style={{backgroundColor:theme.card,borderRadius:14,
                padding:16,marginBottom:20,
                borderWidth:1,borderColor:theme.border}}>
                <Text style={{fontSize:12,fontWeight:'700',color:theme.muted2,
                  marginBottom:10,textTransform:'uppercase'}}>
                  Transfer Summary
                </Text>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                  <Text style={{color:theme.muted2,fontSize:13}}>From</Text>
                  <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>
                    {senderName} · {senderMobile}
                  </Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                  <Text style={{color:theme.muted2,fontSize:13}}>To</Text>
                  <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>
                    {beneName}
                  </Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                  <Text style={{color:theme.muted2,fontSize:13}}>Account</Text>
                  <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>
                    XXXX{beneAccount.slice(-4)}
                  </Text>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <Text style={{color:theme.muted2,fontSize:13}}>Bank</Text>
                  <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>
                    {beneBank}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Amount (₹)
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:20,
                  backgroundColor:theme.bg3,marginBottom:8,
                  fontWeight:'700',textAlign:'center'}}
                placeholder='0'
                placeholderTextColor={theme.muted}
                keyboardType='numeric'
                value={amount}
                onChangeText={setAmount}
              />

              {/* Quick amounts */}
              <View style={{flexDirection:'row',flexWrap:'wrap',
                gap:8,marginBottom:8}}>
                {['500','1000','2000','5000','10000','25000'].map(a=>(
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
              <Text style={{fontSize:10,color:theme.muted2,marginBottom:16}}>
                📌 Maximum limit: ₹25,000 per transaction
              </Text>

              {/* Remarks */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Remarks (Optional)
              </Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:14,
                  backgroundColor:theme.bg3,marginBottom:20}}
                placeholder='e.g. Rent payment, Family support...'
                placeholderTextColor={theme.muted}
                value={remarks}
                onChangeText={setRemarks}
              />

              {/* OTP section */}
              {!otpSent?(
                <TouchableOpacity onPress={sendTransferOtp}
                  disabled={sendingOtp}
                  style={{backgroundColor:theme.primary,borderRadius:12,
                    padding:14,alignItems:'center',
                    opacity:sendingOtp?0.7:1}}>
                  {sendingOtp
                    ?<ActivityIndicator color='#000'/>
                    :<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                      Send OTP & Confirm →
                    </Text>
                  }
                </TouchableOpacity>
              ):(
                <>
                  <View style={{borderWidth:1,
                    borderColor:'rgba(16,185,129,0.3)',
                    backgroundColor:'rgba(16,185,129,0.06)',
                    borderRadius:12,padding:14,marginBottom:16}}>
                    <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',marginBottom:6}}>
                      ✅ OTP sent to {senderMobile}
                    </Text>
                    <Text style={{color:theme.muted2,fontSize:11}}>
                      Enter the 6-digit OTP received by the sender to confirm this transfer.
                    </Text>
                  </View>

                  <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                    textTransform:'uppercase',marginBottom:6}}>
                    Enter OTP
                  </Text>
                  <TextInput
                    style={{borderWidth:1,borderColor:theme.border2,
                      borderRadius:12,padding:12,color:theme.text,
                      fontSize:24,backgroundColor:theme.bg3,marginBottom:16,
                      letterSpacing:12,textAlign:'center',fontWeight:'700'}}
                    placeholder='• • • • • •'
                    placeholderTextColor={theme.muted}
                    keyboardType='numeric'
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />

                  <TouchableOpacity onPress={processTransfer}
                    disabled={processing}
                    style={{backgroundColor:theme.primary,borderRadius:12,
                      padding:14,alignItems:'center',
                      opacity:processing?0.7:1,marginBottom:12}}>
                    {processing
                      ?<ActivityIndicator color='#000'/>
                      :<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                        💸 Confirm Transfer →
                      </Text>
                    }
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={()=>{setOtpSent(false);setOtp('');}}
                    style={{alignItems:'center',padding:8}}>
                    <Text style={{color:theme.muted2,fontSize:13}}>
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
