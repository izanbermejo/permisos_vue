<template>
    <AjudaArticleClient :visible="visibleAjudaArticles" @update:carregat="visibleAjudaArticles = false"
      :client="comandaLoaded?.codiClient"
      :seleccioCallback="callbackArticleSeleccionat" />
    <CrearEditarLiniaComanda v-if="visibleCrearLinia" :carregat="visibleCrearLinia" @update:carregat="visibleCrearLinia = $event"
        :callbackGuardarOk="liniaCreada" 
        :comanda="refComanda" 
        :comandaClient="comandaLoaded.comandaClient"
        :programa="comandaLoaded.programa"
        :infoArticle="infoArticle" />
    <CanviarAdresa v-if="visibleCanviarAdresa" :carregat="visibleCanviarAdresa"  @update:carregat="visibleCanviarAdresa = $event"
        :adresa="comandaLoaded.adresa" :informacioEnviament="comandaLoaded.informacioEnviament"
        :codiClient="comandaLoaded.codiClient" :onGuardar="guardarAdresaComanda" :callbackOk="adresaChanged" />
    <ModalAdjuntsComandes v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
      :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
      @update:carregat="visibleModalAdjunts = $event" :comanda="comandaLoaded.comanda" />
    <NovaComandaTraspas v-if="visibleNouTraspas" :carregat="visibleNouTraspas" @update:carregat="visibleNouTraspas = $event"
      :callbackOk="traspassarComanda" :obtenirComandaExistent="obtenirComandaExistent"/>
    <EnviarJustificantComandaEspecial v-if="visibleEnviarJustificant" :carregat="visibleEnviarJustificant"  
      @update:carregat="visibleEnviarJustificant = $event" 
      @justificantEnviat="justificantEnviat"
      :client="infoClient" :comanda="comandaLoaded.comanda" :comandaClient="comandaLoaded.comandaClient"/>
    <ModalExportarDetallComanda v-if="visibleModalExportarDetall" :carregat="visibleModalExportarDetall"
      @update:carregat="visibleModalExportarDetall = $event" :comanda="refComanda"/>
    <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :header="' '"
      style="width: 1450px">
      <template #header>
        <div style="font-size: larger; font-weight: 600; float: left;">
          <i class="pi pi-credit-card"></i>
          <span style="margin-left: 10px;"> {{ `${$t('Comandes.Detall comanda')} ${comandaLoaded?.comandaClient}` }}</span>
          <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')" :literal="$t('Comandes.Afegir article')" @click="visibleAjudaArticles = true"
            icon="fa-solid fa-file-circle-plus" :shortcut="'[+]'" style="margin-left: 75px;"/>
          <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')" :literal="$t('Comandes.Canviar adresa')" @click="canviarAdresa" icon="fa-solid fa-location-dot"
            style="margin-left: 50px;"/>
          <ButtonShortcut :literal="$t('Comandes.Veure adjunts')" @click="visibleModalAdjunts = true"
            icon="fa-solid fa-paperclip" style="margin-left: 50px;"/>
          <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')" :literal="$t('Comandes.Traspassar comanda')" @click="mostrarTraspassarComanda"
            icon="fa-solid fa-file-export" style="margin-left: 50px;"/>
          <ButtonShortcut :literal="$t('Comandes.Exportar comanda')" @click="visibleModalExportarDetall = true"
            icon="fa-solid fa-file-excel" style="margin-left: 50px;"/>
        </div>
      </template>
      <div style="margin: 5px 0px 5px 0px;">
        <label style="font-size: large; font-weight: 600;">
          {{ $t('Comandes.Empresa') }}:
        </label>
        <span style="font-size: large; margin-left: 5px;">
          {{ $empresa(comandaLoaded?.empresa) }}
        </span>
      </div>
      <div v-if="comandaLoaded?.programa" style="margin: 5px 0px 5px 0px;">
        <label style="font-size: large; font-weight: 600;">
          {{ $t('Comandes.Programa') }}:
        </label>
        <span style="font-size: large; margin-left: 5px;">
          {{ comandaLoaded?.programa }}
        </span>
      </div>
      <GridArticlesComandaEspecial ref="gridArticles" :modalParentObert="modalVisible" style="margin-top: 10px;"
          @showProgramaArticle="showProgramaArticle($event)" />
      <div style="font-size: larger; font-weight: 600; margin-top: 15px; margin-left: 5px;display: flex; gap: 20px;">
        <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')" :literal="$t('Comandes.Enviar justificant')" @click="enviarJustificant"
          icon="fa-solid fa-envelope" />
        <span v-if="comandaLoaded?.dadesEnviamentJustificant?.data">
          {{ $t('Comandes.Enviat justificant', [$d($toDate(comandaLoaded?.dadesEnviamentJustificant?.data), 'long'), comandaLoaded?.dadesEnviamentJustificant?.usuari]) }}
        </span>
      </div>
      <div class="break" />
      <div class="flex-container" style="font-size: larger; font-weight: 600; float: left; margin-top: 30px; margin-left: 5px;">
        <span> 
          <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
          <label class="label-detall"> {{ `${$t('Comandes.Pes total')}: ` }} </label>  
          <span v-if="comandaLoaded">{{ `${$n(comandaLoaded?.pesTotal, 'decimal')} Kg.` }}</span>
        </span>
        <span> 
          <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
          <label class="label-detall"> {{ `${$t('Comandes.Pes pendent')}: ` }} </label>  
          <span v-if="comandaLoaded">{{ `${$n(comandaLoaded?.pesPendent, 'decimal')} Kg.` }}</span>
        </span>
        <span>
          <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;"/>
          <label class="label-detall">{{ $t('Comandes.Preu total') }}: </label>
         <span v-if="comandaLoaded">{{ `${$n(comandaLoaded?.preuTotal, 'decimal')}` + comandaLoaded?.divisa}}</span>
        </span>
        <span>
          <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;"/>
          <label class="label-detall">{{ $t('Comandes.Preu total pendent')}}: </label>
          <span v-if="comandaLoaded">{{ `${$n(comandaLoaded?.preuPendent, 'decimal')}` + comandaLoaded?.divisa }}</span>
        </span>
      </div>
    </Dialog>
  </template>
  
<script>
import { onMounted, ref, computed, toRef } from "vue";
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import moment from "moment";
import { carrega } from "@/services/loader";
import ComandesService from "@/services/comandes.service";
import GridArticlesComandaEspecial from "./GridArticlesComandaEspecial.vue";
import AjudaArticleClient from '@/views/modals/AjudaArticleClient.vue';
import CrearEditarLiniaComanda from '@/views/modals/CrearEditarLiniaComanda.vue';
import CanviarAdresa from '@/views/modals/canviaradresa/CanviarAdresa.vue';
import ModalAdjuntsComandes from '@/views/modals/ModalAdjuntsComandes.vue';
import NovaComandaTraspas from '@/views/modals/NovaComandaTraspas.vue';
import EnviarJustificantComandaEspecial from '@/views/modals/justificant/EnviarJustificantComandaEspecial.vue';
import { usePermisosStore } from '@/stores/permisos';
import ModalExportarDetallComanda from "../ModalExportarDetallComanda.vue";
  
export default {
  name: "DetallComandaEspecials",
  components: {
    GridArticlesComandaEspecial,
    AjudaArticleClient,
    CrearEditarLiniaComanda,
    CanviarAdresa,
    ModalAdjuntsComandes,
    NovaComandaTraspas,
    EnviarJustificantComandaEspecial,
    ModalExportarDetallComanda,
  },
  props: {
      comanda : Number,
      aclfab : String,
      client : Object,
      state : Object,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const permisosStore = usePermisosStore();
    const gridArticles = ref();
    const refComanda = toRef(props, 'comanda');
    const comandaLoaded = ref();
    const visibleAjudaArticles = ref(false);
    const visibleCrearLinia = ref(false);
    const visibleCanviarAdresa = ref(false);
    const visibleModalAdjunts = ref(false);
    const visibleNouTraspas = ref(false);
    const visibleEnviarJustificant = ref(false);
    const visibleModalExportarDetall = ref(false);
    const articleClient = ref();
    const infoArticle = ref();
    const infoClient = toRef(props, 'client');
    const state = toRef(props, 'state');
    const comandaJustificant = ref();

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      refresh();
    });

    const hide = () => {
      emit("update:carregat", false);
    };

    const modalVisible = computed(() => {
      return visibleAjudaArticles.value
        || visibleCrearLinia.value
        || visibleModalAdjunts.value
        || visibleNouTraspas.value
        || visibleEnviarJustificant.value
        || visibleModalExportarDetall.value;
    });

    const showProgramaArticle = (article) => {
      let articleClient = article + comandaLoaded.value.codiClient;
      emit("showProgramaArticle", articleClient);
    }

    const refresh = async () => {
      comandaLoaded.value = await carrega(ComandesService.obtenirComandaEspecial(refComanda.value));
      gridArticles.value.performSearch(comandaLoaded.value.listArticles, props.aclfab);
    }

    const callbackArticleSeleccionat = async (articleClientParam) => {
      articleClient.value = articleClientParam;
      infoArticle.value = await carrega(ComandesService.obtenirArticleClient(articleClientParam));
      visibleAjudaArticles.value = false;
      visibleCrearLinia.value = true;
    }

    const canviarAdresa = () => {
      visibleCanviarAdresa.value = true;
    }

    const guardarAdresaComanda = (state) => ComandesService.canviarAdresaComanda(comandaLoaded.value.comanda, state);

    const adresaChanged = async () => {
      refresh();
    }

    const liniaCreada = async() => {
      refresh();
    }

    const mostrarTraspassarComanda = () => {
      visibleNouTraspas.value = true;
    }

    const traspassarComanda = async(resp) => {
        let request = {
          ...resp,
          data : resp.data ? moment(resp.data).format('YYYY-MM-DD') : null,
        }
        refComanda.value = await carrega(ComandesService.traspassarComanda(refComanda.value, request));
        visibleNouTraspas.value = false;
        await refresh();
        emit("comandaTraspassada");
      }

    const obtenirComandaExistent = async(comandaParam) => {
      return await carrega(ComandesService.obtenirComandaEspecialPercomandaClient(
          comandaLoaded.value.codiClient,
          comandaParam
        ));
    }

    const enviarJustificant = async (liniaSeleccionada) => {
      comandaJustificant.value = await carrega(ComandesService.liniesComanda(state.value.articleClient, state.value.dataFi, state.value.dataInici, true));
      comandaJustificant.value.linies = comandaJustificant.value.linies.filter(l => l.codi === liniaSeleccionada.codi);
      visibleEnviarJustificant.value = true;
    }

    const handler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      // Controls
      if (ev.key === 'Escape') {
          actionHandler(ev, () => hide());
      } else if (ev.key=='+') { // + (Crear comanda)
        if(permisosStore.tePermis('COMANDES', 'WRITE'))
          actionHandler(ev, () => visibleAjudaArticles.value = true);
      }
    }

    const actionHandler = (ev, action) => {
        ev.preventDefault();
        action();
    }

    return {
      props,
      permisosStore,
      visible,
      hide,
      modalVisible,
      gridArticles,
      refComanda,
      comandaLoaded,
      visibleAjudaArticles,
      visibleCrearLinia,
      visibleCanviarAdresa,
      visibleModalAdjunts,
      visibleNouTraspas,
      visibleModalExportarDetall,
      liniaCreada,
      canviarAdresa,
      adresaChanged,
      guardarAdresaComanda,
      articleClient,
      infoArticle,
      callbackArticleSeleccionat,
      showProgramaArticle,
      mostrarTraspassarComanda,
      traspassarComanda,
      obtenirComandaExistent,
      infoClient,
      enviarJustificant,
      visibleEnviarJustificant,
      comandaJustificant
    }

  },
}
</script>
  
  
<style scoped>
  ::v-deep(.p-panel-header) {
    padding: 0.5rem;
  }

  ::v-deep(.p-panel .p-panel-content) {
    padding: 0rem 0.5rem 0.5rem 0.5rem;
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
    font-size: 1rem;
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .flex-container {
    padding: 0px 5px; 
    display: flex;
    gap: 75px;
  }

  .label-detall {
    margin-right: 5px;
  }
</style>