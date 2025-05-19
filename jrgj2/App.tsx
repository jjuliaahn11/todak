// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from './PracticeScreen';
import PronunciationStagesScreen from './screens/PronunciationStagesScreen';
import PronunciationStage1Screen from './screens/PronunciationStage1Screen';
import PronunciationStage2Screen from './screens/PronunciationStage2Screen';
import PronunciationStage3Screen from './screens/PronunciationStage3Screen';
import PronunciationStage4Screen from './screens/PronunciationStage4Screen';
import RecordScreen from './RecordScreen'; // 변경된 import 경로
import CameraView from './screens/CameraView';
import ResultScreen from './screens/ResultScreen';
import ResultScreen2 from './screens/ResultScreen2';
import CameraView0 from './screens/CameraView0';
import ResultScreen0 from './screens/ResultScreen0';
import ResultScreen3 from './screens/ResultScreen3';
import CameraView3 from './screens/CameraView3';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={PracticeScreen} options={{ title: '메인' }} />
        <Stack.Screen name="PronunciationStages" component={PronunciationStagesScreen} options={{ title: '발음 훈련' }} />
        <Stack.Screen name="Stage1" component={PronunciationStage1Screen} options={{ title: '발음 훈련 1단계' }} />
        <Stack.Screen name="Stage2" component={PronunciationStage2Screen} options={{ title: '발음 훈련 2단계' }} />
        <Stack.Screen name="Stage3" component={PronunciationStage3Screen} options={{ title: '발음 훈련 3단계' }} />
        <Stack.Screen name="Stage4" component={PronunciationStage4Screen} options={{ title: '발음 훈련 4단계' }} />
        <Stack.Screen name="Record" component={RecordScreen} options={{ title: '기록' }} />
        <Stack.Screen name="CameraView" component={CameraView} options={{ title: '카메라' }} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: '결과' }} />
        <Stack.Screen name="ResultScreen2" component={ResultScreen2} />
        <Stack.Screen name="CameraView0" component = {CameraView0}/>
        <Stack.Screen name="ResultScreen0" component={ResultScreen0} options={{ title: '결과' }}/>
        <Stack.Screen name="CameraView3" component={CameraView3} />
        <Stack.Screen name="ResultScreen3" component={ResultScreen3} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export type RootStackParamList = {
  Main: undefined;
  PronunciationStages: undefined;
  Stage1: undefined;
  Stage2: undefined;
  Stage3: undefined;
  Stage4: undefined;
  Record: undefined;
  CameraView: undefined;
  ResultScreen: {
    accuracy: string;
    onRetry: () => void;
    onNext: () => void;
  
  };
  ResultScreen2: {
    accuracy: string;
    onRetry: () => void;
    onNext: () => void;
  };
  CameraView0: undefined;
  ResultScreen0: {
    onRetry: () => void;
    onNext: () => void;
  };
  CameraView3: undefined;
  ResultScreen3: {
  sentence_result: string;
  onRetry: () => void;
  }
};

export default App;