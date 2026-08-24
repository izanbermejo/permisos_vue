<template>
<div id="gridConsumsBuscador" style="height:100%; display:flex; flex-direction:column;">
  <AjudaImprimirAlbara v-if="visibleImprimir && albaraImprimir" :albara="albaraImprimir"
    @update:carregat="visibleImprimir = false" />
  <ContextMenu ref="contextMenu" :model="menuModel" style="width:auto;" />
  <DataTable
      :value="consums"
      class="p-datatable-sm-petita"
      dataKey="_key"
      v-model:selection="selected"
      selectionMode="single"
      showGridlines
      :scrollable="true" scrollHeight="flex"
      :resizableColumns="true" columnResizeMode="expand"
      contextMenu v-model:contextMenuSelection="selected" @rowContextmenu="showContextMenu($event)"
      :rowClass="() => 'estilRow'"
      @row-dblclick="onDblClick">
    <template #empty>
      <div style="width:100%; text-align:center; padding: 30px 0;">
        <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('App.Sense resultats')" />
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
    <Column :header="$t('Consums.numero')" :style="{ width: '110px' }" style="max-width: 110px;">
      <template #body="{ data }">{{ data.id.codiFormat }}</template>
    </Column>
    <Column :header="$t('Consums.data')" :style="{ width: '100px' }" style="max-width: 100px;">
      <template #body="{ data }">{{ data.data ? $d($toDate(data.data), 'short') : '' }}</template>
    </Column>
    <Column :header="$t('Consums.client')" :style="{ width: '220px' }" style="max-width: 220px;">
      <template #body="{ data }">
        <div class="ellipsis" v-tooltip="data.clientNom">{{ data.client }}<span v-if="data.clientNom"> - {{ data.clientNom }}</span></div>
      </template>
    </Column>
    <Column :header="$t('Consums.magatzem')" :style="{ width: '200px' }" style="max-width: 200px;">
      <template #body="{ data }">
        <div class="ellipsis" v-tooltip="$magatzem(data.magatzem)">{{ data.magatzem }} - {{ $magatzem(data.magatzem) }}</div>
      </template>
    </Column>
    <Column :header="$t('Consums.albaraEspecial')" :style="{ width: '150px' }" style="max-width: 150px;">
      <template #body="{ data }">
        <div class="ellipsis">{{ data.numeroAlbaraEspecial || '' }}</div>
      </template>
    </Column>
    <Column :header="$t('Consums.tancat')" :style="{ width: '80px' }" style="max-width: 80px;">
      <template #body="{ data }">
        <div style="width:100%; text-align:center;">
          <i :class="data.isTancat ? 'pi pi-lock' : 'pi pi-lock-open'" />
        </div>
      </template>
    </Column>
    <Column :header="$t('Consums.facturat')" :style="{ width: '110px' }" style="max-width: 110px;">
      <template #body="{ data }">
        <div style="width:100%; text-align:center;">
          <Tag v-if="data.isFacturat" style="background-color:#00939b" icon="pi pi-check" :value="$t('App.Si')" />
          <Tag v-else style="background-color:#f0bd3c" icon="pi pi-clock" :value="$t('App.No')" />
        </div>
      </template>
    </Column>
    <Column :header="$t('Consums.pendentFacturar')" :style="{ width: '130px' }" style="max-width: 130px;">
      <template #body="{ data }">
        <div style="width:100%; text-align:center;">
          <Tag v-if="data.teLiniaPendentFacturar" style="background-color:#f0bd3c" icon="pi pi-exclamation-triangle" :value="$t('App.Si')" />
          <Tag v-else style="background-color:#00939b" icon="pi pi-check" :value="$t('App.No')" />
        </div>
      </template>
    </Column>
  </DataTable>
</div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import AjudaImprimirAlbara from '@/views/modals/albara/AjudaImprimirAlbara.vue';

export default {
  name: 'GridConsumsBuscador',
  components: { InfoTaulaBuida, AjudaImprimirAlbara },
  props: {
    consums: { type: Array, default: () => [] }
  },
  emits: ['veureDetall', 'seleccioCanviada'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const selected = ref(null);
    const contextMenu = ref();
    const visibleImprimir = ref(false);
    const albaraImprimir = ref(null);

    watch(selected, (consum) => {
      emit('seleccioCanviada', consum?.linies || []);
    });

    watch(() => props.consums, () => {
      selected.value = null;
      emit('seleccioCanviada', []);
    });

    const showContextMenu = (ev) => {
      selected.value = ev.data;
      contextMenu.value.show(ev.originalEvent);
    };

    const onDblClick = (ev) => {
      emit('veureDetall', ev.data);
    };

    const obrirImprimir = () => {
      if (!selected.value) return;
      albaraImprimir.value = { id: selected.value.id, client: selected.value.client };
      visibleImprimir.value = true;
    };

    const menuModel = computed(() => [
      { label: () => t('Consums.veureDetall'), class: 'p-button-text', icon: 'pi pi-eye', command: () => selected.value && emit('veureDetall', selected.value) },
      { label: () => t('Consums.imprimir'), class: 'p-button-text', icon: 'pi pi-file-pdf', command: () => obrirImprimir() }
    ]);

    return { selected, contextMenu, menuModel, showContextMenu, onDblClick, visibleImprimir, albaraImprimir };
  }
};
</script>

<style scoped>
#gridConsumsBuscador :deep(.p-datatable) { flex: 1; min-height: 0; }
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
