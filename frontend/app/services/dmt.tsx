import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { financialServices } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function DMTScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    beneficiary_account: '',
    beneficiary_ifsc: '',
    mobile_number: '',
    amount: '',
    transfer_mode: 'IMPS',
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.beneficiary_name || !formData.beneficiary_account || !formData.beneficiary_ifsc) {
        Alert.alert('Error', 'Please fill all beneficiary details');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.amount || !formData.mobile_number) {
        Alert.alert('Error', 'Please enter amount and mobile number');
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
      const response = await financialServices.dmt({
        user_id: user!.id,
        beneficiary_name: formData.beneficiary_name,
        beneficiary_account: formData.beneficiary_account,
        beneficiary_ifsc: formData.beneficiary_ifsc,
        amount: parseFloat(formData.amount),
        mobile_number: formData.mobile_number,
      });
      
      Alert.alert(
        'Success!',
        `Money transfer completed!\n\nTransaction ID: ${response.transaction_id}\nAmount: ₹${formData.amount}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Transfer failed');
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
        <Text style={styles.headerTitle}>Money Transfer (DMT)</Text>
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
            <Text style={styles.stepTitle}>Beneficiary Details</Text>
            <Text style={styles.stepSubtitle}>Enter recipient information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Beneficiary Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.beneficiary_name}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                value={formData.beneficiary_account}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_account: text })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., HDFC0001234"
                value={formData.beneficiary_ifsc}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_ifsc: text.toUpperCase() })}
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Transfer Details</Text>
            <Text style={styles.stepSubtitle}>Enter amount and mobile number</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Transfer Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile"
                value={formData.mobile_number}
                onChangeText={(text) => setFormData({ ...formData, mobile_number: text })}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Transfer Mode</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transfer_mode === 'IMPS' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transfer_mode: 'IMPS' })}
                >
                  <Text style={[styles.radioText, formData.transfer_mode === 'IMPS' && styles.radioTextActive]}>IMPS (Instant)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transfer_mode === 'NEFT' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transfer_mode: 'NEFT' })}
                >
                  <Text style={[styles.radioText, formData.transfer_mode === 'NEFT' && styles.radioTextActive]}>NEFT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Transfer</Text>
            <Text style={styles.stepSubtitle}>Review and confirm details</Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>{formData.beneficiary_name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Account:</Text>
                <Text style={styles.summaryValue}>{formData.beneficiary_account}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>IFSC:</Text>
                <Text style={styles.summaryValue}>{formData.beneficiary_ifsc}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mobile:</Text>
                <Text style={styles.summaryValue}>{formData.mobile_number}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode:</Text>
                <Text style={styles.summaryValue}>{formData.transfer_mode}</Text>
              </View>
              <View style={[styles.summaryRow, styles.amountRow]}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={[styles.summaryValue, styles.amountText]}>₹{formData.amount}</Text>
              </View>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons name="information-circle" size={20} color="#6366F1" />
              <Text style={styles.noteText}>Please verify all details before confirming</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { flex: step === 1 ? 1 : 0.48 }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonPrimaryText}>
            {loading ? 'Processing...' : step === 3 ? 'Confirm & Send' : 'Next'}
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
  progressStepActive: { backgroundColor: '#3B82F6' },
  stepText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  scrollContent: { padding: 16 },
  stepContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8, alignItems: 'center' },
  radioButtonActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  radioText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  radioTextActive: { color: '#3B82F6', fontWeight: '600' },
  summaryContainer: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  amountRow: { borderBottomWidth: 0, marginTop: 8 },
  amountText: { fontSize: 20, color: '#3B82F6' },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', padding: 12, borderRadius: 8, marginTop: 16 },
  noteText: { fontSize: 13, color: '#6366F1', flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  button: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: '#3B82F6', flex: 0.48 },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#3B82F6', flex: 0.48 },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonSecondaryText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
});