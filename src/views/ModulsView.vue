<template>
  <ModalCrearEditarModul v-if="visibleCrearEditarModul" :carregat="visibleCrearEditarModul"  @update:carregat="visibleCrearEditarModul = $event" :isEdit="isEdit" :llistaAplicacions="aplicacions" :nomAplicacio="nomAplicacio" :nomModul="nomModul" @actualitzar="carregaModuls()" />
  <ModalFuncionsDelModul v-if="visibleFuncionsDelModul" :carregat="visibleFuncionsDelModul"  @update:carregat="visibleFuncionsDelModul = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" />
  <ModalEmpleatsDelModul v-if="visibleEmpleatsDelModul" :carregat="visibleEmpleatsDelModul"  @update:carregat="visibleEmpleatsDelModul = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" />
  <ModalTotsElsEmpleatsDelModul v-if="visibleTotsElsEmpleatsDelModul" :carregat="visibleTotsElsEmpleatsDelModul"  @update:carregat="visibleTotsElsEmpleatsDelModul = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" />
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-layer-group" style="font-size: 1.25rem" />
      {{ $t('App.Moduls') }}
      <ButtonShortcut @click="crearEditarModul(false)" 
          style="margin-left: 15px;" icon="fa-solid fa-plus" 
          :literal="$t('Moduls.nou modul')"/>
    </h5>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <div id="divTarifes" class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('App.Aplicacions') }}</label>
          <MultiSelect v-model="filtreAplicacions" :options="aplicacions" optionLabel="nomAplicacio" optionValue="nomAplicacio"
            :placeholder="$t('App.seleccionaAplicacio')" class="col-md-3" style="width: 200px;"
            @update:modelValue="carregaModuls()" />
        </div>
      </div>
      <DataTable :value="moduls" class="p-datatable-sm" :dataKey="codiNumeroFormat"
        style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
        columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
        @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
        selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
        :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
        <template #empty>
          <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Moduls.Cap modul')" />
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
        <Column :header="$t('App.Aplicacio')" :style="{ width: '350px' }" style="max-width: 350px;" field="nomAplicacio" sortable>
          <template #body="{ data }">
            {{ data.nomAplicacio }}
          </template>
        </Column>
        <Column :header="$t('Moduls.Nom modul')" :style="{ width: '350px' }" style="max-width: 350px;" field="nomModul" sortable>
          <template #body="{ data }">
            {{ data.nomModul }}
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
import { onMounted, ref, computed, watch } from 'vue';
import aplicacionsService from '@/services/aplicacions.service';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import modulsService from '@/services/moduls.service';
import ModalCrearEditarModul from './modals/moduls/ModalCrearEditarModul.vue';
import ModalFuncionsDelModul from './modals/moduls/ModalFuncionsDelModul.vue';
import ModalEmpleatsDelModul from './modals/moduls/ModalEmpleatsDelModul.vue';
import ModalTotsElsEmpleatsDelModul from './modals/moduls/ModalTotsElsEmpleatsDelModul.vue';

export default {
  name: 'ModulsView',
  components: {
    ModalCrearEditarModul,
    ModalFuncionsDelModul,
    ModalEmpleatsDelModul,
    ModalTotsElsEmpleatsDelModul,
  },
  setup() {
    const { t } = useI18n();
    const aplicacions = ref([]);
    const moduls = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const isEdit = ref(false);
    const nomAplicacio = ref(null);
    const nomModul = ref(null);
    const filtreAplicacions = ref([]);
    const visibleCrearEditarModul = ref(false);
    const visibleFuncionsDelModul = ref(false);
    const visibleEmpleatsDelModul = ref(false);
    const visibleTotsElsEmpleatsDelModul = ref(false);
    const confirm = useConfirm();

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      await carregaAplicacions();

      const seleccionats = localStorage.getItem('valorFiltreAplicacions');
      if (seleccionats) {
        filtreAplicacions.value = seleccionats
          .split(',')
          .filter(r =>
            aplicacions.value.some(
              aplicacio => aplicacio.nomAplicacio === r
            )
          );
      }
      await carregaModuls();

    });

    watch(filtreAplicacions, () => {
      localStorage.setItem('valorFiltreAplicacions', 
        filtreAplicacions.value.join(',')
      );
    });

    const carregaAplicacions = async () => {
      const data = await aplicacionsService.obtenirAplicacions();
      aplicacions.value = data;
    }

    const carregaModuls = async () => {
      const urlParams = new URLSearchParams();
      filtreAplicacions.value.forEach((aplicacio) => {
        urlParams.append('nomAplicacions', aplicacio);
      });
      const data = await modulsService.obtenirModulsByAplicacio(urlParams.toString());
      moduls.value = data;
    }

    const crearEditarModul = async (isEditFlag, nomAplicacioSeleccionada = null, nomModulSeleccionat = null) => {
      isEdit.value = isEditFlag;
      if (isEdit.value) {
        nomAplicacio.value = nomAplicacioSeleccionada;
        nomModul.value = nomModulSeleccionat;
      } else {
        nomAplicacio.value = null;
        nomModul.value = null;
      }
      visibleCrearEditarModul.value = true;
    };

    const mostrarFuncionsDelModul = async (nomAplicacioSeleccionada, nomModulSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      visibleFuncionsDelModul.value = true;
    };

    const mostrarEmpleatsDelModul = async (nomAplicacioSeleccionada, nomModulSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      visibleEmpleatsDelModul.value = true;
    };

    const mostrarTotsElsEmpleatsDelModul = async (nomAplicacioSeleccionada, nomModulSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      visibleTotsElsEmpleatsDelModul.value = true;
    };

    const eliminarModul = async (nomAplicacio, nomModul) => {
      const resultat = await modulsService.eliminarModul(nomAplicacio, nomModul, false);

      if (resultat.requereixConfirmacio) {
        confirm.require({
          header: t('Moduls.Eliminar Modul'),
          acceptClass: 'p-button-danger',
          message: t('Moduls.Confirmacio eliminar modul amb funcions i empleats'),
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            await modulsService.eliminarModul(nomAplicacio, nomModul, true);

            carregaModuls();
          }
        });
      } else {
        carregaModuls();
      }
    };

    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Moduls.funcionsModul')}`, class: 'p-button-text', icon: 'pi pi-sitemap', command: () => mostrarFuncionsDelModul(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul) });
        result.push({ label: () => `${t('Moduls.empleat modul')}`, class: 'p-button-text', icon: 'pi pi-user', command: () => mostrarEmpleatsDelModul(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul) });
        result.push({ label: () => `${t('Moduls.tots acces')}`, class: 'p-button-text', icon: 'pi pi-users', command: () => mostrarTotsElsEmpleatsDelModul(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul) });
        result.push({ separator: true });
        result.push({ label: () => `${t('Moduls.editarModul')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => crearEditarModul(true, registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul) });
        result.push({ label: () => `${t('Moduls.Eliminar Modul')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarModul(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul) });
      return result;
    });

    return {
      onSort,
      aplicacions,
      moduls,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      crearEditarModul,
      eliminarModul,
      carregaAplicacions,
      carregaModuls,
      visibleCrearEditarModul,
      visibleFuncionsDelModul,
      visibleEmpleatsDelModul,
      visibleTotsElsEmpleatsDelModul,
      isEdit,
      nomAplicacio,
      nomModul,
      filtreAplicacions,
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
