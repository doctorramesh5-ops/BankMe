import React, {useState} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../theme/ThemeContext';

// ── ALL 14 SERVICES — exactly matching bankme.co.in web app ──
// Same ids, icons, colors, and categories as the web SERVICES array.
type Service = {
  id: string; name: string; icon: string; color: string;
  desc: string; cat: string;
  screen?: string;   // navigation target if the screen exists in the app
};

const SERVICES: Service[] = [
  {id: 'aeps',       name: 'AEPS',           icon: '👆', color: '#10b981', desc: 'Aadhaar Banking',     cat: 'banking',    screen: 'AEPS'},
  {id: 'upicashin',  name: 'UPI Cash In',    icon: '⬇️', color: '#10b981', desc: 'Collect UPI Payment', cat: 'banking',    screen: 'UPI'},
  {id: 'upicashout', name: 'UPI Cash Out',   icon: '⬆️', color: '#ef4444', desc: 'Send via UPI',        cat: 'banking',    screen: 'UPI'},
  {id: 'dmt',        name: 'Money Transfer', icon: '💸', color: '#3b82f6', desc: 'Domestic Transfer',   cat: 'banking',    screen: 'DMT'},
  {id: 'bbps',       name: 'Bill Pay',       icon: '🧾', color: '#f59e0b', desc: 'Utility Bills',       cat: 'banking',    screen: 'BBPS'},
  {id: 'erupee',     name: 'eRupee',         icon: '₹',  color: '#14b8a6', desc: 'Digital CBDC',        cat: 'banking',    screen: 'ERupee'},
  {id: 'demat',      name: 'Demat',          icon: '📈', color: '#8b5cf6', desc: 'Demat Account',       cat: 'investment'},
  {id: 'mutualfund', name: 'Mutual Fund',    icon: '📊', color: '#ec4899', desc: 'Invest in Funds',     cat: 'investment'},
  {id: 'train',      name: 'Train',          icon: '🚂', color: '#ef4444', desc: 'IRCTC Booking',       cat: 'travel'},
  {id: 'bus',        name: 'Bus',            icon: '🚌', color: '#8b5cf6', desc: 'RedBus Booking',      cat: 'travel'},
  {id: 'travel',     name: 'Travel',         icon: '✈️', color: '#6366f1', desc: 'Flights & Hotels',    cat: 'travel'},
  {id: 'pancard',    name: 'PAN Card',       icon: '🆔', color: '#f59e0b', desc: 'PAN Application',     cat: 'documents'},
  {id: 'insurance',  name: 'Insurance',      icon: '🛡️', color: '#06b6d4', desc: 'Health & Life',       cat: 'insurance'},
  {id: 'loan',       name: 'Loans',          icon: '🏦', color: '#10b981', desc: 'Personal & Business', cat: 'finance'},
];

// Category order + display names — same as the web renderServices()
const CATEGORIES: {id: string; label: string}[] = [
  {id: 'banking',    label: 'Banking & Payments'},
  {id: 'investment', label: 'Investment'},
  {id: 'travel',     label: 'Travel'},
  {id: 'documents',  label: 'Documents'},
  {id: 'insurance',  label: 'Insurance'},
  {id: 'finance',    label: 'Finance'},
];

export default function ServicesScreen({navigation}: any) {
  const {theme} = useTheme();

  const openService = (s: Service) => {
    if (s.screen) {
      // Screen exists in the app (AEPS, DMT) — navigate to it
      navigation.navigate(s.screen);
    } else {
      // TODO: build this service's screen (same as web modal flow)
      Alert.alert(
        s.icon + ' ' + s.name,
        s.desc + '\n\nThis service screen is coming soon in the app.\n' +
        'It is available on bankme.co.in web.',
      );
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>

        <View style={{paddingHorizontal: 20, paddingVertical: 16}}>
          <Text style={{fontSize: 22, fontWeight: '900', color: theme.text}}>
            ⚡ All Services
          </Text>
          <Text style={{fontSize: 13, color: theme.muted2, marginTop: 2}}>
            {SERVICES.length} services · All RTAI verified
          </Text>
        </View>

        {/* ── One section per category, like the web ── */}
        {CATEGORIES.map(cat => {
          const svcs = SERVICES.filter(s => s.cat === cat.id);
          if (svcs.length === 0) return null;
          return (
            <View key={cat.id} style={{marginBottom: 8}}>
              <Text style={{fontSize: 13, fontWeight: '800', color: theme.muted2,
                textTransform: 'uppercase', letterSpacing: 0.5,
                paddingHorizontal: 20, marginBottom: 10}}>
                {cat.label}
              </Text>

              {/* 3-column grid of service tiles */}
              <View style={{flexDirection: 'row', flexWrap: 'wrap',
                paddingHorizontal: 14, marginBottom: 8}}>
                {svcs.map(s => (
                  <TouchableOpacity key={s.id} onPress={() => openService(s)}
                    style={{width: '33.33%', padding: 6}}>
                    <View style={{backgroundColor: theme.card, borderRadius: 14,
                      borderWidth: 1, borderColor: s.color + '30',
                      paddingVertical: 16, paddingHorizontal: 8,
                      alignItems: 'center'}}>
                      <Text style={{fontSize: 26, marginBottom: 6}}>{s.icon}</Text>
                      <Text numberOfLines={1}
                        style={{fontSize: 12, fontWeight: '800', color: s.color}}>
                        {s.name}
                      </Text>
                      <Text numberOfLines={1}
                        style={{fontSize: 9, color: theme.muted2, marginTop: 2}}>
                        {s.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{alignItems: 'center', paddingVertical: 10}}>
          <Text style={{fontSize: 11, color: theme.muted}}>
            🛡️ Powered by RTAI · RBI Compliant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
