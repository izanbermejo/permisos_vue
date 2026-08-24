<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="true"
    style="min-width: 800px; width: fit-content">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalMissatgesEDI.Titol') }}</span>
      </div>
    </template>
    <div class="form" style="margin-top: 5px;">
      <div class="element-form">
        <label>{{ $t('ModalMissatgesEDI.DataInici') }}</label>
        <CalendarInput v-model="state.dataInici" />
      </div>
      <div class="element-form">
        <label>{{ $t('ModalMissatgesEDI.DataFi') }}</label>
        <CalendarInput v-model="state.dataFi" />
      </div>
      <div class="element-form" style="justify-content: flex-end; align-self: flex-end;">
        <Button @click="busca" :label="$t('ModalMissatgesEDI.Cercar')" icon="pi pi-search" class="p-button-sm" />
      </div>
    </div>
    <div v-if="missatges?.length === 100" class="infolimit">
      <font-awesome-icon icon="fa-solid fa-circle-info" style="font-size: 1rem;" />
      {{ $t('App.Nomes es mostren els primers resultats', [missatges.length]) }}
    </div>
    <DataTable :value="missatges" class="p-datatable-sm" style="margin-top: 10px;"
      :scrollable="true" scrollHeight="55vh" showGridlines
      v-model:selection="missatgeSeleccionat" selectionMode="single"
      @row-dblclick="window?.getSelection()?.removeAllRanges(); generaPDF(missatgeSeleccionat?.pathEDI)">
      <template #empty>
        <div style="width:100%; padding: 20px 0;">
          <InfoTaulaBuida :icon="'fa-solid fa-inbox'" :literal="$t('ModalMissatgesEDI.SenseResultats')" />
        </div>
      </template>
      <Column field="document" :header="$t('ModalMissatgesEDI.Document')" style="max-width: 160px;" />
      <Column field="data" :header="$t('ModalMissatgesEDI.Data')" style="max-width: 120px;">
        <template #body="{ data: fila }">
          {{ fila.data ? $d(fila.data, 'short') : '-' }}
        </template>
      </Column>
      <Column field="missatgeNumero" :header="$t('ModalMissatgesEDI.MissatgeNumero')" style="max-width: 180px;" />
      <Column field="numeroEnviament" :header="$t('ModalMissatgesEDI.EnviamentNumero')" style="max-width: 180px;" />
      <Column style="max-width: 60px; text-align: center;">
        <template #body="{ data: fila }">
          <Button icon="pi pi-file-pdf" class="p-button-text p-button-sm"
            :disabled="!fila.pathEDI"
            :title="$t('ModalMissatgesEDI.GenerarPDF')"
            @click="generaPDF(fila.pathEDI)" />
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import { carrega } from '@/services/loader';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import ediService from '@/services/edi.service';
import { useI18n } from 'vue-i18n';
import moment from 'moment';
import Swal from 'sweetalert2';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';

export default {
  name: 'ModalMissatgesEDIArticleClient',
  components: { InfoTaulaBuida },
  props: {
    carregat: Boolean,
    cliCod: String,
    artInt: String,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const missatges = ref([]);
    const missatgeSeleccionat = ref(null);

    const state = reactive({
      dataInici: moment().subtract(3, 'months').toDate(),
      dataFi: new Date(),
    });

    const hide = () => {
      emit('update:carregat', false);
    };

    const handler = (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        hide();
      }
    };

    const busca = async () => {
      if (state.dataInici > state.dataFi) {
        Swal.fire({ icon: 'warning', title: t('App.Rang de dates invalid') });
        return;
      }
      missatgeSeleccionat.value = null;
      missatges.value = await carrega(
        ediService.llistatMissatgesEDIPerArticleClient(
          props.cliCod,
          props.artInt,
          moment(state.dataInici).format('YYYY-MM-DD'),
          moment(state.dataFi).format('YYYY-MM-DD')
        )
      );
    };

    const generaPDF = async (pathEDI) => {
      if (!pathEDI) return;
      try {
        const blob = await carrega(ediService.descarregaFormatPdfAmes(pathEDI));
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        window.open(url, '_blank');
      } catch (e) {
        Swal.fire({ icon: 'error', title: t('App.Error') });
      }
    };

    onMounted(() => {
      document.addEventListener('keydown', handler);
      busca();
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handler);
    });

    return {
      visible,
      missatges,
      missatgeSeleccionat,
      state,
      hide,
      busca,
      generaPDF,
    };
  },
};
</script>

<style scoped>
.form {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
  align-items: flex-end;
}

.element-form > label {
  display: block;
  font-weight: 600;
  font-size: 1rem;
}

.infolimit {
  margin-top: 6px;
  color: #856404;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 0.9rem;
}
</style>
