<template>
  <ModalPropostaClientNoFerm v-if="visibleModalPropostaClient" :carregat="visibleModalPropostaClient"
      @update:carregat="visibleModalPropostaClient = $event" 
      :resumClient="selectedClient" :dataPropostes="dataPropostes" :tipus="'orientatiu'"/>
  <div class="card">
    <h5 class="card-header">
      {{ $t('Propostes.Clients') }}
    </h5>
    <div id="elemenGridPropostesClientOrientatiu" style="padding: 10px;">
      <DataTable :value="listClients" class="p-datatable-sm"
          v-model:selection="selectedClient"
          selectionMode="single"
          dataKey="clientEmpresa"
          showGridlines
          :scrollable="true" scrollDirection="both" scrollHeight="50vh"
          columnResizeMode="expand"
          :rowClass="() => 'estilRow'"
          @dblclick="handleDblClick"
          @row-select="selectedIndex = $event.index">
        <template #empty>
          <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Propostes.Cap proposta')" />
          </div>
        </template>
        <Column :style="{width:'40px'}" style="max-width: 40px;">
          <template #header>
            <div style="width: 100%;" v-tooltip="$t('Propostes.Client bloquejat')">
              <font-awesome-icon icon="fa-solid fa-lock" style="margin-left: 10px; font-size: 1.1rem" />
            </div>
          </template>
          <template #body="{data}">
            <div v-if="data.isBloquejat" style="width: 100%; text-align: center;">
              <font-awesome-icon icon="fa-solid fa-lock" style="font-size: 1.1rem" />
            </div>
          </template>
        </Column>
        <Column field="clientCodi" :header="$t('Propostes.Codi client')" :style="{width:'90px'}" style="max-width: 90px;"/>
        <Column :header="$t('Propostes.Client')" :style="{width:'270px'}" style="max-width: 270px;">
          <template #body="{data}">
            <div class="ellipsis" v-tooltip.left="`${data.clientNom}`">
              {{ data.clientNom }}
            </div>
          </template>
        </Column>
        <Column field="empresa" :header="$t('Propostes.Codi')" :style="{width:'90px'}" style="max-width: 90px;"/>
        <Column :header="$t('Propostes.Data mes propera')" :style="{width:'160px'}" style="max-width: 160px;">
          <template #body="{data}">
            {{ $d($toDate(data.dataMin), 'short') }}
          </template>
        </Column>
        <Column :style="{width:'80px'}" style="text-align: right; max-width: 85px;" header="#">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              {{ $n(data.numLinies) }}
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
                <font-awesome-icon icon="fa-solid fa-satellite-dish" style="font-size: 1.1rem;" />
              </span>
            </div>
          </template>
        </Column>
        <Column :style="{width:'80px'}" style="text-align: right; max-width: 3005px;" header="" />
      </DataTable>
    </div>
  </div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { computed, onMounted, onActivated, onDeactivated, ref, toRef } from 'vue';
import { controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import ModalPropostaClientNoFerm from '../ModalPropostaClientNoFerm.vue';
import { watch } from 'vue';
import { useObtaPropostesClient } from '@/composables/usePropostesClient.js';

export default {
  // eslint-disable-next-line  
  name: 'PropostesClientsOrientatiu',
  components : {
    ModalPropostaClientNoFerm,
    InfoTaulaBuida,
  },
  props: {
    propostes: Object,
    infoBusqueda: Object,
  },
  setup ( props, {emit} ) {
    const infoPropostes = toRef(props, 'propostes');
    const refInfoBusqueda = toRef(props, 'infoBusqueda');
    const listClients = ref(infoPropostes.value.resumClientOrientatiu);
    const selectedClient = ref();
    
    // Utilitzem el composable per la crida al servidor
    const { dataPropostes, visibleModalPropostaClient, obtenirPropostesClient } = useObtaPropostesClient();
    
    const elementGridPropostesClient = () => document.getElementById('elemenGridPropostesClientOrientatiu');
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

    watch(infoPropostes, () => {
      listClients.value = infoPropostes.value.resumClientOrientatiu;
    });

    const modalVisible = computed(() => {
      return visibleModalPropostaClient.value;
    })

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        selectedClient.value = listClients.value[selectedIndex.value];
        scrollCenter(elementGridPropostesClient(), selectedIndex);
      }
    });

    const keyHandler = (ev) => {
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls dataTable
      controlDataTable(ev, elementGridPropostesClient(), selectedIndex, listClients);
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
      showClient();
    }

    const showClient = async () => {
      await obtenirPropostesClient(selectedClient.value, refInfoBusqueda.value);
    }

    return {
      props,
      infoPropostes,
      listClients,
      selectedClient,
      dataPropostes,
      visibleModalPropostaClient,
      selectedIndex,
      handleDblClick,
      showClient,
      emit
    }

  }
}
</script>

<style scoped>
  .ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
  }
</style>