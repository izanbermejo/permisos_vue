<template>
  <ModalAdjuntsTarifes v-if="visibleModalAdjuntsTarifes" :carregat="visibleModalAdjuntsTarifes" :titol="$t('Tarifes.modalAltaTarifa.titol')" 
  @update:recarregaTaula="carregaTarifes()"/>
  <div class="card" style="margin: 15px;">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-tags" style="font-size: 1.25rem" />
      {{ $t('App.Tarifes') }}
      <ButtonShortcut @click="showModalAdjuntsTarifes()" 
          style="margin-left: 15px;" icon="fa-solid fa-filter" 
          :literal="$t('Tarifes.novatarifa')"
          />
    </h5>
  </div>
  <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
  <div id="divTarifes" style="margin: 15px;">
    <DataTable v-model:expandedRows="expandedRows" :value="tarifes" class="p-datatable-sm" :dataKey="codiNumeroFormat"
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
      <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
        <template #body="{ data }">
          <div style="width: 100%;">
            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
              @click="registreSeleccionat = data; contextMenu.show($event)" />
          </div>
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.nom')" :style="{ width: '450px' }" style="max-width: 450px;" field="nom" sortable>
        <template #body="{ data }">
          {{ data.nom }}
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.descripcio')" :style="{ width: '250px' }" style="max-width: 250px;" field="descripcio" sortable>
        <template #body="{ data }">
          {{ data.descripcio}}
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.tipus client')" :style="{ width: '250px' }" style="max-width: 250px;" field="tipusClient" sortable>
        <template #body="{ data }">
          {{ data.tipusClient}}
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.divisa')" :style="{ width: '130px' }" style="max-width: 130px;" field="divisa" sortable>
        <template #body="{ data }">
          {{ data.divisa }}
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.data_creacio')" :style="{ width: '130px' }" style="max-width: 130px;" field="insertedAt" sortable>
        <template #body="{ data }">
          {{ $d(data.insertedAt, 'long') }}
        </template>
      </Column>
      <Column :header="$t('Tarifes.taula_tarifes.usuari')" :style="{ width: '250px' }" style="max-width: 250px;" field="insertedBy" sortable>
        <template #body="{ data }">
          {{ data.insertedBy}}
        </template>
      </Column>
      <!-- <Column :header="$t('Tarifes.taula_tarifes.estat')" :style="{ width: '130px' }" style="max-width: 130px;">
        <template #body="{ data }">
          {{ data.status }}
        </template>
      </Column> -->
    </DataTable>
  </div>
</template>

<script>
import TarifesService from '@/services/tarifes.service';
import ModalAdjuntsTarifes from '@/views/modals/ModalAdjuntsTarifes.vue'
import { carrega } from '@/services/loader';
import { onMounted, ref, watch, reactive,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { scrollCenter } from '@/utils/datetableUtils.js';
import { saveAs } from 'file-saver';
import tarifesService from '@/services/tarifes.service';

export default {
  name: 'ComandesView',
  components: {
    ModalAdjuntsTarifes
  },
  setup() {
    const { t } = useI18n();
    const titolResultats = ref('');
    const visibleModalAdjuntsTarifes = ref(false); // TODO Posar a true
    const elementLiniesComanda = () => document.getElementById('divLiniesComanda');
    const elementTarifes = () => document.getElementById('divTarifes');
    const linies = ref();
    const tarifes = ref([]);
    const divises = [
      { label: '1', value: 'EUR' },
      { label: '1', value: '2' },
      { label: 'MXN', value: 'MXN' },
      { label: 'CNY', value: 'CNY' }
    ];
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const liniesExpand = ref({});
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
      
      const data = await tarifesService.llistatTarifes("", "", "", "");
      tarifes.value = data;
      visibleModalAdjuntsTarifes.value = false;
    }

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        registreSeleccionat.value = linies.value[selectedIndex.value];
        scrollCenter(elementLiniesComanda(), elementTarifes(), selectedIndex);
      }
    });

    const showModalAdjuntsTarifes= () => {
      console.log("showModalAdjunts>>");

      //  codiclientpre=codiclient;

      visibleModalAdjuntsTarifes.value = true;
      console.log("showModalAdjunts<<");
    }

    const showContextMenu = (ev) => {
      let selectedOld = selectedIndex.value;
      selectedIndex.value = linies.value.findIndex(l => l.codiNumeroFormat == registreSeleccionat.value.codiNumeroFormat);
      if (selectedOld === selectedIndex.value) {
        registreSeleccionat.value = linies.value[selectedIndex.value];
      }
      contextMenu.value.show(ev.originalEvent);
    }

    const showNode = async (e) => {
      var index = expandedRows.value.indexOf(e);
      if (index !== -1) {
        expandedRows.value.splice(index, 1);
      } else {
        let clau = `${e.codi}_${e.numero}`;
        liniesExpand.value[clau] = await carrega(TarifesService.queryTarifes());
        expandedRows.value.push(e);
      }
      registreSeleccionat.value = e;
    }

    const expandAll = async () => {
      for (let i in linies.value) {
        let linia = linies.value[i];
        if (linia.quantitatPendent == 0 && linia.quantitat > 0) {
          var index = expandedRows.value.indexOf(linia);
          if (index == -1) {
            let clau = `${linia.codi}_${linia.numero}`;
            liniesExpand.value[clau] = await carrega(TarifesService.queryTarifes());
            expandedRows.value.push(linia);
          }
        }
      }
    }

    // const refresh = async () => {
    //   let data = await carrega(TarifesService.llistatTarifes("", "", "", ""));
    //   tarifes.value = data;
    // }

    // const clickEditarTarifa = async () => {
    // }

    const clickDescarregaTarifa = async () => {
      // Comprovació si s'han afegit línies
      let resp = await (carrega(TarifesService.descarregaTarifa(registreSeleccionat.value.codi)));
      saveAs(new Blob([resp]), registreSeleccionat.value.nom + ".xls");
    }

    // const clickTancaTarifa = async (codi, nom) => {
    //   // Confirmació eliminació
    //   console.log("clickBorraTarifa//nom: " + nom)
    //   confirm.require({
    //     header: t('App.Confirmacio'),
    //     acceptClass: 'p-button-danger',
    //     message: t('Tarifes.ConfirmaTancar', [nom]),
    //     icon: 'pi pi-exclamation-triangle',
    //     accept: () => {
    //       carrega(TarifesService.tancarTarifa(codi)).then(() => {
    //         toast.add({ severity: 'success', summary: t('Tarifes.feedback.tarifaTancadaOk'), life: 3000 });
    //         refresh();
    //       })
    //     },
    //     reject: () => {
    //     }
    //   });
    // }

    const contingutRetallat = (valor) => {
      if (!valor)
        return;
      return valor.substring(0, 10) + "...";
    }

    // const menuModel = ref([
    //   // { label: () => `${t('Tarifes.menuregistre.editar')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => clickEditarTarifa() },
    //   { label: () => `${t('Tarifes.menuregistre.descarregar')}`, class: 'p-button-text', icon: 'pi pi-download', command: () => clickDescarregaTarifa(registreSeleccionat.value.codi) },
    //   // { label: () => `${t('Tarifes.menuregistre.tancar')}`, class: 'p-button-text', icon: 'pi pi-lock', command: () => clickTancaTarifa(registreSeleccionat.value.codi, registreSeleccionat.value.nom) },
    //   { label: () => `${t('Tarifes.menuregistre.esborrar')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => clickBorraTarifa(registreSeleccionat.value.codi, registreSeleccionat.value.nom)},
    // ]);

    
    const menuModel = computed(() => {
        let result = [];
        result.push({ label: () => `${t('Tarifes.menuregistre.descarregar')}`, class: 'p-button-text', icon: 'pi pi-download', command: () => clickDescarregaTarifa(registreSeleccionat.value.codi) });
        // if (usuari()==='4351' || usuari()==='631' || usuari()==='505')
      return result;
    });


    //    const modalVisible = () => {
    //      return visibleAjudaBuscadorComandes.value;
    //    }

    return {
      showModalAdjuntsTarifes,
      onSort,
      titolResultats,
      tarifes,
      divises,
      registreSeleccionat,
      selectedIndex,
      expandedRows,
      showNode,
      expandAll,
      contextMenu,
      showContextMenu,
      menuModel,
      // refresh,
      contingutRetallat,
      state,
      tarifa,
      visibleModalAdjuntsTarifes,
      carregaTarifes,
      // visibleAjudaBuscadorComandes,
      ModalAdjuntsTarifes
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
