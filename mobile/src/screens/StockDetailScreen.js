import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { mobileApi } from '../services/api';

export default function StockDetailScreen({ route, navigation }) {
  const { symbol } = route.params || { symbol: 'RELIANCE' };
  const [asset, setAsset] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    try {
      const [res, wl] = await Promise.all([
        mobileApi.getAssetDetails(symbol),
        mobileApi.getWatchlist().catch(() => ({ items: [] })),
      ]);

      if (res && res.asset) setAsset(res.asset);
      if (wl && wl.items) {
        setIsStarred(wl.items.some((i) => i.symbol === symbol));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [symbol]);

  const handleToggleWatchlist = async () => {
    try {
      const res = await mobileApi.toggleWatchlist(symbol);
      if (res) setIsStarred(res.isBookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrade = async (type) => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      const res = await mobileApi.executeTrade({
        symbol,
        type,
        quantity: qty,
      });

      if (res && res.success) {
        Alert.alert('Success', res.message);
        loadDetails();
      }
    } catch (err) {
      Alert.alert('Trade Error', err.message || 'Execution failed');
    }
  };

  if (!asset) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading {symbol}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isProfit = (asset.changePercent || 0) >= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetSub}>{asset.symbol} • {asset.sector || 'NSE'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.starButton, isStarred && styles.starButtonActive]}
            onPress={handleToggleWatchlist}
          >
            <Text style={[styles.starText, isStarred && styles.starTextActive]}>
              {isStarred ? '★ In Watchlist' : '☆ Watchlist'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.priceText}>₹{asset.currentPrice?.toLocaleString('en-IN')}</Text>
          <Text style={[styles.changeText, { color: isProfit ? '#10B981' : '#EF4444' }]}>
            {isProfit ? '+' : ''}{asset.changePercent}% Today
          </Text>
        </View>

        {/* 52-Week Range */}
        {asset.low52Week && asset.high52Week && (
          <View style={styles.rangeBox}>
            <Text style={styles.sectionHeading}>52-WEEK PRICE RANGE</Text>
            <View style={styles.rangeLabels}>
              <Text style={styles.lowText}>52W Low: ₹{asset.low52Week}</Text>
              <Text style={styles.highText}>52W High: ₹{asset.high52Week}</Text>
            </View>
          </View>
        )}

        {/* Fundamental Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionHeading}>KEY FUNDAMENTALS</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statVal}>{asset.marketCap || 'N/A'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>P/E Ratio</Text>
            <Text style={styles.statVal}>{asset.peRatio || 'N/A'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Chart Pattern</Text>
            <Text style={[styles.statVal, { color: '#3B82F6' }]}>{asset.pattern || 'Consolidation'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Technical Signal</Text>
            <Text style={[styles.statVal, { color: '#10B981' }]}>{asset.technicalSignal || 'BUY'}</Text>
          </View>
        </View>

        {/* Order Execution Form */}
        <View style={styles.orderCard}>
          <Text style={styles.sectionHeading}>SIMULATED ORDER EXECUTION</Text>
          <Text style={styles.orderLabel}>Quantity (Shares)</Text>
          <TextInput
            style={styles.orderInput}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <View style={styles.orderButtonsRow}>
            <TouchableOpacity style={styles.buyButton} onPress={() => handleTrade('BUY')}>
              <Text style={styles.btnText}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellButton} onPress={() => handleTrade('SELL')}>
              <Text style={styles.btnText}>SELL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090D16' },
  container: { flex: 1, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  assetName: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  assetSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  starButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  starButtonActive: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' },
  starText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  starTextActive: { color: '#F59E0B' },
  priceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  priceText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
  changeText: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  rangeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionHeading: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  lowText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  highText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  statsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  statLabel: { color: '#94A3B8', fontSize: 13 },
  statVal: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  orderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  orderLabel: { color: '#94A3B8', fontSize: 12, marginBottom: 6 },
  orderInput: {
    backgroundColor: '#090D16',
    borderRadius: 12,
    color: '#FFFFFF',
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  orderButtonsRow: { flexDirection: 'row', gap: 12 },
  buyButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sellButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
