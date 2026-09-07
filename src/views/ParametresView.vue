<template>
  <ModalCrearEditarParametre v-if="visibleCrearEditarParametre" :carregat="visibleCrearEditarParametre"  @update:carregat="visibleCrearEditarParametre = $event" :isEdit="isEdit" :llistaAplicacions="aplicacions" :nomAplicacio="nomAplicacio" :nomParametre="nomParametre" @actualitzar="carregaParametres()" />
  <ModalFuncionsDelParametre v-if="visibleFuncionsDelParametre" :carregat="visibleFuncionsDelParametre"  @update:carregat="visibleFuncionsDelParametre = $event" :nomAplicacio="nomAplicacio" :nomParametre="nomParametre" />
  <ModalEmpleatsDelParametre v-if="visibleEmpleatsDelParametre" :carregat="visibleEmpleatsDelParametre"  @update:carregat="visibleEmpleatsDelParametre = $event" :nomAplicacio="nomAplicacio" :nomParametre="nomParametre" />
  <ModalTotsElsEmpleatsDelParametre v-if="visibleTotsElsEmpleatsDelParametre" :carregat="visibleTotsElsEmpleatsDelParametre"  @update:carregat="visibleTotsElsEmpleatsDelParametre = $event" :nomAplicacio="nomAplicacio" :nomParametre="nomParametre" />
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-list" style="font-size: 1.25rem" />
      {{ $t('App.Parametres') }}
      <ButtonShortcut @click="crearEditarParametre(false)" 
          style="margin-left: 15px;" icon="fa-solid fa-plus" 
          :literal="$t('Parametres.nou parametre')"/>
    </h5>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <div id="divTarifes" class="card-body">
      <div class="filtre" ref="formWrapper">
        <div class="element-filtre">
          <label>{{ $t('App.Aplicacions') }}</label>
          <MultiSelect v-model="filtreAplicacions" :options="aplicacions" optionLabel="nomAplicacio" optionValue="nomAplicacio"
            :placeholder="$t('App.seleccionaAplicacio')" class="col-md-3" style="width: 200px;"
            @update:modelValue="carregaParametres()" />
        </div>
      </div>
      <DataTable :value="parametres" class="p-datatable-sm" :dataKey="codiNumeroFormat"
        style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
        columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
        @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
        selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
        :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
        <template #empty>
          <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Parametres.Cap parametre')" />
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
        <Column :header="$t('Parametres.Nom parametre')" :style="{ width: '350px' }" style="max-width: 350px;" field="nomParametre" sortable>
          <template #body="{ data }">
            {{ data.nomParametre }}
          </template>
        </Column>
        <Column :header="$t('Aplicacions.Descripcio')" :style="{ width: '250px' }"  field="descripcio">
          <template #body="{ data }">
            {{ data.descripcio }}
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
import parametresService from '@/services/parametres.service';
import ModalCrearEditarParametre from './modals/parametres/ModalCrearEditarParametre.vue';
import ModalFuncionsDelParametre from './modals/parametres/ModalFuncionsDelParametre.vue';
import ModalEmpleatsDelParametre from './modals/parametres/ModalEmpleatsDelParametre.vue';
import ModalTotsElsEmpleatsDelParametre from './modals/parametres/ModalTotsElsEmpleatsDelParametre.vue';

export default {
  name: 'ParametresView',
  components: {
    ModalCrearEditarParametre,
    ModalFuncionsDelParametre,
    ModalEmpleatsDelParametre,
    ModalTotsElsEmpleatsDelParametre,
  },
  setup() {
    const { t } = useI18n();
    const aplicacions = ref([]);
    const parametres = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const isEdit = ref(false);
    const nomAplicacio = ref(null);
    const nomParametre = ref(null);
    const filtreAplicacions = ref([]);
    const visibleCrearEditarParametre = ref(false);
    const visibleFuncionsDelParametre = ref(false);
    const visibleEmpleatsDelParametre = ref(false);
    const visibleTotsElsEmpleatsDelParametre = ref(false);
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
      await carregaParametres();

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

    const carregaParametres = async () => {
      const urlParams = new URLSearchParams();
      filtreAplicacions.value.forEach((aplicacio) => {
        urlParams.append('nomAplicacions', aplicacio);
      });
      const data = await parametresService.obtenirParametresByAplicacio(urlParams.toString());
      parametres.value = data;
    }

    const crearEditarParametre = async (isEditFlag, nomAplicacioSeleccionada = null, nomParametreSeleccionat = null) => {
      isEdit.value = isEditFlag;
      if (isEdit.value) {
        nomAplicacio.value = nomAplicacioSeleccionada;
        nomParametre.value = nomParametreSeleccionat;
      } else {
        nomAplicacio.value = null;
        nomParametre.value = null;
      }
      visibleCrearEditarParametre.value = true;
    };

    const mostrarFuncionsDelParametre = async (nomAplicacioSeleccionada, nomParametreSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomParametre.value = nomParametreSeleccionat;
      visibleFuncionsDelParametre.value = true;
    };

    const mostrarEmpleatsDelParametre = async (nomAplicacioSeleccionada, nomParametreSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomParametre.value = nomParametreSeleccionat;
      visibleEmpleatsDelParametre.value = true;
    };

    const mostrarTotsElsEmpleatsDelParametre = async (nomAplicacioSeleccionada, nomParametreSeleccionat) => {
      nomAplicacio.value = nomAplicacioSeleccionada;
      nomParametre.value = nomParametreSeleccionat;
      visibleTotsElsEmpleatsDelParametre.value = true;
    };

    const eliminarParametre = async (nomAplicacio, nomParametre) => {
      const resultat = await parametresService.eliminarParametre(nomAplicacio, nomParametre, false);

      if (resultat.requereixConfirmacio) {
        confirm.require({
          header: t('Parametres.Eliminar Parametre'),
          acceptClass: 'p-button-danger',
          message: t('Parametres.Confirmacio eliminar modul amb funcions i empleats'),
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            await parametresService.eliminarParametre(nomAplicacio, nomParametre, true);

            carregaParametres();
          }
        });
      } else {
        carregaParametres();
      }
    };

    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Parametres.funcionsParametre')}`, class: 'p-button-text', icon: 'pi pi-sitemap', command: () => mostrarFuncionsDelParametre(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomParametre) });
        result.push({ label: () => `${t('Parametres.empleat modul')}`, class: 'p-button-text', icon: 'pi pi-user', command: () => mostrarEmpleatsDelParametre(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomParametre) });
        result.push({ label: () => `${t('Parametres.tots parametre')}`, class: 'p-button-text', icon: 'pi pi-users', command: () => mostrarTotsElsEmpleatsDelParametre(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomParametre) });
        result.push({ separator: true });
        result.push({ label: () => `${t('Parametres.editarParametre')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => crearEditarParametre(true, registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomParametre) });
        result.push({ label: () => `${t('Parametres.Eliminar Parametre')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => eliminarParametre(registreSeleccionat.value.nomAplicacio, registreSeleccionat.value.nomParametre) });
      return result;
    });

    return {
      onSort,
      aplicacions,
      parametres,
      registreSeleccionat,
      selectedIndex,
      contextMenu,
      menuModel,
      crearEditarParametre,
      eliminarParametre,
      carregaAplicacions,
      carregaParametres,
      visibleCrearEditarParametre,
      visibleFuncionsDelParametre,
      visibleEmpleatsDelParametre,
      visibleTotsElsEmpleatsDelParametre,
      isEdit,
      nomAplicacio,
      nomParametre,
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
