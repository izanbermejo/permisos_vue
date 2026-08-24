<template>
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @hide="contextMenuHide" 
        @focus="contextMenu.onArrowDownKey($event)"/>
    <div id="ajudaArticlesNormalitzats" class="card-body bodyfocused" style="min-height: 27vh; max-height: 27vh;">
    <DataTable :value="articles" class="p-datatable-sm-petita"
            v-model:selection="selectedArticle"
            selectionMode="single"
            dataKey="artint"
            showGridlines
            :scrollable="true" scrollDirection="both" scrollHeight="25vh"
            :resizableColumns="true" columnResizeMode="expand"
            contextMenu v-model:contextMenuSelection="selectedArticle" @rowContextmenu="showContextMenu($event)"
            :rowClass="() => 'estilRow'"
            @row-dblclick="emit('showCrearLinia', selectedArticle)"
            @row-select="selectedIndex = $event.index; emit('updateFocus', true);">
        <template #empty>
            <div style="width:100%; height: 23vh; text-align: center; padding-top: 30px;">
                <span v-if="props.caractersMinimFiltre">
                    <InfoTaulaBuida v-if="props.filtre?.length >=3" :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
                    <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('AjudaArticlesNormalitzats.InfoBusquedaArticle')" />
                </span>
                <span v-else>
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
                </span>
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedArticle = data; contextMenu.show($event)" />
                </div>
            </template>
            </Column>
        <Column field="codi" :header="$t('AjudaArticlesNormalitzats.Codi')" :style="{width:'130px'}" style="max-width: 130px;"/>
        <Column field="referencia" :header="$t('AjudaArticlesNormalitzats.Referencia')" :style="{width:'150px'}" style="max-width: 150px;"/>
        <Column field="denominacio" :header="$t('AjudaArticlesNormalitzats.Denominacio')" :style="{width:'300px'}" style="max-width: 300px;"/>
        <Column field="fabrica" :header="$t('AjudaArticlesNormalitzats.Fab')" :style="{width:'40px'}" style="max-width: 40px;"/>
        <Column :header="$t('Comandes.Stock total')" :style="{width:'110px'}" style="text-align: right; max-width: 110px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.stock) }}
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Reservat total')" :style="{width:'110px'}" style="text-align: right; max-width: 110px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.reserva) }}
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Stock local')" :style="{width:'110px'}" style="text-align: right; max-width: 110px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.stockLocal) }}
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Reservat local')" :style="{width:'110px'}" style="text-align: right; max-width: 110px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.reservaLocal) }}
                </div>
            </template>
        </Column>
        <Column :header="$t('Comandes.Embalatge')" :style="{width:'150px'}" style="text-align: right; max-width: 150px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                    <span v-if="data.bossesCaixa">
                        {{ `${$n(data.unitatsEmbalatge)} x ${$n(data.bossesCaixa)} (${$n(data.unitatsEmbalatge*data.bossesCaixa)})` }}
                    </span>
                    <span v-else>
                        {{ $n(data.unitatsEmbalatge) }}
                    </span>
                </div>
            </template>
        </Column>
        </DataTable>
    </div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import ComandesService from '@/services/comandes.service';
import MagatzemService from '@/services/magatzem.service';
import debounce from 'debounce';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { useI18n } from 'vue-i18n';
import { saveAs } from 'file-saver';
import { carrega } from '@/services/loader';

export default {
    name : 'GridNormalitzats',
    components : {
        InfoTaulaBuida,
    },
    props : {
        visible : Boolean,
        caractersMinimFiltre : Boolean,
        filtre : String,
        empresa : String,
        tipus : String,
        seleccioCallback : Function,
        modalParentObert : Boolean
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        // Client
        const articles = ref();
        const selectedArticle = ref();
        const selectedIndex = ref(-1);
        const contextMenu = ref();
        let contextMenuHided = false;
        let abortController;

        const elementClient = () => document.getElementById('ajudaArticlesNormalitzats');

        onMounted(() => {
            document.addEventListener("keydown", handler);
            performSearch();
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(() => props.visible, () => {
            if (props.visible) {
                document.addEventListener("keydown", handler);
            } else {
                document.removeEventListener("keydown", handler);
            }
        });

        watch(selectedIndex, () => {
            selectedArticle.value = articles.value[selectedIndex.value];
        });
        

        watch(articles, () => {
            if (articles.value.length){
                nextTick(() => {
                    selectedIndex.value = 0;
                    selectedArticle.value = articles.value[selectedIndex.value];
                });
            }
        });

        watch(() => props.filtre, async() => {
            performSearch();
        });

        watch(() => props.tipus, async() => {
            performSearch();
        });

        const contextMenuHide = () => {
            emit('updateFocus', true);
            contextMenuHided = true;
        }

        const performSearch = debounce(async() => {
            if (abortController && !abortController.aborted) {
                abortController.abort();
            }
            abortController = new AbortController();
            if (!props.caractersMinimFiltre || props.filtre.length >= 3) {
                let listArticles =  await ComandesService.queryNormalitzats(props.empresa, props.filtre, props.tipus, abortController);
                articles.value = [];
                selectedArticle.value = null;
                articles.value = listArticles;
                home(elementClient(), selectedIndex, articles);
            } else {
                articles.value = [];
                selectedArticle.value = null;
            }
        }, 150);

        const handler = (ev) => {
            // Si no hi ha cap modal obert
            if (props.modalParentObert)
                return;
            // Controls de la taula (si no està el contextMenu obert o s'acaba de tancar)
            if (!contextMenu.value?.visible && !contextMenuHided) {
                controlDataTable(ev, elementClient(), selectedIndex, articles);
                if (ev.key === 'Enter' && selectedArticle.value) {
                    actionHandler(ev, () => emit('showCrearLinia', selectedArticle.value));
                }
            }
            // Controls especials
            if (ev.ctrlKey && ev.which==83) { // Ctrl + S)
                actionHandler(ev, () => emit('showStocks', selectedArticle.value));
            }
            contextMenuHided = false;
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
                contextMenu.value.visible = false;
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedArticle.value, quantitat, data, dataPrevistaSortida);
        }

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = articles.value.findIndex(l => l.artint == selectedArticle.value.artint);
            if (selectedOld === selectedIndex.value) {
                selectedArticle.value = articles.value[selectedIndex.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }
        
        const menuModel = ref([
            {label: ()=>  `${t('Comandes.Veure stock')} [Ctrl+s]`, class:'p-button-text', icon: 'pi pi-box', command: () => emit('showStocks', selectedArticle.value)},
            {label: ()=>  `${t('Comandes.Veure reserves')} [Ctrl+r]`, class:'p-button-text', icon: 'pi pi-book', command: () => emit('showReserves', selectedArticle.value)},
            {label: ()=>  `${t('ModalAjudaArticleClient.Trasabilitat')}`, class:'p-button-text', icon: 'pi pi-list', command: () => descarregaTrasabilitat()},
            {label: ()=>  `${t('ModalAjudaArticleClient.Localitzacio')}`, class:'p-button-text', icon: 'pi pi-map-marker', command: () => descarregaLocalitzacio()},
        ]);

        const descarregaLocalitzacio = async () => {
            const resp = await carrega(MagatzemService.reportLocalitzacio(
                selectedArticle.value.artint,
                selectedArticle.value.clicod,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Localitzacio') + selectedArticle.value.artint + selectedArticle.value.clicod}.xls`);
        }

        const descarregaTrasabilitat = async () => {
            const resp = await carrega(MagatzemService.reportTrasabilitat(
                selectedArticle.value.artint,
                selectedArticle.value.clicod,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Trasabilitat') + selectedArticle.value.artint + selectedArticle.value.clicod}.xls`);
        }

        return {
            articles,
            props,
            emit,
            selectedArticle,
            selectedIndex,
            contextMenu,
            menuModel,
            contextMenuHide,
            showContextMenu,
            callbackLinia,
            descarregaLocalitzacio,
            descarregaTrasabilitat
        }
    },
}
</script>
<style scoped >
    .bodyfocused {
        border: 3px solid #b0daf8;
        padding: 2px;
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

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
        padding: 0.0rem 0.2rem;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
        padding: 0.0rem 0.2rem;
    }
   
</style>