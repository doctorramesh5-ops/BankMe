import React,{useState,useRef} from "react";
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,ScrollView,ActivityIndicator,Alert,StatusBar} from "react-native";
import {useDispatch} from "react-redux";
import {useTheme} from "../../theme/ThemeContext";
import {setUser} from "../../store/authSlice";
const CF_WORKER = "https://bankme-otp.doctorramesh5.workers.dev";
export default function LoginScreen({navigation}:any) {
  const {theme} = useTheme();
  const dispatch = useDispatch();
  const [step,setStep] = useState("mobile");
  const [mobile,setMobile] = useState("");
  const [otp,setOtp] = useState("");
  const [loading,setLoading] = useState(false);
  const [timer,setTimer] = useState(0);
  const timerRef = useRef<any>(null);
  const startTimer = () => {
    setTimer(30);
    timerRef.current = setInterval(()=>setTimer(p=>{if(p<=1){clearInterval(timerRef.current);return 0;}return p-1;}),1000);
  };
  const sendOTP = async () => {
    if(mobile.length!==10||!/^[6-9]\d{9}$/.test(mobile)) {Alert.alert("Invalid","Enter valid 10-digit mobile");return;}
    setLoading(true);
    try {
      const res = await fetch(CF_WORKER+"?action=send&phone="+mobile);
      const data = await res.json();
      if(data.type==="success"){setStep("otp");startTimer();}
      else Alert.alert("Failed",data.message||"Could not send OTP");
    } catch(e){Alert.alert("Error","Network error");}
    finally{setLoading(false);}
  };
  const verifyOTP = async () => {
    if(otp.length!==6){Alert.alert("Invalid","Enter 6-digit OTP");return;}
    setLoading(true);
    try {
      const res = await fetch(CF_WORKER+"?action=verify&phone="+mobile+"&otp="+otp);
      const data = await res.json();
      if(data.type==="success"){
        dispatch(setUser({uid:Date.now().toString(),name:"User "+mobile.slice(-4),phone:mobile,email:"",role:"customer",wallet:0,kyc:"pending",rtaiScore:0,commissionEarned:0,joined:new Date().toLocaleDateString("en-IN")}));
      } else {Alert.alert("Invalid OTP",data.message||"Try again");setOtp("");}
    } catch(e){Alert.alert("Error","Verification failed");}
    finally{setLoading(false);}
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{flex:1,backgroundColor:theme.bg}}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <ScrollView contentContainerStyle={{flexGrow:1,alignItems:"center",justifyContent:"center",padding:20}} keyboardShouldPersistTaps="handled">
        <Text style={{fontSize:60,marginBottom:12}}>🏦</Text>
        <Text style={{fontSize:36,fontWeight:"900",color:theme.primary,letterSpacing:2,marginBottom:8}}>BankMe</Text>
        <Text style={{fontSize:14,color:theme.muted2,marginBottom:32}}>{step==="mobile"?"Sign in to your account":"OTP sent to +91 "+mobile}</Text>
        <View style={{width:"100%",maxWidth:400,backgroundColor:theme.card,borderRadius:20,padding:24,borderWidth:1,borderColor:theme.border,marginBottom:24}}>
          {step==="mobile"?(
            <>
              <Text style={{fontSize:11,fontWeight:"700",color:theme.muted2,textTransform:"uppercase",marginBottom:6}}>Mobile Number</Text>
              <View style={{flexDirection:"row",marginBottom:16,borderWidth:1,borderColor:theme.border2,borderRadius:12,overflow:"hidden"}}>
                <View style={{backgroundColor:theme.bg3,paddingHorizontal:12,justifyContent:"center",borderRightWidth:1,borderRightColor:theme.border}}>
                  <Text style={{color:theme.text,fontWeight:"600",fontSize:14}}>🇮🇳 +91</Text>
                </View>
                <TextInput style={{flex:1,padding:12,color:theme.text,fontSize:16}} placeholder="10-digit mobile" placeholderTextColor={theme.muted} keyboardType="numeric" maxLength={10} value={mobile} onChangeText={setMobile}/>
              </View>
              <TouchableOpacity style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:"center",opacity:loading?0.6:1}} onPress={sendOTP} disabled={loading}>
                {loading?<ActivityIndicator color="#000"/>:<Text style={{color:"#000",fontWeight:"800",fontSize:15}}>Send OTP →</Text>}
              </TouchableOpacity>
            </>
          ):(
            <>
              <Text style={{fontSize:16,fontWeight:"700",color:theme.text,textAlign:"center",marginBottom:20}}>Enter 6-digit OTP</Text>
              <TextInput style={{borderWidth:2,borderColor:theme.primary,borderRadius:12,padding:14,color:theme.text,fontSize:24,fontWeight:"800",textAlign:"center",letterSpacing:8,marginBottom:16}} placeholder="------" placeholderTextColor={theme.muted} keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp}/>
              <TouchableOpacity style={{backgroundColor:theme.primary,borderRadius:12,padding:14,alignItems:"center",opacity:loading?0.6:1,marginBottom:12}} onPress={verifyOTP} disabled={loading}>
                {loading?<ActivityIndicator color="#000"/>:<Text style={{color:"#000",fontWeight:"800",fontSize:15}}>Verify & Login →</Text>}
              </TouchableOpacity>
              <View style={{flexDirection:"row",justifyContent:"center",marginBottom:8}}>
                <Text style={{color:theme.muted2,fontSize:13}}>Didn t receive? </Text>
                <TouchableOpacity onPress={timer===0?sendOTP:undefined} disabled={timer>0}>
                  <Text style={{color:timer>0?theme.muted:theme.primary,fontSize:13,fontWeight:"700"}}>{timer>0?"Resend in "+timer+"s":"Resend OTP"}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{alignItems:"center"}} onPress={()=>{setStep("mobile");setOtp("");}}>
                <Text style={{color:theme.muted2,fontSize:13}}>← Change Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={{flexDirection:"row",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
          {["🔒 SSL","🛡️ PCI DSS","✓ RTAI"].map(b=>(
            <View key={b} style={{paddingHorizontal:10,paddingVertical:4,borderRadius:100,borderWidth:1,borderColor:theme.border2,backgroundColor:theme.bg3}}>
              <Text style={{fontSize:11,fontWeight:"600",color:theme.muted2}}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
