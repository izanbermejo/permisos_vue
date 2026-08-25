<template>
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-tags" style="font-size: 1.25rem" />
      {{ $t('App.Permisos') }}
      <!-- <ButtonShortcut @click="showModalAdjuntsTarifes()" 
          style="margin-left: 15px;" icon="fa-solid fa-filter" 
          :literal="$t('Tarifes.novatarifa')"
          /> -->
    </h5>
  </div>
  <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
  <div id="divTarifes" style="margin: 15px;">
    <DataTable v-model:expandedRows="expandedRows" :value="permisosFuncio" class="p-datatable-sm" :dataKey="codiNumeroFormat"
      style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
      columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
      @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
      selectionMode="single" :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index"
      :sortField="sortField" :sortOrder="sortOrder" @sort="onSort">
      <template #empty>
        <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
          <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Tarifes.Cap Tarifa')" />
        </div>
      </template>
      <!-- <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
        <template #body="{ data }">
          <div style="width: 100%;">
            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
              @click="registreSeleccionat = data; contextMenu.show($event)" />
          </div>
        </template>
      </Column> -->
      <Column header="Nom aplicacio" :style="{ width: '450px' }" style="max-width: 450px;" field="nomAplicacio" sortable>
        <template #body="{ data }">
          {{ data.nomAplicacio }}
        </template>
      </Column>
      <Column header="nom modul" :style="{ width: '250px' }" style="max-width: 250px;" field="nomModul" sortable>
        <template #body="{ data }">
          {{ data.nomModul}}
        </template>
      </Column>
      <Column header="nom permis" :style="{ width: '250px' }" style="max-width: 250px;" field="nomPermis" sortable>
        <template #body="{ data }">
          {{ data.nomPermis}}
        </template>
      </Column>
      <Column header="id centre" :style="{ width: '130px' }" style="max-width: 130px;" field="idCentre" sortable>
        <template #body="{ data }">
          <span v-if="data.idCentre">{{ data.idCentre }}</span>
          <span v-else>---</span>
        </template>
      </Column>
      <Column header="id departament" :style="{ width: '130px' }" style="max-width: 130px;" field="idDepartament" sortable>
        <template #body="{ data }">
          <span v-if="data.idDepartament">{{ data.idDepartament }}</span>
          <span v-else>---</span>
        </template>
      </Column>
      <Column header="id funcio" :style="{ width: '250px' }" style="max-width: 250px;" field="idFuncio" sortable>
        <template #body="{ data }">
          <span v-if="data.idFuncio">{{ data.idFuncio}}</span>
          <span v-else>---</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { onMounted, ref, watch, reactive } from 'vue';
import { scrollCenter } from '@/utils/datetableUtils.js';
import tarifesService from '@/services/tarifes.service';

export default {
  name: 'ComandesView',
  components: {
  },
  setup() {
    const titolResultats = ref('');
    const elementLiniesComanda = () => document.getElementById('divLiniesComanda');
    const elementTarifes = () => document.getElementById('divTarifes');
    const linies = ref();
    const permisosFuncio = ref([]);
    const divises = [
      { label: '1', value: 'EUR' },
      { label: '1', value: '2' },
      { label: 'MXN', value: 'MXN' },
      { label: 'CNY', value: 'CNY' }
    ];
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const expandedRows = ref(new Array());
    //const informacioComandaArtcli = ref();
    const tarifa = ref();
    const state = reactive({
      dataInici: new Date(),
      articleclient: '',
      mostrarEliminades: false,
    });

    const sortField = ref(null);
    const sortOrder = ref(null);

    const onSort = (event) => {
      sortField.value = event.sortField;
      sortOrder.value = event.sortOrder;
    };

    onMounted(async () => {
      carregaTarifes();
    });

    const carregaTarifes = async () => {
      console.log("carregaTarifes");
      const data = await tarifesService.obtenirPermisosFuncio();
      console.log("permisosFuncio", data);
      // const data = await tarifesService.llistatTarifes("", "", "", "");
      permisosFuncio.value = data;
    }

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        registreSeleccionat.value = linies.value[selectedIndex.value];
        scrollCenter(elementLiniesComanda(), elementTarifes(), selectedIndex);
      }
    });


    
    // const menuModel = computed(() => {
    //     let result = [];
    //     result.push({ label: () => `${t('Tarifes.menuregistre.descarregar')}`, class: 'p-button-text', icon: 'pi pi-download', command: () => clickDescarregaTarifa(registreSeleccionat.value.codi) });
    //     // if (usuari()==='4351' || usuari()==='631' || usuari()==='505')
    //   return result;
    // });


    return {
      // showModalAdjuntsTarifes,
      onSort,
      titolResultats,
      permisosFuncio,
      divises,
      registreSeleccionat,
      selectedIndex,
      expandedRows,
      contextMenu,
      // showContextMenu,
      // menuModel,
      state,
      tarifa,
      carregaTarifes,
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
