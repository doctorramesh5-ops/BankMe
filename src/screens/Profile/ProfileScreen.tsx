import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, Modal, Share, PermissionsAndroid, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import {logout} from '../../store/authSlice';
import QRCode from 'react-native-qrcode-svg';
import Geolocation from 'react-native-geolocation-service';
import {launchImageLibrary} from 'react-native-image-picker';

// ─── Types ───
type TabKey = 'personal' | 'shop' | 'documents' | 'referral' | 'rtai';
type DocStatus = 'missing' | 'pending' | 'verified';

const DOC_LIST = [
  {id: 'pan', label: 'PAN Card'},
  {id: 'aadhaar', label: 'Aadhaar Card'},
  {id: 'gst', label: 'GST Certificate'},
  {id: 'msme', label: 'MSME Certificate'},
  {id: 'fssai', label: 'FSSAI License'},
];

export default function ProfileScreen({navigation}: any) {
  const {theme, themeKey, setTheme} = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();

  // ─── Role badge colors (unchanged from before) ───
  const rc: any = {
    admin: '#ef4444', whitelabel: '#8b5cf6', superdist: '#f59e0b',
    distributor: '#06b6d4', retailer: '#10b981', customer: '#3b82f6',
  };
  const roleColor = rc[user?.role || 'customer'];

  // ─── Tab state ───
  const [tab, setTab] = useState<TabKey>('personal');
  const TABS: {key: TabKey; icon: string; label: string}[] = [
    {key: 'personal', icon: '👤', label: 'Personal'},
    {key: 'shop', icon: '🏪', label: 'Shop'},
    {key: 'documents', icon: '📄', label: 'Documents'},
    {key: 'referral', icon: '🔗', label: 'Referral'},
    {key: 'rtai', icon: '🛡️', label: 'RTAI'},
  ];

  // ─── Personal tab state ───
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [personalPending, setPersonalPending] = useState(false);

  // ─── Shop tab state ───
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCoords, setShopCoords] = useState<{lat: number; lng: number} | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // ─── Documents tab state ───
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>({
    pan: 'missing', aadhaar: 'missing', gst: 'missing', msme: 'missing', fssai: 'missing',
  });

  // ─── QR modal state ───
  const [qrVisible, setQrVisible] = useState(false);

  // ─── Referral code = BM + last 6 digits of phone ───
  const refCode = 'BM' + (user?.phone || '000000').slice(-6);

  // ─── Theme options (unchanged from before) ───
  const themes = [
    {key: 'dark', label: 'Dark', color: '#040810'},
    {key: 'light', label: 'Light', color: '#ffffff'},
    {key: 'blue', label: 'Blue', color: '#0a1628'},
  ];

  // ─── Actions ───
  const doLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: () => dispatch(logout())},
    ]);
  };

  const savePersonal = () => {
    if (editName.trim().length < 3) {
      return Alert.alert('Error', 'Please enter your full name');
    }
    if (editEmail && !/^\S+@\S+\.\S+$/.test(editEmail)) {
      return Alert.alert('Error', 'Please enter a valid email address');
    }
    // TODO: send to backend API for admin approval
    setPersonalPending(true);
    Alert.alert('Submitted ✅', 'Your changes were sent for admin approval.');
  };

  const captureLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'BankMe needs your location to register your shop position.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return Alert.alert('Permission denied', 'Location permission is required to capture your shop position.');
        }
      }
      setGpsLoading(true);
      Geolocation.getCurrentPosition(
        pos => {
          setGpsLoading(false);
          setShopCoords({lat: pos.coords.latitude, lng: pos.coords.longitude});
          Alert.alert('Location captured ✅', 'Your shop location has been saved.');
        },
        err => {
          setGpsLoading(false);
          Alert.alert('GPS Error', err.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (e: any) {
      setGpsLoading(false);
      Alert.alert('Error', e?.message || 'Could not get location');
    }
  };

  const uploadDoc = async (docId: string, label: string) => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo', quality: 0.7});
      if (result.didCancel) return;
      if (result.errorCode) {
        return Alert.alert('Error', result.errorMessage || 'Could not open gallery');
      }
      // TODO: upload result.assets[0] to backend, then mark 'pending'
      setDocStatus(prev => ({...prev, [docId]: 'pending'}));
      Alert.alert('Uploaded ✅', label + ' submitted for verification.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Upload failed');
    }
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message:
          "Join BankMe — India's complete fintech platform! " +
          'AEPS, Money Transfer, BBPS & more. ' +
          'Use my referral code ' + refCode + ' when you sign up. ' +
          'Download: https://www.bankme.co.in',
      });
    } catch {
      Alert.alert('Error', 'Could not open share menu');
    }
  };

  // ─── Small style helpers (objects, not components — keeps TextInput focus stable) ───
  const card = {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    borderColor: theme.border, backgroundColor: theme.card,
    padding: 16, marginBottom: 16,
  } as const;
  const cardTitle = {
    fontSize: 13, fontWeight: '700' as const, color: theme.muted2,
    marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: 0.5,
  };
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 15, marginBottom: 12,
    backgroundColor: theme.bg,
  } as const;
  const primaryBtn = {
    backgroundColor: theme.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center' as const,
  };

  const statusColors: Record<DocStatus, {bg: string; fg: string}> = {
    missing: {bg: 'rgba(239,68,68,0.15)', fg: '#ef4444'},
    pending: {bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b'},
    verified: {bg: 'rgba(16,185,129,0.15)', fg: '#10b981'},
  };

  const rtaiScore = user?.rtaiScore || 0;
  const certs = [
    {id: '1', name: 'RTAI Retailer Certificate', status: 'active'},
    {id: '2', name: 'AEPS Service Authorization', status: 'active'},
    {id: '3', name: 'DMT Service Authorization', status: 'pending'},
    {id: '4', name: 'BBPS Service Authorization', status: 'pending'},
  ];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}} keyboardShouldPersistTaps="handled">

        {/* ─── Title ─── */}
        <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>Profile</Text>
        </View>

        {/* ─── Header: avatar, name, role, QR button ─── */}
        <View style={{alignItems: 'center', paddingVertical: 16}}>
          <View style={{width: 80, height: 80, borderRadius: 40, borderWidth: 3,
            borderColor: roleColor, backgroundColor: roleColor + '20',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12}}>
            <Text style={{fontSize: 32, fontWeight: '900', color: roleColor}}>
              {(user?.name || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={{fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 4}}>
            {user?.name}
          </Text>
          <Text style={{fontSize: 14, color: theme.muted2, marginBottom: 8}}>{user?.phone}</Text>
          <View style={{paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100,
            backgroundColor: roleColor + '20', borderWidth: 1, borderColor: roleColor, marginBottom: 12}}>
            <Text style={{fontSize: 12, fontWeight: '700', color: roleColor}}>
              {user?.role?.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setQrVisible(true)}
            style={{flexDirection: 'row', alignItems: 'center', gap: 6,
              borderWidth: 1, borderColor: theme.primary, borderRadius: 100,
              paddingHorizontal: 16, paddingVertical: 8}}>
            <Text style={{fontSize: 14}}>📱</Text>
            <Text style={{color: theme.primary, fontWeight: '700', fontSize: 13}}>My QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Tab bar ─── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20, gap: 8, marginBottom: 16}}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setTab(t.key)}
              style={{flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 100,
                borderWidth: 1,
                borderColor: tab === t.key ? theme.primary : theme.border,
                backgroundColor: tab === t.key ? theme.primary + '20' : theme.card}}>
              <Text style={{fontSize: 14}}>{t.icon}</Text>
              <Text style={{fontSize: 13, fontWeight: '700',
                color: tab === t.key ? theme.primary : theme.muted2}}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── TAB: PERSONAL ─── */}
        {tab === 'personal' && (
          <View>
            <View style={card}>
              <Text style={cardTitle}>Account Info</Text>
              {[
                {label: 'Mobile', value: user?.phone || '-'},
                {label: 'Username', value: '@' + refCode.toLowerCase() + ' 🔒'},
                {label: 'KYC Status', value: user?.kyc?.toUpperCase() || 'PENDING'},
                {label: 'Wallet', value: '₹' + (user?.wallet || 0).toLocaleString('en-IN')},
                {label: 'Member Since', value: user?.joined || '-'},
              ].map((item, i, arr) => (
                <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between',
                  paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border}}>
                  <Text style={{fontSize: 14, color: theme.muted2}}>{item.label}</Text>
                  <Text style={{fontSize: 14, fontWeight: '600', color: theme.text}}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={card}>
              <Text style={cardTitle}>Edit Details</Text>
              {personalPending && (
                <View style={{backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 10,
                  padding: 10, marginBottom: 12}}>
                  <Text style={{color: '#f59e0b', fontSize: 12, fontWeight: '700'}}>
                    ⏳ Changes pending admin approval
                  </Text>
                </View>
              )}
              <TextInput style={inputStyle} placeholder="Full name"
                placeholderTextColor={theme.muted} value={editName} onChangeText={setEditName} />
              <TextInput style={inputStyle} placeholder="Email address"
                placeholderTextColor={theme.muted} keyboardType="email-address"
                autoCapitalize="none" value={editEmail} onChangeText={setEditEmail} />
              <TouchableOpacity style={primaryBtn} onPress={savePersonal}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── TAB: SHOP ─── */}
        {tab === 'shop' && (
          <View style={card}>
            <Text style={cardTitle}>Shop Details</Text>
            <TextInput style={inputStyle} placeholder="Shop name"
              placeholderTextColor={theme.muted} value={shopName} onChangeText={setShopName} />
            <TextInput style={[inputStyle, {height: 80, textAlignVertical: 'top'}]}
              placeholder="Shop address" placeholderTextColor={theme.muted}
              multiline value={shopAddress} onChangeText={setShopAddress} />

            {shopCoords && (
              <View style={{backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 10,
                padding: 12, marginBottom: 12}}>
                <Text style={{color: '#10b981', fontSize: 12, fontWeight: '700'}}>
                  📍 Location saved: {shopCoords.lat.toFixed(5)}, {shopCoords.lng.toFixed(5)}
                </Text>
              </View>
            )}

            <TouchableOpacity style={primaryBtn} onPress={captureLocation} disabled={gpsLoading}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                {gpsLoading ? 'Getting GPS…' : '📍 Capture Shop Location'}
              </Text>
            </TouchableOpacity>
            <Text style={{color: theme.muted, fontSize: 11, marginTop: 10, textAlign: 'center'}}>
              Your shop location is used for the 250m service-area check.
            </Text>
          </View>
        )}

        {/* ─── TAB: DOCUMENTS ─── */}
        {tab === 'documents' && (
          <View style={card}>
            <Text style={cardTitle}>KYC Documents</Text>
            {DOC_LIST.map((d, i) => {
              const st = docStatus[d.id];
              const sc = statusColors[st];
              return (
                <TouchableOpacity key={d.id} onPress={() => uploadDoc(d.id, d.label)}
                  style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
                    borderBottomWidth: i < DOC_LIST.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border}}>
                  <Text style={{fontSize: 18, marginRight: 12}}>📄</Text>
                  <Text style={{flex: 1, color: theme.text, fontWeight: '600', fontSize: 14}}>
                    {d.label}
                  </Text>
                  <View style={{backgroundColor: sc.bg, borderRadius: 8,
                    paddingHorizontal: 10, paddingVertical: 4}}>
                    <Text style={{color: sc.fg, fontSize: 11, fontWeight: '800'}}>
                      {st.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Text style={{color: theme.muted, fontSize: 11, marginTop: 10, textAlign: 'center'}}>
              Tap a document to upload from your gallery.
            </Text>
          </View>
        )}

        {/* ─── TAB: REFERRAL ─── */}
        {tab === 'referral' && (
          <View style={card}>
            <Text style={cardTitle}>🎁 Refer & Earn</Text>
            <Text style={{color: theme.text, fontSize: 14, marginBottom: 14}}>
              Invite retailers to BankMe and earn ₹100 per successful signup!
            </Text>
            <View style={{flexDirection: 'row', gap: 10, marginBottom: 16}}>
              <View style={{flex: 1, borderWidth: 1, borderColor: theme.primary,
                borderStyle: 'dashed', borderRadius: 12, padding: 14, alignItems: 'center'}}>
                <Text style={{color: theme.primary, fontSize: 20, fontWeight: '900',
                  letterSpacing: 3}}>{refCode}</Text>
              </View>
              <TouchableOpacity onPress={shareReferral}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingHorizontal: 20, justifyContent: 'center'}}>
                <Text style={{color: '#000', fontWeight: '900'}}>Share</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'row'}}>
              {[['Invited', '0'], ['Joined', '0'], ['Earned', '₹0']].map(([k, v]) => (
                <View key={k} style={{flex: 1, alignItems: 'center'}}>
                  <Text style={{color: theme.text, fontSize: 18, fontWeight: '900'}}>{v}</Text>
                  <Text style={{color: theme.muted2, fontSize: 12}}>{k}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ─── TAB: RTAI ─── */}
        {tab === 'rtai' && (
          <View>
            <View style={card}>
              <Text style={cardTitle}>🛡️ RTAI Score</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10}}>
                <Text style={{color: theme.text, fontSize: 36, fontWeight: '900'}}>{rtaiScore}</Text>
                <Text style={{color: theme.muted2, fontSize: 14, marginBottom: 6}}> / 100</Text>
              </View>
              <View style={{height: 10, borderRadius: 5, backgroundColor: theme.border,
                overflow: 'hidden'}}>
                <View style={{height: 10, borderRadius: 5, backgroundColor: theme.primary,
                  width: `${Math.min(rtaiScore, 100)}%`}} />
              </View>
              <Text style={{color: theme.muted, fontSize: 11, marginTop: 10}}>
                Complete KYC and transactions to grow your RTAI score.
              </Text>
            </View>

            <View style={card}>
              <Text style={cardTitle}>🏆 Certificates</Text>
              {certs.map((c, i) => (
                <TouchableOpacity key={c.id}
                  onPress={() =>
                    c.status === 'active'
                      ? Alert.alert(c.name, 'Certificate viewer coming soon!')
                      : Alert.alert('Pending', 'Issued after KYC verification.')
                  }
                  style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                    borderBottomWidth: i < certs.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border}}>
                  <Text style={{fontSize: 18, marginRight: 12}}>📜</Text>
                  <Text style={{flex: 1, color: theme.text, fontWeight: '600', fontSize: 14}}>
                    {c.name}
                  </Text>
                  <View style={{backgroundColor: c.status === 'active'
                      ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4}}>
                    <Text style={{color: c.status === 'active' ? '#10b981' : '#f59e0b',
                      fontSize: 11, fontWeight: '800'}}>
                      {c.status.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ─── Theme switcher (unchanged) ─── */}
        <View style={card}>
          <Text style={cardTitle}>🎨 Theme</Text>
          <View style={{flexDirection: 'row', gap: 10}}>
            {themes.map(t => (
              <TouchableOpacity key={t.key} onPress={() => setTheme(t.key as any)}
                style={{flex: 1, padding: 12, borderRadius: 12, borderWidth: 2,
                  borderColor: themeKey === t.key ? theme.primary : theme.border,
                  backgroundColor: t.color, alignItems: 'center'}}>
                <Text style={{fontSize: 12, fontWeight: '700',
                  color: themeKey === t.key ? theme.primary : '#888'}}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Logout (unchanged) ─── */}
        <View style={{marginHorizontal: 20, marginBottom: 16}}>
          <TouchableOpacity onPress={doLogout}
            style={{backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)', borderRadius: 14,
              padding: 16, alignItems: 'center'}}>
            <Text style={{color: '#ef4444', fontWeight: '700', fontSize: 15}}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Footer (unchanged) ─── */}
        <View style={{alignItems: 'center', paddingBottom: 20}}>
          <Text style={{fontSize: 11, color: theme.muted}}>BankMe v2.0.0 · PayPe Technologies</Text>
          <Text style={{fontSize: 11, color: theme.muted, marginTop: 2}}>
            PCI DSS · RTAI · RBI Compliant
          </Text>
        </View>
      </ScrollView>

      {/* ─── QR Code Modal ─── */}
      <Modal visible={qrVisible} transparent animationType="fade"
        onRequestClose={() => setQrVisible(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          alignItems: 'center', justifyContent: 'center', padding: 30}}>
          <View style={{backgroundColor: '#ffffff', borderRadius: 20,
            padding: 24, alignItems: 'center', width: '100%'}}>
            <Text style={{fontSize: 18, fontWeight: '900', color: '#000', marginBottom: 4}}>
              {user?.name}
            </Text>
            <Text style={{fontSize: 13, color: '#666', marginBottom: 16}}>
              @{refCode.toLowerCase()} · {user?.role?.toUpperCase()}
            </Text>
            <QRCode
              value={JSON.stringify({
                app: 'BankMe', code: refCode,
                phone: user?.phone, role: user?.role,
              })}
              size={200}
            />
            <TouchableOpacity onPress={() => setQrVisible(false)}
              style={{marginTop: 20, backgroundColor: '#000', borderRadius: 12,
                paddingVertical: 12, paddingHorizontal: 40}}>
              <Text style={{color: '#fff', fontWeight: '800'}}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
