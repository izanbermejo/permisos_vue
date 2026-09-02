<template>
  <ModalCrearEditarAplicacio v-if="visibleCrearEditarAplicacio" :carregat="visibleCrearEditarAplicacio"  @update:carregat="visibleCrearEditarAplicacio = $event" :isEdit="isEdit" :nomAplicacio="nomAplicacio" @actualitzar="carregaAplicacions()" />
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-grip" style="font-size: 1.25rem" />
      {{ $t('App.Aplicacions') }}
      <ButtonShortcut @click="crearEditarAplicacio(false)" 
          style="margin-left: 15px;" icon="fa-solid fa-plus" 
          :literal="$t('Aplicacions.novaAplicacio')"/>
    </h5>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <div id="divTarifes" class="card-body">
      <DataTable :value="aplicacions" class="p-datatable-sm" :dataKey="codiNumeroFormat"
        style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
        columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
        @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
        selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
        :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
        <template #empty>
          <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Aplicacions.Cap Aplicacio')" />
          </div>
        </template>
        <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{ data }">
            <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                @click="registreSeleccionat = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Aplicacions.NomAplicacio')" :style="{ width: '450px' }" style="max-width: 450px;" field="nomAplicacio" sortable>
          <template #body="{ data }">
            {{ data.nomAplicacio }}
          </template>
        </Column>
        <Column :header="$t('Aplicacions.Descripcio')" :style="{ width: '250px' }"  field="descripcio">
          <template #body="{ data }">
            {{ data.descripcio}}
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed } from 'vue';
import aplicacionsService from '@/services/aplicacions.service';
import { useI18n } from 'vue-i18n';
import ModalCrearEditarAplicacio from '@/views/modals/ModalCrearEditarAplicacio.vue';
import { useConfirm } from 'primevue/useconfirm';

export default {
  name: 'AplicacionsView',
  components: {
    ModalCrearEditarAplicacio
  },
  setup() {
    const { t } = useI18n();
    const aplicacions = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const isEdit = ref(false);
    const nomAplicacio = ref(null);
    const state = reactive({
      dataInici: new Date(),
      articleclient: '',
      mostrarEliminades: false,
    });
    const visibleCrearEditarAplicacio = ref(false);
    const confirm = useConfirm();

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      carregaAplicacions();
    });

    const carregaAplicacions = async () => {
      const data = await aplicacionsService.obtenirAplicacions();
      aplicacions.value = data;
    }

    const crearEditarAplicacio = async (isEditFlag, nomAplicacioSeleccionada = null) => {
      isEdit.value = isEditFlag;
      if (isEdit.value) {
        nomAplicacio.value = nomAplicacioSeleccionada;
      } else {
        nomAplicacio.value = null;
      }
      visibleCrearEditarAplicacio.value = true;
    };

    const eliminarAplicacio = async (nomAplicacio) => {
      
      confirm.require({
        header: t('Aplicacions.Eliminar Aplicacio'),
        acceptClass: 'p-button-danger',
        message: t('Aplicacions.Confirmacio eliminar aplicacio', { nomAplicacio: nomAplicacio }),
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          await aplicacionsService.eliminarAplicacio(nomAplicacio);
          carregaAplicacions();
        }
      });
    };

    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Aplicacions.editarAplicacio')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => crearEditarAplicacio(true, registreSeleccionat.value.nomAplicacio) });
        result.push({ label: () => `${t('Aplicacions.eliminarAplicacio')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarAplicacio(registreSeleccionat.value.nomAplicacio) });
      return result;
    });




    return {
      onSort,
      aplicacions,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      state,
      crearEditarAplicacio,
      eliminarAplicacio,
      carregaAplicacions,
      visibleCrearEditarAplicacio,
      isEdit,
      nomAplicacio,
    }

  }
}
</script>

<style scoped>
::v-deep(.p-panel-header) {
  padding: 0.5rem;
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

::v-deep(.estilRow .buttoicon) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
}

.flex-container {
  padding: 5px 10px;
  display: flex;
  gap: 25px;
}

.label-detall {
  font-weight: 600;
  font-size: 1rem;
}
</style>
