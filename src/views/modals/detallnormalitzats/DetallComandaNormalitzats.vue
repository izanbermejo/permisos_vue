<template>
  <CanviarAdresa v-if="visibleCanviarAdresa" :carregat="visibleCanviarAdresa"  @update:carregat="visibleCanviarAdresa = $event"
    :adresa="comandaLoaded.adresa" :informacioEnviament="comandaLoaded.informacioEnviament"
    :codiClient="comandaLoaded.codiClient" :onGuardar="guardarAdresaComanda" :callbackOk="adresaChanged" />
  <AjudaStocks v-if="visibleStocks" :carregat="visibleStocks"  @update:carregat="visibleStocks = $event"
      :artint="liniaSeleccionada.articleClient.artint" :clicod="liniaSeleccionada.articleClient.clicod" />
  <AjudaReserves v-if="visibleReserves" :carregat="visibleReserves"  @update:carregat="visibleReserves = $event"
      :artint="liniaSeleccionada.articleClient.artint" :empresa="clientLoaded?.empresa" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <AjudaArticlesNormalitzats :visible="visibleAjudaArticles" @update:carregat="visibleAjudaArticles = false" 
    :client="clientLoaded"
    :seleccioCallback="callbackArticleSeleccionat"
    :empresa="clientLoaded?.empresa" :codiClient="clientLoaded?.clicod" />
  <CrearEditarLiniaNormalitzat v-if="visibleCrearEditarLinia" :carregat="visibleCrearEditarLinia"
        :artint="liniaSeleccionada.articleClient.artint" :clicod="liniaSeleccionada.articleClient.clicod"
        :client="clientLoaded"
        :permetNoMultiplesBossa="isMonterrey"
        :req="reqEdicio"
        :callbackOk="callbackEditarLinia"
        @update:carregat="visibleCrearEditarLinia = $event;" />
  <ModalFixarPreu v-if="visibleModalFixarPreu" :carregat="visibleModalFixarPreu" @update:carregat="visibleModalFixarPreu = $event;"
    :preu="liniaSeleccionada.preu.valor" @preuFixat="preuFixatCallback" />
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :comanda="comandaLoaded.comanda" />
  <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
    :text="liniaSeleccionada.comentarisInterns" :callback="updateComentarisInterns"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')" />
  <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
    :text="liniaSeleccionada.comentarisClient" :callback="updateComentarisClient" 
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="' '" style="width: 1680px">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <font-awesome-icon icon="fa-solid fa-receipt" />
        <span style="margin-left: 10px;"> {{ $t('Comandes.Detall comanda normalitzat', [props.comanda])}}</span>
        <span v-if="comandaLoaded" style="margin-left: 15px;">
          <Tag v-if="comandaLoaded.servida" style="background-color: #00939b" icon="pi pi-truck" :value="$t('Comandes.Servit')"></Tag>
          <ColumnaServible v-else :reservable="comandaLoaded.servible"/>
        </span>
        <ButtonShortcut :literal="$t('Comandes.Veure adjunts')" @click="visibleModalAdjunts = true"
          icon="fa-solid fa-paperclip" style="margin-left: 500px;"/>
        <ButtonShortcut :literal="$t('Comandes.Recarrega')" @click="refresh(liniaSeleccionada?.numero)"
          icon="fa-solid fa-retweet" :shortcut="'[Ctrl + 0]'" style="margin-left: 50px;"/>
      </div>
    </template>
    <div style="height: 75vh;">
      <DetallComanda v-if="comandaLoaded" :comanda="comandaLoaded" @canviarAdresa="visibleCanviarAdresa = true" />
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
          {{ `${$t('Comandes.Linies')} ${$t('Comandes.linies servides total', [numLiniesServides, numLinies])}`}}
          <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')"
            :literal="$t('Comandes.Afegeix article')" @click="visibleAjudaArticles = true"
            icon="fa-solid fa-cart-plus" :shortcut="'[+]'" style="margin-left: 50px;"/>
          <ButtonShortcut :literal="isMostrarServides ? $t('Comandes.Ocultar servides') :  $t('Comandes.Mostrar servides')" 
            @click="isMostrarServides = !isMostrarServides"
            :icon="isMostrarServides ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" :shortcut="'[Ctrl+1]'" style="margin-left: 50px;"/>
          <span class="p-input-icon-left" style="margin-left: 50px">
            <i class="pi pi-search" />
            <InputText ref="inputFiltreReferencia" v-model="valorFiltreReferencia"  style="width: 200px" 
            :placeholder="$t('Comandes.Referencia')" />
          </span>
        </h6>
        <div class="card-body" style="padding: 5px;">
          <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)" />
          <div id="detallComandaNormalitzats">
            <DataTable v-model:expandedRows="expandedRows" :value="linies" class="p-datatable-sm-petita" showGridlines
              :dataKey="numero"
              v-model:selection="liniaSeleccionada" selectionMode="single"
              :rowClass="() => 'estilRow'"
              contextMenu v-model:contextMenuSelection="liniaSeleccionada" @rowContextmenu="showContextMenu($event)"
              @row-select="selectedIndex = $event.index;"
              @dblclick="window?.getSelection()?.removeAllRanges(); editarLinia()"
              :scrollable="true" scrollDirection="both" scrollHeight="45vh" >
              <template #empty>
                <div style="width:100%; text-align: center; padding: 15px;">
                  <span v-if="numLinies==0">
                    <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap linia')" />
                  </span>
                  <span v-else>
                    <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('Comandes.Cap linia pendent')" />
                  </span>
                </div>
              </template>
              <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                <template #body="{data}">
                  <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="liniaSeleccionada = data; contextMenu.show($event)" />
                  </div>
                </template>
              </Column>
              <Column field="numero" :style="{width:'40px'}" style="max-width: 40px;">
                <template #body="{data}">
                  <div style="width: 100%; text-align: center;">
                    {{ $n(data.numero) }}
                  </div>
                </template>
              </Column>
              <Column field="referencia" :header="$t('Comandes.Referencia')" :style="{width:'125px'}">
                <template #body="{data}">
                  <span>
                    {{ data.referencia }}
                  </span>
                </template>
              </Column>
              <Column field="matriu" :header="$t('Comandes.Matriu')" :style="{width:'75px'}" style="max-width: 75px;">
                <template #body="{data}">
                  <span>
                    {{ data.matriu }}
                  </span>
                </template>
              </Column>
              <Column :header="$t('Comandes.Tipus')" :style="{width:'50px'}" style="max-width: 50px; text-align: center;">
                <template #body="{data}">
                  <ColumnaTipusArticleClient :tipus="data.tipusArticleClient" />
                </template>
              </Column>
              <Column :style="{width:'70px'}" style="text-align: right; max-width: 70px;" :header="$t('Comandes.Qtat')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ $n(data.quantitat) }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'70px'}" style="text-align: right; max-width: 70px;" :header="$t('Comandes.Qtat servida')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    <span v-if="data.quantitatServida">
                      <a class="enllas" @click="showNode(data)">{{ $n(data.quantitatServida) }}</a>  
                    </span>
                    <span v-else> 0 </span>
                  </div>
                </template>
              </Column>
              <Column :style="{width:'70px'}" style="text-align: right; max-width: 70px;" :header="$t('Comandes.Qtat pendent')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ $n(data.quantitatPendent) }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'140px'}" style="text-align: right; max-width: 140px;" :header="$t('Comandes.Preu')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
                      <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.10rem" />
                    </span>
                    {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
                  </div>
                </template>
              </Column>
              <Column :header="$t('Comandes.Data solicitada')" :style="{width:'130px'}" style="max-width: 130px;">
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
              <Column :style="{width:'185px'}" style="text-align: right; max-width: 185px;" :header="$t('Comandes.Reservat')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: center;">
                    <ColumnaReserva :servida="data.servida" :reservable="data.reserva.estat" :quantitatReservada="data.reserva.quantitat"
                      :quantitatPendent="data.quantitatPendent" :stock="data.stock" />
                  </div>
                </template>
              </Column>
              <Column :style="{width:'95px'}" style="text-align: right; max-width: 95px;" :header="$t('Comandes.Quantitat calcul')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ data.dadesCalcul? $n(data.dadesCalcul.quantitatCalcul) : '-' }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Descompte')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;">
                    {{ data.dadesCalcul ? $n(data.dadesCalcul.descompte) : '-' }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Comandes.Import net')">
                <template #body="{data}">
                  <div style="width: 100%; text-align: right;" v-tooltip="$n(data.importBrut, 'decimalLong')">
                    {{ `${$n(data.importNet, 'decimalLong')}` }}
                  </div>
                </template>
              </Column>
              <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Int')">
                <template #body="{data}">
                  <div style="width: 100%;">
                  <Button icon="pi pi-comments" @click="liniaSeleccionada = data; visibleModalComentarisInterns = true"
                    class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisInterns}" />
                  </div>
                </template>
              </Column>
              <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Comandes.Ext')">
                <template #body="{data}">
                  <div style="width: 100%;">
                  <Button icon="pi pi-megaphone" @click="liniaSeleccionada = data; visibleModalComentarisClient = true"
                    class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.comentarisClient}" />
                  </div>
                </template>
              </Column>
              <template #expansion="slotProps">
                <div style="background-color: #ffffdc; padding: 10px 75px;">
                  <DataTable
                    v-if="liniesExpand[`${slotProps.data.numero}`]"
                    :value="liniesExpand[`${slotProps.data.numero}`]"
                    class="p-datatable-sm"
                    style="max-width: 850px;"
                    showGridlines
                  >
                    <Column field="data" :header="$t('Comandes.Data')" style="min-width: 105px;">
                      <template #body="{data}">
                        {{ $d($toDate(data.dataAlbara), 'short') }}
                      </template>
                    </Column>
                    <Column field="albara" :header="$t('Comandes.Albara')" style="min-width: 105px;">
                      <template #body="{data}">
                        {{ data.albara }}
                      </template>
                    </Column>
                    <Column field="enviamentAlbara" :header="$t('Comandes.Enviament')" style="min-width: 105px;">
                      <template #body="{data}">
                        {{ data.enviamentAlbara }}
                      </template>
                    </Column>
                    <Column field="quantitat" :header="$t('Comandes.Quantitat')" style="text-align: right; min-width: 105px;">
                      <template #body="{data}">
                        {{ $n(data.quantitat) }}
                      </template>
                    </Column>
                    <Column field="factura" :header="$t('Comandes.Factura')" style="min-width: 105px;">
                      <template #body="{data}">
                        {{ data.factura }}
                      </template>
                    </Column>
                    <Column field="entregat" :header="$t('Comandes.Entregat')" style="text-align: center; min-width: 105px;">
                      <template #body="{data}">
                        {{ data.entregat ? $t('App.Si') : $t('App.No') }}
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
            {{ $t('Comandes.Resum comanda') }}
        </h6>
        <div class="card-body">
          <DetallResum v-if="comandaLoaded" :comanda="comandaLoaded" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, watch, nextTick, provide } from "vue";
import AjudaArticlesNormalitzats from '@/views/modals/ajudanormalitzats/AjudaArticlesNormalitzats.vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { home, end, controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import comandesService from "@/services/comandes.service";
import { carrega } from '@/services/loader';
import ColumnaTipusArticleClient from "@/components/ColumnaTipusArticleClient.vue";
import ColumnaReserva from "./ColumnaReserva.vue";
import ColumnaServible from "@/components/comandes/ColumnaServible.vue";
import DetallComanda from "./DetallComanda.vue";
import DetallResum from "./DetallResum.vue";
import CrearEditarLiniaNormalitzat from "../CrearEditarLiniaNormalitzat.vue";
import { useI18n } from "vue-i18n";
import { useConfirm } from "primevue/useconfirm";
import AjudaStocks from "../AjudaStocks.vue";
import AjudaReserves from "../reserves/AjudaReserves.vue";
import ModalFixarPreu from "./ModalFixarPreu.vue";
import CanviarAdresa from '@/views/modals/canviaradresa/CanviarAdresa.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import Swal from "sweetalert2";
import { usePermisosStore } from "@/stores/permisos";

export default {
  name: "DetallComandaNormalitzats",
  components: {
    AjudaArticlesNormalitzats,
    CrearEditarLiniaNormalitzat,
    ColumnaTipusArticleClient,
    ColumnaReserva,
    ColumnaServible,
    DetallComanda,
    DetallResum,
    AjudaStocks,
    AjudaReserves,
    ModalFixarPreu,
    CanviarAdresa,
    ModalAdjuntsComandes,
    EditorComentaris,
  },
  props: {
    comanda : Number,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const visibleAjudaArticles = ref(false);
    const visibleCrearEditarLinia = ref(false);
    const visibleModalFixarPreu = ref(false);
    const visibleCanviarAdresa = ref(false);
    const contextMenu = ref();
    const selectedIndex = ref(-1);
    const comandaLoaded = ref();
    const clientLoaded = ref();
    const linies = ref();
    const liniaSeleccionada = ref();
    const reqEdicio = ref();
    const confirm = useConfirm();
    const confirmVisible = ref(false);
    const visibleStocks = ref(false);
    const visibleReserves = ref(false);
    const visibleModalAdjunts = ref(false);
    const visibleModalComentarisInterns = ref(false);
    const visibleModalComentarisClient = ref(false);
    // Es fa un provide de l'última data introduïda per poder accedir amb un inject
    // als components fills que ho puguin necessitar com la creació de una nova línia
    const ultimaDataIntroduida = ref();
    provide('ultimaDataIntroduida', ultimaDataIntroduida);
    const ultimaDataSortidaIntroduida = ref();
    provide('ultimaDataSortidaIntroduida', ultimaDataSortidaIntroduida);

    const isMostrarServides = ref(true);
    const numLinies = ref();
    const numLiniesServides = ref();
    const expandedRows = ref(new Array());
    const liniesExpand = ref({});
    const valorFiltreReferencia = ref();
    const liniesOriginal = ref();
    const inputFiltreReferencia = ref();

    const elementTaula = () => document.getElementById('detallComandaNormalitzats');

    onMounted(async () => {
      document.addEventListener("keydown", handler); 
      await refresh();
      clientLoaded.value = await carrega(comandesService.obtenirClient(comandaLoaded.value.codiClient));
      nextTick(() => {
        inputFiltreReferencia.value.$el.focus();
      });
    });

    const refresh = async(liniaSel = 0, isPosicionarLiniaNova = false) => {
      selectedIndex.value = -1;
      comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(props.comanda));
      let liniesComanda = comandaLoaded.value.linies;
      // El backend numera la línia nova com el màxim + 1, per tant és la del número més alt
      if (isPosicionarLiniaNova) {
        liniaSel = liniesComanda.reduce((max, l) => Math.max(max, l.numero), 0);
      }
      // Actualitació del número de línies servides i total
      numLinies.value = liniesComanda.length;
      let liniesNoServides = liniesComanda.filter(l => !l.servida);
      numLiniesServides.value = liniesComanda.length - liniesNoServides.length;
      linies.value = isMostrarServides.value ? liniesComanda : liniesNoServides;
      liniesOriginal.value = linies.value;
      // Posició al grid
      nextTick(() => {
        if (!liniaSel) {
          posicionaPrimerRegistre();
          return;
        }
        selectedIndex.value = linies.value.findIndex(l => l.numero == liniaSel);
        // La línia acabada d'afegir és l'última del grid: s'ancora al final per a que sempre quedi visible
        if (isPosicionarLiniaNova && selectedIndex.value === linies.value.length - 1) {
          end(elementTaula(), selectedIndex, linies);
        }
      });
    }

    // eslint-disable-next-line
    watch(isMostrarServides, () => refresh());

    const posicionaPrimerRegistre = () => {
      selectedIndex.value = -1;
      home(elementTaula(), selectedIndex, linies);
    }

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        liniaSeleccionada.value = linies.value[selectedIndex.value];
        scrollCenter(elementTaula(), selectedIndex);
      }
    });

    watch(valorFiltreReferencia, () => {
      linies.value = liniesOriginal.value.filter(linia => linia.referencia.toUpperCase().includes(valorFiltreReferencia.value.toUpperCase()));
    });

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls de la taula
      controlDataTable(ev, elementTaula(), selectedIndex, linies);
      // Controls
      if (ev.key === 'Escape') {
        actionHandler(ev, () => hide());
      } else if (ev.key === '+') {
        actionHandlerLinia(ev, () => visibleAjudaArticles.value = true, 'WRITE');
      } else if (ev.ctrlKey && ev.key === '-') {
        actionHandlerLinia(ev, () => eliminarLinia(), 'WRITE');
      } else if (ev.key === 'Enter') {
        actionHandlerLinia(ev, () => editarLinia(), 'WRITE');
      } else if (ev.ctrlKey && ev.key=="0") { // Ctrl + 0
        actionHandler(ev, () => refresh(liniaSeleccionada.value?.numero));
      } else if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
        actionHandler(ev, () => isMostrarServides.value = !isMostrarServides.value);
      } else if (ev.ctrlKey && ev.which==69) { // Ctrl + E
        actionHandler(ev, () => {visibleModalComentarisClient.value = true;});
      } else if (ev.ctrlKey && ev.which==73) { // Ctrl + I
        actionHandler(ev, () => {visibleModalComentarisInterns.value = true;});
      } else if (ev.ctrlKey && ev.keyCode == '80') {  // Ctrl + p
        actionHandlerLinia(ev, () => visibleModalFixarPreu.value = true, 'WRITE');
      } else if (ev.ctrlKey && ev.keyCode == '82') {  // Ctrl + r
        actionHandlerLinia(ev, () => visibleReserves.value = liniaSeleccionada.value?.tipusArticleClient !== "ESPECIAL");
      } else if (ev.ctrlKey && ev.keyCode == '83') {  // Ctrl + s
        actionHandlerLinia(ev, () => visibleStocks.value = true);
      } else if (ev.ctrlKey && ev.keyCode == '90') {  // Ctrl + z
        if (isLiniaPreuFixat.value) {
          actionHandlerLinia(ev, () => desfixarLinia(), 'WRITE');
        }
      }
    }

    const callbackArticleSeleccionat = async (a, quantitat, dataSolicitada, dataPrevistaSortida) => {
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
      let missatgesCanvis = await(carrega(comandesService.afegirLiniaComandaNormalitzat(props.comanda, liniaAfegir)));
      console.log(missatgesCanvis);

      visibleAjudaArticles.value = false;
      ultimaDataIntroduida.value = dataSolicitada;
      ultimaDataSortidaIntroduida.value = dataPrevistaSortida;

      let importPrevi = comandaLoaded.value.importNet;
      // Es posiciona i es fa scroll a la línia acabada d'afegir per a que quedi visible
      await refresh(0, true);
      let importPosterior = comandaLoaded.value.importNet;
      if (importPrevi === importPosterior) {
        Swal.fire({
          allowOutsideClick : false,
          didOpen: () => Swal.getConfirmButton().focus(),
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Comandes.Linia afegida te preu 0')
        });
      }
      emit("comandaModificada");
    }

    const eliminarLinia = async() => {
      confirmVisible.value = true;
      if (await confFunction())
        eliminarLiniaAction();
      confirmVisible.value = false;
    }

    const confFunction = async() => {
      return new Promise((resolve) => {
        confirm.require({
          message: t('ComandaNormalitzats.Confirma elimina comanda'),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const eliminarLiniaAction = async() => {
      let missatgesCanvis = await carrega(comandesService.eliminarLiniaComandaNormalitzat(props.comanda, liniaSeleccionada.value.numero));
      console.log(missatgesCanvis);
      await refresh();
      emit("comandaModificada");
    }

    const editarLinia = async() => {
      // Construcció del request i s'obre el modal
      reqEdicio.value = {
        quantitat: liniaSeleccionada.value.quantitat,
        dataSolicitada: liniaSeleccionada.value.dataSolicitada,
        dataPrevistaSortida: liniaSeleccionada.value.dataPrevistaSortida,
      };
      visibleCrearEditarLinia.value = true;
    }

    const callbackEditarLinia = async (quantitat, data, dataPrevistaSortida) => {
      let numLiniaSeleccionada = liniaSeleccionada.value.numero;
      let liniaEditar = {
        linia : numLiniaSeleccionada,
        articleClient : {
          artint : liniaSeleccionada.value.articleClient.artint,
          clicod : liniaSeleccionada.value.articleClient.clicod,
        },
        quantitat : quantitat,
        dataSolicitada : data,
        dataPrevistaSortida : dataPrevistaSortida
      };
      let missatgesCanvis = await carrega(comandesService.modificarLiniaComandaNormalitzat(props.comanda, numLiniaSeleccionada, liniaEditar, liniaSeleccionada.value.versio));
      console.log(missatgesCanvis);
      visibleCrearEditarLinia.value = false;
      await refresh(numLiniaSeleccionada);
      emit("comandaModificada");
    }

    const modalVisible = computed(() => {
      return confirmVisible.value
        || visibleAjudaArticles.value
        || visibleCrearEditarLinia.value
        || visibleModalFixarPreu.value
        || visibleStocks.value
        || visibleReserves.value
        || visibleCanviarAdresa.value
        || visibleModalAdjunts.value
        || visibleModalComentarisInterns.value
        || visibleModalComentarisClient.value;
    });

    const actionHandler = (ev, action, permis, execucio = true) => {
      ev.preventDefault();
      if (contextMenu?.value)
          contextMenu.value.visible = false;
      // Només s'executen les accions si es tenen els permisos
      if (permis && !permisosStore.tePermis('COMANDES', permis))
        return;
      // Només s'executen les accions quan hi ha una línia seleccionada
      if (execucio)
        action();
    }

    const actionHandlerLinia = (ev, action, permis, execucio = true) => {
      actionHandler(ev, action, permis, execucio && liniaSeleccionada.value)
    }

    const showContextMenu = (ev) => {
        let selectedOld = selectedIndex.value;
        selectedIndex.value = linies.value.findIndex(l => l.numero == liniaSeleccionada.value.numero);
        if (selectedOld === selectedIndex.value) {
          liniaSeleccionada.value = linies.value[selectedIndex.value];
        }
        contextMenu.value.show(ev.originalEvent);
    }

    const isLiniaServida = computed(() => {
      return liniaSeleccionada.value?.servida;
    });

    const isLiniaPreuFixat = computed(() => {
      return liniaSeleccionada.value?.isPreuFixat;
    });

    const preuFixatCallback = async (preuFixat) => {
      let numLiniaSeleccionada = liniaSeleccionada.value.numero;
      let req = {
        valor : preuFixat,
      };
      await carrega(comandesService.fixarPreuLiniaNormalitzat(props.comanda, numLiniaSeleccionada, req, liniaSeleccionada.value.versio));
      visibleModalFixarPreu.value = false;
      await refresh(numLiniaSeleccionada);
      emit("comandaModificada");
    }

    const desfixarLinia = async() => {
      confirmVisible.value = true;
      if (await confirmacioDesfixar())
        desfixarLiniaAction();
      confirmVisible.value = false;
    }

    const confirmacioDesfixar = async() => {
      return new Promise((resolve) => {
        confirm.require({
          message: t('ComandaNormalitzats.Confirma elimina comanda'),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const desfixarLiniaAction = async() => {
      let numLiniaSeleccionada = liniaSeleccionada.value.numero;
      await carrega(comandesService.desfixarPreuLiniaNormalitzat(props.comanda, numLiniaSeleccionada, liniaSeleccionada.value.versio));
      await refresh(numLiniaSeleccionada);
      emit("comandaModificada");
    }

    const guardarAdresaComanda = (state) => comandesService.canviarAdresaComanda(comandaLoaded.value.comanda, state);

    const adresaChanged = async () => {
      let numLiniaSeleccionada = liniaSeleccionada.value.numero;
      await refresh(numLiniaSeleccionada);
      emit("comandaModificada");
    }

    const updateComentarisInterns = async (text) => {
      await carrega(comandesService.actualitzarComentarisInterns(liniaSeleccionada.value.comanda, liniaSeleccionada.value.numero, text));
      liniaSeleccionada.value.comentarisInterns = text;
    }

    const updateComentarisClient = async (text) => {
      await carrega(comandesService.actualitzarComentarisClient(liniaSeleccionada.value.comanda, liniaSeleccionada.value.numero, text));
      liniaSeleccionada.value.comentarisClient = text;
    }

    const isMonterrey = computed(() => { return comandaLoaded.value.empresa === "MONTERREY"});

    const menuModel = computed(() => {
      let result = [];
      // Edició i eliminació només si la línia no està servida i es tenen permisos d'escriptura
      if (!isLiniaServida.value && permisosStore.tePermis('COMANDES', 'WRITE')) {
        result.push({label: ()=>  `${t('Comandes.Editar linia')} [Enter]`, class:'p-button-text', icon: 'pi pi-pencil', command: () => editarLinia()});
        result.push({label: ()=>  `${t('Comandes.Eliminar linia')} [Ctrl+-]`, class:'p-button-text', icon: 'pi pi-times-circle', command: () => eliminarLinia()});
      }
      result.push({label: ()=>  `${t('Comandes.Edita comentari intern')} [Ctrl+i]`, class:'p-button-text', icon: 'pi pi-comments', command: () => visibleModalComentarisInterns.value = true });
      result.push({label: ()=>  `${t('Comandes.Edita comentari client')} [Ctrl+e]`, class:'p-button-text', icon: 'pi pi-megaphone', command: () => visibleModalComentarisClient.value = true });
      // Desfixar preu manualment
      if (isLiniaPreuFixat.value && permisosStore.tePermis('COMANDES', 'WRITE')) {
        result.push({label: ()=>  `${t('Comandes.Desfirxar preu')} [Ctrl+d]`, class:'p-button-text', icon: 'pi pi-undo', command: () => desfixarLinia()});
      }
      // Fixar preu manualment
      if (permisosStore.tePermis('COMANDES', 'WRITE'))
        result.push({label: ()=>  `${t('Comandes.Fixar preu')} [Ctrl+p]`, class:'p-button-text', icon: 'pi pi-money-bill', command: () => visibleModalFixarPreu.value = true});
      if (liniaSeleccionada.value?.tipusArticleClient !== "ESPECIAL") {
        result.push({label: ()=>  `${t('Comandes.Veure reserves')} [Ctrl+r]`, class:'p-button-text', icon: 'pi pi-book', command: () => visibleReserves.value = true});
      }
      result.push({label: ()=>  `${t('Comandes.Veure stock')} [Ctrl+s]`, class:'p-button-text', icon: 'pi pi-box', command: () => visibleStocks.value = true});
      return result;
    });

    const showNode = async (e) => {
      //Revisar si es pot optimizar mes, ja que ara funciona amb el :dataKey="numero"
      var index = expandedRows.value.indexOf(e);
      if (index !== -1) {
        expandedRows.value.splice(index, 1);
      } else {
        let clau = `${e.numero}`;
        const result = await carrega(comandesService.albaransFacturesLiniaComanda(e.comanda, e.numero));
        liniesExpand.value[clau] = result;
        expandedRows.value.push(e);
      }
      liniaSeleccionada.value = e;
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    return {
      props,
      permisosStore,
      visible,
      contextMenu,
      selectedIndex,
      menuModel,
      showContextMenu,
      numLinies,
      numLiniesServides,
      isMostrarServides,
      visibleAjudaArticles,
      visibleCrearEditarLinia,
      visibleModalFixarPreu,
      visibleStocks,
      visibleReserves,
      visibleCanviarAdresa,
      visibleModalAdjunts,
      visibleModalComentarisInterns,
      visibleModalComentarisClient,
      callbackArticleSeleccionat,
      callbackEditarLinia,
      updateComentarisInterns,
      updateComentarisClient,
      isMonterrey,
      preuFixatCallback,
      reqEdicio,
      editarLinia,
      hide,
      comandaLoaded,
      clientLoaded,
      linies,
      liniaSeleccionada,
      adresaChanged,
      guardarAdresaComanda,
      refresh,
      showNode,
      expandedRows,
      liniesExpand,
      valorFiltreReferencia,
      inputFiltreReferencia,
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

  ::v-deep(.estilRow:hover .ocultable) {
    display: flex;
  }

  ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
    padding: 0.1rem 0.2rem;
  }

  ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
    padding: 0.1rem 0.2rem;
  }
</style>