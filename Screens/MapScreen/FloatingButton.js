import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { AntDesign, Entypo } from '@expo/vector-icons'
import Animated from 'react-native-reanimated'

export default class FloatingButton extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableWithoutFeedback onPress={this.props.toggle}>
          <Animated.View style={[styles.button, styles.menu]}>
            <AntDesign name={this.props.iconName} size={35} color='#5900FF' />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute'
  },
  button: {
    //position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 60 / 2,
    borderColor: '#000',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 10,
    shadowColor: '#F02A4B',
    shadowOffset: 0.3,
    shadowOffset: { height: 10 }
  },
  menu: {
    backgroundColor: '#FFF'
  }
})
