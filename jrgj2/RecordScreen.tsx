import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

type Record = {
  stage: number;
  accuracy: number;
  date: string;
  content: string;
};

const RecordScreen = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const saved = await AsyncStorage.getItem('practiceRecords');
        if (saved) {
          const parsed: Record[] = JSON.parse(saved);
          // 최신 날짜가 앞쪽에 오도록 내림차순 정렬
          parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecords(parsed);
        }
      } catch (e) {
        console.error('기록 불러오기 실패', e);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>기록을 불러오는 중...</Text>
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>기록 화면</Text>
        <Text style={styles.emptyText}>아직 훈련 기록이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>발음 훈련 기록</Text>
      <FlatList
        horizontal
        pagingEnabled
        data={records}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.recordBox}>
            <Text style={styles.recordStage}>{item.stage}단계</Text>
            <Text style={styles.recordContent}>"{item.content}"</Text>
            <Text style={styles.recordAccuracy}>정확도: {item.accuracy.toFixed(2)}%</Text>
            <Text style={styles.recordDate}>
              {new Date(item.date).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4C3',
    paddingTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4C3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 20,
    color: '#333',
  },
  recordBox: {
    backgroundColor: 'white',
    width: screenWidth * 0.8,
    marginRight: 20,
    borderRadius: 20,
    padding: 25,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  recordStage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  recordContent: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 12,
  },
  recordAccuracy: {
    fontSize: 18,
    marginBottom: 6,
    color: '#333',
  },
  recordDate: {
    fontSize: 14,
    color: 'gray',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginTop: 10,
  },
});

export default RecordScreen;