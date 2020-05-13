import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  AsyncStorage,
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import Markers from '../../assets/Places.json'
import FloatingButton from './FloatingButton'
import Modal from 'react-native-modal'
import { t } from '../../Locales'
import * as Permissions from 'expo-permissions'

import { Router } from 'react-native-router-flux'

/**
 * These are files for all different markers. We do provide 8 different ones, in case you wan't to change the used one.
 */
const marker1 = require('../../assets/Ikonit/Markkerit/Marker_1-01.png')
const marker2 = require('../../assets/Ikonit/Markkerit/Marker_2-01.png')
const marker3 = require('../../assets/Ikonit/Markkerit/Marker_3-01.png')
const marker5 = require('../../assets/Ikonit/Markkerit/Marker_5-01.png')
const marker6 = require('../../assets/Ikonit/Markkerit/Marker_6-01.png')
const marker7 = require('../../assets/Ikonit/Markkerit/Marker_7-01.png')
const marker8 = require('../../assets/Ikonit/Markkerit/Marker_8-01.png')
const markerImages = {
  1: marker1,
  2: marker2,
  3: marker3,
  5: marker5,
  6: marker6,
  7: marker7,
  8: marker8,
}

const initialRegion = {
  latitude: 65.011358,
  longitude: 25.464249,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0015,
}

const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 }

/**
 * @brief function to get current location.
 * In next version you might wan't to include permission requestin to here.
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (e) => reject(e)
    )
  })
}

class mapScreen extends React.Component {
  static navigationOptions = {
    title: 'Map',
  }

  constructor(props) {
    super(props)
    this.state = {
      region: initialRegion,
      isModalVisible: false,
      fi: true,
      markerPlace: '',
    }
  }

  _getItem = async (key) => {
    /**
     * @brief helperfunction to get a value from asyncstorage for wanted key
     * @param key: String key to fetch data with from asyncstorage
     */
    try {
      await AsyncStorage.getItem(key, (err, value) => {
        if (err) {
          console.log(err)
        } else {
          var value = JSON.parse(value)
          console.log('Funktio _getItem ajettu, fi arvona on: ')
          console.log(value)
          return value
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  setRegion(region) {
    if (this.state.ready) {
      setTimeout(() => this.map.mapview.animateToRegion(region), 10)
    }
  }

  checkLanguage = () => {
    if (this.state.fi == 'true') {
      return false
    }
    if (this.state.fi == 'false') {
      return true
    } else {
      console.log('Something is wrong')
      return null
    }
  }

  toggleModal = () => {
    /**
     * @brief Function to show modal
     * modal includes info about the mapscreen
     */
    this.setState({ isModalVisible: !this.state.isModalVisible })
    AsyncStorage.getItem('fi').then((fiValue) => {
      this.setState({ fi: fiValue })
    })
  }

  async getkeys() {
    try {
      const keys = await AsyncStorage.getAllKeys()
      console.log('keys are ' + keys)
      const result = await AsyncStorage.multiGet(keys)
      console.log('results are ' + result)
    } catch (error) {
      console.error(error)
    }
  }

  _languageChanged(event) {
    this.setState({ fi: this._getItem('fi') })
  }

  async Getpermissions() {
    const { status } = await Permissions.getAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      console.log('PERMISSION NOT GRANTED')
      this.setState({ errorMessage: 'PERMISSION NOT GRANTED' })
    }
  }

  componentDidMount() {
    this.Getpermissions()
    return getCurrentLocation().then((position) => {
      if (position) {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
        })
      }
    })
  }

  componentDidUpdate() {
    if (typeof this.props.navigation.state.params !== 'undefined') {
      coordinates = this.props.navigation.state.params.coordinates
      var coordinatesAndDelta = {
        ...coordinates,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
      if (coordinates !== this.state.markerPlace) {
        setTimeout(() => this.map.animateToRegion(coordinatesAndDelta, 2000), 1)
        console.log('WOOOW')
        this.setState({ markerPlace: coordinates })
      } else {
        this.map.animateToRegion(coordinatesAndDelta, 2000)
      }
    }
    AsyncStorage.getItem('fi').then((fiValue) => {
      if (fiValue != this.state.fi) {
        this.setState({ fi: fiValue })
      }
    })
  }
  onMapReady = (e) => {
    if (!this.state.ready) {
      this.setState({ ready: true })
    }
  }

  onRegionChange = (region) => {
    console.log('onRegionChange', region)
  }

  onRegionChangeComplete = (region) => {
    console.log('onRegionChangeComplete', region)
  }

  render() {
    const { navigation } = this.props
    const { region } = this.state
    //console.log(this.props.navigation.state.params.coordinates)

    const MarkerInfo = (props) => {
      return (
        <View style={{ flexDirection: 'row' }}>
          <Image source={'props.image'} style={{ width: 50, height: 50 }} />
          <View
            style={{
              flex: 1,
              height: 50,
              width: Dimensions.get('window').width,
            }}
          >
            <Text>{props.text}</Text>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => {
            this.map = ref
          }}
          style={styles.mapStyle}
          region={this.state.region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {Markers.map((marker, index) => (
            <Marker
              coordinate={marker.coordinates}
              title={marker.Title}
              description={marker.Description}
              key={index}
              image={markerImages[3]}
              //anchor={{ x: 0.5, y: 0.5 }}

              //TODO: Find a way to make sure that tip of the marker is in wanted location in any situation.
              //For example if you rotate the map, the tip of the marker moves.
            />
          ))}
        </MapView>

        <FloatingButton
          style={{ top: 100, right: 50 }}
          toggle={this.toggleModal}
          iconName='question'
        />

        <View style={styles.popupContainer}>
          <Modal
            style={styles.modalContainer}
            isVisible={this.state.isModalVisible}
            onBackdropPress={() => this.setState({ isModalVisible: false })}
            backdropColor='#043353'
            backdropOpacity={0.8}
            animationIn='zoomInDown'
            animationOut='zoomOutUp'
            animationInTiming={600}
            animationOutTiming={600}
            backdropTransitionInTiming={600}
            backdropTransitionOutTiming={600}
          >
            <View style={styles.popupContent}>
              <MarkerInfo
                image={markerImages[3]}
                text={t('MAPMARKERINFOTEXT', this.checkLanguage())}
              />
              <View style={styles.infoText}>
                <Text style={{}}>{t('MAPINFOTEXT', this.checkLanguage())}</Text>
              </View>
            </View>
            <FloatingButton
              toggle={this.toggleModal}
              iconName='closecircleo'
              style={{ bottom: 100, left: 0, right: 0 }}
            />
          </Modal>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center',
    //justifyContent: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3',
  },
  mapStyle: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
  },
  map: {
    flex: 3,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
  },
  locationMenu: {
    width: Dimensions.get('window').width,
    height: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bfcfff',
  },
  Touchable: {
    paddingTop: 2,
    backgroundColor: '#fff',
    opacity: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: 10,
  },
  modalContainer: {
    position: 'absolute',
    top: 100,
    bottom: 150,
    left: 0,
    right: 0,
    alignContent: 'center',
    borderRadius: 20,
    padding: 10,
    textAlign: 'center',
    justifyContent: 'center',
  },
  popupContent: {
    //width: Dimensions.get('window').width - 30,
    //height: 150,
    position: 'absolute',
    top: 100,
    bottom: 150,
    left: 0,
    right: 0,
    alignContent: 'center',
    backgroundColor: '#FFF',
    borderColor: '#000',
    borderWidth: 1,
    color: '#FFF',
    borderRadius: 20,
    padding: 10,
    textAlign: 'center',
    justifyContent: 'center',
  },
  infoText: {
    justifyContent: 'center',
    textAlign: 'center',
    padding: 10,
  },
})

export default mapScreen
