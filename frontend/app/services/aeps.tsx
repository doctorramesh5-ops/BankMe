import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { financialServices } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AEPSScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    aadhaar_number: '',
    mobile_number: '',
    bank_name: '',
    transaction_type: 'withdrawal',
    amount: '',
    biometric_device: 'mantra',
  });

  const banks = [
    'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank'
  ];

  const biometricDevices = [
    { label: 'Mantra MFS100', value: 'mantra' },
    { label: 'Morpho MSO1300', value: 'morpho' },
    { label: 'Startek FM220U', value: 'startek' },
    { label: 'Precision PB510', value: 'precision' },
    { label: 'Evolute Falcon', value: 'evolute' },
    { label: 'SecuGen Hamster', value: 'secugen' },
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!formData.aadhaar_number || formData.aadhaar_number.length !== 12) {
        Alert.alert('Error', 'Please enter valid 12-digit Aadhaar number');
        return;
      }
      if (!formData.mobile_number || formData.mobile_number.length !== 10) {
        Alert.alert('Error', 'Please enter valid 10-digit mobile number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.bank_name) {
        Alert.alert('Error', 'Please select a bank');
        return;
      }
      if (formData.transaction_type === 'withdrawal' && !formData.amount) {
        Alert.alert('Error', 'Please enter amount');
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
      const response = await financialServices.aeps({
        user_id: user!.id,
        aadhaar_number: formData.aadhaar_number,
        mobile_number: formData.mobile_number,
        bank_name: formData.bank_name,
        transaction_type: formData.transaction_type,
        amount: parseFloat(formData.amount) || 0,
        biometric_data: 'mock_biometric_data',
      });
      
      Alert.alert(
        'Success!',
        `AEPS ${formData.transaction_type} completed successfully!\n\nTransaction ID: ${response.transaction_id}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Transaction failed');
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
        <Text style={styles.headerTitle}>AEPS Service</Text>
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
            <Text style={styles.stepTitle}>Customer Details</Text>
            <Text style={styles.stepSubtitle}>Enter Aadhaar and mobile number</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 12-digit Aadhaar"
                value={formData.aadhaar_number}
                onChangeText={(text) => setFormData({ ...formData, aadhaar_number: text })}
                keyboardType="number-pad"
                maxLength={12}
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
              <Text style={styles.label}>Transaction Type</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transaction_type === 'withdrawal' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transaction_type: 'withdrawal' })}
                >
                  <Text style={[styles.radioText, formData.transaction_type === 'withdrawal' && styles.radioTextActive]}>
                    Cash Withdrawal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transaction_type === 'balance_inquiry' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transaction_type: 'balance_inquiry' })}
                >
                  <Text style={[styles.radioText, formData.transaction_type === 'balance_inquiry' && styles.radioTextActive]}>
                    Balance Inquiry
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Bank & Amount</Text>
            <Text style={styles.stepSubtitle}>Select bank and enter amount</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Bank</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bank_name}
                  onValueChange={(value) => setFormData({ ...formData, bank_name: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Bank" value="" />
                  {banks.map((bank) => (
                    <Picker.Item key={bank} label={bank} value={bank} />
                  ))}
                </Picker>
              </View>
            </View>

            {formData.transaction_type === 'withdrawal' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Biometric Authentication</Text>
            <Text style={styles.stepSubtitle}>Select device and capture fingerprint</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Biometric Device</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.biometric_device}
                  onValueChange={(value) => setFormData({ ...formData, biometric_device: value })}
                  style={styles.picker}
                >
                  {biometricDevices.map((device) => (
                    <Picker.Item key={device.value} label={device.label} value={device.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.biometricContainer}>
              <Ionicons name="finger-print" size={80} color="#6366F1" />
              <Text style={styles.biometricText}>Place finger on device</Text>
              <Text style={styles.biometricSubtext}>Using {biometricDevices.find(d => d.value === formData.biometric_device)?.label}</Text>
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Transaction Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>{formData.transaction_type.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bank:</Text>
                <Text style={styles.summaryValue}>{formData.bank_name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Aadhaar:</Text>
                <Text style={styles.summaryValue}>XXXX XXXX {formData.aadhaar_number.slice(-4)}</Text>
              </View>
              {formData.amount && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={[styles.summaryValue, styles.amountText]}>₹{formData.amount}</Text>
                </View>
              )}
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
            {loading ? 'Processing...' : step === 3 ? 'Submit' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#6366F1',
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  radioText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  biometricContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  biometricText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  biometricSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  amountText: {
    fontSize: 18,
    color: '#10B981',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6366F1',
    flex: 0.48,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6366F1',
    flex: 0.48,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
});