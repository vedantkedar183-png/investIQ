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

export default function AIInsightsScreen({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      const res = await mobileApi.getAIRecommendations();
      if (res && res.recommendations) setRecommendations(res.recommendations);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>AI INTELLIGENCE</Text>
          <Text style={styles.title}>Market News Signals</Text>
          <Text style={styles.subTitle}>AI sentiment analysis and growth catalysts</Text>
        </View>

        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
          renderItem={({ item }) => {
            const isBullish = item.sentiment === 'BULLISH';
            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <Text style={styles.symbolBadge}>{item.symbol}</Text>
                  <Text
                    style={[
                      styles.sentimentBadge,
                      { backgroundColor: isBullish ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isBullish ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {item.sentiment} ({item.confidenceScore}%)
                  </Text>
                </View>

                <Text style={styles.headlineText}>{item.headline}</Text>
                <Text style={styles.sourceText}>{item.source} • {item.publishedAt}</Text>

                <View style={styles.reasonsBox}>
                  {(item.reasoning || []).map((r, i) => (
                    <Text key={i} style={styles.reasonItem}>• {r}</Text>
                  ))}
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.targetText}>Target: {item.targetPrice} ({item.targetHorizon})</Text>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })}
                  >
                    <Text style={styles.actionBtnText}>Trade {item.symbol}</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  header: { marginBottom: 16 },
  badge: { color: '#818CF8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  subTitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  symbolBadge: { color: '#3B82F6', fontWeight: '900', fontSize: 13, backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sentimentBadge: { fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  headlineText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  sourceText: { color: '#64748B', fontSize: 11, marginTop: 4, marginBottom: 8 },
  reasonsBox: { backgroundColor: '#090D16', padding: 10, borderRadius: 12, marginBottom: 12 },
  reasonItem: { color: '#94A3B8', fontSize: 11, marginBottom: 4, lineHeight: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  actionBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
