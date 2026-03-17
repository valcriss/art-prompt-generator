import { watch } from 'vue'
import type { Router } from 'vue-router'

const APP_NAME = 'Art Prompt Generator'
const DEFAULT_IMAGE_PATH = '/social-preview.svg'
const STRUCTURED_DATA_ID = 'app-structured-data'

type SeoRouteName = 'landing' | 'studio-builder' | 'studio-library' | 'studio-templates' | 'studio-history'

type SeoI18n = {
  global: {
    locale: string | { value: string }
    t: (key: string) => unknown
  }
}

const seoRouteKeys: Record<SeoRouteName, { title: string; description: string }> = {
  landing: {
    title: 'seo.routes.landing.title',
    description: 'seo.routes.landing.description',
  },
  'studio-builder': {
    title: 'seo.routes.builder.title',
    description: 'seo.routes.builder.description',
  },
  'studio-library': {
    title: 'seo.routes.library.title',
    description: 'seo.routes.library.description',
  },
  'studio-templates': {
    title: 'seo.routes.templates.title',
    description: 'seo.routes.templates.description',
  },
  'studio-history': {
    title: 'seo.routes.history.title',
    description: 'seo.routes.history.description',
  },
}

function ensureMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function ensureLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function setStructuredData(
  routeName: SeoRouteName,
  locale: string,
  description: string,
  translate: (key: string) => string,
) {
  let script = document.getElementById(STRUCTURED_DATA_ID)

  if (!script) {
    script = document.createElement('script')
    script.id = STRUCTURED_DATA_ID
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }

  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'SoftwareApplication',
      name: APP_NAME,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      inLanguage: locale,
      description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        translate('seo.structuredData.features.builder'),
        translate('seo.structuredData.features.library'),
        translate('seo.structuredData.features.preview'),
      ],
    },
  ]

  if (routeName === 'landing') {
    const faqKeys = ['what', 'comfyui', 'video', 'save']

    graph.push({
      '@type': 'FAQPage',
      inLanguage: locale,
      mainEntity: faqKeys.map((key) => ({
        '@type': 'Question',
        name: translate(`landing.faq.items.${key}.question`),
        acceptedAnswer: {
          '@type': 'Answer',
          text: translate(`landing.faq.items.${key}.answer`),
        },
      })),
    })
  }

  script.textContent = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
    null,
    2,
  )
}

function toAbsoluteUrl(path: string) {
  return new URL(path, window.location.origin).toString()
}

function getLocaleValue(locale: string | { value: string }) {
  return typeof locale === 'string' ? locale : locale.value
}

function getActiveRouteName(router: Router): SeoRouteName {
  const currentName = router.currentRoute.value.name

  if (typeof currentName === 'string' && currentName in seoRouteKeys) {
    return currentName as SeoRouteName
  }

  return 'landing'
}

export function installSeo(router: Router, i18n: SeoI18n) {
  const composer = i18n.global
  const translate = (key: string) => String(composer.t(key))

  const applySeo = () => {
    const locale = getLocaleValue(composer.locale)
    const routeName = getActiveRouteName(router)
    const routeSeo = seoRouteKeys[routeName]
    const pageTitle = translate(routeSeo.title)
    const description = translate(routeSeo.description)
    const keywords = translate('seo.keywords')
    const socialImage = toAbsoluteUrl(DEFAULT_IMAGE_PATH)
    const canonicalUrl = window.location.href.split('#')[0]

    document.documentElement.lang = locale
    document.title = `${pageTitle} | ${APP_NAME}`

    ensureMeta('name', 'description', description)
    ensureMeta('name', 'keywords', keywords)
    ensureMeta('name', 'robots', 'index,follow')
    ensureMeta('name', 'application-name', APP_NAME)
    ensureMeta('property', 'og:type', 'website')
    ensureMeta('property', 'og:title', `${pageTitle} | ${APP_NAME}`)
    ensureMeta('property', 'og:description', description)
    ensureMeta('property', 'og:url', canonicalUrl)
    ensureMeta('property', 'og:site_name', APP_NAME)
    ensureMeta('property', 'og:locale', locale === 'fr' ? 'fr_FR' : 'en_US')
    ensureMeta('property', 'og:image', socialImage)
    ensureMeta('name', 'twitter:card', 'summary_large_image')
    ensureMeta('name', 'twitter:title', `${pageTitle} | ${APP_NAME}`)
    ensureMeta('name', 'twitter:description', description)
    ensureMeta('name', 'twitter:image', socialImage)
    ensureMeta('name', 'twitter:image:alt', translate('seo.twitterImageAlt'))
    ensureLink('canonical', canonicalUrl)

    setStructuredData(routeName, locale, description, translate)
  }

  router.afterEach(() => {
    applySeo()
  })

  watch(
    () => getLocaleValue(composer.locale),
    () => {
      applySeo()
    },
  )

  router.isReady().then(() => {
    applySeo()
  })
}