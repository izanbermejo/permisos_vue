<template>
  <ModalPropostaTraspas v-if="visibleModalTraspas" :carregat="visibleModalTraspas"
      @update:carregat="visibleModalTraspas = $event"
      @albara-creat="refrescarMagatzem"
      :infoPropostes="infoPropostes"
      :codiMagatzem="selectedMagatzem.magatzem"
      :descMagatzem="selectedMagatzem.magatzemDesc"
      :dataPrevistaInici="dataPrevistaIniciFmt"
      :dataPrevistaFi="dataPrevistaFiFmt"/>
  <div class="card">
    <h5 class="card-header">
      {{ $t('Propostes.Traspas') }}
    </h5>
    <div id="elementGridPropostesTraspas" style="padding: 10px;">
      <DataTable :value="listMagatzems" class="p-datatable-sm"
          v-model:selection="selectedMagatzem"
          selectionMode="single"
          dataKey="magatzem"
          showGridlines
          :scrollable="true" scrollDirection="both" scrollHeight="50vh"
          :resizableColumns="true" columnResizeMode="expand"
          :rowClass="() => 'estilRow'"
          @dblclick="handleDblClick"
          @row-select="selectedIndex = $event.index">
        <template #empty>
          <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Propostes.Cap proposta')" />
          </div>
        </template>
        <Column :header="$t('Propostes.Magatzem')" :style="{width:'320px'}" style="max-width: 320px;">
          <template #body="{data}">
            <div class="ellipsis" v-tooltip.top="`${data.magatzem} - ${data.magatzemDesc}`">
              {{ `${data.magatzem} - ${data.magatzemDesc}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Propera necessitat stock')" :style="{width:'340px'}" style="max-width: 340px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">
              <template v-if="data.datesProperaNecessitatStock">
                <span>({{ fmtData(data.datesProperaNecessitatStock.dataSolicitada) }})</span>
                <span style="margin-left: 1.6em;">
                  {{ fmtData(data.datesProperaNecessitatStock.dataSortida) }} ⇐ <b>{{ fmtData(data.datesProperaNecessitatStock.dataSortidaInterna) }}</b>
                </span>
              </template>
              <span v-else>-</span>
            </div>
          </template>
        </Column>
        <Column :style="{width:'80px'}" style="text-align: center; max-width: 85px;">
          <template #header>
            <div class="ellipsis" v-tooltip.top="$t('Propostes.Peces satelit')">
              <font-awesome-icon icon="fa-solid fa-satellite-dish" style="font-size: 1.1rem;" />
              {{ $t('Propostes.Peces satelit') }}
            </div>
          </template>
          <template #body="{data}">
            <div style="width: 100%; text-align: center;" >
              <span v-if="data.isHiHaPecesSatelit" v-tooltip="$t('Propostes.Peces satelit')">
                <font-awesome-icon icon="fa-solid fa-satellite-dish" class="satellite-icon" :class="{ 'highlighted': data.isNecessitaPecesDeSatelit }" />
              </span>
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Disponibilitat')" :style="{width:'150px'}">
          <template #body="{data}">
            <div style="width: 100%; text-align: left;">
              <ColumnaServible :numTraspassos="data.numTraspassos"
                :numTraspassosAmbStockParcial="data.numTraspassosAmbStockParcial"
                :numTraspassosAmbStockCap="data.numTraspassosAmbStockCap"
                :numTraspassosAmbStockTot="data.numTraspassosAmbStockTot"/>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import propostesService from "@/services/propostes.service";
import { carrega } from '@/services/loader';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { computed, onMounted, onActivated, onDeactivated, ref, toRef, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import ModalPropostaTraspas from './ModalPropostaTraspas.vue';
import ColumnaServible from './ColumnaServible.vue';
import { watch } from 'vue';
import moment from 'moment';

export default {
  // eslint-disable-next-line  
  name: 'PropostesTraspas',
  components : {
    ModalPropostaTraspas,
    ColumnaServible,
    InfoTaulaBuida,
  },
  props: {
    propostes: Object,
    infoBusqueda: Object,
  },
  setup ( props, {emit} ) {
    const { d } = useI18n();
    const toDate = inject('toDate');
    const infoTraspas = toRef(props, 'propostes');

    // Formata una data (o '-' si no n'hi ha) per a la columna de propera necessitat d'stock
    const fmtData = (v) => v ? d(toDate(v), 'short') : '-';
    const refInfoBusqueda = toRef(props, 'infoBusqueda');
    const listMagatzems = ref(infoTraspas.value.resumMagatzem);
    const selectedMagatzem = ref();
    const infoPropostes = ref();
    const visibleModalTraspas = ref(false);
    const dataPrevistaIniciFmt = computed(() => refInfoBusqueda.value?.dataPrevistaInici
      ? moment(refInfoBusqueda.value.dataPrevistaInici).format('YYYY-MM-DD') : null);
    const dataPrevistaFiFmt = computed(() => refInfoBusqueda.value?.dataPrevistaFi
      ? moment(refInfoBusqueda.value.dataPrevistaFi).format('YYYY-MM-DD') : null);
    const elementGridPropostesTraspas = () => document.getElementById('elementGridPropostesTraspas');
    const selectedIndex = ref(-1);

    onMounted(() => {
      selectedIndex.value = 0;
    });

    onActivated(() => {
      document.addEventListener("keydown", keyHandler);
    });

    onDeactivated(() => {
      document.removeEventListener("keydown", keyHandler);
    });

    watch(infoTraspas, () => {
      listMagatzems.value = infoTraspas.value.resumMagatzem;
      selectedIndex.value = 0;
    });

    const modalVisible = computed(() => {
      return visibleModalTraspas.value;
    })

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        selectedMagatzem.value = listMagatzems.value[selectedIndex.value];
        scrollCenter(elementGridPropostesTraspas(), selectedIndex);
      }
    });

    const keyHandler = (ev) => {
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls dataTable
      controlDataTable(ev, elementGridPropostesTraspas(), selectedIndex, listMagatzems);
      if (ev.which==13) { // Enter
        actionHandler(ev, () =>  handleDblClick());
      }
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const handleDblClick = () => {
      setTimeout(() => {
          window.getSelection()?.removeAllRanges();
        }, 0);
      showMagatzem();
    }

    const construirParamsMagatzem = () => {
      let params = new URLSearchParams();
      params.append('magatzem', refInfoBusqueda.value.magatzem);
      if (refInfoBusqueda.value.dataPrevistaInici)
        params.append('dataPrevistaInici', moment(refInfoBusqueda.value.dataPrevistaInici).format('YYYY-MM-DD'));
      if (refInfoBusqueda.value.dataPrevistaFi)
        params.append('dataPrevistaFi', moment(refInfoBusqueda.value.dataPrevistaFi).format('YYYY-MM-DD'));
      return params;
    }

    const showMagatzem = async () => {
      infoPropostes.value = null;
      let resposta = await(carrega(propostesService.obtenirPropostesMagatzem(selectedMagatzem.value.magatzem,
                                                                            construirParamsMagatzem())));
      infoPropostes.value = resposta;
      visibleModalTraspas.value = true;
    }

    // Refresca la proposta del magatzem després de crear/aprofitar albarans, sense tancar el modal obert.
    // Es torna a demanar l'estat actual i s'assigna directament (sense buidar-lo abans) perquè el modal,
    // que reacciona al canvi de infoPropostes.traspassos, refresqui el seu grid en segon pla.
    const refrescarMagatzem = async () => {
      if (!selectedMagatzem.value) return;
      infoPropostes.value = await carrega(propostesService.obtenirPropostesMagatzem(selectedMagatzem.value.magatzem,
                                                                                    construirParamsMagatzem()));
    }

    return {
      props,
      infoTraspas,
      listMagatzems,
      selectedMagatzem,
      infoPropostes,
      visibleModalTraspas,
      dataPrevistaIniciFmt,
      dataPrevistaFiFmt,
      selectedIndex,
      handleDblClick,
      showMagatzem,
      refrescarMagatzem,
      fmtData,
      emit
    }

  }
}
</script>
  
<style scoped>
  ::v-deep(.estilRow) {
    cursor: pointer;
  }

  .ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
  }

  .satellite-icon.highlighted {
    color: red;
  }
</style>