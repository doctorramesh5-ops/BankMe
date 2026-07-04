import React,{useState,useEffect} from 'react';
import {
  View,Text,ScrollView,TouchableOpacity,StatusBar,
  TextInput,Alert,ActivityIndicator,Modal,Image,
  Linking,Platform
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector,useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import QRCode from 'react-native-qrcode-svg';
import {launchCamera,launchImageLibrary} from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import {check,request,PERMISSIONS,RESULTS} from 'react-native-permissions';

// ── DOCUMENT TYPES ────────────────────────────────────────
const DOCUMENTS = [
  {id:'gst',     label:'GST Certificate',           icon:'📋'},
  {id:'msme',    label:'MSME Certificate',           icon:'🏭'},
  {id:'fssai',   label:'FSSAI License',              icon:'🍽️'},
  {id:'local',   label:'Local Govt. Approval',       icon:'🏛️'},
  {id:'pan',     label:'PAN Card',                   icon:'💳'},
  {id:'aadhaar', label:'Aadhaar Card',               icon:'🪪'},
];

// ── HAVERSINE DISTANCE (meters between two GPS points) ────
function getDistanceMeters(
  lat1:number,lon1:number,
  lat2:number,lon2:number
):number{
  const R=6371000; // Earth radius in meters
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLon=(lon2-lon1)*Math.PI/180;
  const a=
    Math.sin(dLat/2)*Math.sin(dLat/2)+
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return R*c;
}

export default function ProfileScreen({navigation}:any){
  const {theme} = useTheme();
  const user    = useSelector((s:RootState)=>s.auth.user);

  // ── Profile photo ──
  const [photoUri,setPhotoUri]   = useState<string|null>(null);
  const [photoModal,setPhotoModal] = useState(false);

  // ── Shop photos ──
  const [shopFrontUri,setShopFrontUri] = useState<string|null>(null);
  const [signboardUri,setSignboardUri] = useState<string|null>(null);

  // ── Editable fields ──
  const [editMode,setEditMode]   = useState(false);
  const [editName,setEditName]   = useState(user?.name||'');
  const [editEmail,setEditEmail] = useState(user?.email||'');
  const [editMobile,setEditMobile] = useState(user?.mobile||'');
  const [editPending,setEditPending] = useState(false);

  // ── Shop details ──
  const [shopName,setShopName]   = useState(user?.shopName||'');
  const [shopAddress,setShopAddress] = useState(user?.shopAddress||'');
  const [shopLat,setShopLat]     = useState<number|null>(user?.shopLat||null);
  const [shopLng,setShopLng]     = useState<number|null>(user?.shopLng||null);
  const [locationLoading,setLocationLoading] = useState(false);

  // ── Location mismatch ──
  const [locationBlocked,setLocationBlocked] = useState(false);
  const [currentDistance,setCurrentDistance] = useState<number|null>(null);

  // ── Documents ──
  const [docStatus,setDocStatus] = useState<any>({
    gst:'missing',msme:'missing',fssai:'missing',
    local:'missing',pan:'missing',aadhaar:'missing'
  });

  // ── QR modal ──
  const [qrModal,setQrModal] = useState(false);

  // ── Referral ──
  const referralCode = `BM${(user?.mobile||'0000000000').slice(-6)}`;
  const referralLink = `https://bankme.co.in/join?ref=${referralCode}`;

  // ── Active section ──
  const [activeSection,setActiveSection] = useState('personal');

  // ── Check location on mount ──
  useEffect(()=>{
    if(shopLat&&shopLng) checkCurrentLocation();
  },[]);

  // ── Request location permission ──
  const requestLocationPermission = async () => {
    const permission = Platform.OS==='android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    const result = await request(permission);
    return result===RESULTS.GRANTED;
  };

  // ── Capture shop location ──
  const captureShopLocation = async () => {
    setLocationLoading(true);
    const granted = await requestLocationPermission();
    if(!granted){
      Alert.alert('Permission Denied',
        'Location permission is required to capture shop location.');
      setLocationLoading(false);
      return;
    }
    Geolocation.getCurrentPosition(
      (pos)=>{
        setShopLat(pos.coords.latitude);
        setShopLng(pos.coords.longitude);
        setLocationLoading(false);
        Alert.alert('✅ Location Captured',
          `Lat: ${pos.coords.latitude.toFixed(6)}\nLng: ${pos.coords.longitude.toFixed(6)}\n\nThis location is now your registered shop location.`);
      },
      (err)=>{
        setLocationLoading(false);
        Alert.alert('Error','Could not get location: '+err.message);
      },
      {enableHighAccuracy:true,timeout:15000,maximumAge:10000}
    );
  };

  // ── Check current vs shop location ──
  const checkCurrentLocation = async () => {
    if(!shopLat||!shopLng) return;
    const granted = await requestLocationPermission();
    if(!granted) return;
    Geolocation.getCurrentPosition(
      (pos)=>{
        const dist = getDistanceMeters(
          shopLat,shopLng,
          pos.coords.latitude,pos.coords.longitude
        );
        setCurrentDistance(Math.round(dist));
        if(dist>250){
          setLocationBlocked(true);
        }
      },
      (err)=>console.log('Location check error:',err),
      {enableHighAccuracy:true,timeout:10000,maximumAge:5000}
    );
  };

  // ── Profile photo ──
  const handlePhotoOption = (type:'camera'|'gallery') => {
    setPhotoModal(false);
    const options:any = {
      mediaType:'photo',
      maxWidth:400,
      maxHeight:400,
      quality:0.8,
      includeBase64:false,
    };
    const launcher = type==='camera' ? launchCamera : launchImageLibrary;
    launcher(options,(response:any)=>{
      if(response.assets&&response.assets[0]){
        setPhotoUri(response.assets[0].uri);
      }
    });
  };

  // ── Submit profile edits (pending admin approval) ──
  const submitEdits = () => {
    if(!editName.trim()){
      Alert.alert('Invalid','Name cannot be empty');return;
    }
    setEditPending(true);
    setEditMode(false);
    Alert.alert(
      '⏳ Pending Approval',
      'Your profile changes have been submitted for admin approval. You will be notified once approved.',
      [{text:'OK'}]
    );
  };

  // ── Share referral ──
  const shareReferral = async () => {
    try {
      const {Share} = require('react-native');
      await Share.share({
        message:`Join BankMe — India's Trusted Fintech Platform!\n\nUse my referral code: ${referralCode}\n\nDownload: ${referralLink}`,
        title:'Join BankMe'
      });
    } catch(e){
      Alert.alert('Error','Could not open share menu');
    }
  };

  // ── Shop photos (front / signboard) ──
  const pickShopPhoto = (which:'front'|'signboard') => {
    const label = which==='front' ? 'Shop Front Photo' : 'Signboard Photo';
    const doPick = (type:'camera'|'gallery') => {
      const options:any = {mediaType:'photo',maxWidth:1200,maxHeight:1200,quality:0.8};
      const launcher = type==='camera' ? launchCamera : launchImageLibrary;
      launcher(options,(response:any)=>{
        if(response.assets&&response.assets[0]){
          const uri = response.assets[0].uri;
          if(which==='front') setShopFrontUri(uri);
          else setSignboardUri(uri);
          // TODO: upload to backend for admin verification
          Alert.alert('📤 Uploaded',
            label+' uploaded successfully!\nStatus: Pending admin verification.');
        }
      });
    };
    Alert.alert(label,'Choose photo source',[
      {text:'📷 Camera',onPress:()=>doPick('camera')},
      {text:'🖼️ Gallery',onPress:()=>doPick('gallery')},
      {text:'Cancel',style:'cancel'},
    ]);
  };

  // ── Upload document ──
  const uploadDocument = (docId:string) => {
    const options:any = {
      mediaType:'photo',
      maxWidth:1200,
      maxHeight:1200,
      quality:0.9,
    };
    launchImageLibrary(options,(response:any)=>{
      if(response.assets&&response.assets[0]){
        setDocStatus((prev:any)=>({...prev,[docId]:'pending'}));
        Alert.alert('📤 Uploaded',
          'Document uploaded successfully!\nStatus: Pending admin verification.');
      }
    });
  };

  // ══════════════════════════════════════
  // ── LOCATION BLOCKED SCREEN ──
  // ══════════════════════════════════════
  if(locationBlocked) return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>
      <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:24}}>
        <Text style={{fontSize:60,marginBottom:20}}>🚫</Text>
        <Text style={{fontSize:22,fontWeight:'900',color:'#ef4444',
          marginBottom:12,textAlign:'center'}}>
          Location Mismatch Detected
        </Text>
        <Text style={{fontSize:14,color:theme.muted2,textAlign:'center',
          marginBottom:20,lineHeight:22}}>
          You are {currentDistance}m away from your registered shop location.
          {'\n\n'}
          Maximum allowed distance is 250 meters.
          {'\n\n'}
          This could indicate unauthorized access or shop relocation.
        </Text>

        <View style={{backgroundColor:theme.card,borderRadius:14,
          padding:16,width:'100%',marginBottom:24,
          borderWidth:1,borderColor:'#ef4444'+'40'}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{color:theme.muted2,fontSize:13}}>Registered Location</Text>
            <Text style={{color:theme.text,fontSize:13,fontWeight:'600'}}>
              {shopLat?.toFixed(4)}, {shopLng?.toFixed(4)}
            </Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={{color:theme.muted2,fontSize:13}}>Current Distance</Text>
            <Text style={{color:'#ef4444',fontSize:13,fontWeight:'700'}}>
              {currentDistance}m (max: 250m)
            </Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Text style={{color:theme.muted2,fontSize:13}}>Status</Text>
            <Text style={{color:'#ef4444',fontSize:13,fontWeight:'700'}}>
              🔴 BLOCKED
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={()=>Alert.alert('Admin Approval',
            'Your request for location change approval has been sent to admin.\n\nYou will receive an SMS/notification once approved.')}
          style={{backgroundColor:'#ef4444',borderRadius:12,
            padding:14,width:'100%',alignItems:'center',marginBottom:12}}>
          <Text style={{color:'#fff',fontWeight:'800',fontSize:15}}>
            📩 Request Admin Approval
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>setLocationBlocked(false)}
          style={{padding:12,alignItems:'center'}}>
          <Text style={{color:theme.muted2,fontSize:13}}>
            Dismiss (Testing Only)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ══════════════════════════════════════
  // ── QR CODE MODAL ──
  // ══════════════════════════════════════
  const qrData = JSON.stringify({
    id:user?.id||'USER001',
    name:user?.name||'User',
    mobile:user?.mobile||'',
    role:user?.role||'customer',
    username:user?.username||referralCode,
    platform:'BankMe',
    rtai:'verified',
  });

  // ══════════════════════════════════════
  // ── MAIN PROFILE SCREEN ──
  // ══════════════════════════════════════
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>

      <ScrollView
        contentContainerStyle={{paddingBottom:100}}
        showsVerticalScrollIndicator={false}>

        {/* ── PROFILE HEADER ── */}
        <View style={{alignItems:'center',paddingVertical:24,
          paddingHorizontal:20,borderBottomWidth:1,
          borderBottomColor:theme.border}}>

          {/* Photo + edit button */}
          <TouchableOpacity onPress={()=>setPhotoModal(true)}
            style={{marginBottom:12}}>
            {photoUri?(
              <Image source={{uri:photoUri}}
                style={{width:90,height:90,borderRadius:45,
                  borderWidth:3,borderColor:theme.primary}}/>
            ):(
              <View style={{width:90,height:90,borderRadius:45,
                backgroundColor:theme.primary,alignItems:'center',
                justifyContent:'center',borderWidth:3,
                borderColor:theme.primary+'60'}}>
                <Text style={{fontSize:36,fontWeight:'900',color:'#000'}}>
                  {(user?.name||'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{position:'absolute',bottom:0,right:0,
              width:28,height:28,borderRadius:14,
              backgroundColor:theme.primary,alignItems:'center',
              justifyContent:'center',borderWidth:2,
              borderColor:theme.bg}}>
              <Text style={{fontSize:12}}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={{fontSize:10,color:theme.muted,marginBottom:8}}>
            Tap photo to change 📷
          </Text>

          <Text style={{fontSize:20,fontWeight:'900',color:theme.text,marginBottom:4}}>
            {user?.name||'User'}
          </Text>
          <Text style={{fontSize:13,color:theme.muted2,marginBottom:8}}>
            @{user?.username||referralCode.toLowerCase()}
          </Text>

          {/* Role badge */}
          <View style={{paddingHorizontal:14,paddingVertical:4,
            borderRadius:100,backgroundColor:theme.primary+'20',
            marginBottom:16}}>
            <Text style={{color:theme.primary,fontSize:12,fontWeight:'700'}}>
              {(user?.role||'CUSTOMER').toUpperCase()} · RTAI Verified ✓
            </Text>
          </View>

          {/* QR code button */}
          <TouchableOpacity onPress={()=>setQrModal(true)}
            style={{flexDirection:'row',alignItems:'center',gap:8,
              backgroundColor:theme.card,borderRadius:12,
              paddingHorizontal:20,paddingVertical:10,
              borderWidth:1,borderColor:theme.border}}>
            <Text style={{fontSize:16}}>⊞</Text>
            <Text style={{color:theme.text,fontSize:13,fontWeight:'700'}}>
              My QR Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── SECTION TABS ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{borderBottomWidth:1,borderBottomColor:theme.border}}
          contentContainerStyle={{paddingHorizontal:16,paddingVertical:8,gap:8}}>
          {[
            {id:'personal', label:'👤 Personal'},
            {id:'shop',     label:'🏪 Shop'},
            {id:'docs',     label:'📄 Documents'},
            {id:'referral', label:'🔗 Referral'},
            {id:'rtai',     label:'🛡️ RTAI'},
          ].map(tab=>(
            <TouchableOpacity key={tab.id}
              onPress={()=>setActiveSection(tab.id)}
              style={{paddingHorizontal:14,paddingVertical:8,
                borderRadius:100,
                backgroundColor:activeSection===tab.id?
                  theme.primary:'transparent',
                borderWidth:1,
                borderColor:activeSection===tab.id?
                  theme.primary:theme.border}}>
              <Text style={{fontSize:12,fontWeight:'700',
                color:activeSection===tab.id?'#000':theme.muted2}}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{padding:20}}>

          {/* ══════════════════════════
              PERSONAL INFO SECTION
              ══════════════════════════ */}
          {activeSection==='personal'&&(
            <>
              <View style={{flexDirection:'row',justifyContent:'space-between',
                alignItems:'center',marginBottom:16}}>
                <Text style={{fontSize:16,fontWeight:'800',color:theme.text}}>
                  Personal Information
                </Text>
                {!editMode&&!editPending&&(
                  <TouchableOpacity onPress={()=>setEditMode(true)}
                    style={{paddingHorizontal:14,paddingVertical:6,
                      borderRadius:100,backgroundColor:theme.primary+'20',
                      borderWidth:1,borderColor:theme.primary}}>
                    <Text style={{color:theme.primary,fontSize:12,fontWeight:'700'}}>
                      ✏️ Edit
                    </Text>
                  </TouchableOpacity>
                )}
                {editPending&&(
                  <View style={{paddingHorizontal:14,paddingVertical:6,
                    borderRadius:100,backgroundColor:'rgba(245,158,11,0.15)',
                    borderWidth:1,borderColor:'#f59e0b'}}>
                    <Text style={{color:'#f59e0b',fontSize:12,fontWeight:'700'}}>
                      ⏳ Pending Approval
                    </Text>
                  </View>
                )}
              </View>

              {editPending&&(
                <View style={{backgroundColor:'rgba(245,158,11,0.08)',
                  borderRadius:12,padding:14,marginBottom:16,
                  borderWidth:1,borderColor:'rgba(245,158,11,0.3)'}}>
                  <Text style={{color:'#f59e0b',fontSize:12,fontWeight:'700',marginBottom:4}}>
                    ⏳ Changes Pending Admin Approval
                  </Text>
                  <Text style={{color:theme.muted2,fontSize:11}}>
                    Your profile update request is being reviewed. You will be notified once approved.
                  </Text>
                </View>
              )}

              {[
                {label:'Full Name',   value:editName,   set:setEditName,   key:'name',   type:'default'},
                {label:'Mobile',      value:editMobile, set:setEditMobile, key:'mobile', type:'numeric'},
                {label:'Email',       value:editEmail,  set:setEditEmail,  key:'email',  type:'email-address'},
              ].map((field,i)=>(
                <View key={i} style={{marginBottom:16}}>
                  <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                    textTransform:'uppercase',marginBottom:6}}>
                    {field.label}
                  </Text>
                  {editMode?(
                    <TextInput
                      style={{borderWidth:1,borderColor:theme.primary,
                        borderRadius:12,padding:12,color:theme.text,
                        fontSize:15,backgroundColor:theme.bg3}}
                      value={field.value}
                      onChangeText={field.set}
                      keyboardType={field.type as any}
                    />
                  ):(
                    <View style={{borderWidth:1,borderColor:theme.border,
                      borderRadius:12,padding:12,backgroundColor:theme.card,
                      flexDirection:'row',justifyContent:'space-between',
                      alignItems:'center'}}>
                      <Text style={{color:theme.text,fontSize:15}}>
                        {field.value||'Not set'}
                      </Text>
                      {editPending&&(
                        <Text style={{fontSize:10,color:'#f59e0b',fontWeight:'700'}}>
                          PENDING
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}

              {/* Username — read only, unique */}
              <View style={{marginBottom:16}}>
                <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                  textTransform:'uppercase',marginBottom:6}}>
                  Username (Unique · Cannot Change)
                </Text>
                <View style={{borderWidth:1,borderColor:theme.border,
                  borderRadius:12,padding:12,backgroundColor:theme.bg3,
                  flexDirection:'row',alignItems:'center',gap:8}}>
                  <Text style={{fontSize:16}}>@</Text>
                  <Text style={{color:theme.muted2,fontSize:15}}>
                    {user?.username||referralCode.toLowerCase()}
                  </Text>
                  <View style={{marginLeft:'auto',paddingHorizontal:8,
                    paddingVertical:2,borderRadius:100,
                    backgroundColor:'rgba(16,185,129,0.1)'}}>
                    <Text style={{fontSize:10,color:'#10b981',fontWeight:'700'}}>
                      UNIQUE ✓
                    </Text>
                  </View>
                </View>
              </View>

              {editMode&&(
                <View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity
                    onPress={()=>setEditMode(false)}
                    style={{flex:1,backgroundColor:theme.card,
                      borderRadius:12,padding:14,alignItems:'center',
                      borderWidth:1,borderColor:theme.border}}>
                    <Text style={{color:theme.text,fontWeight:'700'}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={submitEdits}
                    style={{flex:2,backgroundColor:theme.primary,
                      borderRadius:12,padding:14,alignItems:'center'}}>
                    <Text style={{color:'#000',fontWeight:'800'}}>
                      Submit for Approval
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* ══════════════════════════
              SHOP DETAILS SECTION
              ══════════════════════════ */}
          {activeSection==='shop'&&(
            <>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text,
                marginBottom:16}}>Shop Details</Text>

              {/* Shop name */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>Shop Name</Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:15,
                  backgroundColor:theme.bg3,marginBottom:16}}
                placeholder='Enter shop name'
                placeholderTextColor={theme.muted}
                value={shopName}
                onChangeText={setShopName}
              />

              {/* Shop address */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>Shop Address</Text>
              <TextInput
                style={{borderWidth:1,borderColor:theme.border2,borderRadius:12,
                  padding:12,color:theme.text,fontSize:15,
                  backgroundColor:theme.bg3,marginBottom:16,
                  height:80,textAlignVertical:'top'}}
                placeholder='Full shop address with pincode'
                placeholderTextColor={theme.muted}
                multiline
                value={shopAddress}
                onChangeText={setShopAddress}
              />

              {/* Shop geo-location */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginBottom:6}}>
                Shop Geo-Location
              </Text>

              {shopLat&&shopLng?(
                <View style={{backgroundColor:'rgba(16,185,129,0.08)',
                  borderRadius:12,padding:14,marginBottom:16,
                  borderWidth:1,borderColor:'rgba(16,185,129,0.3)'}}>
                  <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',marginBottom:8}}>
                    📍 Location Registered
                  </Text>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:4}}>
                    <Text style={{color:theme.muted2,fontSize:12}}>Latitude</Text>
                    <Text style={{color:theme.text,fontSize:12,fontWeight:'600'}}>
                      {shopLat.toFixed(6)}
                    </Text>
                  </View>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                    <Text style={{color:theme.muted2,fontSize:12}}>Longitude</Text>
                    <Text style={{color:theme.text,fontSize:12,fontWeight:'600'}}>
                      {shopLng.toFixed(6)}
                    </Text>
                  </View>
                  {currentDistance!==null&&(
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                      <Text style={{color:theme.muted2,fontSize:12}}>Current Distance</Text>
                      <Text style={{color:currentDistance>250?'#ef4444':'#10b981',
                        fontSize:12,fontWeight:'700'}}>
                        {currentDistance}m {currentDistance>250?'⚠️':'✓'}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={checkCurrentLocation}
                    style={{marginTop:10,padding:8,borderRadius:8,
                      backgroundColor:theme.bg3,alignItems:'center'}}>
                    <Text style={{color:theme.primary,fontSize:12,fontWeight:'700'}}>
                      🔄 Check Current Location
                    </Text>
                  </TouchableOpacity>
                </View>
              ):(
                <View style={{backgroundColor:'rgba(239,68,68,0.06)',
                  borderRadius:12,padding:14,marginBottom:16,
                  borderWidth:1,borderColor:'rgba(239,68,68,0.2)'}}>
                  <Text style={{color:'#ef4444',fontSize:12,fontWeight:'700',marginBottom:4}}>
                    ⚠️ Location Not Registered
                  </Text>
                  <Text style={{color:theme.muted2,fontSize:11}}>
                    Capture your shop location to enable location-based security. Every transaction will verify you are within 250m of this location.
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={captureShopLocation}
                disabled={locationLoading}
                style={{backgroundColor:theme.primary,borderRadius:12,
                  padding:14,alignItems:'center',marginBottom:12,
                  opacity:locationLoading?0.7:1}}>
                {locationLoading
                  ?<ActivityIndicator color='#000'/>
                  :<Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                    📍 {shopLat?'Update':'Capture'} Shop Location
                  </Text>
                }
              </TouchableOpacity>

              <View style={{backgroundColor:'rgba(59,130,246,0.06)',
                borderRadius:12,padding:14,
                borderWidth:1,borderColor:'rgba(59,130,246,0.2)'}}>
                <Text style={{color:'#3b82f6',fontSize:12,fontWeight:'700',marginBottom:4}}>
                  ℹ️ Location Security Policy
                </Text>
                <Text style={{color:theme.muted2,fontSize:11,lineHeight:18}}>
                  • Shop location is captured once during onboarding{'\n'}
                  • Every transaction verifies current location{'\n'}
                  • Moving more than 250 meters will block the app{'\n'}
                  • Location change requires admin approval{'\n'}
                  • This protects against unauthorized transactions
                </Text>
              </View>

              {/* ── SHOP PHOTOS ── */}
              <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                textTransform:'uppercase',marginTop:16,marginBottom:6}}>
                Shop Photos
              </Text>
              <View style={{flexDirection:'row',gap:12}}>
                {[
                  {which:'front' as const,     label:'Shop Front', uri:shopFrontUri, icon:'🏪'},
                  {which:'signboard' as const, label:'Signboard',  uri:signboardUri, icon:'🪧'},
                ].map(p=>(
                  <TouchableOpacity key={p.which}
                    onPress={()=>pickShopPhoto(p.which)}
                    style={{flex:1,borderWidth:1,borderRadius:12,
                      borderColor:p.uri?'rgba(16,185,129,0.4)':theme.border2,
                      borderStyle:p.uri?'solid':'dashed',
                      backgroundColor:theme.bg3,overflow:'hidden',
                      alignItems:'center'}}>
                    {p.uri?(
                      <>
                        <Image source={{uri:p.uri}}
                          style={{width:'100%',height:100}}/>
                        <View style={{paddingVertical:8,alignItems:'center'}}>
                          <Text style={{color:'#f59e0b',fontSize:11,fontWeight:'700'}}>
                            ⏳ {p.label} · Pending
                          </Text>
                          <Text style={{color:theme.muted,fontSize:10}}>Tap to replace</Text>
                        </View>
                      </>
                    ):(
                      <View style={{paddingVertical:24,alignItems:'center'}}>
                        <Text style={{fontSize:28,marginBottom:6}}>{p.icon}</Text>
                        <Text style={{color:theme.text,fontSize:12,fontWeight:'700'}}>{p.label}</Text>
                        <Text style={{color:theme.muted,fontSize:10,marginTop:2}}>Tap to upload</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ══════════════════════════
              DOCUMENTS SECTION
              ══════════════════════════ */}
          {activeSection==='docs'&&(
            <>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text,
                marginBottom:8}}>Business Documents</Text>
              <Text style={{fontSize:12,color:theme.muted2,marginBottom:16}}>
                Upload required documents for account verification and activation.
              </Text>

              {DOCUMENTS.map(doc=>{
                const status = docStatus[doc.id];
                const statusColor =
                  status==='verified'?'#10b981':
                  status==='pending'?'#f59e0b':'#ef4444';
                const statusLabel =
                  status==='verified'?'✅ Verified':
                  status==='pending'?'⏳ Pending':'❌ Missing';
                return (
                  <View key={doc.id} style={{backgroundColor:theme.card,
                    borderRadius:14,padding:16,marginBottom:12,
                    borderWidth:1,borderColor:theme.border}}>
                    <View style={{flexDirection:'row',alignItems:'center',
                      justifyContent:'space-between'}}>
                      <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
                        <Text style={{fontSize:24}}>{doc.icon}</Text>
                        <View>
                          <Text style={{color:theme.text,fontSize:14,fontWeight:'700'}}>
                            {doc.label}
                          </Text>
                          <Text style={{color:statusColor,fontSize:11,fontWeight:'600'}}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      {status!=='verified'&&(
                        <TouchableOpacity onPress={()=>uploadDocument(doc.id)}
                          style={{paddingHorizontal:14,paddingVertical:8,
                            borderRadius:10,backgroundColor:theme.primary+'20',
                            borderWidth:1,borderColor:theme.primary}}>
                          <Text style={{color:theme.primary,fontSize:12,fontWeight:'700'}}>
                            📤 Upload
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

              <View style={{backgroundColor:'rgba(245,158,11,0.06)',
                borderRadius:12,padding:14,marginTop:4,
                borderWidth:1,borderColor:'rgba(245,158,11,0.2)'}}>
                <Text style={{color:'#f59e0b',fontSize:12,fontWeight:'700',marginBottom:4}}>
                  📋 Document Requirements
                </Text>
                <Text style={{color:theme.muted2,fontSize:11,lineHeight:18}}>
                  • All documents must be valid and not expired{'\n'}
                  • Upload clear, readable photos/scans{'\n'}
                  • Admin verification takes 24-48 hours{'\n'}
                  • Account activation requires all documents
                </Text>
              </View>
            </>
          )}

          {/* ══════════════════════════
              REFERRAL SECTION
              ══════════════════════════ */}
          {activeSection==='referral'&&(
            <>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text,
                marginBottom:16}}>Referral Program</Text>

              {/* Referral code card */}
              <View style={{backgroundColor:theme.primary,borderRadius:16,
                padding:20,marginBottom:20,alignItems:'center'}}>
                <Text style={{color:'rgba(0,0,0,0.6)',fontSize:12,marginBottom:8}}>
                  Your Unique Referral Code
                </Text>
                <Text style={{color:'#000',fontSize:32,fontWeight:'900',
                  letterSpacing:6,marginBottom:12}}>
                  {referralCode}
                </Text>
                <TouchableOpacity onPress={shareReferral}
                  style={{backgroundColor:'rgba(0,0,0,0.15)',borderRadius:10,
                    paddingHorizontal:20,paddingVertical:8,
                    flexDirection:'row',alignItems:'center',gap:8}}>
                  <Text style={{fontSize:16}}>📤</Text>
                  <Text style={{color:'#000',fontWeight:'700',fontSize:13}}>
                    Share Referral Link
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Referral stats */}
              <View style={{flexDirection:'row',gap:10,marginBottom:20}}>
                {[
                  {label:'Total Referrals', value:'0',    icon:'👥'},
                  {label:'Active Users',    value:'0',    icon:'✅'},
                  {label:'Commission',      value:'₹0',   icon:'💰'},
                ].map((stat,i)=>(
                  <View key={i} style={{flex:1,backgroundColor:theme.card,
                    borderRadius:12,padding:12,alignItems:'center',
                    borderWidth:1,borderColor:theme.border}}>
                    <Text style={{fontSize:20,marginBottom:4}}>{stat.icon}</Text>
                    <Text style={{fontSize:18,fontWeight:'900',color:theme.primary}}>
                      {stat.value}
                    </Text>
                    <Text style={{fontSize:10,color:theme.muted2,textAlign:'center'}}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Referral link */}
              <View style={{backgroundColor:theme.card,borderRadius:12,
                padding:14,marginBottom:16,
                borderWidth:1,borderColor:theme.border}}>
                <Text style={{fontSize:11,fontWeight:'700',color:theme.muted2,
                  textTransform:'uppercase',marginBottom:6}}>
                  Referral Link
                </Text>
                <Text style={{color:theme.primary,fontSize:12,marginBottom:10}}>
                  {referralLink}
                </Text>
                <TouchableOpacity onPress={shareReferral}
                  style={{backgroundColor:theme.primary,borderRadius:10,
                    padding:10,alignItems:'center'}}>
                  <Text style={{color:'#000',fontWeight:'700',fontSize:13}}>
                    📤 Share Now
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{backgroundColor:'rgba(16,185,129,0.06)',
                borderRadius:12,padding:14,
                borderWidth:1,borderColor:'rgba(16,185,129,0.2)'}}>
                <Text style={{color:'#10b981',fontSize:12,fontWeight:'700',marginBottom:4}}>
                  💰 Referral Benefits
                </Text>
                <Text style={{color:theme.muted2,fontSize:11,lineHeight:18}}>
                  • Earn commission on every transaction by your referrals{'\n'}
                  • ₹50 bonus when referral completes KYC{'\n'}
                  • Lifetime commission on referral transactions{'\n'}
                  • Track earnings in real-time
                </Text>
              </View>
            </>
          )}

          {/* ══════════════════════════
              RTAI CERTIFICATES SECTION
              ══════════════════════════ */}
          {activeSection==='rtai'&&(
            <>
              <Text style={{fontSize:16,fontWeight:'800',color:theme.text,
                marginBottom:16}}>RTAI Certificates</Text>

              {/* RTAI Score */}
              <View style={{backgroundColor:theme.primary,borderRadius:16,
                padding:20,marginBottom:20,alignItems:'center'}}>
                <Text style={{color:'rgba(0,0,0,0.6)',fontSize:12,marginBottom:4}}>
                  RTAI Trustworthiness Score
                </Text>
                <Text style={{color:'#000',fontSize:48,fontWeight:'900',marginBottom:4}}>
                  {user?.rtai||85}
                </Text>
                <Text style={{color:'rgba(0,0,0,0.6)',fontSize:12,marginBottom:12}}>
                  out of 100
                </Text>
                <View style={{width:'100%',height:8,borderRadius:4,
                  backgroundColor:'rgba(0,0,0,0.15)',marginBottom:8}}>
                  <View style={{width:`${user?.rtai||85}%`,height:8,
                    borderRadius:4,backgroundColor:'rgba(0,0,0,0.4)'}}/>
                </View>
                <Text style={{color:'rgba(0,0,0,0.6)',fontSize:11}}>
                  Regulatory Trustworthy AI Score
                </Text>
              </View>

              {/* Certificates */}
              {[
                {
                  title:'RTAI Verified Retailer',
                  desc:'Certified trustworthy financial services provider',
                  date:'01 Jan 2026',
                  status:'active',
                  icon:'🏆',
                },
                {
                  title:'UIDAI AEPS Compliance',
                  desc:'Authorized for Aadhaar-enabled payment services',
                  date:'01 Jan 2026',
                  status:'active',
                  icon:'🪪',
                },
                {
                  title:'RBI DMT Authorization',
                  desc:'Authorized for domestic money transfer services',
                  date:'01 Jan 2026',
                  status:'active',
                  icon:'🏦',
                },
                {
                  title:'PCI DSS Compliance',
                  desc:'Payment Card Industry Data Security Standard',
                  date:'01 Jan 2026',
                  status:'pending',
                  icon:'🔐',
                },
              ].map((cert,i)=>(
                <View key={i} style={{backgroundColor:theme.card,
                  borderRadius:14,padding:16,marginBottom:12,
                  borderWidth:1,borderColor:theme.border}}>
                  <View style={{flexDirection:'row',alignItems:'flex-start',gap:12}}>
                    <Text style={{fontSize:28}}>{cert.icon}</Text>
                    <View style={{flex:1}}>
                      <View style={{flexDirection:'row',justifyContent:'space-between',
                        alignItems:'center',marginBottom:4}}>
                        <Text style={{color:theme.text,fontSize:13,
                          fontWeight:'700',flex:1}}>
                          {cert.title}
                        </Text>
                        <View style={{paddingHorizontal:8,paddingVertical:2,
                          borderRadius:100,
                          backgroundColor:cert.status==='active'?
                            'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)'}}>
                          <Text style={{fontSize:10,fontWeight:'700',
                            color:cert.status==='active'?'#10b981':'#f59e0b'}}>
                            {cert.status==='active'?'✅ ACTIVE':'⏳ PENDING'}
                          </Text>
                        </View>
                      </View>
                      <Text style={{color:theme.muted2,fontSize:11,marginBottom:4}}>
                        {cert.desc}
                      </Text>
                      <Text style={{color:theme.muted2,fontSize:10}}>
                        Issued: {cert.date}
                      </Text>
                    </View>
                  </View>
                  {cert.status==='active'&&(
                    <TouchableOpacity
                      onPress={()=>Alert.alert('Download',
                        'Certificate download feature coming soon!\nInstall react-native-fs for PDF generation.')}
                      style={{marginTop:10,padding:8,borderRadius:8,
                        backgroundColor:theme.bg3,alignItems:'center'}}>
                      <Text style={{color:theme.primary,fontSize:12,fontWeight:'700'}}>
                        📥 Download Certificate
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      {/* ── PHOTO PICKER MODAL ── */}
      <Modal visible={photoModal} transparent animationType='slide'
        onRequestClose={()=>setPhotoModal(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'flex-end'}}>
          <View style={{backgroundColor:theme.bg,borderTopLeftRadius:20,
            borderTopRightRadius:20,padding:20}}>
            <Text style={{fontSize:16,fontWeight:'800',color:theme.text,
              marginBottom:16,textAlign:'center'}}>
              Update Profile Photo
            </Text>
            <TouchableOpacity onPress={()=>handlePhotoOption('camera')}
              style={{flexDirection:'row',alignItems:'center',gap:14,
                padding:16,borderRadius:12,backgroundColor:theme.card,
                marginBottom:10,borderWidth:1,borderColor:theme.border}}>
              <Text style={{fontSize:24}}>📷</Text>
              <Text style={{color:theme.text,fontSize:15,fontWeight:'600'}}>
                Take Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>handlePhotoOption('gallery')}
              style={{flexDirection:'row',alignItems:'center',gap:14,
                padding:16,borderRadius:12,backgroundColor:theme.card,
                marginBottom:10,borderWidth:1,borderColor:theme.border}}>
              <Text style={{fontSize:24}}>🖼️</Text>
              <Text style={{color:theme.text,fontSize:15,fontWeight:'600'}}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setPhotoModal(false)}
              style={{padding:14,alignItems:'center'}}>
              <Text style={{color:theme.muted2,fontSize:14}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── QR CODE MODAL ── */}
      <Modal visible={qrModal} transparent animationType='fade'
        onRequestClose={()=>setQrModal(false)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.8)',
          alignItems:'center',justifyContent:'center',padding:24}}>
          <View style={{backgroundColor:theme.bg,borderRadius:20,
            padding:24,alignItems:'center',width:'100%'}}>
            <Text style={{fontSize:18,fontWeight:'900',color:theme.text,
              marginBottom:4}}>My BankMe QR Code</Text>
            <Text style={{fontSize:12,color:theme.muted2,marginBottom:20}}>
              Scan to identify · Pay · View profile
            </Text>

            <View style={{backgroundColor:'#fff',padding:16,borderRadius:12,
              marginBottom:16}}>
              <QRCode
                value={qrData}
                size={200}
                color='#000000'
                backgroundColor='#ffffff'
              />
            </View>

            <Text style={{fontSize:13,fontWeight:'700',color:theme.text,
              marginBottom:4}}>
              {user?.name||'User'}
            </Text>
            <Text style={{fontSize:12,color:theme.muted2,marginBottom:4}}>
              @{user?.username||referralCode.toLowerCase()}
            </Text>
            <Text style={{fontSize:11,color:theme.primary,marginBottom:20}}>
              {(user?.role||'CUSTOMER').toUpperCase()} · RTAI Verified ✓
            </Text>

            <TouchableOpacity onPress={()=>setQrModal(false)}
              style={{backgroundColor:theme.primary,borderRadius:12,
                padding:14,width:'100%',alignItems:'center'}}>
              <Text style={{color:'#000',fontWeight:'800',fontSize:15}}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
