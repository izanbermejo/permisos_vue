<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('Consums.seleccionaPlataforma')" :style="{ width: '650px' }">
    <div style="margin-bottom: 10px;">
      <span class="p-input-icon-left" style="width: 100%;">
        <i class="pi pi-search" />
        <InputText ref="inputFiltre" v-model="filtre" :placeholder="$t('Consums.filtraPerNom')" style="width: 100%;" />
      </span>
    </div>
    <DataTable ref="taula" :value="plataformesFiltrades" class="p-datatable-sm-petita" dataKey="codi"
      :scrollable="true" scrollHeight="50vh" showGridlines selectionMode="single"
      v-model:selection="seleccionada" @row-dblclick="seleccionaFila($event.data)">
      <template #empty>
        <div style="text-align: center; padding: 20px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Consums.capPlataforma')" />
        </div>
      </template>
      <Column :header="$t('Consums.codi')" field="codi" :style="{ width: '100px' }" style="max-width: 100px;" />
      <Column :header="$t('Consums.descripcio')" field="descripcio">
        <template #body="{ data }">
          <div class="ellipsis" v-tooltip="data.descripcio">{{ data.descripcio }}</div>
        </template>
      </Column>
    </DataTable>
    <template #footer>
      <Button :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
      <Button :label="$t('App.Continuar')" icon="pi pi-arrow-right" class="p-button-sm"
        style="margin-left: 10px;" :disabled="!seleccionada" @click="seleccionaFila(seleccionada)" />
    </template>
  </Dialog>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { carrega } from '@/services/loader';
import ConsumsService from '@/services/consums.service';

export default {
  name: 'ModalSeleccionarPlataforma',
  setup(props, { emit }) {
    const visible = ref(true);
    const plataformes = ref([]);
    const filtre = ref('');
    const seleccionada = ref();
    const taula = ref();
    const inputFiltre = ref();

    onMounted(async () => {
      document.addEventListener('keydown', handler);
      // Focus al camp de filtre en obrir el modal
      nextTick(() => inputFiltre.value?.$el?.focus());
      plataformes.value = await carrega(ConsumsService.llistarPlataformes());
      // Preselecció de la primera fila per poder navegar amb teclat des de l'inici
      seleccionada.value = plataformesFiltrades.value[0];
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handler);
    });

    const plataformesFiltrades = computed(() => {
      const q = (filtre.value || '').toLowerCase();
      const llista = !q
        ? plataformes.value
        : plataformes.value.filter(p =>
            (p.descripcio || '').toLowerCase().includes(q) || (p.codi || '').toLowerCase().includes(q));
      // Ordenació fixa per codi (les columnes no són ordenables)
      return [...llista].sort((a, b) => (a.codi || '').localeCompare(b.codi || ''));
    });

    const handler = (e) => {
      if (e.key === 'Escape') {
        hide();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moure(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moure(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        seleccionaFila(seleccionada.value);
      }
    };

    const moure = (delta) => {
      const llista = plataformesFiltrades.value;
      if (!llista.length) return;
      let index = llista.findIndex(p => seleccionada.value && p.codi === seleccionada.value.codi);
      index = index < 0 ? 0 : Math.min(Math.max(index + delta, 0), llista.length - 1);
      seleccionada.value = llista[index];
      // Scroll a la fila seleccionada
      nextTick(() => {
        const fila = taula.value?.$el?.querySelector('tr.p-highlight');
        fila?.scrollIntoView({ block: 'nearest' });
      });
    };

    const hide = () => emit('update:carregat', false);

    const seleccionaFila = (fila) => {
      if (!fila) return;
      emit('plataformaSeleccionada', fila);
    };

    return { visible, filtre, seleccionada, plataformesFiltrades, taula, inputFiltre, hide, seleccionaFila };
  }
};
</script>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
