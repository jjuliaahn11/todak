// screens/PronunciationStagesScreen.tsx
import axios from 'axios';
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
};

const PronunciationStagesScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleStagePress = (stage: number) => {
    navigation.navigate(`Stage${stage}` as keyof RootStackParamList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>발음 훈련 단계 선택</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleStagePress(1)}>
        <Text style={styles.buttonText}>1단계</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleStagePress(2)}>
        <Text style={styles.buttonText}>2단계</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleStagePress(3)}>
        <Text style={styles.buttonText}>3단계</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleStagePress(4)}>
        <Text style={styles.buttonText}>4단계</Text>
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
    backgroundColor: '#e0f7fa', // 발음 훈련 단계 선택 화면 배경색 (원하시면 변경)
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007bff',
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

export default PronunciationStagesScreen;