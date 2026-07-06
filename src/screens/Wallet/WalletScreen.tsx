import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {RootState} from '../../store';
import {useTheme} from '../../theme/ThemeContext';
import {launchImageLibrary} from 'react-native-image-picker';
import RazorpayCheckout from 'react-native-razorpay';
import SoundPlayer from 'react-native-sound-player';

// PASTE YOUR KEY ID BELOW (starts with rzp_test_). NEVER the Key Secret!
const RAZORPAY_KEY_ID = 'rzp_test_Si0eHtBmBboiVW';

// ── TYPES ─────────────────────────────────────────────
type WalletTab = 'add' | 'payout';
type BankStatus = 'verified' | 'docs_needed' | 'pending_admin';

type BankAccount = {
  id: string;
  holderName: string;
  bankName: string;
  account: string;
  ifsc: string;
  status: BankStatus;
};

// ── PAY-IN METHODS ────────────────────────────────────
const PAYIN_METHODS = [
  {id: 'upi', icon: '🔗', label: 'UPI', note: 'Instant · Free'},
  {id: 'card', icon: '💳', label: 'Debit / Credit Card', note: '1.2% fee'},
  {id: 'netbanking', icon: '🏦', label: 'Net Banking', note: 'Instant'},
  {id: 'erupee', icon: '🇮🇳', label: 'e₹ Digital Rupee', note: 'RBI CBDC · Free'},
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000, 50000];
const MAX_AMOUNT = 50000;

// Normalize a name for matching: lowercase, remove extra spaces & dots
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

export default function WalletScreen({navigation}: any) {
  const {theme} = useTheme();
  const user = useSelector((s: RootState) => s.auth.user);

  const [tab, setTab] = useState<WalletTab>('add');

  // ── Add Money state ──
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);

  // ── Payout state ──
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMode, setPayoutMode] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // ── Add Bank modal state ──
  const [bankModal, setBankModal] = useState(false);
  const [newHolder, setNewHolder] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newIfsc, setNewIfsc] = useState('');

  const amountNum = parseInt(amount || '0', 10);
  const payoutNum = parseInt(payoutAmount || '0', 10);
  const balance = user?.wallet || 0;

  // ── Styles reused everywhere ──
  const card = {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    borderColor: theme.border, backgroundColor: theme.card,
    padding: 16, marginBottom: 16,
  } as const;
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 16, marginBottom: 12,
    backgroundColor: theme.bg,
  } as const;

  // ── ADD MONEY ──────────────────────────────────────
  const proceedAddMoney = () => {
    if (amountNum < 1) return Alert.alert('Error', 'Enter an amount');
    if (amountNum > MAX_AMOUNT)
      return Alert.alert('Limit exceeded', 'Maximum add money is \u20b950,000 per transaction.');
    if (!method) return Alert.alert('Select method', 'Choose how you want to pay.');

    const options = {
      description: 'BankMe Wallet Top-up',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: amountNum * 100, // Razorpay counts in PAISE: \u20b91 = 100 paise!
      name: 'BankMe',
      prefill: {
        name: user?.name || '',
        contact: user?.phone || '',
        email: user?.email || '',
      },
      theme: {color: '#00d4aa'},
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        try { SoundPlayer.playSoundFile('coin', 'mp3'); } catch (e) {}
        // TODO: send data.razorpay_payment_id to backend for signature
        // verification, then credit wallet from the server response
        Alert.alert('\u2705 Payment Successful',
          'Payment ID: ' + data.razorpay_payment_id +
          '\n\u20b9' + amountNum.toLocaleString('en-IN') + ' will be credited.');
        setAmount(''); setMethod(null);
      })
      .catch((error: any) => {
        Alert.alert('\u274c Payment Failed',
          error?.description || 'Payment was cancelled or failed.');
      });
  };

  // ── ADD BANK with name-match verification ──────────
  const addBank = () => {
    if (newHolder.trim().length < 3) return Alert.alert('Error', 'Enter account holder name');
    if (newBankName.trim().length < 3) return Alert.alert('Error', 'Enter bank name');
    if (newAccount.length < 9) return Alert.alert('Error', 'Enter valid account number');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(newIfsc.toUpperCase()))
      return Alert.alert('Error', 'Enter valid IFSC (e.g. SBIN0001234)');

    // ── THE NAME-MATCH RULE ──
    // Auto-approve if holder name matches the customer's name OR the shop name.
    // TODO: replace with backend penny-drop verification API
    const holder = normalizeName(newHolder);
    const customerName = normalizeName(user?.name || '');
    const shopName = normalizeName(user?.shopName || '');
    const matches =
      (customerName && holder === customerName) ||
      (shopName && holder === shopName);

    const newBank: BankAccount = {
      id: Date.now().toString(),
      holderName: newHolder.trim(),
      bankName: newBankName.trim(),
      account: newAccount,
      ifsc: newIfsc.toUpperCase(),
      status: matches ? 'verified' : 'docs_needed',
    };
    setBanks([...banks, newBank]);
    setNewHolder(''); setNewBankName(''); setNewAccount(''); setNewIfsc('');
    setBankModal(false);

    if (matches) {
      Alert.alert('✅ Auto-Approved',
        'Account holder name matches your profile.\nThis bank account is verified for payouts!');
    } else {
      Alert.alert('📄 Documents Required',
        'Account holder name does not match your customer name or shop name.\n\n' +
        'Please upload your bank statement or passbook. An admin will verify within 24 hours.');
    }
  };

  // ── Upload proof for a docs_needed bank ────────────
  const uploadBankProof = async (bankId: string) => {
    try {
      const result = await launchImageLibrary({mediaType: 'photo', quality: 0.7});
      if (result.didCancel) return;
      if (result.errorCode)
        return Alert.alert('Error', result.errorMessage || 'Could not open gallery');
      // TODO: upload result.assets[0] to backend for admin review
      setBanks(prev => prev.map(b =>
        b.id === bankId ? {...b, status: 'pending_admin'} : b));
      Alert.alert('📤 Submitted',
        'Bank statement/passbook uploaded.\nStatus: Pending admin approval.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Upload failed');
    }
  };

  // ── PAYOUT ─────────────────────────────────────────
  const proceedPayout = () => {
    if (payoutNum < 1) return Alert.alert('Error', 'Enter an amount');
    if (payoutNum > balance)
      return Alert.alert('Insufficient balance',
        'Your wallet balance is ₹' + balance.toLocaleString('en-IN'));

    if (payoutMode === 'upi') {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId))
        return Alert.alert('Error', 'Enter a valid UPI ID (e.g. name@okaxis)');
      // TODO: integrate payout API
      Alert.alert('✅ Payout Initiated',
        '₹' + payoutNum.toLocaleString('en-IN') + ' to ' + upiId +
        '\n\n(Payout API integration pending — simulated)');
      setPayoutAmount(''); setUpiId('');
      return;
    }

    // Bank payout — only VERIFIED banks allowed
    const bank = banks.find(b => b.id === selectedBank);
    if (!bank) return Alert.alert('Select bank', 'Choose a bank account or add one.');
    if (bank.status !== 'verified')
      return Alert.alert('Bank not verified',
        bank.status === 'docs_needed'
          ? 'Upload your bank statement/passbook first.'
          : 'Admin approval is pending for this account.');
    // TODO: integrate payout API
    Alert.alert('✅ Payout Initiated',
      '₹' + payoutNum.toLocaleString('en-IN') + ' to ' + bank.bankName +
      ' ••••' + bank.account.slice(-4) +
      '\n\n(Payout API integration pending — simulated)');
    setPayoutAmount('');
  };

  const STATUS_UI: Record<BankStatus, {color: string; label: string}> = {
    verified: {color: '#10b981', label: '✅ VERIFIED'},
    docs_needed: {color: '#ef4444', label: '📄 DOCS NEEDED'},
    pending_admin: {color: '#f59e0b', label: '⏳ ADMIN APPROVAL'},
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}
        keyboardShouldPersistTaps="handled">

        <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
            👛 Wallet
          </Text>
        </View>

        {/* ── Balance card ── */}
        <View style={[card, {backgroundColor: theme.primary + '15',
          borderColor: theme.primary + '40'}]}>
          <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '700'}}>
            AVAILABLE BALANCE
          </Text>
          <Text style={{color: theme.text, fontSize: 34, fontWeight: '900', marginTop: 4}}>
            ₹{balance.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* ── Tab switch: Add Money | Payout ── */}
        <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
          backgroundColor: theme.card, borderRadius: 12, borderWidth: 1,
          borderColor: theme.border, padding: 4}}>
          {(['add', 'payout'] as WalletTab[]).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={{flex: 1, paddingVertical: 12, borderRadius: 9,
                alignItems: 'center',
                backgroundColor: tab === t ? theme.primary : 'transparent'}}>
              <Text style={{fontWeight: '800', fontSize: 13,
                color: tab === t ? '#000' : theme.muted2}}>
                {t === 'add' ? '➕ Add Money' : '📤 Payout'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════ ADD MONEY TAB ══════════ */}
        {tab === 'add' && (
          <>
            <View style={card}>
              <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '800',
                textTransform: 'uppercase', marginBottom: 10}}>Amount (max ₹50,000)</Text>
              <TextInput style={inputStyle} placeholder="Enter amount"
                placeholderTextColor={theme.muted} keyboardType="number-pad"
                value={amount} onChangeText={setAmount} />
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {QUICK_AMOUNTS.map(v => (
                  <TouchableOpacity key={v} onPress={() => setAmount(String(v))}
                    style={{paddingHorizontal: 14, paddingVertical: 8,
                      borderRadius: 100, borderWidth: 1,
                      borderColor: amountNum === v ? theme.primary : theme.border,
                      backgroundColor: amountNum === v ? theme.primary : theme.bg}}>
                    <Text style={{fontSize: 12, fontWeight: '700',
                      color: amountNum === v ? '#000' : theme.muted2}}>
                      ₹{v.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={card}>
              <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '800',
                textTransform: 'uppercase', marginBottom: 10}}>Pay Using</Text>
              {PAYIN_METHODS.map(m => (
                <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)}
                  style={{flexDirection: 'row', alignItems: 'center',
                    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
                    borderColor: method === m.id ? theme.primary : theme.border,
                    backgroundColor: method === m.id ? theme.primary + '15' : theme.bg}}>
                  <Text style={{fontSize: 22, marginRight: 12}}>{m.icon}</Text>
                  <View style={{flex: 1}}>
                    <Text style={{color: theme.text, fontWeight: '700', fontSize: 14}}>
                      {m.label}
                    </Text>
                    <Text style={{color: theme.muted2, fontSize: 11}}>{m.note}</Text>
                  </View>
                  <View style={{width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                    borderColor: method === m.id ? theme.primary : theme.border,
                    alignItems: 'center', justifyContent: 'center'}}>
                    {method === m.id && (
                      <View style={{width: 10, height: 10, borderRadius: 5,
                        backgroundColor: theme.primary}} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={proceedAddMoney}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingVertical: 15, alignItems: 'center', marginTop: 8}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                  Add ₹{amountNum ? amountNum.toLocaleString('en-IN') : '0'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ══════════ PAYOUT TAB ══════════ */}
        {tab === 'payout' && (
          <>
            <View style={card}>
              <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '800',
                textTransform: 'uppercase', marginBottom: 10}}>Payout Amount</Text>
              <TextInput style={inputStyle} placeholder="Enter amount"
                placeholderTextColor={theme.muted} keyboardType="number-pad"
                value={payoutAmount} onChangeText={setPayoutAmount} />

              {/* Mode toggle */}
              <View style={{flexDirection: 'row', gap: 8, marginBottom: 4}}>
                {(['upi', 'bank'] as const).map(m => (
                  <TouchableOpacity key={m} onPress={() => setPayoutMode(m)}
                    style={{flex: 1, paddingVertical: 12, borderRadius: 10,
                      alignItems: 'center', borderWidth: 1,
                      borderColor: payoutMode === m ? theme.primary : theme.border,
                      backgroundColor: payoutMode === m ? theme.primary + '15' : theme.bg}}>
                    <Text style={{fontWeight: '800', fontSize: 13,
                      color: payoutMode === m ? theme.primary : theme.muted2}}>
                      {m === 'upi' ? '🔗 UPI' : '🏦 Bank Account'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {payoutMode === 'upi' && (
              <View style={card}>
                <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '800',
                  textTransform: 'uppercase', marginBottom: 10}}>UPI ID</Text>
                <TextInput style={inputStyle} placeholder="yourname@okaxis"
                  placeholderTextColor={theme.muted} autoCapitalize="none"
                  value={upiId} onChangeText={setUpiId} />
              </View>
            )}

            {payoutMode === 'bank' && (
              <View style={card}>
                <Text style={{color: theme.muted2, fontSize: 12, fontWeight: '800',
                  textTransform: 'uppercase', marginBottom: 10}}>Select Bank Account</Text>

                {banks.length === 0 && (
                  <Text style={{color: theme.muted2, fontSize: 13, marginBottom: 12}}>
                    No bank accounts yet. Add one below — if the account holder name
                    matches your name or shop name, it's approved instantly!
                  </Text>
                )}

                {banks.map(b => {
                  const st = STATUS_UI[b.status];
                  return (
                    <TouchableOpacity key={b.id}
                      onPress={() => b.status === 'verified'
                        ? setSelectedBank(b.id)
                        : b.status === 'docs_needed'
                          ? uploadBankProof(b.id)
                          : Alert.alert('Pending', 'Admin approval in progress.')}
                      style={{padding: 14, borderRadius: 12, borderWidth: 1,
                        marginBottom: 8,
                        borderColor: selectedBank === b.id ? theme.primary : theme.border,
                        backgroundColor: selectedBank === b.id
                          ? theme.primary + '15' : theme.bg}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={{color: theme.text, fontWeight: '700', fontSize: 14}}>
                          {b.bankName}
                        </Text>
                        <Text style={{color: st.color, fontSize: 10, fontWeight: '800'}}>
                          {st.label}
                        </Text>
                      </View>
                      <Text style={{color: theme.muted2, fontSize: 12, marginTop: 2}}>
                        {b.holderName} · ••••{b.account.slice(-4)} · {b.ifsc}
                      </Text>
                      {b.status === 'docs_needed' && (
                        <Text style={{color: '#ef4444', fontSize: 11, marginTop: 4}}>
                          Tap to upload bank statement / passbook
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity onPress={() => setBankModal(true)}
                  style={{borderWidth: 1, borderColor: theme.primary,
                    borderStyle: 'dashed', borderRadius: 12, padding: 14,
                    alignItems: 'center', marginTop: 4}}>
                  <Text style={{color: theme.primary, fontWeight: '800'}}>
                    ＋ Add Bank Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{marginHorizontal: 20}}>
              <TouchableOpacity onPress={proceedPayout}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingVertical: 15, alignItems: 'center'}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                  Payout ₹{payoutNum ? payoutNum.toLocaleString('en-IN') : '0'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* ══════════ ADD BANK MODAL ══════════ */}
      <Modal visible={bankModal} transparent animationType="slide"
        onRequestClose={() => setBankModal(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end'}}>
          <View style={{backgroundColor: theme.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: 40}}>
            <Text style={{color: theme.text, fontSize: 18, fontWeight: '900',
              marginBottom: 4}}>Add Bank Account</Text>
            <Text style={{color: theme.muted2, fontSize: 12, marginBottom: 16}}>
              💡 If the holder name matches your customer name or shop name,
              the account is approved automatically.
            </Text>

            <TextInput style={inputStyle} placeholder="Account holder name (as per bank)"
              placeholderTextColor={theme.muted}
              value={newHolder} onChangeText={setNewHolder} />
            <TextInput style={inputStyle} placeholder="Bank name (e.g. State Bank of India)"
              placeholderTextColor={theme.muted}
              value={newBankName} onChangeText={setNewBankName} />
            <TextInput style={inputStyle} placeholder="Account number"
              placeholderTextColor={theme.muted} keyboardType="number-pad"
              value={newAccount} onChangeText={setNewAccount} />
            <TextInput style={inputStyle} placeholder="IFSC code"
              placeholderTextColor={theme.muted} autoCapitalize="characters"
              value={newIfsc} onChangeText={setNewIfsc} />

            <TouchableOpacity onPress={addBank}
              style={{backgroundColor: theme.primary, borderRadius: 12,
                paddingVertical: 14, alignItems: 'center', marginTop: 4}}>
              <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                Verify & Add Bank
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBankModal(false)}
              style={{paddingVertical: 14, alignItems: 'center'}}>
              <Text style={{color: theme.muted2, fontWeight: '700'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
