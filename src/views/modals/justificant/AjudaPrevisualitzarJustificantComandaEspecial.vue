<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="true"
    style="width: 700px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Previsualitzar justificant') }}</span>
      </div>
    </template>
    <SelectorIdiomaFormat style="margin-top: 5px;"
      :idioma="state.idioma" @update:idioma="state.idioma = $event"
      :formatNumeric="state.formatNumeric" @update:formatNumeric="state.formatNumeric = $event" />
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <label>{{$t('Comandes.Tipus')}}:</label>
          <span>
            <SelectButton v-model="state.tipus" :options="optionsTipus" optionValue="clau" optionLabel="valor" />
          </span>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <Button @click="previsualitzarJustificant" :label="$t('App.Previsualitzar')" icon="pi pi-file-pdf" class="p-button-sm" style="margin-left: 10px;"/>
    </div>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, reactive, toRef } from 'vue';
import ComandesService from '@/services/comandes.service';
import { obrirPdfNovaPestanya } from '@/utils/pdfUtils';
import SelectorIdiomaFormat from './SelectorIdiomaFormat.vue';
import { useI18n } from 'vue-i18n';
import { email } from '@/keycloak/keycloak';

export default {
name: 'AjudaPrevisualitzarJustificantComandaEspecial',
components: {
  SelectorIdiomaFormat,
},
props: {
  comanda: Object,
  client : Object,
  comandaClient : String,
},
setup(props, { emit }) {
  const { t } = useI18n();
  const visible = ref(true);
  const refComanda = toRef(props, 'comanda');

  const state = reactive({
    to: props.client.email ?? '',
    cc: email(),
    assumpte: `Order: ${props.comandaClient}`,
    missatge: '',
    idioma : props.client.idioma,
    tipus : undefined,
    formatNumeric : '',
  });

  const hide = () => {
    emit('update:carregat', false);
  }

  const previsualitzarJustificant = async () => {
    let resp = await carrega(ComandesService.generarJustificantEspecial(refComanda.value, state.idioma, state.formatNumeric, state.tipus));
    obrirPdfNovaPestanya(resp, `${t('Comandes.Justificant')}_${props.comandaClient}_${state.idioma}`);
    hide();
  }

  return {
  visible,
  props,
  hide,
  previsualitzarJustificant,
  state,
  optionsTipus: [
      {clau: undefined, valor: t('App.Totes')},
      {clau: 'FERM', valor: t('Comandes.Ferm')},
      {clau: 'ORIENTATIU', valor: t('Comandes.Orientatiu')},
    ],
  }  
},
}
</script>

<style scoped>
.form {
  margin-top: 2px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
}

.element-form > label {
  display: block;
  font-weight: 600;
  font-size: 1rem;
}

.element-form > span > label {
  font-weight: 600;
  font-size: 1rem;
}

.element-form > small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}
</style>