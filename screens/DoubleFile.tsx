import React, {useState,useEffect, useCallback} from 'react';
import {
    SafeAreaView,
    Image,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal ,
    Animated, 
    Easing,
    RefreshControl,
    PermissionsAndroid, 
    Platform,
    Alert,
    ToastAndroid,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useMyContext} from '../components/MyContext';
import {ScrollView} from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next'; // Hook to access translation
import '../services/i18n';

const DoubleFile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  // const [fileName, setFileName] = useState(''); // State for file name input
  const [borderImageUri, setBorderImageUri] = useState<string | null>(null);
  const [borderImageError, setBorderImageError] = useState(false);
  const [bodyImageUri, setBodyImageUri] = useState<string | null>(null);
  const [bodyImageError, setBodyImageError] = useState(false);

  const [loading, setLoading] = useState(false); // To track the loading state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  
 
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
    
  } = useMyContext();

  useEffect(() => {
      // Ensure re-render when language changes
      console.log('Home Screen Current language:', i18n.language);
    }, [i18n.language]);

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
        },[]);

// Function to handle the refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true); // Start refreshing
    console.log("Refreshing with file:", prevFile); // Log the file name being passed to getFile  
    getFile(prevFile, nextFile);
    
    // Simulating an API call or refresh operation
    setTimeout(() => {
        setIsRefreshing(false); // Stop refreshing after 2 seconds
    }, 2000);
}, [prevFile, nextFile]); // Ensure it refreshes with the latest prevFile value

  const submitPCount = () => {
    const pCountValue = String(pCount);
    const pCount1Value = String(pCount1);
    // const pCountTValue = pCountValue+"/"+pCount1Value;
    // Alert.alert("Counter Values Written to ESP32", `pCount: ${pCount}\npCount1: ${pCount1}`);
    writeTwoHeightToChange(pCountValue, pCount1Value);
    //  setInputValue('');
  };

  const handleAdd = () => {

    // --- pcount ---
    const total = parseInt(pCount)+parseInt(inputValue);

    const updatedPcount = total > f1width ? total - f1width : total;
    // Alert.alert(String(updatedPcount), "Pick 1 to Run From");
     setPCount(updatedPcount);

    // // --- pcount1 ---
    const total1 = parseInt(pCount1)+parseInt(inputValue);
    const updatedPcount1 = total1 > f2width ? total1 - f2width : total1;
    // Alert.alert(String(updatedPcount1), "Pick 2 to Run From");
     setPCount1(updatedPcount1);
      setInputValue('');
  };

  const handleMinus = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    // --- pcount ---
   // --- Counter 1 Minus ---
   if (val <= pCount) {
    const total = parseInt(pCount)-parseInt(inputValue);
    // Alert.alert(String(total), "Pick 1 to Run From minus");
     setPCount(total);
  } else {
    const deficit1 = val - pCount;
    // Alert.alert(String(deficit1), "deficit1 1 to Run From minus");
    const newPcount = f1width - deficit1;
    // Alert.alert(String(newPcount), "newPcount 1 to Run From minus");
    setPCount(newPcount >= 0 ? newPcount : 0);
  }

  // --- Counter 2 Minus ---
  if (val <= pCount1) {
    // Alert.alert(String(pCount1), "Pick 2 to Run From minus");
     setPCount1(pCount1 - val);
  } else {
    const deficit2 = val - pCount1;
    // Alert.alert(String(deficit2), "deficit21 to Run From minus");
    const newPcount1 = f2width - deficit2;
    // Alert.alert(String(newPcount1), "newPcount1 to Run From minus");
    setPCount1(newPcount1 >= 0 ? newPcount1 : 0);
  }
   setInputValue('');
  };


  const handleInputChange = (value) => {
    const numValue = value.replace(/[^0-9]/g,'');
    setPCount(numValue); // Update the state with the new input

  };
  const handleInputChange2 = (value) => {
    const numValue = value.replace(/[^0-9]/g,'');
    setPCount1(numValue); // Update the state with the new input

  };

  const handleIncrement = () => {
   
    setPCount(prev => {
      const next = prev + 1;
      return next > f1width ? 1 : next;
    });
  
    setPCount1(prev => {
      const next = prev + 1;
      return next > f2width ? 1 : next;
    });

    // setPCount(prevHeight => {
    //   const incrementedHeight = prevHeight === f1height ? 1 : prevHeight + 1;
    //   return incrementedHeight; // Return the new height for body state update
    // });
  
    // setPCount1(prevHeight => {
    //   const incrementedHeight = prevHeight === f2height ? 1 : prevHeight + 1;
    //   return incrementedHeight; // Return the new height for border state update
    // });
  };

  const handleDecrement = () => {

    setPCount(prev => {
      const next = prev - 1;
      return next < 1 ? f1width : next;
    });
  
    setPCount1(prev => {
      const next = prev - 1;
      return next < 1 ? f2width : next;
    });

    // const minValue = 1;
    // setPCount(prevHeight => {
    //   const incrementedHeight = prevHeight === minValue ? f1height : prevHeight - 1;
    //   return incrementedHeight; // Return the new height for body state update
    // });
  
    // setPCount1(prevHeight => {
    //   const incrementedHeight = prevHeight === minValue ? f2height : prevHeight - 1;
    //   return incrementedHeight; // Return the new height for border state update
    // });
  };


  


  const handleBodyFile = value => {
    setPrevFile(value);
    console.log(value);
 };
 
 const handleBorderFile = value => {
  setNextFile(value);
  console.log(value);
};




  const submitDoublefile = () =>{
    console.log('Home screen',prevFile,nextFile);
    writeDoubleFileToSelect(prevFile,nextFile);
    console.log('bodyFile',prevFile);
    // getBodyFile(prevFile);
    console.log('borderFile',nextFile);
    // getBorderFile(nextFile); 
    getFile(prevFile, nextFile);
    
  }
  // Original Convert sdFiles to the format required by SelectList
  const dropdownData = sdFiles.map(file => ({
    key: file, // Unique key for each item
    value: file, // Display value for each item
  }));
  // Experimental Convert sdFiles to the format required by SelectList
  const EdropdownData = sdFiles.map((file, index) => ({
    key: index + 1, // Unique key for each item starting from 1
    value: file,    // Display value for each item
  }));
const rotateValue = new Animated.Value(0); // Animated value to rotate the spinner
 useEffect(() => {
    // Create a continuous rotation animation
    if (loading) {
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
 
    // const getFile = async (bodyFile, borderFile) => {
    //   console.log("Fetching files:", bodyFile, borderFile);
    
    //   if (!bodyFile || !borderFile) {
    //     alert('Please enter valid file names with extensions (e.g., body.bmp, border.bmp)');
    //     return;
    //   }
    
    //   try {
    //     // Use template literals correctly for URL construction
    //     const [bodyResponse, borderResponse] = await Promise.all([
    //       fetch(`http://192.168.4.1/get-file?name=${bodyFile}`),
    //       fetch(`http://192.168.4.1/get-file?name=${borderFile}`),
    //     ]);
    
    //     console.log("Body Response Status:", bodyResponse.status);
    //     console.log("Border Response Status:", borderResponse.status);
    
    //     // Check if both file responses are OK (status 200)
    //     if (bodyResponse.ok && borderResponse.ok) {
    //       const bodyImageUrl = `http://192.168.4.1/get-file?name=${bodyFile}`;
    //       const borderImageUrl = `http://192.168.4.1/get-file?name=${borderFile}`;
    
    //       setBodyImageUri(bodyImageUrl);
    //       setBorderImageUri(borderImageUrl);
    //     } else {
    //       // alert('One or both files not found');
    //       setBodyImageUri(null);
    //       setBorderImageUri(null);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching files:', error);
    //     // alert('Error fetching the files');
    //     setBodyImageUri(null);
    //     setBorderImageUri(null);
    //   }
    // };

  const getFile = async (bodyFile, borderFile) => {
  console.log("Fetching files:", bodyFile, borderFile);

  if (!bodyFile || !borderFile) {
    Alert.alert('Please enter valid file names with extensions (e.g., body.bmp, border.bmp)');
    return;
  }

  try {
    const bodyPath = `/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents/${bodyFile}`;
    const borderPath = `/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/WhatsApp Documents/${borderFile}`;

    const [bodyExists, borderExists] = await Promise.all([
      RNFS.exists(bodyPath),
      RNFS.exists(borderPath),
    ]);

    if (!bodyExists || !borderExists) {
      // Alert.alert(`File not found:\n${!bodyExists ? bodyFile : ''}\n${!borderExists ? borderFile : ''}`);
      ToastAndroid.show("File Not Found in Your Mobile!", ToastAndroid.SHORT);
      setBodyImageUri(null);
      setBorderImageUri(null);
      return;
    }

    // Read both files as base64
    const [bodyBase64, borderBase64] = await Promise.all([
      RNFS.readFile(bodyPath, 'base64'),
      RNFS.readFile(borderPath, 'base64'),
    ]);

    const bodyImageUri = `data:image/bmp;base64,${bodyBase64}`;
    const borderImageUri = `data:image/bmp;base64,${borderBase64}`;

    setBodyImageUri(bodyImageUri);
    setBorderImageUri(borderImageUri);

    console.log('Body Image Base64 URI set');
    console.log('Border Image Base64 URI set');
    // Clear AsyncStorage values
    await AsyncStorage.removeItem('bodyImageUri');
    await AsyncStorage.removeItem('borderImageUri');
    await AsyncStorage.setItem('bodyImageUri', bodyImageUri);
    await AsyncStorage.setItem('borderImageUri', borderImageUri);

  } catch (error) {
    console.error('Error fetching or reading files:', error);
    Alert.alert('Error fetching or reading the files');
    // ToastAndroid.show("Error Fetching or Reading Files!", ToastAndroid.SHORT);
    // Clear AsyncStorage values
    await AsyncStorage.removeItem('bodyImageUri');
    await AsyncStorage.removeItem('borderImageUri');
    setBodyImageUri(null);
    setBorderImageUri(null);
  }
};

    
useEffect(() => {
  const loadSavedImages = async () => {
    const savedBody = await AsyncStorage.getItem('bodyImageUri');
    const savedBorder = await AsyncStorage.getItem('borderImageUri');

    if (savedBody) {
      setBodyImageUri(savedBody);
    }
    if (savedBorder) {
      setBorderImageUri(savedBorder);
    }
  };

  loadSavedImages();
}, []);



  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{alignSelf: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10, marginTop: 5}}>{t('BODY')}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 35,
            marginBottom: 5,
          }}> 
         <TouchableOpacity  onPress={handleDecrement}>
          <Icon name="chevron-down" size={30} color="#812892" /> 
        {/* <Text style={{color:'white'}}>{t('ok')}</Text> */}
        </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleDecrement}>
            <Icon name="chevron-down" size={30} color="#812892" />
          </TouchableOpacity> */}
          <TextInput
            keyboardType="number-pad"
            onChangeText={handleInputChange}
            // onEndEditing={(e) => handleInputChange(e.nativeEvent.text)}
            // value={String(pCount)} 
            placeholder='Input Number'
            style={{
              width: 60,
              height:48,
              borderRadius: 5,
              fontSize: 24,
              fontWeight: 'bold',
              color: '#812892',
              marginLeft: 5,
              marginRight: 5,
              borderWidth:1,
              borderColor:'#F5EDF6',
              textAlign: 'center',
            }} >
            {' '}
            {pCount}
          </TextInput>
          <TouchableOpacity onPress={handleIncrement}>
            <Icon name="chevron-up" size={30} color="#812892" textAlign="right" />
          </TouchableOpacity>
          <TouchableOpacity  onPress={submitPCount}  style={{backgroundColor:'purple', width: 50, height: 40, borderRadius:5,justifyContent:'space-around', alignItems:'center', marginRight: -2, marginLeft: 22}} >
        {/* <Icon name="plus" size={30} color="#fff" />  */}
        <Text style={{color:'white'}}>{t('ok')}</Text>
        </TouchableOpacity>
        </View>
        <View>
          <Text style={{marginBottom:2, textAlign: 'center', fontWeight: 'bold', fontSize: 18}}>
          {t('Height')}: {f1width} / {t('Width')}: {f1height}
          </Text>
          </View>
          <View>
            <Text style={{marginBottom: 5, textAlign: 'center', fontWeight: 'bold', fontSize: 14}}>{t('Cards')}: {cardCount} / {t('Connectors')}: {cnCount} / {t('Total Hooks')}: {ttlHook}</Text>
            </View>
            <View>
          <SelectList
            setSelected={handleBodyFile}
            data={dropdownData}
            save="key"
            // value= {prevBodyFile}
            // placeholder={"Select a file"}
            placeholder={prevFile ? prevFile : "Select File"}
            boxStyles={{color: '#000000', fontFamily: 'Roboto'}}
            dropdownStyles={{height: 120,color: '#000000', fontFamily: 'Roboto'}}
            dropdownTextStyles={{color: '#000000', fontFamily: 'Roboto'}}
            placeholderStyle={{color: '#000000', fontFamily: 'Roboto'}}
            selectedTextStyles={{color: '#000000', fontFamily: 'Roboto'}}
            selected={prevFile}
          />
          </View>
          <ScrollView 
            style={{ flex: 1 }} // <-- Take up full width
            contentContainerStyle={{
              alignItems: 'center', // Center content horizontally
              height: 115,          // Same height you had
            }}
            refreshControl={  
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                
              >
                <View style={styles.imgcontainer}>
  {loading ? (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <View style={styles.spinner}>MJ</View>
    </Animated.View>
  ) : bodyImageUri && !bodyImageError ? (
    <Image
      source={{ uri: bodyImageUri }}
      style={styles.image}
      resizeMode="stretch"
      onError={() => setBodyImageError(true)}
    />
  ) : (
    <Text style={styles.warningText}>
      File not found in your phone memory. Please download the file.
    </Text>
  )}
  {loading && <Text>Loading...</Text>}
</View>
                  </ScrollView>
  {/* border details with height width piccount */}
              <View>
                <Text style={{alignSelf: 'center', alignItems: 'center',fontSize: 20, fontWeight: 'bold', marginBottom: 4}}>{t('BORDER')}</Text>
              </View> 
              <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 35,
            marginBottom: 5,
          }}> 
         
          <TouchableOpacity onPress={ handleMinus } style={{backgroundColor:'purple', width: 50, height: 40, borderRadius:5,justifyContent:'space-around', alignItems:'center', marginRight: 0, marginLeft: 2}} >
            <Icon name="minus" size={25} color="#fff" />
            {/* <Text style={{color:'white'}}>{t('ok')}</Text> */}
          </TouchableOpacity>
          <TextInput
            keyboardType="number-pad"
            // value={String(pCount1)}
            onChangeText={handleInputChange2}
            // onEndEditing={(e) => handleInputChange2(e.nativeEvent.text)}
            placeholder='Input Number'
            style={{
              width: 60,
              height:48,
              borderRadius: 5,
              fontSize: 24,
              fontWeight: 'bold',
              color: '#812892',
              marginLeft: 10,
              marginRight: 10,
              borderWidth:1,
              textAlign:'center',
              borderColor:'#F5EDF6',
            }} >
            {' '}
            {pCount1}
          </TextInput>
          {/* <TouchableOpacity onPress={handleIncrement}>
            <Icon name="chevron-up" size={30} color="#812892" textAlign="right" />
          </TouchableOpacity> */}
          <TouchableOpacity  onPress={handleAdd}  style={{backgroundColor:'purple', width: 50, height: 40, borderRadius:5,justifyContent:'space-around', alignItems:'center', marginRight: 0, marginLeft: 2}} >
        <Icon name="plus" size={25} color="#fff" /> 
        {/* <Text style={{color:'white'}}>{t('ok')}</Text> */}
        </TouchableOpacity>
        <TextInput
  keyboardType="number-pad"
  placeholder='PicNo'
  value={inputValue} // this must be a string!
  onChangeText={setInputValue}
  style={{
    width: 60,
    height:48,
    borderRadius: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#812892',
    marginLeft: 0,
    marginRight: 0,
    borderWidth:0,
    textAlign:'center',
    borderColor:'#F5EDF6',
  }}
/>
        </View>
        <View>
          <Text style={{marginBottom:1, textAlign: 'center', fontWeight: 'bold', fontSize: 18}}>
          {t('Height')}: {f2width} / {t('Width')}: {f2height}
          </Text>
          </View> 
          <View>
          <SelectList
            setSelected={handleBorderFile}
            data={dropdownData}
            save="key"
            // value= {prevFile}
            // placeholder={"Select a file"}
            placeholder={nextFile ? nextFile : "Select File"}
            // boxStyles={styles.selectBox}
            // dropdownStyles={styles.dropdown}
            // dropdownTextStyles={styles.dropdownText}
            // placeholderStyle={styles.placeholder}
            boxStyles={{color: '#000000', fontFamily: 'Roboto'}}
            dropdownStyles={{height: 120, color: '#000000', fontFamily: 'Roboto'}}
            dropdownTextStyles={{color: '#000000', fontFamily: 'Roboto'}}
            placeholderStyle={{color: '#000000', fontFamily: 'Roboto'}}
            selectedTextStyles={{color: '#000000', fontFamily: 'Roboto'}}
            selected={nextFile}
          />
          </View>
          <ScrollView
           style={{ flex: 1 }} // <-- Take up full width
           contentContainerStyle={{
             alignItems: 'center', // Center content horizontally
             height: 115,          // Same height you had
             
           }}
            refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                // contentContainerStyle={{ alignItems: 'center',height: 115, width: 100 }}
               
              >
                {/* <View style={styles.imgcontainer}>
                {loading ? (
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <View style={styles.spinner}>MJ</View>
                  </Animated.View>
                ) : (
                  borderImageUri && <Image source={{ uri: borderImageUri }} style={styles.image} resizeMode="stretch" />
                  // <Image source={require('../assets/images/logo1.png')} />
                )}
                {loading && <Text>Loading...</Text>}
              </View> */}
              <View style={styles.imgcontainer}>
  {loading ? (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <View style={styles.spinner}>MJ</View>
    </Animated.View>
  ) : borderImageUri && !borderImageError ? (
    <Image
      source={{ uri: borderImageUri }}
      style={styles.image}
      resizeMode="stretch"
      onError={() => setBorderImageError(true)}
    />
  ) : (
    <Text style={styles.warningText}>
      File not found in your phone memory. Please download the file.
    </Text>
  )}
  {loading && <Text>Loading...</Text>}
</View>
                  </ScrollView>
                  <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 50,
          marginTop: 5,
        }}>
       
        <View>
          <Text style={styles.rpmValue}>
            {rpmValue}
          </Text>
        </View>
        <View>
          <TouchableOpacity style={{backgroundColor:'purple', width: 75, height: 40, bottom: -15, borderRadius:5, justifyContent:'center', alignItems:'center'}} onPress={submitDoublefile}>
            <Text style={{color:'white'}}>{t('Submit')}</Text>
          </TouchableOpacity>
          
        </View>
        <View
          style={{
            backgroundColor: 'pink',
            borderRadius: 60,
            width: 45,
            alignSelf: 'center',
            alignContent: 'center',
          }}></View>
      </View>
            <View>
            <TouchableOpacity style={styles.floatingButton} onPress={toggleOverlay}>
        <Text style={styles.buttonText}>
          {isOverlayVisible ? <Icon name="unlock" size={30} color="#FFFFFF" /> : <Icon name="lock" size={30} color="#FFFFFF" />}
        </Text>
      </TouchableOpacity>
      {isOverlayVisible && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Un-Lock to Change Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={toggleOverlay}>
              <Text style={styles.buttonText}><Icon name="unlock" size={30} color="#FFFFFF" /></Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

            </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: 200,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#3B71CA',
  },
  txt: {
    color: 'white',
  },
  button: {
    padding: 1,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginLeft:10,
  },
  buttonText: {

    color: '#FFFFFF',
    fontSize: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 24,
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    bottom: 7, // Adjust for vertical spacing
    right: 24, // Adjust for horizontal spacing
    width: 50,
    height: 50,
    backgroundColor: '#812892',
    borderRadius: 30, // Circular button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: -2, // Adjust for vertical spacing
    right: 1, // Adjust for horizontal spacing
    width: 50,
    height: 50,
    backgroundColor: '#812892',
    borderRadius: 30, // Circular button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  digitalText: {
    fontSize: 60,
    color: '#00FF00', // Green color for digital look
    fontFamily: 'digital-7', // Use the font name as it appears inside the font file
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#3498db',
    borderTopColor: 'transparent',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 115,
    marginTop: 0,
  },
  imgcontainer:{
    width: '100%',
    height: 115,
  },
  rpmValue: {
    fontFamily: 'Technology',
    fontSize: 70,
    color: 'purple',
    position: 'relative',
    marginTop: 5,
    marginLeft: -110,
    marginRight: 20,
    bottom: -10,
  },
  warningText: {
    marginTop: 20,
    color: 'red',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default DoubleFile;

