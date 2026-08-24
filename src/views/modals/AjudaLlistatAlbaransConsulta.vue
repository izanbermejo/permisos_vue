<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true" style="width: 980px;">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaLlistatAlbarans.titol') }}</span>
        <ButtonShortcut style="margin-left: 20px;" icon="fa-solid fa-file-excel" :literal="$t('Comandes.Descarregar taula')" @click="exportarTaula(articleClient)" />
      </div>
    </template>
    <div class="card-body">
      <div id="divLinies">
        <DataTable v-model:expandedRows="expandedRows" :value="ultimsAlbarans" class="p-datatable-sm"
          :dataKey="codiNumeroFormat" style="margin-top: 15px;" :scrollable="true" scrollHeight="65vh"
          :resizableColumns="true" columnResizeMode="expand" contextMenu
          v-model:contextMenuSelection="registreSeleccionat" @rowContextmenu="showContextMenu($event)" showGridlines
          v-model:selection="registreSeleccionat" selectionMode="single" :rowClass="() => 'estilRow'"
          @row-select="selectedIndex = $event.index">
          <template #empty>
            <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('ComandesEDI.linies.ultimsAlbarans.capalbara')" />
            </div>
          </template>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.albara')" :style="{ width: '100px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              <span v-if="(ultimAlbara == data.factura || ultimAlbara == data.albara)" style="font-weight: bold;">{{
                data.albara }}</span>
              <span v-else>{{ data.albara }}</span>

            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.factura')" :style="{ width: '200px' }"
            style="max-width: 200px;">
            <template #body="{ data }">
              {{ data.factura }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.data')" :style="{ width: '100px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              {{ $d(data.dataAlbaraFactura) }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.incoterm')" :style="{ width: '95px' }"
            style="max-width: 95px;">
            <template #body="{ data }">
              <span :style="{ color: data.mateixEnviamentDelClient ? '#495057' : 'green' }">{{ data.incoterm }}</span>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.transportista')" :style="{ width: '110px' }"
            style="max-width: 110px;">
            <template #body="{ data }">
              <span :style="{ color: data.mateixEnviamentDelClient ? '#495057' : 'green' }" v-tooltip="` ${$transportista(data.codiTransportista)}`">{{` ${$transportista(data.codiTransportista)}`}}</span>
            </template>
          </Column>          
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.quantitat')" :style="{ width: '80px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data.quantitat) }}
              </div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.acumulat')" :style="{ width: '80px' }" style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 120px; text-align: right;"> {{ $n(data.acumulat) }}</div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.servida')" :style="{ width: '70px' }"
            style="max-width: 70px;">
            <template #body="{ data }">
              <div style="width: 70px; text-align: center;"> {{ data.servida }}</div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </Dialog>
</template>

<script>
import EDIService from '@/services/edi.service'
import { carrega } from "@/services/loader";
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { ref, computed, onMounted, onUnmounted, reactive, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { ExcelExporter } from '@/utils/ExcelExporter';

export default {
  name: "AjudaLlistatAlbarans",
  props: {
    codicomanda: String,
    codiarticle: String,
    codiclient: String,
    ediultalbara: String,
    ediacumulat: String,
    tipusClient: String,
    acumulatsdata: String,
    acumulatsestoc: String,
    acumulatsalbara: String,
    acumulatscoincideixen: Boolean,
  },
  setup(props, { emit }) {
    const { t, locale } = useI18n();
    const transportista = inject('transportista');
    const ultimsAlbarans = ref([]);
    const ultimAlbara = ref();
    const visible = ref(true);
    const acumulat = ref();
    const transit = ref();
    const titolResultatsTaula = computed(() => t('ModalAjudaLlistatAlbarans.titolExportacio'));
    const articleClient = computed(() => props.codiarticle + props.codiclient);
    const state = reactive({
      dataClient: new Date(),
      dataAmes: new Date(),
      dataMagatzem: new Date(),
      quantitat: 0,
    });
    const rules = {
      dataClient: { required },
      dataAmes: { required },
      dataMagatzem: { required },
      quantitat: { required }

    }
    const v = useVuelidate(rules, state);

    const handler = (ev) => {
      if (ev.key === 'Escape') {
        hide();
      }
    }

    const coincideixAcumulats = () => {
      return props.acumulatscoincideixen;
    }

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      carregaModal(ultimAlbara.value)
    });

    const carregaModal = (async (nouValor) => {
      ultimAlbara.value = nouValor ?? props.ediultalbara;

      if (props.codiarticle == '' || props.codiclient == '') {
        ultimsAlbarans.value = [];
      }
      else {
        ultimsAlbarans.value = await carrega(EDIService.llistaUltimsAlbarans(props.codiarticle, props.codiclient, ultimAlbara.value, props.tipusClient))
      }
      acumulat.value = ultimsAlbarans.value.reduce((max, item) => {
        return item.transit > max.transit ? item : max;
      }, ultimsAlbarans.value[0]);
    });

    const sumaQuantitatHastaAlbara = computed(() => {
      if (ultimAlbara.value === '')
        return '-';
      else {
        let suma = 0;
        for (const reg of ultimsAlbarans.value) {
          if (reg.albara === ultimAlbara.value || reg.factura === ultimAlbara.value) break; // Detiene la suma antes de este albarà
          suma += reg.quantitat;
        }
        return suma;
      }
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const canviaUltimAlbara = async (nouUltimAlbara) => {
      await carrega(EDIService.canviaUltimAlbara(props.codicomanda, props.codiarticle, nouUltimAlbara));

      carregaModal(nouUltimAlbara);
      emit("update:recarregaTaula");
    };


    const hide = () => {
      emit("update:carregat", false);
    };

    const exportarTaula = (artCli) =>{
        const configuracioExcel = {
          dades:  ultimsAlbarans.value,
          columnes: [
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.albara'), valor: linia => linia.albara, width: 10 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.factura'), valor: linia => linia.factura ?? '', width: 10 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.data'), valor: linia => linia.dataAlbaraFactura ?? '', width: 15 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.incoterm'), valor: linia => linia.incoterm ?? '', width: 10 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.transportista'), valor: linia => transportista(linia.codiTransportista) ?? '', width: 25 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.quantitat'), valor: linia => linia.quantitat ?? '', width: 10 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.acumulat'), valor: linia => linia.acumulat ?? '', width: 10 },
          { titol: t('ComandesEDI.linies.ultimsAlbarans.taula.servida'), valor: linia => linia.servida ?? '', width: 8 }],
        };

        ExcelExporter.export({
          filename:  titolResultatsTaula.value + artCli + '.xlsx',
          configuracioExcel
        });
      };

    return {
      locale,
      visible,
      props,
      v,
      coincideixAcumulats,
      ultimsAlbarans,
      ultimAlbara,
      canviaUltimAlbara,
      hide,
      acumulat,
      transit,
      sumaQuantitatHastaAlbara,
      exportarTaula,
      articleClient
    };

  },
};
</script>

<style scoped>
.titolCapsalera {
  margin-left: 25px;
  border: 1px solid #ffffff;
  background-color: #ffffff;
  padding: 4px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form {
  margin-top: 2px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
}

.element-form>label {
  display: block;
}

.element-form>small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}
</style>