import { Image } from 'react-native';
import axios from 'axios';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  CameraView: undefined;
  ResultScreen: {
    accuracy: string;
    onRetry: () => void;
    onNext: () => void;
  };
};

type Nav = NavigationProp<RootStackParamList, 'CameraView'>;

const mouthImageMap: { [key: string]: any } = {
  '아': require('./guides/guide_a.png'),
  '이': require('./guides/guide_i.png'),
  '우': require('./guides/guide_u.png'),
  '에': require('./guides/guide_e.png'),
  '오': require('./guides/guide_o.png'),
};

const CameraView = () => {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');

  const [hasPermission, setHasPermission] = useState(false);
  const [checkedPermission, setCheckedPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [currentMouthIndex, setCurrentMouthIndex] = useState(0);

  const mouthSequence = ['아', '이', '우', '에', '오'];
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.getCameraPermissionStatus();
      const micStatus = await Camera.getMicrophonePermissionStatus();
      if (cameraStatus !== 'granted') await Camera.requestCameraPermission();
      if (micStatus !== 'granted') await Camera.requestMicrophonePermission();

      const finalCameraStatus = await Camera.getCameraPermissionStatus();
      const finalMicStatus = await Camera.getMicrophonePermissionStatus();
      setHasPermission(finalCameraStatus === 'granted' && finalMicStatus === 'granted');
      setCheckedPermission(true);
    })();
  }, []);

  const saveRecord = async (stage: number, accuracy: number, mouth: string) => {
    try {
      const now = new Date().toISOString();
      const newRecord = { stage, accuracy, content: mouth, date: now };
      const existing = await AsyncStorage.getItem('practiceRecords');
      const records = existing ? JSON.parse(existing) : [];
      records.push(newRecord);
      await AsyncStorage.setItem('practiceRecords', JSON.stringify(records));
    } catch (e) {
      console.error('기록 저장 실패:', e);
    }
  };

  const uploadAndAnalyzeVideo = useCallback(async (uri: string, mouth: string) => {
    try {
      await axios.post('http://172.20.0.174:8000/signal', { signal: 2 });
      const fileName = `video_${Date.now()}.mp4`;
      const targetPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.copyFile(uri, targetPath);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${targetPath}` : targetPath,
        type: 'video/mp4',
        name: fileName,
      } as any);
      formData.append('mouth', mouth);

      const response = await axios.post('http://172.20.0.174:8000/upload_and_analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.accuracy) {
        // ✅ 정확도 비선형 리매핑
        const rawScore = parseFloat(response.data.accuracy);
        let adjustedScore = rawScore * 1.2;
        if (adjustedScore > 100) adjustedScore = 100;
        adjustedScore = Math.round(adjustedScore);

        const currentMouth = mouthSequence[currentMouthIndex];

        // ✅ 보정된 정확도로 기록
        await saveRecord(2, adjustedScore, currentMouth);

        navigation.navigate('ResultScreen', {
          accuracy: adjustedScore.toString(),
          onRetry: () => {},
          onNext: () => {
            if (currentMouthIndex < mouthSequence.length - 1) {
              setCurrentMouthIndex((prev) => prev + 1);
            } else {
              Alert.alert('훈련 완료', '모든 입모양 연습이 끝났습니다!');
              setExerciseStarted(false);
              setCurrentMouthIndex(0);
            }
          },
        });
      } else if (response.data.error) {
        Alert.alert('분석 실패', response.data.error);
      }
    } catch (error: any) {
      Alert.alert('업로드/분석 실패', error.message);
    }
  }, [navigation, currentMouthIndex]);

  const startRecording = useCallback(async () => {
    if (!cameraReady) return Alert.alert('카메라 준비 중');
    if (!camera.current || isRecording) return;

    setIsRecording(true);
    await camera.current.startRecording({
      onRecordingFinished: async (video) => {
        setIsRecording(false);
        const currentMouth = mouthSequence[currentMouthIndex];
        await uploadAndAnalyzeVideo(video.path, currentMouth);
      },
      onRecordingError: (error) => {
        console.error('촬영 에러:', error);
        Alert.alert('촬영 에러', error.message || '알 수 없는 오류');
        setIsRecording(false);
      },
    });
  }, [cameraReady, isRecording, currentMouthIndex, uploadAndAnalyzeVideo]);

  const stopRecording = useCallback(async () => {
    if (!camera.current || !isRecording) return;
    await camera.current.stopRecording();
    setIsRecording(false);
  }, [camera, isRecording]);

  const renderMouthExercise = () => {
    if (!frontCamera) return null;
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={styles.camera}
          device={frontCamera}
          isActive={exerciseStarted}
          video={exerciseStarted}
          audio={false}
          onInitialized={() => setCameraReady(true)}
        />
        <View pointerEvents="none" style={styles.mouthGuideOverlay}>
          <Image
            source={mouthImageMap[mouthSequence[currentMouthIndex]]}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.overlayContainer}>
          <Text style={styles.exerciseTextOverlay}>
            '{mouthSequence[currentMouthIndex]}' 발음 연습
          </Text>
          <TouchableOpacity
            style={[
              styles.recordButtonOverlay,
              { backgroundColor: isRecording ? 'rgba(255,0,0,0.7)' : 'rgba(255,0,0,0.5)' },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerRecording]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!checkedPermission) return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionText}>권한 확인 중...</Text>
    </View>
  );

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>카메라 및 마이크 권한 필요</Text>
        <TouchableOpacity onPress={() => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()} style={styles.nextButton}>
          <Text style={styles.buttonText}>설정으로 이동</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!exerciseStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.instructionText}>입모양 훈련을 시작해보세요!</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setExerciseStarted(true)}>
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderMouthExercise()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { width: '100%', aspectRatio: 3 / 4, justifyContent: 'flex-end', alignItems: 'center' },
  camera: { ...StyleSheet.absoluteFillObject, transform: [{ scaleX: -1 }] },
  overlayContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  recordButtonOverlay: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  recordButtonInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'red' },
  recordButtonInnerRecording: { width: 30, height: 30, borderRadius: 5, backgroundColor: 'red' },
  exerciseTextOverlay: { fontSize: 20, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionText: { fontSize: 18, color: 'white', marginBottom: 20 },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionText: { fontSize: 22, color: 'white', marginBottom: 30 },
  startButton: { backgroundColor: 'green', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  nextButton: { backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginTop: 20 },
  buttonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  mouthGuideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.4,
    zIndex: 1,
  },
});

export default CameraView;