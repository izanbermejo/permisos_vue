import moment from "moment";
import i18n from '@/i18n/i18n'

export default {
  install: (app) => {

    const metadata = JSON.parse(localStorage.getItem('metadata'));
    const { t } = i18n.global;

    const motiusDisponibles = () => [
      { key: 'ENDARRELIMENT_FABRICA', label: t('Albarans.MotiuEndarrelimentFabrica') },
      { key: 'QUALITAT_FABRICA',      label: t('Albarans.MotiuQualitatFabrica') },
      { key: 'INCIDENCIA_TRANSPORT',  label: t('Albarans.MotiuIncidenciaTransport') },
      { key: 'ERROR_LOGISTIC_AMES',   label: t('Albarans.MotiuErrorLogisticAmes') },
      { key: 'ERROR_MAGATZEM',        label: t('Albarans.MotiuErrorMagatzem') },
      { key: 'ALTRES',                label: t('Albarans.MotiuAltres') },
    ];

    const divisesDisponibles = () => [
      { key: 'CNY',   label: 'CNY' },
      { key: 'EUR',   label: 'EUR' },
      { key: 'GBP',   label: 'GBP' },
      { key: 'HUF',   label: 'HUF' },
      { key: 'USD',   label: 'USD' }
    ];

    const opcionsTotesSiNo = () => {
      return [
        {valor: null, clau: t('App.Totes')},
        {valor: true, clau: t('App.Si')},
        {valor: false, clau: t('App.No')},
      ];
    }

    const opcionsTotsObertsTancats = () => {
      return [
        {valor: null, clau: t('App.Tots')},
        {valor: false, clau: t('App.Oberts')},
        {valor: true, clau: t('App.Tancats')},
      ];
    }

    const opcionsServible = () => {
      return [
        {valor: 'NO_APLICA', clau: t('Comandes.No aplica')},
        {valor: 'TOT', clau: t('Comandes.Tot')},
        {valor: 'RES', clau: t('Comandes.Cap')},
        {valor: 'PARCIAL', clau: t('Comandes.Parcial')},
        {valor: 'NO', clau: t('App.No')},
      ];
    }

    const formesEnviament = () => {
      let resultat = [];
      (metadata.formesEnviament || []).forEach(f => {
        let newF = {};
        newF.codi = f.codi;
        newF.nom = t(`FormaEnviament.${f.codi}`);
        resultat.push(newF);
      });
      return resultat.sort((a,b) => a.nom.localeCompare(b.nom));
    }

    const incoterms = () => {
      return (metadata.incoterms || []).sort((a,b) => a.codi.localeCompare(b.codi));
    }

    const transportistes = () => {
      return (metadata.transportistes || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    const transportista = (codiTransportista) => {
      let trans = (metadata.transportistes || []).filter(t => t.codi === codiTransportista)[0];
      return trans ? `${trans.codi} - ${trans.nom}` : codiTransportista;
    }

    const paisos = () => {
      return (metadata.paisos || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    const pais = (codiPais) => {
      let pais = (metadata.paisos || []).filter(p => p.codi === codiPais)[0];
      return pais ? `${pais.codi} - ${pais.nom}` : codiPais;
    }

    const destiTransport = (codiDesti) => {
      let desti = (metadata.destinsTransport || []).filter(d => d.codi === codiDesti)[0];
      return desti ? `${desti.codi} - ${desti.nom}` : codiDesti;
    }

    const empreses = () => {
      return (metadata.empreses || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    const empresa = (codiEmpresa) => {
      let empresa = (metadata.empreses || []).filter(e => e.codi === codiEmpresa)[0];
      return empresa ? `${empresa.codi} - ${empresa.nom}` : codiEmpresa;
    }

    const magatzems = () => {
      return (metadata.magatzems || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    // Usuaris que han creat albarans en els darrers dos anys; el codi és l'id d'empleat del Keycloak
    const usuarisCreadorsAlbarans = () => {
      return (metadata.usuarisCreadorsAlbarans || []).sort((a,b) => a.nom.trim().localeCompare(b.nom.trim()));
    }

    const magatzem = (codiMagatzem) => {
      let magatzem = (metadata.magatzems || []).filter(m => m.codi === codiMagatzem)[0];
      return magatzem ? `${magatzem.codi} - ${magatzem.nom}` : codiMagatzem;
    }

    const fabrica = (codiFabrica) => {
      let fabrica = (metadata.fabriques || []).filter(f => f.codi === codiFabrica)[0];
      return fabrica ? `${fabrica.codi} - ${fabrica.nom}` : codiFabrica;
    }
    
    const toDate = (dateStr) => {
      if (!dateStr)
        return null;
      // En cas que contingui T vol dir que es un dateTime
      if (dateStr.includes('T'))
        return toDateTime(dateStr);
      var parts = dateStr.split("-");
      return new Date(parts[0], parts[1]-1, parts[2]);
    }

    const toDateTime = (dateStr) => {
      return new Date(dateStr);
    }

    const daysDiffNow = (dateStr) => {
      return moment(dateStr).diff(moment(), 'days');
    }

    app.config.globalProperties.$divisesDisponibles = divisesDisponibles();
    app.provide("divisesDisponibles", divisesDisponibles());
    app.config.globalProperties.$motiusDisponibles = motiusDisponibles();
    app.provide("motiusDisponibles", motiusDisponibles());
    app.config.globalProperties.$opcionsTotesSiNo = opcionsTotesSiNo;
    app.config.globalProperties.$opcionsTotsObertsTancats = opcionsTotsObertsTancats;
    app.config.globalProperties.$opcionsServible = opcionsServible;
    app.config.globalProperties.$paisos = paisos();
    app.provide("paisos", paisos());
    app.config.globalProperties.$pais = pais;
    app.provide("pais", pais);
    app.config.globalProperties.$transportistes = transportistes();
    app.provide("transportistes", transportistes());
    app.config.globalProperties.$transportista = transportista;
    app.provide("transportista", transportista);
    app.config.globalProperties.$formesEnviament = formesEnviament();
    app.provide("formesEnviament", formesEnviament());
    app.config.globalProperties.$incoterms = incoterms();
    app.provide("incoterms", incoterms());
    app.config.globalProperties.$destinsTransport = metadata.destinsTransport;
    app.provide("destinsTransport", metadata.destinsTransport);
    app.config.globalProperties.$destiTransport = destiTransport;
    app.provide("destiTransport", destiTransport);
    app.config.globalProperties.$empreses = empreses();
    app.provide("empreses", empreses());
    app.config.globalProperties.$empresa = empresa;
    app.provide("empresa", empresa);
    app.config.globalProperties.$magatzems = magatzems();
    app.provide("magatzems", magatzems());
    app.config.globalProperties.$magatzem = magatzem;
    app.provide("magatzem", magatzem);
    app.config.globalProperties.$fabrica = fabrica;
    app.provide("fabrica", fabrica);
    app.config.globalProperties.$toDate = toDate;
    app.provide("toDate", toDate);
    app.config.globalProperties.$daysDiffNow = daysDiffNow;
    app.provide("daysDiffNow", daysDiffNow);
    app.config.globalProperties.$responsablesLogistica = metadata.responsablesLogistica;
    app.provide("responsablesLogistica", metadata.responsablesLogistica);
    app.config.globalProperties.$usuarisEDI = metadata.usuarisEDI;
    app.provide("usuarisEDI", metadata.usuarisEDI);
    app.config.globalProperties.$usuarisCreadorsAlbarans = usuarisCreadorsAlbarans();
    app.provide("usuarisCreadorsAlbarans", usuarisCreadorsAlbarans());
  },
};