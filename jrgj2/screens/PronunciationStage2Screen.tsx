// screens/PronunciationStage1Screen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CameraView from './CameraView';// CameraView 컴포넌트 import (경로 확인!)

const PronunciationStage1Screen = () => {
  return (
    <View style={styles.container}>
      <CameraView />
      {/* 여기에 1단계 발음 훈련 관련 UI 추가 (선택 사항) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PronunciationStage1Screen;