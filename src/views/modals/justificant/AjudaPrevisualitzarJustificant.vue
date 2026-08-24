<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="false"
    style="width: 600px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Previsualitzar justificant') }}</span>
      </div>
    </template>
    <form @submit.prevent="genera">
      <SelectorIdiomaFormat 
        :idioma="idioma" @update:idioma="idioma = $event"
        :formatNumeric="formatNumeric" @update:formatNumeric="formatNumeric = $event" />
      <div>
      <div style="margin-top: 5px;">
        <span class="label-detall">{{$t('Comandes.Format distribuidor')}}:</span>
      </div>
      <div>
        <SelectButton v-model="formatDistribuidor" :options="opcionsSiNo" optionValue="clau" optionLabel="valor" />
      </div>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <Button type="submit" :label="$t('App.Genera')" icon="pi pi-file-pdf" class="p-button-sm" style="margin-left: 10px;"/>
      </div>
    </form>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, onMounted } from 'vue';
import ComandesService from '@/services/comandes.service';
import { obrirPdfNovaPestanya } from '@/utils/pdfUtils';
import SelectorIdiomaFormat from './SelectorIdiomaFormat.vue';
import { useI18n } from 'vue-i18n';

export default {
name: 'AjudaPrevisualitzarJustificant',
components: {
  SelectorIdiomaFormat,
},
props: {
  comanda: Number,
  client : Object,
},
setup(props, { emit }) {
  const { t } = useI18n();
  const visible = ref(true);
  const idioma = ref();
  const formatNumeric = ref('');
  const formatDistribuidor = ref();

  const hide = () => {
    emit('update:carregat', false);
  }

  onMounted(async () => {
    try {
      idioma.value = props.client.idioma;
      formatDistribuidor.value = props.client.isDistribuidor;
    } catch {
      hide();
    }
  });

  const genera = async () => {
    let resp = await carrega(ComandesService.generarJustificantNormalitzat(props.comanda, idioma.value, formatNumeric.value, formatDistribuidor.value));
    obrirPdfNovaPestanya(resp, `${t('Comandes.Justificant')}_${props.comanda}_${idioma.value}`);
  }

  return {
  visible,
  props,
  hide,
  genera,
  idioma,
  formatNumeric,
  formatDistribuidor,
  opcionsSiNo: [
      {clau: true, valor: t('App.Si')},
      {clau: false, valor: t('App.No')},
    ],
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