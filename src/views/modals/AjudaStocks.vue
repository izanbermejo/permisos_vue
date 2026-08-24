<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="true">
    <template #header>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: larger; font-weight: 600;">{{ $t('Comandes.Informacio stock') }}</span>
        <Button :label="$t('ModalAjudaArticleClient.Trasabilitat')" icon="pi pi-list" style="height: 30px; width: auto;" @click="descarregaTrasabilitat"/>
        <Button :label="$t('ModalAjudaArticleClient.Localitzacio')" icon="pi pi-map-marker" style="height: 30px; width: auto;" @click="descarregaLocalitzacio"/>
      </div>
    </template>
    <FitxaStocks style="margin-top: 10px;"
        :fitxes="registres" :fitxesSatelit="registresSatelit"
        :hiHaIntermig="hiHaIntermig" :isNormalitzat="isNormalitzat" />
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, onMounted, computed } from 'vue';
import InventariService from '@/services/inventari.service';
import MagatzemService from '@/services/magatzem.service';
import FitxaStocks from '@/components/propostes/traspas/FitxaStocks.vue';
import { saveAs } from 'file-saver';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AjudaStocks',
  components: {
    FitxaStocks,
  },
  props: {
    artint: String,
    clicod: String,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const registres = ref();
    const registresSatelit = ref();
    const hiHaIntermig = ref(false);

    const hide = () => {
      emit('update:carregat', false);
    }

    const descarregaTrasabilitat = async () => {
      const resp = await carrega(MagatzemService.reportTrasabilitat(props.artint, props.clicod));
      saveAs(new Blob([resp]), `${t('ModalAjudaArticleClient.Trasabilitat') + props.artint}.xls`);
    };

    const descarregaLocalitzacio = async () => {
      const resp = await carrega(MagatzemService.reportLocalitzacio(props.artint, props.clicod));
      saveAs(new Blob([resp]), `${t('ModalAjudaArticleClient.Localitzacio') + props.artint}.xls`);
    };

    const isNormalitzat = computed(() => { return props.clicod === '000000'} );

    onMounted(async () => {
      try {
        const stocks = await carrega(InventariService.obtenirStocks(props.artint, props.clicod));
        registres.value = stocks.fitxes;
        registresSatelit.value = stocks.fitxesSatelit;
        hiHaIntermig.value = stocks.hiHaMagatzemIntermig;
      } catch {
        hide();
      }      
    });

    return {
      visible,
      props,
      isNormalitzat,
      hiHaIntermig,
      hide,
      registres,
      registresSatelit,
      descarregaTrasabilitat,
      descarregaLocalitzacio,
    }
  },
}
</script>