import React, { Component, Fragment, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Navigator,
  Image,
  Dimensions,
  ScrollView,
  Button,
  AsyncStorage,
} from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { getDistance, getPreciseDistance } from 'geolib'

import { t } from '../Locales'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height

const ListItem = (props) => {
  return (
    <TouchableOpacity
      key={props.name}
      style={styles.box}
      onPress={() => {
        props.navigation('Map', { coordinates: props.coordinates })
        //console.log(props.name)
      }}
    >
      <Text style={styles.placeBoxText}>{props.name}</Text>
      <Text style={styles.boxDistance}>{props.distance}m</Text>
      <Image
        source={require('../assets/Ikonit/Markkerit/Marker_3-01.png')}
        style={styles.boxImage}
      />
    </TouchableOpacity>
  )
}

async function updateList(list) {
  /*  console.log(list)
  try {
    const val = AsyncStorage.getItem('AllPlaces')
    if (val !== null) {
      try {
        await AsyncStorage.mergeItem('AllPlaces', JSON.stringify(list))
        console.log('UPDATED')
      } catch (e) {
        console.log('ERROR HAPPENED ON UPDATING PLACES')
        console.log(e)
      }
    }
  } catch (error) {
    console.log(error)
  }
  */
  AsyncStorage.getItem('AllPlaces').then((value) => {
    if (value !== null) {
      try {
        AsyncStorage.mergeItem('AllPlaces', JSON.stringify(list))
        console.log('UPDATED')
      } catch (e) {
        console.log('ERROR HAPPENED ON UPDATING PLACES')
        console.log(e)
      }
    }
  })
}
const ArrangeList = (props) => {
  const list = props.list
  const location = props.location
  var newList
  var dis = 0
  //console.log(list[0])
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
  //updateList(list)
  var cutList = list !== null ? list.slice(0, 5) : []
  //const distances = list.map((item) => ())
  return cutList.map((item, index) => {
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

class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fi: true,
      flagUri: require('../assets/Ikonit/Kielivalinta/Lippu2-01.png'),
      location: null,
      errorMessage: '',
      allLocations: [],
      ready: false,
      visitedCount: 0,
      visitedArray: [],
      lastPlace: '',
    }
    this._CountHistory
  }

  _getLocation = async () => {
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

  _getItem = async (key) => {
    try {
      await AsyncStorage.getItem(key, (err, value) => {
        if (err) {
          console.log(err)
        } else {
          value = JSON.parse(value)
          console.log('Palautusarvo on:')
          console.log(value)
          return value
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  _setItem = async (key, lang) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(lang))
    } catch (error) {
      console.log('THERE HAS BEEN AN ERROR SAVING DATA', error)
    }
  }

  _languageChanged(event) {
    this.setState({ fi: !this.state.fi })
    this._setItem('fi', this.state.fi)
    this.setState({
      flagUri: this.state.fi
        ? require('../assets/Ikonit/Kielivalinta/Lippu1-01.png')
        : require('../assets/Ikonit/Kielivalinta/Lippu2-01.png'),
    })
    //this._getItem('FIN')
  }
  static navigationOptions = ({ navigation }) => {
    return {}
  }

  changeScreen = () => {
    console.log('changeeeeee')
    this.navigation.navigate('Map', { fi: this.state.fi })
  }

  _CountHistory = () => {
    //SAMU TÄÄLLÄ ON TÄMÄ TIETO
    var data = this.state.visitedPlaces
    var luk = 0
    this.setState({ visitedCount: luk })
    if (data !== null) {
      luk = data.split('place').length - 1
      this.setState({ visitedCount: luk })
      data = data.split('}')
      data = data.map((m) => (m = m.substring(1)))
      data = data.map((d) => d.split(','))
      data = data.slice(0, -1)
      data.forEach((el) => {
        el.forEach((piece, index) => {
          el[index] = piece.split(':').pop()
          el[index] = el[index].replace(/^"(.+(?="$))"$/, '$1')
        })
      })
    }

    //console.log(data[0][1])
    var lastItem = data !== null ? data.slice(-1)[0] : '-'
    this.setState({ visitedArray: data })
    this.setState({ lastPlace: lastItem })
    //console.log(this.state.visitedArray)
  }

  async componentDidUpdate() {
    var visitedPlaces = await AsyncStorage.getItem('Key')
    if (this.state.visitedPlaces !== visitedPlaces) {
      console.log('visitedPlaces päivitettiin')
      this.setState({ visitedPlaces: visitedPlaces })
      this._CountHistory()
    }
  }

  async componentDidMount() {
    this.timer = setInterval(() => {
      this._CountHistory()
    }, 5000)
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
    try {
      var visitedPlaces = await AsyncStorage.getItem('Key')
      this.setState({ visitedPlaces: visitedPlaces })
      this._CountHistory()
    } catch (e) {
      console.log(e)
    }
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

  render() {
    const { fi } = this.state
    const { navigate } = this.props.navigation

    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              this._languageChanged(this)
              //this.getkeys()
            }}
            //style={styles.flag}
          >
            <Image source={this.state.flagUri} style={styles.flagImage} />
          </TouchableOpacity>
        </View>
        <Image
          source={require('../assets/Logo/Logo_2-01.png')}
          style={styles.image}
        />
        <View style={styles.placesBox}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('Places', { fi: this.state.fi })
            }
          >
            <Text style={styles.upperButton}>{t('PLACES', this.state.fi)}</Text>
          </TouchableOpacity>
          <View style={styles.boxesInside}>
            <ArrangeList
              list={this.state.allLocations}
              location={this.state.location}
              navigation={navigate}
            />
          </View>

          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('Places', { fi: this.state.fi })
            }
          >
            <Text style={styles.lowerButton}>
              {t('SHOW_MORE', this.state.fi)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.history}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('History', {
                fi: this.state.fi,
                visitedArray: this.state.visitedArray,
              })
            }
          >
            <Text style={styles.upperButton}>
              {t('HISTORY', this.state.fi)}
            </Text>
          </TouchableOpacity>

          <View style={styles.historyCounter}>
            <Text style={styles.historyPlacesVisited}>
              {t('PLACES_VISITED', this.state.fi)}:{this.state.visitedCount}
            </Text>
            <Text style={styles.boxTimesUsed}>
              {t('TIMES_USED', this.state.fi)}: {this.state.visitedCount}
            </Text>
          </View>

          <View style={styles.historyVisitedPlaces}>
            <TouchableOpacity style={styles.box}>
              <Text style={styles.historyBoxText}>
                {this.state.lastPlace[0]}
              </Text>
              <Text style={styles.boxDate}>{this.state.lastPlace[1]}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('History', {
                  fi: this.state.fi,
                  visitedArray: this.state.visitedArray,
                })
              }
            >
              <Text style={styles.lowerButton}>
                {t('SHOW_MORE', this.state.fi)}
              </Text>
            </TouchableOpacity>
          </View>
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

  historyCounter: {
    flex: 1,
    flexDirection: 'row',
  },

  historyVisitedPlaces: {
    flex: 3,
  },

  boxTimesUsed: {
    flex: 1,
    flexDirection: 'row',
    color: '#043353',
    fontSize: hp('2%'),
    alignSelf: 'center',
    textAlignVertical: 'center',
  },

  boxDate: {
    flex: 1,
    flexDirection: 'row',
    color: '#043353',
    fontSize: hp('2.5%'),
    alignSelf: 'center',
    textAlignVertical: 'center',
  },

  boxesInside: {
    flex: 1,
    flexDirection: 'column',
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

  historyBoxText: {
    flex: 1.5,
    color: '#043353',
    alignSelf: 'center',
    marginLeft: wp('2%'),
    fontSize: hp('2.5%'),
  },

  historyPlacesVisited: {
    flex: 1.5,
    color: '#043353',
    alignSelf: 'center',
    fontSize: hp('2%'),
    marginLeft: wp('2%'),
  },

  box: {
    flex: 1,
    color: '#D4DDE6',

    borderColor: '#2C656B',
    borderWidth: 0.9,
    flexDirection: 'row',
  },

  image: {
    width: wp('20%'),
    height: hp('13%'),
    top: hp('2%'),
  },

  lowerButton: {
    backgroundColor: '#2C656B',
    color: '#F7F7F7',
    fontSize: hp('3%'),

    paddingVertical: hp('0.1%'),
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    textAlign: 'center',
  },

  upperButton: {
    backgroundColor: '#2C656B',
    color: '#F7F7F7',
    fontSize: hp('3.5%'),

    paddingVertical: hp('0.5%'),
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    textAlign: 'center',
  },

  placesBox: {
    flex: 2,
    backgroundColor: '#F7F8F3',
    borderColor: '#2C656B',
    borderRadius: 30,
    borderWidth: 3,

    width: wp('90%'),

    overflow: 'hidden',
  },
  history: {
    flex: 1,
    backgroundColor: '#F7F8F3',
    borderColor: '#2C656B',
    borderRadius: 30,
    borderWidth: 3,

    width: wp('90%'),

    overflow: 'hidden',
    top: '2%',
  },

  bottomUpper: {
    height: hp('4%'),
  },
  flag: {
    borderWidth: 5,
    borderColor: '#F00',
    //backgroundColor: '#213577',
    //color: '#9ACD32',
    width: 50,
    height: 50,
    left: 0,
    //position: "absolute",
    //alignItems: 'flex-start'
  },
  topBar: {
    flex: 1,
    alignItems: 'center',
    //flexDirection: 'row',
    //justifyContent: 'space-between',
    borderColor: '#F00',
    //backgroundColor: '#000',
    position: 'absolute',
    left: 20,
    top: 45,
  },
  flagImage: {
    height: 50,
    width: 100,
    resizeMode: 'contain',

    //position: 'absolute',
    //left: 20,
    //top: 45
  },
})

export default HomeScreen
