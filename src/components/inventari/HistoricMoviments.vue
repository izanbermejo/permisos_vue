<template>
    <AjudaStocks v-if="visibleAjudaStocks" :artint="artint" :clicod="clicod"
        :carregat="visibleAjudaStocks" @update:carregat="visibleAjudaStocks = $event" />
    <CrearRegularitzacio v-if="visibleCrearRegularitzacio && state.empresa && state.magatzem"
        v-model:carregat="visibleCrearRegularitzacio"
        :artint="artint" :clicod="clicod"
        :empresa="state.empresa" :magatzem="state.magatzem"
        :movimentId="movimentAEditar ? movimentAEditar.id : null"
        :dataInicial="movimentAEditar ? $toDate(movimentAEditar.data) : null"
        :quantitatInicial="movimentAEditar ? movimentAEditar.quantitat : null"
        :observacionsInicials="movimentAEditar ? movimentAEditar.observacions : null"
        @saved="buscar()" />
    <CrearFerralla v-if="visibleCrearFerralla && state.empresa && state.magatzem"
        v-model:carregat="visibleCrearFerralla"
        :artint="artint" :clicod="clicod"
        :empresa="state.empresa" :magatzem="state.magatzem"
        :movimentId="movimentAEditar ? movimentAEditar.id : null"
        :dataInicial="movimentAEditar ? $toDate(movimentAEditar.data) : null"
        :quantitatInicial="movimentAEditar ? Math.abs(movimentAEditar.quantitat) : null"
        :observacionsInicials="movimentAEditar ? movimentAEditar.observacions : null"
        @saved="buscar()" />
    <ModalDetallAlbara v-model:visible="detallAlbaraVisible" :idAlbara="detallIdAlbara" @canviat="buscar()" />
    <ModalDetallConsum v-if="detallConsumVisible" :carregat="detallConsumVisible"
        @update:carregat="detallConsumVisible = $event"
        :idAlbara="detallIdAlbara" :clientNom="detallConsumClientNom" @canviat="buscar()" />
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <ColPickerOverlay ref="colPicker" v-model:columns="columnDefs" storageKey="historicMoviments_cols" />

    <div v-if="historicData"
         class="card" style="margin-bottom: 8px;">
        <h6 class="card-header" style="font-weight: 600; padding-top: 7px; padding-bottom: 7px; display: flex; align-items: center;">
            <span>{{ [(historicData.aclfab || '') + clicod, historicData.nomClient].filter(Boolean).join(' – ') }}</span>
            <div v-if="state.empresa && state.magatzem" style="margin-left: auto; display: flex; gap: 8px;">
                <ButtonShortcut icon="fa-solid fa-toolbox" :literal="$t('historicMoviments.botoRegularitzacio')"
                    @click="obrirCrearRegularitzacio()" />
                <ButtonShortcut icon="fa-solid fa-hammer" :literal="$t('historicMoviments.botoFerralla')"
                    @click="obrirCrearFerralla()" />
            </div>
        </h6>
        <div class="card-body" style="padding-top: 3px; padding-bottom: 3px;">
            <div class="flex-container-resum">
                <span v-if="historicData.referencia">
                    <label class="label-detall-resum">{{ $t('historicMoviments.infoReferencia') }}:</label>
                    {{ historicData.referencia }}
                </span>
                <span v-if="historicData.formaEnviamentHabitual">
                    <label class="label-detall-resum">{{ $t('historicMoviments.infoEnviamentHabitual') }}:</label>
                    <span v-tooltip="[$t('FormaEnviament.'+historicData.formaEnviamentHabitual), historicData.incotermHabitual, historicData.destiHabitual ? $destiTransport(historicData.destiHabitual) : null].filter(Boolean).join(' • ')">
                        {{ [$t('FormaEnviament.'+historicData.formaEnviamentHabitual), historicData.incotermHabitual, historicData.destiHabitual ? $destiTransport(historicData.destiHabitual) : null].filter(Boolean).join(' • ') }}
                    </span>
                </span>
                <span>
                    <label class="label-detall-resum">{{ $t('historicMoviments.stockActualTotal') }}:</label>
                    <span :class="{'stock-satelit': historicData.isTePesesSatelit}">{{ $n(historicData.stockTotal) }}</span>
                    <Button icon="pi pi-eye" @click="visibleAjudaStocks = true"
                        class="p-button-rounded botoveurestock" />
                </span>
            </div>
        </div>
    </div>

    <div class="card" style="margin-bottom: 8px;">
        <div class="card-header filtre">
            <div class="element-filtre">
                <label>{{ $t('historicMoviments.empresa') }} ({{ empresesOptions.length }})</label>
                <Dropdown v-model="state.empresa" :options="empresesOptions"
                    optionLabel="label" optionValue="value"
                    :placeholder="$t('historicMoviments.empresa')"
                    style="width: 300px;" />
            </div>
            <div class="element-filtre">
                <label>{{ $t('historicMoviments.magatzem') }} ({{ magatzems.length }})</label>
                <Dropdown v-model="state.magatzem" :options="magatzems"
                    optionLabel="label" optionValue="value"
                    :placeholder="$t('historicMoviments.magatzem')"
                    :disabled="!state.empresa"
                    style="width: 340px;" />
            </div>
            <div class="element-filtre">
                <label>{{ $t('historicMoviments.dataInici') }}</label>
                <CalendarInput v-model="state.dataInici" />
            </div>
            <div class="element-filtre">
                <label>{{ $t('historicMoviments.dataFi') }}</label>
                <CalendarInput v-model="state.dataFi" />
            </div>
            <div class="element-filtre">
                <label>{{ $t('historicMoviments.filtreTipusMoviment') }}</label>
                <MultiSelect v-model="state.filtresMoviment" :options="tipusMovimentsOptions"
                    optionLabel="label" optionValue="value"
                    :placeholder="$t('historicMoviments.filtreTipusTots')"
                    class="multiselect-filtre-tipus"
                    style="width: 230px;" />
            </div>
            <div class="element-filtre" style="align-self: flex-end;">
                <Button :label="$t('historicMoviments.buscar')" icon="pi pi-search"
                    class="p-button-sm"
                    :disabled="!state.empresa || !state.magatzem"
                    @click="buscar()" />
            </div>
        </div>
    </div>

    <div class="card" style="margin-top: 8px;">
        <h6 class="card-header" style="font-weight: 600; display: flex; align-items: center;">
            <Button icon="pi pi-sliders-h" class="p-button-text p-button-sm"
                style="margin-right: 2px; height: 1.5rem; width: 1.5rem;"
                @click="colPicker.toggle($event)" />
            <span v-if="state.moviments !== null && state.moviments.length > 0">
                {{ $t('historicMoviments.movimentsTrobats') }}: {{ $n(state.moviments.length) }} –
                {{ $t('historicMoviments.existenciaInicial') }}: {{ $n(state.existenciaInicial) }} peces –
                {{ $t('historicMoviments.existenciaFinal') }}: {{ $n(state.resumMoviments.existenciaFinal) }} peces
            </span>
            <span v-else>{{ $t('historicMoviments.titol') }}</span>
            <ButtonShortcut icon="fa-solid fa-file-excel" :literal="$t('Comandes.Descarregar taula')"
                style="margin-left: auto;"
                @click="exportarTaula()" />
        </h6>
        <div id="historicMovimentsTable" class="card-body" style="min-height: 425px; max-height: 425px; padding: 0;">
        <DataTable :value="state.moviments || []"
            :dataKey="id"
            class="p-datatable-sm-petita"
            showGridlines
            selectionMode="single"
            v-model:selection="registreSeleccionat"
            v-model:expandedRows="expandedRows"
            contextMenu v-model:contextMenuSelection="registreSeleccionat"
            :scrollable="true" scrollDirection="both" scrollHeight="425px"
            :rowClass="resolRowClass"
            @row-select="selectedIndex = $event.index"
            @rowContextmenu="showContextMenu($event)">

            <template #empty>
                <div style="width: 100%; height: 240px; text-align: center; padding-top: 60px;">
                    <InfoTaulaBuida v-if="state.moviments !== null"
                        :icon="'fa-solid fa-face-frown-open'" :literal="$t('historicMoviments.sensMoviments')" />
                    <InfoTaulaBuida v-else
                        :icon="'fa-solid fa-info'" :literal="$t('historicMoviments.indicacioFiltre')" />
                    <div v-if="state.moviments !== null && darrerMovimentCombo" style="margin-top: 10px;">
                        <a href="#" @click.prevent="anarAlDarrerMoviment"
                           style="color: #007bff; text-decoration: underline; cursor: pointer; font-size: 0.875rem;">
                            {{ $t('historicMoviments.anarAlDarrerMoviment') }}
                        </a>
                    </div>
                </div>
            </template>

            <!-- Boleta opcions (sempre visible, fora del picker) -->
            <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                <template #body="{data}">
                    <div style="width: 100%;">
                        <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                            @click="registreSeleccionat = data; contextMenu.show($event)" />
                    </div>
                </template>
            </Column>

            <Column v-for="col in visibleColumns" :key="col.key"
                :header="$t(col.headerI18n)" :style="col.colStyle"
                :headerClass="col.headerClass || ''">
                <template #body="{data}">
                    <template v-if="col.key === 'data'">
                        {{ data.data ? $d($toDate(data.data), 'short') : '' }}
                    </template>
                    <template v-else-if="col.key === 'albara'">
                        <div style="width: 100%; text-align: right;">
                            <span v-if="data.isEntregat" v-tooltip="$t('historicMoviments.albEntregat')">
                                <font-awesome-icon icon="fa-solid fa-truck" class="text-success" />
                            </span>
                            <span v-else-if="data.isServit" v-tooltip="$t('historicMoviments.albServit')">
                                <font-awesome-icon icon="fa-solid fa-truck-ramp-box" style="color: #e07b00;" />
                            </span>
                            <span v-else-if="data.isEnPreparacio" v-tooltip="$t('historicMoviments.albEnPreparacio')">
                                <font-awesome-icon icon="fa-solid fa-people-carry-box" style="color: #e07b00;" />
                            </span>
                            <span
                                :style="{ visibility: data.isFacturat ? 'visible' : 'hidden', cursor: 'pointer' }"
                                v-tooltip="$t('historicMoviments.albFacturat')"
                                style="margin-left: 5px;"
                                @click.stop="toggleFactures(data)">
                                <font-awesome-icon icon="fa-solid fa-file-invoice" class="text-success" />
                            </span>
                            <span v-if="data.numeroAlbara != null" class="albara-link" style="margin-left: 15px;"
                                v-tooltip="$t('Albarans.Veure detall')"
                                @click.stop="obrirDetallAlbara(data)">{{ String(data.numeroAlbara).padStart(7, '0') }}</span>
                        </div>
                    </template>
                    <template v-else-if="col.key === 'albaraEspecial'">
                        <div v-if="data.albaraEspecial" class="ellipsis albara-especial" v-tooltip="data.albaraEspecial">
                            {{ data.albaraEspecial }}
                        </div>
                    </template>
                    <template v-else-if="col.key === 'identificadorConsum'">
                        <div v-if="data.identificadorConsum" class="ellipsis" v-tooltip="data.identificadorConsum">
                            {{ data.identificadorConsum }}
                        </div>
                    </template>
                    <template v-else-if="col.key === 'concepte'">
                        <div class="ellipsis" v-tooltip="resolConcepte(data)">{{ resolConcepte(data) }}</div>
                    </template>
                    <template v-else-if="col.key === 'entrades'">
                        <div v-if="resolColumna(data) === 'entrades'" class="cel-entrades">{{ $n(data.quantitat) }}</div>
                    </template>
                    <template v-else-if="col.key === 'sortides'">
                        <div v-if="resolColumna(data) === 'sortides'" class="cel-sortides">{{ $n(data.quantitat) }}</div>
                    </template>
                    <template v-else-if="col.key === 'existencia'">
                        <div class="cel-existencia">{{ $n(data.existencia) }}</div>
                    </template>
                    <template v-else-if="col.key === 'preu'">
                        <div v-if="data.preu != null" class="cel-preu">{{ $n(data.preu) }}</div>
                    </template>
                    <template v-else-if="col.key === 'divisa'">
                        <div v-if="data.divisa != null" class="cel-divisa">{{ data.divisa }}</div>
                    </template>
                    <template v-else-if="col.key === 'notes'">
                        <div class="ellipsis" v-tooltip="data.observacions">{{ data.observacions }}</div>
                    </template>
                    <template v-else-if="col.key === 'formaEnviament'">
                        <span v-if="data.formaEnviament"
                            :style="{ color: isEnviamentDestacat(data) ? 'green' : '#495057', fontWeight: isEnviamentDestacat(data) ? 'bold' : 'normal' }"
                            class="ellipsis"
                            v-tooltip="`${$t('FormaEnviament.'+data.formaEnviament)} • ${data.incoterm} • ${$destiTransport(data.desti)}`">
                            {{ `${$t('FormaEnviament.'+data.formaEnviament)} • ${data.incoterm} • ${$destiTransport(data.desti)}` }}
                        </span>
                    </template>
                    <template v-else-if="col.key === 'transportista'">
                        <span v-if="data.transportista" class="ellipsis" v-tooltip="$transportista(data.transportista)">
                            {{ $transportista(data.transportista) }}
                        </span>
                    </template>
                </template>
            </Column>
            <template #expansion="slotProps">
                <div style="background-color: #ffffdc; padding: 8px 60px;">
                    <DataTable :value="liniesExpand[`${slotProps.data.numeroAlbara}_${state.empresa}_${slotProps.data.sortidaClientCodi}`]" class="p-datatable-sm" showGridlines>
                        <Column :header="$t('historicMoviments.facturaColEmpresa')" :style="{width:'180px', maxWidth:'180px'}">
                            <template #body="{data}">
                                <div class="ellipsis" v-tooltip="provEmpresa(data.empcod)">{{ provEmpresa(data.empcod) }}</div>
                            </template>
                        </Column>
                        <Column field="fcctip" :header="$t('historicMoviments.facturaColTipus')" :style="{width:'55px'}" />
                        <Column :header="$t('historicMoviments.facturaColFactura')" :style="{width:'100px'}">
                            <template #body="{data}">
                                <span :style="data.fclfrannt ? 'font-weight:600;' : ''"
                                      v-tooltip="data.fclfrannt || undefined">
                                    {{ data.fccnum }}
                                </span>
                            </template>
                        </Column>
                        <Column :header="$t('historicMoviments.facturaColLinia')" :style="{width:'55px'}" headerClass="col-num">
                            <template #body="{data}">
                                <div style="width:100%; text-align:right;">{{ data.fcllin }}</div>
                            </template>
                        </Column>
                        <Column field="tiplin" :header="$t('historicMoviments.facturaColTipLinia')" :style="{width:'55px'}" />
                        <Column field="matriu" :header="$t('historicMoviments.facturaColMatriu')" :style="{width:'80px'}" />
                        <Column field="codcli" :header="$t('historicMoviments.facturaColClient')" :style="{width:'80px'}" />
                        <Column :header="$t('historicMoviments.facturaColComanda')" :style="{width:'200px', maxWidth:'200px'}">
                            <template #body="{data}">
                                <div class="ellipsis" v-tooltip="data.fclcom">{{ data.fclcom }}</div>
                            </template>
                        </Column>
                        <Column :header="$t('historicMoviments.facturaColQuantitat')" :style="{width:'90px'}" headerClass="col-num">
                            <template #body="{data}">
                                <div style="width:100%; text-align:right;">{{ $n(data.fclq) }}</div>
                            </template>
                        </Column>
                        <Column :header="$t('historicMoviments.facturaColPreu')" :style="{width:'100px'}" headerClass="col-num">
                            <template #body="{data}">
                                <div style="width:100%; text-align:right;">{{ $n(data.fclpre) }}</div>
                            </template>
                        </Column>
                        <Column field="divisaDisplay" header="" :style="{width:'70px'}" />
                        <Column :header="$t('historicMoviments.facturaColDescompte')" :style="{width:'90px'}" headerClass="col-num">
                            <template #body="{data}">
                                <div style="width:100%; text-align:right;">{{ $n(data.fcldtonor) }}</div>
                            </template>
                        </Column>
                        <Column :header="$t('historicMoviments.facturaColImport')" :style="{width:'100px'}" headerClass="col-num">
                            <template #body="{data}">
                                <div style="width:100%; text-align:right;">{{ $n(data.fclimp) }}</div>
                            </template>
                        </Column>
                        <Column field="divimplin" header="" :style="{width:'60px'}" />
                    </DataTable>
                </div>
            </template>
        </DataTable>
        </div>
    </div>

    <!-- Resum moviments -->
    <div v-if="state.moviments !== null && state.moviments.length > 0" class="card" style="margin-top: 8px;">
        <h6 class="card-header" style="font-weight: 600; padding-top: 7px; padding-bottom: 7px;">
            {{ $t('historicMoviments.resumTitol') }}
        </h6>
        <div class="card-body" style="padding-top: 3px; padding-bottom: 3px;">
            <div class="flex-container-resum">
                <span>
                    <label class="label-detall-resum">{{ $t('historicMoviments.resumEntrades') }}:</label>
                    {{ $n(state.resumMoviments.entrades) }}
                </span>
                <span v-if="state.resumMoviments.devolucionsAFabrica !== 0">
                    <label class="label-detall-resum">{{ $t('historicMoviments.resumDevolucionsAFabrica') }}:</label>
                    {{ $n(state.resumMoviments.devolucionsAFabrica) }}
                </span>
                <span>
                    <label class="label-detall-resum">{{ $t('historicMoviments.resumSortides') }}:</label>
                    {{ $n(state.resumMoviments.sortides) }}
                </span>
                <span v-if="state.resumMoviments.devolucionsDeClient !== 0">
                    <label class="label-detall-resum">{{ $t('historicMoviments.resumDevolucionsDeClient') }}:</label>
                    {{ $n(state.resumMoviments.devolucionsDeClient) }}
                </span>
                <span v-if="state.resumMoviments.ferralla !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.FERRALLA') }}:</label>
                    {{ $n(state.resumMoviments.ferralla) }}
                </span>
                <span v-if="state.resumMoviments.regularitzacio !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.REGULARITZACIO') }}:</label>
                    {{ $n(state.resumMoviments.regularitzacio) }}
                </span>
                <span v-if="state.resumMoviments.traspasMagatzem !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.TRASPAS_MAGATZEM') }}:</label>
                    {{ $n(state.resumMoviments.traspasMagatzem) }}
                </span>
                <span v-if="state.resumMoviments.traspasClient !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.TRASPAS_CLIENT') }}:</label>
                    {{ $n(state.resumMoviments.traspasClient) }}
                </span>
                <span v-if="state.resumMoviments.traspasEmpresa !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.TRASPAS_EMPRESA') }}:</label>
                    {{ $n(state.resumMoviments.traspasEmpresa) }}
                </span>
                <span v-if="state.resumMoviments.compraExistencies !== 0">
                    <label class="label-detall-resum">{{ $t('moviments.COMPRA_EXISTENCIES') }}:</label>
                    {{ $n(state.resumMoviments.compraExistencies) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import moment from 'moment';
import CalendarInput from '@/components/prime/CalendarInput.vue';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import CrearRegularitzacio from '@/views/modals/CrearRegularitzacio.vue';
import CrearFerralla from '@/views/modals/CrearFerralla.vue';
import ColPickerOverlay from '@/components/prime/ColPickerOverlay.vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import ModalDetallAlbara from '@/views/modals/albara/ModalDetallAlbara.vue';
import InventariService from '@/services/inventari.service';
import { carrega } from '@/services/loader';
import { scrollCenter, controlDataTable } from '@/utils/datetableUtils.js';
import { ExcelExporter } from '@/utils/ExcelExporter';

// Import asíncron per trencar la dependència circular de components:
// ModalDetallConsum → ModalHistoricMoviments → HistoricMoviments → ModalDetallConsum.
// Amb import estàtic, un dels registres del cicle captura `undefined` i el diàleg no es renderitza.
const ModalDetallConsum = defineAsyncComponent(() => import('@/views/modals/consums/ModalDetallConsum.vue'));

export default {
    name: 'HistoricMoviments',
    components: {
        CalendarInput,
        InfoTaulaBuida,
        AjudaStocks,
        CrearRegularitzacio,
        CrearFerralla,
        ColPickerOverlay,
        ButtonShortcut,
        ModalDetallAlbara,
        ModalDetallConsum,
    },
    props: {
        artint: { type: String, required: true },
        clicod: { type: String, required: true },
    },
    emits: ['close', 'aclfab'],
    setup(props, { emit }) {
        const { t, n, d } = useI18n();
        const confirm = useConfirm();
        const toDate = inject('toDate');
        const provFabrica = inject('fabrica');
        const provEmpresa = inject('empresa');
        const provMagatzem = inject('magatzem');
        const provTransportista = inject('transportista');
        const destiTransport = inject('destiTransport');

        const historicData = ref(null);
        const visibleAjudaStocks = ref(false);
        const visibleCrearRegularitzacio = ref(false);
        const visibleCrearFerralla = ref(false);
        const movimentAEditar = ref(null);
        const registreSeleccionat = ref(null);
        const selectedIndex = ref(-1);
        const contextMenu = ref();
        const colPicker = ref();
        const liniesExpand = ref({});
        const expandedRows = ref([]);
        const detallAlbaraVisible = ref(false);
        const detallConsumVisible = ref(false);
        const detallConsumClientNom = ref('');
        const detallIdAlbara = ref(null);

        const obrirDetallAlbara = (data) => {
            if (data.numeroAlbara == null || !state.empresa) return;
            detallIdAlbara.value = { codi: data.numeroAlbara, empresa: state.empresa };
            // Els albarans de consum tenen un modal de detall propi (simplificat)
            if (data.tipusAlbara === 'CONSUM') {
                detallConsumClientNom.value = data.sortidaClientNom || '';
                detallConsumVisible.value = true;
            } else {
                detallAlbaraVisible.value = true;
            }
        };

        const columnDefs = ref([
            { key: 'data',           headerI18n: 'historicMoviments.columnaData',          visible: true,  colStyle: { width: '95px',  maxWidth: '95px'  } },
            { key: 'albara',         headerI18n: 'historicMoviments.columnaAlbara',         visible: true,  colStyle: { width: '130px', maxWidth: '130px' } },
            { key: 'albaraEspecial', headerI18n: 'historicMoviments.columnaAlbaraEspecial', visible: false, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'identificadorConsum', headerI18n: 'historicMoviments.columnaIdentificadorConsum', visible: false, colStyle: { width: '140px', maxWidth: '140px' } },
            { key: 'concepte',       headerI18n: 'historicMoviments.columnaConcepte',       visible: true,  colStyle: { width: '260px', maxWidth: '260px' } },
            { key: 'entrades',       headerI18n: 'historicMoviments.columnaEntrades',       visible: true,  colStyle: { width: '90px',  maxWidth: '90px'  }, headerClass: 'col-num' },
            { key: 'sortides',       headerI18n: 'historicMoviments.columnaSortides',       visible: true,  colStyle: { width: '90px',  maxWidth: '90px'  }, headerClass: 'col-num' },
            { key: 'existencia',     headerI18n: 'historicMoviments.columnaExistencia',     visible: true,  colStyle: { width: '90px',  maxWidth: '90px'  }, headerClass: 'col-num' },
            { key: 'preu',           headerI18n: 'historicMoviments.columnaPreu',           visible: true,  colStyle: { width: '100px', maxWidth: '100px' }, headerClass: 'col-num' },
            { key: 'divisa',         headerI18n: 'historicMoviments.columnaDivisa',         visible: true,  colStyle: { width: '45px',  maxWidth: '45px'  } },
            { key: 'notes',          headerI18n: 'historicMoviments.columnaNotes',          visible: true,  colStyle: { width: '150px' } },
            { key: 'formaEnviament', headerI18n: 'historicMoviments.columnaFormaEnviament', visible: true,  colStyle: { width: '280px', maxWidth: '280px' } },
            { key: 'transportista',  headerI18n: 'historicMoviments.columnaTransportista',  visible: true,  colStyle: { width: '150px' } },
        ]);

        const visibleColumns = computed(() => columnDefs.value.filter(c => c.visible));

        const tipusMovimentsOptions = [
            { label: t('historicMoviments.filtreEntrades'),          value: 'ENTRADA' },
            { label: t('historicMoviments.filtreDevolucioFabrica'),  value: 'DEVOLUCIO_FABRICA' },
            { label: t('historicMoviments.filtreSortides'),          value: 'SORTIDA' },
            { label: t('historicMoviments.filtreDevolucioClient'),   value: 'DEVOLUCIO_CLIENT' },
            { label: t('historicMoviments.filtreFerralla'),          value: 'FERRALLA' },
            { label: t('historicMoviments.filtreTraspasClient'),     value: 'TRASPAS_CLIENT' },
            { label: t('historicMoviments.filtreTraspasMagatzem'),   value: 'TRASPAS_MAGATZEM' },
            { label: t('historicMoviments.filtreTraspasEmpresa'),    value: 'TRASPAS_EMPRESA' },
            { label: t('historicMoviments.filtreRegularitzacio'),    value: 'REGULARITZACIO' },
            { label: t('historicMoviments.filtreCompraExistencies'), value: 'COMPRA_EXISTENCIES' },
        ];

        const state = reactive({
            empresa: null,
            magatzem: null,
            dataInici: moment().subtract(6, 'months').toDate(),
            dataFi: moment().add(1, 'months').toDate(),
            filtresMoviment: [],
            moviments: null,
            existenciaInicial: 0,
            dataIniciAplicat: null,
            dataFiAplicat: null,
            resumMoviments: null,
        });

        const elementTaula = () => document.getElementById('historicMovimentsTable');

        const empresesOptions = computed(() => {
            if (!historicData.value) return [];
            return historicData.value.empreses.map(e => ({
                value: e.empresa,
                label: `${provEmpresa(e.empresa)} [${d(toDate(e.primerMoviment), 'short')} – ${d(toDate(e.darrerMoviment), 'short')}]`,
            }));
        });

        const magatzems = computed(() => {
            if (!historicData.value || !state.empresa) return [];
            const emp = historicData.value.empreses.find(e => e.empresa === state.empresa);
            if (!emp) return [];
            return emp.magatzems.map(m => ({
                value: m.magatzem,
                label: `${provMagatzem(m.magatzem)} · ${n(m.stock)} [${d(toDate(m.primerMoviment), 'short')} – ${d(toDate(m.darrerMoviment), 'short')}]`,
            }));
        });

        watch(() => state.empresa, () => {
            state.magatzem = null;
            if (magatzems.value.length === 1) {
                state.magatzem = magatzems.value[0].value;
            }
        });

        watch(selectedIndex, () => {
            if (state.moviments && selectedIndex.value >= 0 && selectedIndex.value < state.moviments.length) {
                registreSeleccionat.value = state.moviments[selectedIndex.value];
            }
        });

        onMounted(async () => {
            document.addEventListener('keydown', handler);
            const resp = await carrega(InventariService.obtenirHistoric(
                props.artint, props.clicod, state.dataInici, state.dataFi
            ));
            historicData.value = resp;
            emit('aclfab', resp.aclfab);
            if (resp.empresaSeleccionada) {
                state.empresa = resp.empresaSeleccionada;
                await nextTick(); // deixar que el watch(empresa) reseteji magatzem abans d'assignar
                state.magatzem = resp.magatzemSeleccionat;
                state.moviments = resp.movimentsResponse.moviments || [];
                state.existenciaInicial = resp.movimentsResponse.existenciaInicial ?? 0;
                state.dataIniciAplicat = new Date(state.dataInici);
                state.dataFiAplicat = new Date(state.dataFi);
                state.resumMoviments = resp.movimentsResponse;
                if (state.moviments.length > 0) {
                    await nextTick();
                    selectedIndex.value = state.moviments.length - 1;
                    scrollCenter(elementTaula(), selectedIndex);
                }
            }
        });

        onUnmounted(() => {
            document.removeEventListener('keydown', handler);
        });

        const handler = (ev) => {
            // Mentre el modal de detall d'albarà és obert, no reaccionem (Escape el tanca a ell, no l'històric)
            if (detallAlbaraVisible.value) return;
            if (ev.key === 'Escape') {
                emit('close');
                return;
            }
            if (state.moviments === null) return;
            controlDataTable(ev, elementTaula(), selectedIndex, { value: state.moviments });
        };

        const buscar = async () => {
            if (!state.empresa || !state.magatzem) return;
            const resp = await carrega(InventariService.obtenirHistoric(
                props.artint, props.clicod,
                state.dataInici, state.dataFi,
                state.empresa, state.magatzem,
                state.filtresMoviment
            ));
            historicData.value = resp;
            state.moviments = resp.movimentsResponse.moviments || [];
            state.existenciaInicial = resp.movimentsResponse.existenciaInicial ?? 0;
            state.dataIniciAplicat = new Date(state.dataInici);
            state.dataFiAplicat = new Date(state.dataFi);
            state.resumMoviments = resp.movimentsResponse;
            if (state.moviments.length > 0) {
                await nextTick();
                selectedIndex.value = state.moviments.length - 1;
                scrollCenter(elementTaula(), selectedIndex);
            }
        };

        const toggleFactures = async (data) => {
            if (!data.isFacturat || data.numeroAlbara == null) return;
            const index = expandedRows.value.indexOf(data);
            if (index !== -1) {
                expandedRows.value.splice(index, 1);
            } else {
                const clau = `${data.numeroAlbara}_${state.empresa}_${data.sortidaClientCodi}`;
                if (!liniesExpand.value[clau]) {
                    liniesExpand.value[clau] = await carrega(InventariService.facturesLiniesMoviment(
                        data.numeroAlbara, state.empresa, data.sortidaClientCodi, props.artint
                    ));
                }
                expandedRows.value.push(data);
            }
        };

        const resolColumna = (row) => {
            return row.tipus === 'SORTIDA' ? 'sortides' : 'entrades';
        };

        const isConsum = (row) => row.tipusAlbara === 'CONSUM';

        // Als albarans de consum la forma d'enviament no es compara amb la habitual del client:
        // no té sentit destacar-la perquè el material no surt cap al client.
        const isEnviamentDestacat = (row) => !row.isMateixaFormaEnviamentHabitual && !isConsum(row);

        const resolRowClass = (row) => isEnviamentDestacat(row) ? 'estilRow row-enviament-diferent' : 'estilRow';

        const resolConcepte = (row) => {
            switch (row.tipus) {
                case 'SORTIDA': {
                    const concepte = row.quantitat < 0
                        ? t('historicMoviments.devolucioDelClient', [row.sortidaClientNom || row.sortidaClientCodi || ''])
                        : props.clicod === '000000'
                            ? [row.sortidaClientCodi, row.sortidaClientNom].filter(Boolean).join(' - ')
                            : (row.sortidaClientNom || row.sortidaClientCodi || '');
                    return isConsum(row) ? t('historicMoviments.consum', [concepte]) : concepte;
                }
                case 'ENTRADA': return row.quantitat < 0
                    ? t('historicMoviments.devolucioAFabrica')
                    : (row.entradaFabrica ? provFabrica(row.entradaFabrica) : '');
                case 'TRASPAS_CLIENT': return t('historicMoviments.traspasAClient', [row.traspasClientReceptor || '']);
                case 'TRASPAS_MAGATZEM': return row.quantitat < 0
                    ? t('historicMoviments.traspasAlMagatzem', [row.traspasMagatzemReceptor || ''])
                    : t('historicMoviments.traspasDelMagatzem', [row.traspasMagatzemReceptor || '']);
                case 'TRASPAS_EMPRESA': return row.quantitat < 0
                    ? t('historicMoviments.traspasALEmpresa', [provEmpresa(row.traspasEmpresaReceptora || '')])
                    : t('historicMoviments.traspasDeLEmpresa', [provEmpresa(row.traspasEmpresaReceptora || '')]);
                case 'FERRALLA': return t('moviments.FERRALLA');
                case 'REGULARITZACIO': return t('moviments.REGULARITZACIO');
                case 'COMPRA_EXISTENCIES': return t('moviments.COMPRA_EXISTENCIES');
                default: return '';
            }
        };

        const darrerMovimentCombo = computed(() => {
            if (!historicData.value || !state.empresa || !state.magatzem) return null;
            const emp = historicData.value.empreses.find(e => e.empresa === state.empresa);
            if (!emp) return null;
            const mag = emp.magatzems.find(m => m.magatzem === state.magatzem);
            return mag ? mag.darrerMoviment : null;
        });

        const anarAlDarrerMoviment = async () => {
            if (!darrerMovimentCombo.value) return;
            state.dataFi = moment(darrerMovimentCombo.value).toDate();
            state.dataInici = moment(darrerMovimentCombo.value).subtract(3, 'months').toDate();
            await buscar();
        };

        const exportarTaula = () => {
            if (!state.moviments || state.moviments.length === 0) return;
            const columnes = [];
            for (const col of visibleColumns.value) {
                switch (col.key) {
                    case 'data':
                        columnes.push({ titol: t(col.headerI18n), width: 12, valor: row => row.data ? d(toDate(row.data), 'short') : '' });
                        break;
                    case 'albara':
                        columnes.push({ titol: t('historicMoviments.exportAlbaraEstat'), width: 14, valor: row => row.isEntregat ? t('historicMoviments.albEntregat') : row.isServit ? t('historicMoviments.albServit') : row.isEnPreparacio ? t('historicMoviments.albEnPreparacio') : '' });
                        columnes.push({ titol: t('historicMoviments.exportAlbaraFacturat'), width: 10, valor: row => row.isFacturat ? t('App.Si') : t('App.No') });
                        columnes.push({ titol: t('historicMoviments.exportAlbaraCodi'), width: 12, valor: row => row.numeroAlbara != null ? String(row.numeroAlbara).padStart(7, '0') : '' });
                        break;
                    case 'albaraEspecial':
                        columnes.push({ titol: t(col.headerI18n), width: 14, valor: row => row.albaraEspecial || '' });
                        break;
                    case 'identificadorConsum':
                        columnes.push({ titol: t(col.headerI18n), width: 18, valor: row => row.identificadorConsum || '' });
                        break;
                    case 'concepte':
                        columnes.push({ titol: t(col.headerI18n), width: 32, valor: row => resolConcepte(row) });
                        break;
                    case 'entrades':
                        columnes.push({ titol: t(col.headerI18n), width: 10, format: 'numeric', decimals: 0, valor: row => resolColumna(row) === 'entrades' ? row.quantitat : null });
                        break;
                    case 'sortides':
                        columnes.push({ titol: t(col.headerI18n), width: 10, format: 'numeric', decimals: 0, valor: row => resolColumna(row) === 'sortides' ? row.quantitat : null });
                        break;
                    case 'existencia':
                        columnes.push({ titol: t(col.headerI18n), width: 10, format: 'numeric', decimals: 0, valor: row => row.existencia });
                        break;
                    case 'preu':
                        columnes.push({ titol: t(col.headerI18n), width: 12, format: 'numeric', decimals: 2, valor: row => row.preu ?? null });
                        break;
                    case 'divisa':
                        columnes.push({ titol: t(col.headerI18n), width: 8, valor: row => row.divisa || '' });
                        break;
                    case 'notes':
                        columnes.push({ titol: t(col.headerI18n), width: 28, valor: row => row.observacions || '' });
                        break;
                    case 'formaEnviament':
                        columnes.push({ titol: t(col.headerI18n), width: 40, valor: row => row.formaEnviament ? [t('FormaEnviament.'+row.formaEnviament), row.incoterm, row.desti ? destiTransport(row.desti) : null].filter(Boolean).join(' • ') : '' });
                        break;
                    case 'transportista':
                        columnes.push({ titol: t(col.headerI18n), width: 22, valor: row => row.transportista ? provTransportista(row.transportista) : '' });
                        break;
                }
            }
            ExcelExporter.export({
                filename: `${(historicData.value?.aclfab || '') + props.clicod}_${state.empresa}_${state.magatzem}_${moment(state.dataIniciAplicat || state.dataInici).format('YYYYMMDD')}_${moment(state.dataFiAplicat || state.dataFi).format('YYYYMMDD')}.xlsx`,
                configuracioExcel: { dades: state.moviments, columnes },
            });
        };

        const obrirCrearRegularitzacio = () => {
            movimentAEditar.value = null;
            visibleCrearRegularitzacio.value = true;
        };

        const obrirEditarRegularitzacio = () => {
            movimentAEditar.value = registreSeleccionat.value;
            visibleCrearRegularitzacio.value = true;
        };

        const eliminarRegularitzacio = async () => {
            const confirmed = await new Promise((resolve) => {
                confirm.require({
                    message: t('historicMoviments.confirmarEliminar'),
                    header: t('App.Confirmacio'),
                    icon: 'pi pi-exclamation-triangle',
                    accept:  () => resolve(true),
                    reject:  () => resolve(false),
                    onHide:  () => resolve(false),
                });
            });
            if (!confirmed) return;
            try {
                await carrega(InventariService.eliminarRegularitzacio(registreSeleccionat.value.id));
                await buscar();
            } catch {
                // Error ja gestionat pel interceptor global (Swal)
            }
        };

        const obrirCrearFerralla = () => {
            movimentAEditar.value = null;
            visibleCrearFerralla.value = true;
        };

        const obrirEditarFerralla = () => {
            movimentAEditar.value = registreSeleccionat.value;
            visibleCrearFerralla.value = true;
        };

        const eliminarFerralla = async () => {
            const confirmed = await new Promise((resolve) => {
                confirm.require({
                    message: t('historicMoviments.confirmarEliminarFerralla'),
                    header: t('App.Confirmacio'),
                    icon: 'pi pi-exclamation-triangle',
                    accept:  () => resolve(true),
                    reject:  () => resolve(false),
                    onHide:  () => resolve(false),
                });
            });
            if (!confirmed) return;
            try {
                await carrega(InventariService.eliminarFerralla(registreSeleccionat.value.id));
                await buscar();
            } catch {
                // Error ja gestionat pel interceptor global (Swal)
            }
        };

        const menuModel = computed(() => {
            if (!registreSeleccionat.value) return [];
            if (registreSeleccionat.value.tipus === 'REGULARITZACIO') {
                return [
                    { label: t('historicMoviments.editarRegularitzacio'), icon: 'pi pi-pencil', command: obrirEditarRegularitzacio },
                    { label: t('historicMoviments.eliminarRegularitzacio'), icon: 'pi pi-trash', command: eliminarRegularitzacio },
                ];
            }
            if (registreSeleccionat.value.tipus === 'FERRALLA') {
                return [
                    { label: t('historicMoviments.editarFerralla'), icon: 'pi pi-pencil', command: obrirEditarFerralla },
                    { label: t('historicMoviments.eliminarFerralla'), icon: 'pi pi-trash', command: eliminarFerralla },
                ];
            }
            return [];
        });

        const showContextMenu = (ev) => {
            const idx = state.moviments.indexOf(ev.data);
            if (idx >= 0) selectedIndex.value = idx;
            registreSeleccionat.value = ev.data;
            contextMenu.value.show(ev.originalEvent);
        };

        return {
            state,
            tipusMovimentsOptions,
            historicData,
            registreSeleccionat,
            selectedIndex,
            contextMenu,
            colPicker,
            columnDefs,
            visibleColumns,
            empresesOptions,
            magatzems,
            buscar,
            darrerMovimentCombo,
            anarAlDarrerMoviment,
            resolColumna,
            resolConcepte,
            resolRowClass,
            isEnviamentDestacat,
            menuModel,
            showContextMenu,
            liniesExpand,
            expandedRows,
            toggleFactures,
            provEmpresa,
            visibleAjudaStocks,
            visibleCrearRegularitzacio,
            visibleCrearFerralla,
            movimentAEditar,
            obrirCrearRegularitzacio,
            obrirCrearFerralla,
            exportarTaula,
            detallAlbaraVisible,
            detallConsumVisible,
            detallConsumClientNom,
            detallIdAlbara,
            obrirDetallAlbara,
        };
    },
};
</script>

<style scoped>
::v-deep(.multiselect-filtre-tipus) {
    height: 2rem;
    min-height: unset;
    overflow: hidden;
}

::v-deep(.multiselect-filtre-tipus .p-multiselect-label-container) {
    overflow: hidden;
    display: flex;
    align-items: center;
}

.botoveurestock {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: 3px;
}

.stock-satelit {
    background-color: #E1B3F0;
    border: 2px solid #9C79F7;
    border-radius: 8px;
    padding: 0px 2px;
}

.filtre {
    display: flex;
    column-gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
    row-gap: 8px;
    padding: 8px 12px;
}

.element-filtre {
    display: flex;
    flex-direction: column;
    row-gap: 3px;
}

.element-filtre label {
    display: block;
    font-weight: 600;
}

.data-aplicada {
    color: #888;
    font-size: 0.875rem;
    margin-left: 6px;
}


.cel-entrades {
    width: 100%;
    text-align: right;
}

.cel-sortides {
    width: 100%;
    text-align: right;
}

.cel-preu {
    width: 100%;
    text-align: right;
}

.cel-divisa {
}

.cel-existencia {
    width: 100%;
    text-align: right;
    font-weight: 600;
}

.flex-container-resum {
    padding: 5px 10px;
    display: flex;
    gap: 25px;
    row-gap: 5px;
    flex-wrap: wrap;
}

.label-detall-resum {
    font-weight: 600;
    font-size: 1rem;
    margin-right: 4px;
}

.albara-especial {
    font-weight: 600;
}

.albara-link {
    color: #007bff;
    text-decoration: underline;
    cursor: pointer;
}

.albara-link:hover {
    color: #0056b3;
}

.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

::v-deep(.p-datatable-thead > tr > th.col-num .p-column-header-content) {
    justify-content: flex-end;
}

::v-deep(tr.row-enviament-diferent td) {
    font-weight: 600;
}

::v-deep(.estilRow) {
    cursor: default;
    user-select: none;
}

::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
    padding: 0.0rem 0.2rem;
}

::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
    padding: 0.0rem 0.2rem;
}

::v-deep(.estilRow .ocultable) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
    visibility: hidden;
}

::v-deep(.estilRow:hover .ocultable),
::v-deep(.p-highlight .ocultable) {
    visibility: visible;
}
</style>
