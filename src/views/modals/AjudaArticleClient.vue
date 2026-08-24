<template>
    <ModalMissatgesEDIArticleClient v-if="visibleMissatgesEDI" :carregat="visibleMissatgesEDI"
        :cliCod="selectedArticleClient?.codiClient" :artInt="selectedArticleClient?.artInt"
        @update:carregat="visibleMissatgesEDI = $event" />
    <ModalHistoricMoviments v-if="visibleHistoricMoviments" v-model:visible="visibleHistoricMoviments"
      :artint="selectedArticleClient.artInt" :clicod="selectedArticleClient.codiClient" />
    <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaArticleClient.Titol') }}</span>
            <button tabindex="-1" style="float: right;" @click="hide"
                class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                <span class="p-dialog-header-close-icon pi pi-times"></span>
            </button>
        </div>
    </template> 
    <div class="card">
        <div class="card-header filtre">
            <span style="font-size: larger; font-weight: 600;">{{ $t('ModalAjudaArticleClient.Articles-client') }}</span>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText ref="inputFiltreArticle" v-model="valorFiltreArticleclient"  style="width: 250px" 
                :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreArticleclient')"
                @focus="focusedClients = false" 
                />
            </span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="valorFiltreArticleInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar articles-clients inactius') }} </label>
                <label v-if="!focusedClients" style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
            <div v-if="articlesclient?.length == 100" class="infolimit">
                <font-awesome-icon icon="fa-solid fa-circle-info" style="font-size: 1rem;" />
                {{ $t('App.Nomes es mostren els primers resultats', [articlearticlesclientsclient.length]) }}
            </div>
        </div>
        <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
        <div id="articlesclientByClient" class="card-body" style="min-height: 30vh; max-height: 30vh;" :class="classArticleClientFocused()">
            <DataTable :value="articlesclient" class="p-datatable-sm-petita" 
                    v-model:selection="selectedArticleClient"
                    selectionMode="single"
                    dataKey="artInt"
                    showGridlines
                    contextMenu v-model:contextMenuSelection="selectedArticleClient" @rowContextmenu="showContextMenu($event)"
                    :scrollable="true" scrollDirection="both" scrollHeight="28vh"
                    :resizableColumns="true" columnResizeMode="expand"
                    :rowClass="() => 'estilRow'"
                    @row-dblclick="window?.getSelection()?.removeAllRanges(); handlerEnter()"
                    @row-select="selectedIndexArticleClient = $event.index; inputFiltreArticle.$el.focus();">
                <template #empty>
                    <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida v-if="selectedClient" :icon="'fa-solid fa-face-frown-open'" :literal="$t('ModalAjudaArticleClient.EmptyArticlesClient')" />
                        <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('ModalAjudaArticleClient.InfoBusquedaArticleClient')" />
                    </div>
                </template>
                <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                    <template #body="{data}">
                        <div style="width: 100%;">
                            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedArticleClient = data; contextMenu.show($event)" />
                        </div>
                    </template>
                </Column>
                <Column field="referencia" :style="{width:'300px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Referencia')"
                            :showHelp="!focusedClients" :help="'Ctrl+1'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="article" :style="{width:'110px'}" style="max-width: 110px">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Codi')"
                            :showHelp="!focusedClients" :help="'Ctrl+2'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="denominacio" :style="{width:'300px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Denominacio')"
                            :showHelp="!focusedClients" :help="'Ctrl+3'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Nivell tecnic')" field="nivellTecnic" :style="{width:'300px'}"></Column>
                <Column :header="$t('ModalAjudaArticleClient.Preu')" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                            {{ `${$n(data.preu)} ${data.divisa}` }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Stock')" field="stock" :style="{width:'140px'}" style="max-width: 140px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                        {{ $n(data.stock) }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Fabrica')" :style="{width:'200px'}" style="max-width: 200px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="$fabrica(data.codiFabrica)">
                            {{ $fabrica(data.codiFabrica) }}
                        </div>
                    </template>
                </Column>
                <Column field="flag" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: center;">
                            <Tag :value="$t(`ModalAjudaArticleClient.${data.flag}`)" :severity="getSeverityFlag(data.flag)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>    
    </Dialog>
</template>

<script>
import { ref, watch, nextTick, toRef, computed } from 'vue';
import ComandesService from '@/services/comandes.service';
import MagatzemService from '@/services/magatzem.service';
import debounce from 'debounce';
import ColumnaOrdenacio from '@/components/ColumnaOrdenacio.vue';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { avPag, arrowDown, home, rePag, arrowUp, end, scrollCenter } from '@/utils/datetableUtils.js';
import { carrega } from '@/services/loader';
import { useI18n } from 'vue-i18n';
import { saveAs } from 'file-saver';
import ModalMissatgesEDIArticleClient from './ModalMissatgesEDIArticleClient.vue';
import ModalHistoricMoviments from './ModalHistoricMoviments.vue';

export default {
    name : 'AjudaArticleClientByClient',
    components : {
        ColumnaOrdenacio,
        InfoTaulaBuida,
        ModalMissatgesEDIArticleClient,
        ModalHistoricMoviments,
    },
    props : {
        seleccioCallback : Function,
        client: String,
        visible : Boolean,
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const contextMenu = ref();
        const refVisible = toRef(props, 'visible');
        const visibleHistoricMoviments = ref(false);
        // const inputFiltreClients = ref();
        const valorFiltreClientsInactius = ref(false);
        const valorFiltre = ref('');
        const clients = ref();
        const selectedClient = toRef(props,'client');
        const selectedIndex = ref(-1);
        const colOrder = ref('1');
        const orderAsc = ref(true);
        let ordenacionsClient = {
                'codi': '1',
                'nom': '2',
                'alias': '3'
        };
        // Article-client
        const inputFiltreArticle = ref();
        const valorFiltreArticleclient = ref('');
        const valorFiltreArticleInactius = ref(false);
        const articlesclient = ref();
        const selectedArticleClient = ref();
        const selectedIndexArticleClient = ref(-1);
        const colOrderArticleclient = ref('1');
        const orderAscArticleclient = ref(true);
        let ordenacionsArticleclient = {
                'referencia': '1',
                'article': '2',
                'denominacio': '3'
        };
        let abortControllerArticles;
        // Focus de seleccions
        const focusedClients = ref(true);
        const visibleMissatgesEDI = ref(false);
        let isInicialitzat = false;
        
        const elementArticleClient = () => document.getElementById('articlesclientByClient');

        watch(refVisible, () => {
            if (refVisible.value) {
                document.addEventListener("keydown", handler);
                performSearchInicial();
                nextTick(() => {
                    if (inputFiltreArticle.value?.$el) {
                        inputFiltreArticle.value.$el.focus();
                        inputFiltreArticle.value.$el.select();
                    }
                    scrollCenter(elementArticleClient(), selectedIndexArticleClient);
                });
            } else {
                document.removeEventListener("keydown", handler);
            }
        });

        const performSearchInicial = async() => {
            if (!isInicialitzat) {
                articlesclient.value = await carrega(ComandesService.articlesClientByClient(
                    selectedClient.value,
                    valorFiltreArticleclient.value,
                    valorFiltreArticleInactius.value,
                    colOrderArticleclient.value,
                    orderAscArticleclient.value,
                    abortControllerArticles
                ));
                home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            }
            isInicialitzat = true;
        }

        watch(selectedClient, () => {
            isInicialitzat = false;
        })

        watch(selectedIndexArticleClient, () => {
            selectedArticleClient.value = articlesclient.value[selectedIndexArticleClient.value];
        });

        watch(articlesclient, () => {
            if (articlesclient.value.length){
                nextTick(() => {
                    selectedIndexArticleClient.value = 0;
                    selectedArticleClient.value = articlesclient.value[selectedIndexArticleClient.value];
                });
            }
        });

        watch([valorFiltreArticleclient, valorFiltreArticleInactius], async() => {
            performSearchArticles();
        });

        const performSearchArticles = debounce(async() => {
            if (abortControllerArticles && !abortControllerArticles.aborted) {
                abortControllerArticles.abort();
            }
            abortControllerArticles = new AbortController();
            articlesclient.value = await ComandesService.articlesClientByClient(
                selectedClient.value,
                valorFiltreArticleclient.value,
                valorFiltreArticleInactius.value,
                colOrderArticleclient.value,
                orderAscArticleclient.value,
                abortControllerArticles
            );
            nextTick(() => {
                home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            });
        }, 100);

        const handler = (ev) => {
            if (visibleMissatgesEDI.value) {
                return;
            }
            if (ev.key === 'Escape') {
                hide();
            } else if (ev.ctrlKey && ev.which==66) { // Ctrl + B
                ev.preventDefault();
                emit('switch');
            }
            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                handlerArrowDown();
            } else if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                handlerArrowUp();
            } else if (ev.key === 'Enter') {
                ev.preventDefault();
                handlerEnter();
            } else if (ev.key == 'PageDown') {
                ev.preventDefault();
                avansaPagina();
            } else if (ev.key == 'PageUp') {
                ev.preventDefault();
                tornaPagina();
            } else if (ev.ctrlKey && ev.key=='Home') {
                ev.preventDefault();
                focusedClients.value
                    home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='End') {
                ev.preventDefault();
                focusedClients.value
                    end(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='0') {
                ev.preventDefault();
                focusedClients.value 
                    ? valorFiltreClientsInactius.value = !valorFiltreClientsInactius.value
                    : valorFiltreArticleInactius.value = !valorFiltreArticleInactius.value;
            } else if (ev.ctrlKey && ev.key=='1') {
                ev.preventDefault();
                focusedClients.value = orderColumnArticleclient('referencia');
            } else if (ev.ctrlKey && ev.key=='2') {
                ev.preventDefault();
                focusedClients.value = orderColumnArticleclient('article');
            } else if (ev.ctrlKey && ev.key=='3') {
                ev.preventDefault();
                focusedClients.value = orderColumnArticleclient('denominacio');
            }
        }

        const orderColumnArticleclient = (col) => {
            if (colOrderArticleclient.value ===  ordenacionsArticleclient[col]) {
                orderAscArticleclient.value = !orderAscArticleclient.value;
            } else {
                colOrderArticleclient.value = ordenacionsArticleclient[col];
                orderAscArticleclient.value = true;
            }
            performSearchArticles();
        }

        const handlerArrowDown = () => {
            focusedClients.value 
            arrowDown(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerArrowUp = () => {
            focusedClients.value 
            arrowUp(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const avansaPagina = () => {
            focusedClients.value 
            avPag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const tornaPagina = () => {
            focusedClients.value 
            rePag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerEnter = () => {
            if (focusedClients.value && selectedClient.value) {
                focusedClients.value = false;
            } else if (!focusedClients.value && selectedArticleClient.value) {
                props.seleccioCallback(artCli.value);
            }
        }

        const artCli = computed(() => {
            return selectedArticleClient.value.article + selectedArticleClient.value.codiClient;
        })

        const hide = () => {
            emit('update:carregat', false);
        }

        const classClientFocused = () => {
            return (focusedClients.value) ? 'bodyfocused' : 'bodyNotFocused';
        }

        const classArticleClientFocused = () => {
            return (!focusedClients.value) ? 'bodyfocused' : 'bodyNotFocused';
        }

        const getSeverityFlag = (flag) => {
            if (flag === 'A') return 'success';
            if (flag === 'E') return 'danger';
            if (flag === 'I') return 'warning';
        }
        
        const menuModel = computed(() => {
            let result = [];
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Trasabilitat')}`, class:'p-button-text', icon: 'pi pi-list', command: async () => {
                await descarregaTrasabilitat();
            }});
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Localitzacio')}`, class:'p-button-text', icon: 'pi pi-map-marker', command: async () => {
                await descarregaLocalitzacio();
            }});
            result.push({label: () => t('ModalMissatgesEDI.Titol'), icon: 'pi pi-file-pdf', command: () => {
                visibleMissatgesEDI.value = true;
            }});
            result.push({label: `${t('historicMoviments.titol')}`, icon: 'pi pi-history', command: () => {
                visibleHistoricMoviments.value = true;
            }});
            return result;
        });

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndexArticleClient.value;
            selectedIndexArticleClient.value = articlesclient.value.findIndex(l => l.codiNumeroFormat == selectedArticleClient.value.codiNumeroFormat);
            if (selectedOld === selectedIndexArticleClient.value) {
            selectedArticleClient.value = articlesclient.value[selectedIndexArticleClient.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
            contextMenu.value.visible = false;
            action();
        }

        const descarregaLocalitzacio = async () => {
            const resp = await carrega(MagatzemService.reportLocalitzacio(
                selectedArticleClient?.value?.artInt,
                selectedArticleClient?.value?.codiClient,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Localitzacio') + selectedArticleClient?.value?.articleClient}.xls`);
        }

        const descarregaTrasabilitat = async () => {
            const resp = await carrega(MagatzemService.reportTrasabilitat(
                selectedArticleClient?.value?.artInt,
                selectedArticleClient?.value?.codiClient,
            ));
            saveAs(new Blob([resp]), `${ t('ModalAjudaArticleClient.Trasabilitat') + selectedArticleClient?.value?.articleClient}.xls`);
        }


        return {
            refVisible,
            clients,
            // inputFiltreClients,
            valorFiltreClientsInactius,
            valorFiltre,
            hide,
            props,
            selectedClient,
            selectedIndex,
            inputFiltreArticle,
            valorFiltreArticleclient,
            valorFiltreArticleInactius,
            colOrder, orderAsc, ordenacionsClient,
            colOrderArticleclient, orderAscArticleclient, orderColumnArticleclient, ordenacionsArticleclient,
            articlesclient,
            selectedArticleClient,
            selectedIndexArticleClient,
            focusedClients,
            classClientFocused,
            classArticleClientFocused,
            getSeverityFlag,
            handlerEnter,
            artCli,
            emit,
            showContextMenu,
            actionHandler,
            contextMenu,
            menuModel,
            descarregaLocalitzacio,
            descarregaTrasabilitat,
            visibleMissatgesEDI,
            visibleHistoricMoviments,
        }
    },
}
</script>
<style scoped >

    .bodyfocused {
        border: 3px solid #b0daf8;
        padding: 2px;
    }
    
    .bodyNotFocused {
        padding: 5px;
    }
    .filtre {
        display: flex;
        column-gap: 40px;
        align-items: center;
    }

    .infolimit {
        background-color: #ffff8e;
        padding: 4px 20px;
        border-radius: 50px;
    }

    ::v-deep(.estilRow) {
        cursor: pointer;
        user-select: none;
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

    ::v-deep(.p-paginator) {
        padding: 0;
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
</style>