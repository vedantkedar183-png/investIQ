import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function ProfileScreen() {
  const [cashBalance, setCashBalance] = useState(125000);
  const [riskProfile, setRiskProfile] = useState('MODERATE');

  const handleReset = () => {
    Alert.alert('Reset Wallet', 'Reset simulated trading balance to ₹1,00,000?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          setCashBalance(100000);
          Alert.alert('Success', 'Wallet reset to ₹1,00,000');
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <View>
            <Text style={styles.name}>Aditya Sharma</Text>
            <Text style={styles.email}>aditya.sharma@investiq.com</Text>
            <Text style={styles.tierBadge}>Verified Pro Investor</Text>
          </View>
        </View>

        {/* Wallet Balance Box */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>SIMULATED WALLET BALANCE</Text>
          <Text style={styles.walletBalance}>₹{cashBalance.toLocaleString('en-IN')}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset to ₹1,00,000</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Appetite */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>RISK APPETITE</Text>
          <View style={styles.riskRow}>
            {['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.riskOption, riskProfile === r && styles.riskOptionActive]}
                onPress={() => setRiskProfile(r)}
              >
                <Text style={[styles.riskOptionText, riskProfile === r && styles.riskOptionTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Log Out of investIQ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090D16' },
  container: { flex: 1, padding: 16 },
  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  name: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  email: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  tierBadge: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  box: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  boxTitle: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  walletBalance: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  resetBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  resetBtnText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  riskRow: { flexDirection: 'row', gap: 8 },
  riskOption: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  riskOptionActive: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' },
  riskOptionText: { color: '#64748B', fontSize: 10, fontWeight: '800' },
  riskOptionTextActive: { color: '#60A5FA' },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '800' },
});
