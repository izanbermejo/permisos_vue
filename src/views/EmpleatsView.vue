<template>
  <ModalFuncionsDelPermis v-if="visibleFuncionsDelPermis" :carregat="visibleFuncionsDelPermis"  @update:carregat="visibleFuncionsDelPermis = $event" :nomAplicacio="aplicacio" :nomModul="registreSeleccionatPermis.nomModul" :nomPermis="registreSeleccionatPermis.permis" />
  <ModalFuncionsDelModul v-if="visibleFuncionsDelModul" :carregat="visibleFuncionsDelModul"  @update:carregat="visibleFuncionsDelModul = $event" :nomAplicacio="aplicacio" :nomModul="registreSeleccionatPermis.nomModul" />
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-users" style="font-size: 1.25rem" />
      {{ $t('App.Empleats') }}
    </h5>
    <ContextMenu ref="contextMenuPermis" :model="menuModelPermis" style="width: auto;" />
    <div id="divTarifes" class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('App.Empleat') }}</label>
          <Dropdown v-model="empleat" filter :options="empleatsMeta" optionLabel="nomComplet" optionValue="usufab"
                    :placeholder="$t('App.selecciona empleat')" style="width: 420px;" @update:modelValue="carregaPermisosEmpleat()"/>
        </div>
        <div class="element-filtre">
          <label>{{ $t('App.Aplicacions') }}</label>
          <Dropdown v-model="aplicacio" :options="aplicacions" optionLabel="nomAplicacio" optionValue="nomAplicacio"
            :placeholder="$t('App.seleccionaAplicacio')" class="col-md-3" style="width: 230px;" @update:modelValue="carregaPermisosEmpleat()"/>
        </div>
      </div>
      <div style="display: flex; flex-direction:row; gap: 2%; margin-top: 20px;">

        <div style="display: flex; flex-direction:column; width: 50%;">
          <div class="card" style="margin-top: 10px;overflow: hidden;">
            <h6 class="card-header" style="font-weight: 600;">
              {{ $t('App.Permisos') }}
            </h6>
            <div class="card-body" style="padding: 0px; ">
              <DataTable :value="modulsTaula" class="p-datatable-sm" :dataKey="codiNumeroFormat"
                style="width: 100%;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
                columnResizeMode="expand" contextMenuPermis v-model:contextMenuSelection="registreSeleccionatPermis"
                @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionatPermis"
                selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
                :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
                <template #empty>
                  <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Empleats.Cap permis')" />
                  </div>
                </template>
                <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
                  <template #body="{ data }">
                    <div style="width: 100%;">
                      <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                        @click="registreSeleccionatPermis = data; contextMenuPermis.show($event)" />
                    </div>
                  </template>
                </Column>
                <Column :header="$t('App.Modul')" :style="{ width: '50%' }" field="nomModul" sortable>
                  <template #body="{ data }">
                    {{ data.nomModul }}
                  </template>
                </Column>
                <Column :header="$t('App.Permis')" :style="{ width: '50%' }" field="permis" sortable>
                  <template #body="{ data }">
                    {{ data.permis }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction:column; width: 50%;">
          <div class="card" style="margin-top: 10px;overflow: hidden;">
            <h6 class="card-header" style="font-weight: 600;">
              {{ $t('App.Parametres') }}
            </h6>
            <div class="card-body" style="padding: 0px; ">
              <DataTable :value="parametresTaula" class="p-datatable-sm" :dataKey="codiNumeroFormat"
              style="width: 100%;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
              columnResizeMode="expand" contextMenuPermis v-model:contextMenuSelection="registreSeleccionatParametre"
              @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionatParametre"
              selectionMode="single" :rowClass="data => data.repetit ? 'estilRow filaRepetida' : 'estilRow'" 
              @row-select="selectedIndex = $event.index" :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
              <template #empty>
                <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
                  <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Empleats.Cap parametre')" />
                </div>
                </template>
                <Column :header="$t('Parametres.Nom parametre')" :style="{ width: '50%' }" field="nomParametre" sortable>
                  <template #body="{ data }">
                    {{ data.nomParametre }}
                  </template>
                </Column>
                <Column :header="$t('App.Valor')" :style="{ width: '50%' }" field="valor" sortable>
                  <template #body="{ data }">
                    {{ data.valor }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed, getCurrentInstance } from 'vue';
import aplicacionsService from '@/services/aplicacions.service';
import empleatsService from '@/services/empleats.service';
import { useI18n } from 'vue-i18n';
import ModalFuncionsDelPermis from './modals/permisos/ModalFuncionsDelPermis.vue';
import ModalFuncionsDelModul from './modals/moduls/ModalFuncionsDelModul.vue';
export default {
  name: 'EmpleatsView',
  components: {
    ModalFuncionsDelPermis,
    ModalFuncionsDelModul,
  },
  setup() {
    const { t } = useI18n();
    const registreSeleccionatPermis = ref();
    const registreSeleccionatParametre = ref();
    const selectedIndex = ref(-1);
    const { appContext } = getCurrentInstance();
    const visibleFuncionsDelPermis = ref(false);
    const visibleFuncionsDelModul = ref(false);
    const contextMenuPermis = ref();
    const empleatsMeta = computed(() => {
      return appContext.config.globalProperties.$empleats.map(empleat => ({
        ...empleat,
        nomComplet: `${empleat.nom} ${empleat.cognoms} (${empleat.id})`
      }));
    });
    const empleat = ref();
    const aplicacions = ref([]);
    const aplicacio = ref(null);
    const permisos = ref({
      moduls: {},
      parametres: {}
    });
    const modulsTaula = computed(() => {
      const result = [];

      Object.entries(permisos.value.moduls).forEach(([nomModul, permisos]) => {
        permisos.forEach(permiso => {
          result.push({
            nomModul,
            permis: permiso
          });
        });
      });

      return result;
    });

    const parametresTaula = computed(() => {
      const result = [];

      Object.entries(permisos.value.parametres).forEach(([nomParametre, permisos]) => {
        permisos.forEach(permiso => {
          if (permiso !== null) {
            result.push({
              nomParametre,
              valor: permiso
            });
          }
        });
      });

      const repeticions = {};

      result.forEach(parametre => {
        repeticions[parametre.nomParametre] = (repeticions[parametre.nomParametre] || 0) + 1;
      });

      return result.map(parametre => ({
        ...parametre,
        repetit: repeticions[parametre.nomParametre] > 1
      }));
    });

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      await carregaAplicacions();
    });

    const carregaAplicacions = async () => {
      const data = await aplicacionsService.obtenirAplicacions();
      aplicacions.value = data;
    }

    const carregaPermisosEmpleat = async () => {
      if (!empleat.value || !aplicacio.value) {
        permisos.value = {
          moduls: {},
          parametres: {}
        };
        return;
      }
      const data = await empleatsService.obtenirPermisosEmpleat(empleat.value, aplicacio.value);
      permisos.value = data;
    }

    const menuModelPermis = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Moduls.funcionsModul')}`, class: 'p-button-text', icon: 'pi pi-bars', command: () => visibleFuncionsDelModul.value = true });
        result.push({ label: () => `${t('Permisos.funcions permis')}`, class: 'p-button-text', icon: 'pi pi-unlock', command: () => visibleFuncionsDelPermis.value = true, visible: () => registreSeleccionatPermis.value.permis !== null });
      return result;
    });

    return {
      visibleFuncionsDelPermis,
      visibleFuncionsDelModul,
      onSort,
      registreSeleccionatPermis,
      registreSeleccionatParametre,
      selectedIndex,
      carregaPermisosEmpleat,
      contextMenuPermis,
      menuModelPermis,
      empleatsMeta,
      empleat,
      aplicacions,
      aplicacio,
      permisos,
      modulsTaula,
      parametresTaula,
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

::v-deep(.filaRepetida) {
    background-color: #ffcccc !important;
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
