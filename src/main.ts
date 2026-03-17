import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n } from './i18n'
import { router } from './router'
import { installSeo } from './utils/seo'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBookOpen,
  faCamera,
  faCheck,
  faChevronDown,
  faClockRotateLeft,
  faFileArrowDown,
  faFilm,
  faImage,
  faLayerGroup,
  faMagnifyingGlass,
  faObjectGroup,
  faPen,
  faPlus,
  faSliders,
  faTrashCan,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faCopy, faFloppyDisk, faLightbulb } from '@fortawesome/free-regular-svg-icons'

library.add(
  faBookOpen,
  faCamera,
  faCheck,
  faChevronDown,
  faClockRotateLeft,
  faFileArrowDown,
  faFilm,
  faImage,
  faLayerGroup,
  faMagnifyingGlass,
  faObjectGroup,
  faPen,
  faPlus,
  faSliders,
  faTrashCan,
  faWandMagicSparkles,
  faXmark,
  faCopy,
  faFloppyDisk,
  faLightbulb,
)

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon).use(i18n).use(router)

installSeo(router, i18n)

app.mount('#app')
