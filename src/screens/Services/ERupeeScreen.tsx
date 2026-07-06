import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import BankMeLogo from '../../components/BankMeLogo';
import QRCode from 'react-native-qrcode-svg';

// ── e₹ Digital Rupee (RBI CBDC) — matching bankme.co.in web flow ──
const ERUPEE = '#14b8a6'; // the web's teal CBDC color
type ETab = 'send' | 'receive' | 'load' | 'history';

export default function ERupeeScreen({navigation}: any) {
  const {theme} = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);

  const [tab, setTab] = useState<ETab>('send');

  // Like the web demo: e₹ wallet = 30% of main wallet
  // TODO: real e₹ balance from RBI CBDC API via partner bank
  const eBalance = Math.floor((user?.wallet || 0) * 0.3);

  // ── Send state ──
  const [toAddr, setToAddr] = useState('');
  const [amount, setAmount] = useState('');
  const [sent, setSent] = useState(false);
  const [txnId] = useState('ERP' + Date.now().toString().slice(-8));
  const amountNum = parseInt(amount || '0', 10);

  // ── Load state ──
  const [loadAmount, setLoadAmount] = useState('');
  const loadNum = parseInt(loadAmount || '0', 10);

  // Operator's e₹ address for receiving
  const myAddress = 'erupee://' + (user?.phone || '0000000000') + '@rbi';

  const TABS: {id: ETab; icon: string; label: string}[] = [
    {id: 'send',    icon: '⬆️', label: 'Send e₹'},
    {id: 'receive', icon: '⬇️', label: 'Receive'},
    {id: 'load',    icon: '🏦', label: 'Load'},
    {id: 'history', icon: '📋', label: 'History'},
  ];

  // Mock history — TODO: real CBDC transactions from API
  const HISTORY = [
    {id: 'ERP81726311', dir: 'in',  who: 'Ravi Kumar',    amount: 500,  date: '04 Jul · 10:15 am'},
    {id: 'ERP71625322', dir: 'out', who: 'Priya Stores',  amount: 1200, date: '03 Jul · 5:40 pm'},
    {id: 'ERP61524333', dir: 'in',  who: 'Wallet Load',   amount: 2000, date: '02 Jul · 11:00 am'},
  ];

  const doSend = () => {
    if (toAddr.trim().length < 10)
      return Alert.alert('Error', 'Enter recipient mobile or e₹ address');
    if (amountNum < 1) return Alert.alert('Error', 'Enter amount');
    if (amountNum > eBalance)
      return Alert.alert('Insufficient e₹', 'Your e₹ balance is e₹' + eBalance.toLocaleString('en-IN'));
    // TODO: RBI CBDC transfer API via partner bank
    setSent(true);
  };

  const doLoad = () => {
    if (loadNum < 1) return Alert.alert('Error', 'Enter amount');
    if (loadNum > (user?.wallet || 0))
      return Alert.alert('Insufficient balance', 'Not enough in your main wallet.');
    // TODO: convert wallet ₹ → e₹ via CBDC API
    Alert.alert('✅ Load Initiated',
      '₹' + loadNum.toLocaleString('en-IN') + ' → e₹' + loadNum.toLocaleString('en-IN') +
      '\n1 e₹ = 1 ₹ (Fixed by RBI)\n\n(CBDC API integration pending)');
    setLoadAmount('');
  };

  const card = {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    borderColor: theme.border, backgroundColor: theme.card,
    padding: 16, marginBottom: 16,
  } as const;
  const label = {
    fontSize: 12, fontWeight: '800' as const, color: theme.muted2,
    textTransform: 'uppercase' as const, marginBottom: 8,
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
            ₹ Digital Rupee (e₹)
          </Text>
        </View>

        {/* ── RBI CBDC banner (like the web) ── */}
        <View style={{marginHorizontal: 20, marginBottom: 14,
          backgroundColor: 'rgba(20,184,166,0.08)', borderWidth: 1,
          borderColor: 'rgba(20,184,166,0.3)', borderRadius: 12,
          padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Text style={{fontSize: 24}}>🏛️</Text>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 13, fontWeight: '800', color: ERUPEE}}>
              RBI Digital Rupee · CBDC Retail Pilot
            </Text>
            <Text style={{fontSize: 10, color: theme.muted2, marginTop: 2}}>
              Issued by Reserve Bank of India · Zero Settlement Risk
            </Text>
          </View>
          <View style={{backgroundColor: 'rgba(20,184,166,0.15)',
            borderWidth: 1, borderColor: 'rgba(20,184,166,0.3)',
            borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3}}>
            <Text style={{color: ERUPEE, fontSize: 9, fontWeight: '800'}}>
              ● LIVE PILOT
            </Text>
          </View>
        </View>

        {/* ── e₹ balance card ── */}
        <View style={{marginHorizontal: 20, marginBottom: 14,
          backgroundColor: 'rgba(20,184,166,0.06)', borderWidth: 1,
          borderColor: 'rgba(20,184,166,0.3)', borderRadius: 14, padding: 18}}>
          <Text style={{fontSize: 11, color: 'rgba(20,184,166,0.8)',
            fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5}}>
            e₹ Wallet Balance
          </Text>
          <Text style={{fontSize: 32, fontWeight: '900', color: ERUPEE, marginTop: 4}}>
            e₹ {eBalance.toLocaleString('en-IN')}
          </Text>
          <Text style={{fontSize: 12, color: theme.muted2, marginTop: 4}}>
            ≡ ₹{eBalance.toLocaleString('en-IN')} · 1 e₹ = 1 ₹ (Fixed)
          </Text>
          <View style={{flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap'}}>
            {['🏛️ RBI Issued', '🔐 Token Based', '⚡ Offline Capable'].map(b => (
              <View key={b} style={{backgroundColor: 'rgba(20,184,166,0.1)',
                borderWidth: 1, borderColor: 'rgba(20,184,166,0.2)',
                borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3}}>
                <Text style={{color: ERUPEE, fontSize: 10, fontWeight: '600'}}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tab row (like the web) ── */}
        <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 14,
          backgroundColor: theme.card, borderRadius: 12, borderWidth: 1,
          borderColor: theme.border, padding: 4, gap: 4}}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id}
              onPress={() => {setTab(t.id); setSent(false);}}
              style={{flex: 1, paddingVertical: 10, borderRadius: 9,
                alignItems: 'center',
                backgroundColor: tab === t.id ? ERUPEE : 'transparent'}}>
              <Text style={{fontSize: 14}}>{t.icon}</Text>
              <Text style={{fontWeight: '700', fontSize: 10, marginTop: 2,
                color: tab === t.id ? '#000' : theme.muted2}}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════ SEND ══════════ */}
        {tab === 'send' && !sent && (
          <View style={card}>
            <Text style={label}>Recipient Mobile / e₹ Address</Text>
            <TextInput style={inputStyle} placeholder="10-digit mobile or erupee address"
              placeholderTextColor={theme.muted}
              value={toAddr} onChangeText={setToAddr} />
            <Text style={label}>Amount (e₹)</Text>
            <TextInput style={inputStyle} placeholder="0"
              placeholderTextColor={theme.muted} keyboardType="number-pad"
              value={amount} onChangeText={setAmount} />
            <TouchableOpacity onPress={doSend}
              style={{backgroundColor: ERUPEE, borderRadius: 12,
                paddingVertical: 15, alignItems: 'center'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                ⬆️ Send e₹{amountNum ? amountNum.toLocaleString('en-IN') : '0'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'send' && sent && (
          <View style={[card, {alignItems: 'center'}]}>
            <BankMeLogo size={54} variant="card" showText />
            <View style={{height: 12}} />
            <View style={{width: 80, height: 80, borderRadius: 40,
              backgroundColor: 'rgba(20,184,166,0.15)', alignItems: 'center',
              justifyContent: 'center', marginBottom: 12}}>
              <Text style={{fontSize: 40}}>✅</Text>
            </View>
            <Text style={{fontSize: 20, fontWeight: '900', color: theme.text}}>
              e₹ Sent Successfully!
            </Text>
            <Text style={{fontSize: 30, fontWeight: '900', color: ERUPEE, marginTop: 8}}>
              e₹ {amountNum.toLocaleString('en-IN')}
            </Text>
            <View style={{width: '100%', marginTop: 16}}>
              {[['Transaction ID', txnId], ['To', toAddr],
                ['Settlement', 'Instant · RBI CBDC']].map(([k, v]) => (
                <View key={k} style={{flexDirection: 'row',
                  justifyContent: 'space-between', paddingVertical: 7,
                  borderBottomWidth: 1, borderBottomColor: theme.border}}>
                  <Text style={{color: theme.muted2, fontSize: 13}}>{k}</Text>
                  <Text style={{color: theme.text, fontSize: 13, fontWeight: '600'}}
                    numberOfLines={1}>{v}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => {setSent(false); setToAddr(''); setAmount('');}}
              style={{backgroundColor: ERUPEE, borderRadius: 12,
                paddingVertical: 14, alignItems: 'center', marginTop: 20, width: '100%'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Send Another
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════ RECEIVE ══════════ */}
        {tab === 'receive' && (
          <View style={[card, {alignItems: 'center'}]}>
            <Text style={label}>Your e₹ Receive QR</Text>
            <View style={{backgroundColor: '#ffffff', borderRadius: 16,
              padding: 18, marginVertical: 12}}>
              <QRCode value={myAddress} size={200} />
            </View>
            <Text style={{color: theme.text, fontWeight: '700', fontSize: 13}}>
              {user?.name || 'BankMe Agent'}
            </Text>
            <Text style={{color: theme.muted2, fontSize: 11, marginTop: 2}}>
              {myAddress}
            </Text>
            <Text style={{color: theme.muted, fontSize: 11, marginTop: 12,
              textAlign: 'center'}}>
              Customer scans with any e₹ CBDC wallet app{'\n'}
              (SBI e₹, HDFC e₹, Axis e₹, Union e₹)
            </Text>
          </View>
        )}

        {/* ══════════ LOAD ══════════ */}
        {tab === 'load' && (
          <View style={card}>
            <Text style={label}>Load e₹ from Main Wallet</Text>
            <Text style={{color: theme.muted2, fontSize: 12, marginBottom: 12}}>
              Main wallet: ₹{(user?.wallet || 0).toLocaleString('en-IN')} ·
              Conversion 1 ₹ = 1 e₹ (Fixed by RBI)
            </Text>
            <TextInput style={inputStyle} placeholder="Amount to convert"
              placeholderTextColor={theme.muted} keyboardType="number-pad"
              value={loadAmount} onChangeText={setLoadAmount} />
            <TouchableOpacity onPress={doLoad}
              style={{backgroundColor: ERUPEE, borderRadius: 12,
                paddingVertical: 15, alignItems: 'center'}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                🏦 Load e₹{loadNum ? loadNum.toLocaleString('en-IN') : '0'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════ HISTORY ══════════ */}
        {tab === 'history' && (
          <View style={card}>
            <Text style={label}>e₹ Transactions</Text>
            {HISTORY.map((h, i) => (
              <View key={h.id} style={{flexDirection: 'row', alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: i < HISTORY.length - 1 ? 1 : 0,
                borderBottomColor: theme.border}}>
                <Text style={{fontSize: 18, marginRight: 12}}>
                  {h.dir === 'in' ? '⬇️' : '⬆️'}
                </Text>
                <View style={{flex: 1}}>
                  <Text style={{color: theme.text, fontWeight: '700', fontSize: 13}}>
                    {h.who}
                  </Text>
                  <Text style={{color: theme.muted, fontSize: 11}}>{h.date}</Text>
                </View>
                <Text style={{fontWeight: '900', fontSize: 14,
                  color: h.dir === 'in' ? '#10b981' : theme.text}}>
                  {h.dir === 'in' ? '+' : '-'}e₹{h.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── API pending notice (like the web) ── */}
        <View style={{marginHorizontal: 20, backgroundColor: 'rgba(99,102,241,0.07)',
          borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', borderRadius: 12,
          padding: 12, flexDirection: 'row', gap: 10}}>
          <Text style={{fontSize: 16}}>🔑</Text>
          <View style={{flex: 1}}>
            <Text style={{fontSize: 12, fontWeight: '800', color: '#818cf8'}}>
              Banking API Integration Pending
            </Text>
            <Text style={{fontSize: 10, color: theme.muted2, marginTop: 2,
              lineHeight: 15}}>
              Live e₹ transactions require RBI CBDC API keys from your partner bank
              (SBI / HDFC / Axis / Union Bank). This flow is API-ready.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
