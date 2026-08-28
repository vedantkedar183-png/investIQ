import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { mobileApi } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [portfolio, setPortfolio] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await mobileApi.getPortfolioSummary();
      if (res) setPortfolio(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isProfit = (portfolio?.totalPL || 0) >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
      >
        {/* Header Banner */}
        <View style={styles.header}>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.userNameText}>{portfolio?.userName || 'Aditya'}</Text>
        </View>

        {/* Portfolio Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>TOTAL NET WORTH</Text>
          <Text style={styles.netWorthText}>
            ₹{portfolio?.netWorth?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0.00'}
          </Text>

          <View style={styles.pnlRow}>
            <Text style={[styles.pnlText, { color: isProfit ? '#10B981' : '#EF4444' }]}>
              {isProfit ? '+' : ''}₹{portfolio?.totalPL?.toLocaleString('en-IN') || '0.00'} (
              {portfolio?.totalPLPercent?.toFixed(2) || '0.00'}%)
            </Text>
            <Text style={styles.subText}>All-time Returns</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.metricsRow}>
            <View>
              <Text style={styles.statLabel}>Available Cash</Text>
              <Text style={styles.statValue}>
                ₹{portfolio?.cashBalance?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Invested Value</Text>
              <Text style={styles.statValue}>
                ₹{portfolio?.totalInvested?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Holdings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portfolio Holdings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.sectionAction}>+ Trade New</Text>
          </TouchableOpacity>
        </View>

        {(portfolio?.holdings || []).map((h) => {
          const isHoldingProfit = h.totalPL >= 0;
          return (
            <TouchableOpacity
              key={h.id}
              style={styles.holdingCard}
              onPress={() => navigation.navigate('StockDetail', { symbol: h.assetSymbol })}
            >
              <View>
                <Text style={styles.holdingSymbol}>{h.assetSymbol}</Text>
                <Text style={styles.holdingName}>{h.assetName}</Text>
                <Text style={styles.holdingQty}>{h.quantity} Shares @ ₹{h.averageBuyPrice}</Text>
              </View>

              <View style={styles.holdingRight}>
                <Text style={styles.holdingCurrentPrice}>₹{h.currentPrice?.toLocaleString('en-IN')}</Text>
                <Text style={[styles.holdingPL, { color: isHoldingProfit ? '#10B981' : '#EF4444' }]}>
                  {isHoldingProfit ? '+' : ''}₹{h.totalPL} ({h.totalPLPercent}%)
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090D16' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 16 },
  greetingText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  userNameText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  cardLabel: { color: '#64748B', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  netWorthText: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 4 },
  pnlRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  pnlText: { fontSize: 13, fontWeight: '700' },
  subText: { color: '#64748B', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#94A3B8', fontSize: 11 },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  sectionAction: { color: '#3B82F6', fontSize: 13, fontWeight: '700' },
  holdingCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  holdingSymbol: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  holdingName: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  holdingQty: { color: '#64748B', fontSize: 11, marginTop: 4 },
  holdingRight: { alignItems: 'flex-end' },
  holdingCurrentPrice: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  holdingPL: { fontSize: 12, fontWeight: '700', marginTop: 2 },
});
