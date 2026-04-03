import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { financialServices } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function BBPSScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    biller_category: 'electricity',
    biller_id: '',
    consumer_number: '',
    amount: '',
    mobile: '',
  });

  const categories = [
    { label: 'Electricity', value: 'electricity' },
    { label: 'Water', value: 'water' },
    { label: 'Gas', value: 'gas' },
    { label: 'Mobile Postpaid', value: 'mobile_postpaid' },
    { label: 'DTH', value: 'dth' },
    { label: 'Broadband', value: 'broadband' },
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!formData.biller_id) {
        Alert.alert('Error', 'Please select a biller');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.consumer_number || !formData.amount) {
        Alert.alert('Error', 'Please fill all details');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await financialServices.bbps({
        user_id: user!.id,
        biller_id: formData.biller_id,
        consumer_number: formData.consumer_number,
        amount: parseFloat(formData.amount),
        biller_category: formData.biller_category,
      });
      
      Alert.alert(
        'Bill Paid!',
        `Payment successful!\n\nTransaction ID: ${response.transaction_id}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Payment (BBPS)</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]} />
        </View>
        <Text style={styles.stepText}>Step {step} of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Biller</Text>
            <Text style={styles.stepSubtitle}>Choose biller category and provider</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Biller Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.biller_category}
                  onValueChange={(value) => setFormData({ ...formData, biller_category: value })}
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Biller Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MSEB, Jio, Airtel"
                value={formData.biller_id}
                onChangeText={(text) => setFormData({ ...formData, biller_id: text })}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Bill Details</Text>
            <Text style={styles.stepSubtitle}>Enter consumer number and amount</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Consumer Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter consumer/account number"
                value={formData.consumer_number}
                onChangeText={(text) => setFormData({ ...formData, consumer_number: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bill Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="For receipt SMS"
                value={formData.mobile}
                onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Payment</Text>
            <Text style={styles.stepSubtitle}>Review and confirm</Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryValue}>{formData.biller_category.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Biller:</Text>
                <Text style={styles.summaryValue}>{formData.biller_id}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Consumer No:</Text>
                <Text style={styles.summaryValue}>{formData.consumer_number}</Text>
              </View>
              <View style={[styles.summaryRow, styles.amountRow]}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={[styles.summaryValue, styles.amountText]}>₹{formData.amount}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setStep(step - 1)}>
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { flex: step === 1 ? 1 : 0.48 }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonPrimaryText}>
            {loading ? 'Processing...' : step === 3 ? 'Pay Now' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  placeholder: { width: 40 },
  progressContainer: { padding: 16, backgroundColor: '#FFFFFF' },
  progressBar: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  progressStep: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  progressStepActive: { backgroundColor: '#F59E0B' },
  stepText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  scrollContent: { padding: 16 },
  stepContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  pickerContainer: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  picker: { height: 50 },
  summaryContainer: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amountRow: { borderBottomWidth: 0, marginTop: 8 },
  amountText: { fontSize: 20, color: '#F59E0B' },
  buttonContainer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  button: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: '#F59E0B', flex: 0.48 },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F59E0B', flex: 0.48 },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonSecondaryText: { color: '#F59E0B', fontSize: 16, fontWeight: '600' },
});