<template>
<div id="gridLiniesAlbaransBuscador">
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)" />
    <ColPickerOverlay ref="colPicker" v-model:columns="columnDefs" storageKey="gridLiniesAlbaransBuscador_cols" />
    <DataTable
        :value="linies"
        class="p-datatable-sm-petita"
        v-model:selection="selectedLinia"
        selectionMode="single"
        dataKey="_key"
        showGridlines
        :scrollable="true" scrollDirection="both" scrollHeight="flex"
        :resizableColumns="true" columnResizeMode="expand"
        contextMenu v-model:contextMenuSelection="selectedLinia" @rowContextmenu="showContextMenu($event)"
        :rowClass="() => 'estilRow'"
        @row-select="selectedIndex = $event.index;"
    >
        <template #empty>
            <div style="width:100%; text-align: center; padding: 30px 0px;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('App.Sense resultats')" />
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button v-if="menuModel.length" icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                        @click="selectedLinia = data; contextMenu.show($event)" />
                </div>
            </template>
        </Column>
        <Column v-for="col in columnDefs.filter(c => c.visible)" :key="col.key" :header="$t(col.headerI18n)" :style="col.colStyle">
            <template #body="{data}">
                <template v-if="col.key === 'linia'">{{ data.id?.liniaFormat }}</template>
                <template v-else-if="col.key === 'referencia'">{{ data.pesaMatriu }}</template>
                <template v-else-if="col.key === 'article'">{{ data.pesaReferencia }}</template>
                <template v-else-if="col.key === 'quantitat'">
                    <div style="width:100%;text-align:right">{{ $n(data.quantitat) }}</div>
                </template>
                <template v-else-if="col.key === 'pdtFacturar'">
                    <div style="width:100%;text-align:right">{{ $n(data.quantitatPendentFacturar) }}</div>
                </template>
                <template v-else-if="col.key === 'pesUnitari'">
                    <div style="width:100%;text-align:right">{{ data.pesaPesUnitari ? $n(data.pesaPesUnitari) : '' }}</div>
                </template>
                <template v-else-if="col.key === 'pesTotal'">
                    <div style="width:100%;text-align:right">{{ data.pesaPesUnitari ? $n(data.pesTotal, 'decimal') : '' }}</div>
                </template>
                <template v-else-if="col.key === 'embalatge'">
                    <InfoEmbalatge :unitatsEmbalatge="data.pesaUnitatsEmbalatge" :bossesCaixa="data.pesaBossesCaixa"
                        :caixesPalet="data.pesaCaixesPalet" :isNormalitzat="data.articleClient?.isNormalitzat" />
                </template>
                <template v-else-if="col.key === 'nivellTecnic'">{{ data.pesaNivellTecnic }}</template>
                <template v-else-if="col.key === 'denominacio'">{{ data.pesaDenominacio }}</template>
                <template v-else-if="col.key === 'comanda'">{{ data.comanda ?? '' }}</template>
                <template v-else-if="col.key === 'preu'">
                    <div style="width:100%;text-align:right">
                        {{ data.preu ? `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` : '' }}
                    </div>
                </template>
                <!-- Import sempre net. Es destaca i s'explica al tooltip només quan hi ha descompte,
                     perquè altrament el net i el brut són el mateix i no hi ha res a aclarir. -->
                <template v-else-if="col.key === 'import'">
                    <div style="width:100%;text-align:right" :class="{ 'import-amb-dte': data.descompte > 0 }"
                        v-tooltip="hintImport(data)">
                        {{ $n(data.importNet, 'decimal') }} {{ data.divisaImport }}
                    </div>
                </template>
                <template v-else-if="col.key === 'dataReg'">
                    {{ data.data ? $d($toDate(data.data), 'short') : '' }}
                </template>
                <template v-else-if="col.key === 'comandaClient'">{{ data.comandaClient ?? '' }}</template>
                <template v-else-if="col.key === 'usuari'">{{ data.usuari ?? '' }}</template>
                <template v-else-if="col.key === 'urgent'">
                    <div style="width:100%;text-align:center">
                        <Checkbox :modelValue="data.isUrgent" :binary="true" disabled />
                    </div>
                </template>
                <!-- <template v-else-if="col.key === 'incidencia'">
                    <div style="width:100%;text-align:center">
                        <Checkbox :modelValue="data.isIncidencia" :binary="true"
                            :disabled="!potEditarUrgent || isUltimaLiniaUrgent(data)"
                            @change="onMarcarUrgent(data)" />
                    </div>
                </template> -->
            </template>
        </Column>
    </DataTable>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import InfoEmbalatge from '@/components/InfoEmbalatge.vue';
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import ColPickerOverlay from '@/components/prime/ColPickerOverlay.vue';
import AlbaraService from '@/services/albara.service';
import { usePermisosStore } from '@/stores/permisos';
import { useConfirm } from 'primevue/useconfirm';
import { carrega } from '@/services/loader';

export default {
    name: 'GridLiniesAlbaransBuscador',
    components: { InfoTaulaBuida, ColPickerOverlay, InfoEmbalatge },
    emits: ['urgentStateChanged', 'canviarPendentFacturar'],
    props: {
        linies: { type: Array, default: () => [] },
        // Albarà de les línies; només cal per saber si el pendent de facturar es pot rectificar
        albara: { type: Object, default: null },
        modalParentObert: Boolean,
        focused: Boolean,
    },
    setup(props, { emit }) {
        const { t, n } = useI18n();
        const selectedLinia = ref(null);
        const selectedIndex = ref(-1);
        const contextMenu = ref();
        const colPicker = ref();
        const permisosStore = usePermisosStore();
        const confirm = useConfirm();

        const potEditarUrgent = computed(() => permisosStore.tePermis('COMANDES', 'WRITE'));

        const columnDefs = ref([
            { key: 'linia',        headerI18n: 'Albarans.Linia',        visible: true, colStyle: { width: '45px',  maxWidth: '45px'  } },
            { key: 'referencia',   headerI18n: 'Albarans.Referencia',    visible: true, colStyle: { width: '75px',  maxWidth: '75px'  } },
            { key: 'article',      headerI18n: 'Albarans.Article',       visible: true, colStyle: { width: '175px', maxWidth: '175px' } },
            { key: 'quantitat',    headerI18n: 'Albarans.Quantitat',     visible: true, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'pdtFacturar',  headerI18n: 'Albarans.Pdt facturar',  visible: true, colStyle: { width: '120px', maxWidth: '120px' } },
            { key: 'pesUnitari',   headerI18n: 'Albarans.Pes unitari',   visible: true, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'pesTotal',     headerI18n: 'Albarans.Pes total',     visible: true, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'embalatge',    headerI18n: 'Albarans.Embalatge',     visible: true, colStyle: { width: '140px', maxWidth: '140px' } },
            { key: 'nivellTecnic', headerI18n: 'Albarans.Nivell tecnic', visible: true, colStyle: { width: '120px'                  } },
            { key: 'denominacio',  headerI18n: 'Albarans.Denominacio',   visible: true, colStyle: { width: '120px'                  } },
            { key: 'comanda',      headerI18n: 'Albarans.Comanda',       visible: true, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'preu',         headerI18n: 'Albarans.Preu',          visible: true, colStyle: { width: '140px', maxWidth: '140px' } },
            { key: 'import',       headerI18n: 'Albarans.Import',        visible: true, colStyle: { width: '140px', maxWidth: '140px' } },
            { key: 'versio',        headerI18n: 'Albarans.Versio',        visible: true,  colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'dataReg',       headerI18n: 'Albarans.Data reg',      visible: true,  colStyle: { width: '110px', maxWidth: '110px' } },
            { key: 'comandaClient', headerI18n: 'Albarans.Comanda client', visible: false, colStyle: { width: '130px', maxWidth: '130px' } },
            { key: 'usuari',        headerI18n: 'App.Usuari',             visible: false, colStyle: { width: '100px', maxWidth: '100px' } },
            { key: 'urgent',        headerI18n: 'Albarans.Urgent',         visible: true, colStyle: { width: '70px', maxWidth: '70px' } },
            //{ key: 'incidencia',    headerI18n: 'Albarans.Incidencia',     visible: true, colStyle: { width: '70px', maxWidth: '70px' } }
        ]);

        // Desglossa d'on surt l'import net de la línia. Retorna null quan no hi ha descompte: així
        // PrimeVue no arriba a mostrar cap tooltip en les línies on el net i el brut coincideixen.
        const hintImport = (linia) => {
            if (!(linia?.descompte > 0)) return null;
            return `${n(linia.importBrut, 'decimal')} − ${n(linia.descompte)}% = ${n(linia.importNet, 'decimal')} ${linia.divisaImport ?? ''}`.trim();
        };

        const isUltimaLiniaUrgent = (linia) => linia.isUrgent && props.linies.filter(l => l.isUrgent).length === 1;

        const onMarcarUrgent = async (linia) => {
            if (!potEditarUrgent.value) return;
            
            const valorAnterior = linia.isUrgent;
            const nouValor = !valorAnterior;
            linia.isUrgent = nouValor;

            try {
                await carrega(AlbaraService.marcarLiniaUrgent(linia.id.idAlbara, [linia.id.linia], nouValor));
                if (!props.linies.some(l => l.isUrgent)) {
                    emit('urgentStateChanged', { idAlbara: linia.id.idAlbara, isUrgent: false });
                }
            } catch (e) {
                linia.isUrgent = valorAnterior;
            }
        };
        
        const elementTaula = () => document.getElementById('gridLiniesAlbaransBuscador');

        onMounted(() => { document.addEventListener('keydown', handler);});
        onUnmounted(() => { document.removeEventListener('keydown', handler); });

        const liniesRef = computed(() => props.linies);

        // Assigna SEMPRE alhora l'índex i la línia seleccionada. No es pot delegar en el
        // watch(selectedIndex): aquest no s'activa quan l'índex final coincideix amb el previ
        // (p. ex. tornar a la línia 0 en canviar d'albarà), i llavors quedava l'índex a 0 amb
        // la selecció a null: cap fila ressaltada i les fletxes sense poder-la recuperar
        // (amb una única línia era impossible seleccionar-la per teclat).
        const selecciona = (idx) => {
            selectedIndex.value = idx;
            selectedLinia.value = liniesRef.value?.[idx] ?? null;
        };

        watch(liniesRef, (newLinies) => {
            const clau = selectedLinia.value?._key;
            const idx = clau ? (newLinies?.findIndex(l => l._key === clau) ?? -1) : -1;
            if (idx !== -1) {
                selecciona(idx);
                return;
            }
            // Si la línia que hi havia seleccionada ja no existeix ens posicionem a la primera
            selecciona(newLinies?.length ? 0 : -1);
            home(elementTaula(), selectedIndex, liniesRef);
        });

        // En agafar el focus el grid ha de tenir sempre una fila activa, perquè la navegació
        // per teclat tingui un punt de partida.
        watch(() => props.focused, (isFocused) => {
            if (isFocused && !selectedLinia.value && liniesRef.value?.length) selecciona(0);
        });

        watch(selectedIndex, () => {
            selectedLinia.value = liniesRef.value[selectedIndex.value] ?? null;
        });

        watch(selectedLinia, () => {
            if (selectedLinia.value) {
                const idx = liniesRef.value?.findIndex(l => l._key === selectedLinia.value._key);
                if (idx !== -1 && selectedIndex.value !== idx) {
                    selectedIndex.value = idx;
                }
            }
        });

        const handler = (ev) => {
            if (isContextMenuKey(ev)) return;
            if (props.modalParentObert) return;
            if (!props.focused) return;
            controlDataTable(ev, elementTaula(), selectedIndex, liniesRef);
        };

        const showContextMenu = (ev) => {
            if (!menuModel.value.length) return;
            const idx = liniesRef.value.findIndex(l => l._key === selectedLinia.value?._key);
            if (idx !== -1) selectedIndex.value = idx;
            contextMenu.value.show(ev.originalEvent);
        };

        const toggleUrgent = async () => {
            const linia = selectedLinia.value;
            if (!linia) return;
            if (isUltimaLiniaUrgent(linia)){
                confirm.require({
                    header: t('App.Confirmacio'),
                    acceptClass: 'p-button-danger',
                    message: t('Albarans.Confirma Desmarcar ultima linia urgent'),
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        onMarcarUrgent(linia);
                    }
                });
            } else {
                onMarcarUrgent(linia);
            }
        };

        // El menú només té sentit amb el permís de rectificar el pendent de facturar; sense cap
        // opció visible no s'obre (ni el botó de punts ni el menú contextual).
        const menuModel = computed(() => {
            const items = [];
            // En un traspàs abonable les línies no es facturen: el pendent es queda a zero i no es rectifica
            if (permisosStore.tePermis('ALBARANS', 'CANVIAR_PENDENT_FACTURAR') && !props.albara?.isTraspasAbonable) {
                items.push({
                    label: t('Albarans.Canviar pendent facturar'),
                    icon: 'pi pi-pencil',
                    command: () => emit('canviarPendentFacturar', selectedLinia.value),
                });
            }
            items.push(
                { label: () => t('App.Opcio'), icon: 'pi pi-info-circle', command: () => {} },
                { label: () => {
                        const linia = selectedLinia.value;
                        return linia?.isUrgent ? t('Albarans.Desmarcar urgent') : t('Albarans.Marcar urgent');
                    }, icon: 'pi pi-bolt', command: () => toggleUrgent(),
                },
            );
            return items;
        });

        return {
            selectedLinia, selectedIndex,
            contextMenu, menuModel, showContextMenu,
            columnDefs,
            hintImport,
            colPicker,
            toggleColPicker: (ev) => colPicker.value.toggle(ev),
            isUltimaLiniaUrgent, onMarcarUrgent, potEditarUrgent
        };
    },
};
</script>

<style scoped>
#gridLiniesAlbaransBuscador { height: 100%; display: flex; flex-direction: column; }
::v-deep(#gridLiniesAlbaransBuscador > .p-datatable) { flex: 1; min-height: 0; }
::v-deep(.estilRow) { cursor: pointer; }
::v-deep(.estilRow .ocultable) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
    display: none;
}
::v-deep(.estilRow:hover .ocultable) { display: flex; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) { padding: 0.0rem 0.2rem; }
::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) { padding: 0.0rem 0.2rem; }

/* Les línies amb descompte es destaquen perquè el seu import no és el preu per la quantitat */
.import-amb-dte { font-weight: 700; }

.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

</style>
