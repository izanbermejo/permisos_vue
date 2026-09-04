<template>
  <ModalFuncionsEmpleat v-if="visibleFuncionsEmpleat" :carregat="visibleFuncionsEmpleat"
    @update:carregat="visibleFuncionsEmpleat = $event" :idEmpleat="idEmpleat" />
  <ModalAfegirEmpleatDelPermis v-if="visibleAfegirEmpleatDelPermis" :carregat="visibleAfegirEmpleatDelPermis"
    @update:carregat="visibleAfegirEmpleatDelPermis = $event" :nomAplicacio="props.nomAplicacio"
    :nomModul="props.nomModul" :nomPermis="props.nomPermis" @actualitzar="carregaEmpleatsDelPermis()"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="true" :contentStyle="{ overflowY: 'hidden' }">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ `${$t('Permisos.empleat permis')} ${props.nomAplicacio} - ${props.nomModul} - ${props.nomPermis}` }}</span>
        <ButtonShortcut :literal="$t('Permisos.Afegir Empleat al permis')" @click="visibleAfegirEmpleatDelPermis = true"
          icon="fa-solid fa-plus" style="margin-left: 25px;"/>
      </div>
    </template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <DataTable :value="empleats" class="p-datatable-sm" :dataKey="codiNumeroFormat"
    style="margin-top: 15px;" :scrollable="false" scrollHeight="80vh" :resizableColumns="true"
    columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
    @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
    selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
    :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
      <template #empty>
        <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Empleats.Cap empleats')" />
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
      <Column :header="$t('App.Nom')" :style="{ width: '350px' }" style="max-width: 350px;" field="nom">
        <template #body="{ data }">
          {{ data.nom }}
        </template>
      </Column>
      <Column :header="$t('App.Cognoms')" :style="{ width: '350px' }" style="max-width: 350px;" field="cognoms">
        <template #body="{ data }">
          {{ data.cognoms }}
        </template>
      </Column>
      <Column :header="$t('App.Email')" :style="{ width: '250px' }"  field="email">
        <template #body="{ data }">
          {{ data.email }}
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import permisosService from '@/services/permisos.service';
import { getLocalizedJson } from "@/services/index";
import { useConfirm } from 'primevue/useconfirm';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ModalFuncionsEmpleat from '../ModalFuncionsEmpleat.vue';
import ModalAfegirEmpleatDelPermis from './ModalAfegirEmpleatDelPermis.vue';

export default {
  name: 'ModalEmpleatsDelPermis',
  components: {
    ModalFuncionsEmpleat,
    ModalAfegirEmpleatDelPermis,
  },
  props: {
    nomAplicacio: {
      type: String,
      default: null
    },
    nomModul: {
      type: String,
      default: null
    },
    nomPermis: {
      type: String,
      default: null
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const confirm = useConfirm();
    const visible = ref(true);
    const empleats = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const visibleFuncionsEmpleat = ref(false);
    const visibleAfegirEmpleatDelPermis = ref(false);
    const idEmpleat = ref(null);

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      await carregaEmpleatsDelPermis();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return visibleFuncionsEmpleat.value
      || visibleAfegirEmpleatDelPermis.value;
    });

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      if (modalVisible.value) return;
      if (document.querySelector('.p-confirm-dialog')) return;
      if (ev.key=='Escape') {
        actionHandler(ev, hide);
      } 
    }

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const hide = () => {
      emit("actualitzar");
      emit("update:carregat", false);
    };

    const carregaEmpleatsDelPermis = async () => {
      const data = await permisosService.obtenirEmpleatsByPermis(props.nomAplicacio, props.nomModul, props.nomPermis);
      empleats.value = data;
    }

    const funcionsEmpleat = async (empleat) => {
      idEmpleat.value = empleat;
      visibleFuncionsEmpleat.value = true;
    };

    const eliminarEmpleat = async (nomAplicacio, nomModul, nomPermis) => {

      confirm.require({
        header: t('Empleats.Eliminar Empleat'),
        acceptClass: 'p-button-danger',
        message: t('Permisos.Confirmacio eliminar empleat del permis'),
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          await permisosService.eliminarEmpleatDelPermis(nomAplicacio, nomModul, nomPermis, registreSeleccionat.value.id);
          carregaEmpleatsDelPermis();
        }
      });
    };

    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Empleats.funcions empleat')}`, class: 'p-button-text', icon: 'pi pi-user', command: () => funcionsEmpleat(registreSeleccionat.value.id) });
        result.push({ label: () => `${t('Empleats.eliminar empleat')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarEmpleat(props.nomAplicacio, props.nomModul, props.nomPermis) });
      return result;
    });
    
    return {
      visible,
      visibleFuncionsEmpleat,
      visibleAfegirEmpleatDelPermis,
      props,
      onSort,
      empleats,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      carregaEmpleatsDelPermis,
      getLocalizedJson,
      hide,
      idEmpleat,
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

.filtre {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px 30px;
}

.element-filtre {
  align-content: end;
}

.element-filtre>label {
  display: block;
}

::v-deep(.p-multiselect) {
  line-height: 13px;
}

::v-deep(.p-selectbutton) {
  line-height: 13px;
}
</style>
