<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" :draggable="true"
    style="width: 700px">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('Comandes.Exportar detall comandes client') }}</span>
      </div>
    </template>
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <label>{{ $t('Comandes.Data foto') }}</label>
        <CalendarInput v-model="state.dataFi" />
      </div>
      <div class="element-form">
        <label>{{ $t('Comandes.Data des de') }}</label>
        <CalendarInput v-model="state.dataInici" />
      </div>
      <div class="element-form">
        <label>{{$t('Comandes.Mostrar quantitat 0')}}:</label>
          <span style="max-width: 20px;height: 20px;">
            <SelectButton v-model="state.mostrarEliminades" :options="opcionsSiNo" optionValue="clau" optionLabel="valor" style="height: 20px;"/>
          </span>
      </div>
    </div>
    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
      <Button @click="exportarDetall" :label="$t('Comandes.Descarregar taula')" icon="pi pi-file-excel" class="p-button-sm" style="margin-left: 10px;"/>
    </div>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, reactive } from 'vue';
import ComandesService from '@/services/comandes.service';
import { useI18n } from 'vue-i18n';
import { useToast } from "primevue/usetoast";
import moment from 'moment';
import { saveAs } from 'file-saver';

export default {
name: 'ModalExportarDetallComandesClient',
props: {
  client: Number,
},
setup(props, { emit }) {
  const { t } = useI18n();
  const Toast = useToast();
  const visible = ref(true);
  let isExportant = false;

  const state = reactive({
    client: props.client,
    dataInici : moment().subtract(6, 'months').toDate(),
    dataFi : new Date(),
    mostrarEliminades: false,
  });

  const hide = () => {
    emit('update:carregat', false);
  }

  const exportarDetall = async () => {
    if (isExportant) return;
    if (state.dataInici > state.dataFi || state.dataFi == '' || state.dataInici == '') {
      Toast.add({severity:'warn', summary: t('Comandes.rang dates invalid'), life: 3000});
      return;
    }
    isExportant = true;
    let params = new URLSearchParams();
    if (state.dataInici)
      params.append('dataInici', moment(state.dataInici).format('YYYY-MM-DD'));
    if (state.dataFi)
      params.append('dataFi', moment(state.dataFi).format('YYYY-MM-DD'));
    params.append('mostrarEliminades', state.mostrarEliminades);
    const resp = await carrega(ComandesService.exportarDetallComandesClient(state.client, params));

    saveAs(new Blob([resp]), `DetallComandesClient_${state.client}.xlsx`);

    isExportant = false;
    hide();
  }

  return {
  visible,
  props,
  hide,
  exportarDetall,
  state,
  opcionsSiNo: [
    {clau: true, valor: t('App.Si')},
    {clau: false, valor: t('App.No')},
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

:deep(.p-selectbutton .p-button) {
  height: 31px;
}
</style>