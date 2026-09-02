import i18n from '@/i18n/i18n'

export default {
  install: (app) => {

    const metadata = JSON.parse(localStorage.getItem('metadata'));
    const { t } = i18n.global;

    const opcionsTotesSiNo = () => {
      return [
        {valor: null, clau: t('App.Totes')},
        {valor: true, clau: t('App.Si')},
        {valor: false, clau: t('App.No')},
      ];
    }

    const centres = () => {
      return (metadata.centres || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    const departaments = () => {
      return (metadata.departaments || []).sort((a, b) => a.id - b.id);
    }

    const funcions = () => {
      return (metadata.funcions || []).sort((a,b) => a.id - b.id);
    }

    const empleats = () => {
      return (metadata.empleats || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    app.config.globalProperties.$opcionsTotesSiNo = opcionsTotesSiNo;
    app.config.globalProperties.$centres = centres();
    app.provide('centres', centres);
    app.config.globalProperties.$departaments = departaments();
    app.provide('departaments', departaments);
    app.config.globalProperties.$funcions = funcions();
    app.provide('funcions', funcions);
    app.config.globalProperties.$empleats = empleats();
    app.provide('empleats', empleats);
  },
};