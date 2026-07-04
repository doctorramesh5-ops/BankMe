import React,{useState} from 'react';
import {View,Text,ScrollView,TouchableOpacity,StatusBar,RefreshControl} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';

// Quick service tiles shown on home dashboard
const SVCS = [
  {id:'aeps',   name:'AEPS',     icon:'👆', color:'#10b981'},
  {id:'dmt',    name:'Transfer', icon:'💸', color:'#3b82f6'},
  {id:'bbps',   name:'Bills',    icon:'🧾', color:'#f59e0b', screen:'BBPS'},
  {id:'upi',    name:'UPI',      icon:'📲', color:'#6366f1', screen:'UPI'},
  {id:'erupee', name:'eRupee',   icon:'🏛️', color:'#14b8a6', screen:'ERupee'},
  {id:'creditcard',name:'Card',  icon:'💳', color:'#8b5cf6'},
  {id:'insurance',name:'Insure', icon:'🛡️', color:'#06b6d4'},
];

// Maps service id → stack screen name (only screens that exist get a route)
const SCREEN_MAP:any = {aeps:'AEPS', dmt:'DMT', bbps:'BBPS', upi:'UPI', cashin:'UPI', cashout:'UPI'};
const ROLE_COLOR:any = {
  admin:'#ef4444', whitelabel:'#8b5cf6', superdist:'#f59e0b',
  distributor:'#06b6d4', retailer:'#10b981', customer:'#3b82f6',
};

export default function HomeScreen({navigation}:any) {
  const {theme} = useTheme();
  const user = useSelector((s:RootState) => s.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);

  const roleColor = ROLE_COLOR[user?.role || 'customer'];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg}/>

      <ScrollView
        contentContainerStyle={{paddingBottom:90}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary}/>
        }
      >

        {/* ── HEADER: greeting + avatar ── */}
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:16, paddingBottom:8}}>
          <View>
            <Text style={{fontSize:13, color:theme.muted2}}>{greeting} 👋</Text>
            <Text style={{fontSize:22, fontWeight:'900', color:theme.text, marginTop:2}}>
              {user?.name || 'User'}
            </Text>
            <Text style={{fontSize:11, color:theme.muted2}}>BankMe RTAI Verified</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={{width:42, height:42, borderRadius:21, borderWidth:2, borderColor:roleColor, backgroundColor:roleColor+'20', alignItems:'center', justifyContent:'center'}}
          >
            <Text style={{fontSize:17, fontWeight:'900', color:roleColor}}>
              {(user?.name || 'U')[0].toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── WALLET CARD ── */}
        <View style={{marginHorizontal:20, borderRadius:20, padding:20, marginBottom:20, backgroundColor:theme.primary, elevation:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.15, shadowRadius:8}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
            <View>
              <Text style={{color:'rgba(0,0,0,0.6)', fontSize:12, marginBottom:6}}>Available Balance</Text>
              <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                <Text style={{color:'#000', fontSize:28, fontWeight:'900'}}>
                  {balanceVisible ? '₹'+(user?.wallet||0).toLocaleString('en-IN') : '₹ ••••••'}
                </Text>
                <TouchableOpacity onPress={() => setBalanceVisible(v => !v)}>
                  <Text style={{fontSize:18}}>{balanceVisible ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{paddingHorizontal:10, paddingVertical:4, borderRadius:100, backgroundColor:'rgba(0,0,0,0.15)'}}>
              <Text style={{color:'#000', fontSize:11, fontWeight:'700'}}>
                {(user?.role || 'USER').toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={{backgroundColor:'rgba(0,0,0,0.1)', borderRadius:8, paddingVertical:6, alignItems:'center'}}>
            <Text style={{color:'rgba(0,0,0,0.7)', fontSize:11, fontWeight:'600'}}>✓ RTAI Verified · PCI DSS Secured</Text>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={{flexDirection:'row', paddingHorizontal:20, gap:10, marginBottom:24}}>
          <View style={{flex:1, backgroundColor:theme.card, borderRadius:14, padding:14, borderWidth:1, borderColor:theme.border}}>
            <Text style={{fontSize:18, fontWeight:'900', color:theme.primary}}>
              {user?.txns || 0}
            </Text>
            <Text style={{fontSize:11, color:theme.muted2, marginTop:2}}>Transactions</Text>
          </View>
          <View style={{flex:1, backgroundColor:theme.card, borderRadius:14, padding:14, borderWidth:1, borderColor:theme.border}}>
            <Text style={{fontSize:18, fontWeight:'900', color:'#f59e0b'}}>
              {user?.rtai || 85}/100
            </Text>
            <Text style={{fontSize:11, color:theme.muted2, marginTop:2}}>RTAI Score</Text>
          </View>
          <View style={{flex:1, backgroundColor:theme.card, borderRadius:14, padding:14, borderWidth:1, borderColor:theme.border}}>
            <Text style={{fontSize:18, fontWeight:'900', color:user?.ekyc==='done'?'#10b981':'#ef4444'}}>
              {user?.ekyc==='done'?'Done':'Pending'}
            </Text>
            <Text style={{fontSize:11, color:theme.muted2, marginTop:2}}>eKYC</Text>
          </View>
        </View>

        {/* ── QUICK SERVICES GRID ── */}
        <View style={{paddingHorizontal:20, marginBottom:24}}>
          <Text style={{fontSize:16, fontWeight:'800', color:theme.text, marginBottom:14}}>Quick Services</Text>
          <View style={{flexDirection:'row', flexWrap:'wrap', gap:10}}>
            {SVCS.map(s => {
              const screen = SCREEN_MAP[s.id];
              return (
                <TouchableOpacity
                  key={s.id}
                  style={{width:'22%', alignItems:'center', padding:10, borderRadius:14, borderWidth:1, borderColor:screen?theme.primary+'40':theme.border, backgroundColor:theme.card}}
                  onPress={() => screen ? navigation.navigate(screen) : alert(s.name+' coming soon!')}
                >
                  <View style={{width:44, height:44, borderRadius:12, backgroundColor:s.color+'18', alignItems:'center', justifyContent:'center', marginBottom:6}}>
                    <Text style={{fontSize:22}}>{s.icon}</Text>
                  </View>
                  <Text style={{fontSize:10, fontWeight:'600', color:screen?theme.primary:theme.text, textAlign:'center'}}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── RECENT TRANSACTIONS ── */}
        <View style={{paddingHorizontal:20, marginBottom:24}}>
          <Text style={{fontSize:16, fontWeight:'800', color:theme.text, marginBottom:14}}>Recent Transactions</Text>
          <View style={{backgroundColor:theme.card, borderRadius:14, padding:20, borderWidth:1, borderColor:theme.border, alignItems:'center'}}>
            <Text style={{fontSize:28, marginBottom:8}}>📭</Text>
            <Text style={{color:theme.muted2, fontSize:13}}>No transactions yet</Text>
            <Text style={{color:theme.muted2, fontSize:11, marginTop:4}}>Your recent activity will appear here</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
