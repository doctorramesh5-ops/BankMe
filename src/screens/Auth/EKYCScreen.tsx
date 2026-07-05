import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../store';
import {setUser} from '../../store/authSlice';
import {useTheme} from '../../theme/ThemeContext';

// ── eKYC via DigiLocker — Aadhaar + PAN ──
// New accounts land here (kyc:'pending'). On completion → kyc:'verified'
// → services unlock.
// TODO: real DigiLocker OAuth needs a backend (Phase 3). This is the
// full API-ready UI with simulated verification.
type Step = 'intro' | 'aadhaar' | 'pan' | 'done';

export default function EKYCScreen({navigation}: any) {
  const {theme} = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);

  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarDone, setAadhaarDone] = useState(false);
  const [pan, setPan] = useState('');
  const [panDone, setPanDone] = useState(false);

  // Simulate DigiLocker Aadhaar consent + fetch
  // TODO: replace with real DigiLocker OAuth redirect + document pull
  const verifyAadhaar = () => {
    if (aadhaar.replace(/\s/g, '').length !== 12)
      return Alert.alert('Error', 'Enter a valid 12-digit Aadhaar number');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAadhaarDone(true);
      setStep('pan');
    }, 1800);
  };

  // Simulate DigiLocker PAN fetch
  // TODO: replace with real DigiLocker / NSDL PAN verification API
  const verifyPan = () => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan))
      return Alert.alert('Error', 'Enter a valid PAN (e.g. ABCDE1234F)');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPanDone(true);
      setStep('done');
    }, 1800);
  };

  // Finish — flip kyc to 'verified' so services unlock
  const finishKyc = () => {
    if (user) {
      dispatch(setUser({...user, kyc: 'verified', rtaiScore: 85}));
    }
    // Navigator sees kyc:'verified' → shows Main app
  };

  const card = {
    borderRadius: 16, borderWidth: 1, borderColor: theme.border,
    backgroundColor: theme.card, padding: 20, marginBottom: 16,
  } as const;
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 16, backgroundColor: theme.bg,
    marginTop: 12,
  } as const;

  // Progress dots
  const stepIndex = step === 'intro' ? 0 : step === 'aadhaar' ? 1 :
    step === 'pan' ? 2 : 3;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 60}}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Text style={{fontSize: 22, fontWeight: '900', color: theme.text,
          marginTop: 8}}>Complete Your eKYC</Text>
        <Text style={{fontSize: 13, color: theme.muted2, marginTop: 2,
          marginBottom: 20}}>
          Verify Aadhaar & PAN via DigiLocker to unlock services
        </Text>

        {/* Progress bar */}
        <View style={{flexDirection: 'row', gap: 6, marginBottom: 24}}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={{flex: 1, height: 5, borderRadius: 3,
              backgroundColor: i <= stepIndex ? theme.primary : theme.border}} />
          ))}
        </View>

        {/* ══════════ INTRO ══════════ */}
        {step === 'intro' && (
          <>
            <View style={card}>
              <Text style={{fontSize: 40, textAlign: 'center', marginBottom: 8}}>
                🔒
              </Text>
              <Text style={{fontSize: 17, fontWeight: '800', color: theme.text,
                textAlign: 'center'}}>
                Services Locked
              </Text>
              <Text style={{fontSize: 13, color: theme.muted2, textAlign: 'center',
                marginTop: 8, lineHeight: 20}}>
                As per RBI & RTAI compliance, complete your eKYC before using
                AEPS, DMT, BBPS and other services.
              </Text>
            </View>

            <View style={card}>
              <Text style={{fontSize: 14, fontWeight: '800', color: theme.text,
                marginBottom: 12}}>You'll verify:</Text>
              {[
                ['🆔', 'Aadhaar', 'via DigiLocker'],
                ['📄', 'PAN Card', 'via DigiLocker'],
              ].map(([icon, name, sub]) => (
                <View key={name} style={{flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 8}}>
                  <Text style={{fontSize: 24, marginRight: 12}}>{icon}</Text>
                  <View>
                    <Text style={{color: theme.text, fontWeight: '700',
                      fontSize: 14}}>{name}</Text>
                    <Text style={{color: theme.muted2, fontSize: 12}}>{sub}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* DigiLocker badge */}
            <View style={{flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 1,
              borderColor: 'rgba(59,130,246,0.25)', borderRadius: 12,
              padding: 12, marginBottom: 16, gap: 10}}>
              <Text style={{fontSize: 20}}>🏛️</Text>
              <Text style={{flex: 1, fontSize: 11, color: theme.muted2,
                lineHeight: 16}}>
                Powered by DigiLocker — Govt. of India. Your documents are
                fetched securely with your consent.
              </Text>
            </View>

            <TouchableOpacity onPress={() => setStep('aadhaar')}
              style={{backgroundColor: theme.primary, borderRadius: 12,
                paddingVertical: 15, alignItems: 'center'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Start eKYC →
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ══════════ AADHAAR ══════════ */}
        {step === 'aadhaar' && (
          <View style={card}>
            <Text style={{fontSize: 32, marginBottom: 8}}>🆔</Text>
            <Text style={{fontSize: 17, fontWeight: '800', color: theme.text}}>
              Aadhaar Verification
            </Text>
            <Text style={{fontSize: 13, color: theme.muted2, marginTop: 4}}>
              Enter your Aadhaar to fetch via DigiLocker
            </Text>

            <TextInput style={inputStyle} keyboardType="number-pad" maxLength={12}
              placeholder="12-digit Aadhaar number" placeholderTextColor={theme.muted}
              value={aadhaar} onChangeText={setAadhaar} editable={!loading} />

            {loading ? (
              <View style={{alignItems: 'center', marginTop: 20}}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{color: theme.muted2, fontSize: 13, marginTop: 10}}>
                  Connecting to DigiLocker...
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={verifyAadhaar}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingVertical: 15, alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                  Verify via DigiLocker →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ══════════ PAN ══════════ */}
        {step === 'pan' && (
          <>
            <View style={{flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 12,
              padding: 12, marginBottom: 16}}>
              <Text style={{fontSize: 18, marginRight: 8}}>✅</Text>
              <Text style={{color: '#10b981', fontWeight: '700', fontSize: 13}}>
                Aadhaar verified successfully
              </Text>
            </View>

            <View style={card}>
              <Text style={{fontSize: 32, marginBottom: 8}}>📄</Text>
              <Text style={{fontSize: 17, fontWeight: '800', color: theme.text}}>
                PAN Verification
              </Text>
              <Text style={{fontSize: 13, color: theme.muted2, marginTop: 4}}>
                Enter your PAN to fetch via DigiLocker
              </Text>

              <TextInput style={[inputStyle, {textTransform: 'uppercase',
                letterSpacing: 2}]} maxLength={10} autoCapitalize="characters"
                placeholder="ABCDE1234F" placeholderTextColor={theme.muted}
                value={pan} onChangeText={t => setPan(t.toUpperCase())}
                editable={!loading} />

              {loading ? (
                <View style={{alignItems: 'center', marginTop: 20}}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={{color: theme.muted2, fontSize: 13, marginTop: 10}}>
                    Connecting to DigiLocker...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity onPress={verifyPan}
                  style={{backgroundColor: theme.primary, borderRadius: 12,
                    paddingVertical: 15, alignItems: 'center', marginTop: 20}}>
                  <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                    Verify via DigiLocker →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ══════════ DONE ══════════ */}
        {step === 'done' && (
          <View style={[card, {alignItems: 'center', paddingVertical: 32}]}>
            <View style={{width: 90, height: 90, borderRadius: 45,
              backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center',
              justifyContent: 'center', marginBottom: 16}}>
              <Text style={{fontSize: 48}}>✅</Text>
            </View>
            <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
              eKYC Complete!
            </Text>
            <Text style={{fontSize: 14, color: theme.muted2, textAlign: 'center',
              marginTop: 8, lineHeight: 20}}>
              Your Aadhaar & PAN are verified.{'\n'}All services are now unlocked.
            </Text>

            <View style={{width: '100%', marginTop: 20}}>
              {[
                ['🆔 Aadhaar', 'Verified ✅'],
                ['📄 PAN', 'Verified ✅'],
                ['🛡️ RTAI Score', '85 / 100'],
              ].map(([k, v]) => (
                <View key={k} style={{flexDirection: 'row',
                  justifyContent: 'space-between', paddingVertical: 8,
                  borderBottomWidth: 1, borderBottomColor: theme.border}}>
                  <Text style={{color: theme.muted2, fontSize: 13}}>{k}</Text>
                  <Text style={{color: '#10b981', fontSize: 13,
                    fontWeight: '700'}}>{v}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={finishKyc}
              style={{backgroundColor: theme.primary, borderRadius: 12,
                paddingVertical: 15, alignItems: 'center', marginTop: 24,
                width: '100%'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Enter BankMe →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
