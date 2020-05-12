'use string';

import React, {Component, useState,useEffect} from 'react'
import { Button, StyleSheet, Text, 
        View, LayoutAnimation, Dimensions, 
        StatusBar, TouchableOpacity, Alert, 
        Linking, 
        Vibration} from 'react-native'
import ReactDome from 'react-dom'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from 'react-native-router-flux'

// for Qrcamera
import { Camera } from 'expo-camera'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Permissions  from 'expo-permissions'

// for Textinput
import {Textinput} from 'react-native'
import { TextInput } from 'react-native-gesture-handler';

// for render control
import ReactDom from 'react-dom'

/* funktio Qrcamera Qr koodi lukemiseen
  Decsription:
      for reading qr code
      TODO decide qr code format.
  variables:
      hasPermission : tracks phone permission for app 
      setHasPermission : hook for hasPermission
      
      scanned :  tracks if qr value has been read.
      setScanner : hook for scanned
      
      handleChange : callback function from QrScreen passed from Componentrender


  hooks:
      useEffect : waits for permission from. Uses BarCodeScanner library
      handleBarCodeScanned : changes state scanned and handleChange.
      handleChange : 

*/
function Qrcamera( props ) {
  const key = props.key;
  const handleChange = props.handleChange;
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned( true );
    handleChange( true )
    alert(`Luin tyypin ${type} ja datan ${data}!`);
  };

  if (hasPermission === null) {
    return <Text> Anna kamera oikeudet</Text>;
  }
  if (hasPermission === false) {
    return <Text> Ei ilmeisesti toimi Suomessa </Text>;
  }

  return (
    <View
      style = {
        styles.qrcamera}>
      <BarCodeScanner
           onBarCodeScanned = { scanned ? undefined : handleBarCodeScanned }
           style = { styles.qrcamera }
      ></BarCodeScanner>
    </View>
    //{ scanned && <Button title = {"Paina minua jos haluta skannata uudelleen "} onPress={ () => setScanned( false ) } /> }
  );
   
}

/* inputfield 
   Description: 
      renders text input field. 
   variables: 
        value : input value
        onChangeText : handler not defined explicitly
    
*/
function Inputfield( ){
  const [ value, onChangeText ] = useState( null );
  return (
     <TextInput style = {styles.inputfield} multiline = {true}
       onChangeText={text => onChangeText( text ) }
       value = {value}>
        
      </TextInput>
  )
}

/* Componentrender
  Description:
        Responsible choosing component that is rendered.
  variables:
        qrsscanned : QrScreen state that tracks status of qrscanner. Used to pick right component to be rended.
        handleChange : handler function for tracking status, defined in and passed from QrScreen, further passed to Qrcamera function 
*/

function Componentrender( props ){
  const qrsscanned = props.qrsscanned;
  const handleChange = props.handleChange;
  const numbers = [ 1, 2 ]
  if( qrsscanned === false ){
  return ([
          <Text key="1"> Ota kuva </Text>,
          <Qrcamera  handleChange= { handleChange }/>
         ]);

  }
  if( qrsscanned === true ){
  return([<Text key="2">Mitä sanoit </Text>,
          <Inputfield key="key4"/>
        ]);
  }
  return <Text> No bueno qrscanned is null </Text>
}

/*
  QrScreen
   Description:
      Parent component for this view. 
      Children Components:
      function Componentrender
               Button
   Variables:
       qrsscanned : tracks status of qrcamera
       handleChange : handlesChange changes value of qrsscanned
       render : 
*/

class QrScreen extends React.Component{
  constructor( props ){
    super( props );
    this.state = {
      qrsscanned : false, /*true,*/
    };
    this.handleChange = this.handleChange.bind( this );
  }

  handleChange( is_scanned ){
    this.setState( { qrsscanned : is_scanned });
  }
  handleClick( e ){

  }
  
  render( ){
    const qrsscanned = this.state.qrsscanned;
    return (
      <View style={styles.container}>
        <Componentrender handleChange = {this.handleChange} qrsscanned = {qrsscanned}/>
        <Button title="takaisin"></Button>
        <Text> Qr componentti ja input ovat ylhäällä ja toivottavasti kuva ja kenttä </Text>
      
      </View>
    )
  }
  /* define button's handleclick here. We might want to use same button with different logo.
  <Button title="takaisin onClick={this.handleClick}*/ 
}

/* const styles
   TODO check for inconsistencies, inputfile  and qrcamera are a mess right now.
   Description: 
            for gathering different stylesheets for QrScreen.js
    
    Styles:
          container : 
          qrcamera :
          inputfield :
          placesNearby : 

*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrcamera : {
    flex : 6,
    alignItems : 'center',
    alignSelf : 'center', 
    marginTop : '10%',
    marginBottom : '10%',
    marginLeft : '20',
    marginRight : '30',
    width : 600,
    height :200,
  },

  inputfield : {
    backgroundColor : '#CFCFCF',
    borderWidth : 5,
    height : 200,
    width : 200,
    borderColor : 'gray',
    alignItems : 'center',
    alignSelf : 'center',
    justifyContent : 'center',
  },
  
  placesNearby: {
    flex: 1,
    backgroundColor: '#bfcfff',
    borderColor: '#043353',
    borderRadius: 10,
    paddingVertical: 50,
    paddingHorizontal: 20
  },

  header: {}
}) 
export default QrScreen