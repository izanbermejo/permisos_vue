<template>
  <InfoArticleClientByClient v-if="visibleInfoArticleClientByClient" :carregat="visibleInfoArticleClientByClient"
    @update:carregat="visibleInfoArticleClientByClient = $event;" :articleClient="props.articleClient.articleClient" />
  <DetallOrdresFabricacio v-if="visibleDialogDetallOF" :carregat="visibleDialogDetallOF"
    @update:carregat="visibleDialogDetallOF = $event;" :numOF="registreSeleccionat.numero" :articleClient="props.articleClient.articleClient" :fabrica="props.articleClient.fabrica" :recarrega="carregaCapçaleres"/>
  <div class="card">
    <div class="card-body">
      <div v-if="infoCapsalera">
        <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;"
          @focus="contextMenu.onArrowDownKey($event)" />
        <DataTable :value="infoCapsalera" class="p-datatable-sm" 
          style="margin-top: 10px" :showGridlines="true"
          :rowClass="estilRow" selectionMode="single"
          scrollable scrollHeight="70vh"
          @row-select="selectedIndex = $event.index"
          contextMenu v-model:contextMenuSelection="registreSeleccionat"
          @rowContextmenu="showContextMenu($event)"
          @dblclick="window?.getSelection()?.removeAllRanges(); handlerEnter()"
          v-model:selection="registreSeleccionat"
          v-model:expandedRows="expandedRows" :dataKey="codiNumeroFormat">
           <template #empty>
                <div style="width:100%; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('OF.Cap of')" />
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
          <Column field="numero" :header="$t('OF.Numero OF')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.numero ? data.numero : 0) }}
              </div>
            </template>
          </Column>
          <Column field="dataEmissio" :header="$t('OF.Data Prevista')">
            <template #body="{ data }">
              {{ $d($toDate(data?.dataEmissio), 'short') }}
            </template>
          </Column>
          <Column field="fabrica" :header="$t('OF.Fabrica')" style="max-width: 90px;">
            <template #body="{ data }">
              <div style="display:flex; align-items:center; gap:6px;">
                <span>{{ data?.fabrica ?? '-' }}</span>
              </div>
            </template>
          </Column>
          <Column field="quantitatTotal" :header="$t('OF.Quantitat')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.quantitatTotal ? data.quantitatTotal : 0) }}
              </div>
            </template>
          </Column>
          <!-- <Column field="quantitatPendent" :header="$t('OF.Anulada')">
            <template #body="{ data }">
              <span v-if="data.isPendent">{{ $t('App.Si') }}</span>
              <span v-else>{{ $t('App.No') }}</span>
            </template>
          </Column> -->
          <Column field="quantitatRebuda" :header="$t('OF.Quantitat rebuda')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.quantitatRebudaTerminis ? data.quantitatRebudaTerminis : 0) }}
              </div>
            </template>
          </Column>
          <Column field="quantitatPendent" :header="$t('OF.Quantitat pendent')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.quantitatPendent ? data.quantitatPendent : 0) }}
              </div>
            </template>
          </Column>
          <Column field="exces" :header="$t('OF.Exces')" style="max-width: 90px;">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.exces ? data.exces : 0) }}
              </div>
            </template>
          </Column>
          <Column field="ofAnterior" :header="$t('OF.Anterior')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.ofAnterior ? data.ofAnterior : 0) }}
              </div>
            </template>
          </Column>
          <Column :header="$t('OF.Canvi fabrica')" style="max-width: 105px; display: flex; justify-content: center; align-items: center;">
            <template #body="{ data }">
              <span v-if="!!data.canviFabrica" v-tooltip="$t('OF.Canvi fabrica tooltip')">
                <font-awesome-icon icon="fa-solid fa-industry" style="font-size: 1.10rem;"/>
              </span>
            </template>
          </Column>
          <Column :header="$t('OF.Increment')" style="max-width: 105px; display: flex; justify-content: center; align-items: center;">
            <template #body="{ data }">
              <span v-if="!!data.increment" v-tooltip="$t('OF.Increment tooltip', [data.diesCalculIncrement])">
                <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.10rem; color: orange;"/>
              </span>
            </template>
          </Column>
          <Column :header="$t('OF.Data anulacio')" style="max-width: 105px; display: flex; justify-content: center; align-items: center;">
            <template #body="{ data }">
              <span v-if="data.isAnulada">
                {{ $d(data.dataAnulacio) }}
              </span>
            </template>
          </Column>
          <Column field="ofPosterior" :header="$t('OF.Posterior')">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data?.ofPosterior ? data.ofPosterior : 0) }}
              </div>
            </template>
          </Column>
        </DataTable>
        <div v-if="infoCapsalera?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
          <span style="white-space: nowrap;">{{ $t('App.Resultats', [infoCapsalera.length]) }}</span>
          <transition name="slide-fade">
              <span v-if="infoCapsalera?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                  <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                  {{ $t('App.Nomes es mostren els primers resultats', [infoCapsalera.length]) }}
              </span>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { carrega, isLoading} from '@/services/loader';
import ofService from '@/services/of.service';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DetallOrdresFabricacio from './DetallOrdreFabricacio.vue';
import InfoArticleClientByClient from '@/views/modals/InfoArticleClientByClient.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'CapçaleraOrdresFabricacio',
  props: {
    articleClient: Object,
    modalAjudaisOpen: Boolean
  },
  components: {
    DetallOrdresFabricacio,
    InfoArticleClientByClient
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const visibleAjudaStocks = ref(false);
    const visibleInfoArticleClientByClient = ref(false);
    const visibleDialogDetallOF = ref(false);
    const infoCapsalera = ref(null);
    const contextMenu = ref();
    const registreSeleccionat = ref([]);
    const selectedIndex = ref(-1);
    const confirmVisible = ref(false);
    const toast = useToast();
    const confirm = useConfirm();
    
    onMounted(async () => {
      await carregaCapçaleres();
      document.addEventListener("keydown", keyHandler);
    });

    onUnmounted(() => {
        document.removeEventListener("keydown", keyHandler);
      })

    const keyHandler = (ev) => {
      if (isContextMenuKey(ev)){
        return;
      } 
        // Si no hi ha cap modal obert
      if (modalVisible.value) {
        return;        
      } 

      // No processem l'event en cas que s'estigui mostrant la càrrega
      if (isLoading.value) {
        ev.preventDefault();
        return;
      }

    if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
      }
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (selectedIndex.value < infoCapsalera.value.length - 1) {
        selectedIndex.value++;
      }
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      handlerEnter();
    }
  };

    const handlerEnter = () => {
      if (selectedIndex.value >= 0) {
        emit('veureDetallOF', registreSeleccionat.value);
        visibleDialogDetallOF.value = true;
      }
    }

    watch(() => props.articleClient, async () => {
      selectedIndex.value = -1;
      await carregaCapçaleres();
      nextTick(() => {
        selectedIndex.value = 0;
      });
    }, { immediate: false });

    const showContextMenu = (ev) => {
        let selectedOld = selectedIndex.value;
        selectedIndex.value = infoCapsalera.value.findIndex(l => l.numero == registreSeleccionat.value.numero);
        if (selectedOld === selectedIndex.value) {
          registreSeleccionat.value = infoCapsalera.value[selectedIndex.value];
        }
        contextMenu.value.show(ev.originalEvent);
      }



    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        registreSeleccionat.value = infoCapsalera.value[selectedIndex.value];
      } else if(modalVisible.value === false){
        selectedIndex.value = infoCapsalera.value.findIndex(l => l.numero == registreSeleccionat.value.numero);
      }
    });

    const menuModel = computed(() => {
      let result = [];
      if (registreSeleccionat.value) {
        result.push({
          label: `${t('OF.Veure detall OF')}`,
          icon: 'pi pi-eye',
          command: () => {
            handlerEnter();
          }
        });
        // Anular OF només si no té OF posterior i és de tipus NORMALITZAT i es tenen permisos
        if (registreSeleccionat.value 
        && registreSeleccionat.value.ofPosterior == null 
        && props.articleClient.tipus === "NORMALITZAT"
        && permisosStore.tePermis('OFS', 'ANULAR')
        ) {
          result.push({ separator: true });
          result.push({
              label: `${t('OF.Anular OF')}`,
              icon: 'pi pi-times-circle',
              command: () => anularOF()
          });
        }

      } 
      return result;
    });

    const modalVisible = computed(() => {
      return confirmVisible.value 
      || visibleAjudaStocks.value 
      || visibleInfoArticleClientByClient.value
      || visibleDialogDetallOF.value
      || props.modalAjudaisOpen;
    });

    const labelEmpresa = (num) => {
      var numAdd = infoCapsalera.value.codiEmpresa !== infoCapsalera.value.codiEmpresaEntrega ? num : '';
      return t('Comandes.Emp fact') + ' ' + numAdd;
    }

    const labelMagatzem = (num) => {
      var numAdd = infoCapsalera.value.magatzemEntrada !== infoCapsalera.value.magatzemSortida ? num : '';
      return t('Comandes.Magatzem') + ' ' + numAdd;
    }

    const carregaCapçaleres = async () => {
      infoCapsalera.value = await carrega(ofService.obtenirInfoCapsalera(props.articleClient.artInt, props.articleClient.cliCod, props.articleClient.articleClient));
      nextTick(() => {
        selectedIndex.value = 0;
      });
    };

    const anularOF = () => {
      const of = registreSeleccionat.value;
      confirm.require({
          header: t("App.Confirmacio"),
          message: t("OF.Confirm Anula OF"),
          icon: "pi pi-exclamation-triangle",
          accept: async () => {
              await carrega(ofService.anularOF(of.numero))
                  .then(() => {
                      toast.add({
                          severity: "success",
                          summary: t("OF.AnuladaCorrectament"),
                          life: 4000
                      });
                  });
          }
      });
    };

    const estilRow = (data) => {
      return [{ estilRow: true,  anulada: data.isAnulada }];
    };
    
    return {
      props,
      visibleAjudaStocks,
      visibleInfoArticleClientByClient,
      labelEmpresa,
      labelMagatzem,
      infoCapsalera,
      modalVisible,
      carregaCapçaleres,
      visibleDialogDetallOF,
      menuModel,
      showContextMenu,
      contextMenu,
      registreSeleccionat,
      selectedIndex,
      confirmVisible,
      handlerEnter,
      estilRow,
    };
  },
};
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

::v-deep(.estilRow .buttoicondisabled) {
  background-color: rgb(102, 102, 102);
  border-color: rgb(102, 102, 102);
}

.botoveurestock {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: 3px;
}

.buttonnotes {
  font-size: 0.875rem;
  height: 24px !important;
  width: 100%;
  text-align: left !important;
}

.buttonnotesdisabled {
  background-color: rgb(102, 102, 102);
  border-color: rgb(102, 102, 102);
}

::v-deep(.p-highlight) {
  background-color: #b6ddfa !important;
}

::v-deep(.liniaservida) {
  background-color: #ebf7f7 !important;
}

::v-deep(.p-highlight.liniaservida) {
  background-color: #c0e2e4 !important;
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

.label-sub {
  cursor: pointer;
  text-decoration: underline;
}

.icona-boto {
  margin-right: 15px;
  display: inline-block;
  border-radius: 5px;
  box-shadow: 0 0 2px #888;
  padding: 0.5em 0.6em;
  font-size: 0.8rem;
  cursor: pointer;
}

.avisNoDataAvui {
  border: 1px solid #ffb515;
  background-color: #f5c55e;
  padding: 4px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 5px;
}

.enllas {
  cursor: pointer;
}

.data-sis-mesos {
  background-color: #E1B3F0;
  border: 2px solid #9C79F7;
  border-radius: 8px;
}

.stock-satelit {
  background-color: #E1B3F0;
  border: 2px solid #9C79F7;
  border-radius: 8px;
  padding: 0px 2px;
}

.columnatitol {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
}

.labeltitol {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.texttitol {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1;
  display: inline-block;
}

.infoClient {
  border-radius: 8px;
  background-color: #9ef394;
  padding: 2px 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.web {
  background-color: #9ef394;
}

.missatgeLimit {
  background-color: rgb(201, 227, 189);
  border: 1px solid rgb(52, 136, 68);
  border-radius: 10px;
  padding: 2px;
  display: inline-block;
  margin-left: 20px;
  width: 100%;
}

::v-deep(.anulada) {
  background-color:#ffc2c2 !important;
}

::v-deep(.p-highlight.anulada) {
  background-color: #ff9393 !important;
}
</style>