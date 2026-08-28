import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { mobileApi } from '../services/api';

export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadWatchlist = async () => {
    try {
      const res = await mobileApi.getWatchlist();
      if (res) setWatchlist(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  };

  const handleRemove = async (symbol) => {
    try {
      await mobileApi.toggleWatchlist(symbol);
      loadWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Watchlist</Text>
          <Text style={styles.countText}>{watchlist?.count || 0} Saved Assets</Text>
        </View>

        <FlatList
          data={watchlist?.items || []}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
          renderItem={({ item }) => {
            const isProfit = (item.changePercent || 0) >= 0;
            const price = item.currentPrice || item.nav || 0;

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  if (item.type === 'STOCK') {
                    navigation.navigate('StockDetail', { symbol: item.symbol });
                  }
                }}
              >
                <View>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
                </View>

                <View style={styles.rightSection}>
                  <Text style={styles.priceText}>₹{price.toLocaleString('en-IN')}</Text>
                  <Text style={[styles.changeText, { color: isProfit ? '#10B981' : '#EF4444' }]}>
                    {isProfit ? '+' : ''}{item.changePercent}%
                  </Text>
                  <TouchableOpacity onPress={() => handleRemove(item.symbol)}>
                    <Text style={styles.removeAction}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Watchlist is empty</Text>
              <Text style={styles.emptySub}>Add assets from the search screen</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#090D16' },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  countText: { color: '#64748B', fontSize: 12, marginTop: 2 },
  card: {
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
  symbolText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  nameText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  rightSection: { alignItems: 'flex-end' },
  priceText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  changeText: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  removeAction: { color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 4 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
