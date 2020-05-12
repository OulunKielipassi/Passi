import React, { Component, useState } from 'react'
import { Button, StyleSheet, Text, View, Image, Dimensions, Modal } from 'react-native'
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  FlatList,
} from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import placehistory from './placehistory'
import { t } from '../../Locales'

const ScreenWidth = Dimensions.get('window').width
const ScreenHeight = Dimensions.get('window').height


const ListItem = (props) => {
    const [visible, setVisible] = useState(false)

    const buttonPress = () => {
      show = show ? false : true
      console.log("pressed button")
      console.log(show)
    }

    return (
    <TouchableOpacity style={styles.listItem} onPress={()=> {setVisible(!visible)}}>
      <Modal
           animated = {true}
           
           transparent={true}
           visible={visible}
           >
           
           <View style={styles.Modal} >
            
             <ScrollView>
             <Text style={styles.Text}>{props.place}</Text>
             <Text style={styles.Text}>{props.date}</Text>
             
             <Text style={styles.Text}>{props.phrase}</Text>
               
             </ScrollView>
             <Button
                onPress={() => {
                  setVisible(!visible)
                }}
                color ='#2C656B'
                title ='Close'
                
               />
           </View>
           
         </Modal>
        <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          //flex: 1
        }}
      >
        <View>
          <Text style={{ fontSize: 19 }}>{props.place}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 19 }}>{props.date}</Text>
        </View>
      </View>
      
      
    </TouchableOpacity>
    
  )
}

export default class HistoryScreen extends Component {
  static navigationOptions = {
    title: 'Welcome',
  }
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      enabled: true,
      fi: this.props.navigation.state.params.fi,
      visitedPlaces: this.props.navigation.state.params.visitedArray,
      
    }
  }

  ButtonPressed = e => {
    console.log(e)
    this.setState({show: true})
  }
  ButtonNotPressed = e => {
    console.log(e)
    this.setState({show:false})
  }
  //const noPress = () => this.setState({show:false})

  async componentDidMount() {
    this.setState({ visitedPlaces: this.state.visitedPlaces.reverse() })
  }


  render() {
    const { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <View style={styles.History}>
          <View style={styles.bluebar}>
            <TouchableOpacity
              style={styles.Backbutton}
              onPress={() => navigate('Home')}
            >
              <Text style={styles.Backbutton}>{t('BACK', this.state.fi)}</Text>
            </TouchableOpacity>

            <View style={styles.HistoryText}>
              <Text style={styles.HistoryText}>
                {t('HISTORY', this.state.fi)}
              </Text>
            </View>
            <View style={styles.blank}>
              <Text></Text>
            </View>
          </View>
          <View style={styles.counteritem}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}
            >
              <Text>
                {t('PLACES_VISITED', this.state.fi)}:{' '}
                {this.state.visitedPlaces.length}
              </Text>
              <Text>
                {t('TIMES_USED', this.state.fi)}:
                {this.state.visitedPlaces.length}
              </Text>
            </View>
          </View>
          
          <FlatList
            style={{ flex: 1 }}
            data={this.state.visitedPlaces}
            renderItem={({ item, index }) => (   
              
              <ListItem key={index} place={item[0]} date={item[1]} phrase={item[2]} func={this.ButtonPressed}/>
              

            )}
            keyExtractor={(item, index) => 'key' + index} 
                
          />
         
        </View>

        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  Text: {
    alignSelf: 'center',
    fontSize: 19
  },
  Modal: {
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2C656B', 
    padding: 30,
    
    top : (ScreenHeight * 25)/100,
    height: (ScreenHeight * 50)/100,
    width: (ScreenWidth * 80) / 100,
    alignSelf: 'center'
  },
  safeArea: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    //height: ScreenHeight,
    backgroundColor: '#E8E8E8',
    padding: 30,
    paddingTop: 40,
  },
  History: {
    //padding: 30,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#2C656B',
    flex: 1,
    //height: ScreenHeight,
    bottom: 0,
    top: 0,
    overflow: 'hidden'

    //alignItems: 'center'
  },
  Backbutton: {
    alignSelf: 'flex-start',
    //flex: 1,
    fontSize: 14,
    color: '#fff',
    //position: 'absolute'
  },
  HistoryText: {
    alignSelf: 'center',
    //flex: 1,
    fontSize: 24,
    color: '#fff',
  },
  blank: {
    //flex: 1,
    fontSize: 24,
  },
  bluebar: {
    flex: 0.07,
    backgroundColor: '#2C656B',
    padding: 10,
    paddingRight: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    //position: 'absolute'
  },
  counteritem: {
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#000',
    flex: 0.1,
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  listItem: {
    borderWidth: 2,
    paddingVertical: 20,
    borderColor: '#D4DDE6',
    padding: 10,
  },
  hairline: {
    backgroundColor: '#A2A2A2',
    height: 3,
    width: (ScreenWidth * 75) / 100,
    alignSelf: 'center',
  },
})
