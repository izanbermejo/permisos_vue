<template>
  <AjudaClient :visible="visibleAjudaClients" @update:carregat="visibleAjudaClients = false" :seleccioCallback="callbackClientSeleccionat"  />
  <CalculadoraNormalitzats v-if="visibleCalculadora" :carregat="visibleCalculadora" @update:carregat="visibleCalculadora = $event"
    :client="clientSel" :tarifes="tarifesClient" @comandaCreada="comandaCreada"/>
  <CalculadoraTarifesPeces v-if="visibleCalculadoraTarifes" :carregat="visibleCalculadoraTarifes" @update:carregat="visibleCalculadoraTarifes = $event"
    :client="clientSel" :tarifes="tarifesClient"/>
  <DetallComandaNormalitzats v-if="visibleDetallComanda" :carregat="visibleDetallComanda" @update:carregat="visibleDetallComanda = $event"
    :comanda="comandaSeleccionada" @comandaModificada="gridComandes.performSearch(comandaSeleccionada)" />
  <CanviarAdresa v-if="visibleCanviarAdresa" :carregat="visibleCanviarAdresa"  @update:carregat="visibleCanviarAdresa = $event"
    :adresa="comandaLoaded.adresa" :informacioEnviament="comandaLoaded.informacioEnviament"
    :codiClient="comandaLoaded.codiClient" :onGuardar="guardarAdresaComanda" :callbackOk="adresaChanged" />
  <CanviarNom v-if="visibleCanviarNom" :carregat="visibleCanviarNom"  @update:carregat="visibleCanviarNom = $event"
    :nom="nomComanda" :callback="canviarNomCallBack" />
  <AjudaPrevisualitzarJustificant v-if="visiblePrevisualitzarJustificant" :carregat="visiblePrevisualitzarJustificant"  
    @update:carregat="visiblePrevisualitzarJustificant = $event" 
    :client="clientSel" :comanda="comandaSeleccionada"/>
  <EnviarJustificant v-if="visibleEnviarJustificant" :carregat="visibleEnviarJustificant"  
    @update:carregat="visibleEnviarJustificant = $event" 
    @justificantEnviat="justificantEnviat"
    :client="clientSel" :comanda="comandaLoaded"/>
  <EnviarJustificantComandaEspecial v-if="visibleEnviarJustificantEspecial" :carregat="visibleEnviarJustificantEspecial"  
    @update:carregat="visibleEnviarJustificantEspecial = $event" 
    @justificantEnviat="justificantEnviat"
    :client="clientSel" :comanda="comandaLoaded.comanda" :comandaClient="comandaLoaded.comandaClient"/>
  <PrevisualitzarJustificantComandaEspecial v-if="visiblePrevisualitzarJustificantEspecial" :carregat="visiblePrevisualitzarJustificantEspecial"  
    @update:carregat="visiblePrevisualitzarJustificantEspecial = $event" 
    @justificantEnviat="justificantEnviat"
    :client="clientSel" :comanda="comandaLoaded.comanda" :comandaClient="comandaLoaded.comandaClient"/>
  <DetallJustificantEnviat v-if="visibleDetallJustificantEnviat" :carregat="visibleDetallJustificantEnviat"  
    @update:carregat="visibleDetallJustificantEnviat = $event" 
    :comanda="comandaLoaded"/>
  <ComandesNormServides v-if="visibleConsultaServides" :carregat="visibleConsultaServides"
    @update:carregat="visibleConsultaServides = $event"
    :codiClient="clientSel.clicod" />
  <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :comanda="comandaSeleccionada"
    @update:numAdjunts="gridComandes.updateAdjunts($event)" />
  <EditorComentaris v-if="visibleModalNotesClient" :carregat="visibleModalNotesClient" @update:carregat="visibleModalNotesClient = $event;"
    :text="clientSel.notesClient" :callback="updateNotesClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalNotesLog" :carregat="visibleModalNotesLog" @update:carregat="visibleModalNotesLog = $event;"
    :text="clientSel.notesLogistica" :callback="updateNotesLogistica" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalNotesMorositat" :carregat="visibleModalNotesMorositat" @update:carregat="visibleModalNotesMorositat = $event;"
    :text="clientSel.notesMorositat" :callback="updateNotesMorositat" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleComentarisComanda" :carregat="visibleComentarisComanda" @update:carregat="visibleComentarisComanda = $event;"
    :text="comentarisInternComanda" :callback="updateComentarisComanda" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <ComentarisInternsClient v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
    :text="comentarisInternClient" :clicod="clientSel.clicod" :callback="updateComentariInternClient" />
  <InfoGeneralClient v-if="visibleInfoGeneralClient" :carregat="visibleInfoGeneralClient" @update:carregat="visibleInfoGeneralClient = $event;"
    :clicod="clientSel.clicod"/>
  <ModalExportarDetallComandesClient v-if="visibleModalExportarDetallComandesClient" :carregat="visibleModalExportarDetallComandesClient" @update:carregat="visibleModalExportarDetallComandesClient = $event;" :client="clientSel.clicod"/>
  <ModalAdjuntsClient v-if="visibleModalAdjuntsClient" :carregat="visibleModalAdjuntsClient" @update:carregat="visibleModalAdjuntsClient = $event;" :client="clientSel.clicod" :nomClient="clientSel.nom"/>
  <div class="card">
    <h5 class="card-header" style="display: flex; align-items: center; gap: 8px; flex-wrap: nowrap;">
      <!-- Títol fix -->
      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
        <i class="pi pi-arrow-left icona-boto" @click="emit('update:opcio', 'OpcionsComandes')" v-tooltip="$t('App.Tornar')"></i>
        <font-awesome-icon icon="fa-solid fa-ring" style="font-size: 1.25rem" />
        <span>{{ $t('App.Comandes normalitzats') }}</span>
      </div>
      <!-- Zona client: s'adapta al contingut i pot encongir (trunca el nom) -->
      <div v-if="clientSel" style="display: flex; align-items: center; gap: 5px; flex: 0 1 auto; min-width: 0;">
        <template v-if="!isClientSelMedical">
          <span v-if="clientSel.isClientWeb" class="infoClient web" style="flex-shrink: 0;">
            <font-awesome-icon icon="fa-solid fa-laptop-code" style="font-size: 1rem" />
            <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">Web</span>
          </span>
          <span v-else-if="clientSel.isSuministramentIndustrial" class="infoClient suministrament" style="flex-shrink: 0;">
            <font-awesome-icon icon="fa-solid fa-store-slash" style="font-size: 1rem" />
            <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">No distribuiïdor</span>
          </span>
        </template>
        <span v-if="clientSel.estatClient !== 'A'" class="infoClient inactiu" style="flex-shrink: 0;">
          <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1rem" />
          <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('ModalAjudaArticleClient.I')}}</span>
        </span>
        <span v-if="clientSel.isImpagament" class="infoClient inactiu" style="flex-shrink: 0;">
          <font-awesome-icon icon="fa-solid fa-solid fa-money-bill-1-wave" style="font-size: 1rem" />
          <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('ModalAjudaArticleClient.Impagament')}}</span>
        </span>
        <span v-if="clientSel.isClientProforma" class="infoClient proforma" style="flex-shrink: 0;">
          <font-awesome-icon icon="fa-solid fa-file-invoice" style="font-size: 1rem" />
          <span style="font-size: 16px; font-weight: 500; margin-left: 3px;">{{$t('Comandes.Client proforma')}}</span>
        </span>
        <!-- Nom client truncable amb tooltip -->
        <span v-tooltip="clientSel.nom" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">
          {{ `${clientSel.clicod} - ${clientSel.nom}` }}
        </span>
        <!-- Botó 3 punts just al costat del nom -->
        <Button icon="pi pi-ellipsis-v" @click="openMenuOpcionsClient" class="botoveurestock"
          style="flex-shrink: 0; font-size: 0.8rem; width: 12px; height: 22px;" />
        <ContextMenu :model="opcionsClient" ref="menuClient" :style="{ minWidth: 'auto', width: 'max-content' }"/>
        <font-awesome-icon :icon="teComentaris ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-comments'"
          :style="{ fontSize: '1.25rem', cursor: 'pointer', color: teComentaris ? 'orange' : 'inherit', flexShrink: 0 }"
          @click="mostrarComentariIntern(clientSel.comentariInternClient)" v-tooltip="$t('App.Mostrar comentario')" />
      </div>
      <!-- Botons d'acció: margin-left:auto els empeny a la dreta, l'espai sobrant queda entre el nom i els botons -->
      <div v-if="clientSel" style="margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 20px;">
        <ButtonShortcut @click="visibleAjudaClients = true" icon="fa-solid fa-retweet" :literal="$t('Comandes.Canvi client')" :shortcut="'[Ctrl+0]'"/>
        <ButtonShortcut @click="visibleConsultaServides = true" icon="fa-solid fa-truck" :literal="$t('Comandes.Consultar servides')" :shortcut="'[Ctrl+1]'"/>
        <ButtonShortcut :literal="$t('Comandes.Calculadora')" @click="visibleCalculadoraTarifes = true" icon="fa-solid fa-calculator" :shortcut="'[Ctrl+p]'"/>
      </div>
    </h5>
    <div class="card-body">
      <div v-show="!clientSel" style="width: 100%; text-align: center;">
        <div>
          <font-awesome-icon icon="fa-solid fa-info" style="font-size: 2.5rem;" />
        </div>
        <div style="margin-top: 5px;">
          <span style="font-size: larger; font-weight: 400;">{{ $t('Comandes.Informacio inici normalitzats') }}</span>
          <div style="margin-top: 5px;">
            <ButtonShortcut @click="visibleAjudaClients = true" :icon="'fa-solid fa-filter'" 
              :literal="$t('Comandes.Filtra clients')" :shortcut="'[Ctrl+0]'"/>
          </div>
        </div>
      </div>
      <DetallClient :client="clientSel"
        @showNotesClient="visibleModalNotesClient = true"
        @showNotesLogistica = "visibleModalNotesLog = true"
        @showNotesMorositat = "visibleModalNotesMorositat = true" />
      <div v-if="clientSel" class="card" style="margin-top: 10px;" >
        <h5 class="card-header">
          {{ $t('Comandes.Comandes pendents de servir') }}
          <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')"
            :literal="$t('Comandes.Afegeix comanda')" @click="clientSel.estatClient === 'A' ? visibleCalculadora = true : errorAfegirComanda()"
            icon="fa-solid fa-file-circle-plus" :shortcut="'[+]'" style="margin-left: 50px;"/>
          <ButtonShortcut :literal="$t('Comandes.Recarrega')" @click="recarregaGridComandes()"
            icon="fa-solid fa-retweet" :shortcut="'[Ctrl+r]'" style="margin-left: 50px;"/>
        </h5>
        <div class="card-body">
          <GridComandesNorm ref="gridComandes" :client="clientSel.clicod" :modalParentObert="modalVisible"
            @showDetall="showDetallComanda($event)"
            @canviarAdresa="canviarAdresa($event)"
            @canviarNom="canviarNom($event)"
            @previsualitzarJustificant="previsualitzarJustificant($event)"
            @enviarJustificant="enviarJustificant($event)"
            @cancelarComanda="cancelarComanda($event)"
            @mostrarDetallEnviamentJustificant="mostrarDetallEnviamentJustificant($event)"
            @mostrarAdjunts="mostrarAdjunts($event)"
            @mostrarComentaris="mostrarComentaris($event)"
            @update:totalDadesResum="onUpdateTotalDadesResum($event)"
            />
        </div>
      </div>
      <div v-if="clientSel" class="card" style="margin-top: 10px;">
        <h6 class="card-header" style="font-weight: 600;">
          {{ $t('Comandes.Resum comanda') }}
        </h6>
        <div class="card-body">
         <div class="flex-container" style="font-size: larger; font-weight: 600; float: left;">
            <span> 
              <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;" />
              <label class="label-detall"> {{ `${$t('Comandes.Import')}:` }} </label>
              <span v-if="refResum.numLinies > 0">
                {{ `${$n(refResum.importNet, 'decimal')} ${refResum.divisa}` }}
                {{ `(${$t('Comandes.Brut')} ${$n(refResum.importBrut, 'decimal')} ${refResum.divisa})` }}
              </span>
              <span v-else>-</span>
            </span>
            <span> 
              <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
              <label class="label-detall"> {{ `${$t('Comandes.Pes')}: ` }} </label>  
              <span v-if="refResum.numLinies > 0">{{ `${$n(refResum.pes,'decimal')} Kg.` }}</span>
              <span v-else>-</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, inject} from 'vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import comandesService from "@/services/comandes.service";
import { carrega } from '@/services/loader';
import CalculadoraNormalitzats from '@/views/modals/calculadora/CalculadoraNormalitzats.vue';
import DetallComandaNormalitzats from '@/views/modals/detallnormalitzats/DetallComandaNormalitzats.vue';
import AjudaClient from '@/views/modals/AjudaClient.vue';
import DetallClient from './DetallClient.vue';
import GridComandesNorm from './GridComandesNorm.vue';
import CanviarAdresa from '@/views/modals/canviaradresa/CanviarAdresa.vue';
import CanviarNom from '@/views/modals/ModalModificarNom.vue';
import AjudaPrevisualitzarJustificant from '@/views/modals/justificant/AjudaPrevisualitzarJustificant.vue';
import EnviarJustificant from '@/views/modals/justificant/EnviarJustificant.vue';
import DetallJustificantEnviat from '@/views/modals/justificant/DetallJustificantEnviat.vue';
import ComandesNormServides from '@/views/modals/comandesnormservides/ComandesNormServides.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import InfoGeneralClient from '@/views/modals/InfoGeneralClient.vue';
import i18n from '@/i18n/i18n';
import { useConfirm } from 'primevue/useconfirm';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import ComentarisInternsClient from '@/views/modals/ComentarisInternsClient.vue';
import Swal from 'sweetalert2';
import { usePermisosStore } from '@/stores/permisos';
import CalculadoraTarifesPeces from '@/views/modals/calculadora/CalculadoraTarifesPeces.vue';
import { setTimeout } from 'core-js';
import EnviarJustificantComandaEspecial from '@/views/modals/justificant/EnviarJustificantComandaEspecial.vue';
import PrevisualitzarJustificantComandaEspecial from '@/views/modals/justificant/AjudaPrevisualitzarJustificantComandaEspecial.vue';
import ModalExportarDetallComandesClient from '@/views/modals/ModalExportarDetallComandesClient.vue';
import ModalAdjuntsClient from '@/views/modals/ModalAdjuntsClient.vue';

export default {
  name: 'ComandesNorm',
  components : {
    AjudaClient,
    CalculadoraNormalitzats,
    DetallComandaNormalitzats,
    DetallClient,
    GridComandesNorm,
    CanviarAdresa,
    CanviarNom,
    AjudaPrevisualitzarJustificant,
    EnviarJustificant,
    DetallJustificantEnviat,
    ComandesNormServides,
    ModalAdjuntsComandes,
    EditorComentaris,
    ComentarisInternsClient,
    CalculadoraTarifesPeces,
    EnviarJustificantComandaEspecial,
    PrevisualitzarJustificantComandaEspecial,
    InfoGeneralClient,
    ModalExportarDetallComandesClient,
    ModalAdjuntsClient,
  },
  setup ( props, {emit} ) {
    const { t, d } = i18n.global;
    const toDate = inject('toDate');
    const permisosStore = usePermisosStore();
    const gridComandes = ref();
    const clientSel = ref();
    const isClientSelMedical = computed(() => clientSel.value.empresa === 'D0');
    const tarifesClient = ref();
    const confirm = useConfirm();
    const visibleAjudaClients = ref(false);
    const visibleConsultaServides = ref(false);
    const visibleCalculadora = ref(false);
    const visibleDetallComanda = ref(false);
    const visibleCanviarAdresa = ref(false);
    const visibleCanviarNom = ref(false);
    const visiblePrevisualitzarJustificant = ref(false);
    const visibleEnviarJustificant = ref(false);
    const visibleEnviarJustificantEspecial = ref(false);
    const visiblePrevisualitzarJustificantEspecial = ref(false);
    const visibleDetallJustificantEnviat = ref(false);
    const visibleModalAdjunts = ref(false);
    const visibleModalNotesClient = ref(false);
    const visibleModalNotesLog = ref(false);
    const visibleModalNotesMorositat = ref(false);
    const visibleComentarisComanda = ref(false);
    const visibleModalComentarisInterns = ref(false);
    const visibleCalculadoraTarifes = ref(false);
    const visibleInfoGeneralClient = ref(false);
    const visibleModalExportarDetallComandesClient = ref(false);
    const visibleModalAdjuntsClient = ref(false);
    const menuClient = ref();
    const comentarisInternComanda = ref();
    const comentarisInternClient = ref();
    const confirmVisible = ref(false);
    const comandaSeleccionada = ref();
    const nomComanda = ref();
    const comandaLoaded = ref();
    const divisasTotal = ref([]);
    const refResum = ref({});
    const teComentaris = computed(() => (
        clientSel.value.comentariInternClient
      ));

    onMounted(() => {
      document.addEventListener("keydown", handler);
      visibleAjudaClients.value = true;
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const recarregaGridComandes = () => {
      carrega(gridComandes.value.performSearch());
    };

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // No processem l'event en cas que hagi un modal visible
      if (modalVisible.value) return;
      // Controls
      if (ev.key=='Escape') {
        // Escape per tornar enrere
        actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
      } else if (ev.ctrlKey && ev.key=="0") { // Ctrl + 0
        actionHandler(ev, () => visibleAjudaClients.value = true);
      } else if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
        actionHandler(ev, () => visibleConsultaServides.value = true);
      } else if (ev.key=='+') { // + (Crear comanda)
        if (clientSel.value.estatClient === 'A') {
          actionHandler(ev, () => visibleCalculadora.value = true, 'WRITE');
        } else {
          errorAfegirComanda();
        }
      } else if (ev.ctrlKey && ev.keyCode==82) { // r (Recarregar)
        actionHandler(ev, () => recarregaGridComandes());
      } else if (ev.ctrlKey && ev.keyCode==80) { // p (Obre calculadora)
        actionHandler(ev, () => visibleCalculadoraTarifes.value = true);
      }
    }
  
    const actionHandler = (ev, action, permis) => {
      ev.preventDefault();
      // Comprovem permisos si s'escau
      if (permis && !permisosStore.tePermis('COMANDES', permis)) 
        return;
      action(); 
    }

    const modalVisible = computed(() => {
      return confirmVisible.value
            || visibleAjudaClients.value
            || visibleConsultaServides.value
            || visibleCalculadora.value
            || visibleDetallComanda.value
            || visibleCanviarAdresa.value
            || visibleCanviarNom.value
            || visiblePrevisualitzarJustificant.value
            || visibleEnviarJustificant.value
            || visibleEnviarJustificantEspecial.value
            || visiblePrevisualitzarJustificantEspecial.value
            || visibleDetallJustificantEnviat.value
            || visibleModalAdjunts.value
            || visibleModalNotesClient.value
            || visibleModalNotesLog.value
            || visibleModalNotesMorositat.value
            || visibleComentarisComanda.value
            || visibleModalComentarisInterns.value
            || visibleCalculadoraTarifes.value
            || visibleInfoGeneralClient.value
            || visibleModalExportarDetallComandesClient.value
            || visibleModalAdjuntsClient.value;
    });

    const callbackClientSeleccionat = async (c) => {
      visibleAjudaClients.value = false;
      // Càrrega de client i les seves tarifes que li apliquen actualment
      clientSel.value = await(carrega(comandesService.obtenirClient(c.codi)));
      tarifesClient.value = await(carrega(comandesService.obtenirTarifesActual(c.codi)));
      if (clientSel.value.estatClient !== "A") {
        mostraToastClientInactiu();
      }
      if (clientSel.value.isImpagament) {
        mostrarAvisImpagament();
      }
      nextTick(() => {
        if (teComentaris.value){
          visibleModalComentarisInterns.value = true;
          updateComentariInternClient(c.codi);
        }
        gridComandes.value.performSearch();
      });
      // Es mostren els toast segons el tipus de client
      mostraToastByTipus();
    }

    const mostraToastByTipus = async () => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        width: 400,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      if (clientSel.value.isClientWeb) {
        await Toast.fire({
          icon: "warning",
          iconColor : "#000000",
          color : "#000000",
          title: t('Comandes.Atencio client web'),
          background: "#c8a2c8"
        });
      } else if (clientSel.value.isSuministramentIndustrial) {
        await Toast.fire({
          icon: "warning",
          iconColor : "#000000",
          color : "#000000",
          title: t('Comandes.Atencio client suminsitrament'),
          background: "#9ef394"
        });
      }
      if (clientSel.value.isClientProforma) {
        await mostraToastClientProforma();
      }
    }

    const mostraToastClientProforma = () => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        width: 400,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      return Toast.fire({
        icon: "warning",
        iconColor: "#000000",
        color: "#000000",
        title: t('Comandes.Atencio client proforma'),
        background: "#ffc107"
      });
    }

    const mostraToastClientInactiu = async () => {
      const Toast = Swal.mixin({
        toast: true,
        position: "top",
        showConfirmButton: false,
        width: 400,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "warning",
        iconColor : "#ffffff",
        color : "#ffffff",
        title: t('Comandes.Atencio client inactiu'),
        background: "#ff1200"
      });
    }

    const errorAfegirComanda = () => {
      Swal.fire({
        allowOutsideClick : false,
        didOpen: () => Swal.getConfirmButton().focus(),
        icon: 'warning',
        title: t('App.Atencio'),
        text: t('Comandes.Client no esta actiu')
      });
    }

    const mostrarAvisImpagament = () => {
      Swal.fire({
        allowOutsideClick : false,
        didOpen: () => Swal.getConfirmButton().focus(),
        icon: 'warning',
        title: t('App.Atencio'),
        text: t('Comandes.Atencio client impagament')
      });
    } 

    const showDetallComanda = (comanda) => {
      comandaSeleccionada.value = comanda;
      visibleDetallComanda.value = true;
    }

    const canviarAdresa = async (comanda) => {
      comandaSeleccionada.value = comanda;
      comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(comanda));
      visibleCanviarAdresa.value = true;
    }

    const guardarAdresaComanda = (state) => comandesService.canviarAdresaComanda(comandaLoaded.value.comanda, state);

    const adresaChanged = async() => {
      nextTick(() => {
        gridComandes.value.performSearch(comandaSeleccionada.value);
      });
    }

    const canviarNom = async (idComanda) => {
      let comandaNorm = await carrega(comandesService.obtenirComandaNormalitzat(idComanda));
      comandaLoaded.value = idComanda;
      nomComanda.value = comandaNorm.comandaClient;
      visibleCanviarNom.value = true;
    }

    const canviarNomCallBack = async(nomNou) => {
      if(await comprovarExisteixComandaClient(nomNou)){
        await carrega(comandesService.canviarNomComandaNormalitzat(comandaLoaded.value, nomNou));
        visibleCanviarNom.value = false;
        nextTick(() => {
          setTimeout(() => {
            gridComandes.value.performSearch(comandaLoaded.value);
          }, 100);
        });
      }
    }

    const comprovarExisteixComandaClient = async(nomNou) => {
      if (!nomNou.trim()) return;
      // En cas que s'hagi informat la comanda es comprova si existeix ja una amb el mateix nom
      let comanda = await(carrega(comandesService.obtenirComandaNormalitzatPerComandaClient(clientSel.value.clicod, nomNou.trim(), clientSel.value.empresa)));
      if (comanda) {
        // En cas que existeixi una comanda amb el mateix nom s'ha de preguntar per la confirmació
        if (await(confirmacioComandaExistent(comanda))) return true;
        confirmVisible.value = false;
      } else {
        return true;
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

    const previsualitzarJustificant = async (comanda) => {
      if (await teEspecials(comanda)) {
        visiblePrevisualitzarJustificantEspecial.value = true;
      } else {
        visiblePrevisualitzarJustificant.value = true;
      }
    }
    
    const enviarJustificant = async (comanda) => {
      if (await teEspecials(comanda)) {
        visibleEnviarJustificantEspecial.value = true;
      } else {
        visibleEnviarJustificant.value = true;
      }
    }

    const teEspecials = async (comanda) => {
      comandaSeleccionada.value = comanda;
      comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(comanda));
      return comandaLoaded.value.isConteLiniesPecesEspecials;
    }

    const justificantEnviat = async() => {
      nextTick(() => {
        gridComandes.value.performSearch(comandaSeleccionada.value);
      });
    }

    const cancelarComandaConfirmacio = async () => {
      return new Promise((resolve) => {
        confirm.require({
          message: t('Comanda.Confirma cancelar comanda'),
          header: t('App.Confirmacio'),
          icon: 'pi pi-exclamation-triangle',
          accept: () => resolve(true),
          reject: () => resolve(false),
          onHide: () => resolve(false),
        })
      });
    }

    const cancelarComanda = async(numComanda) => {
      confirmVisible.value = true;
      if (await cancelarComandaConfirmacio()) {
        await carrega(comandesService.cancelarComandaNormalitzat(numComanda));
        gridComandes.value.performSearch();
      }
      confirmVisible.value = false;
    }

    const comandaCreada = async(novaComanda) => {
      gridComandes.value.performSearch();
      // Pels clients de Medical o Web no cal mostrar el dialeg d'enviament de justificant
      if (!(isClientSelMedical.value || clientSel.value.isClientWeb))
        enviarJustificant(novaComanda);
    }

    const mostrarDetallEnviamentJustificant = async (comanda) => {
      comandaSeleccionada.value = comanda;
      comandaLoaded.value = await carrega(comandesService.obtenirComandaNormalitzat(comanda));
      visibleDetallJustificantEnviat.value = true;
    }

    const mostrarAdjunts = async (comanda) => {
      comandaSeleccionada.value = comanda;
      visibleModalAdjunts.value = true;
    }

    const mostrarComentaris = async(rowComanda) => {
      comandaSeleccionada.value = rowComanda.comanda;
      comentarisInternComanda.value = rowComanda.comentariIntern;
      visibleComentarisComanda.value = true;
    }

    const updateComentarisComanda = async (text) => {
      await carrega(comandesService.actualitzarComentarisComanda(comandaSeleccionada.value, text.trim()));
      gridComandes.value.updateComentaris(text.trim());
    }

    const updateComentariInternClient = async (codi) => {
      clientSel.value = await(carrega(comandesService.obtenirClient(codi)));
      comentarisInternClient.value = clientSel.value.comentariInternClient;
    }

    const updateNotesClient = async (text) => {
      await carrega(comandesService.actualitzarNotesClient(clientSel.value.clicod, text));
      clientSel.value.notesClient = text;
    }

    const updateNotesLogistica = async (text) => {
      await carrega(comandesService.actualitzarNotesLogistica(clientSel.value.clicod, text));
      clientSel.value.notesLogistica = text;
    }

    const updateNotesMorositat = async (text) => {
      await carrega(comandesService.actualitzarNotesMorositat(clientSel.value.clicod, text));
      clientSel.value.notesMorositat = text;
    }

    const mostrarComentariIntern = async (text) => {
      visibleModalComentarisInterns.value = true;
      comentarisInternClient.value = text;
    }

    const onUpdateTotalDadesResum = (resum) => {
      refResum.value = resum;
    }

    const opcionsClient = ref([
      { label: t('Comandes.Info general client'), icon: 'pi pi-info-circle', command: () => visibleInfoGeneralClient.value = true },
      { label: t('ModalAdjuntsClient.Titol'), icon: 'pi pi-paperclip', command: () => visibleModalAdjuntsClient.value = true },
      { label: t('Comandes.Exportar detall comandes client'), icon: 'pi pi-file-excel', command: () => visibleModalExportarDetallComandesClient.value = true },
    ]);

    const openMenuOpcionsClient = (event) => {
      menuClient.value.show(event);
    };

    const truncate = (str, max) => {
      if (!str) return '';
      return str.length > max ? str.slice(0, max) + '…' : str;
    };

    return {
      props,
      emit,
      permisosStore,
      clientSel,
      isClientSelMedical,
      tarifesClient,
      gridComandes,
      visibleAjudaClients,
      callbackClientSeleccionat,
      visibleConsultaServides,
      visibleCalculadora,
      visibleDetallComanda,
      visibleCanviarAdresa,
      visibleCanviarNom,
      visiblePrevisualitzarJustificant,
      visibleEnviarJustificant,
      visibleEnviarJustificantEspecial,
      visiblePrevisualitzarJustificantEspecial,
      visibleDetallJustificantEnviat,
      visibleModalAdjunts,
      visibleModalNotesClient,
      visibleModalNotesLog,
      visibleModalNotesMorositat,
      visibleComentarisComanda,
      visibleModalComentarisInterns,
      visibleInfoGeneralClient,
      visibleModalExportarDetallComandesClient,
      visibleModalAdjuntsClient,
      comentarisInternComanda,
      comentarisInternClient,
      showDetallComanda,
      canviarAdresa,
      canviarNom,
      adresaChanged,
      guardarAdresaComanda,
      previsualitzarJustificant,
      enviarJustificant,
      justificantEnviat,
      cancelarComanda,
      mostrarDetallEnviamentJustificant,
      mostrarAdjunts,
      mostrarComentaris,
      updateNotesClient,
      updateNotesLogistica,
      updateNotesMorositat,
      updateComentarisComanda,
      comandaSeleccionada,
      comandaLoaded,
      comandaCreada,
      modalVisible,
      recarregaGridComandes,
      mostrarComentariIntern,
      updateComentariInternClient,
      errorAfegirComanda,
      visibleCalculadoraTarifes,
      teComentaris,
      canviarNomCallBack,
      nomComanda,
      divisasTotal,
      refResum,
      onUpdateTotalDadesResum,
      truncate,
      openMenuOpcionsClient,
      opcionsClient,
      menuClient,
    }

  }
}
</script>

<style scoped>
  .icona-boto {
    margin-right: 15px;
    display: inline-block;
    border-radius: 5px;
    box-shadow: 0 0 2px #888;
    padding: 0.5em 0.6em;
    font-size:  0.8rem;
    cursor: pointer;
  }

  .infoClient {
    border-radius: 8px;
    background-color: #c8a2c8;
    padding: 2px 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .inactiu {
    background-color: red;
    color: white;
  }

  .web {
    background-color: #c8a2c8;
  }

  .suministrament {
    background-color: #9ef394;
  }

  .proforma {
    background-color: #ffc107;
    color: black;
  }

  .flex-container {
    padding: 0px 5px; 
    display: flex;
    gap: 75px;
    color: #495057;
  }

  .label-detall {
    margin-right: 5px;
  }

</style>