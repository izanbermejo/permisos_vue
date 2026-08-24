<template>
  <ModalModificarQuantitat v-if="visibleModificarQuantitat" :carregat="visibleModificarQuantitat"  @update:carregat="visibleModificarQuantitat = $event"
      :quantitat="propostaSeleccionada.qtatTraspassableDefinitiva" @quantitatModificada="onQuantitatModificada" />
  <AjudaStocks v-if="visibleAjudaStocks" :carregat="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
      :artint="propostaSeleccionada.artint" :clicod="propostaSeleccionada.clicod" />
  <EditorComentaris v-if="visibleModalNotesEmbalatge" :carregat="visibleModalNotesEmbalatge" @update:carregat="visibleModalNotesEmbalatge = $event;"
    :text="propostaSeleccionada.notesEmbalatge" :callback="updateNotesEmbalatge" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <ModalLiniesTraspas v-if="visibleModalLiniesTraspas" :carregat="visibleModalLiniesTraspas" @update:carregat="visibleModalLiniesTraspas = $event;"
    :artint="propostaSeleccionada.artint" :clicod="propostaSeleccionada.clicod"
    :client="propostaSeleccionada.client" :empresa="propostaSeleccionada.empresaEntrega"
    :article="propostaSeleccionada.article" :referencia="propostaSeleccionada.referencia"
    :magOrigen="propostaSeleccionada.magOrigen" :magDesti="propostaSeleccionada.magEntrega"
    :dataPrevistaInici="dataPrevistaInici" :dataPrevistaFi="dataPrevistaFi"
    @comentaris-actualitzats="onComentarisActualitzats" />
  <ModalOpcionsCreacioAlbarans v-model:visible="visibleOpcions" :data="opcionsCreacio.data"
    :tancarAlbaransNous="opcionsCreacio.tancarAlbaransNous" @confirmar="onOpcionsConfirmades" />
  <ModalConfirmacioAlbaransTraspas v-model:visible="visibleConfirmacio" :preview="previewData" :agruparPerClient="agruparPerClient"
    :data="opcionsCreacio.data" :tancarAlbaransNous="opcionsCreacio.tancarAlbaransNous" :bloquejarTecles="visibleOpcions"
    @confirmar="confirmarCreacio" @recalcular="recalcular" @canviar-opcions="visibleOpcions = true" />
  <ModalResultatCreacioAlbarans v-model:visible="visibleResultat" :resultat="resultatCreacio" />
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :draggable="false">
    <template #header>
      <div style="width: 100%; display: flex; align-items: center; gap: 20px;">
        <span style="font-size: larger; font-weight: 600;">{{ titol }}</span>
        <div style="display: flex; align-items: center; gap: 8px; margin-left: 30px;">
          <label style="font-size: 0.9rem; white-space: nowrap;">{{ $t('Propostes.Visualitzar per') }}</label>
          <SelectButton v-model="agrupacio" :options="agrupacioOptions" optionLabel="label" optionValue="value" :allowEmpty="false" />
        </div>
      </div>
    </template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
    <div id="elementGridPropostes">
      <DataTable :value="propostesLocals" class="p-datatable-sm"
              dataKey="artintClicod"
              style="margin-top: 10px;"
              :scrollable="true" scrollHeight="60vh"
              :resizableColumns="true" columnResizeMode="expand"
              showGridlines
              rowGroupMode="subheader" groupRowsBy="grupKey"
              contextMenu v-model:contextMenuSelection="propostaSeleccionada" @rowContextmenu="showContextMenu($event)"
              v-model:selection="propostaSeleccionada" selectionMode="single"
              :rowClass="estilRow"
              @row-select="selectedIndex = $event.index">
        <template #groupheader="{data}">
          <span class="grup-header-container">
            <Checkbox :binary="true" :modelValue="grupTotSeleccionat(data.grupKey)"
              @update:modelValue="toggleGrup(data.grupKey, $event)" @click.stop />
            <span class="grup-header" v-if="agrupacio === 'EMPRESA'">
              {{ `${data.empresaOrigen} ⇒ ${data.empresaEntrega}` }}
              <span class="grup-header-nom">{{ `(${$empresa(data.empresaOrigen)} ⇒ ${$empresa(data.empresaEntrega)})` }}</span>
            </span>
            <span class="grup-header" v-else>{{ data.grupKey }}</span>
          </span>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{data}">
            <div style="width: 100%;">
            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="propostaSeleccionada = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column :style="{ width: '40px' }" style="max-width: 40px;" :reorderableColumn="false">
          <template #body="{ data }">
            <div style="width: 100%; text-align: center;">
              <Checkbox v-model="data.seleccionat" :binary="true" />
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Empresa')" :style="{width:'80px'}" style="max-width: 80px;">
            <template #body="{data}">
                {{ `${data.empresaOrigen} ⇒ ${data.empresaEntrega}` }}
            </template>
        </Column>
        <Column :header="$t('Propostes.Client')" :style="{width:'180px'}" style="max-width: 180px;">
            <template #body="{data}">
              <div class="ellipsis" v-tooltip.left="`${data.client} - ${data.clientNom}`">
                {{ `${data.client} - ${data.clientNom}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Article')" :style="{width:'100px'}" style="max-width: 100px;">
            <template #body="{data}">
                {{ `${data.article}` }}
              <i class="pi pi-copy"
                @click="copyText(data.article + data.client)"
                style="margin-left: 5px;">
              </i>
            </template>
        </Column>
        <Column :header="$t('Propostes.Referencia')" :style="{width:'190px'}" style="max-width: 190px;">
            <template #body="{data}">
              <div class="ellipsis" v-tooltip.top="`${data.referencia}`">
                {{ `${data.referencia}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Q traspassar')" :style="{width:'140px'}" style="max-width: 140px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip="`Stock destí: ${$n(data.stockDesti)}`">
              {{ `${$n(data.qtatTraspas)}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Q traspas')" :style="{width:'140px'}" style="max-width: 140px;">
          <template #body="{data}">
            <span v-if="data.stockOrigenSatelit > 0" v-tooltip="`${$t('Propostes.Peces satelit')}: ${$n(data.stockOrigenSatelit)}`">
              <font-awesome-icon icon="fa-solid fa-satellite-dish" class="satellite-icon" :class="{ 'highlighted': data.necessitaStockSatelit }" />
            </span>
            <div style="width: 100%; text-align: right;" v-tooltip="`Stock origen: ${$n(data.stockOrigen)}`">
              <span v-if="data.qtatTraspassableDefinitiva != data.qtatTraspassable">
                <font-awesome-icon icon="fa-solid fa-pen-to-square" style="font-size: 1.1rem; color: #fd7e14;" />
              </span>
              {{ `${$n(data.qtatTraspassableDefinitiva)}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Data traspas')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: center;"
              v-tooltip.top="tooltipDatesTraspas(data.datesPrimeraLiniaTraspas)">
              <span v-if="data.datesPrimeraLiniaTraspas && data.datesPrimeraLiniaTraspas.dataSortidaInterna">
                {{ $d($toDate(data.datesPrimeraLiniaTraspas.dataSortidaInterna), 'short') }}
              </span>
              <span v-else>-</span>
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Preu traspas')" :style="{width:'120px'}" style="max-width: 120px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip.top="tooltipPreuTraspas(data)">
              <span v-if="data.isSenseTarifa">
                <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="color: #dc3545; margin-right: 4px;" />
              </span>
              {{ `${$n(data.preuTraspas.valor, 'decimalLong')} ${data.preuTraspas.divisa}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Import')" :style="{width:'100px'}" style="max-width: 100px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;"
              v-tooltip.top="`${$t('Propostes.Q traspassar')}: ${$n(data.importTraspas, 'decimal')} ${data.preuTraspas.divisa}`">
              {{ `${$n(data.importTraspassable, 'decimal')}` }}
            </div>
          </template>
        </Column>
        <Column :header="$t('Propostes.Pes traspassable')" :style="{width:'110px'}" style="max-width: 110px;">
          <template #body="{data}">
            <div style="width: 100%; text-align: right;" v-tooltip.top="`Pes unitari: ${$n(data.pesUnitari)} g.`">
              {{ `${$n(data.pesTraspassable)}` }}
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
                @click="obrirLiniesTraspas(data)" />
            </div>
          </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false" header="Ext.">
          <template #body="{data}">
            <div style="width: 100%;">
              <Button icon="pi pi-megaphone" class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeComentarisClient}"
                @click="obrirLiniesTraspas(data)" />
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
        <Column :header="$t('Propostes.Partida arantzelaria')" :style="{width:'105px'}" style="max-width: 105px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.partArantCodi} - ${data.partArtantDesc}`">
                {{ `${data.partArantCodi} - ${data.partArtantDesc}` }}
              </div>
            </template>
        </Column>
        <Column :header="$t('Propostes.Fabrica')" :style="{width:'105px'}" style="max-width: 105px;">
            <template #body="{data}">
              <div class="ellipsis" style="text-align: left;" v-tooltip.top="`${data.fabricaCodi} - ${data.fabricaDesc} ${data.planificador ? `(${data.planificador})` : ''}`">
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
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 400;">
          <Checkbox v-model="agruparPerClient" :binary="true" inputId="chkAgruparPerClient" />
          <label for="chkAgruparPerClient" style="cursor: pointer;">{{ $t('Propostes.Crear un albara per client') }}</label>
        </div>
      </h6>
      <div class="card-body">
        <div class="flex-container" style="font-size: larger; font-weight: 600; float: left;">
          <span>
            <font-awesome-icon icon="fa-solid fa-weight-hanging" style="margin-right: 10px;"/>
            <label class="label-detall"> {{ `${$t('Propostes.Pes traspassable')}: ` }} </label>
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
import { ref, toRef, onMounted, onUnmounted, watch, computed, nextTick, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import ModalModificarQuantitat from './ModalModificarQuantitat.vue';
import ModalLiniesTraspas from './ModalLiniesTraspas.vue';
import ModalConfirmacioAlbaransTraspas from './ModalConfirmacioAlbaransTraspas.vue';
import ModalResultatCreacioAlbarans from '../ModalResultatCreacioAlbarans.vue';
import ModalOpcionsCreacioAlbarans from '../ModalOpcionsCreacioAlbarans.vue';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import {copyText} from 'vue3-clipboard';
import albaraService from '@/services/albara.service';
import propostesService from '@/services/propostes.service';
import { carrega } from '@/services/loader';
import { usePermisosStore } from '@/stores/permisos';
import Swal from 'sweetalert2';
import moment from 'moment';

export default {
  name: 'ModalPropostaTraspas',
  components: {
    AjudaStocks,
    ModalModificarQuantitat,
    ModalLiniesTraspas,
    ModalConfirmacioAlbaransTraspas,
    ModalResultatCreacioAlbarans,
    ModalOpcionsCreacioAlbarans,
    EditorComentaris,
  },
  props: {
    codiMagatzem : String,
    descMagatzem : String,
    infoPropostes: Object,
    dataPrevistaInici: String,
    dataPrevistaFi: String,
  },
  setup(props, { emit }) {
    const { t, d } = useI18n();
    const toDate = inject('toDate');
    const permisosStore = usePermisosStore();

    // Tooltip amb les 3 dates de la primera línia del traspàs
    const tooltipDatesTraspas = (dates) => {
      if (!dates) return '';
      const fmt = (v) => v ? d(toDate(v), 'short') : '-';
      return `${t('Propostes.Data solicitada')}: ${fmt(dates.dataSolicitada)}`
        + ` · ${t('Propostes.Data prevista sortida')}: ${fmt(dates.dataSortida)}`
        + ` · ${t('Propostes.Data sortida interna')}: ${fmt(dates.dataSortidaInterna)}`;
    };
    const visible = ref(true);
    const contextMenu = ref();
    const visibleModalNotesEmbalatge = ref(false);
    const visibleModalLiniesTraspas = ref(false);
    const infoPropostes = toRef(props, 'infoPropostes');
    const propostesRef = computed(() => props.infoPropostes.traspassos);
    const propostesLocals = ref([]);
    const elementGridPropostes = () => document.getElementById('elementGridPropostes');
    const selectedIndex = ref(-1);
    const propostaSeleccionada = ref();
    const visibleAjudaStocks = ref(false);
    const visibleModificarQuantitat = ref(false);

    // Opció de creació: crear un albarà independent per cada client (per defecte desmarcat)
    const agruparPerClient = ref(false);

    const agrupacio = ref('EMPRESA');
    const agrupacioOptions = [
      { label: t('Propostes.Empresa'), value: 'EMPRESA' },
      { label: t('Propostes.Client'), value: 'CLIENT' },
      { label: t('Propostes.Partida arantzelaria'), value: 'PARTIDA' },
      { label: t('Propostes.Fabrica'), value: 'FABRICA' },
    ];

    const calcGrupKey = (p) => {
      if (agrupacio.value === 'CLIENT') return `${p.client} - ${p.clientNom}`;
      if (agrupacio.value === 'PARTIDA') return `${p.partArantCodi || ''} - ${p.partArtantDesc || ''}`;
      if (agrupacio.value === 'FABRICA') return `${p.fabricaCodi} - ${p.fabricaDesc}`;
      return `${p.empresaOrigen} ⇒ ${p.empresaEntrega}`;
    };

    const getGroupComparator = () => {
      if (agrupacio.value === 'CLIENT') return (a, b) => a.client.localeCompare(b.client);
      if (agrupacio.value === 'PARTIDA') return (a, b) => (a.partArantCodi || '').localeCompare(b.partArantCodi || '');
      if (agrupacio.value === 'FABRICA') return (a, b) => (a.fabricaCodi || '').localeCompare(b.fabricaCodi || '');
      return (a, b) => `${a.empresaOrigen}_${a.empresaEntrega}`.localeCompare(`${b.empresaOrigen}_${b.empresaEntrega}`);
    };

    const aplicarAgrupacio = () => {
      if (!propostesRef.value) return;
      const groupComp = getGroupComparator();
      // L'índex original s'usa com a criteri estabilitzador: dins d'un grup
      // els registres mantenen sempre el mateix ordre relatiu del servidor.
      const withIndex = propostesRef.value.map((p, i) => [p, i]);
      withIndex.sort(([a, ai], [b, bi]) => groupComp(a, b) || ai - bi);
      const sorted = withIndex.map(([p]) => p);
      sorted.forEach(p => { p.grupKey = calcGrupKey(p); });
      propostesLocals.value = sorted;
    };

    watch(propostesRef, () => {
      aplicarAgrupacio();
      selectedIndex.value = 0;
    }, { immediate: true });

    watch(agrupacio, () => {
      aplicarAgrupacio();
      selectedIndex.value = 0;
    });

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
        propostaSeleccionada.value = propostesLocals.value[selectedIndex.value];
        scrollCenter(elementGridPropostes(), selectedIndex);
      }
    });

    const modalVisible = computed(() => {
      return visibleAjudaStocks.value
        || visibleModificarQuantitat.value
        || visibleModalNotesEmbalatge.value
        || visibleModalLiniesTraspas.value
        || visibleOpcions.value
        || visibleResultat.value;
    });

    const titol = computed(() => {
      return `${t('Propostes.Traspas')} ${props.codiMagatzem} - ${props.descMagatzem}`;
    });

    const estilRow = () => {
      return 'estilRow';
    };

    const keyHandler = (ev) => {
      if (isContextMenuKey(ev))  return;
      if (modalVisible.value) return;

      if (ev.key=='Escape') {
        hide();
      }
      if (!contextMenu.value?.visible)
        controlDataTable(ev, elementGridPropostes(), selectedIndex, propostesLocals);
      if (ev.keyCode=="32") {
        ev.preventDefault();
        propostaSeleccionada.value.seleccionat = !propostaSeleccionada.value.seleccionat;
      }
    }

    const showContextMenu = (ev) => {
      let selectedOld = selectedIndex.value;
      selectedIndex.value = propostesLocals.value.findIndex(l => l.artintClicod == propostaSeleccionada.value.artintClicod);
      if (selectedOld === selectedIndex.value) {
        propostaSeleccionada.value = propostesLocals.value[selectedIndex.value];
      }
      contextMenu.value.show(ev.originalEvent);
    }

    const menuModel = computed(() => {
      let result = [];
      result.push({label: ()=>  `${t('Propostes.Editar quantitat')}`, class:'p-button-text', icon: 'pi pi-pencil', command: () => visibleModificarQuantitat.value = true});
      result.push({label: ()=>  `${t('Propostes.Veure stock')}`, class:'p-button-text', icon: 'pi pi-box', command: () => visibleAjudaStocks.value = true});
      result.push({label: ()=>  `${t('Propostes.Linies del grup')}`, class:'p-button-text', icon: 'pi pi-comments', command: () => visibleModalLiniesTraspas.value = true});
      return result;
    });

    const obrirLiniesTraspas = (data) => {
      propostaSeleccionada.value = data;
      visibleModalLiniesTraspas.value = true;
    };

    // Actualitza els flags agregats del grup quan es modifiquen els comentaris de les seves línies
    const onComentarisActualitzats = ({ isTeComentarisInterns, isTeComentarisClient }) => {
      if (!propostaSeleccionada.value) return;
      propostaSeleccionada.value.isTeComentarisInterns = isTeComentarisInterns;
      propostaSeleccionada.value.isTeComentarisClient = isTeComentarisClient;
    };

    const pesSeleccionat = computed(() =>
      propostesLocals.value
        .filter(p => p.seleccionat)
        .reduce((acc, p) => acc + (p.pesTraspassable ?? 0), 0)
    );

    // Tarifa amb què es valorarà el traspàs, i avís quan no està informada (la línia naixeria a preu 0)
    const tooltipPreuTraspas = (data) => {
      const tarifa = data.isTraspasFacturable ? t('Propostes.Tarifa AMES') : t('Propostes.Tarifa client');
      return data.isSenseTarifa ? `${tarifa} · ${t('Propostes.Sense tarifa')}` : tarifa;
    };

    // Estat/selecció de tota una agrupació (subheader) mitjançant el checkbox de la capçalera de grup
    const grupTotSeleccionat = (grupKey) => {
      const files = propostesLocals.value.filter(p => p.grupKey === grupKey);
      return files.length > 0 && files.every(p => p.seleccionat);
    };

    const toggleGrup = (grupKey, value) => {
      propostesLocals.value.forEach(p => {
        if (p.grupKey === grupKey) p.seleccionat = value;
      });
    };

    const onQuantitatModificada = async (newQtat) => {
      var prop = propostaSeleccionada.value;
      prop.qtatTraspassableDefinitiva = newQtat;
      // L'import i el pes els recalcula el servidor per no replicar-ne les fórmules al frontend
      // (l'import depèn de la divisa: les tarifes per cèntims es divideixen entre 100)
      const resultat = await carrega(propostesService.recalcularImportPesLinia({
        preu: prop.preuTraspas,
        descompte: 0,
        pesUnitari: prop.pesUnitari,
        quantitat: newQtat,
      }));
      prop.importTraspassable = resultat.importNet;
      prop.pesTraspassable = resultat.pes;
      prop.necessitaStockSatelit = prop.qtatTraspassableDefinitiva > prop.stockOrigenNoSatelit;
      visibleModificarQuantitat.value = false;
    }

    const visibleConfirmacio = ref(false);
    const visibleOpcions = ref(false);
    const visibleResultat = ref(false);
    const resultatCreacio = ref([]);
    const previewData = ref(null);
    // Opcions globals de creació escollides al modal previ (data i tancament dels albarans nous)
    const opcionsCreacio = ref({ data: moment().format('YYYY-MM-DD'), tancarAlbaransNous: true });
    let baseRequest = null;
    let esPlataforma = false;

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

      // Línies amb quantitat traspassable > 0 (les de quantitat 0 no s'afegiran a cap albarà)
      const liniesAServir = liniesSeleccionades.filter(p => p.qtatTraspassableDefinitiva > 0);
      const numSenseQtat = liniesSeleccionades.length - liniesAServir.length;

      if (liniesAServir.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Propostes.Totes linies quantitat zero')
        });
        return;
      }

      if (numSenseQtat > 0) {
        const result = await Swal.fire({
          icon: 'warning',
          title: t('App.Atencio'),
          text: t('Propostes.Avis linies quantitat zero', [numSenseQtat]),
          showCancelButton: true,
          reverseButtons: true,
          confirmButtonText: t('App.Confirmar'),
          cancelButtonText: t('App.Cancela'),
        });
        if (!result.isConfirmed) return;
      }

      // La creació és diferent per un magatzem de plataforma o un magatzem AMES
      esPlataforma = infoPropostes.value.isMagatzemDestiPlataforma;
      // El request base amb les peces seleccionades. La data i el tancament dels albarans nous
      // es decideixen al modal previ d'opcions (onOpcionsConfirmades).
      baseRequest = {
        magatzem: infoPropostes.value.magatzemOrigen,
        magatzemDesti: infoPropostes.value.magatzemDesti,
        agruparPerClient: agruparPerClient.value,
        pecesServir: liniesAServir.map(linia => ({
          articleClient: {
            artint: linia.artint,
            clicod: linia.clicod
          },
          quantitat: linia.qtatTraspassableDefinitiva,
          // Info de comanda de la primera línia a servir del grup; el backend de plataforma la posa a la línia de l'albarà
          infoComanda: linia.infoComandaPrimeraLinia
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
      previewData.value = await carrega(esPlataforma
        ? albaraService.calcularAlbaraTraspasPlataforma({ ...baseRequest })
        : albaraService.calcularAlbaraTraspas({ ...baseRequest }));
      visibleConfirmacio.value = true;
    };

    // Recàlcul en viu quan l'usuari canvia les opcions d'aprofitament d'albarans oberts (global o per albarà)
    const recalcular = async (opcions) => {
      previewData.value = await carrega(esPlataforma
        ? albaraService.calcularAlbaraTraspasPlataforma({ ...baseRequest, ...opcions })
        : albaraService.calcularAlbaraTraspas({ ...baseRequest, ...opcions }));
    };

    const confirmarCreacio = async (opcions) => {
      // 2a fase: crear enviant la signatura de la proposta acceptada i les opcions d'aprofitament escollides.
      // Si la proposta ha canviat, el backend no crea res i l'interceptor mostra el missatge.
      visibleConfirmacio.value = false;
      const request = { ...baseRequest, signatura: previewData.value.signatura, ...opcions };
      const resultat = await carrega(esPlataforma
        ? albaraService.crearAlbaraTraspasPlataforma(request)
        : albaraService.crearAlbaraTraspas(request));
      // Refresc de la proposta del magatzem en segon pla
      emit('albara-creat');
      // Mostrar el modal de resultat amb els albarans creats/aprofitats (per davant de la proposta)
      resultatCreacio.value = resultat?.albarans ?? [];
      visibleResultat.value = true;
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
      copyText,
      visibleAjudaStocks,
      visibleModificarQuantitat,
      pesSeleccionat,
      tooltipPreuTraspas,
      showContextMenu,
      menuModel,
      estilRow,
      tooltipDatesTraspas,
      onQuantitatModificada,
      ferAlbarans,
      onOpcionsConfirmades,
      grupTotSeleccionat,
      toggleGrup,
      visibleConfirmacio,
      visibleOpcions,
      visibleResultat,
      resultatCreacio,
      opcionsCreacio,
      previewData,
      confirmarCreacio,
      recalcular,
      hide,
      propostesLocals,
      propostaSeleccionada,
      agrupacio,
      agrupacioOptions,
      agruparPerClient,
      permisosStore,
      visibleModalNotesEmbalatge,
      updateNotesEmbalatge,
      visibleModalLiniesTraspas,
      obrirLiniesTraspas,
      onComentarisActualitzats,
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

  .satellite-icon.highlighted {
    color: red;
  }

  ::v-deep(.p-rowgroup-header td) {
    background-color: #e9ecef !important;
  }

  .grup-header {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .grup-header-nom {
    font-weight: 400;
    color: #555;
    margin-left: 6px;
  }

  .grup-header-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
