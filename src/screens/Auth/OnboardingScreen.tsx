import React,{useState,useRef} from "react";
import {View,Text,TouchableOpacity,FlatList,Dimensions,StatusBar} from "react-native";
import {useTheme} from "../../theme/ThemeContext";
const {width} = Dimensions.get("window");
const SLIDES = [
  {id:"1",emoji:"🏦",title:"India's Trusted Fintech Platform",subtitle:"Complete financial services powered by RTAI",color:"#00d4aa"},
  {id:"2",emoji:"⚡",title:"AEPS · DMT · BBPS · UPI · Insurance · More",subtitle:"15+ services for retailers and customers",color:"#3b82f6"},
  {id:"3",emoji:"🛡️",title:"RTAI Powered · PCI DSS Secured",subtitle:"RBI compliant · Biometric · SSL encrypted",color:"#8b5cf6"},
];
export default function OnboardingScreen({navigation}:any) {
  const {theme} = useTheme();
  const [current,setCurrent] = useState(0);
  const ref = useRef<FlatList>(null);
  const goNext = () => {
    if(current < SLIDES.length-1){ ref.current?.scrollToIndex({index:current+1}); setCurrent(current+1); }
    else navigation.replace("Login");
  };
  return (
    <View style={{flex:1,backgroundColor:theme.bg}}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <FlatList ref={ref} data={SLIDES} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false} keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <View style={{width,flex:1,alignItems:"center",justifyContent:"center",paddingHorizontal:32,paddingTop:60}}>
            <View style={{width:140,height:140,borderRadius:35,borderWidth:2,borderColor:item.color+"40",backgroundColor:item.color+"15",alignItems:"center",justifyContent:"center",marginBottom:40}}>
              <Text style={{fontSize:72}}>{item.emoji}</Text>
            </View>
            <Text style={{fontSize:28,fontWeight:"900",color:theme.text,textAlign:"center",lineHeight:36,marginBottom:16}}>{item.title}</Text>
            <Text style={{fontSize:15,color:theme.muted2,textAlign:"center",lineHeight:22}}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={{flexDirection:"row",justifyContent:"center",gap:6,marginBottom:32}}>
        {SLIDES.map((_,i)=><View key={i} style={{height:8,borderRadius:4,backgroundColor:i===current?theme.primary:theme.border2,width:i===current?24:8}}/>)}
      </View>
      <View style={{paddingHorizontal:24,marginBottom:48,alignItems:"center",gap:12}}>
        <TouchableOpacity style={{width:"100%",maxWidth:320,padding:16,borderRadius:14,alignItems:"center",backgroundColor:theme.primary}} onPress={goNext}>
          <Text style={{color:"#000",fontWeight:"800",fontSize:16}}>{current===SLIDES.length-1?"Get Started →":"Next →"}</Text>
        </TouchableOpacity>
        {current<SLIDES.length-1&&<TouchableOpacity onPress={()=>navigation.replace("Login")}><Text style={{fontSize:14,fontWeight:"600",color:theme.muted2}}>Skip</Text></TouchableOpacity>}
      </View>
    </View>
  );
}
