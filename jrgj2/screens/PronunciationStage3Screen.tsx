// screens/PronunciationStage3Screen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CameraView2 from './CameraView2'; // CameraView 컴포넌트 import (경로 확인!)

const PronunciationStage3Screen = () => {
  return (
    <View style={styles.container}>
      <CameraView2 />
      {/* 여기에 3단계 발음 훈련 관련 UI 추가 (선택 사항) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PronunciationStage3Screen;