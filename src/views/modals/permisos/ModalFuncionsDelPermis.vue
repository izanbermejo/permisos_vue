<template>
  <ModalEmpleatsCentDepFun v-if="visibleEmpleatsCentDepFun" :carregat="visibleEmpleatsCentDepFun"
    @update:carregat="visibleEmpleatsCentDepFun = $event" :idCentre="idCentre" :idDepartament="idDepartament"
    :idFuncio="idFuncio" :centDepFun="centDepFun" />
  <ModalAfegirFuncioDelPermis v-if="visibleAfegirFuncioDelPermis" :carregat="visibleAfegirFuncioDelPermis"
    @update:carregat="visibleAfegirFuncioDelPermis = $event" :nomAplicacio="props.nomAplicacio"
    :nomModul="props.nomModul" :nomPermis="props.nomPermis" @actualitzar="carregaFuncionsDelPermis()"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="true" :contentStyle="{ overflowY: 'hidden' }">
    <template #header>
      <div style="width: 100%;">
        <span style="font-size: larger; font-weight: 600; float: left;">{{ `${$t('Permisos.funcions permis')}: ${props.nomAplicacio} - ${props.nomModul} - ${props.nomPermis}` }}</span>
        <ButtonShortcut :literal="$t('Permisos.Afegir Funcio al permis')" @click="visibleAfegirFuncioDelPermis = true"
          icon="fa-solid fa-plus" style="margin-left: 25px;"/>
      </div>
    </template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <DataTable :value="funcions" class="p-datatable-sm" :dataKey="codiNumeroFormat"
    style="margin-top: 15px;" :scrollable="false" scrollHeight="80vh" :resizableColumns="true"
    columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
    @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
    selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
    :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
      <template #empty>
        <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Funcions.Cap funcio')" />
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
      <Column :header="$t('App.Centre')" :style="{ width: '350px' }" style="max-width: 350px;" field="centre">
        <template #body="{ data }">
          <span v-if="data.nomCentre"> {{ data.nomCentre }} </span>
          <span v-else><b>***</b></span>
        </template>
      </Column>
      <Column :header="$t('App.Departament')" :style="{ width: '350px' }" style="max-width: 350px;" field="departament">
        <template #body="{ data }">
          <span v-if="data.nomDepartament"> {{ getLocalizedJson(data.nomDepartament) }} </span>
          <span v-else><b>***</b></span>
        </template>
      </Column>
      <Column :header="$t('App.Funcio')" :style="{ width: '250px' }"  field="funcio">
        <template #body="{ data }">
          <span v-if="data.nomFuncio"> {{ getLocalizedJson(data.nomFuncio) }} </span>
          <span v-else><b>***</b></span>
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
import ModalEmpleatsCentDepFun from '../ModalEmpleatsCentDepFun.vue';
import ModalAfegirFuncioDelPermis from './ModalAfegirFuncioDelPermis.vue';
import { useConfirm } from 'primevue/useconfirm';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';

export default {
  name: 'ModalFuncionsDelPermis',
  components: {
    ModalEmpleatsCentDepFun,
    ModalAfegirFuncioDelPermis,
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
    const funcions = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const visibleEmpleatsCentDepFun = ref(false);
    const visibleAfegirFuncioDelPermis = ref(false);
    const idCentre = ref(null);
    const idDepartament = ref(null);
    const idFuncio = ref(null);
    const centDepFun = ref('');

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      await carregaFuncionsDelPermis();
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return visibleEmpleatsCentDepFun.value
      || visibleAfegirFuncioDelPermis.value;
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

    const carregaFuncionsDelPermis = async () => {
      const data = await permisosService.obtenirFuncionsByPermis(props.nomAplicacio, props.nomModul, props.nomPermis);
      funcions.value = data;
    }

    const empleatsFuncio = async (codiCentre, codiDepartament, codiFuncio) => {
      idCentre.value = codiCentre;
      idDepartament.value = codiDepartament;
      idFuncio.value = codiFuncio;
      centDepFun.value = `${registreSeleccionat.value.nomCentre ? registreSeleccionat.value.nomCentre : '***'} - ${registreSeleccionat.value.nomDepartament ? getLocalizedJson(registreSeleccionat.value.nomDepartament) : '***'} - ${registreSeleccionat.value.nomFuncio ? getLocalizedJson(registreSeleccionat.value.nomFuncio) : '***'}`;
      visibleEmpleatsCentDepFun.value = true;
    };

    const eliminarFuncio = async (nomAplicacio, nomModul, nomPermis) => {

      confirm.require({
        header: t('Funcions.Eliminar Funcio'),
        acceptClass: 'p-button-danger',
        message: t('Permisos.Confirmacio eliminar funcio del permis'),
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          let request = {
            idCentre: registreSeleccionat.value.idCentre,
            idDepartament: registreSeleccionat.value.idDepartament,
            idFuncio: registreSeleccionat.value.idFuncio,
          }

          await permisosService.eliminarFuncioDelPermis(nomAplicacio, nomModul, nomPermis, request);
          await carregaFuncionsDelPermis();
        }
      });
    };

    const menuModel = computed(() => {
      let result = [];
      result.push({ label: () => `${t('Funcions.empleats funcio')}`, class: 'p-button-text', icon: 'pi pi-user', command: () => empleatsFuncio(registreSeleccionat.value.idCentre, registreSeleccionat.value.idDepartament, registreSeleccionat.value.idFuncio) });
      result.push({ label: () => `${t('Funcions.eliminar funcio')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarFuncio(props.nomAplicacio, props.nomModul, props.nomPermis) });
      return result;
    });

    return {
      visible,
      visibleEmpleatsCentDepFun,
      visibleAfegirFuncioDelPermis,
      props,
      onSort,
      funcions,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      carregaFuncionsDelPermis,
      getLocalizedJson,
      hide,
      idCentre,
      idDepartament,
      idFuncio,
      centDepFun,
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
