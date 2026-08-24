<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false"
    style="width: 560px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Albarans.Imprimir albara') }}</span>
      </div>
    </template>
    <SelectorIdiomaFormatAlbara
      :idioma="idioma" @update:idioma="idioma = $event"
      :formatNumeric="formatNumeric" @update:formatNumeric="formatNumeric = $event" />
    <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
      <Checkbox v-model="incloureEtiquetes" :binary="true" inputId="chkEtiquetes" />
      <label for="chkEtiquetes" class="label-detall">{{ $t('Albarans.Incloure etiquetes lots') }}</label>
    </div>
    <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
      <Checkbox v-model="isCopia" :binary="true" inputId="chkCopia" />
      <label for="chkCopia" class="label-detall">{{ $t('Albarans.Copia transportista') }}</label>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <Button :label="$t('App.Genera')" icon="pi pi-file-pdf" class="p-button-sm"
        @click="generaAlbara" />
    </div>
    <Divider />
    <div>
      <div class="label-detall" style="margin-bottom: 6px;">{{ $t('Albarans.Certificats qualitat') }}:</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        <Button v-for="tipus in tipusCertificats" :key="tipus"
          :label="tipus" icon="pi pi-file-pdf" class="p-button-sm p-button-outlined"
          @click="generaCertificat(tipus.toLowerCase())" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, onMounted } from 'vue';
import AlbaraService from '@/services/albara.service';
import ComandesService from '@/services/comandes.service';
import { obrirPdfNovaPestanya } from '@/utils/pdfUtils';
import SelectorIdiomaFormatAlbara from './SelectorIdiomaFormatAlbara.vue';

export default {
  name: 'AjudaImprimirAlbara',
  components: { SelectorIdiomaFormatAlbara },
  props: {
    albara: Object,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const idioma = ref('en');
    const formatNumeric = ref('COMA_PUNT');
    const incloureEtiquetes = ref(false);
    const isCopia = ref(false);
    const tipusCertificats = ['ABC', 'AfBf', 'TTf', 'TN', 'AnBn'];

    onMounted(async () => {
      try {
        const clicod = props.albara?.client;
        if (clicod) {
          const client = await carrega(ComandesService.obtenirClient(clicod, false));
          idioma.value = client?.data?.idioma ?? 'en';
        }
      } catch {
        // manté l'idioma per defecte
      }
    });

    const hide = () => {
      emit('update:carregat', false);
    };

    const nomAlbara = () => {
      const { codi, empresa } = props.albara.id;
      return `${String(empresa).padStart(2, '0')}_${String(codi).padStart(7, '0')}`;
    };

    const generaAlbara = async () => {
      const { codi, empresa } = props.albara.id;
      const resp = await carrega(AlbaraService.generarAlbara(
        codi, empresa, idioma.value, formatNumeric.value, incloureEtiquetes.value, isCopia.value
      ));
      obrirPdfNovaPestanya(resp, nomAlbara());
    };

    const generaCertificat = async (tipus) => {
      const { codi, empresa } = props.albara.id;
      const resp = await carrega(AlbaraService.generarCertificatAlbara(
        codi, empresa, tipus, idioma.value
      ));
      obrirPdfNovaPestanya(resp, `${nomAlbara()}_${tipus}`);
    };

    return {
      visible,
      idioma,
      formatNumeric,
      incloureEtiquetes,
      isCopia,
      tipusCertificats,
      hide,
      generaAlbara,
      generaCertificat,
    };
  },
};
</script>

<style scoped>
.label-detall {
  font-weight: 600;
  font-size: 1rem;
}
</style>
