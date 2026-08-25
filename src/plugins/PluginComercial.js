import i18n from '@/i18n/i18n'

export default {
  install: (app) => {

    const { t } = i18n.global;

    const opcionsTotesSiNo = () => {
      return [
        {valor: null, clau: t('App.Totes')},
        {valor: true, clau: t('App.Si')},
        {valor: false, clau: t('App.No')},
      ];
    }

    app.config.globalProperties.$opcionsTotesSiNo = opcionsTotesSiNo;
  },
};