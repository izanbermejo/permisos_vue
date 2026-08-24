<template>
  <AjudaTarifesArticle v-if="visibleTarifesArticle" :carregat="visibleTarifesArticle"  @update:carregat="visibleTarifesArticle = $event"
      :referencia="liniaSeleccionada.referencia" :matriu="liniaSeleccionada.matriu" :clicod="clientRef.clicod" :artint="liniaSeleccionada.articleClient.artint" />
  <AjudaStocks v-if="visibleStocks" :carregat="visibleStocks"  @update:carregat="visibleStocks = $event"
      :artint="liniaSeleccionada.articleClient.artint" :clicod="liniaSeleccionada.articleClient.clicod" />
  <AjudaReserves v-if="visibleReserves" :carregat="visibleReserves"  @update:carregat="visibleReserves = $event"
      :artint="liniaSeleccionada.articleClient.artint" :empresa="clientRef?.empresa"/>
  <AjudaArticlesNormalitzats :visible="visibleAjudaArticles" @update:carregat="visibleAjudaArticles = false" 
    :seleccioCallback="callbackArticleSeleccionat" :client="clientRef"
    :empresa="clientRef?.empresa" :codiClient="clientRef?.clicod" 
    :calculTarifa="true"/>
  <AjudaIdiomaExport v-if="visibleIdiomaExport" :carregat="visibleIdiomaExport" @update:carregat="visibleIdiomaExport = $event"
    :linies="linies" :client="clientRef" />
  <AjudaIdiomaCopiaTaula v-if="visibleIdiomaCopiaTaula" :carregat="visibleIdiomaCopiaTaula" @update:carregat="visibleIdiomaCopiaTaula = $event" :linies="linies" :client="clientRef"/>
  <CrearEditarLiniaTarifaPeces v-if="visibleCrearEditarLiniaTarifa" :carregat="visibleCrearEditarLiniaTarifa"
    :artint="liniaSeleccionada.articleClient.artint" :clicod="liniaSeleccionada.articleClient.clicod"
    :stockLocal="liniaSeleccionada.stockLocal" :reservaLocal="liniaSeleccionada.reservaLocal"
    :permetNoMultiplesBossa="isMonterrey"
    :client="clientRef"
    :callbackOk="callbackLinia"
    @update:carregat="visibleCrearEditarLiniaTarifa = $event;" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="' '" style="width: 1500px" class="calculadora-dialog">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <font-awesome-icon icon="fa-solid fa-calculator" />
        <span style="margin-left: 10px;"> {{ $t('Comandes.Calculadora')}}</span>
      </div>
    </template>
    <div style="height: 75vh;">
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
          {{ $t('Comandes.Client')}}
          <span v-if="clientRef">
            {{ `: ${clientRef.clicod} - ${clientRef.nom}`}}
          </span>
        </h6>
        <div class="card-body">
          <DetallClient :client="clientRef" :tarifes="tarifesRef" />
        </div>
      </div>
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600; display: flex; align-items: center; white-space: nowrap;">
          {{ $t('Comandes.Linies preus')}}
          <div style="display: flex; width: 100%; justify-content: space-between;">
            <div>
              <ButtonShortcut :literal="$t('Comandes.Afegeix article')" @mousedown="visibleAjudaArticles = true"
              icon="fa-solid fa-cart-plus" :shortcut="'[+]'" style="margin-left: 50px;"/>
            </div>
            <div>
              <ButtonShortcut icon="fa-solid fa-copy" :literal="$t('Comandes.Copiar taula')" @click="escollirIdiomaCopia(linies)" style="margin-left: 30px;"/>
              <ButtonShortcut icon="fa-solid fa-file-excel" :literal="$t('Comandes.Descarregar taula')" @click="exportarTaula(linies)" style="margin-left: 30px;"/>
            </div>
          </div>
        </h6>
        <div class="card-body" style="padding: 5px;">
          <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;"
            @focus="contextMenu.onArrowDownKey($event)"/>
          <div id="calculadoraNormalitzats">
            <DataTable :value="linies" class="p-datatable-sm" showGridlines
              dataKey="linia"
              v-model:selection="liniaSeleccionada" selectionMode="single"
              :rowClass="() => 'estilRow'"
              contextMenu v-model:contextMenuSelection="liniaSeleccionada" @rowContextmenu="showContextMenu($event)"
              @row-dblclick="visibleCrearEditarLiniaTarifa = true"
              @row-select="selectedIndex = $event.index;"
              :scrollable="true" scrollDirection="both" scrollHeight="34vh" >
              <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                <template #body="{data}">
                  <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaSeleccionada = data; contextMenu.show($event)" />
                  </div>
                </template>
              </Column>
              <Column :header="$t('Comandes.Matriu')" :style="{width:'100px'}" style="max-width: 100px; text-align: left;">
                <template #body="{data}">
                  <div style="width: 100%;">
                    {{ data.matriu }}
                  </div>
                </template>
              </Column>
              <Column field="referencia" :header="$t('Comandes.Referencia')" :style="{width:'100px'}">
                <template #body="{data}">
                  <div style="width: 100%;">
                    {{ data.referencia }}
                    <i class="pi pi-copy" 
                      @click="copyText(data.referencia)"
                      style="margin-left: 5px;">
                    </i>
                  </div>
                </template>
              </Column>
              <Column :header="$t('Comandes.Tipus')" :style="{width:'50px'}" style="max-width: 50px; text-align: center;">
                <template #body="{data}">
                  <ColumnaTipusArticleClient :tipus="data.tipusArticleClient" />
                </template>
              </Column>
              <Column :style="{width:'85px'}" style="text-align: right; max-width: 85px;" :header="$t('Comandes.Qtat')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ $n(data.quantitat) }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'145px'}" style="text-align: right; max-width: 165px;" :header="$t('Comandes.Preu pesa brut')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }}
                    <i class="pi pi-copy" 
                      @click="copyText(`${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}`)"
                      style="margin-left: 5px;">
                    </i> 
                  </div>
                </template>
              </Column>
              <Column :style="{width:'145px'}" style="text-align: right; max-width: 165px;" :header="$t('Comandes.Preu pesa net')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right; font-weight: bold;">
                    {{ `${$n(data.preuNet, 'decimalLong')} ${data.preu.divisa}` }}
                    <i class="pi pi-copy" 
                      @click="copyText(`${$n(data.preuNet, 'decimalLong')} ${data.preu.divisa}`)"
                      style="margin-left: 5px;">
                    </i> 
                  </div>
                </template>
              </Column>
              <Column :style="{width:'140px'}" style="text-align: right; max-width: 140px;" :header="$t('Comandes.Reservable')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: center;">  
                    <ColumnaReserva :reservable="data.reservable" :quantitatReservable="data.quantitatReservable"
                      :stockDisponible="data.stockDisponible"/>
                  </div>
                </template>
              </Column>
              <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Stock disponible')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ $n(data.stockDisponible) }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'90px'}" style="text-align: right; max-width: 90px;" :header="$t('Comandes.Descompte')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ `${$n(data.descompte)}%` }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Import net')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;" v-tooltip="$n(data.importBrut, 'decimalLong')">
                    {{ $n(data.importNet, 'decimalLong') }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="`${$t('Comandes.Pes')} (Kg.)`">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;" v-tooltip="`${$n(data.pes)} g.`">
                    {{ $n(data.pesKg) }}
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
            {{ $t('Comandes.Resum comanda') }}
        </h6>
        <div class="card-body">
          <DetallResumCalculadoraTarifes :linies="linies" :importNetTotal="importNetTotal" :importBrutTotal="importBrutTotal" :pesTotal="pesTotal" :costTransportTotal="costTransportTotal" :costTransportTotalAfegit="costTransportTotalAfegit"/>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, toRef, onMounted, onUnmounted, computed, watch, nextTick, reactive, provide } from "vue";
import AjudaArticlesNormalitzats from '@/views/modals/ajudanormalitzats/AjudaArticlesNormalitzats.vue';
import { controlDataTable } from '@/utils/datetableUtils.js';
import comandesService from "@/services/comandes.service";
import { carrega } from '@/services/loader';
import DetallClient from './DetallClient.vue';
import DetallResumCalculadoraTarifes from './DetallResumCalculadoraTarifes.vue';
import ColumnaReserva from './ColumnaReserva.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ColumnaTipusArticleClient from '@/components/ColumnaTipusArticleClient.vue'
import { useI18n } from 'vue-i18n';
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import AjudaStocks from "../AjudaStocks.vue";
import AjudaReserves from "../reserves/AjudaReserves.vue";
import AjudaTarifesArticle from "../AjudaTarifesArticle.vue";
import { useToast } from "primevue/usetoast";
import {copyText} from 'vue3-clipboard'; 
import AjudaIdiomaExport from "./AjudaIdiomaExport.vue";
import AjudaIdiomaCopiaTaula from "./AjudaIdiomaCopiaTaula.vue";
import CrearEditarLiniaTarifaPeces from '../CrearEditarLiniaTarifaPeces.vue';

export default {
  name: "CalculadoraTarifesPeces",
  components: {
    AjudaArticlesNormalitzats,
    DetallClient,
    DetallResumCalculadoraTarifes,
    ColumnaReserva,
    ColumnaTipusArticleClient,
    AjudaStocks,
    AjudaReserves,
    AjudaTarifesArticle,
    AjudaIdiomaExport,
    AjudaIdiomaCopiaTaula,
    CrearEditarLiniaTarifaPeces,
  },
  props: {
    client : Object,
    tarifes : Object,
  },
  setup(props, { emit }) {
    const { t, n } = useI18n();
    const visible = ref(true);
    const confirmVisible = ref(false);
    const visibleAjudaArticles = ref(false);
    const visibleEditarLiniaTarifa = ref(false);
    const visibleReserves = ref(false);
    const visibleStocks = ref(false);
    const visibleIdiomaExport = ref(false);
    const visibleIdiomaCopiaTaula = ref(false);
    const visibleTarifesArticle = ref(false);
    const visibleCrearEditarLiniaTarifa = ref(false);
    const contextMenu = ref();
    const clientRef = toRef(props, 'client');
    const tarifesRef = toRef(props, 'tarifes');
    const linies = ref([]);
    const liniaSeleccionada = ref();
    const selectedIndex = ref(-1);
    const dadesCalcul = ref({});
    const reqEdicio = ref();
    const fileInput = ref();
    const toast = useToast();
    // Es fa un provide de l'última data introduïda per poder accedir amb un inject
    // als components fills que ho puguin necessitar com la creació de una nova línia
    const ultimaDataIntroduida = ref();
    provide('ultimaDataIntroduida', ultimaDataIntroduida);
    const ultimaDataSortidaIntroduida = ref();
    provide('ultimaDataSortidaIntroduida', ultimaDataSortidaIntroduida);
    const columnes = ref();
    const importNetTotal = ref();
    const importBrutTotal = ref();
    const pesTotal = ref();
    const costTransportTotal = ref();
    const costTransportTotalAfegit = ref();
    const incrementPesTransport = ref(1.15); // S'afegeix un 15% al pes total per al càlcul del cost de transport, ja que el transportista pot cobrar més encara que el pes sigui menor

    const state = reactive({
      comanda: '',
      dataRecepcio: new Date(),
    });
    const validDate = (value) => {
      return (value instanceof Date);
    }
    const rules = {
      comanda: {required},
      dataRecepcio: {required, valid : validDate},
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return visibleAjudaArticles.value
        || visibleEditarLiniaTarifa.value
        || confirmVisible.value
        || visibleReserves.value
        || visibleStocks.value
        || visibleTarifesArticle.value
        || visibleCrearEditarLiniaTarifa.value
        || visibleIdiomaExport.value
        || visibleIdiomaCopiaTaula.value;
    });

    const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
      callbackArticleSeleccionat(liniaSeleccionada.value, quantitat, data, dataPrevistaSortida);
    }

    const callbackArticleSeleccionat = async (a, quantitat, dataSolicitada, dataPrevistaSortida) => {
      let liniaAfegir = {
          linia : 0,
          articleClient : {
            artint : a.artint ?? a.articleClient.artint,
            clicod : a.clicod ?? a.articleClient.clicod,
          },
          quantitat : quantitat,
          dataSolicitada : dataSolicitada,
          dataPrevistaSortida : dataPrevistaSortida
      };
      let request = {
        codiClient : clientRef.value.clicod,
        linies : [liniaAfegir],
        importTotalNet: importNetTotal.value ?? 0,
        importTotalBrut: importBrutTotal.value ?? 0,
        pesTotal: pesTotal.value ?? 0,
        incrementPesTransport: incrementPesTransport.value,
      }
      let resp = await(carrega(comandesService.calculadoraTarifes(request)));

      resp.linies[0].matriu = a.codi ?? a.matriu;
      resp.linies[0].reservaLocal = a.reservaLocal;
      resp.linies[0].stockLocal = a.stockLocal;

      ultimaDataIntroduida.value = dataSolicitada;
      ultimaDataSortidaIntroduida.value = dataPrevistaSortida;
      
      updateDadesCalcul(resp, selectedIndex.value);
      visibleAjudaArticles.value = false;
      visibleCrearEditarLiniaTarifa.value = false;
    }

    const eliminarLinia = async () => {
      if (!linies.value.length)
        return;

      importNetTotal.value = importNetTotal.value - liniaSeleccionada.value.importNet;
      importBrutTotal.value = importBrutTotal.value - liniaSeleccionada.value.importBrut;
      pesTotal.value = pesTotal.value - liniaSeleccionada.value.pesKg;

      let request = {
        codiClient : clientRef.value.clicod,
        importTotal: importNetTotal.value,
        pesTotal: pesTotal.value,
      }
      costTransportTotal.value = await carrega(comandesService.calcularCostTransport(request));

      request.pesTotal = pesTotal.value * incrementPesTransport.value;
      costTransportTotalAfegit.value = await carrega(comandesService.calcularCostTransport(request));

      linies.value = linies.value.filter(l => l.linia !== liniaSeleccionada.value.linia);
      liniaSeleccionada.value = linies.value[0];

      if (linies.value.length === 0) {
        importNetTotal.value = 0;
        importBrutTotal.value = 0;
        pesTotal.value = 0;
        costTransportTotal.value = 0;
        costTransportTotalAfegit.value = 0;
        selectedIndex.value = -1;
      }
    }

    const updateDadesCalcul = (resp, newSelectedIndex) => {
      if (linies.value && linies.value.length > 0) {
        resp.linies[0].linia = linies.value[linies.value.length - 1].linia + 1;
        linies.value = [...linies.value, resp.linies[0]]
      } else {
        linies.value = resp.linies
      }
      importNetTotal.value = resp.importTotalNet ?? 0;
      importBrutTotal.value = resp.importTotalBrut ?? 0;
      pesTotal.value = resp.pesTotal ?? 0;
      costTransportTotal.value = resp.costTransport ?? 0;
      costTransportTotalAfegit.value = resp.costTransportAfegit ?? 0;

      nextTick(() => {
        // Posició de l'element seleccionat
        if (newSelectedIndex >= 0) {
          selectedIndex.value = newSelectedIndex;
        } else {
          selectedIndex.value = 0;
        }
      });
    }

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls de la taula
      controlDataTable(ev, document.getElementById('calculadoraNormalitzats'), selectedIndex, linies);
      // Controls
      if (ev.key === 'Escape') {
          actionHandler(ev, () => hide());
      } else if (ev.key === '+') {
        actionHandler(ev, () => visibleAjudaArticles.value = true);
      } else if (ev.ctrlKey && ev.key=='-') {
        actionHandler(ev, () => eliminarLinia());
      } else if (ev.ctrlKey && ev.keyCode==82)  { //Ctrl + r
        actionHandler(ev, () => { if (liniaSeleccionada.value) { visibleReserves.value = true; }});
      } else if (ev.ctrlKey && ev.keyCode==83)  { //Ctrl + s
        actionHandler(ev, () => { if (liniaSeleccionada.value) { visibleStocks.value = true; }});
      } else if (ev.ctrlKey && ev.keyCode==73)  { //Ctrl + i
        actionHandler(ev, () => copiaReferenciaQtatPreu());
      } else if (ev.key === 'Enter')  {
        actionHandler(ev, () => { if (liniaSeleccionada.value) { visibleCrearEditarLiniaTarifa.value = true; }});
      }
    }

    const actionHandler = (ev, action) => {
        ev.preventDefault();
        action();
    }

    const openFileInput = () => {
      fileInput.value.click();
    }

    const handleFileChange = async (event) => {
      const files = event.target.files;
      let request = {
        codiClient : clientRef.value.clicod,
      }
      let resp = await carrega(comandesService.calculadoraNormalitzatsFitxer(request, files[0]));
      updateDadesCalcul(resp, selectedIndex.value);
    }

    const copiaReferenciaQtatPreu = () => {
      if (!liniaSeleccionada.value) return;

      let copia = `${liniaSeleccionada.value.referencia}   ${liniaSeleccionada.value.quantitat}   ${n(liniaSeleccionada.value.preuNet, 'decimalLong')} ${liniaSeleccionada.value.preu.divisa}   ${n(liniaSeleccionada.value.pesKg, 'decimalLong')}(Kg.)`;
      copyText(
        copia,
        undefined,
        () => {
          toast.add({ severity:'info', summary: t('Comandes.linia copiada'), life: 5000 });
        }
      );
    }

    const escollirIdiomaCopia = (linies) => {

      if (linies.length <= 0) {
        toast.add({severity:'warn', summary: t('Comandes.error copiar tarifes calculadora'), life: 5000});
      } else {
        visibleIdiomaCopiaTaula.value = true;
      }

    }

    const isMonterrey = computed(() => { return clientRef.value.empresa === "80"});

    const hide = () => {
      emit("update:carregat", false);
    };

    watch(selectedIndex, () => {
        liniaSeleccionada.value = linies.value[selectedIndex.value];
    });

    const showContextMenu = (ev) => {
        let selectedOld = selectedIndex.value;
        selectedIndex.value = linies.value.findIndex(l => l.linia == liniaSeleccionada.value.linia);
        if (selectedOld === selectedIndex.value) {
            liniaSeleccionada.value = linies.value[selectedIndex.value];
        }
        contextMenu.value.show(ev.originalEvent);
    }
    
    const menuModel = ref([
      {label: ()=>  `${t('Comandes.Elimina linia')} [Ctrl+-]`, class:'p-button-text', icon: 'pi pi-trash', command: () => eliminarLinia()},
      {label: ()=>  `${t('Comandes.Veure tarifes')}`, class:'p-button-text', icon: 'pi pi-chart-bar', command: () => visibleTarifesArticle.value = true},
      {label: ()=>  `${t('Comandes.Veure reserves')} [Ctrl+r]`, class:'p-button-text', icon: 'pi pi-book', command: () => visibleReserves.value = true},
      {label: ()=>  `${t('Comandes.Veure stock')} [Ctrl+s]`, class:'p-button-text', icon: 'pi pi-box', command: () => visibleStocks.value = true},
      {label: ()=>  `${t('Comandes.Copia referencia quantitat i preu')} [Ctrl+i]`, class:'p-button-text', icon: 'pi pi-copy', command: () => copiaReferenciaQtatPreu()},
      {label: ()=>  `${t('Comandes.afegir altre quantitat')} [Enter]`, class:'p-button-text', icon: 'pi pi-plus', command: () => visibleCrearEditarLiniaTarifa.value = true},
    ]);

    const exportarTaula = (linies) => {
      if (linies.length === 0) {
        toast.add({severity:'warn', summary: t('Comandes.error exportar tarifes calculadora'), life: 5000});
      } else {
        visibleIdiomaExport.value = true;
      }
    }

    return {
      visible,
      visibleAjudaArticles,
      visibleStocks,
      visibleReserves,
      visibleEditarLiniaTarifa,
      visibleTarifesArticle,
      visibleIdiomaExport,
      visibleIdiomaCopiaTaula,
      visibleCrearEditarLiniaTarifa,
      isMonterrey,
      reqEdicio,
      copyText,
      contextMenu,
      showContextMenu,
      menuModel,
      liniaSeleccionada,
      selectedIndex,
      clientRef,
      tarifesRef,
      linies,
      dadesCalcul,
      callbackArticleSeleccionat,
      callbackLinia,
      fileInput,
      openFileInput,
      handleFileChange,
      hide,
      state,
      v,
      exportarTaula,
      escollirIdiomaCopia,
      columnes,
      importNetTotal,
      importBrutTotal,
      pesTotal,
      costTransportTotal,
      costTransportTotalAfegit,
    };

  },
};
</script>

<style scoped>
  .avisdatasolicitada {
    background-color: #ffd061;
    border-radius: 50px;
    padding: 0px 5px;
    font-weight: 600;
    margin-left: 3px;
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

  .form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
  }

  .element-form > label {
    display: block;
    font-weight: 600;
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  :deep(.p-dialog .p-dialog-header) {
    background-color: red !important;
  }

</style>

<style>
  .p-dialog.calculadora-dialog .p-dialog-header, .p-dialog.calculadora-dialog .p-dialog-content {
    background-color: rgb(215, 223, 230);
  }
</style>