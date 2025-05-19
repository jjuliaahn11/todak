// frontend/CameraViewSyllable.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Linking, TextInput,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  CameraViewSyllable: undefined;
  ResultScreen2: { feedback: string; onRetry: () => void };
};
type Nav = NavigationProp<RootStackParamList, 'CameraViewSyllable'>;

const CameraViewSyllable = () => {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const frontCamera = devices.find((d) => d.position === 'front');

  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [initials, setInitials] = useState('');
  const [selectedWord, setSelectedWord] = useState('');

  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const checkPermissions = async () => {
      const camStatus = await Camera.getCameraPermissionStatus();
      const micStatus = await Camera.getMicrophonePermissionStatus();
      if (camStatus !== 'granted') await Camera.requestCameraPermission();
      if (micStatus !== 'granted') await Camera.requestMicrophonePermission();
      const finalCam = await Camera.getCameraPermissionStatus();
      const finalMic = await Camera.getMicrophonePermissionStatus();
      setHasPermission(finalCam === 'granted' && finalMic === 'granted');
      setPermissionChecked(true);
    };
    checkPermissions();
  }, []);

  const fetchWord = async () => {
    try {
      const res = await axios.post('http://172.20.0.174:8000/get_word', { initials });
      setSelectedWord(res.data.word);
      Alert.alert('단어 선택됨', `단어: ${res.data.word}`);
} catch (err: any) {
  Alert.alert('단어 선택 실패', err?.response?.data?.error || '에러 발생');
}
  };

  const uploadAndAnalyze = useCallback(async (videoUri: string) => {
    try {
      await axios.post('http://172.20.0.174:8000/signal', { signal: 3 });
      const fileName = `syllable_${Date.now()}.mp4`;
      const targetPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      await RNFS.copyFile(videoUri, targetPath);
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${targetPath}` : targetPath,
        name: fileName,
        type: 'video/mp4',
      } as any);
      formData.append('user_text', selectedWord);
      const res = await axios.post('http://192.168.55.135:8000/upload_and_analyze_syllable', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.syllable_result) {
        await AsyncStorage.setItem('last_result', res.data.syllable_result);
        navigation.navigate('ResultScreen2', {
          feedback: res.data.syllable_result,
          onRetry: () => {
            setExerciseStarted(false);
            setInitials('');
            setSelectedWord('');
          },
        });
      }
    } catch (err: any) {
      Alert.alert('업로드 실패', err.message || '서버 오류');
    }
  }, [selectedWord, navigation]);

  const startRecording = useCallback(async () => {
    if (!cameraReady || !selectedWord) {
      return Alert.alert('단어를 먼저 선택해주세요.');
    }
    setIsRecording(true);
    await cameraRef.current?.startRecording({
      onRecordingFinished: async (video) => {
        setIsRecording(false);
        await uploadAndAnalyze(video.path);
      },
      onRecordingError: (err) => {
        setIsRecording(false);
        Alert.alert('녹화 실패', err.message);
      },
    });
  }, [cameraReady, selectedWord, uploadAndAnalyze]);

  const stopRecording = useCallback(async () => {
    await cameraRef.current?.stopRecording();
    setIsRecording(false);
  }, []);

  if (!permissionChecked) {
    return <View><Text>권한 확인 중...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {!exerciseStarted ? (
        <View style={styles.center}>
          <Text style={styles.title}>초성을 입력하세요</Text>
          <TextInput
            style={styles.input}
            value={initials}
            onChangeText={setInitials}
            placeholder="예: ㄱㅇ"
          />
          <TouchableOpacity style={styles.button} onPress={fetchWord}>
            <Text style={styles.buttonText}>단어 선택</Text>
          </TouchableOpacity>
          {selectedWord !== '' && (
            <Text style={styles.word}>선택된 단어: {selectedWord}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={() => setExerciseStarted(true)}>
            <Text style={styles.buttonText}>녹화 시작</Text>
          </TouchableOpacity>
        </View>
      ) : (
        frontCamera && (
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              device={frontCamera}
              isActive
              video
              audio
              onInitialized={() => setCameraReady(true)}
            />
            <TouchableOpacity
  style={styles.recordButton}
  onPress={isRecording ? stopRecording : startRecording}
>
  <View
    style={[
      styles.recordButtonInner,
      isRecording && styles.recordButtonInnerRecording,
    ]}
  />
</TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  center: { alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: 'white', marginBottom: 10 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 8, width: '80%' },
  button: {
    marginTop: 10, padding: 10, backgroundColor: '#28a', borderRadius: 8,
  },
  buttonText: { color: 'white', fontSize: 16 },
  word: { color: 'white', fontSize: 18, marginTop: 10 },
  cameraContainer: { flex: 1 },
  camera: { ...StyleSheet.absoluteFillObject },
  recordButton: {
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 0, 0, 0.6)',
  position: 'absolute',
  bottom: 30,
  alignSelf: 'center',
},
recordButtonInner: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'red',
},
recordButtonInnerRecording: {
  width: 30,
  height: 30,
  borderRadius: 5,
  backgroundColor: 'red',
},

});

export default CameraViewSyllable;