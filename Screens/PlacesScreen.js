import React, { Component } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  AsyncStorage,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import { getDistance, getPreciseDistance } from 'geolib'

import { t } from '../Locales'

const ListItem = (props) => {
  /**
   * @brief ListItems are items mapped on "Places" -portion of the home screen
   * @param name: name of the place
   * @param coordinates: coordinates of the place
   * @param distance: distance from current location to wanted place
   */
  return (
    <TouchableOpacity
      style={styles.box}
      onPress={() => {
        props.navigation('Map', { coordinates: props.coordinates })
        console.log(props.name)
      }}
    >
      <Text style={styles.placeBoxText}>{props.name}</Text>
      <Text style={styles.boxDistance}>{props.distance} m</Text>
      <Image
        source={require('../assets/Ikonit/Markkerit/Marker_3-01.png')}
        style={styles.boxImage}
      />
    </TouchableOpacity>
  )
}

const ArrangeList = (props) => {
  /**
   * @brief ArrangeList is a function to add distances to every element in array of places.
   * In this function we also map the elements of the list, and present them in the main view
   * @param
   *    list: list of all the location
   *    location: users current location
   */
  const list = props.list
  const location = props.location
  var dis = 0
  if (location !== null && list !== null) {
    list.map((item, key) => {
      key = item.coordinates.latitude
      dis = getDistance(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        {
          latitude: item.coordinates.latitude,
          longitude: item.coordinates.longitude,
        }
      )
      item['distance'] = dis
    })

    list.sort((a, b) => a.distance > b.distance)
  }
  return list.map((item, index) => {
    return (
      <ListItem
        key={index}
        name={item.Title}
        distance={item.distance}
        navigation={props.navigation}
        coordinates={item.coordinates}
      />
    )
  })
}

export default class PlacesScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      enabled: true,
      fi: this.props.navigation.state.params.fi,
      location: null,
      errorMessage: '',
      allLocations: [],
    }
  }
  static navigationOptions = ({ route, navigation }) => {
    return {}
  }

  _getLocation = async () => {
    /**
     * @brief function to get location and saving it to state.
     */
    try {
      const { status } = await Permissions.getAsync(Permissions.LOCATION)
      if (status !== 'granted') {
        console.log('PERMISSION NOT GRANTED')

        this.setState({ errorMessage: 'PERMISSION NOT GRANTED' })
      }
      const location = await Location.getCurrentPositionAsync({})
      this.setState({
        location,
      })
    } catch (error) {
      console.log(error)
    }
  }

  async componentDidMount() {
    this._getLocation()
    const places = require('../assets/Places.json')
    this.setState({ allLocations: places })
    try {
      await AsyncStorage.setItem('AllPlaces', JSON.stringify(places)).then(
        this.setState({ ready: true })
      )
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    const { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <Text style={styles.upperBottom}></Text>

        <View style={styles.placesBox}>
          <View style={styles.bothButtons}>
            <TouchableOpacity onPress={() => navigate('Home')}>
              <Text style={styles.backButton}>{t('BACK', this.state.fi)}</Text>
            </TouchableOpacity>
            <Text style={styles.upperButton}>{t('PLACES', this.state.fi)}</Text>
          </View>

          <ScrollView style={styles.boxesInside}>
            <ArrangeList
              list={this.state.allLocations}
              location={this.state.location}
              navigation={navigate}
            />
          </ScrollView>
        </View>
        <Text style={styles.bottomUpper}></Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    flex: 1,
  },

  bothButtons: {
    flexDirection: 'row',
    backgroundColor: '#2C656B',
    color: '#F7F7F7',
    paddingVertical: hp('0.5%'),
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  backButton: {
    flex: 1,
    fontSize: hp('2%'),
    color: '#F7F7F7',
    backgroundColor: '#2C656B',
    alignSelf: 'center',
    marginLeft: wp('2%'),
    textAlignVertical: 'center',
  },

  upperButton: {
    flex: 1,
    fontSize: hp('3.5%'),
    color: '#F7F7F7',
    backgroundColor: '#2C656B',
    marginLeft: wp('25%'),
    //:DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
  },
  boxDistance: {
    flex: 1,
    color: '#043353',
    alignSelf: 'center',
    fontSize: hp('2%'),
  },

  boxImage: {
    height: hp('5%'),
    flex: 1,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  placeBoxText: {
    flex: 3,
    color: '#043353',
    alignSelf: 'center',
    marginLeft: wp('2%'),

    fontSize: hp('2.5%'),
  },
  box: {
    color: '#D4DDE6',
    height: hp('9%'),
    borderColor: '#D4DDE6',
    borderWidth: 2,
    flexDirection: 'row',
  },
  boxesInside: {
    flex: 1,
    flexDirection: 'column',
  },
  placesBox: {
    flex: 2,
    backgroundColor: '#F7F7F7',
    borderColor: '#2C656B',
    borderRadius: 30,
    borderWidth: 3,
    width: wp('90%'),
    overflow: 'hidden',
  },

  upperBottom: {
    height: hp('6%'),
  },

  bottomUpper: {
    height: hp('2%'),
  },
})
