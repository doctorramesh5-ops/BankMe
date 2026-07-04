import React, {useState, useMemo} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StatusBar, Modal, ScrollView,
  Share, Linking, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeContext';

// ── TYPES ─────────────────────────────────────────────
type TxnStatus = 'success' | 'pending' | 'failed';
type TimeKey = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

type Txn = {
  id: string;
  service: string;      // matches SERVICES id
  subType: string;      // matches sub-section id
  title: string;
  subtitle: string;
  amount: number;       // positive = in, negative = out, 0 = non-monetary
  status: TxnStatus;
  date: string;         // ISO date string
};

// ── SERVICES + SUB-SECTIONS ──────────────────────────
// Add new services here and they appear in filters automatically
const SERVICES: {id: string; icon: string; label: string; subs: {id: string; label: string}[]}[] = [
  {id: 'aeps', icon: '🫆', label: 'AEPS', subs: [
    {id: 'withdrawal', label: 'Withdrawal'},
    {id: 'balance', label: 'Balance Enquiry'},
    {id: 'ministmt', label: 'Mini Statement'},
  ]},
  {id: 'dmt', icon: '💸', label: 'DMT', subs: [
    {id: 'imps', label: 'IMPS'},
    {id: 'neft', label: 'NEFT'},
  ]},
  {id: 'bbps', icon: '🧾', label: 'BBPS', subs: [
    {id: 'electricity', label: 'Electricity'},
    {id: 'water', label: 'Water'},
    {id: 'gas', label: 'Gas'},
    {id: 'dth', label: 'DTH'},
  ]},
  {id: 'recharge', icon: '📱', label: 'Recharge', subs: [
    {id: 'prepaid', label: 'Prepaid'},
    {id: 'postpaid', label: 'Postpaid'},
  ]},
  {id: 'upi', icon: '🔗', label: 'UPI', subs: [
    {id: 'collect', label: 'Collect'},
    {id: 'pay', label: 'Pay'},
  ]},
  {id: 'wallet', icon: '👛', label: 'Wallet', subs: [
    {id: 'topup', label: 'Top-up'},
    {id: 'withdraw', label: 'Withdraw'},
    {id: 'commission', label: 'Commission'},
  ]},
];

// ── TIME FILTERS ─────────────────────────────────────
const TIME_FILTERS: {key: TimeKey; label: string}[] = [
  {key: 'day', label: 'Today'},
  {key: 'week', label: 'Week'},
  {key: 'month', label: 'Month'},
  {key: 'quarter', label: 'Quarter'},
  {key: 'year', label: 'Year'},
  {key: 'all', label: 'All Time'},
];

// How many days back each time filter covers
const TIME_DAYS: Record<TimeKey, number> = {
  day: 1, week: 7, month: 30, quarter: 90, year: 365, all: 99999,
};

// ── MOCK DATA (replace with API later) ────────────────
// TODO: fetch from backend API and store in Redux
const MOCK_TXNS: Txn[] = [
  {id: 'TXN90817263', service: 'aeps', subType: 'withdrawal', title: 'AEPS Cash Withdrawal', subtitle: 'Aadhaar ••••7191 · SBI', amount: -1000, status: 'success', date: '2026-07-04T09:15:00'},
  {id: 'DMT81726354', service: 'dmt', subType: 'imps', title: 'Money Transfer', subtitle: 'To Suresh Kumar · IMPS', amount: -2500, status: 'success', date: '2026-07-04T08:40:00'},
  {id: 'WLT71625344', service: 'wallet', subType: 'topup', title: 'Wallet Top-up', subtitle: 'Via UPI', amount: 5000, status: 'success', date: '2026-07-03T18:22:00'},
  {id: 'AEP61524334', service: 'aeps', subType: 'balance', title: 'AEPS Balance Enquiry', subtitle: 'Aadhaar ••••7191 · HDFC', amount: 0, status: 'success', date: '2026-07-03T15:05:00'},
  {id: 'DMT51423324', service: 'dmt', subType: 'imps', title: 'Money Transfer', subtitle: 'To Priya Sharma · IMPS', amount: -1200, status: 'pending', date: '2026-07-03T12:30:00'},
  {id: 'BBP41322314', service: 'bbps', subType: 'electricity', title: 'Electricity Bill', subtitle: 'TNEB · Consumer 88213', amount: -860, status: 'success', date: '2026-07-02T19:45:00'},
  {id: 'DMT31221304', service: 'dmt', subType: 'neft', title: 'Money Transfer', subtitle: 'To Arun Raj · NEFT', amount: -3000, status: 'failed', date: '2026-07-02T11:10:00'},
  {id: 'AEP21120294', service: 'aeps', subType: 'withdrawal', title: 'AEPS Cash Withdrawal', subtitle: 'Aadhaar ••••7191 · SBI', amount: -500, status: 'success', date: '2026-07-01T16:55:00'},
  {id: 'WLT11019284', service: 'wallet', subType: 'commission', title: 'Commission Credit', subtitle: 'AEPS commission', amount: 12, status: 'success', date: '2026-07-01T16:56:00'},
  {id: 'RCH01918274', service: 'recharge', subType: 'prepaid', title: 'Mobile Recharge', subtitle: 'Jio · 9944857191', amount: -299, status: 'success', date: '2026-06-30T10:20:00'},
  {id: 'UPI91817264', service: 'upi', subType: 'pay', title: 'UPI Payment', subtitle: 'To merchant@okaxis', amount: -450, status: 'failed', date: '2026-06-28T14:12:00'},
  {id: 'AEP81716254', service: 'aeps', subType: 'ministmt', title: 'AEPS Mini Statement', subtitle: 'Aadhaar ••••7191 · SBI', amount: 0, status: 'success', date: '2026-06-15T09:30:00'},
  {id: 'BBP71615244', service: 'bbps', subType: 'dth', title: 'DTH Recharge', subtitle: 'Tata Play · 40012345', amount: -350, status: 'success', date: '2026-05-20T17:00:00'},
  {id: 'DMT61514234', service: 'dmt', subType: 'imps', title: 'Money Transfer', subtitle: 'To Kavitha M · IMPS', amount: -8000, status: 'success', date: '2026-03-11T13:25:00'},
  {id: 'WLT51413224', service: 'wallet', subType: 'withdraw', title: 'Wallet Withdrawal', subtitle: 'To bank ••••4321', amount: -2000, status: 'failed', date: '2025-12-05T10:00:00'},
];

// ── HELPERS ───────────────────────────────────────────
const STATUS_META: Record<TxnStatus, {color: string; label: string}> = {
  success: {color: '#10b981', label: 'SUCCESS'},
  pending: {color: '#f59e0b', label: 'PENDING'},
  failed: {color: '#ef4444', label: 'FAILED'},
};

function serviceMeta(id: string) {
  return SERVICES.find(s => s.id === id) || {icon: '💳', label: id.toUpperCase(), subs: []};
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}) +
    ' · ' +
    d.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', hour12: true});
}

function formatAmount(n: number): string {
  if (n === 0) return '—';
  const sign = n > 0 ? '+' : '-';
  return sign + '₹' + Math.abs(n).toLocaleString('en-IN');
}

// Amount color: failed = red, money-in = green, money-out = normal text
function amountColor(t: Txn, fallback: string): string {
  if (t.status === 'failed') return '#ef4444';
  if (t.amount > 0) return '#10b981';
  return fallback;
}

// Is this transaction within the selected time window?
function inTimeWindow(t: Txn, time: TimeKey): boolean {
  const days = TIME_DAYS[time];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(t.date).getTime() >= cutoff;
}

export default function HistoryScreen({navigation}: any) {
  const {theme} = useTheme();

  // ── Three filter states ──
  const [service, setService] = useState<string>('all');
  const [subType, setSubType] = useState<string>('all');
  const [time, setTime] = useState<TimeKey>('all');
  const [selected, setSelected] = useState<Txn | null>(null);

  // Sub-sections belong to the chosen service
  const currentSubs = service === 'all' ? [] : serviceMeta(service).subs;

  // ── The three-stage filter ──
  const filtered = useMemo(() =>
    MOCK_TXNS
      .filter(t => service === 'all' || t.service === service)
      .filter(t => subType === 'all' || t.subType === subType)
      .filter(t => inTimeWindow(t, time)),
  [service, subType, time]);

  // Summary of what's on screen
  const totalOut = filtered.filter(t => t.amount < 0 && t.status === 'success')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIn = filtered.filter(t => t.amount > 0 && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  // Choosing a new service resets the sub-filter
  const pickService = (id: string) => {
    setService(id);
    setSubType('all');
  };

  // ── Build a readable text version of a transaction ──
  const txnText = (t: Txn): string =>
    'BankMe Transaction Receipt\n' +
    '──────────────────\n' +
    'Txn ID: ' + t.id + '\n' +
    'Service: ' + serviceMeta(t.service).label + ' (' + t.subType.toUpperCase() + ')\n' +
    'Details: ' + t.subtitle + '\n' +
    'Amount: ' + formatAmount(t.amount) + '\n' +
    'Status: ' + STATUS_META[t.status].label + '\n' +
    'Date: ' + formatDate(t.date) + '\n' +
    '──────────────────\n' +
    'BankMe · PayPe Technologies · bankme.co.in';

  // ── Share transaction (WhatsApp, SMS, anywhere) ──
  const shareTxn = async (t: Txn) => {
    try {
      await Share.share({message: txnText(t), title: 'BankMe Transaction ' + t.id});
    } catch {
      Alert.alert('Error', 'Could not open share menu');
    }
  };

  // ── Raise complaint: opens email app with details pre-filled ──
  const complainTxn = async (t: Txn) => {
    const subject = 'Complaint: Transaction ' + t.id;
    const body =
      'Dear BankMe Support,\n\n' +
      'I want to raise a complaint about this transaction:\n\n' +
      txnText(t) +
      '\n\nIssue description:\n(please describe your issue here)\n\n' +
      'Registered mobile: \nThank you.';
    // encodeURIComponent converts spaces/newlines into URL-safe codes
    const url = 'mailto:support@bankme.co.in' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No email app', 'Please install an email app to send complaints, or write to support@bankme.co.in');
    }
  };

  // ── One row of the list ──
  const renderTxn = ({item}: {item: Txn}) => {
    const svc = serviceMeta(item.service);
    const sm = STATUS_META[item.status];
    return (
      <TouchableOpacity onPress={() => setSelected(item)}
        style={{flexDirection: 'row', alignItems: 'center',
          backgroundColor: theme.card, borderRadius: 14,
          borderWidth: 1,
          borderColor: item.status === 'failed' ? 'rgba(239,68,68,0.35)' : theme.border,
          padding: 14, marginBottom: 10}}>

        <View style={{width: 44, height: 44, borderRadius: 22,
          backgroundColor: theme.primary + '15',
          alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
          <Text style={{fontSize: 20}}>{svc.icon}</Text>
        </View>

        <View style={{flex: 1, marginRight: 8}}>
          <Text numberOfLines={1}
            style={{color: theme.text, fontSize: 14, fontWeight: '700'}}>
            {item.title}
          </Text>
          <Text numberOfLines={1}
            style={{color: theme.muted2, fontSize: 12, marginTop: 2}}>
            {item.subtitle}
          </Text>
          <Text style={{color: theme.muted, fontSize: 11, marginTop: 2}}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={{alignItems: 'flex-end'}}>
          <Text style={{fontSize: 15, fontWeight: '900',
            color: amountColor(item, theme.text)}}>
            {formatAmount(item.amount)}
          </Text>
          <View style={{backgroundColor: sm.color + '20', borderRadius: 6,
            paddingHorizontal: 6, paddingVertical: 2, marginTop: 4}}>
            <Text style={{color: sm.color, fontSize: 9, fontWeight: '800'}}>
              {sm.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Reusable labeled filter box (card style, like the summary bar) ──
  const FilterBox = ({label, items, active, onPick}: {
    label: string;
    items: {key: string; label: string}[];
    active: string;
    onPick: (k: string) => void;
  }) => (
    <View style={{marginHorizontal: 20, marginBottom: 10,
      backgroundColor: theme.card, borderRadius: 12,
      borderWidth: 1, borderColor: theme.border,
      paddingVertical: 10}}>
      <Text style={{color: theme.muted2, fontSize: 11, fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: 0.5,
        paddingHorizontal: 14, marginBottom: 8}}>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 14, gap: 8,
          alignItems: 'center'}}>
        {items.map(it => (
          <TouchableOpacity key={it.key} onPress={() => onPick(it.key)}
            style={{paddingHorizontal: 14, height: 36,
              justifyContent: 'center',
              borderRadius: 100, borderWidth: 1,
              borderColor: active === it.key ? theme.primary : theme.border,
              backgroundColor: active === it.key ? theme.primary : theme.bg}}>
            <Text style={{fontSize: 12, fontWeight: '700',
              color: active === it.key ? '#000' : theme.muted2}}>
              {it.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />

      <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
        <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
          📊 Transaction History
        </Text>
      </View>
      {/* NOTE: filter boxes + summary render above; list scrolls below them */}

      {/* ── Box 1: Services ── */}
      <FilterBox
        label="Services"
        items={[{key: 'all', label: 'All'},
          ...SERVICES.map(s => ({key: s.id, label: s.icon + ' ' + s.label}))]}
        active={service}
        onPick={pickService}
      />

      {/* ── Box 2: Sub-services (only when a service is chosen) ── */}
      {currentSubs.length > 0 && (
        <FilterBox
          label={serviceMeta(service).label + ' Types'}
          items={[{key: 'all', label: 'All'},
            ...currentSubs.map(s => ({key: s.id, label: s.label}))]}
          active={subType}
          onPick={setSubType}
        />
      )}

      {/* ── Box 3: Time period ── */}
      <FilterBox
        label="Time Period"
        items={TIME_FILTERS.map(t => ({key: t.key, label: t.label}))}
        active={time}
        onPick={k => setTime(k as TimeKey)}
      />

      {/* ── Summary bar ── */}
      <View style={{flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
        backgroundColor: theme.card, borderRadius: 12, borderWidth: 1,
        borderColor: theme.border, padding: 12}}>
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={{color: '#10b981', fontSize: 15, fontWeight: '900'}}>
            +₹{totalIn.toLocaleString('en-IN')}
          </Text>
          <Text style={{color: theme.muted2, fontSize: 11}}>Money In</Text>
        </View>
        <View style={{width: 1, backgroundColor: theme.border}} />
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={{color: theme.text, fontSize: 15, fontWeight: '900'}}>
            -₹{totalOut.toLocaleString('en-IN')}
          </Text>
          <Text style={{color: theme.muted2, fontSize: 11}}>Money Out</Text>
        </View>
        <View style={{width: 1, backgroundColor: theme.border}} />
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={{color: theme.primary, fontSize: 15, fontWeight: '900'}}>
            {filtered.length}
          </Text>
          <Text style={{color: theme.muted2, fontSize: 11}}>Transactions</Text>
        </View>
      </View>

      {/* ── The transaction list ── */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        renderItem={renderTxn}
        contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{alignItems: 'center', marginTop: 40}}>
            <Text style={{fontSize: 40, marginBottom: 12}}>🗂️</Text>
            <Text style={{color: theme.text, fontWeight: '800', fontSize: 16}}>
              No transactions found
            </Text>
            <Text style={{color: theme.muted2, fontSize: 13, marginTop: 4,
              textAlign: 'center', paddingHorizontal: 40}}>
              Try a different service, sub-section, or time period.
            </Text>
          </View>
        }
      />

      {/* ── Detail modal ── */}
      <Modal visible={!!selected} transparent animationType="slide"
        onRequestClose={() => setSelected(null)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end'}}>
          <View style={{backgroundColor: theme.card,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: 40}}>
            {selected && (
              <>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <Text style={{fontSize: 36, marginBottom: 8}}>
                    {serviceMeta(selected.service).icon}
                  </Text>
                  <Text style={{color: theme.text, fontSize: 18, fontWeight: '900'}}>
                    {selected.title}
                  </Text>
                  <Text style={{fontSize: 28, fontWeight: '900', marginTop: 8,
                    color: amountColor(selected, theme.text)}}>
                    {formatAmount(selected.amount)}
                  </Text>
                  <View style={{backgroundColor: STATUS_META[selected.status].color + '20',
                    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8}}>
                    <Text style={{color: STATUS_META[selected.status].color,
                      fontSize: 12, fontWeight: '800'}}>
                      {STATUS_META[selected.status].label}
                    </Text>
                  </View>
                  {selected.status === 'failed' && (
                    <Text style={{color: theme.muted2, fontSize: 12, marginTop: 8,
                      textAlign: 'center'}}>
                      Amount will be refunded if debited. Contact support if not
                      received within 24 hours.
                    </Text>
                  )}
                </View>

                {[
                  ['Transaction ID', selected.id],
                  ['Service', serviceMeta(selected.service).label],
                  ['Type', selected.subType.toUpperCase()],
                  ['Details', selected.subtitle],
                  ['Date & Time', formatDate(selected.date)],
                ].map(([k, v]) => (
                  <View key={k} style={{flexDirection: 'row',
                    justifyContent: 'space-between', paddingVertical: 10,
                    borderBottomWidth: 1, borderBottomColor: theme.border}}>
                    <Text style={{color: theme.muted2, fontSize: 13}}>{k}</Text>
                    <Text style={{color: theme.text, fontSize: 13, fontWeight: '600',
                      flex: 1, textAlign: 'right', marginLeft: 12}}
                      numberOfLines={1}>
                      {v}
                    </Text>
                  </View>
                ))}

                {/* ── Share + Complaint actions ── */}
                <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
                  <TouchableOpacity onPress={() => shareTxn(selected)}
                    style={{flex: 1, backgroundColor: theme.primary, borderRadius: 12,
                      paddingVertical: 14, alignItems: 'center'}}>
                    <Text style={{color: '#000', fontWeight: '900', fontSize: 14}}>
                      📤 Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => complainTxn(selected)}
                    style={{flex: 1, backgroundColor: 'rgba(239,68,68,0.12)',
                      borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
                      borderRadius: 12, paddingVertical: 14, alignItems: 'center'}}>
                    <Text style={{color: '#ef4444', fontWeight: '900', fontSize: 14}}>
                      📧 Raise Complaint
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setSelected(null)}
                  style={{backgroundColor: theme.card, borderWidth: 1,
                    borderColor: theme.border, borderRadius: 12,
                    paddingVertical: 14, alignItems: 'center', marginTop: 10}}>
                  <Text style={{color: theme.text, fontWeight: '800', fontSize: 15}}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
