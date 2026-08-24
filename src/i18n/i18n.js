import { createI18n } from 'vue-i18n'
import * as ca from './ca.json'
import * as en from './en.json'
import * as en_us from './en-US.json'
import * as es from './es.json'
import * as hu from './hu.json'
import * as zh from './zh.json'

  const messages = {
      'ca-ES': {
        ...ca
      },
      'en-US': {
        ...en,
        ...en_us,
      },
      'en-GB': {
        ...en
      },
      'es-ES': {
        ...es
      },
      'hu-HU': {
        ...hu
      },
      'zh-CN': {
        ...zh
      }
    }

  const numberFormats = {
    'ca-ES': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    },
    'en-US': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    },
    'en-GB': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    },
    'es-ES': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    },
    'hu-HU': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumSignificantDigits: 2, maximumSignificantDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    },
    'zh-CN': {
      currency: {
        style: 'currency', currency: 'EUR', useGrouping: true, currencyDisplay: 'symbol'
      },
      decimal: {
        style: 'decimal', minimumSignificantDigits: 2, maximumSignificantDigits: 2
      },
      decimalLong: {
        style: 'decimal', minimumFractionDigits: 3
      },
      percent: {
        style: 'percent', useGrouping: false
      }
    }
  }
  
  const datetimeFormats = {
    'ca-ES': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }
    },
    'en-US': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }
    },
    'en-GB': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }
    },
    'es-ES': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }
    },
    'hu-HU': {
      short: {
        year: 'numeric', month: 'numeric', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: false
      }
    },
    'zh-CN': {
      short: {
        year: 'numeric', month: 'numeric', day: 'numeric'
      },
      long: {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: false
      }
    }
  }

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'ca-ES', // set locale
    fallbackLocale: 'ca-ES', // set fallback locale
    messages, // set locale messages
    datetimeFormats,
    numberFormats
  })

export default (
    i18n
)