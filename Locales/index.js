import I18n from 'ex-react-native-i18n'
import { Localization } from 'expo-localization'
import { AsyncStorage } from 'react-native'

import en from './en.json'
import fi from './fi.json'

I18n.translations = {
  fi,
  en
}

export function t(name, lang) {
  I18n.locale = lang ? 'fi' : 'en'
  return I18n.t(name)
}
