import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesScreen() {
  const services = [
    { id: 'aeps', name: 'AEPS', description: 'Cash withdrawal using Aadhaar', icon: 'finger-print', color: '#10B981' },
    { id: 'dmt', name: 'Money Transfer', description: 'Send money instantly', icon: 'send', color: '#3B82F6' },
    { id: 'bbps', name: 'Bill Payments', description: 'Pay all your bills', icon: 'receipt', color: '#F59E0B' },
    { id: 'demat', name: 'Demat Account', description: 'Open trading account', icon: 'trending-up', color: '#8B5CF6' },
    { id: 'mutual_fund', name: 'Mutual Funds', description: 'Invest in mutual funds', icon: 'analytics', color: '#EC4899' },
    { id: 'digital_rupee', name: 'Digital Rupee', description: 'CBDC transactions', icon: 'logo-bitcoin', color: '#14B8A6' },
    { id: 'pan_card', name: 'PAN Card', description: 'Apply for new PAN', icon: 'card-outline', color: '#F59E0B' },
    { id: 'irctc', name: 'Train Booking', description: 'Book train tickets', icon: 'train', color: '#EF4444' },
    { id: 'bus', name: 'Bus Booking', description: 'Book bus tickets', icon: 'bus', color: '#8B5CF6' },
    { id: 'travel', name: 'Travel Packages', description: 'Flights, hotels & more', icon: 'airplane', color: '#6366F1' },
  ];

  const handleServicePress = (service: any) => {
    Alert.alert(service.name, `${service.description}\n\nThis feature is in mock mode. UI screens coming soon!`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>All Services</Text>
        <Text style={styles.subtitle}>Choose a service to get started</Text>

        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServicePress(service)}
          >
            <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
              <Ionicons name={service.icon as any} size={32} color={service.color} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});