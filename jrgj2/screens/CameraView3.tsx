import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert,
  Platform, Linking, TextInput
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  CameraView3: undefined;
  ResultScreen3: {
    sentence_result: string;
    onRetry: () => void;
  };
};

type Nav = NavigationProp<RootStackParamList, 'CameraView3'>;

const CameraView3 = () => {
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');

  const [hasPermission, setHasPermission] = useState(false);
  const [checkedPermission, setCheckedPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [sentence, setSentence] = useState('');

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

  const savePracticeRecord = async (accuracy: number, content: string) => {
    try {
      const existingRecordsJson = await AsyncStorage.getItem('practiceRecords');
      let existingRecords = existingRecordsJson ? JSON.parse(existingRecordsJson) : [];
      existingRecords.push({
        stage: 4,
        accuracy,
        date: new Date().toISOString(),
        content,
      });
      await AsyncStorage.setItem('practiceRecords', JSON.stringify(existingRecords));
    } catch (e) {
      console.error('기록 저장 실패', e);
    }
  };

  const uploadAndAnalyze = useCallback(async (uri: string) => {
    try {
      await axios.post('http://172.20.0.174:8000/signal', { signal: 4 });

      const fileName = `sentence_${Date.now()}.mp4`;
      const targetPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.copyFile(uri, targetPath);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${targetPath}` : targetPath,
        type: 'video/mp4',
        name: fileName,
      } as any);
      formData.append('user_text', sentence);  // only user_text

      const response = await axios.post('http://172.20.0.174:8000/upload_and_analyze_sentence', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.message) {
  await savePracticeRecord(parseFloat(response.data.accuracy || '0'), sentence);

  navigation.navigate('ResultScreen3', {
    sentence_result: response.data.message,
    onRetry: () => {
      setExerciseStarted(false);
      setSentence('');
    },
  });
}
    else if (response.data.error) {
        Alert.alert('분석 실패', response.data.error);
      }
    } catch (error: any) {
      Alert.alert('업로드/분석 실패', error.message);
    }
  }, [sentence, navigation]);

  const startRecording = useCallback(async () => {
    if (!cameraReady) return Alert.alert('카메라 준비 중');
    if (!camera.current || isRecording) return;

    setIsRecording(true);
    await camera.current.startRecording({
      onRecordingFinished: async (video) => {
        setIsRecording(false);
        await uploadAndAnalyze(video.path);
      },
      onRecordingError: (error) => {
        console.error('촬영 에러:', error);
        Alert.alert('촬영 에러', error.message || '알 수 없는 오류');
        setIsRecording(false);
      },
    });
  }, [cameraReady, isRecording, uploadAndAnalyze]);

  const stopRecording = useCallback(async () => {
    if (!camera.current || !isRecording) return;
    await camera.current.stopRecording();
    setIsRecording(false);
  }, [camera, isRecording]);

  if (!checkedPermission) return <View style={styles.permissionContainer}><Text style={styles.permissionText}>권한 확인 중...</Text></View>;
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
          <Text style={styles.instructionText}>문장 전체 발음 훈련을 시작해보세요!</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => setExerciseStarted(true)}>
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        </View>
      ) : (
        frontCamera && (
          <View style={styles.cameraContainer}>
            <Camera
              ref={camera}
              style={styles.camera}
              device={frontCamera}
              isActive={exerciseStarted}
              video={exerciseStarted}
              audio={true}
              onInitialized={() => setCameraReady(true)}
            />
            <View style={styles.overlayContainer}>
              <Text style={styles.exerciseTextOverlay}>문장을 입력하고 녹음하세요</Text>

              <TextInput
                style={styles.input}
                placeholder="문장을 입력하세요"
                value={sentence}
                onChangeText={setSentence}
              />
              <TouchableOpacity
                style={[
                  styles.recordButtonOverlay,
                  { backgroundColor: isRecording ? 'rgba(255,0,0,0.7)' : 'rgba(255,0,0,0.5)' }
                ]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerRecording]} />
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { width: '100%', aspectRatio: 3 / 4, justifyContent: 'flex-end', alignItems: 'center' },
  camera: { ...StyleSheet.absoluteFillObject, transform: [{ scaleX: -1 }] },
  overlayContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  recordButtonOverlay: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  recordButtonInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'red' },
  recordButtonInnerRecording: { width: 30, height: 30, borderRadius: 5, backgroundColor: 'red' },
  exerciseTextOverlay: { fontSize: 20, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 5, marginBottom: 10 },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionText: { fontSize: 18, color: 'white', marginBottom: 20 },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructionText: { fontSize: 22, color: 'white', marginBottom: 30 },
  startButton: { backgroundColor: 'green', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  nextButton: { backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, marginTop: 20 },
  buttonText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  input: {
    backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 8, width: '90%', fontSize: 16,
  },
});

export default CameraView3;