<template>
  <ModalCrearEditarPermis v-if="visibleCrearEditarPermis" :carregat="visibleCrearEditarPermis"  @update:carregat="visibleCrearEditarPermis = $event" :isEdit="isEdit" :llistaAplicacions="aplicacions" :llistaModuls="moduls" :nomAplicacio="nomAplicacio" :nomModul="nomModul" :nomPermis="nomPermis"
  @actualitzar="carregaPermisosByModul()" />
  <ModalFuncionsDelPermis v-if="visibleFuncionsDelPermis" :carregat="visibleFuncionsDelPermis"  @update:carregat="visibleFuncionsDelPermis = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" :nomPermis="nomPermis" />
  <ModalEmpleatsDelPermis v-if="visibleEmpleatsDelPermis" :carregat="visibleEmpleatsDelPermis"  @update:carregat="visibleEmpleatsDelPermis = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" :nomPermis="nomPermis" />
  <ModalTotsElsEmpleatsDelPermis v-if="visibleTotsElsEmpleatsDelPermis" :carregat="visibleTotsElsEmpleatsDelPermis"  @update:carregat="visibleTotsElsEmpleatsDelPermis = $event" :nomAplicacio="nomAplicacio" :nomModul="nomModul" :nomPermis="nomPermis" />
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-user-lock" style="font-size: 1.25rem" />
      {{ $t('App.Permisos') }}
      <ButtonShortcut @click="crearEditarPermis(false)" 
          style="margin-left: 15px;" icon="fa-solid fa-plus" 
          :literal="$t('Permisos.nou permis')"/>
    </h5>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <div id="divTarifes" class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('App.Aplicacions') }}</label>
          <Dropdown v-model="filtreAplicacio" :options="aplicacions" optionLabel="nomAplicacio" optionValue="nomAplicacio"
            :placeholder="$t('App.seleccionaAplicacio')" class="col-md-3" style="width: 200px;"/>
        </div>
        <div class="element-filtre">
          <label>{{ $t('App.Moduls') }}</label>
          <MultiSelect v-model="filtreModuls" :options="modulsFiltrats" optionLabel="nomModul" optionValue="nomModul"
            :placeholder="$t('App.seleccionaModul')" class="col-md-3" style="width: 200px;"
            @update:modelValue="carregaPermisosByModul()" />
        </div>
      </div>
      <DataTable :value="permisos" class="p-datatable-sm" :dataKey="codiNumeroFormat"
        style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
        columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
        @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
        selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
        :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
        <template #empty>
          <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Permisos.Cap permis')" />
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
        <Column :header="$t('App.Aplicacio')" :style="{ width: '350px' }" style="max-width: 300px;" field="nomAplicacio" sortable>
          <template #body="{ data }">
            {{ data.nomAplicacio }}
          </template>
        </Column>
        <Column :header="$t('Moduls.Nom modul')" :style="{ width: '350px' }" style="max-width: 300px;" field="nomModul" sortable>
          <template #body="{ data }">
            {{ data.nomModul }}
          </template>
        </Column>
        <Column :header="$t('Permisos.Nom permis')" :style="{ width: '350px' }" style="max-width: 300px;" field="nomPermis" sortable>
          <template #body="{ data }">
            {{ data.nomPermis }}
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
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import aplicacionsService from '@/services/aplicacions.service';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import modulsService from '@/services/moduls.service';
import ModalCrearEditarPermis from './modals/permisos/ModalCrearEditarPermis.vue';
import ModalFuncionsDelPermis from './modals/permisos/ModalFuncionsDelPermis.vue';
import ModalEmpleatsDelPermis from './modals/permisos/ModalEmpleatsDelPermis.vue';
import ModalTotsElsEmpleatsDelPermis from './modals/permisos/ModalTotsElsEmpleatsDelPermis.vue';
import permisosService from '@/services/permisos.service.js';

export default {
  name: 'PermisosView',
  components: {
    ModalCrearEditarPermis,
    ModalFuncionsDelPermis,
    ModalEmpleatsDelPermis,
    ModalTotsElsEmpleatsDelPermis,
  },
  setup() {
    const { t } = useI18n();
    const aplicacions = ref([]);
    const moduls = ref([]);
    const modulsFiltrats = ref([]);
    const carregantFiltres = ref(false);
    const permisos = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const isEdit = ref(false);
    const nomAplicacio = ref(null);
    const nomModul = ref(null);
    const nomPermis = ref(null);
    const filtreAplicacio = ref(null);
    const filtreModuls = ref([]);
    const visibleCrearEditarPermis = ref(false);
    const visibleFuncionsDelPermis = ref(false);
    const visibleEmpleatsDelPermis = ref(false);
    const visibleTotsElsEmpleatsDelPermis = ref(false);
    const confirm = useConfirm();

    const sortField = ref(null);
    const sortOrder = ref(null);

    const LOCAL_STORAGE_APLICACIO = 'valorFiltreAplicacio';
    const LOCAL_STORAGE_MODULS = 'valorFiltreModuls';

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      await carregaAplicacions();
      await carregaModuls();
      await carregarFiltres();

      if (filtreAplicacio.value) {
        filtrarModulsByAplicacio();
      }

      filtreModuls.value = filtreModuls.value.filter(modul =>
        modulsFiltrats.value.some(
          modulFiltrat => modulFiltrat.nomModul === modul
        )
      );

      await carregaPermisosByModul();

    });

    watch(filtreAplicacio, () => {
      if (carregantFiltres.value) {
        return;
      }

      filtreModuls.value = [];
      permisos.value = [];

      filtrarModulsByAplicacio();

      guardarFiltres();

    });

    watch(filtreModuls, () => {
      if (carregantFiltres.value) {
        return;
      }

      guardarFiltres();
    });

    const guardarFiltres = () => {
      localStorage.setItem(
        LOCAL_STORAGE_APLICACIO,
        filtreAplicacio.value || ''
      );

      localStorage.setItem(
        LOCAL_STORAGE_MODULS,
        JSON.stringify(filtreModuls.value)
      );
    };

    const carregarFiltres = async () => {
      carregantFiltres.value = true;
      
      const aplicacioGuardada = localStorage.getItem(
        LOCAL_STORAGE_APLICACIO
      );

      const modulsGuardats = localStorage.getItem(
        LOCAL_STORAGE_MODULS
      );

      if (aplicacioGuardada) {
        filtreAplicacio.value = aplicacioGuardada;
      }

      if (modulsGuardats) {
        try {
          filtreModuls.value = JSON.parse(modulsGuardats);
        } catch {
          filtreModuls.value = [];
        }
      }
      await nextTick();
      carregantFiltres.value = false;
    };

    const carregaAplicacions = async () => {
      const data = await aplicacionsService.obtenirAplicacions();
      aplicacions.value = data;
    }

    const carregaModuls = async () => {
      const data = await modulsService.obtenirModuls();
      moduls.value = data;
    }

    const filtrarModulsByAplicacio = () => {
      const data = moduls.value.filter(modul => modul.nomAplicacio === filtreAplicacio.value);
      modulsFiltrats.value = data;
    }

    const carregaPermisosByModul = async () => {
      const urlParams = new URLSearchParams();
      filtreModuls.value.forEach((modul) => {
        urlParams.append('nomModuls', modul);
      });
      const data = await permisosService.obtenirPermisosByModul(urlParams.toString(), filtreAplicacio.value);
      permisos.value = data;
    }

    const crearEditarPermis = async (isEditFlag, nomAplicacioSeleccionada = null, nomModulSeleccionat = null, nomPermisSeleccionat = null) => {
      isEdit.value = isEditFlag;

      if (isEdit.value) {
        nomAplicacio.value = nomAplicacioSeleccionada;
        nomModul.value = nomModulSeleccionat;
        nomPermis.value = nomPermisSeleccionat;
      } else {
        nomAplicacio.value = null;
        nomModul.value = null;
        nomPermis.value = null;
      }
      visibleCrearEditarPermis.value = true;
    };

    const mostrarFuncionsDelPermis = async (nomAplicacioSeleccionada, nomModulSeleccionat, nomPermisSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      nomPermis.value = nomPermisSeleccionat;
      visibleFuncionsDelPermis.value = true;
    };

    const mostrarEmpleatsDelPermis = async (nomAplicacioSeleccionada, nomModulSeleccionat, nomPermisSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      nomPermis.value = nomPermisSeleccionat;
      visibleEmpleatsDelPermis.value = true;
    };

    const mostrarTotsElsEmpleatsDelPermis = async (nomAplicacioSeleccionada, nomModulSeleccionat, nomPermisSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomModul.value = nomModulSeleccionat;
      nomPermis.value = nomPermisSeleccionat;
      visibleTotsElsEmpleatsDelPermis.value = true;
    };

    const eliminarPermis = async (nomAplicacio, nomModul, nomPermis) => {
      const resultat = await permisosService.eliminarPermis(nomAplicacio, nomModul, nomPermis, false);

      if (resultat.requereixConfirmacio) {
        confirm.require({
          header: t('Permisos.Eliminar Permis'),
          acceptClass: 'p-button-danger',
          message: t('Moduls.Confirmacio eliminar modul amb funcions i empleats'),
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            await permisosService.eliminarPermis(nomAplicacio, nomModul, nomPermis, true);

            carregaPermisosByModul();
          }
        });
      } else {
        carregaPermisosByModul();
      }
    };

    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Permisos.funcions permis')}`, class: 'p-button-text', icon: 'pi pi-sitemap', command: () => mostrarFuncionsDelPermis(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul, registreSeleccionat.value.nomPermis) });
        result.push({ label: () => `${t('Permisos.empleat permis')}`, class: 'p-button-text', icon: 'pi pi-user', command: () => mostrarEmpleatsDelPermis(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul, registreSeleccionat.value.nomPermis) });
        result.push({ label: () => `${t('Moduls.tots acces')}`, class: 'p-button-text', icon: 'pi pi-users', command: () => mostrarTotsElsEmpleatsDelPermis(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul, registreSeleccionat.value.nomPermis) });
        result.push({ separator: true });
        result.push({ label: () => `${t('Permisos.Editar Permis')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => crearEditarPermis(true, registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul, registreSeleccionat.value.nomPermis) });
        result.push({ label: () => `${t('Permisos.Eliminar Permis')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarPermis(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomModul, registreSeleccionat.value.nomPermis) });
      return result;
    });

    return {
      onSort,
      aplicacions,
      moduls,
      modulsFiltrats,
      guardarFiltres,
      carregarFiltres,
      permisos,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      crearEditarPermis,
      eliminarPermis,
      carregaAplicacions,
      filtrarModulsByAplicacio,
      carregaPermisosByModul,
      visibleCrearEditarPermis,
      visibleFuncionsDelPermis,
      visibleEmpleatsDelPermis,
      visibleTotsElsEmpleatsDelPermis,
      isEdit,
      nomAplicacio,
      nomModul,
      nomPermis,
      filtreAplicacio,
      filtreModuls,
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
