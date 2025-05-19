// screens/PronunciationStage4Screen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CameraView3 from './CameraView3'; // CameraView 컴포넌트 import (경로 확인!)

const PronunciationStage4Screen = () => {
  return (
    <View style={styles.container}>
      <CameraView3 />
      {/* 여기에 4단계 발음 훈련 관련 UI 추가 (선택 사항) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PronunciationStage4Screen;