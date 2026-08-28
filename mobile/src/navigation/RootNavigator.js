import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import StockDetailScreen from '../screens/StockDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#090D16' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: '#090D16' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ route }) => ({
          title: route.params?.symbol || 'Stock Details',
          headerBackTitleVisible: false,
        })}
      />
    </Stack.Navigator>
  );
}
