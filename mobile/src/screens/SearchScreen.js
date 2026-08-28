import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { mobileApi } from '../services/api';

const TABS = ['ALL', 'STOCK', 'MUTUAL_FUND', 'FD', 'BOND'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (selectedTab !== 'ALL') params.type = selectedTab;

      const res = await mobileApi.searchAssets(params);
      if (res && res.results) setResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [query, selectedTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search Stocks, Funds, FDs..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
        />

        {/* Tab Switcher */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'MUTUAL_FUND' ? 'Funds' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isProfit = (item.changePercent || 0) >= 0;
            const price = item.currentPrice || item.nav || 0;

            return (
              <TouchableOpacity
                style={styles.assetCard}
                onPress={() => {
                  if (item.type === 'STOCK') {
                    navigation.navigate('StockDetail', { symbol: item.symbol });
                  }
                }}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.typeBadge}>{item.type}</Text>
                    {item.riskLevel && (
                      <Text style={styles.riskBadge}>{item.riskLevel} RISK</Text>
                    )}
                  </View>
                  <Text style={styles.assetName}>{item.name}</Text>
                  <Text style={styles.assetSymbol}>{item.symbol} • {item.sector || item.category}</Text>
                </View>

                <View style={styles.cardRight}>
                  {price > 0 && <Text style={styles.assetPrice}>₹{price.toLocaleString('en-IN')}</Text>}
                  {item.changePercent !== undefined && (
                    <Text style={[styles.assetChange, { color: isProfit ? '#10B981' : '#EF4444' }]}>
                      {isProfit ? '+' : ''}{item.changePercent}%
                    </Text>
                  )}
                  {item.interestRate && (
                    <Text style={styles.rateText}>{item.interestRate}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090D16' },
  container: { flex: 1, padding: 16 },
  searchInput: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    fontSize: 14,
    marginBottom: 12,
  },
  tabsRow: { flexDirection: 'row', gap: 6, marginBottom: 16, flexWrap: 'wrap' },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabButtonActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  tabText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },
  assetCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flex: 1, marginRight: 10 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  typeBadge: {
    backgroundColor: '#1E293B',
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assetName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  assetSymbol: { color: '#64748B', fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  assetPrice: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  assetChange: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  rateText: { color: '#10B981', fontSize: 14, fontWeight: '800' },
});
