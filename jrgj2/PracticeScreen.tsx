// PracticeScreen.tsx (메인 화면)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Main: undefined;
  PronunciationStages: undefined;
  Stage1: undefined;
  Stage2: undefined;
  Stage3: undefined;
  Stage4: undefined;
  Record: undefined;
};

const PracticeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePronunciationTrainingPress = () => {
    navigation.navigate('PronunciationStages');
  };

  const handleRecordingPress = () => {
    navigation.navigate('Record'); // RecordScreen으로 이동
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메인 화면</Text>
      <TouchableOpacity style={styles.pronunciationButton} onPress={handlePronunciationTrainingPress}>
        <Text style={styles.buttonText}>발음 훈련</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.recordButton} onPress={handleRecordingPress}>
        <Text style={styles.buttonText}>기록</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0', // 메인 화면 배경색 (원하시면 변경)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  pronunciationButton: {
    backgroundColor: '#007bff', // 발음 훈련 버튼 파란색
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#007bff', // 기록 버튼 파란색
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PracticeScreen;