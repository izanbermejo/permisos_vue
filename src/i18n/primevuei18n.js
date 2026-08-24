import i18n from '@/i18n/i18n';

export default {
  install: (app) => {

    const { t, tm } = i18n.global;
    
    const translatePrime = (primevue) => {
      primevue.config.locale.accept = t('Primevue.accept');
      primevue.config.locale.reject = t('Primevue.reject');
      primevue.config.locale.emptyMessage = t('Primevue.emptyMessage');
      primevue.config.locale.weekHeader = t('Primevue.weekHeader');
      primevue.config.locale.monthNames = tm('Primevue.monthNames');
      primevue.config.locale.dayNamesMin = tm('Primevue.dayNamesMin');
      primevue.config.locale.firstDayOfWeek = t('Primevue.firstDayOfWeek');
      primevue.config.locale.dateFormat = t('Primevue.dateFormat');
    }

    app.provide("translatePrime", translatePrime);
  }
}