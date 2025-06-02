import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMyContext } from '../components/MyContext';
import SingleFile from './SingleFile';
import DoubleFile from './DoubleFile';

const HomeScreen: React.FC = () => {
  const {
    sdFiles,
    rpmValue,
    pCount,
    setPCount,
    pCount1,
    setPCount1,
    writeDoubleFileToSelect,
    writeTwoHeightToChange,
    f1height,
    f1width,
    f2height,
    f2width,
    prevFile,
    setPrevFile,
    nextFile,
    setNextFile,
    cardCount,
    cnCount,
    ttlHook,    
    bleNotifyValue, 
    setBleNotifyValue,
      } = useMyContext();
  // const [bleNotifyValue, setBleNotifyValue] = useState('2');
  
  // Load initial value from AsyncStorage (only if not set already)
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const stored = await AsyncStorage.getItem('screenName');
        console.log('Loaded from AsyncStorage:', stored);
        console.log(bleNotifyValue);
        // Only set the state if it's not already set (fallback to default if empty)
        if (stored === '1' || stored === '2') {
          setBleNotifyValue(stored);
        } else {
          setBleNotifyValue(null); // fallback
        }
      } catch (error) {
        console.error('Error loading value:', error);
      }
    };
    if (bleNotifyValue === null) {
      loadStoredValue();  // Load only when state is null
    }
  }, [bleNotifyValue]); // Dependency to avoid unnecessary re-loading

  // Save the value to AsyncStorage only when it changes and is valid
  useEffect(() => {
    const saveValue = async () => {
      try {
        if (bleNotifyValue === '1' || bleNotifyValue === '2') {
          await AsyncStorage.setItem('screenName', bleNotifyValue);
          console.log('Saved to AsyncStorage:', bleNotifyValue);
        }
      } catch (error) {
        console.error('Failed to save:', error);
      }
    };
    if (bleNotifyValue !== null) {
      saveValue();
    }
  }, [bleNotifyValue]); // Only save when bleNotifyValue changes

  // DEBUG: Print current value for debugging
  useEffect(() => {
    console.log('Current bleNotifyValue:', bleNotifyValue);
  }, [bleNotifyValue]);

  return (
    <View style={styles.container}>
      {bleNotifyValue === '1' ? (
        <SingleFile />
      ) : bleNotifyValue === '2' ? (
        <DoubleFile />
      ) : (
        <Text style={styles.loadingText}>Contact Marvel Jacquards Support Team..! </Text>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'gray',
  },
  debugText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'darkgray',
  },
});
