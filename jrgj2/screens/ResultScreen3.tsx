import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Platform } from 'react-native';

type RootStackParamList = {
  ResultScreen3: {
    sentence_result: string;
    onRetry: () => void;
  };
};

type ResultScreen3RouteProp = RouteProp<RootStackParamList, 'ResultScreen3'>;

type Props = {
  route: ResultScreen3RouteProp;
};

const ResultScreen3: React.FC<Props> = ({ route }) => {
  const { sentence_result, onRetry } = route.params;

  // ✅ 디버깅용 로그 출력
  useEffect(() => {
    console.log('[ResultScreen3] 전달받은 sentence_result:', sentence_result);

    if (!sentence_result || sentence_result.trim() === '') {
      Alert.alert('분석 결과 없음', '서버로부터 결과를 받지 못했습니다.');
    }
  }, [sentence_result]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>문장 발음 분석 결과</Text>

      <View style={styles.resultBox}>
        <Text style={styles.resultText}>
          {formatResult(sentence_result)}
        </Text>
      </View>

      <Button title="다시 시도" onPress={onRetry} />
    </ScrollView>
  );
};

const formatResult = (result: string) => {
  try {
    if (!result || result.trim() === '') {
      return '❗ 서버로부터 분석 결과가 전달되지 않았습니다.';
    }

    const parsed = JSON.parse(result);
    return JSON.stringify(parsed, null, 2); // pretty-print
  } catch {
    return result; // 그냥 문자열이라면 그대로
  }
};
    
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultBox: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default ResultScreen3;
