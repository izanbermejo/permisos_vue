<template>
  <AjudaStocks v-if="visibleAjudaStocks" :carregat="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
      :artint="propostaSeleccionada.artint" :clicod="propostaSeleccionada.clicod" />
  <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
    :text="propostaSeleccionada.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
    :text="propostaSeleccionada.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalNotesEmbalatge" :carregat="visibleModalNotesEmbalatge" @update:carregat="visibleModalNotesEmbalatge = $event;"
    :text="propostaSeleccionada.notesEmbalatge" :callback="updateNotesEmbalatge" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false"
    :style="{ width: '85vw', maxHeight: '95vh', overflow: 'auto' }">
    <template #header>
      <div style="width: 100%;">
        <span style="float: left;">
          <font-awesome-icon v-if="resumClientRef.isBloquejat" icon="fa-solid fa-lock" style="font-size: 1.1rem" />
          <span style="font-size: larger; font-weight: 600; margin-left: 5px;">
            {{ `${resumClientRef.clientCodi} - ${resumClientRef.clientNom}` }}
          </span>
        </span>
      </div>
    </template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
    <div id="elementGridPropostes">
      <DataTable :value="propostesRef" class="p-datatable-sm"
              :dataKey="codiNumeroFormat"
              style="margin-top: 10px;"
              :scrollable="true" scrollHeight="60vh" scrollDirection="both"
              :resizableColumns="true" columnResizeMode="expand"
              showGridlines 
              contextMenu v-model:contextMenuSelection="propostaSeleccionada" @rowContextmenu="showContextMenu($event)"
              v-model:selection="propostaSeleccionada" selectionMode="single"
              :rowClass="estilRow"
              @row-select="selectedIndex = $event.index">
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{data}">
            <div style="width: 100%;">
            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="propostaSeleccionada = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Empresa')" :style="{width:'40px'}" style="max-width: 40px;">
            <template #body="{data}">
                {{ data.empresaEntrega }}
            </template>
        </Column>
        <Column :header="$t('Propostes.Comanda Ames')" :style="{width:'125px'}" style="max-width: 125px;">
            <template #body="{data}">
                {{ data.codiNumeroFormat }}
            </template>
        </Column>
        <Column :header="$t('Propostes.Comanda client')" :style="{width:'125px'}" style="max-width: 1000px;">
            <template #body="{data}">
              <span v-if="data.isComandaNormalitzatSotaMinim" v-tooltip="$n(data.importNetComanda, 'decimal')">
                <font-awesome-icon icon="fa-solid fa-coins" style="font-size: 1.1rem; margin-right: 5px;" />
              </span>
              <div class="ellipsis" v-tooltip="data.comandaClient">
                {{ data.comandaClient }}
              </div>
            </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;">
          <template #header>
            <div style="width: 100%;" v-tooltip="$t('Propostes.Article bloquejat')">
              <font-awesome-icon icon="fa-solid fa-lock" style="margin-left: 10px; font-size: 1.1rem" />
            </div>
          </template>
          <template #body="{data}">
            <div v-if="data.isArticleclientBloquejat" style="width: 100%; text-align: center;" v-tooltip="$t('Propostes.Article bloquejat')">
              <font-awesome-icon icon="fa-solid fa-lock" style="font-size: 1.1rem" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Tipus')" :style="{width:'45px'}" style="max-width: 45px; text-align: center;">
          <template #body="{data}">
            <ColumnaTipusArticleClient :tipus="data.tipusArticleClient" />
          </template>
        </Column>
        <Column :header="$t('Propostes.Article')" :style="{width:'80px'}" style="max-width: 80px;">
            <template #body="{data}">
                {{ `${data.article}` }}
            </template>
        </Column>
        <Column :header="$t('Propostes.Referencia')" :style="{width:'130px'}" style="max-width: 130px;">
            <template #body="{data}">
              <div class="ellipsis">
                {{ `${data.referencia}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Data client')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            {{ `${$d($toDate(data.dataSolicitada), 'short')}` }}
          </template>
        </Column>
        <Column :header="$t('Propostes.Data sortida')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <div style="width: 100%;"
              :class="{ 'bold': data.dataConfirmadaFabrica}"
               v-tooltip="data.dataConfirmadaFabrica ? $d($toDate(data.dataConfirmadaFabrica), 'short') : null">
              {{ `${$d($toDate(data.dataSortida), 'short')}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Q pendent')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;"
              :class="{ 'bold': data.qtatServida > 0 }"
              v-tooltip="`${$n(data.qtatServida)} de ${$n(data.qtatSolicitada)}`">
              {{ `${$n(data.qtatPendent)}` }}
            </div>
          </template>
        </Column>
        <Column :style="{width:'40px'}" style="text-align: center; max-width: 40px;">
          <template #header>
            <div class="ellipsis" v-tooltip.top="$t('Propostes.Peces satelit')">
              <font-awesome-icon icon="fa-solid fa-satellite-dish" style="font-size: 1.1rem;" />
            </div>
          </template>
          <template #body="{data}">
            <div style="width: 100%; text-align: center;" >
              <span v-if="data.stockSatelit > 0" v-tooltip="`${$t('Propostes.Peces satelit')}: ${$n(data.stockSatelit)}`">
                <font-awesome-icon icon="fa-solid fa-satellite-dish" style="font-size: 1.1rem;" />
              </span>
            </div>
          </template>
        </Column>
        <Column :style="{width:'145px'}" style="text-align: right; max-width: 145px;" :header="$t('Propostes.Preu')">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              <span v-if="data.comandaBlanca" v-tooltip="`CB: ${$n(data.comandaBlanca)}`">
                <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.10rem" />
              </span>
              <span v-if="data.isPreuFixat" v-tooltip="$t('Comandes.Preu fixat')">
                <font-awesome-icon icon="fa-solid fa-hand" style="font-size: 1.10rem" />
              </span>
              {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Unitats palet')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip="`${$n(data.unitatsEmbalatge)} x ${$n(data.caixesPalet)}`">
              {{ `${$n(data.unitatsPalet)}` }}
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" header="Int.">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-comments" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeComentarisInterns}"
                @click="propostaSeleccionada = data; visibleModalComentarisInterns = true" />
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" header="Ext.">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-megaphone" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeComentarisClient}"
                @click="propostaSeleccionada = data; visibleModalComentarisClient = true" />
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" :header="$t('Propostes.Notes emb')">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-box" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeNotesEmbalatge}"
                @click="propostaSeleccionada = data; visibleModalNotesEmbalatge = true" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Partida arantzelaria')" :style="{width:'140px'}" style="max-width: 140px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.partArtantDesc}`">
                {{ `${data.partArantCodi} - ${data.partArtantDesc}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Fabrica')" :style="{width:'90px'}" style="max-width: 90px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.fabricaDesc} ${data.planificador ? `(${data.planificador})` : ''}`">
                {{ `${data.fabricaCodi} - ${data.fabricaDesc}` }}
              </div>
            </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>
</template>

<script>
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import { ref, onMounted, onUnmounted, toRef, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import ColumnaTipusArticleClient from "@/components/ColumnaTipusArticleClient.vue";
import propostesService from '@/services/propostes.service';
import { carrega } from '@/services/loader';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'ModalPropostaClientNoFerm',
  components: {
    AjudaStocks,
    EditorComentaris,
    ColumnaTipusArticleClient,
  },
  props: {
    resumClient : Object,
    dataPropostes: Object,
    tipus: {
      type: String,
      required: true,
      validator: (value) => ['invent', 'orientatiu'].includes(value)
    }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const contextMenu = ref();
    const visibleModalComentarisInterns = ref(false);
    const visibleModalComentarisClient = ref(false);
    const visibleModalNotesEmbalatge = ref(false);
    const resumClientRef = toRef(props, 'resumClient');
    const dataPropostesRef = toRef(props, 'dataPropostes');
    const tipusRef = toRef(props, 'tipus');
    
    // Mapa per obtenir la propietat correcta segons el tipus
    const tipusPropostesMap = {
      'invent': 'propostesInvent',
      'orientatiu': 'propostesOrientatiu'
    };
    
    // Extreure la llista de propostes correcta segons el tipus
    const propostesRef = computed(() => {
      if (!dataPropostesRef.value) return [];
      const propietat = tipusPropostesMap[tipusRef.value];
      return dataPropostesRef.value[propietat] || [];
    });
    const elementGridPropostes = () => document.getElementById('elementGridPropostes');
    const selectedIndex = ref(-1);
    const propostaSeleccionada = ref();
    const visibleAjudaStocks = ref(false);

    onMounted(async () => {
      document.addEventListener("keydown", keyHandler);
      nextTick(() => {
        selectedIndex.value = 0;
        document.activeElement.blur();
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", keyHandler);
    });

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        propostaSeleccionada.value = propostesRef.value[selectedIndex.value];
        scrollCenter(elementGridPropostes(), selectedIndex);
      }
    });

    const modalVisible = computed(() => {
      return visibleAjudaStocks.value
        || visibleModalComentarisInterns.value || visibleModalComentarisClient.value
        || visibleModalNotesEmbalatge.value
    });

    const titol = computed(() => {
      return `${t('Propostes.Traspas')}`;
    });

    const estilRow = () => {
      return 'estilRow';
    };

    const keyHandler = (ev) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu
      if (isContextMenuKey(ev))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;

      // Tornar enrere
      if (ev.key=='Escape') {
        hide();
      }
      // Accions del grid
      if (!contextMenu.value?.visible)
        controlDataTable(ev, elementGridPropostes(), selectedIndex, propostesRef);
    }

    const showContextMenu = (ev) => {
      let selectedOld = selectedIndex.value;
      selectedIndex.value = propostesRef.value.findIndex(l => l.codiNumeroFormat == propostaSeleccionada.value.codiNumeroFormat);
      if (selectedOld === selectedIndex.value) {
        propostaSeleccionada.value = propostesRef.value[selectedIndex.value];
      }
      contextMenu.value.show(ev.originalEvent);
    }

    const menuModel = computed(() => {
      let result = [];
      result.push({label: ()=>  `${t('Propostes.Veure stock')}`, class:'p-button-text', icon: 'pi pi-box', command: () => visibleAjudaStocks.value = true});
      return result;
    });

    const updateComentarisInterns = async (text) => {
      await carrega(propostesService.actualitzarComentarisInterns(propostaSeleccionada.value.comanda, propostaSeleccionada.value.numero, text.trim()));
      propostaSeleccionada.value.comentarisInterns = text.trim();
      propostaSeleccionada.value.isTeComentarisInterns = !!text.trim();
    }

    const updateComentarisClient = async (text) => {
      await carrega(propostesService.actualitzarComentarisClient(propostaSeleccionada.value.comanda, propostaSeleccionada.value.numero, text.trim()));
      propostaSeleccionada.value.comentarisClient = text.trim();
      propostaSeleccionada.value.isTeComentarisClient = !!text.trim();
    }

    const updateNotesEmbalatge = async (text) => {
      await carrega(propostesService.actualitzarNotesEmbalatge(propostaSeleccionada.value.article + propostaSeleccionada.value.clicod, text.trim()));
      propostaSeleccionada.value.notesEmbalatge = text.trim();
      propostaSeleccionada.value.isTeNotesEmbalatge = !!text.trim();
    }

    const hide = () => {
      emit('update:carregat', false);
    }

    return {
      visible,
      props,
      titol,
      contextMenu,
      selectedIndex,
      visibleAjudaStocks,
      showContextMenu,
      menuModel,
      estilRow,
      hide,
      resumClientRef,
      propostesRef,
      propostaSeleccionada,
      permisosStore,
      visibleModalComentarisInterns,
      visibleModalComentarisClient,
      visibleModalNotesEmbalatge,
      updateComentarisInterns,
      updateComentarisClient,
      updateNotesEmbalatge,
    }
  },
}
</script>

<style scoped>
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

  .flex-container {
    padding: 0px 5px; 
    display: flex;
    gap: 75px;
  }

  .label-detall {
    margin-right: 5px;
  }

  .ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
  }

  .bold {
    font-weight: bold;
  }
</style>