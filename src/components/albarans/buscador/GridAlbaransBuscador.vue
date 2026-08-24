<template>
<ModalAdjuntsAlbarans v-if="visibleModalAdjunts" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :albara="selectedAlbara.id.codiFormat" 
    @update:numAdjunts="updateAdjunts"/>
<ModalMarcarUrgent v-if="visibleModalUrgent" :carregat="visibleModalUrgent"
    @update:carregat="visibleModalUrgent = $event"
    :albara="selectedAlbara"
    @marcat="onUrgentMarcat" />
<div id="gridAlbaransBuscador">
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)" />
    <ColPickerOverlay ref="colPicker" v-model:columns="columnDefs" storageKey="gridAlbaransBuscador_cols" />
    <DataTable
        :value="albarans"
        class="p-datatable-sm-petita"
        v-model:selection="selectedAlbara"
        selectionMode="single"
        dataKey="_key"
        showGridlines
        :scrollable="true" scrollDirection="both" scrollHeight="flex"
        :resizableColumns="true" columnResizeMode="expand"
        contextMenu v-model:contextMenuSelection="selectedAlbara" @rowContextmenu="showContextMenu($event)"
        :rowClass="resolRowClass"
        lazy :sortField="sortField" :sortOrder="sortOrder" @sort="onSort"
        @row-select="selectedIndex = $event.index;"
        @row-dblclick="onRowDblClick"
    >
        <template #empty>
            <div style="width:100%; text-align: center; padding: 30px 0;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('App.Sense resultats')" />
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                        @click="selectedAlbara = data; contextMenu.show($event)" />
                </div>
            </template>
        </Column>
        <Column v-for="col in columnDefs.filter(c => c.visible)" :key="col.key" :header="$t(col.headerI18n)" :style="col.colStyle"
            :field="col.sortField" sortable>
            <template #body="{data}">
                <template v-if="col.key === 'empresa'">
                    <div class="ellipsis" v-tooltip="$empresa(data.id.empresa)">{{ $empresa(data.id.empresa) }}</div>
                </template>
                <template v-else-if="col.key === 'albara'">{{ data.id.codiFormat }}</template>
                <template v-else-if="col.key === 'data'">
                    {{ data.data ? $d($toDate(data.data), 'short') : '' }}
                </template>
                <template v-else-if="col.key === 'client'">
                    <span v-tooltip="data.clientNom">{{ `${data.client} - ${data.clientNom}` }}</span>
                </template>
                <template v-else-if="col.key === 'magatzem'">{{ data.magatzem }}</template>
                <template v-else-if="col.key === 'tancat'">
                    <div style="width:100%;text-align:center">
                        <i :class="data.isTancat ? 'pi pi-lock' : 'pi pi-lock-open'" />
                    </div>
                </template>
                <template v-else-if="col.key === 'facturat'">
                    <div style="width:100%;text-align:center">
                        <Tag v-if="data.isFacturat" style="background-color:#00939b" icon="pi pi-check" :value="$t('App.Si')" />
                        <Tag v-else style="background-color:#f0bd3c" icon="pi pi-clock" :value="$t('App.No')" />
                    </div>
                </template>
                <template v-else-if="col.key === 'urgent'">
                    <div style="width:100%;text-align:center">
                        <i v-if="data.isUrgent" class="pi pi-bolt" style="color:#e74c3c" v-tooltip="motiusUrgentText(data)" />
                    </div>
                </template>
                <template v-else-if="col.key === 'incidencia'">
                    <div style="width:100%;text-align:center">
                        <i v-if="data.incidencia" class="pi pi-exclamation-triangle" style="color:#f39c12" />
                    </div>
                </template>
                <template v-else-if="col.key === 'autofacturable'">
                    <div style="width:100%;text-align:center">
                        <Tag v-if="data.isFacturacioAutomatica" style="background-color:#4a9e57" icon="pi pi-check" :value="$t('App.Si')" />
                        <Tag v-else style="background-color:#8a8f96" icon="pi pi-times" :value="$t('App.No')" />
                    </div>
                </template>
            </template>
        </Column>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                <Button icon="pi pi-paperclip" @click="selectedAlbara = data; visibleModalAdjunts = true"
                    class="p-button-rounded buttoicon" :class="{'buttoicondisabled' : !data.isTeAdjunts}" />
                </div>
            </template>
        </Column>
    </DataTable>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { home, controlDataTable, ordenarLlista } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import ColPickerOverlay from '@/components/prime/ColPickerOverlay.vue';
import ModalAdjuntsAlbarans from '@/views/modals/ModalAdjuntsAlbarans.vue';
import { usePermisosStore } from '@/stores/permisos';
import ModalMarcarUrgent from '@/views/modals/albara/ModalMarcarEditarUrgent.vue';
import AlbaraService from '@/services/albara.service';
import { carrega } from '@/services/loader';

export default {
    name: 'GridAlbaransBuscador',
    components: { InfoTaulaBuida, ColPickerOverlay, ModalAdjuntsAlbarans, ModalMarcarUrgent },    
    emits: ['update:modalObert', 'canviat'],
    props: {
        modalParentObert: Boolean,
        focused: Boolean,
        idAlbara: { type: Object, default: null }
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const albarans = ref([]);
        const selectedAlbara = ref(null);
        const selectedIndex = ref(-1);
        const contextMenu = ref();
        const colPicker = ref();
        const visibleModalAdjunts = ref(false);
        const permisosStore = usePermisosStore();
        const visibleModalUrgent = ref(false);
        const motiusUrgentText = (data) => (data.motiusUrgent || []).join(', ');
        const modalObert = computed(() => visibleModalAdjunts.value || visibleModalUrgent.value);
        watch(modalObert, (newValue) => emit('update:modalObert', newValue), { immediate: true });

        const onUrgentMarcat = async ({ isUrgent, motiusUrgent, motiu, detallMotiu, imp }) => {
            const albara = selectedAlbara.value;
            if (!albara) return;

            const linees = albara.linies || [];
            const urgentLinesInicial = linees.filter(l => l.isUrgent);
            const primeraLinia = linees.find(l => l.id?.linia != null);

            albara.isUrgent = isUrgent;
            albara.motiusUrgent = motiusUrgent || [];
            albara.comentarisUrgent = detallMotiu ?? null;
            albara.motiuAltresUrgent = motiu === 'altres' ? detallMotiu ?? null : null;
            albara.impUrgent = imp ?? null;

            if (!isUrgent) {
                linees.forEach(l => { l.isUrgent = false; });
                try {
                    await Promise.all(urgentLinesInicial.map(l => AlbaraService.marcarLiniaUrgent(albara.id, [l.id?.linia], false)));
                } catch (e) {
                    console.error(e);
                }
            } else if (urgentLinesInicial.length === 0 && primeraLinia) {
                primeraLinia.isUrgent = true;
                try {
                    await AlbaraService.marcarLiniaUrgent(albara.id, [primeraLinia.id?.linia], true);
                } catch (e) {
                    primeraLinia.isUrgent = false;
                    console.error(e);
                }
            }

            emit('canviat', albara.id ?? props.idAlbara);
        };

        const columnDefs = ref([
            { key: 'empresa',  headerI18n: 'Albarans.Empresa',         visible: true, colStyle: { width: '125px', maxWidth: '125px' } },
            { key: 'albara',   headerI18n: 'Albarans.Albara',          visible: true, colStyle: { width: '130px', maxWidth: '130px' } },
            { key: 'data',     headerI18n: 'Albarans.Data',            visible: true, colStyle: { width: '110px', maxWidth: '110px' } },
            { key: 'client',   headerI18n: 'Comandes.Client',          visible: true, colStyle: { width: '200px', maxWidth: '200px' } },
            { key: 'magatzem', headerI18n: 'Albarans.Magaztem sortida',visible: true, colStyle: { width: '130px'                    } },
            { key: 'tancat',   headerI18n: 'Albarans.Tancat',          visible: true, colStyle: { width: '90px',  maxWidth: '90px'  } },
            { key: 'facturat', headerI18n: 'Albarans.Facturat',        visible: true, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'urgent',   headerI18n: 'Albarans.Urgent',          visible: true, colStyle: { width: '80px',  maxWidth: '80px'  } },
            { key: 'incidencia',   headerI18n: 'Albarans.Incidencia',          visible: true, colStyle: { width: '80px',  maxWidth: '80px'  } },
            { key: 'autofacturable', headerI18n: 'Albarans.Autofacturable', sortField: 'isFacturacioAutomatica', visible: true, colStyle: { width: '130px', maxWidth: '130px' } }
        ]);

        // Ordre inicial: per albarà de manera descendent. Un cop triat, es manté
        // entre cerques (no es reinicia). L'usuari pot reordenar per qualsevol
        // columna dins dels resultats obtinguts.
        const sortField = ref('id.codi');
        const sortOrder = ref(-1);

        // Opcions d'ordenació actuals (camp, sentit i tipus de la columna) per
        // passar-les a ordenarLlista.
        const ordreActual = () => {
            const col = columnDefs.value.find(c => c.sortField === sortField.value);
            return { field: sortField.value, order: sortOrder.value, tipus: col?.sortType };
        };

        // En clicar una capçalera reordenem físicament albarans.value (mode :lazy:
        // PrimeVue no ho fa) i recol·loquem el selectedIndex a la fila que ja
        // estava seleccionada, perquè la navegació per teclat segueixi coincidint.
        const onSort = (ev) => {
            sortField.value = ev.sortField;
            sortOrder.value = ev.sortOrder;
            const clau = selectedAlbara.value?._key;
            albarans.value = ordenarLlista(albarans.value, ordreActual());
            selectedIndex.value = clau ? albarans.value.findIndex(a => a._key === clau) : -1;
        };

        // La font de la fila distingeix d'un cop d'ull l'estat de l'albarà:
        // verda si encara està obert, vermella si ja s'ha tancat.
        const resolRowClass = (row) => row.isTancat ? 'estilRow fila-tancat' : 'estilRow fila-obert';

        const elementTaula = () => document.getElementById('gridAlbaransBuscador');

        onMounted(() => { document.addEventListener('keydown', handler); });
        onUnmounted(() => { document.removeEventListener('keydown', handler); });

        // Assigna alhora l'índex i l'albarà seleccionat, i n'emet les línies. No es pot delegar
        // en el watch(selectedIndex): aquest no s'activa quan l'índex final coincideix amb el
        // previ (p. ex. un sol resultat o tornar a la fila 0) i la selecció quedaria buida.
        const selecciona = (idx) => {
            selectedIndex.value = idx;
            selectedAlbara.value = albarans.value[idx] ?? null;
            emit('seleccio-canviada', selectedAlbara.value?.linies || [], selectedAlbara.value);
        };

        watch(selectedIndex, () => {
            selectedAlbara.value = albarans.value[selectedIndex.value] ?? null;
            emit('seleccio-canviada', selectedAlbara.value?.linies || [], selectedAlbara.value);
        });

        // En agafar el focus el grid ha de tenir sempre una fila activa, perquè la navegació
        // per teclat tingui un punt de partida.
        watch(() => props.focused, (isFocused) => {
            if (isFocused && !selectedAlbara.value && albarans.value.length) selecciona(0);
        });

        const performSearch = (albaransInput, idSeleccionar) => {
            const seleccionarKey = idSeleccionar ? `${idSeleccionar.empresa}-${idSeleccionar.codi}` : undefined;
            const mapejats = (albaransInput || []).map((a, i) => ({
                ...a,
                _key: `${a.id?.empresa}-${a.id?.codi}`,
                linies: (a.linies || []).map((l, j) => ({ ...l, _key: `linia-${i}-${j}` })),
            }));
            // En mode :lazy PrimeVue mostra l'array tal com el rebem, així que
            // l'ordenem segons l'ordenació actual (es manté la que hagi triat
            // l'usuari) perquè la vista coincideixi amb l'indicador d'ordenació.
            albarans.value = ordenarLlista(mapejats, ordreActual());

            let idx = -1;
            if (seleccionarKey) {
                idx = albarans.value.findIndex(a => a._key === seleccionarKey);
            }
            if (idx === -1 && albarans.value.length) {
                idx = 0;
                home(elementTaula(), selectedIndex, albarans);
            }

            selecciona(idx);

            // Informem el pare del nombre de resultats perquè pugui mostrar, al
            // costat del títol, quants n'hi ha i si s'ha arribat al límit.
            emit('resultats', albarans.value.length);
        };

        const handler = (ev) => {
            if (isContextMenuKey(ev)) return;
            if (props.modalParentObert) return;
            if (!props.focused) return;
            controlDataTable(ev, elementTaula(), selectedIndex, albarans);
        };

        const showContextMenu = (ev) => {
            const idx = albarans.value.findIndex(a => a._key === selectedAlbara.value?._key);
            if (idx !== -1) selectedIndex.value = idx;
            contextMenu.value.show(ev.originalEvent);
        };

        const onRowDblClick = (ev) => {
            if (ev?.data) emit('veureDetall', ev.data);
        };

        const toggleHeaderUrgency = async () => {
            const albara = selectedAlbara.value;
            if (!albara) return;

            if (albara.isUrgent) {
                const urgentLinesInicial = (albara.linies || []).filter(l => l.isUrgent);
                albara.isUrgent = false;
                albara.motiusUrgent = [];
                albara.comentarisUrgent = null;
                albara.motiuAltresUrgent = null;
                albara.impUrgent = null;
                (albara.linies || []).forEach(l => { l.isUrgent = false; });

                try {
                    await carrega(AlbaraService.desmarcarAlbaraUrgent(albara.id));
                    await carrega(Promise.all(urgentLinesInicial.map(l => AlbaraService.marcarLiniaUrgent(albara.id, [l.id?.linia], false))));
                } catch (e) {
                    console.error(e);
                }
                emit('canviat', albara.id ?? props.idAlbara);
                return;
            }

            visibleModalUrgent.value = true;
        };
        const potEditar = () => permisosStore.tePermis('COMANDES', 'WRITE');

        const menuModel = computed(() => [
            { label: () => t('Albarans.Veure detall'), icon: 'pi pi-eye', command: () => emit('veureDetall', selectedAlbara.value) },
            { label: () => t('Albarans.Imprimir albara'), icon: 'pi pi-print', command: () => emit('imprimirAlbara', selectedAlbara.value) },
            { label: () => t('Comandes.Veure adjunts'), icon: 'pi pi-paperclip', command: () => { visibleModalAdjunts.value = true; } },
            { label: () => selectedAlbara.value?.isUrgent ? t('Albarans.Desmarcar urgent') : t('Albarans.Marcar urgent'), icon: 'pi pi-bolt', command: toggleHeaderUrgency },
            { label: () => t('Albarans.Modificar albara urgent'), visible: () => selectedAlbara.value?.isUrgent, icon: 'pi pi-pencil', command: () => { visibleModalUrgent.value = true; } },
            { separator: true },
            {
                label: () => t('Albarans.Tancar albara'), icon: 'pi pi-lock',
                visible: () => !selectedAlbara.value?.isTancat && potEditar(),
                command: () => emit('tancarAlbara', selectedAlbara.value.id),
            },
            {
                label: () => t('Albarans.Reobrir albara'), icon: 'pi pi-lock-open',
                visible: () => !!selectedAlbara.value?.isTancat && potEditar(),
                command: () => emit('reobrirAlbara', selectedAlbara.value.id),
            },
            {
                // Només als albarans de client: els de traspàs i els de consum no s'autofacturen mai.
                // Un cop s'ha començat a facturar l'albarà el flag ja no es pot canviar.
                label: () => selectedAlbara.value?.isFacturacioAutomatica
                    ? t('Albarans.Treure autofacturable')
                    : t('Albarans.Marcar autofacturable'),
                icon: 'pi pi-euro',
                visible: () => selectedAlbara.value?.tipus === 'CLIENT' && potEditar(),
                disabled: () => !!selectedAlbara.value?.isFacturacioIniciada,
                command: () => emit('canviarAutofacturable', selectedAlbara.value),
            },
            { separator: true },
            {
                label: () => t('Albarans.Eliminar albara'), icon: 'pi pi-trash',
                visible: () => potEditar(),
                command: () => emit('eliminarAlbara', selectedAlbara.value.id),
            },
        ]);

        const updateAdjunts = (numAdjunts) => {
            if (!selectedAlbara.value) return;

            selectedAlbara.value.isTeAdjunts = numAdjunts > 0;
            emit('canviat', selectedAlbara.value?.id ?? props.idAlbara);
        };

        return {
            albarans, selectedAlbara, selectedIndex,
            contextMenu, menuModel, showContextMenu, onRowDblClick,
            columnDefs, performSearch, resolRowClass,
            sortField, sortOrder, onSort,
            colPicker,
            toggleColPicker: (ev) => colPicker.value.toggle(ev),
            visibleModalAdjunts,
            permisosStore, 
            updateAdjunts,
            visibleModalUrgent, onUrgentMarcat, motiusUrgentText
        };
    },
};
</script>

<style scoped>
#gridAlbaransBuscador { height: 100%; display: flex; flex-direction: column; }
::v-deep(#gridAlbaransBuscador > .p-datatable) { flex: 1; min-height: 0; }
::v-deep(.estilRow) { cursor: pointer; }
::v-deep(.estilRow .ocultable) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
    display: none;
}
::v-deep(.estilRow:hover .ocultable) { display: flex; }
/* El color s'aplica al td (i no al tr) perquè no el trepitgi el de la fila seleccionada. */
::v-deep(.p-datatable-tbody > tr.fila-obert > td) { color: #1e7e34; }
::v-deep(.p-datatable-tbody > tr.fila-tancat > td) { color: #c0392b; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) { padding: 0.0rem 0.2rem; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) { padding: 0.0rem 0.2rem; }

.ellipsis {
    white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
    overflow: hidden;         /* Oculta el texto que no cabe */
    text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
    width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
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

</style>
