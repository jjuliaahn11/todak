// ResultScreen0.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ResultScreen0'>;

const ResultScreen0 = ({ route, navigation }: Props) => {
  const { onRetry, onNext } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>잘하셨습니다!</Text>
      <Text style={styles.subtitle}>다음으로 넘어갈까요?</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007bff' }]}
        onPress={() => {
          navigation.goBack();
          onNext();
        }}
      >
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6c757d' }]}
        onPress={() => {
          navigation.goBack();
          onRetry();
        }}
      >
        <Text style={styles.buttonText}>다시하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  title: { fontSize: 24, color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#ccc', marginBottom: 30 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonText: { color: 'white', fontSize: 16 },
});

export default ResultScreen0;