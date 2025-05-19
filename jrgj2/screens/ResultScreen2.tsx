// ResultScreen2.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  ResultScreen2: {
    feedback: string;
    onRetry: () => void;
  };
};

type ResultScreen2RouteProp = RouteProp<RootStackParamList, 'ResultScreen2'>;

const ResultScreen2 = () => {
  const route = useRoute<ResultScreen2RouteProp>();
  const {feedback} = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>분석 결과</Text>
      <ScrollView style={styles.feedbackContainer}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // 배경 흰색
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black', // 글씨 검은색
    marginBottom: 20,
  },
  feedbackContainer: {
    backgroundColor: '#f0f0f0', // 회색 배경으로 가독성 개선
    padding: 16,
    borderRadius: 12,
    maxHeight: 300,
    width: '100%',
  },
  feedbackText: {
    fontSize: 16,
    color: 'black', // 글씨 검은색
    lineHeight: 24,
  },
});

export default ResultScreen2;