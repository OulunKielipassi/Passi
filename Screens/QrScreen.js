'use string'

import React, { Component, useState, useEffect } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  Vibration,
  AsyncStorage,
  useWindowDimensions,
  Keyboard,
  Navigator,
  KeyboardAvoidingView,
  Image
} from 'react-native'


import ReactDome from 'react-dom'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { Ionicons } from '@expo/vector-icons'
import { Modal } from 'react-native-router-flux'


import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'

// for Qrcamera
import { Camera } from 'expo-camera'
//import QRCodeScanner from 'react-native-qrcode-scanner'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'

// for Textinput
import { Textinput, ScrollView } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'


//For translations
import { t } from '../Locales'


// for asyncstorage
/* Constants for qrcode reading and dealing with data.
   STORAGE_KEY       : is key for sentence data.
   STORAGE_DELIMITER : separates QR-code data into password and place.  Assumes that data is formated password DELIMITER place
   PASSPHRASE        : Used for checking if QR-code read is for this application. 
*/
const STORAGE_KEY = 'Key'
const STORAGE_DELIMITER = ':'
const PASSPHRASE = 'YouShallPass'
const filePath = '../assets/Ikonit/QR/Home-01.png'


/* Function for reading QrCode, responsible for camera. uses t imported from locales. 
  Decsription:
      for reading qr code

  variables:
      setQrState       : callback function from QrScreen and passed by Componentrender, updates Qrscreen qrsscanned state.
      hasPermission    : tracks phone permission for app 
      setHasPermission : hook for hasPermission
      scanned          : tracks if qr value has been read.
      setScanner       : setter for scanned
      window           : dimensions for component
      checkLanguage    : getter for fi variable from QrScreen
      storePlace       : responsible for storing data from QR-code. Check QrScreen for further detail.
      renderCamera     : check if camera is focussed.
  function:
      useEffect            : responsbile for checking permission update
      handleBarCodeScanner : sets scanned true in this function and QrScreen passes data to storeplace function 
*/
function Qrcamera(props) {
  const setQrState = props.setQrState;
  const [hasPermission, setHasPermission] = useState(undefined);
  const [scanned, setScanned] = useState(false);
  var checkLanguage = props.checkLanguage;
  const window = Dimensions.get( 'window' );
  const storePlace = props.storePlace;

  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])
  

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true)
    setQrState(true)
    storePlace( data );
  }

  /* renderCamera  constant function.  Uses handleBarCodeScanner function, scanned variable and navigation( nav ) prop.
     Parameters : no parameters
     Decsription: Responsible for making sure that camera is alive when Screen is in use. Uses nav from ComponentRender and
                  QrScreen, for some reason this only works like this. 
   */
  const renderCamera = ( ) =>{
    const focused = props.nav.isFocused( )
    if( focused ){
      return ( 
        <Camera
        style= {{ flex : 8,  width : window.width/1.2, height: window.height/3 }}
        onBarCodeScanned={( scanned && focused ) ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr]
        }}
      ></Camera>
      )
    }
    return null;
  }

  if (hasPermission === undefined) {
    return <Text> Camera requires a permission for camera. </Text>
  }
  if (hasPermission === false) {
    return <Text> Permission not granted. </Text>
  }
  
  /* t impored from en.json and fi.json. Used for choocing correct language. Uses checkLanguage.
  */
  return (
    <View style={ styles.qrcontainer}>
      <View style={ styles.viewpaddingcamera}></View>
      <Text style= { {alignSelf:'center' } }>{ t( 'QRQUESTION', checkLanguage()  ) }</Text>
      { renderCamera( ) }
      <View style={ styles.viewpaddingcamera}></View>
    </View>
  )
}

/* function inputfield
   Description: 
      renders text input field. import t from locales.
   variables: 
        value         : input value
        onChangeText  : handler not defined explicitly
        storeInput    : hook function from QrScreen, responsible for saving input text.
        text          : written text. Isn't equal to value in inputfield.
        checkLanguage : returns true or false based on language choice. Received from QrScreen.
        
*/
function Inputfield(props) {
  const [value, onChangeText] = useState(undefined)
  const storeInput = props.storeInput;
  var checkLanguage = props.checkLanguage;
  return (
    <View >
      <View style={styles.viewpaddingtext}/>
      <ScrollView style={styles.ScrollViewVertical}></ScrollView>
      <Text style= { {alignSelf:'center' } } > { t( 'INPUTQUESTION', checkLanguage( ) )} </Text>
      <View style={ styles.bordercontainer }>
          <TextInput
                style= {styles.inputfield}
                multiline= {true}
                returnKeyType = "done"
                onKeyPress = {( key ) => { if( key.nativeEvent.key == "Enter" ){Keyboard.dismiss( )} } }
                onChangeText= {( text => onChangeText( text ), value => storeInput( value ) )}
              />
      </View>
  
      <ScrollView style={styles.ScrollViewVertical}></ScrollView>
      <View style={ styles.viewpaddingtext }></View>
    </View>
  )
}

/* Componentrender
  Description:
        Responsible choosing component that is rendered.
        Return Qrcamera or Inputfield function. if neither returns text
  variables:
        qrsscanned       : QrScreen state that tracks status of qrscanner. Used to pick right component for render.
        setQrState       : handler function for tracking status, defined in and passed from QrScreen, further passed to Qrcamera function.
        storeInput       : Function for inputfield. Check inputfield function This function only passes hook functions down.
        storePlace       : Function for qrcamera. Check qrcamera function. This function only passes hook functions down.
*/

function ComponentRender(props) {
  const qrscanned = props.qrscanned
  const setQrState = props.setQrState
  const storeInput = props.storeInput
  const storePlace = props.storePlace
  const checkLanguage = props.checkLanguage;

  if (qrscanned === false) {
    return( 
      <Qrcamera key={ "qrcamera" } nav={props.nav} setQrState={setQrState} storePlace={ storePlace } checkLanguage={checkLanguage} />
    )
  }
  if (qrscanned === true) {
    return( 
      <Inputfield key={ "inputfield" } storeInput={storeInput} checkLanguage={checkLanguage}  />
    )
  }
  return <Text> No bueno qrscanned is null </Text>
}
/*
  QrScreen
   Description: 
       Screen responsible for reading qrcode and writing what was said.

   Variables:
       qrsscanned   : tracks status of qrcamera. Passed down to qrcamera function. Used in SetQrState
       fi           : what langugage is being used currently. Currently "false" = finnish  "true" = english. Used in CheckButtonSentence 
                                                                                                             and ComponentDidUpdate
       message      : Written input.  Passed down to inputfield function. 
       newPlace     : Used to save place name. Used in storePlace, submitMessage, compontentDidMount
       passed       : Tracks if qr code is valid. Submitmessage. 

    Important variables:
       interval     : Timer defined in componentDidMount and componentDidUpdate, responsible for starting Screen update.
       filePath     : require( path ) defined in render. 

    Functions:
      setQrState          : callback function for Componentrender,  changes value of qrsscanned
      storeInput          : callback function for saving text from Inputfieeld  to message variable. 
      onPress             : callback function for button "Return home page".   
      submitMessage       : async function. stores time, place and message to asyncstorage
      storePlace          : stores a place to variable.
      checkLanguage       : returns true if fi variable is "false" otherwise "true"

      componentDidMount   : setVariables and timer
      componentDidUpdate  : checks for changes in language, set new timer. 
      componentWillUnmount: destroys timer.

  Possible improvement:
        Centralization of updating: currently this screen uses timer for initlization updating, 
                                    otherwise update would happen when user presses return button which is too late for 
                                    user. Info for user and button text( buttonInfo ) needs to be in correct language immediately.
                                    Currently screen uses timer for updating itself, this would'nt be needed if update in HomeScreen
                                    propagated to this screen. Update could be initiaed when use moves to this screen.
       
*/

class QrScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      qrscanned: true,
      message: undefined,
      newPlace : '',
      fi : "false",
    }
    this.setQrState = this.setQrState.bind(this)
    this.storeInput = this.storeInput.bind(this)
    this.onPress = this.onPress.bind(this)
    this.submitMessage = this.submitMessage.bind( this )
    this.storePlace = this.storePlace.bind( this )
    this.checkLanguage = this.checkLanguage.bind( this )
  }
  
  /* Function checkLanguage. 
    Description:
      Checks what language is currently selected 
    return:
        returns true if fi variable is "false" otherwise return false 
  */
  checkLanguage( ){
    //console.log( " state fi is " + this.state.fi + " typeof " + typeof( this.state.fi ) );
    //console.log( " is true " + this.state.fi == "true" )
    if( this.state.fi == "false" ){
      return true;
    }
    else{
      return false;
    }
  }

  /* Function setQrState. set qrscanned variable. Used in QrCamera function. 
     param: is_scanned 

  */
  setQrState( is_scanned ) {
    this.setState({ qrscanned: is_scanned })
  }

  /* Function storeInput. Used in Inputfield function
  */
  storeInput( text ) {
    this.message = text
  }

  /* Function storePlace
     Decsription: checks if location data is valid.
      
  */
  storePlace( data ){
    var parsedData = data.split( STORAGE_DELIMITER );
    console.log( "parsedData " + parsedData )
    if( parsedData[0] == PASSPHRASE ){
      this.newPlace = parsedData[1]
      this.passed = true;
    }
    else{
      this.passed = false;
    }
  }

  /* Function submitMessage. 
     Defines current data ( newData variable in function), loads previous data and appends it with new data. Saves data. 
     Require qrcode having password.
     
  */ 
  async submitMessage( ){
    if( this.passed === true ){
      try{
        //console.log( "You shall pass")
        var day = new Date().getDate( );
        var year = new Date().getFullYear( );
        var month = new Date().getMonth( );
        var hour = new Date().getHours( );
        var minute = new Date( ).getMinutes( );
        var date = day + "." + month + "." + year + " " + hour + "." + minute;

        let localData = await AsyncStorage.getItem( STORAGE_KEY )
        let newData = {
          place : this.newPlace,
          time : date,
          phrase : this.message
        }
        //console.log( "paikka " + newData.place + " aika " + newData.time + " lause " + newData.phrase );
        if( localData == undefined ){
          var dataString = JSON.stringify( newData );
          dataString.replace( '\n', '' )
          await AsyncStorage.setItem( STORAGE_KEY, dataString );
        }
        else{
          
          await AsyncStorage.setItem( STORAGE_KEY, localData += JSON.stringify( newData ));
        }
        const curData = await AsyncStorage.getItem( STORAGE_KEY )
        console.log( "Data on \n " + curData );
      }
      catch( error ){
        console.log( "Error in submitmessage asyncget " + error.message)
      }
    }
    else{
      console.log( "You shall't pass" )
    }
  }

  /* Function onPress 
    Description:
        Responsible for reseting QrScreen and saving message until navigating to Home Screen
        Used by button( touchable opacity ) in render. 

     */
  onPress( ) {
    this.setState( { message : ''})
    this.setState( { qrscanned : false})
    const { navigate } = this.props.navigation
    this.submitMessage( );
    navigate('Home')
  }

  /* Function componentDidMount 
     Description: 
          sets state variables and timer.
          checkButtonSentence checks what text should be selected for buttonInfo variable.
          Timer is currently set for 100 microseconds, 1/10 of a second. This was required for focusing camera,
          moving to other screen from this screen by lower navigation bar leads to blank screen in Qrcamera.
  */
  componentDidMount( ){
    //AsyncStorage.clear( STORAGE_KEY );
    this.setState( { fi : "false" } )
    this.setState( { qrscanned : false } )
    this.setState( { message : undefined } )
    this.setState( { newPlace : '' } )
    //console.log( " mounted fi is " + this.state.fi )
    
    this.interval = setInterval( ( ) => this.setState( { timer : Date.now( ) } ), 100 );
  }

  /* Function componentDidUpdate
     Description: 
          Updates fi value and  buttonInfo( by  checkButtonSentence )
  */
  componentDidUpdate() {
    //console.log( "updated " )
    AsyncStorage.getItem('fi').then((fiValue) => {
      if( this.state.fi != fiValue ){
        //console.log( "update fi is " + this.state.fi + "  fiValue is " + fiValue )
        this.setState({ fi: fiValue })

      }
    })
  }

  /* Function componentWillUnMount
     Description:
         Ensures that timer is destroyed.
   */
  componentWillUnmount( ){
    clearInterval( this.interval );
  }

  render() {
    var filePath;
    if( this.state.qrscanned == false && this.state.fi == 'false'){
      filePath = require ('../assets/Ikonit/QR/Painike_takaisin-01.png' )
    }
    else if ( this.state.qrscanned == false && this.state.fi == 'true' ){
      filePath = require ( '../assets/Ikonit/QR/Painike_Back-01.png' )
    }
    else if ( this.state.qrscanned == true && this.state.fi == 'true'){
      filePath = require ( '../assets/Ikonit/QR/Painike_save-01.png' )
    }
    else if ( this.state.qrscanned == true && this.state.fi == 'false'){
      filePath = require ( '../assets/Ikonit/QR/Painike_tallenna-01.png' )
    }
    try{
      return (
      <KeyboardAvoidingView style={styles.Avoidcontainer}> 
        <ComponentRender
          nav={this.props.navigation}
          storePlace={this.storePlace}
          qrscanned={this.state.qrscanned}
          setQrState={this.setQrState}
          storeInput={this.storeInput}
          checkLanguage={this.checkLanguage}
        ></ComponentRender>
        <TouchableOpacity style={styles.actionBox} onPress={this.onPress}>
          <Image
            source={ filePath }
            style={styles.actionButton}
            >
          </Image>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    )
    }
    catch( error ){
      console.log( "Error in QrScreen: " + error.message )
    }
  }
  
}




const styles = StyleSheet.create({

  ScrollViewVertical: {
    height : hp( "10%")
  },

  ScrollViewHorizontal:{
    backgroundColor: '#ff0000',
    flexDirection : 'column',
    alignSelf : 'flex-start',
  },

  Avoidcontainer: {
    flex: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent : 'flex-end',
  },

  container: {
    flex: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent : 'flex-end',
  },

  qrcontainer : {
    flex : 30,
    flexDirection : 'column',
    alignItems : 'center',
    borderColor : 'red',
  },

  qrcamera: {
    flex: 40,
    flexDirection : 'row',
    alignSelf: 'center',
    justifyContent : 'center',
    borderColor : 'gray',
  },


  inputcontainer: {
    flex : 5,
    flexDirection : 'row',
    alignItems : 'center',
    alignSelf : 'center',
    backgroundColor : "#ffffff",
  },

  // inputfield field borders
  bordercontainer : {
    flex : 5,
    borderColor : 'gray',
    borderRadius : 10,
    borderWidth : 5,
  },
  // textinput
  inputfield: {
    width : 300,
    flex : 10,
    flexDirection : 'column',
    alignSelf : 'center',
    backgroundColor : '#ffffff',
    textAlignVertical : 'top',
  },

  // inputfield top view
  viewpaddingtext: {
    flex : 1,
    flexDirection : 'row',
    alignSelf : 'center',
    backgroundColor : '#ff0000',
  },

  // Padding for qrcamera screen
  viewpaddingcamera: {
    flex : 10,
    flexDirection : 'row',
    alignSelf : 'center',
    backgroundColor : '#ff0000',
  },

  // return Home opacity
  actionBox: {
    color: '#D4DDE6',
    height: hp('10%'),
    width: wp( '40%'),
    borderColor: '#D4DDE6',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent : 'center',
  },
  // return Home image
  actionButton: {
    
    width: wp('40%' ),
    height: hp('10%' ),
    alignSelf : 'center'
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
