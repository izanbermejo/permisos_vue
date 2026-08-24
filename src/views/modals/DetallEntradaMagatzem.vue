<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left; margin-right: 25px;">{{ $t('EntradesMagatzem.detall de entrada') }}</span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="nomesCaixesError" :binary="true" tabindex="-1"/>
                <label> {{ $t('EntradesMagatzem.Mostrar nomes errors') }} </label>
            </span>
        </div>
    </template>
        <DataTable :value="dadesEntradaMagatzemDetall"
            v-model:selection="selectedEntrada"
            selectionMode="single"
            dataKey="etiquetaCaixa"
            showGridlines
            :rowClass="() => 'estilRow'"
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            @row-select="selectedIndex = $event.index;">
            <!-- @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()" -->
            <template #empty>
              <div v-if="nomesCaixesError" style="width:35px; text-align: center;">
                {{ $t('EntradesMagatzem.No caixes amb error') }}
              </div>
              <div v-else style="width:35px; text-align: center;">
                {{ $t('EntradesMagatzem.No te caixes dins') }}
              </div>
            </template>
            <Column :style="{ width: '35px' }" style="max-width: 35px; padding: 0px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 35px; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" style="width: 35px;"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="etiqueta_caixa" :header="$t('EntradesMagatzem.Etiqueta caixa')" :style="{width:'130px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ $n(data.etiquetaCaixa) }}
                </template>
            </Column>
            <Column field="quantitat" :header="$t('Entrades.Quantitat')" :style="{width:'60px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ data.quantitat }}
                </template>
            </Column>
            <Column field="lot" :header="$t('EntradesMagatzem.Lot')" :style="{width:'130px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ data.lot }}
                </template>
            </Column>
            <Column field="data_etiqueta" :header="$t('EntradesMagatzem.Data etiqueta')" :style="{width:'130px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ $d(data.dataEtiqueta) }}
                </template>
            </Column>
            <Column field="of" :header="$t('Entrades.of')" :style="{width:'110px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ $n(data.of) }}
              </template>
            </Column>
            <Column field="error" :header="$t('EntradesComercial.Error')" :style="{width:'250px'}" style="max-width: 25%;">
                <template #body="{data}">
                    <span v-if="data.msgError">
                        {{ mostrarErrorEntrada(data.msgError) }}
                    </span>
                </template>
            </Column>
        </DataTable>
  </Dialog>
</template>

<script>
import entradesService from "@/services/entrades.service";
import { carrega } from "@/services/loader";
import { ref, onMounted, watch } from "vue";
import { useI18n } from 'vue-i18n';

export default {
  name: "DetallEntradaMagatzem",
  components: {
  },
  props: {
    idEntrada : String,
    callback : Function,
    potEditar : {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit} ) {
    const { t } = useI18n();
    const visible = ref(true);
    const idEntradaMostrada = ref(props.idEntrada);
    const dadesEntradaMagatzemDetallOriginal = ref([]);
    const dadesEntradaMagatzemDetall = ref([]);
    const nomesCaixesError = ref(false);
    const selectedEntrada = ref();

    onMounted(async () => {
      let resultat = await(carrega(entradesService.obtenirDetallEntradaMagatzemById(idEntradaMostrada.value)));
      dadesEntradaMagatzemDetallOriginal.value = resultat;
      dadesEntradaMagatzemDetall.value = dadesEntradaMagatzemDetallOriginal.value
    });

    const mostrarErrorEntrada = (msg) => {
      switch (msg) {
        case 'ETIQUETA_JA_EXISTEIX':
          return t("EntradesMagatzem.etiqueta ja existeix")

        default:
          return t("Entrades.Error desconegut")
      }
    }

    const hide = () => {
      emit("update:carregat", false);
    }

    watch(nomesCaixesError, () => {
      if (nomesCaixesError.value) {
        dadesEntradaMagatzemDetall.value = dadesEntradaMagatzemDetallOriginal.value.filter(r => r.error === true)
      } else {
        // let resultat = await(carrega(entradesService.obtenirDetallEntradaMagatzemById(idEntradaMostrada.value)));
        dadesEntradaMagatzemDetall.value = dadesEntradaMagatzemDetallOriginal.value;
      }

      selectedEntrada.value = null
    })

    return {
      visible,
      hide,
      idEntradaMostrada,
      dadesEntradaMagatzemDetall,
      mostrarErrorEntrada,
      nomesCaixesError,
      selectedEntrada
    };

  },
};
</script>

<style scoped>
:deep(.p-datatable-tbody > tr > td) {
  padding-top: 0;
  padding-bottom: 0;
  height: 35px;
  line-height: 35px;
}

:deep(.p-datatable-thead > tr > th) {
  height: 35px;
  line-height: 35px;
  padding-top: 0;
  padding-bottom: 0;
}

::v-deep(.estilRow) {
    cursor: pointer;
}

::v-deep(.estilRow .ocultable) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
    display: none;
}

::v-deep(.estilRow:hover .ocultable) {
    display: flex;
}
</style>
