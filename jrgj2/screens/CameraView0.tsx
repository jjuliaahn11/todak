import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type ExerciseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CameraView0'>;

const actions = [
  '미소 짓기', '왼쪽으로 미소짓기', '오른쪽으로 미소짓기',
  '볼 부풀리기', '왼쪽으로 볼 부풀리기', '오른쪽으로 볼 부풀리기',
  '혀 끝 아래로 내리기', '혀 끝 왼쪽 아래로 내리기', '혀 끝 오른쪽 아래로 내리기',
  '혀 끝 위로 올리기', '혀 끝 왼쪽 위로 올리기', '혀 끝 오른쪽 위로 올리기'
];

const mouthImageMap: { [key: string]: any } = {
  '미소 짓기': require('./guides/미소짓기.png'),
  '왼쪽으로 미소짓기': require('./guides/왼쪽으로미소짓기.png'),
  '오른쪽으로 미소짓기': require('./guides/오른쪽으로미소짓기.png'),
  '볼 부풀리기': require('./guides/볼부풀리기.png'),
  '왼쪽으로 볼 부풀리기': require('./guides/왼쪽볼부풀리기.png'),
  '오른쪽으로 볼 부풀리기': require('./guides/오른쪽볼부풀리기.png'),
  '혀 끝 아래로 내리기': require('./guides/혀끝아래로내리기.png'),
  '혀 끝 왼쪽 아래로 내리기': require('./guides/혀끝왼쪽아래로내리기.png'),
  '혀 끝 오른쪽 아래로 내리기': require('./guides/혀끝오른쪽아래로내리기.png'),
  '혀 끝 위로 올리기': require('./guides/혀끝위로올리기.png'),
  '혀 끝 왼쪽 위로 올리기': require('./guides/혀끝왼쪽위로올리기.png'),
  '혀 끝 오른쪽 위로 올리기': require('./guides/혀끝오른쪽위로올리기.png'),
};

const ExerciseScreen = () => {
  const navigation = useNavigation<ExerciseScreenNavigationProp>();
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');

  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && countdown === 0) {
      setTimeout(() => {
        navigation.navigate('ResultScreen0', {
          onRetry: () => {
            setCountdown(5);
            setStarted(false);
          },
          onNext: () => {
            if (step + 1 < actions.length) {
              setStep(step + 1);
              setCountdown(5);
              setStarted(false);
            } else {
              Alert.alert('완료', '모든 연습이 끝났습니다.');
            }
          },
        });
      }, 1000);
    }
  }, [countdown, started]);

  if (!frontCamera) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white' }}>카메라 로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFillObject}
        device={frontCamera}
        isActive={true}
        video={true}
        audio={false}
      />

      {/* 👇 입모양 오버레이 이미지 */}
      <View pointerEvents="none" style={styles.mouthGuideOverlay}>
        <Image
          source={mouthImageMap[actions[step]]}
          style={{ width: '100%', height: '100%' }}
          resizeMode="contain"
        />
      </View>

      <View style={styles.overlay}>
        <Text style={styles.instruction}>
          {started
            ? `5초간 '${actions[step]}' 유지하세요\n남은 시간: ${countdown}s`
            : `'${actions[step]}' 동작을 시작하세요.`}
        </Text>
        {!started && (
          <TouchableOpacity style={styles.button} onPress={() => setStarted(true)}>
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 살짝 어둡게
  },
  mouthGuideOverlay: {
    position: 'absolute',
    top: '0%',
    left: '0%',
    right: '0%',
    height: 1200,
    zIndex: 10,
    opacity: 0.8,
  },
  instruction: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'green',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseScreen;