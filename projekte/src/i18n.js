import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: (navigator.language || 'de').split('-')[0],
  fallbackLng: 'de',
  resources: { de: { translation: {} } }
})
export default i18n
