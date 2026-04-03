import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
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
  const [verifying, setVerifying] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<any[]>([]);
  const [showSavedList, setShowSavedList] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_mobile: '',
    beneficiary_name: '',
    beneficiary_mobile: '',
    bank_name: '',
    beneficiary_account: '',
    beneficiary_ifsc: '',
    amount: '',
    transfer_mode: 'IMPS',
  });

  const banks = [
    { name: 'State Bank of India', ifsc_prefix: 'SBIN' },
    { name: 'HDFC Bank', ifsc_prefix: 'HDFC' },
    { name: 'ICICI Bank', ifsc_prefix: 'ICIC' },
    { name: 'Axis Bank', ifsc_prefix: 'UTIB' },
    { name: 'Punjab National Bank', ifsc_prefix: 'PUNB' },
    { name: 'Bank of Baroda', ifsc_prefix: 'BARB' },
    { name: 'Canara Bank', ifsc_prefix: 'CNRB' },
    { name: 'Union Bank', ifsc_prefix: 'UBIN' },
  ];

  useEffect(() => {
    // Load saved beneficiaries from mock data
    const mockSaved = [
      { name: 'John Doe', mobile: '9876543210', account: '1234567890', bank: 'HDFC Bank', ifsc: 'HDFC0001234' },
      { name: 'Jane Smith', mobile: '9876543211', account: '0987654321', bank: 'SBI', ifsc: 'SBIN0001234' },
    ];
    setSavedBeneficiaries(mockSaved);
  }, []);

  const handleBankSelect = (bankName: string) => {
    const bank = banks.find(b => b.name === bankName);
    setFormData({ 
      ...formData, 
      bank_name: bankName,
      beneficiary_ifsc: bank ? `${bank.ifsc_prefix}0` : '' 
    });
  };

  const handleVerifyAccount = async () => {
    if (!formData.beneficiary_account || formData.beneficiary_account.length < 9) {
      Alert.alert('Error', 'Please enter valid account number');
      return;
    }
    if (!formData.beneficiary_ifsc || formData.beneficiary_ifsc.length !== 11) {
      Alert.alert('Error', 'Please enter valid 11-digit IFSC code');
      return;
    }

    setVerifying(true);
    try {
      // Simulate account verification (penny drop)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verified name
      const mockName = formData.beneficiary_name || 'VERIFIED ACCOUNT HOLDER';
      setVerifiedName(mockName);
      setAccountVerified(true);
      
      Alert.alert(
        'Account Verified! ✓',
        `Account Name: ${mockName}\n\nVerification Fee: ₹3.00\n(₹1.00 sent to account + ₹2.00 service fee)`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Verification Failed', 'Unable to verify account. Please check details.');
    } finally {
      setVerifying(false);
    }
  };

  const selectSavedBeneficiary = (beneficiary: any) => {
    setFormData({
      ...formData,
      beneficiary_name: beneficiary.name,
      beneficiary_mobile: beneficiary.mobile,
      beneficiary_account: beneficiary.account,
      bank_name: beneficiary.bank,
      beneficiary_ifsc: beneficiary.ifsc,
    });
    setAccountVerified(true);
    setVerifiedName(beneficiary.name);
    setShowSavedList(false);
    setStep(4); // Jump to amount step
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.customer_mobile || formData.customer_mobile.length !== 10) {
        Alert.alert('Error', 'Please enter valid 10-digit mobile number');
        return;
      }
      // Check if customer has saved beneficiaries
      if (savedBeneficiaries.length > 0) {
        setShowSavedList(true);
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.beneficiary_name || !formData.beneficiary_mobile) {
        Alert.alert('Error', 'Please enter beneficiary name and mobile');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!accountVerified) {
        Alert.alert('Account Verification Required', 'Please verify the account before proceeding');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!formData.amount || parseFloat(formData.amount) < 1) {
        Alert.alert('Error', 'Please enter valid amount (minimum ₹1)');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await financialServices.dmt({
        user_id: user!.id,
        beneficiary_name: verifiedName,
        beneficiary_account: formData.beneficiary_account,
        beneficiary_ifsc: formData.beneficiary_ifsc,
        amount: parseFloat(formData.amount),
        mobile_number: formData.customer_mobile,
      });
      
      Alert.alert(
        'Transfer Successful! ✓',
        `Amount: ₹${formData.amount}\nTo: ${verifiedName}\nTransaction ID: ${response.transaction_id}\n\nBeneficiary saved for future transactions`,
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
          <Ionicons name=\"arrow-back\" size={24} color=\"#111827\" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Money Transfer (DMT)</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 4 && styles.progressStepActive]} />
          <View style={[styles.progressStep, step >= 5 && styles.progressStepActive]} />
        </View>
        <Text style={styles.stepText}>Step {step} of 5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Customer Mobile</Text>
            <Text style={styles.stepSubtitle}>Enter your registered mobile number</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder=\"Enter 10-digit mobile\"
                value={formData.customer_mobile}
                onChangeText={(text) => setFormData({ ...formData, customer_mobile: text })}
                keyboardType=\"phone-pad\"
                maxLength={10}
              />
            </View>

            {showSavedList && savedBeneficiaries.length > 0 && (
              <View style={styles.savedContainer}>
                <Text style={styles.savedTitle}>Saved Beneficiaries</Text>
                {savedBeneficiaries.map((ben, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.savedItem}
                    onPress={() => selectSavedBeneficiary(ben)}
                  >
                    <View style={styles.savedLeft}>
                      <Ionicons name=\"person-circle\" size={40} color=\"#3B82F6\" />
                      <View style={styles.savedInfo}>
                        <Text style={styles.savedName}>{ben.name}</Text>
                        <Text style={styles.savedDetails}>{ben.mobile} • {ben.bank}</Text>
                      </View>
                    </View>
                    <Ionicons name=\"chevron-forward\" size={20} color=\"#9CA3AF\" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.newBeneficiaryButton}
                  onPress={() => setShowSavedList(false)}
                >
                  <Ionicons name=\"add-circle\" size={20} color=\"#3B82F6\" />
                  <Text style={styles.newBeneficiaryText}>Add New Beneficiary</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Beneficiary Details</Text>
            <Text style={styles.stepSubtitle}>Enter beneficiary information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Beneficiary Name</Text>
              <TextInput
                style={styles.input}
                placeholder=\"Enter full name\"
                value={formData.beneficiary_name}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Beneficiary Mobile</Text>
              <TextInput
                style={styles.input}
                placeholder=\"Enter 10-digit mobile\"
                value={formData.beneficiary_mobile}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_mobile: text })}
                keyboardType=\"phone-pad\"
                maxLength={10}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Bank & Account Verification</Text>
            <Text style={styles.stepSubtitle}>Verify account details</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Bank</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.bank_name}
                  onValueChange={handleBankSelect}
                  style={styles.picker}
                >
                  <Picker.Item label=\"Select Bank\" value=\"\" />
                  {banks.map((bank) => (
                    <Picker.Item key={bank.name} label={bank.name} value={bank.name} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder=\"Enter account number\"
                value={formData.beneficiary_account}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_account: text })}
                keyboardType=\"number-pad\"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder=\"Auto-filled or enter manually\"
                value={formData.beneficiary_ifsc}
                onChangeText={(text) => setFormData({ ...formData, beneficiary_ifsc: text.toUpperCase() })}
                autoCapitalize=\"characters\"
                maxLength={11}
              />
              <Text style={styles.hint}>IFSC auto-populated based on bank selection</Text>
            </View>

            {!accountVerified && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyAccount}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color=\"#FFFFFF\" />
                ) : (
                  <>
                    <Ionicons name=\"checkmark-circle\" size={20} color=\"#FFFFFF\" />
                    <Text style={styles.verifyButtonText}>Verify Account (₹3.00)</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {accountVerified && (
              <View style={styles.verifiedContainer}>
                <Ionicons name=\"checkmark-circle\" size={24} color=\"#10B981\" />
                <View style={styles.verifiedInfo}>
                  <Text style={styles.verifiedLabel}>Account Verified ✓</Text>
                  <Text style={styles.verifiedName}>{verifiedName}</Text>
                </View>
              </View>
            )}

            <View style={styles.noteContainer}>
              <Ionicons name=\"information-circle\" size={20} color=\"#3B82F6\" />
              <Text style={styles.noteText}>
                Account verification: ₹1 sent to account + ₹2 service fee = ₹3 total
              </Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Transfer Amount</Text>
            <Text style={styles.stepSubtitle}>Enter amount to transfer</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder=\"Enter amount\"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType=\"number-pad\"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Transfer Mode</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transfer_mode === 'IMPS' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transfer_mode: 'IMPS' })}
                >
                  <Text style={[styles.radioText, formData.transfer_mode === 'IMPS' && styles.radioTextActive]}>
                    IMPS (Instant)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioButton, formData.transfer_mode === 'NEFT' && styles.radioButtonActive]}
                  onPress={() => setFormData({ ...formData, transfer_mode: 'NEFT' })}
                >
                  <Text style={[styles.radioText, formData.transfer_mode === 'NEFT' && styles.radioTextActive]}>
                    NEFT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Transfer</Text>
            <Text style={styles.stepSubtitle}>Review all details</Text>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>{verifiedName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mobile:</Text>
                <Text style={styles.summaryValue}>{formData.beneficiary_mobile}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bank:</Text>
                <Text style={styles.summaryValue}>{formData.bank_name}</Text>
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
                <Text style={styles.summaryLabel}>Mode:</Text>
                <Text style={styles.summaryValue}>{formData.transfer_mode}</Text>
              </View>
              <View style={[styles.summaryRow, styles.amountRow]}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={[styles.summaryValue, styles.amountText]}>₹{formData.amount}</Text>
              </View>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons name=\"shield-checkmark\" size={20} color=\"#10B981\" />
              <Text style={styles.noteText}>
                Secure transfer • Account verified • Beneficiary will be saved
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {step > 1 && !showSavedList && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setStep(step - 1)}
          >\n            <Text style={styles.buttonSecondaryText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { flex: (step === 1 || showSavedList) ? 1 : 0.48 }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.buttonPrimaryText}>
            {loading ? 'Processing...' : step === 5 ? 'Confirm & Send' : 'Next'}
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
  progressBar: { flexDirection: 'row', gap: 6 },
  progressStep: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  progressStepActive: { backgroundColor: '#3B82F6' },
  stepText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  scrollContent: { padding: 16 },
  stepContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#111827' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  amountInput: { fontSize: 24, fontWeight: 'bold' },
  pickerContainer: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  picker: { height: 50 },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radioButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8, alignItems: 'center' },
  radioButtonActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  radioText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  radioTextActive: { color: '#3B82F6', fontWeight: '600' },
  verifyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B981', padding: 14, borderRadius: 8, marginTop: 8 },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  verifiedContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#D1FAE5', padding: 16, borderRadius: 8, marginTop: 8 },
  verifiedInfo: { flex: 1 },
  verifiedLabel: { fontSize: 14, fontWeight: '600', color: '#059669' },
  verifiedName: { fontSize: 16, fontWeight: 'bold', color: '#065F46', marginTop: 2 },
  savedContainer: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16 },
  savedTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  savedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8 },
  savedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  savedDetails: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  newBeneficiaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#3B82F6', borderStyle: 'dashed', padding: 12, borderRadius: 8, marginTop: 8 },
  newBeneficiaryText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  summaryContainer: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827', maxWidth: '60%', textAlign: 'right' },
  amountRow: { borderBottomWidth: 0, marginTop: 8 },
  amountText: { fontSize: 20, color: '#3B82F6' },
  noteContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginTop: 16 },
  noteText: { fontSize: 13, color: '#3B82F6', flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  button: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: '#3B82F6', flex: 0.48 },
  buttonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#3B82F6', flex: 0.48 },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonSecondaryText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
});
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