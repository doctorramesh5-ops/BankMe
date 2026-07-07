import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setUser} from '../../store/authSlice';
import {useTheme} from '../../theme/ThemeContext';

// ── Login + Signup — matching bankme.co.in web flow ──
// Sign In: OTP  or  PIN  |  Sign Up: 3 roles + verified mobile & email
type Tab = 'signin' | 'signup';
type Role = 'retailer' | 'distributor' | 'customer';

const ROLES: {id: Role; label: string; icon: string; desc: string}[] = [
  {id: 'retailer',    label: 'Retailer',    icon: '🏪', desc: 'Shop owner offering services'},
  {id: 'distributor', label: 'Distributor', icon: '🏢', desc: 'Manages multiple retailers'},
  {id: 'customer',    label: 'Customer',    icon: '👤', desc: 'Personal account'},
];

// AsyncStorage keys (the "notebook" labels)
const PIN_KEY = 'bankme_user_pin';
const PIN_PHONE_KEY = 'bankme_pin_phone';

export default function LoginScreen({navigation}: any) {
  const {theme} = useTheme();
  const dispatch = useDispatch();

  const [tab, setTab] = useState<Tab>('signin');

  // ── SIGN IN state ──
  const [loginMode, setLoginMode] = useState<'otp' | 'pin'>('otp');
  const [siMobile, setSiMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);

  // ── PIN state ──
  const [pin, setPin] = useState('');
  const [setPinModal, setSetPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // ── SIGN UP state ──
  const [role, setRole] = useState<Role>('retailer');
  const [roleModal, setRoleModal] = useState(false);
  const [suName, setSuName] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suShop, setSuShop] = useState('');
  const [suCity, setSuCity] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suTerms, setSuTerms] = useState(false);

  // ── Mobile & Email OTP verification state ──
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const roleObj = ROLES.find(r => r.id === role)!;

  // ══════════ SIGN IN — OTP ══════════
  const sendOtp = () => {
    if (siMobile.length !== 10)
      return Alert.alert('Error', 'Enter a valid 10-digit mobile number');
    setSending(true);
    // TODO(backend): POST /send-otp { mobile: siMobile }
    setTimeout(() => {
      setOtpSent(true); setSending(false);
      Alert.alert('OTP Sent', 'Demo OTP is 123456');
    }, 1000);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter the 6-digit OTP');
    // TODO(backend): POST /verify-otp { mobile, otp }
    const savedPin = await AsyncStorage.getItem(PIN_KEY);
    if (!savedPin) {
      await AsyncStorage.setItem(PIN_PHONE_KEY, siMobile);
      setSetPinModal(true);
    } else {
      completeLogin(siMobile);
    }
  };

  // ══════════ SIGN IN — PIN ══════════
  // Read the saved PIN from the phone's notebook and compare
  const loginWithPin = async () => {
    if (pin.length !== 4) return Alert.alert('Error', 'Enter your 4-digit PIN');
    try {
      const savedPin = await AsyncStorage.getItem(PIN_KEY);
      const savedPhone = await AsyncStorage.getItem(PIN_PHONE_KEY);
      if (!savedPin) {
        return Alert.alert('No PIN Set',
          'No PIN found on this device. Please sign in with OTP first, then set a PIN.');
      }
      if (pin !== savedPin) {
        setPin('');
        return Alert.alert('Wrong PIN', 'The PIN you entered is incorrect.');
      }
      // PIN matches → log the saved user in
      completeLogin(savedPhone || '');
    } catch {
      Alert.alert('Error', 'Could not read PIN. Try OTP login.');
    }
  };

  // After a successful OTP login, check if a PIN exists; if not, offer to set one
  const checkOfferSetPin = async (phone: string) => {
    const savedPin = await AsyncStorage.getItem(PIN_KEY);
    if (!savedPin) {
   const saveNewPin = async () => {
    if (newPin.length !== 4) return Alert.alert('Error', 'PIN must be 4 digits');
    if (newPin !== confirmPin) return Alert.alert('Error', 'PINs do not match');
    try {
      // TODO(security): upgrade to encrypted storage (react-native-keychain) in production
      await AsyncStorage.setItem(PIN_KEY, newPin);
      setSetPinModal(false);
      // Now log the user in (we delayed login until after PIN setup)
      completeLogin(siMobile);
    } catch {
      Alert.alert('Error', 'Could not save PIN.');
    }
  };
      setSetPinModal(false);
      Alert.alert('PIN Set ✅', 'Next time you can log in with your 4-digit PIN.');
    } catch {
      Alert.alert('Error', 'Could not save PIN.');
    }
  };

  // Shared: dispatch the logged-in user (returning customer = kyc verified)
  const completeLogin = (phone: string) => {
    dispatch(setUser({
      uid: Date.now().toString(),
      name: 'User ' + (phone.slice(-4) || '0000'),
      phone, email: '', role: 'customer',
      wallet: 0, kyc: 'verified', rtaiScore: 85,
      commissionEarned: 0,
      joined: new Date().toLocaleDateString('en-IN'),
    }));
  };

  // ══════════ SIGN UP — mobile OTP ══════════
  // ⬇️⬇️ REAL BACKEND PLUGS IN HERE ⬇️⬇️
  const sendPhoneOtp = () => {
    if (suPhone.length !== 10)
      return Alert.alert('Error', 'Enter a valid 10-digit mobile first');
    // TODO(backend): await fetch('https://YOUR-BACKEND/send-mobile-otp', ...)
    setTimeout(() => {
      setPhoneOtpSent(true);
      Alert.alert('Mobile OTP Sent', 'Demo OTP is 111111');
    }, 700);
  };
  const verifyPhoneOtp = () => {
    // TODO(backend): await fetch('https://YOUR-BACKEND/verify-mobile-otp', ...)
    if (phoneOtp !== '111111')
      return Alert.alert('Error', 'Wrong OTP (demo OTP is 111111)');
    setPhoneVerified(true); setPhoneOtpSent(false);
  };
  const sendEmailOtp = () => {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(suEmail))
      return Alert.alert('Error', 'Enter a valid email first');
    // TODO(backend): POST /send-email-otp { email }
    setTimeout(() => {
      setEmailOtpSent(true);
      Alert.alert('Email OTP Sent', 'Demo OTP is 222222');
    }, 700);
  };
  const verifyEmailOtp = () => {
    // TODO(backend): POST /verify-email-otp { email, otp }
    if (emailOtp !== '222222')
      return Alert.alert('Error', 'Wrong OTP (demo OTP is 222222)');
    setEmailVerified(true); setEmailOtpSent(false);
  };
  // ⬆️⬆️ REAL BACKEND PLUGS IN HERE ⬆️⬆️

  const createAccount = () => {
    if (suName.trim().length < 3) return Alert.alert('Error', 'Enter your full name (as per PAN)');
    if (!phoneVerified) return Alert.alert('Verify Mobile', 'Please verify your mobile number with OTP');
    if (!emailVerified) return Alert.alert('Verify Email', 'Please verify your email with OTP');
    if (role !== 'customer' && suShop.trim().length < 2)
      return Alert.alert('Error', 'Enter your shop / business name');
    if (role !== 'customer' && suCity.trim().length < 2)
      return Alert.alert('Error', 'Enter your city / district');
    if (suPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    if (suPassword !== suConfirm) return Alert.alert('Error', 'Passwords do not match');
    if (!suTerms) return Alert.alert('Error', 'Please accept the Terms & Privacy Policy');

    // TODO(backend): POST /create-account { ...all fields }
    dispatch(setUser({
      uid: Date.now().toString(),
      name: suName.trim(),
      phone: suPhone, email: suEmail.trim(), role,
      shopName: role !== 'customer' ? suShop.trim() : '',
      city: role !== 'customer' ? suCity.trim() : '',
      wallet: 0, kyc: 'pending', rtaiScore: 0,
      commissionEarned: 0,
      joined: new Date().toLocaleDateString('en-IN'),
    }));
  };

  const label = {
    fontSize: 12, fontWeight: '700' as const, color: theme.muted2,
    marginBottom: 6, marginTop: 12,
  };
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 15, backgroundColor: theme.bg,
  } as const;

  const VerifyChip = ({verified}: {verified: boolean}) => (
    <View style={{backgroundColor: verified ? 'rgba(16,185,129,0.15)' : theme.border,
      borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4}}>
      <Text style={{fontSize: 11, fontWeight: '800',
        color: verified ? '#10b981' : theme.muted2}}>
        {verified ? '✓ Verified' : 'Not verified'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <KeyboardAvoidingView style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 40}}
          keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={{alignItems: 'center', marginTop: 20, marginBottom: 24}}>
            <View style={{width: 64, height: 64, borderRadius: 18,
              backgroundColor: theme.primary, alignItems: 'center',
              justifyContent: 'center', marginBottom: 12}}>
              <Text style={{fontSize: 32, fontWeight: '900', color: '#000'}}>B</Text>
            </View>
            <Text style={{fontSize: 24, fontWeight: '900', color: theme.text,
              letterSpacing: 1}}>BANK ME</Text>
            <Text style={{fontSize: 12, color: theme.primary, fontWeight: '600',
              marginTop: 4}}>🛡️ RTAI Secured · RBI Compliant</Text>
          </View>

          {/* Tabs */}
          <View style={{flexDirection: 'row', backgroundColor: theme.card,
            borderRadius: 14, borderWidth: 1, borderColor: theme.border,
            padding: 4, marginBottom: 20}}>
            {([['signin', 'Sign In'], ['signup', 'Create Account']] as [Tab, string][])
              .map(([t, lbl]) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)}
                style={{flex: 1, paddingVertical: 12, borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: tab === t ? theme.primary : 'transparent'}}>
                <Text style={{fontWeight: '800', fontSize: 14,
                  color: tab === t ? '#000' : theme.muted2}}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ══════════ SIGN IN ══════════ */}
          {tab === 'signin' && (
            <View>
              <Text style={{fontSize: 20, fontWeight: '900', color: theme.text}}>
                Welcome Back
              </Text>
              <Text style={{fontSize: 13, color: theme.muted2, marginTop: 2}}>
                Sign in to your BankMe account
              </Text>

              {/* OTP / PIN toggle */}
              <View style={{flexDirection: 'row', gap: 8, marginTop: 16}}>
                {(['otp', 'pin'] as const).map(m => (
                  <TouchableOpacity key={m} onPress={() => setLoginMode(m)}
                    style={{flex: 1, paddingVertical: 10, borderRadius: 10,
                      borderWidth: 1.5, alignItems: 'center',
                      borderColor: loginMode === m ? theme.primary : theme.border,
                      backgroundColor: loginMode === m ? theme.primary + '15' : 'transparent'}}>
                    <Text style={{fontWeight: '800', fontSize: 13,
                      color: loginMode === m ? theme.primary : theme.muted2}}>
                      {m === 'otp' ? '📱 OTP Login' : '🔢 PIN Login'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── OTP MODE ── */}
              {loginMode === 'otp' && (
                !otpSent ? (
                  <>
                    <Text style={label}>MOBILE NUMBER</Text>
                    <TextInput style={inputStyle} keyboardType="number-pad"
                      maxLength={10} placeholder="10-digit mobile number"
                      placeholderTextColor={theme.muted}
                      value={siMobile} onChangeText={setSiMobile} />
                    <TouchableOpacity onPress={sendOtp} disabled={sending}
                      style={{backgroundColor: theme.primary, borderRadius: 12,
                        paddingVertical: 15, alignItems: 'center', marginTop: 20}}>
                      <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                        {sending ? 'Sending OTP...' : 'Send OTP →'}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={label}>ENTER OTP</Text>
                    <Text style={{fontSize: 12, color: theme.muted2, marginBottom: 6}}>
                      Sent to +91 {siMobile}
                    </Text>
                    <TextInput style={[inputStyle, {letterSpacing: 8,
                      textAlign: 'center', fontSize: 22}]} keyboardType="number-pad"
                      maxLength={6} placeholder="______" placeholderTextColor={theme.muted}
                      value={otp} onChangeText={setOtp} autoFocus />
                    <TouchableOpacity onPress={verifyOtp}
                      style={{backgroundColor: theme.primary, borderRadius: 12,
                        paddingVertical: 15, alignItems: 'center', marginTop: 20}}>
                      <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                        Verify & Sign In →
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {setOtpSent(false); setOtp('');}}
                      style={{alignItems: 'center', marginTop: 14}}>
                      <Text style={{color: theme.muted2, fontSize: 13}}>
                        ← Change number
                      </Text>
                    </TouchableOpacity>
                  </>
                )
              )}

              {/* ── PIN MODE ── */}
              {loginMode === 'pin' && (
                <>
                  <Text style={label}>ENTER 4-DIGIT PIN</Text>
                  <TextInput style={[inputStyle, {letterSpacing: 16,
                    textAlign: 'center', fontSize: 26}]} keyboardType="number-pad"
                    maxLength={4} secureTextEntry placeholder="••••"
                    placeholderTextColor={theme.muted}
                    value={pin} onChangeText={setPin} autoFocus />
                  <TouchableOpacity onPress={loginWithPin}
                    style={{backgroundColor: theme.primary, borderRadius: 12,
                      paddingVertical: 15, alignItems: 'center', marginTop: 20}}>
                    <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                      🔓 Unlock →
                    </Text>
                  </TouchableOpacity>
                  <Text style={{fontSize: 11, color: theme.muted2, textAlign: 'center',
                    marginTop: 14}}>
                    First time? Use OTP login once, then set a PIN.
                  </Text>
                </>
              )}
            </View>
          )}

          {/* ══════════ SIGN UP ══════════ */}
          {tab === 'signup' && (
            <View>
              <Text style={{fontSize: 20, fontWeight: '900', color: theme.text}}>
                Create Account
              </Text>
              <Text style={{fontSize: 13, color: theme.muted2, marginTop: 2}}>
                Join BankMe in a minute
              </Text>

              <Text style={label}>I WANT TO REGISTER AS</Text>
              <TouchableOpacity onPress={() => setRoleModal(true)}
                style={[inputStyle, {flexDirection: 'row', alignItems: 'center'}]}>
                <Text style={{fontSize: 18, marginRight: 10}}>{roleObj.icon}</Text>
                <View style={{flex: 1}}>
                  <Text style={{color: theme.text, fontWeight: '700', fontSize: 15}}>
                    {roleObj.label}
                  </Text>
                  <Text style={{color: theme.muted2, fontSize: 11}}>{roleObj.desc}</Text>
                </View>
                <Text style={{color: theme.muted2, fontSize: 14}}>▾</Text>
              </TouchableOpacity>

              <Text style={label}>FULL NAME * (as per PAN card)</Text>
              <TextInput style={inputStyle} placeholder="Exactly as printed on PAN"
                placeholderTextColor={theme.muted}
                value={suName} onChangeText={setSuName} />
              <Text style={{fontSize: 11, color: theme.muted2, marginTop: 4}}>
                ⚠️ Name must match your PAN card exactly for KYC to pass.
              </Text>

              {/* Mobile + verify */}
              <View style={{flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginTop: 12}}>
                <Text style={[label, {marginTop: 0}]}>MOBILE NUMBER *</Text>
                <VerifyChip verified={phoneVerified} />
              </View>
              <View style={{flexDirection: 'row', gap: 8}}>
                <TextInput style={[inputStyle, {flex: 1}]} keyboardType="number-pad"
                  maxLength={10} placeholder="10-digit mobile"
                  placeholderTextColor={theme.muted} editable={!phoneVerified}
                  value={suPhone} onChangeText={setSuPhone} />
                {!phoneVerified && (
                  <TouchableOpacity onPress={sendPhoneOtp}
                    style={{backgroundColor: theme.primary, borderRadius: 12,
                      paddingHorizontal: 16, justifyContent: 'center'}}>
                    <Text style={{color: '#000', fontWeight: '800', fontSize: 13}}>
                      {phoneOtpSent ? 'Resend' : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {phoneOtpSent && !phoneVerified && (
                <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
                  <TextInput style={[inputStyle, {flex: 1, letterSpacing: 4,
                    textAlign: 'center'}]} keyboardType="number-pad" maxLength={6}
                    placeholder="Enter mobile OTP" placeholderTextColor={theme.muted}
                    value={phoneOtp} onChangeText={setPhoneOtp} />
                  <TouchableOpacity onPress={verifyPhoneOtp}
                    style={{backgroundColor: '#10b981', borderRadius: 12,
                      paddingHorizontal: 16, justifyContent: 'center'}}>
                    <Text style={{color: '#000', fontWeight: '800', fontSize: 13}}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Email + verify */}
              <View style={{flexDirection: 'row', alignItems: 'center',
                justifyContent: 'space-between', marginTop: 12}}>
                <Text style={[label, {marginTop: 0}]}>EMAIL ADDRESS *</Text>
                <VerifyChip verified={emailVerified} />
              </View>
              <View style={{flexDirection: 'row', gap: 8}}>
                <TextInput style={[inputStyle, {flex: 1}]} keyboardType="email-address"
                  autoCapitalize="none" placeholder="you@example.com"
                  placeholderTextColor={theme.muted} editable={!emailVerified}
                  value={suEmail} onChangeText={setSuEmail} />
                {!emailVerified && (
                  <TouchableOpacity onPress={sendEmailOtp}
                    style={{backgroundColor: theme.primary, borderRadius: 12,
                      paddingHorizontal: 16, justifyContent: 'center'}}>
                    <Text style={{color: '#000', fontWeight: '800', fontSize: 13}}>
                      {emailOtpSent ? 'Resend' : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {emailOtpSent && !emailVerified && (
                <View style={{flexDirection: 'row', gap: 8, marginTop: 8}}>
                  <TextInput style={[inputStyle, {flex: 1, letterSpacing: 4,
                    textAlign: 'center'}]} keyboardType="number-pad" maxLength={6}
                    placeholder="Enter email OTP" placeholderTextColor={theme.muted}
                    value={emailOtp} onChangeText={setEmailOtp} />
                  <TouchableOpacity onPress={verifyEmailOtp}
                    style={{backgroundColor: '#10b981', borderRadius: 12,
                      paddingHorizontal: 16, justifyContent: 'center'}}>
                    <Text style={{color: '#000', fontWeight: '800', fontSize: 13}}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {role !== 'customer' && (
                <>
                  <Text style={label}>
                    {role === 'distributor' ? 'DISTRIBUTOR' : 'SHOP'} / BUSINESS NAME *
                  </Text>
                  <TextInput style={inputStyle} placeholder="Your business name"
                    placeholderTextColor={theme.muted}
                    value={suShop} onChangeText={setSuShop} />
                  <Text style={label}>CITY / DISTRICT *</Text>
                  <TextInput style={inputStyle} placeholder="Your city or district"
                    placeholderTextColor={theme.muted}
                    value={suCity} onChangeText={setSuCity} />
                </>
              )}

              <Text style={label}>CREATE PASSWORD *</Text>
              <TextInput style={inputStyle} secureTextEntry
                placeholder="At least 6 characters" placeholderTextColor={theme.muted}
                value={suPassword} onChangeText={setSuPassword} />
              <Text style={label}>CONFIRM PASSWORD *</Text>
              <TextInput style={inputStyle} secureTextEntry
                placeholder="Re-enter password" placeholderTextColor={theme.muted}
                value={suConfirm} onChangeText={setSuConfirm} />

              <TouchableOpacity onPress={() => setSuTerms(!suTerms)}
                style={{flexDirection: 'row', alignItems: 'flex-start',
                  marginTop: 18, gap: 10}}>
                <View style={{width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                  borderColor: suTerms ? theme.primary : theme.border,
                  backgroundColor: suTerms ? theme.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center', marginTop: 1}}>
                  {suTerms && <Text style={{color: '#000', fontWeight: '900',
                    fontSize: 14}}>✓</Text>}
                </View>
                <Text style={{flex: 1, fontSize: 12, color: theme.muted2,
                  lineHeight: 18}}>
                  I agree to the{' '}
                  <Text style={{color: theme.primary}}>Terms of Service</Text> and{' '}
                  <Text style={{color: theme.primary}}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={createAccount}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingVertical: 15, alignItems: 'center', marginTop: 22}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                  Create Account →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 16,
            marginTop: 24, flexWrap: 'wrap'}}>
            <Text style={{fontSize: 11, color: theme.muted2}}>🛡️ RTAI Secured</Text>
            <Text style={{fontSize: 11, color: theme.muted2}}>🔐 Firebase Auth</Text>
            <Text style={{fontSize: 11, color: theme.muted2}}>✅ RBI Compliant</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ══════════ ROLE DROPDOWN MODAL ══════════ */}
      <Modal visible={roleModal} transparent animationType="fade"
        onRequestClose={() => setRoleModal(false)}>
        <TouchableOpacity style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center', padding: 24}}
          activeOpacity={1} onPress={() => setRoleModal(false)}>
          <View style={{backgroundColor: theme.card, borderRadius: 20, padding: 8}}>
            <Text style={{fontSize: 15, fontWeight: '900', color: theme.text,
              padding: 14}}>Register as</Text>
            {ROLES.map(r => (
              <TouchableOpacity key={r.id}
                onPress={() => {setRole(r.id); setRoleModal(false);}}
                style={{flexDirection: 'row', alignItems: 'center', padding: 14,
                  borderRadius: 12,
                  backgroundColor: role === r.id ? theme.primary + '15' : 'transparent'}}>
                <Text style={{fontSize: 22, marginRight: 12}}>{r.icon}</Text>
                <View style={{flex: 1}}>
                  <Text style={{color: theme.text, fontWeight: '700', fontSize: 15}}>
                    {r.label}
                  </Text>
                  <Text style={{color: theme.muted2, fontSize: 12}}>{r.desc}</Text>
                </View>
                {role === r.id && (
                  <Text style={{color: theme.primary, fontWeight: '900',
                    fontSize: 18}}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══════════ SET PIN MODAL (first-time) ══════════ */}
      <Modal visible={setPinModal} transparent animationType="fade"
        onRequestClose={() => setSetPinModal(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', padding: 24}}>
          <View style={{backgroundColor: theme.card, borderRadius: 20, padding: 24}}>
            <Text style={{fontSize: 18, fontWeight: '900', color: theme.text,
              textAlign: 'center'}}>🔢 Set a Quick-Login PIN</Text>
            <Text style={{fontSize: 13, color: theme.muted2, textAlign: 'center',
              marginTop: 6}}>
              Set a 4-digit PIN to log in faster next time.
            </Text>

            <Text style={label}>NEW 4-DIGIT PIN</Text>
            <TextInput style={[inputStyle, {letterSpacing: 12, textAlign: 'center',
              fontSize: 22}]} keyboardType="number-pad" maxLength={4} secureTextEntry
              placeholder="••••" placeholderTextColor={theme.muted}
              value={newPin} onChangeText={setNewPin} />

            <Text style={label}>CONFIRM PIN</Text>
            <TextInput style={[inputStyle, {letterSpacing: 12, textAlign: 'center',
              fontSize: 22}]} keyboardType="number-pad" maxLength={4} secureTextEntry
              placeholder="••••" placeholderTextColor={theme.muted}
              value={confirmPin} onChangeText={setConfirmPin} />

            <TouchableOpacity onPress={() => { setSetPinModal(false); completeLogin(siMobile); }}
              style={{backgroundColor: theme.primary, borderRadius: 12,
                paddingVertical: 14, alignItems: 'center', marginTop: 20}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Save PIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSetPinModal(false)}
              style={{alignItems: 'center', marginTop: 12}}>
              <Text style={{color: theme.muted2, fontSize: 13}}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
