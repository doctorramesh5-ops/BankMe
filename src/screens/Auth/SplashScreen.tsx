import React, {useEffect,useRef} from "react";
import {View,Text,StyleSheet,StatusBar,Animated} from "react-native";
import {useTheme} from "../../theme/ThemeContext";
export default function SplashScreen({navigation}:any) {
  const {theme} = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    Animated.parallel([
      Animated.spring(scale,{toValue:1,tension:50,friction:7,useNativeDriver:true}),
      Animated.timing(opacity,{toValue:1,duration:800,useNativeDriver:true})
    ]).start();
    const t = setTimeout(()=>navigation.replace("Onboarding"),2500);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <View style={{flex:1,backgroundColor:theme.bg,alignItems:"center",justifyContent:"center"}}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <Animated.View style={{alignItems:"center",opacity,transform:[{scale}]}}>
        <View style={{width:120,height:120,borderRadius:30,borderWidth:2,borderColor:theme.primary+"40",backgroundColor:theme.primary+"18",alignItems:"center",justifyContent:"center",marginBottom:24}}>
          <Text style={{fontSize:60}}>🏦</Text>
        </View>
        <Text style={{fontSize:42,fontWeight:"900",color:theme.primary,letterSpacing:2,marginBottom:8}}>BankMe</Text>
        <Text style={{fontSize:14,color:theme.muted2,letterSpacing:1}}>Powered by RTAI</Text>
      </Animated.View>
      <View style={{position:"absolute",bottom:48,alignItems:"center",gap:8}}>
        <View style={{paddingHorizontal:16,paddingVertical:6,borderRadius:100,borderWidth:1,borderColor:theme.primary+"40",backgroundColor:theme.primary+"12"}}>
          <Text style={{fontSize:12,fontWeight:"700",color:theme.primary,letterSpacing:0.5}}>✓ RTAI Secured</Text>
        </View>
        <Text style={{fontSize:12,color:theme.muted}}>PayPe Technologies Pvt. Ltd.</Text>
        <Text style={{fontSize:10,color:theme.border2,marginTop:4}}>v2.0.0</Text>
      </View>
    </View>
  );
}
