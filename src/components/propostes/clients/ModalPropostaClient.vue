<template>
  <AjudaStocks v-if="visibleAjudaStocks" :carregat="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
      :artint="propostaSeleccionada.artint" :clicod="propostaSeleccionada.clicod" />
  <ModalOpcionsCreacioAlbarans v-model:visible="visibleOpcions" :data="opcionsCreacio.data"
    :tancarAlbaransNous="opcionsCreacio.tancarAlbaransNous" @confirmar="onOpcionsConfirmades" />
  <ModalConfirmacioAlbarans v-model:visible="visibleConfirmacio" :preview="previewData"
    :data="opcionsCreacio.data" :tancarAlbaransNous="opcionsCreacio.tancarAlbaransNous" :bloquejarTecles="visibleOpcions"
    @confirmar="confirmarCreacio" @recalcular="recalcular" @canviar-opcions="visibleOpcions = true" />
  <ModalResultatCreacioAlbarans v-model:visible="visibleResultat" :resultat="resultatCreacio" />
  <ModalModificarQuantitat v-if="visibleModificarQuantitat" :carregat="visibleModificarQuantitat" @update:carregat="visibleModificarQuantitat = $event"
      :quantitat="propostaSeleccionada.qtatAlbara" :max="propostaSeleccionada.qtatPendent" @quantitatModificada="onQuantitatModificada" />
  <EditorComentaris v-if="visibleModalComentarisInterns" :carregat="visibleModalComentarisInterns" @update:carregat="visibleModalComentarisInterns = $event;"
    :text="propostaSeleccionada.comentarisInterns" :callback="updateComentarisInterns" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalComentarisClient" :carregat="visibleModalComentarisClient" @update:carregat="visibleModalComentarisClient = $event;"
    :text="propostaSeleccionada.comentarisClient" :callback="updateComentarisClient" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <EditorComentaris v-if="visibleModalNotesEmbalatge" :carregat="visibleModalNotesEmbalatge" @update:carregat="visibleModalNotesEmbalatge = $event;"
    :text="propostaSeleccionada.notesEmbalatge" :callback="updateNotesEmbalatge" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false"
    :style="{ width: '100vw', maxHeight: '95vh', overflow: 'auto' }">
    <template #header>
      <div style="width: 100%;">
        <span style="float: left;">
          <font-awesome-icon v-if="resumClientRef.isBloquejat" icon="fa-solid fa-lock" style="font-size: 1.1rem" />
          <span style="font-size: larger; font-weight: 600; margin-left: 5px;">
            {{ `${resumClientRef.clientCodi} - ${resumClientRef.clientNom}` }}
          </span>
          <span style="margin-left: 40px;">
            <ColumnaTipologia :tipusArticles="resumClientRef.tipusArticles"/>
          </span>
          <span style="margin-left: 40px;">
            <ColumnaServible :numTot="resumClientRef.numLiniesServirTot" :numParcial="resumClientRef.numLiniesServirParcial" :numCap="resumClientRef.numLiniesServirCap"/>
          </span>
          <span class="agrupacio-albarans" v-tooltip.top="$t('Propostes.Agrupacio albarans ajuda')">
            <span class="agrupacio-titol">{{ $t('Propostes.Agrupacio albarans') }}:</span>
            <span class="estat-flag" :class="{ actiu: dataPropostes?.isAlbaraPerComanda }">
              <i :class="dataPropostes?.isAlbaraPerComanda ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Propostes.Albara per comanda') }}
            </span>
            <span class="estat-flag" :class="{ actiu: dataPropostes?.isAlbaraPerPesa }">
              <i :class="dataPropostes?.isAlbaraPerPesa ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Propostes.Albara per peca') }}
            </span>
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
        <Column :style="{ width: '30px' }" style="max-width: 30px;" :reorderableColumn="false">
          <template #header>
            <div style="width: 100%; text-align: center;">
              <Checkbox :modelValue="totSeleccionat" :binary="true" @click="canviarSeleccioTots" />
            </div>
          </template>
          <template #body="{ data }">
            <div style="width: 100%; text-align: center;">
              <Checkbox v-model="data.seleccionat" :binary="true" />
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
        <Column :header="$t('Comandes.Tipus')" :style="{width:'45px'}" style="max-width: 45px; text-align: center;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;">
              <ColumnaTipusComanda :tipus="data.tipusLinia" />
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
        <Column :header="$t('Propostes.Referencia')" :style="{width:'120px'}" style="max-width: 120px;">
            <template #body="{data}">
              <div class="ellipsis">
                {{ `${data.referencia}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Data client')" :style="{width:'105px'}" style="max-width: 105px;">
          <template #body="{data}">
            {{ `${$d($toDate(data.dataSolicitada), 'short')}` }}
          </template>
        </Column>
        <Column :header="$t('Propostes.Data sortida')" :style="{width:'105px'}" style="max-width: 105px;">
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
        <Column :header="$t('Propostes.Qtat disp')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;">
              <span v-if="data.stockSatelit > 0" v-tooltip="`${$t('Propostes.Peces satelit')}: ${$n(data.stockSatelit)}`">
                <font-awesome-icon icon="fa-solid fa-satellite-dish" class="satellite-icon" :class="{ 'highlighted': data.necessitaStockSatelit }" />
              </span>
              {{ `${$n(data.stockAlbara)}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Qtat albara')" :style="{width:'110px'}" style="text-align: right; max-width: 110px;">
          <template #body="{data}">
            <div class="cel-qtat-albara" :class="{ 'stock-negatiu': data.seleccionat && data.qtatAlbara > data.stockAlbara }"
              v-tooltip="`${$t('Propostes.Q pendent')}: ${$n(data.qtatPendent)}`">
              <span v-if="!data.isNormalitzat && data.qtatAlbara != data.qtatPendent">
                <font-awesome-icon icon="fa-solid fa-pen-to-square" style="font-size: 1.1rem; color: #fd7e14; margin-right: 4px;" />
              </span>
              {{ `${$n(data.qtatAlbara)}` }}
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
        <Column :style="{width:'100px'}" style="text-align: right; max-width: 100px;" :header="$t('Propostes.Import net')">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip="$n(data.importNetPendent, 'decimal')">
              {{ `${$n(data.importNetAlbara, 'decimal')}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Pes enviar')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip.top="`Pes unitari: ${$n(data.pesUnitari)} g.`">
              {{ `${$n(data.pesAlbara, 'decimal')}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Unitats palet')" :style="{width:'105px'}" style="max-width: 105px;">
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
        <Column :header="$t('Propostes.Partida arantzelaria')" :style="{width:'130px'}" style="max-width: 130px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.partArtantDesc}`">
                {{ `${data.partArantCodi} - ${data.partArtantDesc}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Fabrica')" :style="{width:'85px'}" style="max-width: 85px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.fabricaDesc} ${data.planificador ? `(${data.planificador})` : ''}`">
                {{ `${data.fabricaCodi} - ${data.fabricaDesc}` }}
              </div>
            </template>
        </Column>
      </DataTable>
    </div>
    <div class="card" style="margin-top: 10px;">
      <h6 class="card-header" style="font-weight: 600; display: flex; align-items: center; gap: 20px;">
        <span>{{ $t('Propostes.Resum') }}</span>
        <Button 
          :label="$t('Propostes.Fer albarans')" 
          icon="pi pi-file" 
          class="p-button-sm"
          :disabled="numLiniesSeleccionades === 0"
          @click="ferAlbarans" />
      </h6>
      <div class="card-body">
        <div class="flex-container" style="font-size: larger; font-weight: 600;">
          <span> 
            <font-awesome-icon icon="fa-solid fa-coins" style="margin-right: 10px;" />
            <label class="label-detall"> {{ `${$t('Propostes.Import')}:` }} </label>
            <span v-if="importSeleccionat >= 0">{{ `${$n(importSeleccionat,'decimal')}` }}</span>
            <span v-else>-</span>
          </span>
          <span> 
            <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
            <label class="label-detall"> {{ `${$t('Propostes.Pes enviar')}: ` }} </label>  
            <span v-if="pesSeleccionat >= 0">{{ `${$n(pesSeleccionat,'decimal')} Kg.` }}</span>
            <span v-else>-</span>
          </span>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import { controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import { ref, onMounted, onUnmounted, toRef, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import ModalConfirmacioAlbarans from './ModalConfirmacioAlbarans.vue';
import ModalResultatCreacioAlbarans from '../ModalResultatCreacioAlbarans.vue';
import ModalOpcionsCreacioAlbarans from '../ModalOpcionsCreacioAlbarans.vue';
import ModalModificarQuantitat from '../traspas/ModalModificarQuantitat.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import ColumnaTipusArticleClient from "@/components/ColumnaTipusArticleClient.vue";
import ColumnaTipusComanda from '@/components/ColumnaTipusComanda.vue';
import ColumnaTipologia from './ColumnaTipologia.vue';
import ColumnaServible from './ColumnaServible.vue';
import albaraService from '@/services/albara.service';
import propostesService from '@/services/propostes.service';
import { carrega } from '@/services/loader';
import { usePermisosStore } from '@/stores/permisos';
import moment from 'moment';
import Swal from 'sweetalert2';

export default {
  name: 'ModalPropostaClient',
  components: {
    AjudaStocks,
    ModalConfirmacioAlbarans,
    ModalResultatCreacioAlbarans,
    ModalOpcionsCreacioAlbarans,
    ModalModificarQuantitat,
    EditorComentaris,
    ColumnaTipusArticleClient,
    ColumnaTipusComanda,
    ColumnaTipologia,
    ColumnaServible,
  },
  props: {
    resumClient : Object,
    dataPropostes: Object,
    tipus: {
      type: String,
      required: true,
      validator: (value) => ['ferm', 'tots'].includes(value)
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
      'ferm': 'propostesFerm',
      'tots': 'propostes'
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
    const visibleConfirmacio = ref(false);
    const visibleOpcions = ref(false);
    const visibleModificarQuantitat = ref(false);
    const visibleResultat = ref(false);
    const resultatCreacio = ref([]);
    const previewData = ref(null);
    // Opcions globals de creació escollides al modal previ (data i tancament dels albarans nous)
    const opcionsCreacio = ref({ data: moment().format('YYYY-MM-DD'), tancarAlbaransNous: true });
    let baseRequest = null;

    // Inicialitza la quantitat d'albarà de cada línia amb valors ja calculats pel backend (sense fórmules al frontend).
    // - Article-client normalitzat (clicod 000000): no és editable i va lligada a la reserva; la quantitat
    //   proposada és la reservada (= stockAlbara), sobre la qual el backend ja ha calculat import/pes.
    // - Resta d'articles: s'inicialitza amb la quantitat pendent, amb l'import/pes pendent corresponents.
    const inicialitzarQtatAlbara = (linies) => {
      (linies || []).forEach((linia) => {
        if (linia.qtatAlbara === undefined) {
          if (linia.isNormalitzat) {
            linia.qtatAlbara = linia.stockAlbara;
          } else {
            linia.qtatAlbara = linia.qtatPendent;
            linia.importNetAlbara = linia.importNetPendent;
            linia.pesAlbara = linia.pesPendent;
          }
        }
      });
    };

    watch(propostesRef, (linies) => inicialitzarQtatAlbara(linies), { immediate: true });

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
      return visibleAjudaStocks.value || visibleConfirmacio.value || visibleOpcions.value || visibleModificarQuantitat.value
        || visibleResultat.value
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
      if (ev.keyCode=="32") { // Espai
        ev.preventDefault();
        propostaSeleccionada.value.seleccionat = !propostaSeleccionada.value.seleccionat;
      }
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
      // Els articles normalitzats (clicod 000000) no permeten editar la quantitat (va lligada a la reserva)
      if (!propostaSeleccionada.value?.isNormalitzat) {
        result.push({label: ()=>  `${t('Propostes.Editar quantitat')}`, class:'p-button-text', icon: 'pi pi-pencil', command: () => visibleModificarQuantitat.value = true});
      }
      result.push({label: ()=>  `${t('Propostes.Veure stock')}`, class:'p-button-text', icon: 'pi pi-box', command: () => visibleAjudaStocks.value = true});
      return result;
    });

    const onQuantitatModificada = async (novaQtat) => {
      const linia = propostaSeleccionada.value;
      linia.qtatAlbara = novaQtat;
      visibleModificarQuantitat.value = false;
      // L'import net i el pes es recalculen al servidor per no replicar la fórmula al frontend
      const resultat = await carrega(propostesService.recalcularImportPesLinia({
        preu: linia.preu,
        descompte: linia.descompte,
        pesUnitari: linia.pesUnitari,
        quantitat: novaQtat,
      }));
      linia.importNetAlbara = resultat.importNet;
      linia.pesAlbara = resultat.pes;
    };

    const importSeleccionat = computed(() => 
      propostesRef.value
        .filter(p => p.seleccionat)
        .reduce((acc, p) => acc + (p.importNetAlbara ?? 0), 0)
    );

    const pesSeleccionat = computed(() =>
      propostesRef.value
        .filter(p => p.seleccionat)
        .reduce((acc, p) => acc + (p.pesAlbara ?? 0), 0)
    );

    const numLiniesSeleccionades = computed(() =>
      propostesRef.value.filter(p => p.seleccionat).length
    );

    const totSeleccionat = computed(() => {
      if (propostesRef.value.length === 0) return false;
      return propostesRef.value.every(p => p.seleccionat);
    });

    const canviarSeleccioTots = () => {
      const nouEstat = !propostesRef.value.every(p => p.seleccionat);
      propostesRef.value.forEach(p => p.seleccionat = nouEstat);
    };

    const ferAlbarans = async () => {
        const liniesSeleccionades = propostesRef.value.filter(p => p.seleccionat);

        if (liniesSeleccionades.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: t('App.Atencio'),
            text: t('Propostes.No hi ha linies seleccionades')
          });
          return;
        }

        // Preparar el request base amb les línies seleccionades. La data i el tancament dels albarans nous
        // es decideixen al modal previ d'opcions (onOpcionsConfirmades).
        baseRequest = {
          client: resumClientRef.value.clientCodi,
          magatzem: dataPropostesRef.value.magatzem || '0001',
          liniesServir: liniesSeleccionades.map(linia => ({
            id: {
              comanda: linia.comanda,
              numero: linia.numero
            },
            quantitat: linia.qtatAlbara
          }))
        };

        // Es reinicien les opcions per defecte i s'obre el modal previ (data + tancar albarans nous)
        opcionsCreacio.value = { data: moment().format('YYYY-MM-DD'), tancarAlbaransNous: true };
        visibleOpcions.value = true;
    };

    // Confirmació del modal previ d'opcions: fixa data i tancament, calcula la proposta i mostra la confirmació.
    // També s'invoca quan es reobre el modal des de la confirmació ("Canviar opcions") per recalcular.
    const onOpcionsConfirmades = async ({ data, tancarAlbaransNous }) => {
        opcionsCreacio.value = { data, tancarAlbaransNous };
        baseRequest.dataAlbara = data;
        baseRequest.tancarAlbaransNous = tancarAlbaransNous;
        previewData.value = await carrega(albaraService.calcularAlbara({ ...baseRequest }));
        visibleConfirmacio.value = true;
    };

    // Recàlcul en viu quan l'usuari canvia les opcions d'aprofitament d'albarans oberts (global o per albarà)
    const recalcular = async (opcions) => {
        previewData.value = await carrega(albaraService.calcularAlbara({ ...baseRequest, ...opcions }));
    };

    const confirmarCreacio = async (opcions) => {
        // 2a fase: crear enviant la signatura de la proposta acceptada i les opcions d'aprofitament escollides.
        // Si la proposta ha canviat, el backend no crea res i l'interceptor mostra el missatge.
        visibleConfirmacio.value = false;
        const resultat = await carrega(albaraService.crearAlbara({ ...baseRequest, signatura: previewData.value.signatura, ...opcions }));
        // Emetre event per indicar que s'ha creat l'albarà i cal recarregar les propostes (refresc en segon pla)
        emit('albara-creat');
        // Mostrar el modal de resultat amb els albarans creats/aprofitats (per davant de la proposta)
        resultatCreacio.value = resultat?.albarans ?? [];
        visibleResultat.value = true;
    };

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
      importSeleccionat,
      pesSeleccionat,
      numLiniesSeleccionades,
      totSeleccionat,
      canviarSeleccioTots,
      showContextMenu,
      menuModel,
      estilRow,
      hide,
      ferAlbarans,
      onOpcionsConfirmades,
      confirmarCreacio,
      recalcular,
      visibleConfirmacio,
      visibleOpcions,
      visibleResultat,
      resultatCreacio,
      opcionsCreacio,
      visibleModificarQuantitat,
      onQuantitatModificada,
      previewData,
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

  /* Cel·la de "Qtat. albarà" en vermell clar: servir més quantitat de la disponible deixarà l'stock en negatiu.
     El marge negatiu (igual al padding de la cel·la a p-datatable-sm) fa que el fons ompli tota la cel·la. */
  .cel-qtat-albara {
    width: 100%;
    text-align: right;
  }

  .cel-qtat-albara.stock-negatiu {
    background-color: #fdeaea;
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

  .agrupacio-albarans {
    margin-left: 40px;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-size: 0.9rem;
  }

  .agrupacio-titol {
    font-weight: 600;
    color: #556;
  }

  .estat-flag {
    color: #99a;
    font-weight: 400;
    white-space: nowrap;
  }

  .estat-flag.actiu {
    color: #2c7a3d;
    font-weight: 600;
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

  .satellite-icon {
    font-size: 1.1rem;
  }

  .satellite-icon.highlighted {
    color: red;
  }
</style>