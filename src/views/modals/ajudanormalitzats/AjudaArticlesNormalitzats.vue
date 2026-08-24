<template>
    <AjudaStocks v-if="visibleAjudaStocks" :carregat="visibleAjudaStocks"  @update:carregat="visibleAjudaStocks = $event"
        :artint="selectedArticle.artint" :clicod="selectedArticle.clicod" />
    <AjudaReserves v-if="visibleAjudaReserves" :carregat="visibleAjudaReserves"  @update:carregat="visibleAjudaReserves = $event"
        :artint="selectedArticle.artint" :empresa="props.empresa" :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
    <CrearEditarLiniaNormalitzat v-if="visibleCrearEditarLinia" :carregat="visibleCrearEditarLinia" 
        :artint="selectedArticle.artint" :clicod="selectedArticle.clicod"
        :stockLocal="selectedArticle.stockLocal" :reservaLocal="selectedArticle.reservaLocal"
        :permetNoMultiplesBossa="isMonterrey"
        :client="props.client"
        :callbackOk="callbackLinia"
        @update:carregat="visibleCrearEditarLinia = $event; updateFocus();" />
    <CrearEditarLiniaTarifaPeces v-if="visibleCrearEditarLiniaTarifa" :carregat="visibleCrearEditarLiniaTarifa"
        :artint="selectedArticle.artint" :clicod="selectedArticle.clicod"
        :stockLocal="selectedArticle.stockLocal" :reservaLocal="selectedArticle.reservaLocal"
        :permetNoMultiplesBossa="isMonterrey"
        :client="props.client"
        :callbackOk="callbackLinia"
        @update:carregat="visibleCrearEditarLiniaTarifa = $event; updateFocus();" />
    <Dialog v-model:visible="visibleIntern" @hide="hide" :closable="false" :closeOnEscape="false" style="width: 1340px;"
        position="top"
        :modal="refVisible"
        :style="{visibility: refVisible ? 'visible' : 'hidden'}">
        <template #header>
            <div style="width: 100%;">
                <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('AjudaArticlesNormalitzats.Titol') }}</span>
                <button tabindex="-1" style="float: right;" @click="hide"
                    class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                    <span class="p-dialog-header-close-icon pi pi-times"></span>
                </button>
            </div>
        </template>
        <div class="card" style="margin-top: 10px;">
            <div class="card-header filtre">
                <span>
                    <span style="font-size: larger; font-weight: 600;">{{ $t('AjudaArticlesNormalitzats.Articles') }}</span>
                    <span class="p-input-icon-left" style="margin-left: 15px;">
                        <i class="pi pi-search" />
                        <InputText ref="inputFiltreArticle" v-model="valorFiltre"  
                            :placeholder="$t('AjudaArticlesNormalitzats.PlaceholderFiltre')"
                            style="width: 225px" />
                    </span>
                    <span style="margin-left: 15px;">
                        <ButtonShortcut v-if="ordreTipus('IBINSA')" icon="fa-solid fa-italic" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='IBINSA'}"
                            literal="Ibinsa" :shortcut="`[Ctrl+${ordreTipus('IBINSA')}]`" @click="tipusSeleccionat='IBINSA'"/>
                        <ButtonShortcut v-if="ordreTipus('NORMALITZAT')" icon="fa-solid fa-ring" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='NORMALITZAT'}"
                            :literal="$t('Comandes.Selfoil')" :shortcut="`[Ctrl+${ordreTipus('NORMALITZAT')}]`" @click="tipusSeleccionat='NORMALITZAT'"/>
                        <ButtonShortcut v-if="ordreTipus('ESPECIAL')" icon="fa-solid fa-gear" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='ESPECIAL'}"
                            :literal="$t('AjudaArticlesNormalitzats.Especials')" :shortcut="`[Ctrl+${ordreTipus('ESPECIAL')}]`" @click="tipusSeleccionat='ESPECIAL'"/>
                        <ButtonShortcut v-if="ordreTipus('FILTRE')" icon="fa-solid fa-hourglass-half" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='FILTRE'}"
                            :literal="$t('AjudaArticlesNormalitzats.Filtres')" :shortcut="`[Ctrl+${ordreTipus('FILTRE')}]`" @click="tipusSeleccionat='FILTRE'"/>
                        <ButtonShortcut v-if="ordreTipus('MEDICAL')" icon="fa-solid fa-suitcase-medical" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='MEDICAL'}"
                            :literal="$t('AjudaArticlesNormalitzats.Medical')" :shortcut="`[Ctrl+${ordreTipus('MEDICAL')}]`" @click="tipusSeleccionat='MEDICAL'"/>
                        <ButtonShortcut v-if="ordreTipus('MARKETING')" icon="fa-solid fa-map" class="bototipus" :class="{'botoactiu': tipusSeleccionat=='MARKETING'}"
                            :literal="$t('AjudaArticlesNormalitzats.Marketing')" :shortcut="`[Ctrl+${ordreTipus('MARKETING')}]`" @click="tipusSeleccionat='MARKETING'"/>
                    </span>
                </span>
            </div>
            <GridNormalitzats v-if="tipusSeleccionat=='NORMALITZAT' || tipusSeleccionat=='FILTRE' || tipusSeleccionat=='MEDICAL' || tipusSeleccionat=='MARKETING'"
                :visible="props.visible"
                :empresa="props.empresa" :filtre="valorFiltre" :tipus="tipusSeleccionat" :modalParentObert="isModalObert"
                :caractersMinimFiltre="tipusSeleccionat=='NORMALITZAT' || tipusSeleccionat=='FILTRE'"
                @showStocks="showStocks" @showReserves="showReserves" @showCrearLinia="showCrearLinia"
                @updateFocus="updateFocus" />
            <GridAltres v-else
                :visible="props.visible"
                :client="props.codiClient" :tipus="tipusSeleccionat" :filtre="valorFiltre" :modalParentObert="isModalObert"
                :caractersMinimFiltre="tipusSeleccionat=='IBINSA'"
                @showStocks="showStocks" @showCrearLinia="showCrearLinia"
                @updateFocus="updateFocus" />
        </div>
    </Dialog>
</template>

<script>
import { ref, watch, nextTick, toRef, computed } from 'vue';
import GridNormalitzats from './GridNormalitzats.vue'
import GridAltres from './GridAltres.vue';
import CrearEditarLiniaNormalitzat from '@/views/modals/CrearEditarLiniaNormalitzat.vue';
import AjudaStocks from '@/views/modals/AjudaStocks.vue';
import AjudaReserves from '@/views/modals/reserves/AjudaReserves.vue';
import { usePermisosStore } from '@/stores/permisos';
import CrearEditarLiniaTarifaPeces from '../CrearEditarLiniaTarifaPeces.vue';

export default {
    name : 'AjudaArticleClientByClient',
    components : {
        GridNormalitzats,
        GridAltres,
        CrearEditarLiniaNormalitzat,
        AjudaStocks,
        AjudaReserves,
        CrearEditarLiniaTarifaPeces,
    },
    props : {
        seleccioCallback : Function,
        visible : Boolean,
        empresa : String,
        codiClient : String,
        client : Object,
        calculTarifa : Boolean,
    },
    setup(props, { emit }) {
        // Permisos
        const permisosStore = usePermisosStore();
        // Refs
        const refVisible = toRef(props, 'visible');
        const visibleIntern = ref(false);
        // Variables inicialització
        const isInicialitzat = ref(false);
        let mapTipus = new Map();
        // Filtre
        const inputFiltreArticle = ref();
        const inputFiltreArticle2 = ref();
        const valorFiltre = ref('');
        const valorFiltre2 = ref('2222');
        const visibleCrearEditarLinia = ref(false);
        const visibleCrearEditarLiniaTarifa = ref(false);
        const visibleAjudaStocks = ref(false);
        const visibleAjudaReserves = ref(false);
        const selectedArticle = ref();
        const tipusSeleccionat = ref('');

        const inicialitza = () => {
            visibleIntern.value = true;
            if (!isInicialitzat.value) {
                let index = 1;
                if (props.empresa == 'D0') {
                    // Cas medical (només veu les peces de medical)
                    mapTipus.set('MEDICAL', index++);
                } else {
                    if (isIbinsa.value) {
                        // Cas IBINSA
                        mapTipus.set('IBINSA', index++);
                    }
                    mapTipus.set('NORMALITZAT', index++);
                    if (!isIbinsa.value) {
                        mapTipus.set('ESPECIAL', index++);
                    }
                    mapTipus.set('FILTRE', index++);
                }
                // Màrqueting (s'afegeix a tots excepte a medical)
                if (props.empresa != 'D0') {
                    mapTipus.set('MARKETING', index++);
                }
                // Selecció del primer valor
                tipusSeleccionat.value = mapTipus.keys().next().value;
                // Booleà d'inicialització a cert per a que no es torni a executar
                isInicialitzat.value = true;
            }
        }

        const ordreTipus = (tipus) => {
            var ordre = mapTipus.get(tipus);
            return ordre ? ordre : 0;
        };  

        watch(refVisible, () => {
            if (refVisible.value) {
                inicialitza();
                // Afegeix un timeout per a que el focus es pugui aplicar correctament
                setTimeout(() => {
                    valorFiltre.value = '';
                    inputFiltreArticle.value?.$el?.focus();
                }, 100);
                document.addEventListener("keydown", handler);
            } else {
                document.removeEventListener("keydown", handler);
            }
        });

        watch(refVisible, () => {
            visibleCrearEditarLinia.value = false;
            visibleCrearEditarLiniaTarifa.value = false;
        });

        watch(tipusSeleccionat, () => {
            nextTick(() => {
                    inputFiltreArticle.value.$el.focus();
                    inputFiltreArticle.value.$el.select();
            });
        })

        const showStocks = (article) => {
            selectedArticle.value = article;
            visibleAjudaStocks.value = true;
        }

        const showReserves = (article) => {
            selectedArticle.value = article;
            visibleAjudaReserves.value = true;
        }

        const showCrearLinia = (article) => {
            selectedArticle.value = article;
            if (props.calculTarifa) {
                visibleCrearEditarLiniaTarifa.value = true
            } else {
                visibleCrearEditarLinia.value = true;
            }
        }

        const updateFocus = () => {
            nextTick(() => {
                inputFiltreArticle.value.$el.focus();
            });
        }

        const isModalObert = computed(() => {
            return visibleCrearEditarLinia.value 
                || visibleAjudaStocks.value
                || visibleAjudaReserves.value
                || visibleCrearEditarLinia.value
                || visibleCrearEditarLiniaTarifa.value;
        });

        const isGridNormalitzats = computed(() => {
            return tipusSeleccionat.value == 'NORMALITZAT';
        });

        const handler = (ev) => {
            // Si no hi ha cap modal obert
            if (isModalObert.value)
                return;
            // Controls de la taula (si no està el contextMenu obert o s'acaba de tancar)
            if (ev.key === 'Escape') {
                actionHandler(ev, () => hide());
            } else if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
                actionHandler(ev, () => canviTipus(1));
            } else if (ev.ctrlKey && ev.key=="2") { // Ctrl + 2
                actionHandler(ev, () => canviTipus(2));
            } else if (ev.ctrlKey && ev.key=="3") { // Ctrl + 3
                actionHandler(ev, () => canviTipus(3));
            } else if (ev.ctrlKey && ev.key=="4") { // Ctrl + 4
                actionHandler(ev, () => canviTipus(4));
            } else if (ev.ctrlKey && ev.key=="5") { // Ctrl + 5
                actionHandler(ev, () => canviTipus(5));
            }
        }

        const isIbinsa = computed(() => { return props.codiClient === "038401" });

        const isMonterrey = computed(() => { return props.empresa === "80"});

        const canviTipus = (tipus) => {
            for (let[key, value] of mapTipus.entries()) {
                if (value === tipus) {
                    tipusSeleccionat.value = key;
                    return;
                }
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedArticle.value, quantitat, data, dataPrevistaSortida);
        }

        const hide = () => {
            emit('update:carregat', false);
        }
        
        return {
            permisosStore,
            refVisible,
            visibleIntern,
            inputFiltreArticle, inputFiltreArticle2,
            valorFiltre, valorFiltre2,
            ordreTipus,
            tipusSeleccionat,
            showStocks,
            showReserves,
            showCrearLinia,
            updateFocus,
            isModalObert,
            isGridNormalitzats,
            hide,
            props,
            selectedArticle,
            visibleCrearEditarLinia,
            visibleCrearEditarLiniaTarifa,
            visibleAjudaStocks,
            visibleAjudaReserves,
            callbackLinia,
            isIbinsa,
            isMonterrey,
        }
    },
}
</script>
<style scoped >

    .bototipus {
        border: 0px;
        margin-left: 5px;
        background-color: #bcbcbc;
    }

    .botoactiu {
        background-color: #93c47d !important;
    }
    
    .filtre {
        display: flex;
        column-gap: 40px;
        align-items: center;
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

    ::v-deep(.p-multiselect) {
        line-height: 13px;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
        padding: 0.0rem 0.2rem;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
        padding: 0.0rem 0.2rem;
    }
   
</style>