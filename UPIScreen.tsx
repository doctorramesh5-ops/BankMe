import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, Share,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import QRCode from 'react-native-qrcode-svg';

// ── UPI Cash In / Cash Out — matching bankme.co.in web flow ──
type Mode = 'cashin' | 'cashout';
const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function UPIScreen({navigation}: any) {
  const {theme} = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);

  const [mode, setMode] = useState<Mode>('cashin');

  // ── Operator UPI (like the web: from profile, else phone@upi) ──
  const operatorUPI = user?.upiId || (user?.phone ? user.phone + '@upi' : 'bankme@upi');
  const operatorName = user?.name || 'BankMe Agent';

  // ── Cash In state ──
  const [ciPhone, setCiPhone] = useState('');
  const [ciName, setCiName] = useState('');
  const [ciAmount, setCiAmount] = useState('');
  const [ciRemarks, setCiRemarks] = useState('');
  const [qrVisible, setQrVisible] = useState(false);

  // ── Cash Out state ──
  const [coUpi, setCoUpi] = useState('');
  const [coName, setCoName] = useState('');
  const [coAmount, setCoAmount] = useState('');
  const [coDone, setCoDone] = useState(false);
  const [txnId] = useState('UPI' + Date.now().toString().slice(-8));

  const ciNum = parseInt(ciAmount || '0', 10);
  const coNum = parseInt(coAmount || '0', 10);

  // ── The UPI intent string — a REAL scannable UPI QR format ──
  // upi://pay?pa=<upi-id>&pn=<name>&am=<amount>&tn=<note>
  const upiIntent =
    'upi://pay?pa=' + encodeURIComponent(operatorUPI) +
    '&pn=' + encodeURIComponent(operatorName) +
    (ciNum > 0 ? '&am=' + ciNum : '') +
    '&cu=INR' +
    (ciRemarks ? '&tn=' + encodeURIComponent(ciRemarks) : '');

  const generateQR = () => {
    if (ciNum < 1) return Alert.alert('Error', 'Enter the amount to collect');
    setQrVisible(true);
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message:
          '💵 BankMe Payment Request\n' +
          'Pay ₹' + ciNum.toLocaleString('en-IN') + ' to ' + operatorName + '\n' +
          (ciRemarks ? 'For: ' + ciRemarks + '\n' : '') +
          'UPI ID: ' + operatorUPI + '\n' +
          'Or tap to pay: ' + upiIntent,
      });
    } catch {
      Alert.alert('Error', 'Could not open share menu');
    }
  };

  const sendCashOut = () => {
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(coUpi))
      return Alert.alert('Error', 'Enter a valid UPI ID (e.g. name@okaxis)');
    if (coName.trim().length < 3)
      return Alert.alert('Error', 'Enter recipient name');
    if (coNum < 1) return Alert.alert('Error', 'Enter amount');
    // TODO: wallet balance check + real UPI payout API (backend)
    setCoDone(true);
  };

  const resetCashIn = () => {
    setQrVisible(false); setCiPhone(''); setCiName('');
    setCiAmount(''); setCiRemarks('');
  };
  const resetCashOut = () => {
    setCoDone(false); setCoUpi(''); setCoName(''); setCoAmount('');
  };

  const card = {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    borderColor: theme.border, backgroundColor: theme.card,
    padding: 16, marginBottom: 16,
  } as const;
  const label = {
    fontSize: 12, fontWeight: '800' as const, color: theme.muted2,
    textTransform: 'uppercase' as const, marginBottom: 8, marginTop: 4,
  };
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 15, marginBottom: 12,
    backgroundColor: theme.bg,
  } as const;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}
        keyboardShouldPersistTaps="handled">

        <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
            📲 UPI Cash In / Out
          </Text>
        </View>

        {/* ── Operator strip (like the web) ── */}
        <View style={{marginHorizontal: 20, marginBottom: 16,
          backgroundColor: 'rgba(16,185,129,0.07)', borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.25)', borderRadius: 12,
          padding: 14, flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between'}}>
          <View>
            <Text style={{fontSize: 10, color: theme.muted2, fontWeight: '700',
              textTransform: 'uppercase'}}>Collecting to</Text>
            <Text style={{fontSize: 14, fontWeight: '800', color: '#10b981',
              marginTop: 2}}>{operatorName}</Text>
            <Text style={{fontSize: 12, color: theme.muted2, marginTop: 1}}>
              {operatorUPI}
            </Text>
          </View>
          <View style={{backgroundColor: 'rgba(16,185,129,0.15)',
            borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4,
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)'}}>
            <Text style={{color: '#10b981', fontSize: 10, fontWeight: '800'}}>
              ● UPI ACTIVE
            </Text>
          </View>
        </View>

        {/* ── Mode toggle ── */}
        <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
          backgroundColor: theme.card, borderRadius: 12, borderWidth: 1,
          borderColor: theme.border, padding: 4}}>
          {([['cashin', '💵 Cash In (Collect)'], ['cashout', '💴 Cash Out (Send)']] as
            [Mode, string][]).map(([m, lbl]) => (
            <TouchableOpacity key={m}
              onPress={() => {setMode(m); setQrVisible(false); setCoDone(false);}}
              style={{flex: 1, paddingVertical: 12, borderRadius: 9,
                alignItems: 'center',
                backgroundColor: mode === m
                  ? (m === 'cashin' ? '#10b981' : '#ef4444') : 'transparent'}}>
              <Text style={{fontWeight: '800', fontSize: 12,
                color: mode === m ? '#000' : theme.muted2}}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════ CASH IN ══════════ */}
        {mode === 'cashin' && !qrVisible && (
          <View style={card}>
            <Text style={label}>Customer Mobile / UPI ID</Text>
            <TextInput style={inputStyle} placeholder="10-digit mobile or name@upi"
              placeholderTextColor={theme.muted}
              value={ciPhone} onChangeText={setCiPhone} />

            <Text style={label}>Customer Name (optional)</Text>
            <TextInput style={inputStyle} placeholder="e.g. Ravi Kumar"
              placeholderTextColor={theme.muted}
              value={ciName} onChangeText={setCiName} />

            <Text style={label}>Amount to Collect (₹)</Text>
            <TextInput style={inputStyle} placeholder="0"
              placeholderTextColor={theme.muted} keyboardType="number-pad"
              value={ciAmount} onChangeText={setCiAmount} />
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6,
              marginBottom: 12}}>
              {QUICK_AMOUNTS.map(v => (
                <TouchableOpacity key={v} onPress={() => setCiAmount(String(v))}
                  style={{paddingHorizontal: 12, paddingVertical: 7,
                    borderRadius: 8, borderWidth: 1,
                    borderColor: ciNum === v ? '#10b981' : theme.border,
                    backgroundColor: ciNum === v ? '#10b981' : theme.bg}}>
                  <Text style={{fontSize: 12, fontWeight: '700',
                    color: ciNum === v ? '#000' : theme.muted2}}>₹{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={label}>Remarks / Purpose</Text>
            <TextInput style={inputStyle}
              placeholder="e.g. Grocery, Rent, Service fee…"
              placeholderTextColor={theme.muted}
              value={ciRemarks} onChangeText={setCiRemarks} />

            <TouchableOpacity onPress={generateQR}
              style={{backgroundColor: '#10b981', borderRadius: 12,
                paddingVertical: 15, alignItems: 'center', marginTop: 4}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                ⚡ Generate QR & Payment Link →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Cash In: QR result ── */}
        {mode === 'cashin' && qrVisible && (
          <View style={[card, {alignItems: 'center'}]}>
            <Text style={{color: theme.text, fontSize: 16, fontWeight: '900',
              marginBottom: 4}}>Scan to Pay ₹{ciNum.toLocaleString('en-IN')}</Text>
            <Text style={{color: theme.muted2, fontSize: 12, marginBottom: 16}}>
              {ciName ? ciName + ' · ' : ''}{ciRemarks || 'UPI Collection'}
            </Text>

            {/* White box so any UPI app can scan it */}
            <View style={{backgroundColor: '#ffffff', borderRadius: 16,
              padding: 18, marginBottom: 16}}>
              <QRCode value={upiIntent} size={210} />
            </View>
            <Text style={{color: theme.muted2, fontSize: 11, marginBottom: 16,
              textAlign: 'center'}}>
              Customer scans with any UPI app{'\n'}(GPay, PhonePe, Paytm, BHIM)
            </Text>

            <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
              <TouchableOpacity onPress={shareLink}
                style={{flex: 1, backgroundColor: theme.primary, borderRadius: 12,
                  paddingVertical: 14, alignItems: 'center'}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 14}}>
                  📤 Share Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetCashIn}
                style={{flex: 1, backgroundColor: theme.card, borderWidth: 1,
                  borderColor: theme.border, borderRadius: 12,
                  paddingVertical: 14, alignItems: 'center'}}>
                <Text style={{color: theme.text, fontWeight: '800', fontSize: 14}}>
                  New Collection
                </Text>
              </TouchableOpacity>
            </View>
            {/* TODO: backend webhook to auto-confirm payment received */}
          </View>
        )}

        {/* ══════════ CASH OUT ══════════ */}
        {mode === 'cashout' && !coDone && (
          <View style={card}>
            <Text style={label}>Recipient UPI ID</Text>
            <TextInput style={inputStyle} placeholder="name@upi or mobile@paytm"
              placeholderTextColor={theme.muted} autoCapitalize="none"
              value={coUpi} onChangeText={setCoUpi} />

            <Text style={label}>Recipient Name</Text>
            <TextInput style={inputStyle} placeholder="Recipient name"
              placeholderTextColor={theme.muted}
              value={coName} onChangeText={setCoName} />

            <Text style={label}>Amount (₹)</Text>
            <TextInput style={inputStyle} placeholder="Enter amount"
              placeholderTextColor={theme.muted} keyboardType="number-pad"
              value={coAmount} onChangeText={setCoAmount} />

            <TouchableOpacity onPress={sendCashOut}
              style={{backgroundColor: '#ef4444', borderRadius: 12,
                paddingVertical: 15, alignItems: 'center', marginTop: 4}}>
              <Text style={{color: '#fff', fontWeight: '900', fontSize: 15}}>
                💴 Send ₹{coNum ? coNum.toLocaleString('en-IN') : '0'} →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Cash Out: success ── */}
        {mode === 'cashout' && coDone && (
          <View style={[card, {alignItems: 'center'}]}>
            <View style={{width: 80, height: 80, borderRadius: 40,
              backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center',
              justifyContent: 'center', marginBottom: 12}}>
              <Text style={{fontSize: 40}}>✅</Text>
            </View>
            <Text style={{fontSize: 20, fontWeight: '900', color: theme.text}}>
              Transfer Initiated!
            </Text>
            <Text style={{fontSize: 30, fontWeight: '900', color: '#10b981',
              marginTop: 8}}>₹{coNum.toLocaleString('en-IN')}</Text>

            <View style={{width: '100%', marginTop: 16}}>
              {[
                ['Transaction ID', txnId],
                ['To', coName],
                ['UPI ID', coUpi],
                ['Mode', 'UPI Transfer'],
              ].map(([k, v]) => (
                <View key={k} style={{flexDirection: 'row',
                  justifyContent: 'space-between', paddingVertical: 7,
                  borderBottomWidth: 1, borderBottomColor: theme.border}}>
                  <Text style={{color: theme.muted2, fontSize: 13}}>{k}</Text>
                  <Text style={{color: theme.text, fontSize: 13,
                    fontWeight: '600'}}>{v}</Text>
                </View>
              ))}
            </View>
            {/* TODO: real UPI payout API via backend */}

            <TouchableOpacity onPress={resetCashOut}
              style={{backgroundColor: theme.primary, borderRadius: 12,
                paddingVertical: 14, alignItems: 'center', marginTop: 20,
                width: '100%'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Send Another
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
