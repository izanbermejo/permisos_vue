<template>
<div id="gridLiniesConsumBuscador" style="height:100%; display:flex; flex-direction:column;">
  <AjudaStocks v-if="visibleStocks && selected" :carregat="visibleStocks"
    @update:carregat="visibleStocks = $event"
    :artint="selected.articleClient.artint" :clicod="selected.articleClient.clicod" />
  <ModalHistoricMoviments v-if="selected" v-model:visible="visibleMoviments"
    :artint="selected.articleClient.artint" :clicod="selected.articleClient.clicod" />
  <ContextMenu ref="contextMenu" :model="menuModel" style="width:auto;" />
  <DataTable
      :value="rows"
      class="p-datatable-sm-petita"
      dataKey="_key"
      v-model:selection="selected"
      selectionMode="single"
      showGridlines
      :scrollable="true" scrollHeight="flex"
      :resizableColumns="true" columnResizeMode="expand"
      contextMenu v-model:contextMenuSelection="selected" @rowContextmenu="showContextMenu($event)"
      :rowClass="() => 'estilRow'">
    <template #empty>
      <div style="width:100%; text-align:center; padding: 30px 0;">
        <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('App.Sense resultats')" />
      </div>
    </template>
    <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
      <template #body="{ data }">
        <div style="width: 100%;">
          <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
            @click="selected = data; contextMenu.show($event)" />
        </div>
      </template>
    </Column>
    <Column :header="$t('Consums.article')" :style="{ width: '150px' }" style="max-width: 150px;">
      <template #body="{ data }">{{ data.pesaMatriu }}{{ data.articleClient.clicod }}</template>
    </Column>
    <Column :header="$t('Consums.referencia')" :style="{ width: '150px' }" style="max-width: 150px;">
      <template #body="{ data }">{{ data.pesaReferencia }}</template>
    </Column>
    <Column :header="$t('Consums.denominacio')">
      <template #body="{ data }">{{ data.pesaDenominacio }}</template>
    </Column>
    <Column :header="$t('Consums.quantitat')" :style="{ width: '100px' }" style="max-width: 100px; text-align:right;">
      <template #body="{ data }">
        <div style="width:100%; text-align:right;">{{ $n(data.quantitat) }}</div>
      </template>
    </Column>
    <Column :header="$t('Consums.pendentFacturar')" :style="{ width: '120px' }" style="max-width: 120px; text-align:right;">
      <template #body="{ data }">
        <div style="width:100%; text-align:right;">{{ $n(data.quantitatPendentFacturar) }}</div>
      </template>
    </Column>
    <Column :header="$t('Consums.identificador')" :style="{ width: '160px' }" style="max-width: 160px;">
      <template #body="{ data }">{{ data.identificadorConsum }}</template>
    </Column>
  </DataTable>
</div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import ModalHistoricMoviments from '@/views/modals/ModalHistoricMoviments.vue';

export default {
  name: 'GridLiniesConsumBuscador',
  components: { InfoTaulaBuida, AjudaStocks, ModalHistoricMoviments },
  props: {
    linies: { type: Array, default: () => [] }
  },
  setup(props) {
    const { t } = useI18n();
    const selected = ref(null);
    const contextMenu = ref();
    const visibleStocks = ref(false);
    const visibleMoviments = ref(false);

    const rows = computed(() => props.linies.map(l => ({ ...l, _key: l.id.linia })));

    watch(() => props.linies, () => { selected.value = null; });

    const showContextMenu = (ev) => {
      selected.value = ev.data;
      contextMenu.value.show(ev.originalEvent);
    };

    const menuModel = computed(() => [
      { label: () => t('Consums.veureStock'), class: 'p-button-text', icon: 'pi pi-box', command: () => { if (selected.value) visibleStocks.value = true; } },
      { label: () => t('Consums.veureMovimentsMagatzem'), class: 'p-button-text', icon: 'pi pi-warehouse', command: () => { if (selected.value) visibleMoviments.value = true; } }
    ]);

    return { selected, rows, contextMenu, menuModel, showContextMenu, visibleStocks, visibleMoviments };
  }
};
</script>

<style scoped>
#gridLiniesConsumBuscador :deep(.p-datatable) { flex: 1; min-height: 0; }
::v-deep(.estilRow) { cursor: pointer; }
::v-deep(.estilRow .ocultable) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
  display: none;
}
::v-deep(.estilRow:hover .ocultable) { display: flex; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) { padding: 0.0rem 0.2rem; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) { padding: 0.0rem 0.2rem; }
.ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
</style>
