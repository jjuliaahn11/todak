import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen'>;

const ResultScreen = ({ route, navigation }: Props) => {
  const { accuracy, onRetry, onNext } = route.params;

  // 정확도는 이미 보정되어 전달됨 → 숫자 변환만 (정수로)
  const adjustedScore = Math.round(parseFloat(accuracy));

  // 피드백 메시지 결정
  let feedback = '';
  if (adjustedScore >= 90) {
    feedback = '훌륭합니다! 다음 단계로 넘어갈까요?';
  } else if (adjustedScore >= 70) {
    feedback = '잘했어요! 다음 단계로 가기 전에 한번만 더 해볼까요?';
  } else {
    feedback = '열심히 노력했네요! 발음을 완벽히 하기 위해 한번만 다시 해볼까요?';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>분석 결과</Text>
      <Text style={styles.accuracy}>정확도: {adjustedScore}%</Text>
      <Text style={styles.feedback}>{feedback}</Text>

      <TouchableOpacity style={styles.button} onPress={() => {
        navigation.goBack();
        onRetry();
      }}>
        <Text style={styles.buttonText}>다시 하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => {
        navigation.goBack();
        onNext();
      }}>
        <Text style={styles.buttonText}>다음 입모양</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  accuracy: { fontSize: 18, marginBottom: 40 },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: { color: 'white', fontSize: 16 },
  feedback: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginVertical: 20,
  },
});

export default ResultScreen;