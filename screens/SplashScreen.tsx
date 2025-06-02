import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { View, Text} from 'react-native';


const SplashScreen = ({navigation}) =>{
    
    useEffect(()=>{
        setTimeout(()=>{
            navigation.navigate('Main');
        },3000)
    },[])
    return(
        <View style={{flex:1, justifyContent:"center", alignItems:"center", backgroundColor: '#EFDBFE'}}>
            <Animatable.Text animation="fadeInUp" style={{fontSize:36, fontWeight: 'bold', color: '#812892', fontFamily: 'Roboto Thin'}}>WELCOME TO</Animatable.Text>
            <Animatable.Image animation="zoomInDown" source={require('../assets/images/LOGO.png')} />
              {/* <View><Text>Hello</Text></View> */}
        </View>
      
    );
}
export default SplashScreen;