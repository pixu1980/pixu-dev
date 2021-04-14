import DefaultLayout from '~/layouts/Default.vue'

import VueScrollTo from 'vue-scrollto'
import './assets/styles/main.scss'

import {
  library
} from '@fortawesome/fontawesome-svg-core'

import {
  faTrophy,
  faRss,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

import {
  faGithub,
  faGitAlt,
  faTwitter,
  faFacebook,
  faLinkedin,
  faHtml5,
  faJsSquare,
  faMarkdown,
  faCss3Alt,
  faAngular,
  faReact,
  faVuejs,
  faNodeJs,
  faSass,
  faLess,
  faCodepen,
  faGulp,
  faGrunt,
  faNpm,
  faSketch,
  faDAndD,
  faCreativeCommons,
} from '@fortawesome/free-brands-svg-icons'

import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'

library.add(
  faGithub,
  faGitAlt,
  faTwitter,
  faFacebook,
  faLinkedin,
  faTrophy,
  faHtml5,
  faCss3Alt,
  faJsSquare,
  faMarkdown,
  faAngular,
  faReact,
  faVuejs,
  faNodeJs,
  faSass,
  faLess,
  faCodepen,
  faGulp,
  faGrunt,
  faNpm,
  faRss,
  faCheck,
  faSketch,
  faDAndD,
  faCreativeCommons,
)

export default function (Vue, {
  head,
}) {
  Vue.use(VueScrollTo)
  Vue.component('Layout', DefaultLayout)

  Vue.component('font-awesome', FontAwesomeIcon)

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Saira+Extra+Condensed:500,700'
  })
  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Muli:400,400i,800,800i'
  })
}
