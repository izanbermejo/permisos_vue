<template>
  <AjudaArticlesNormalitzats :visible="visibleAjudaArticles" @update:carregat="visibleAjudaArticles = false" :seleccioCallback="callbackArticleSeleccionat"
    :client="clientRef"
    :empresa="clientRef?.empresa" :codiClient="clientRef?.clicod" />
  <CrearEditarLiniaNormalitzat v-if="visibleEditarLinia" :carregat="visibleEditarLinia"
      :artint="liniaSeleccionada.articleClient.artint" :clicod="liniaSeleccionada.articleClient.clicod"
      :client="clientRef"
      :permetNoMultiplesBossa="isMonterrey"
      :req="reqEdicio"
      :callbackOk="callbackEditarLinia"
      @update:carregat="visibleEditarLinia = $event;" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="' '" style="width: 1500px">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <font-awesome-icon icon="fa-solid fa-plus" />
        <span style="margin-left: 10px;"> {{ $t('Comandes.Nova comanda normalitzats')}}</span>
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
        <h6 class="card-header" style="font-weight: 600;">
          {{ $t('Comandes.Dades')}}
        </h6>
        <div class="card-body" style="padding: 10px;">
          <div class="form">
            <div class="element-form">
              <label>{{ $t('Comandes.Data recepcio')}}</label>
              <span>
                <CalendarInput v-model="state.dataRecepcio" :invalid="v.dataRecepcio.$errors.length"/>
              </span>
              <small v-if="(v.dataRecepcio.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
            <div class="element-form">
              <label>{{ $t('Comandes.Comanda')}}</label>
              <InputText ref="inputComanda" v-model="state.comanda"  
                    @focus="$event.originalTarget.select()"
                    @blur="comprovarExisteixComandaInformatiu"
                    style="width: 300px"
                    :class="{ 'p-invalid' : v.comanda.$errors.length }" />
                <small v-if="(v.comanda.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
          {{ $t('Comandes.Linies')}}
          <div style="display: inline-block;">
            <ButtonShortcut :literal="$t('Comandes.Afegeix article')" @mousedown="visibleAjudaArticles = true"
            icon="fa-solid fa-cart-plus" :shortcut="'[+]'" style="margin-left: 50px;"/>
          </div>
          <div style="float: right;">
            <input ref="fileInput" type="file" @change="handleFileChange" style="display: none;" />
            <ButtonShortcut :literal="$t('Comandes.Carrega linies fitxer')" @click="openFileInput"
            icon="fa-solid fa-file-excel" />
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
              @row-dblclick="editarLinia()"
              @row-select="selectedIndex = $event.index;"
              :scrollable="true" scrollDirection="both" scrollHeight="34vh" >
              <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                <template #body="{data}">
                  <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaSeleccionada = data; contextMenu.show($event)" />
                  </div>
                </template>
              </Column>
              <Column field="linia" :style="{width:'30px'}" style="max-width: 30px;">
                <template #body="{data}">
                  <div style="width: 100%; text-align: center;">
                    {{ $n(data.linia) }}
                  </div>
                </template>
              </Column>
              <Column field="referencia" :header="$t('Comandes.Referencia')" :style="{width:'125px'}" />
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
              <Column :style="{width:'145px'}" style="text-align: right; max-width: 145px;" :header="$t('Comandes.Preu')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
                  </div>
                </template>
              </Column>
              <Column :header="$t('Comandes.Data confirmada')" :style="{width:'120px'}" style="max-width: 150px;">
                <template #body="{data}">
                  {{ `${$d($toDate(data.dataSolicitada), 'short')}` }}
                  <span v-if="$daysDiffNow(data.dataSolicitada) > 90" class="avisdatasolicitada">+90</span>
                </template>
              </Column>
              <Column field="setmana" :style="{width:'30px'}" style="text-align: right; max-width: 30px;" :header="$t('Comandes.Set')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ data.setmana }}
                  </div>
                </template>
              </Column>
              <Column :header="$t('Comandes.Data sortida')" :style="{width:'150px'}" style="max-width: 150px;">
                <template #body="{data}">
                  {{ $d($toDate(data.dataPrevistaSortida), 'short') }}
                </template>
              </Column>
              <Column :style="{width:'190px'}" style="text-align: right; max-width: 190px;" :header="$t('Comandes.Reservable')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: center;">  
                    <ColumnaReserva :reservable="data.reservable" :quantitatReservable="data.quantitatReservable"
                      :stockDisponible="data.stockDisponible"/>
                  </div>
                </template>
              </Column>
              <Column :style="{width:'95px'}" style="text-align: right; max-width: 95px;" :header="$t('Comandes.Quantitat calcul')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ $n(data.quantitatCalcul) }}
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
          <DetallResum :resum="dadesCalcul" @crearComanda="crearComanda" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, toRef, onMounted, onUnmounted, computed, watch, nextTick, reactive, provide, inject } from "vue";
import AjudaArticlesNormalitzats from '@/views/modals/ajudanormalitzats/AjudaArticlesNormalitzats.vue';
import { controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import comandesService from "@/services/comandes.service";
import { carrega } from '@/services/loader';
import moment from 'moment';
import DetallClient from './DetallClient.vue';
import DetallResum from './DetallResum.vue';
import ColumnaReserva from './ColumnaReserva.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ColumnaTipusArticleClient from '@/components/ColumnaTipusArticleClient.vue'
import CrearEditarLiniaNormalitzat from "../CrearEditarLiniaNormalitzat.vue";
import { useI18n } from 'vue-i18n';
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import Swal from "sweetalert2";
import { useConfirm } from "primevue/useconfirm";

export default {
  name: "HistoricLiniaComanda",
  components: {
    AjudaArticlesNormalitzats,
    DetallClient,
    DetallResum,
    ColumnaReserva,
    ColumnaTipusArticleClient,
    CrearEditarLiniaNormalitzat,
  },
  props: {
    client : Object,
    tarifes : Object,
  },
  setup(props, { emit }) {
    const { t, n, d } = useI18n();
    const toDate = inject('toDate');
    const confirm = useConfirm();
    const visible = ref(true);
    const confirmVisible = ref(false);
    const visibleAjudaArticles = ref(false);
    const visibleEditarLinia = ref(false);
    const contextMenu = ref();
    const clientRef = toRef(props, 'client');
    const tarifesRef = toRef(props, 'tarifes');
    const linies = ref();
    const liniaSeleccionada = ref();
    const selectedIndex = ref(-1);
    const dadesCalcul = ref({});
    const inputComanda = ref();
    const reqEdicio = ref();
    const fileInput = ref();
    // Es fa un provide de l'última data introduïda per poder accedir amb un inject
    // als components fills que ho puguin necessitar com la creació de una nova línia
    const ultimaDataIntroduida = ref();
    provide('ultimaDataIntroduida', ultimaDataIntroduida);
    const ultimaDataSortidaIntroduida = ref();
    provide('ultimaDataSortidaIntroduida', ultimaDataSortidaIntroduida);

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
      nextTick(() => {
        inputComanda.value.$el.focus();
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const modalVisible = computed(() => {
      return visibleAjudaArticles.value
        || visibleEditarLinia.value
        || confirmVisible.value;
    });

    const callbackArticleSeleccionat = async (a, quantitat, dataSolicitada, dataPrevistaSortida) => {
      let liniesActuals = buildRequestLinies();
      let liniaAfegir = {
          linia : 0,
          articleClient : {
            artint : a.artint,
            clicod : a.clicod,
          },
          quantitat : quantitat,
          dataSolicitada : dataSolicitada,
          dataPrevistaSortida : dataPrevistaSortida
      };
      liniesActuals.push(liniaAfegir);
      let request = {
        codiClient : clientRef.value.clicod,
        linies : liniesActuals,
      }
      let importPrevi = dadesCalcul.value.importNet;
      let resp = await(carrega(comandesService.calculadoraNormalitzats(request)));

      ultimaDataIntroduida.value = dataSolicitada;
      ultimaDataSortidaIntroduida.value = dataPrevistaSortida;
      
      visibleAjudaArticles.value = false;
      // Es posiciona a la línia acabada d'afegir per a que sempre quedi visible
      updateDadesCalcul(resp, indexLiniaNova(resp.linies));
      let importPosterior = dadesCalcul.value.importNet;
      if (importPrevi === importPosterior || importPosterior === 0) {
        await Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Comandes.Linia afegida te preu 0')
        });
      }
      nextTick(() => {
        visibleAjudaArticles.value = true;
      });
    }

    const eliminarLinia = async () => {
      if (!linies.value.length)
        return;

      var liniesActuals = linies.value
                    ?.filter(l => l.linia !== liniaSeleccionada.value.linia)
                    .map(l => { return buildLinia(l)});
      let request = {
        codiClient : clientRef.value.clicod,
        linies : liniesActuals,
      }
      let resp = await(carrega(comandesService.calculadoraNormalitzats(request)));
      updateDadesCalcul(resp, selectedIndex.value-1);
    }

    const elementTaula = () => document.getElementById('calculadoraNormalitzats');

    // La calculadora numera la línia nova com el màxim + 1, però retorna les línies ordenades
    // per data sol·licitada, per tant no té perquè ser l'última del grid
    const indexLiniaNova = (liniesResp) => {
      let numeroNou = liniesResp.reduce((max, l) => Math.max(max, l.linia), 0);
      return liniesResp.findIndex(l => l.linia === numeroNou);
    }

    const updateDadesCalcul = (resp, newSelectedIndex) => {
      linies.value = resp.linies;
      // Es força el canvi de selecció per a que sempre es reposicioni el grid
      selectedIndex.value = -1;
      dadesCalcul.value = {
        numLinies : resp.linies.length,
        pes: resp.pes,
        importNet: resp.importNet,
        importBrut: resp.importBrut,
        divisa: resp.divisa,
        costTransport: resp.costTransport
      }
      nextTick(() => {
        // Posició de l'element seleccionat
        if (newSelectedIndex >= 0) {
          selectedIndex.value = newSelectedIndex;
        } else {
          selectedIndex.value = 0;
        }
      });
    }

    const editarLinia = async() => {
      // Construcció del request i s'obre el modal
      reqEdicio.value = {
        quantitat: liniaSeleccionada.value.quantitat,
        dataSolicitada: liniaSeleccionada.value.dataSolicitada,
        dataPrevistaSortida: liniaSeleccionada.value.dataPrevistaSortida,
      };
      visibleEditarLinia.value = true;
    }

    const callbackEditarLinia = async (quantitat, data, dataPrevistaSortida) => {
      // Creació de totes les línies excepte l'editada
      var liniesActuals = linies.value
                    ?.filter(l => l.linia !== liniaSeleccionada.value.linia)
                    .map(l => { return buildLinia(l)});
      // Creació de la línia editada
      var liniaEditada = buildLinia(liniaSeleccionada.value);
      // Actualització amb les dades editades
      liniaEditada.quantitat = quantitat;
      liniaEditada.dataSolicitada = data;
      liniaEditada.dataPrevistaSortida = dataPrevistaSortida;
      liniesActuals.push(liniaEditada);
      let request = {
        codiClient : clientRef.value.clicod,
        linies : liniesActuals,
      }
      let resp = await(carrega(comandesService.calculadoraNormalitzats(request)));
      updateDadesCalcul(resp, selectedIndex.value);
      visibleEditarLinia.value = false;
    }

    const buildRequestLinies = () => {
      if (!linies.value)
        return [];
      return linies.value?.map(l => {
        return buildLinia(l);
      });
    }

    const buildLinia = (l) => {
      return {
          linia : l.linia,
          articleClient : {
            artint : l.articleClient.artint,
            clicod : l.articleClient.clicod,
          },
          quantitat : l.quantitat,
          dataSolicitada : moment(l.dataSolicitada).format('YYYY-MM-DD'),
          dataPrevistaSortida : moment(l.dataPrevistaSortida).format('YYYY-MM-DD')
        }
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
      } else if (ev.key === 'Enter') {
        actionHandler(ev, () => editarLinia());
      } else if (ev.key === '+') {
        actionHandler(ev, () => visibleAjudaArticles.value = true);
      } else if (ev.ctrlKey && ev.key=='-') {
        actionHandler(ev, () => eliminarLinia());
      } else if (ev.ctrlKey && ev.keyCode==83)  { //Ctrl + s
        ev.preventDefault();
        if (linies.value?.length)
          crearComanda();
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

    const crearComanda = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (!v.value.$error) {
        comprovarExisteixComandaClient();        
      }
    }

    const comprovarExisteixComandaInformatiu = async () => {
      if (!state.comanda.trim())
        return;
      // En cas que s'hagi informat la comanda es comprova si existeix ja una amb el mateix nom
      let comanda = await(carrega(comandesService.obtenirComandaNormalitzatPerComandaClient(clientRef.value.clicod, state.comanda.trim(), clientRef.value.empresa)));
      if (comanda) {
        let missatge = comanda.servida
          ? t('Comanda.Confirmacio existeix comanda servida', [comanda.comanda, d(toDate(comanda.dataRecepcio), 'short')])
          : t('Comanda.Confirmacio existeix comanda', [comanda.comanda, d(toDate(comanda.dataRecepcio), 'short')]);
        Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'info',
          title: t('App.Informacio'),
          text: missatge
        });
      }      
    }

    const comprovarExisteixComandaClient = async() => {
      let comanda = await(carrega(comandesService.obtenirComandaNormalitzatPerComandaClient(clientRef.value.clicod, state.comanda, clientRef.value.empresa)));
      if (comanda) {
        // En cas que existeixi una comanda amb el mateix nom s'ha de preguntar per la confirmació
        confirmVisible.value = true;
        if (await(confirmacioComandaExistent(comanda)))
          accioCrearComanda();
        confirmVisible.value = false;
      } else {
        accioCrearComanda();
      }
    }

    const confirmacioComandaExistent = async(comanda) => {
      let missatge = comanda.servida
        ? t('Comanda.Confirmacio existeix comanda servida amb confirmacio', [comanda.comanda, d(toDate(comanda.dataRecepcio), 'short')])
        : t('Comanda.Confirmacio existeix comanda amb confirmacio', [comanda.comanda, d(toDate(comanda.dataRecepcio), 'short')]);
      return new Promise((resolve) => {
        confirm.require({
          message: missatge,
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const accioCrearComanda = async() => {
      let liniesActuals = buildRequestLinies();
      let request = {
        codiClient : clientRef.value.clicod,
        comanda : state.comanda,
        dataRecepcio : state.dataRecepcio,
        linies : liniesActuals,
      }
      let resp = await(carrega(comandesService.crearComandaNormalitzat(request)));
      emit("comandaCreada", resp.comanda);
      // Avís si la comanda ha superat els 1.000€ i és d'un distribuidor nacional
      if (resp.avisComandaSuperiorDistribuidorNacional) {
        Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'warning',
          title: `🚩🚩${t('App.Atencio')}🚩🚩`,
          text: t('Comandes.Comanda distribuidor nacional', [n(dadesCalcul.value.importNet)])
        });        
      }
      // Avís que la comanda creada es inferior a 70
      if (dadesCalcul.value.importNet < 70 && !clientRef.value.isClientWeb){
        Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Comandes.Comanda no arriba al minim', [n(dadesCalcul.value.importNet)])
        });
      }
      hide();
    }

    const isMonterrey = computed(() => { return clientRef.value.empresa === "80"});

    const hide = () => {
      emit("update:carregat", false);
    };

    watch(selectedIndex, () => {
        if (selectedIndex.value < 0)
          return;
        liniaSeleccionada.value = linies.value[selectedIndex.value];
        scrollCenter(elementTaula(), selectedIndex);
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
      {label: ()=>  `${t('Comandes.Editar linia')} [Enter]`, class:'p-button-text', icon: 'pi pi-pencil', command: () => editarLinia()},
      {label: ()=>  `${t('Comandes.Elimina linia')} [Ctrl+-]`, class:'p-button-text', icon: 'pi pi-trash', command: () => eliminarLinia()},
    ]);

    return {
      visible,
      visibleAjudaArticles,
      visibleEditarLinia,
      isMonterrey,
      reqEdicio,
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
      callbackEditarLinia,
      crearComanda,
      fileInput,
      openFileInput,
      handleFileChange,
      editarLinia,
      hide,
      state,
      inputComanda,
      comprovarExisteixComandaInformatiu,
      v
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
        user-select: none;
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
</style>
