<template>
<div id="gridArticlesComandaEspecial">
    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
    <DataTable :value="articlesComanda" class="p-datatable-sm-petita"
        v-model:selection="selectedArticle"
        selectionMode="single"
        dataKey="article"
        showGridlines
        :scrollable="true" scrollDirection="both" scrollHeight="50vh"
        :resizableColumns="true" columnResizeMode="expand"
        contextMenu v-model:contextMenuSelection="selectedArticle" @rowContextmenu="showContextMenu($event)"
        :rowClass="() => 'estilRow'"
        @dblclick="window?.getSelection()?.removeAllRanges(); emit('showProgramaArticle', selectedArticle.article)"
        @row-select="selectedIndex = $event.index; emit('updateFocus', true);">
        <template #empty>
            <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('Comandes.Cap comanda pendent de servir')" />
            </div>
        </template>
        <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
                <div style="width: 100%;">
                    <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedArticle = data; contextMenu.show($event)" />
                </div>
            </template>
        </Column>
        <Column field="article" :header="$t('Comandes.Article')" :style="{width:'90px'}" style="max-width: 90px;"/>
        <Column field="referencia" :header="$t('Comandes.Referencia')" :style="{width:'240px'}"/>
        <Column field="denominacio" :header="$t('Comandes.Denominacio')" :style="{width:'240px'}" style="max-width: 400px;"/>
        <Column field="preu" :style="{width:'145px'}" style="text-align: right; max-width: 145px;" :header="$t('Comandes.Preu')">
            <template #body="{data}">
                <div v-if="data.numPreus > 1" style="width: 100%; text-align: right;">
                    {{ `${$t('Comandes.Varis preus')} (${data.numPreus})` }}
                </div>
                <div v-else style="width: 100%; text-align: right;">
                {{ `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` }} 
                </div>
            </template>
        </Column>
        <Column field="quantitatTotal" :style="{width:'130px'}" style="text-align: right; max-width: 130px;" :header="$t('Comandes.Quantitat')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.quantitatTotal) }}
                </div>
            </template>
        </Column>
        <Column field="quantitatPendent" :style="{width:'130px'}" style="text-align: right; max-width: 130px;" :header="$t('Comandes.Quantitat pendent')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.quantitatPendent) }}
                </div>
            </template>
        </Column>
        <Column field="stock" :style="{width:'130px'}" style="text-align: right; max-width: 130px;" :header="$t('Comandes.Stock')">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.stock) }}
                </div>
            </template>
        </Column>
        <Column field="pesTotal" :style="{width:'130px'}" style="text-align: right; max-width: 130px;" :header="`${$t('Comandes.Pes total')} (Kg)`">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.pesTotal, 'decimal') }}
                </div>
            </template>
        </Column>
        <Column field="pesPendent" :style="{width:'130px'}" style="text-align: right; max-width: 130px;" :header="`${$t('Comandes.Pes pendent')} (Kg)`">
            <template #body="{data}">
                <div style="width: 100%; text-align: right;">
                {{ $n(data.pesPendent, 'decimal') }}
                </div>
            </template>
        </Column>
    </DataTable>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { useI18n } from 'vue-i18n';
import MagatzemService from '@/services/magatzem.service';
import { saveAs } from 'file-saver';
import { carrega } from '@/services/loader';

export default {
    name : 'GridNormalitzats',
    components : {
        InfoTaulaBuida,
    },
    props : {
        modalParentObert : Boolean
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const articlesComanda = ref();
        const selectedArticle = ref();
        const selectedIndex = ref(-1);
        const contextMenu = ref();

        const elementTaula = () => document.getElementById('gridArticlesComandaEspecial');

        onMounted(() => {
            document.addEventListener("keydown", handler);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            selectedArticle.value = articlesComanda.value[selectedIndex.value];
        });

        const performSearch = async(articlesComandaInput, article) => {
            articlesComanda.value = articlesComandaInput;
            if (article) {
                selectedIndex.value = articlesComandaInput.findIndex(l => l.article === article);
            } else {
                home(elementTaula(), selectedIndex, articlesComanda);
            }
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, articlesComanda);
            // Controls
            if (ev.key === 'Enter') {
                actionHandler(ev, () => emit('showProgramaArticle', selectedArticle.value.article));
            }
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
                contextMenu.value.visible = false;
            action();
        }

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = articlesComanda.value.findIndex(l => l.article == selectedArticle.value.article);
            if (selectedOld === selectedIndex.value) {
                selectedArticle.value = articlesComanda.value[selectedIndex.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const menuModel = computed(() => {
            let result = [];
            result.push({label: ()=>  `${t('Comandes.Veure programa')}`, class:'p-button-text', icon: 'pi pi-play', command: () => emit('showProgramaArticle', selectedArticle.value.article)});
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Trasabilitat')}`, class:'p-button-text', icon: 'pi pi-list', command: async () => {
                await descarregaTrasabilitat();
            }});
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Localitzacio')}`, class:'p-button-text', icon: 'pi pi-map-marker', command: async () => {
                await descarregaLocalitzacio();
            }});
            return result;
        });

        const descarregaLocalitzacio = async () => {
            const resp = await carrega(MagatzemService.reportLocalitzacio(
                selectedArticle?.value.articleClient.artint,
                selectedArticle?.value.articleClient.clicod,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Localitzacio') + selectedArticle?.value.articleClient.artint + selectedArticle?.value.articleClient.clicod}.xls`);
        }

        const descarregaTrasabilitat = async () => {
            const resp = await carrega(MagatzemService.reportTrasabilitat(
                selectedArticle?.value.articleClient.artint,
                selectedArticle?.value.articleClient.clicod,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Trasabilitat') + selectedArticle?.value.articleClient.artint + selectedArticle?.value.articleClient.clicod}.xls`);
        }
        
        return {
            articlesComanda,
            props,
            emit,
            selectedArticle,
            selectedIndex,
            contextMenu,
            menuModel,
            showContextMenu,
            performSearch,
            descarregaLocalitzacio,
            descarregaTrasabilitat
        }
    },
}
</script>
<style scoped >
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

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) {
        padding: 0.0rem 0.2rem;
    }

    ::v-deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) {
        padding: 0.0rem 0.2rem;
    }

    .enllas {
        cursor: pointer;
    }

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
   
</style>