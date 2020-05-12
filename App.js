import React from 'react'
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  AsyncStorage,
} from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabNavigator } from 'react-navigation-tabs'

import { Ionicons } from '@expo/vector-icons'
import mapScreen from './Screens/MapScreen/MapScreen'
import QrScreen from './Screens/QrScreen'
import HomeScreen from './Screens/HomeScreen'
import HistoryScreen from './Screens/HistoryScreen/HistoryScreen'
import PlacesScreen from './Screens/PlacesScreen'
import { AuthSession } from 'expo'

class LogoTitle extends React.Component {
  render() {
    return (
      <Image
        source={require('./assets/Ikonit/Kartta/Map_3-01.png')}
        style={{ width: 30, height: 30 }}
      />
    )
  }
}

const getTabBarIcon = (navigation, focused, tintColor) => {
  const { routeName } = navigation.state

  let IconComponent = Ionicons
  let iconName
  let iconSize = 25
  if (routeName === 'Home') {
    iconName = `ios-information-circle${focused ? '' : '-outline'}`
  } else if (routeName === 'Map') {
    iconName = `ios-map`
  } else if (routeName === 'QRcode') {
    iconName = `ios-camera`
  }

  if (routeName === 'Home') {
    return (
      <Image
        source={require('./assets/Ikonit/Home/Home-01.png')}
        style={{ width: 30, height: 30, opacity: focused ? 1 : 0.4 }}
      />
    )
  } else if (routeName === 'Map') {
    return (
      <Image
        source={require('./assets/Ikonit/Kartta/Map_3-01.png')}
        style={{ width: 30, height: 30, opacity: focused ? 1 : 0.4 }}
      />
    )
  } else if (routeName === 'QRcode') {
    return (
      <Image
        source={require('./assets/Ikonit/QR/QR_2-01.png')}
        style={{ width: 30, height: 30, opacity: focused ? 1 : 0.4 }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d12a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placesNearby: {
    flex: 1,
    backgroundColor: '#bfcfff',
    borderColor: '#043353',
    borderRadius: 10,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },

  header: {},
})

const HomeStack = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Places: { screen: PlacesScreen },
    History: { screen: HistoryScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
)

const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
}

export default createAppContainer(
  createBottomTabNavigator(
    {
      Map: { screen: mapScreen },
      Home: { screen: HomeStack },
      QRcode: { screen: QrScreen },
    },
    {
      defaultNavigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) =>
          getTabBarIcon(navigation, focused, tintColor),
      }),
      initialRouteName: 'Home',

      tabBarOptions: {
        activeTintColor: '#043353',
        inactiveTintColor: '#cad4db',
      },
    }
  )
)
