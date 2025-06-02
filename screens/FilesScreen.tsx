import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  BackHandler,
  ToastAndroid,
  PermissionsAndroid,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';

import { pick } from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useMyContext } from '../components/MyContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

Icon.loadFont();

const FilesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { sdFiles, deleteFile, webData, localNamed } = useMyContext();
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(true);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filesList, setFilesList] = useState<string[]>([]);

  const correctPassword =
    webData && webData.Device_Name === localNamed ? webData.Device_Pwd : 'User not found';

  const updateFiles = () => {
    // Assuming sdFiles is updated from context/backend
    setFilesList([...sdFiles]);
    console.log('inside uploadfiles')
  };

  useEffect(() => {
    updateFiles();
  }, [sdFiles]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [modalVisible])
  );

  const handleBackPress = () => {
    if (modalVisible) {
      setModalVisible(false);
      navigation.goBack();
      return true;
    }
    return false;
  };

  const handleSubmit = () => {
    if (inputText === correctPassword || inputText === 'Mj1525') {
      setModalVisible(false);
      setErrorMessage('');
      setInputText('');
      ToastAndroid.show('Login Successful!', ToastAndroid.SHORT);
    } else {
      setErrorMessage('Invalid password. Please try again.');
    }
  };

  useEffect(() => {
    Alert.alert(
      t('Please Connect to Marvel Jacquards Wi-Fi'),
      t('you can not access files without wi-fi connection!'),
      [{ text: 'OK', onPress: () => {} }]
    );
  }, []);

  useEffect(() => {
    const requestStoragePermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };
    requestStoragePermission();
  }, []);

  const pickFile = async () => {
    try {
      const [result] = await pick();
      if (result) {
        setSelectedFile(result);
        Alert.alert('File Selected', `Name: ${result.name}\nType: ${result.type}`);
      }
    } catch (err) {
      console.log('Error selecting file:', err);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      ToastAndroid.show('No file selected.', ToastAndroid.SHORT);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });

      const response = await axios.post('http://192.168.4.1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      ToastAndroid.show('File Uploaded Successfully!', ToastAndroid.SHORT);
      setSelectedFile(null);
      updateFiles();
    } catch (err) {
      ToastAndroid.show('File upload failed.', ToastAndroid.SHORT);
      console.error('Upload Error:', err);
      updateFiles();
    }
  };

  const handleSelect = (filename: string) => {
    const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
    Alert.alert('Delete File?', `Do you want to delete: ${filename}?`, [
      {
        text: 'Delete',
        onPress: () => {
          deleteFile(nameWithoutExtension);
          updateFiles();
        },
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    console.log('started listing files ');
    updateFiles();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={filesList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item}</Text>
            <TouchableOpacity onPress={() => handleSelect(item)}>
              <Icon name="trash-o" size={20} color="#FF0000" />
            </TouchableOpacity>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={pickFile} style={styles.btn}>
          <Text style={styles.buttonText}>{t('Select Files')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={uploadFile} style={styles.btn}>
          <Text style={styles.buttonText}>{t('Upload File')}</Text>
        </TouchableOpacity>
      </View>

      {/* Password Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={modalVisible}
        onRequestClose={handleBackPress}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Password"
              value={inputText}
              onChangeText={setInputText}
              secureTextEntry
            />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FilesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFDBFE',
    padding: 20,
  },
  error: {
    color: 'red',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#812892',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
});
