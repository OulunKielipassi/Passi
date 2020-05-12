import React, { Component } from 'react'
import { Button, StyleSheet, Text, View, Dimensions } from 'react-native'
import { MapView, Marker } from 'react-native-maps'
import Permissions from 'expo'

const longitude = 65.01
const latitude = 65.011358
const latitudeDelta = 0.02
const longitudeDelta = 0.02

const marker = {
  longitude: 65.01,
  latitude: 25.466,
  title: 'Tässä on villa victor'
}
const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 }

const FitMarkers = () => {
  this.map.fitToCoordinates(marker, {
    edgePadding: DEFAULT_PADDING,
    animated: true
  })
}

class mapScreen extends React.Component {
  static navigationOptions = {
    title: 'Deeetails! :)'
  }

  getInitialState() {
    return {
      region: {
        latitude: 65.011358,
        longitude: 25.464249,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      }
    }
  }

  onRegionChange(region) {
    this.setState({ region })
  }

  render() {
    //const { locations, position } = this.props.route.params
    const { navigation } = this.props
    return (
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          initialRegion={(latitude, longitude, latitudeDelta, longitudeDelta)}
          onRegionChange={this.onRegionChange}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            draggable
            coordinate={{
              latitude: 37.78825,
              longitude: -122.4324
            }}
            onDragEnd={e => alert(JSON.stringify(e.nativeEvent.coordinate))}
            title={'Test Marker'}
            description={'This is a description of the marker'}
          />
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
})

export default mapScreen
