<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false"
    style="width: auto">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.selecciona idioma exportacio') }}</span>
      </div>
    </template>
    <form @submit.prevent="exportarTaula(liniesArticles)">
      <SelectorIdioma 
        :idioma="idioma" @update:idioma="idioma = $event" />
      <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
        <Button type="submit" :label="$t('App.Genera')" icon="pi pi-file-excel" class="p-button-sm" style="margin-left: 10px;"/>
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import SelectorIdioma from './SelectorIdioma.vue';
import { useI18n } from 'vue-i18n';
import { ExcelExporter } from '@/utils/ExcelExporter';

export default {
name: 'AjudaIdiomaExport',
components: {
  SelectorIdioma,
},
props: {
  linies : Array,
  client : Object,
},
setup(props, { emit }) {
  const { t } = useI18n();
  const visible = ref(true);
  const idioma = ref();
  const liniesArticles = ref(props.linies);

  const hide = () => {
    emit('update:carregat', false);
  }
  const colsCa = ['Referencia', 'Qtat.', 'Preu net (€/pc)', 'Total', 'Kg', 'demanda_preus'];
  const colsEs = ['Referencia', 'Cant.', 'Precio neto (€/ud)', 'Total', 'Kg', 'demanda_precios'];
  const colsEn = ['Reference', 'Qty.', 'Net price (€/pc)', 'Total', 'Kg', 'price_request'];
  const colsFr = ['Référence', 'Qté.', 'Prix net (€/pc)', 'Total', 'Kg', 'demande_prix'];
  const colsIt = ['Riferimento', 'Qtà.', 'Prezzo netto (€/pz)', 'Totale', 'Kg', 'richiesta_prezzi'];
  const colsDe = ['Referenz', 'Menge', 'Nettopreis (€/Stk)', 'Gesamt', 'Kg', 'preisanfrage'];

  onMounted(async () => {
    try {
      idioma.value = props.client.idioma;
    } catch {
      hide();
    }
  });

  const exportarTaula = (linies) => {
    const columnes = selectIdiomaColumnes();
    const configuracioExcel = {
      dades: linies,
      columnes: [
        { titol: columnes[0], valor: linia => linia.referencia ?? '', width: 15 },
        { titol: columnes[1], valor: linia => linia.quantitat ?? '', width: 10 },
        { titol: columnes[2], valor: linia => linia.preuNet ?? '', width: 18 },
        { titol: columnes[3], valor: linia => linia.importNet ?? '', width: 15 },
        { titol: columnes[4], valor: linia => linia.pesKg ?? '', width: 10 },
      ]
    };

    ExcelExporter.export({
      filename:  columnes[5] + '_' + props.client.clicod + '.xlsx',
      configuracioExcel,
    });

    hide();
  };

  const selectIdiomaColumnes = () => {
    switch (idioma.value) {
      case 'ca':
        return colsCa;
      case 'es':
        return colsEs;
      case 'en':
        return colsEn;
      case 'fr':
        return colsFr;
      case 'it':
        return colsIt;
      case 'de':
        return colsDe;
      default:
        return colsEn;
    }
  }

  return {
  visible,
  props,
  hide,
  exportarTaula,
  idioma, 
  opcionsSiNo: [
    {clau: true, valor: t('App.Si')},
    {clau: false, valor: t('App.No')},
  ],
  liniesArticles,
  }
},
}
</script>

<style scoped>
  .label-detall { 
    font-weight: 600;
    font-size: 1rem;
  }
</style>