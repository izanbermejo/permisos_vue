<template>
  <ModalQuantitatConsum v-if="visibleQuantitat" :carregat="visibleQuantitat"
    @update:carregat="visibleQuantitat = $event"
    :peca="pecaSeleccionada" :disponible="disponible"
    @pecaAfegida="pecaAfegida" />

  <AjudaStocks v-if="visibleStocks" :carregat="visibleStocks"
    @update:carregat="visibleStocks = $event"
    :artint="pecaSeleccionada.artint" :clicod="pecaSeleccionada.clicod" />

  <ModalAlbaransPendentConsum v-if="visibleAlbaransPendent" :carregat="visibleAlbaransPendent"
    @update:carregat="visibleAlbaransPendent = $event"
    :peca="pecaSeleccionada" :magatzem="magatzem" />

  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="`${$t('Consums.afegirLinia')} — ${$magatzem(magatzem)} — ${client}`"
    :style="{ width: '1000px' }">

    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />

    <div class="card">
      <div class="card-header" style="display: flex; align-items: center; gap: 15px;">
        <h5 style="margin: 0;">{{ $t('Consums.stockMagatzem') }}</h5>
        <InputText v-model="filtreStock" :placeholder="$t('Consums.filtreStock')" style="width: 340px;" />
      </div>
      <div class="card-body" style="height: 300px; padding: 0;">
        <DataTable :value="stockFiltrat" class="p-datatable-sm-petita" dataKey="dataKey" :scrollable="true" scrollHeight="flex"
          showGridlines selectionMode="single" v-model:selection="pecaSeleccionada"
          contextMenu v-model:contextMenuSelection="pecaSeleccionada" @rowContextmenu="showContextMenu($event)"
          :rowClass="() => 'estilRow'" @row-dblclick="obrirQuantitat($event.data)">
          <template #empty>
            <div style="min-height: 260px; width: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capPecaClient')" />
            </div>
          </template>
          <Column :style="{ width: '45px' }" style="max-width: 45px;" :reorderableColumn="false">
            <template #body="{ data }">
              <div style="width: 100%;">
                <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="pecaSeleccionada = data; contextMenu.show($event)" />
              </div>
            </template>
          </Column>
          <Column :header="$t('Consums.article')" :style="{ width: '160px' }" sortable field="aclfab">
            <template #body="{ data }">{{ data.aclfab }}{{ data.clicod }}</template>
          </Column>
          <Column :header="$t('Consums.referencia')" field="referencia" :style="{ width: '180px' }" sortable />
          <Column :header="$t('Consums.denominacio')" field="denominacio" sortable />
          <Column :header="$t('Consums.stock')" field="stock" :style="{ width: '120px' }" style="max-width: 120px; text-align: right;" sortable>
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">{{ $n(data.stock) }}</div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <template #footer>
      <Button :label="$t('App.Tanca')" icon="pi pi-times" class="p-button-secondary p-button-sm" @click="hide" />
    </template>
  </Dialog>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { carrega } from '@/services/loader';
import ConsumsService from '@/services/consums.service';
import ModalQuantitatConsum from '@/views/modals/consums/ModalQuantitatConsum.vue';
import ModalAlbaransPendentConsum from '@/views/modals/consums/ModalAlbaransPendentConsum.vue';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';

export default {
  name: 'ModalAfegirLiniaConsum',
  components: { ModalQuantitatConsum, ModalAlbaransPendentConsum, AjudaStocks },
  props: {
    idAlbara: { type: Object, required: true },
    magatzem: { type: String, required: true },
    // Client de l'albarà de consum: només se'n poden consumir peces seves
    client: { type: String, required: true }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const toast = useToast();
    const visible = ref(true);
    const stock = ref([]);
    const filtreStock = ref('');
    const pecaSeleccionada = ref();
    const visibleQuantitat = ref(false);
    const visibleStocks = ref(false);
    const visibleAlbaransPendent = ref(false);
    const disponible = ref(0);
    const contextMenu = ref();

    const carregarStock = async () => {
      const data = await carrega(ConsumsService.obtenirStock(props.magatzem));
      // L'stock de la plataforma és de tots els clients; només s'ofereixen les peces del client de
      // l'albarà (el backend rebutjaria la resta: un consum és sempre d'un únic client)
      stock.value = (data || [])
        .filter(p => p.clicod === props.client && p.empresa === props.idAlbara.empresa)
        .map(p => ({ ...p, dataKey: `${p.empresa}_${p.artint}_${p.clicod}` }));
    };

    onMounted(carregarStock);

    const stockFiltrat = computed(() => {
      const q = (filtreStock.value || '').toLowerCase();
      if (!q) return stock.value;
      return stock.value.filter(p =>
        `${p.aclfab}${p.clicod}`.toLowerCase().includes(q) ||
        (p.referencia || '').toLowerCase().includes(q) ||
        (p.denominacio || '').toLowerCase().includes(q));
    });

    const menuModel = computed(() => [
      { label: () => t('Consums.veureStock'), class: 'p-button-text', icon: 'pi pi-box', command: () => { visibleStocks.value = true; } },
      { label: () => t('Consums.albaransPendent'), class: 'p-button-text', icon: 'pi pi-list', command: () => { visibleAlbaransPendent.value = true; } },
      { label: () => t('Consums.afegirPeca'), class: 'p-button-text', icon: 'pi pi-plus', command: () => obrirQuantitat(pecaSeleccionada.value) }
    ]);

    const showContextMenu = (ev) => {
      pecaSeleccionada.value = ev.data;
      contextMenu.value.show(ev.originalEvent);
    };

    const obrirQuantitat = (peca) => {
      if (!peca) return;
      pecaSeleccionada.value = peca;
      disponible.value = peca.stock;
      if (disponible.value <= 0) {
        toast.add({ severity: 'warn', summary: t('Consums.quantitatSuperaStock', [peca.stock]), life: 4000 });
        return;
      }
      visibleQuantitat.value = true;
    };

    const pecaAfegida = async (dades) => {
      const articleClient = { artint: pecaSeleccionada.value.artint, clicod: pecaSeleccionada.value.clicod };
      await carrega(ConsumsService.afegirLiniaConsum(props.idAlbara.empresa, props.idAlbara.codi, {
        articleClient,
        quantitat: dades.quantitat,
        identificadorConsum: dades.identificador || null
      }));
      toast.add({ severity: 'success', summary: t('Consums.liniaAfegida'), life: 3000 });
      visibleQuantitat.value = false;
      await carregarStock();
      emit('liniaAfegida');
    };

    const hide = () => emit('update:carregat', false);

    return {
      visible, stockFiltrat, filtreStock, pecaSeleccionada, visibleQuantitat, visibleStocks, visibleAlbaransPendent,
      disponible, contextMenu, menuModel, showContextMenu, obrirQuantitat, pecaAfegida, hide
    };
  }
};
</script>

<style scoped>
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
