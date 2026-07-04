import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
  TextInput, Modal, FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeContext';
import {BBPS_CATEGORIES, BBPS_BILLERS, BBPSCategory} from '../../data/bbpsData';

// ── Simulated bill (replace with real BBPS API later) ──
type Bill = {
  customerName: string;
  billNumber: string;
  dueDate: string;
  amount: number;
};

export default function BBPSScreen({navigation}: any) {
  const {theme} = useTheme();

  // ── Flow state: category → biller → consumer → bill → paid ──
  const [category, setCategory] = useState<BBPSCategory | null>(null);
  const [biller, setBiller] = useState<string>('');
  const [billerModal, setBillerModal] = useState(false);
  const [billerSearch, setBillerSearch] = useState('');
  const [consumer, setConsumer] = useState('');
  const [bill, setBill] = useState<Bill | null>(null);
  const [fetching, setFetching] = useState(false);
  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState(false);
  const [txnId] = useState('BBP' + Date.now().toString().slice(-8));

  const amountNum = parseInt(amount || '0', 10);

  // Billers for the chosen category, filtered by search text
  const billerList = category
    ? (BBPS_BILLERS[category.id] || []).filter(b =>
        !billerSearch || b.toLowerCase().includes(billerSearch.toLowerCase()))
    : [];

  const pickCategory = (c: BBPSCategory) => {
    setCategory(c);
    setBiller(''); setConsumer(''); setBill(null); setAmount(''); setPaid(false);
    setBillerModal(true);
  };

  const pickBiller = (b: string) => {
    setBiller(b);
    setBillerModal(false);
    setBillerSearch('');
  };

  // Simulated bill fetch — like the web's fetchBBPSBill()
  // TODO: replace with real BBPS API call
  const fetchBill = () => {
    if (consumer.trim().length < 6)
      return Alert.alert('Error', 'Enter a valid ' + (category?.hint || 'consumer number'));
    setFetching(true);
    setTimeout(() => {
      const fakeAmount = 300 + (parseInt(consumer.slice(-3), 10) || 200);
      const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setBill({
        customerName: 'Customer ' + consumer.slice(-4),
        billNumber: 'BILL' + consumer.slice(-6),
        dueDate: due.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}),
        amount: fakeAmount,
      });
      setAmount(String(fakeAmount));
      setFetching(false);
    }, 1200);
  };

  const payBill = () => {
    if (amountNum < 1) return Alert.alert('Error', 'Enter amount');
    // TODO: wallet balance check + real BBPS payment API
    setPaid(true);
  };

  const resetAll = () => {
    setCategory(null); setBiller(''); setConsumer('');
    setBill(null); setAmount(''); setPaid(false);
  };

  const card = {
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1,
    borderColor: theme.border, backgroundColor: theme.card,
    padding: 16, marginBottom: 16,
  } as const;
  const label = {
    fontSize: 12, fontWeight: '800' as const, color: theme.muted2,
    textTransform: 'uppercase' as const, marginBottom: 10,
  };
  const inputStyle = {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    color: theme.text, padding: 14, fontSize: 15,
    backgroundColor: theme.bg,
  } as const;

  // ══════════ SUCCESS INVOICE ══════════
  if (paid && bill && category) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
        <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
        <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 100,
          alignItems: 'center'}}>
          <View style={{width: 70, height: 70, borderRadius: 35,
            backgroundColor: theme.primary, alignItems: 'center',
            justifyContent: 'center', marginBottom: 8, marginTop: 8}}>
            <Text style={{fontSize: 32, fontWeight: '900', color: '#000'}}>B</Text>
          </View>
          <Text style={{fontSize: 18, fontWeight: '900', color: theme.text,
            letterSpacing: 1}}>BANK ME</Text>
          <Text style={{fontSize: 11, color: theme.muted2, marginBottom: 16}}>
            Powered by RTAI · Complete Fintech Platform
          </Text>

          <View style={{width: 80, height: 80, borderRadius: 40,
            backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center',
            justifyContent: 'center', marginBottom: 12}}>
            <Text style={{fontSize: 40}}>✅</Text>
          </View>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
            Bill Paid Successfully!
          </Text>
          <Text style={{fontSize: 32, fontWeight: '900', color: '#10b981', marginTop: 8}}>
            ₹{amountNum.toLocaleString('en-IN')}
          </Text>

          <View style={{backgroundColor: theme.card, borderRadius: 14,
            borderWidth: 1, borderColor: theme.border,
            padding: 16, width: '100%', marginTop: 20}}>
            {[
              ['Transaction ID', txnId],
              ['Category', category.icon + ' ' + category.label],
              ['Biller', biller],
              ['Consumer No.', consumer],
              ['Customer', bill.customerName],
              ['Bill No.', bill.billNumber],
              ['Due Date', bill.dueDate],
            ].map(([k, v]) => (
              <View key={k} style={{flexDirection: 'row',
                justifyContent: 'space-between', paddingVertical: 7}}>
                <Text style={{color: theme.muted2, fontSize: 13}}>{k}</Text>
                <Text style={{color: theme.text, fontSize: 13, fontWeight: '600',
                  flex: 1, textAlign: 'right', marginLeft: 12}} numberOfLines={1}>
                  {v}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={resetAll}
            style={{backgroundColor: theme.primary, borderRadius: 12,
              paddingVertical: 14, alignItems: 'center', marginTop: 20,
              width: '100%'}}>
            <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
              Pay Another Bill
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════ MAIN FLOW ══════════
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}
        keyboardShouldPersistTaps="handled">

        <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
            🧾 BBPS Bill Payment
          </Text>
          <Text style={{fontSize: 13, color: theme.muted2, marginTop: 2}}>
            NPCI Bharat BillPay · 22 categories
          </Text>
        </View>

        {/* ── STEP 1: Category grid ── */}
        <View style={card}>
          <Text style={label}>1 · Select Category</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', margin: -4}}>
            {BBPS_CATEGORIES.map(c => (
              <TouchableOpacity key={c.id} onPress={() => pickCategory(c)}
                style={{width: '25%', padding: 4}}>
                <View style={{borderRadius: 12, borderWidth: 1,
                  paddingVertical: 12, paddingHorizontal: 2, alignItems: 'center',
                  borderColor: category?.id === c.id ? c.color : theme.border,
                  backgroundColor: category?.id === c.id
                    ? c.color + '15' : theme.bg}}>
                  <Text style={{fontSize: 20, marginBottom: 4}}>{c.icon}</Text>
                  <Text numberOfLines={2} style={{fontSize: 9, fontWeight: '700',
                    textAlign: 'center',
                    color: category?.id === c.id ? c.color : theme.muted2}}>
                    {c.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── STEP 2: Chosen biller badge ── */}
        {category && biller !== '' && (
          <View style={card}>
            <Text style={label}>2 · Biller</Text>
            <TouchableOpacity onPress={() => setBillerModal(true)}
              style={{flexDirection: 'row', alignItems: 'center',
                backgroundColor: category.color + '12', borderWidth: 1,
                borderColor: category.color + '40', borderRadius: 12, padding: 14}}>
              <Text style={{fontSize: 18, marginRight: 10}}>{category.icon}</Text>
              <Text style={{flex: 1, color: theme.text, fontWeight: '700'}}>
                {biller}
              </Text>
              <Text style={{color: theme.muted2, fontSize: 12}}>Change ▾</Text>
            </TouchableOpacity>

            {/* ── STEP 3: Consumer number ── */}
            <Text style={[label, {marginTop: 16}]}>3 · {category.hint}</Text>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TextInput style={[inputStyle, {flex: 1}]}
                placeholder={'Enter ' + category.hint}
                placeholderTextColor={theme.muted}
                value={consumer} onChangeText={setConsumer} />
              <TouchableOpacity onPress={fetchBill} disabled={fetching}
                style={{backgroundColor: theme.primary, borderRadius: 12,
                  paddingHorizontal: 18, justifyContent: 'center'}}>
                <Text style={{color: '#000', fontWeight: '900', fontSize: 13}}>
                  {fetching ? '...' : 'Fetch Bill'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── STEP 4: Fetched bill card ── */}
            {bill && (
              <View style={{marginTop: 14, borderRadius: 12, borderWidth: 1,
                borderColor: 'rgba(16,185,129,0.35)',
                backgroundColor: 'rgba(16,185,129,0.08)', padding: 14}}>
                <Text style={{color: '#10b981', fontSize: 12, fontWeight: '800',
                  marginBottom: 8}}>✅ BILL FETCHED</Text>
                {[
                  ['Customer', bill.customerName],
                  ['Bill No.', bill.billNumber],
                  ['Due Date', bill.dueDate],
                ].map(([k, v]) => (
                  <View key={k} style={{flexDirection: 'row',
                    justifyContent: 'space-between', paddingVertical: 3}}>
                    <Text style={{color: theme.muted2, fontSize: 12}}>{k}</Text>
                    <Text style={{color: theme.text, fontSize: 12,
                      fontWeight: '600'}}>{v}</Text>
                  </View>
                ))}
                <View style={{flexDirection: 'row',
                  justifyContent: 'space-between', paddingVertical: 3}}>
                  <Text style={{color: theme.muted2, fontSize: 12}}>Bill Amount</Text>
                  <Text style={{color: '#10b981', fontSize: 16, fontWeight: '900'}}>
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            {/* ── STEP 5: Amount + Pay ── */}
            {bill && (
              <>
                <Text style={[label, {marginTop: 16}]}>4 · Amount to Pay</Text>
                <TextInput style={inputStyle} keyboardType="number-pad"
                  placeholder="Amount" placeholderTextColor={theme.muted}
                  value={amount} onChangeText={setAmount} />
                <TouchableOpacity onPress={payBill}
                  style={{backgroundColor: category.color, borderRadius: 12,
                    paddingVertical: 15, alignItems: 'center', marginTop: 12}}>
                  <Text style={{color: '#000', fontWeight: '900', fontSize: 15}}>
                    🧾 Pay ₹{amountNum ? amountNum.toLocaleString('en-IN') : '0'} →
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* ══════════ BILLER SEARCH MODAL ══════════ */}
      <Modal visible={billerModal} transparent animationType="slide"
        onRequestClose={() => setBillerModal(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end'}}>
          <View style={{backgroundColor: theme.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 20, paddingBottom: 30, maxHeight: '75%'}}>
            <Text style={{color: theme.text, fontSize: 16, fontWeight: '900',
              marginBottom: 12}}>
              {category?.icon} Select {category?.label} Biller
            </Text>
            <TextInput style={[inputStyle, {marginBottom: 10}]}
              placeholder="Search biller..." placeholderTextColor={theme.muted}
              value={billerSearch} onChangeText={setBillerSearch} autoFocus />
            <FlatList
              data={billerList}
              keyExtractor={b => b}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={{color: theme.muted2, textAlign: 'center',
                  paddingVertical: 20}}>
                  No billers found for "{billerSearch}"
                </Text>
              }
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => pickBiller(item)}
                  style={{paddingVertical: 13, borderBottomWidth: 1,
                    borderBottomColor: theme.border}}>
                  <Text style={{color: theme.text, fontSize: 14}}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setBillerModal(false)}
              style={{paddingVertical: 12, alignItems: 'center'}}>
              <Text style={{color: theme.muted2, fontWeight: '700'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
