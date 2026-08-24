<template>
    <CrearEditarEmbalatgeExpedicio v-if="visibleCrearEditarEmbalatgeExpedicio" :carregat="visibleCrearEditarEmbalatgeExpedicio"
        @update:carregat="visibleCrearEditarEmbalatgeExpedicio = $event"
        :artInt="artIntCliCod.artInt" :cliCod="artIntCliCod.cliCod"/>
    <DetallOrdresFabricacio v-if="visibleDialogDetallOF" :carregat="visibleDialogDetallOF"
    @update:carregat="visibleDialogDetallOF = $event;" :articleClient="artIntCliCod.articleClient" :artInt="artIntCliCod.artInt" :cliCod="artIntCliCod.cliCod" :fabrica="artIntCliCod.fabrica" />
    <AjudaStocks v-if="visibleStocks" :carregat="visibleStocks"  @update:carregat="visibleStocks = $event"
      :artint="selectedArticleClient.artInt" :clicod="selectedArticleClient.codiClient" />
    <ModalMissatgesEDIArticleClient v-if="visibleMissatgesEDI" :carregat="visibleMissatgesEDI"
        :cliCod="selectedArticleClient?.codiClient" :artInt="selectedArticleClient?.artInt"
        @update:carregat="visibleMissatgesEDI = $event" />
    <ModalHistoricMoviments v-if="visibleHistoricMoviments" v-model:visible="visibleHistoricMoviments"
      :artint="selectedArticleClient.artInt" :clicod="selectedArticleClient.codiClient" />
    <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaArticleClient.TitolArticle') }}</span>
            <ButtonShortcut :literal="$t('ModalAjudaArticleClient.TitolClient')" :shortcut="'[Ctrl+B]'" @click="emit('switch')"
                icon="fa-solid fa-file" style="margin-left: 125px;"/>
            <button tabindex="-1" style="float: right;" @click="hide"
                class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                <span class="p-dialog-header-close-icon pi pi-times"></span>
            </button>
        </div>
    </template>
    <div class="card" style="margin-top: 10px;">
        <div class="card-header filtre">
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText ref="inputFiltreArticle" v-model="valorFiltreArticleclient"  style="width: 250px" 
                :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreArticleclient')"
                @focus="focusedClients = false" />
            </span>
            <span>
                <MultiSelect v-model="valorFiltreResponsables" :options="$responsablesLogistica" optionLabel="nom" optionValue="nom"
                    :placeholder="$t('ModalAjudaArticleClient.responsable logistic')" class="col-md-3" style="width: 200px;"/>
                <Button icon="pi pi-users" @click="valorFiltreResponsables = []"
                    style="width: 30px; height: 30px; margin-left: 5px;" v-tooltip.bottom="$t('ModalAjudaArticleClient.seleccionar tots')"/>
                <Button v-if="usuariActual" icon="pi pi-user" @click="valorFiltreResponsables = [usuariActual.codi]"
                    style="width: 30px; height: 30px; margin-left: 5px;" v-tooltip.bottom="`${$t('ModalAjudaArticleClient.seleccionar')} ${usuariActual.nom}`"/>
            </span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="valorFiltreArticleInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar articles-clients inactius') }} </label>
                <label v-if="!focusedClients" style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
        </div> 
        <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
        <div id="articlesclientByArticle" class="card-body bodyfocused" style="min-height: 60vh; max-height: 60vh;">
            <DataTable :value="articlesclient" class="p-datatable-sm-petita" 
                    v-model:selection="selectedArticleClient"
                    selectionMode="single"
                    dataKey="articleClient"
                    showGridlines
                    contextMenu v-model:contextMenuSelection="selectedArticleClient" @rowContextmenu="showContextMenu($event)"
                    :scrollable="true" scrollDirection="both" scrollHeight="58vh"
                    :resizableColumns="true" columnResizeMode="expand"
                    :rowClass="() => 'estilRow'"
                    @dblclick="window?.getSelection()?.removeAllRanges(); handlerEnter()"
                    @row-select="selectedIndexArticleClient = $event.index; inputFiltreArticle.$el.focus();">
                <template #empty>
                    <div style="width:100%; height: 55vh; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida v-if="valorFiltreArticleclient?.length >=3" :icon="'fa-solid fa-face-frown-open'" :literal="$t('ModalAjudaArticleClient.EmptyArticlesClient')" />
                        <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('ModalAjudaArticleClient.InfoBusquedaArticleClientArticle')" />
                    </div>
                </template>
                <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                    <template #body="{data}">
                        <div style="width: 100%;">
                            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedArticleClient = data; contextMenu.show($event)" />
                        </div>
                    </template>
                </Column>
                <Column field="referencia" :style="{width:'150px'}" style="max-width: 150px;">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Referencia')"
                            :showHelp="!focusedClients" :help="'Ctrl+1'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="articleClient" :style="{width:'145px'}" style="max-width: 145px">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Articleclient')"
                            :showHelp="!focusedClients" :help="'Ctrl+2'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="nomClient" :style="{width:'120px'}" :header="$t('ModalAjudaArticleClient.Nom client')">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.nomClient">
                        {{ data.nomClient }}
                        </div>
                    </template>
                </Column>
                <Column field="aliasClient" :style="{width:'120px'}" :header="$t('ModalAjudaArticleClient.Alias client')">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.aliasClient">
                            {{ data.aliasClient }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Form envio')" field="formaEnviament" :style="{width:'90px'}" style="max-width: 90px">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.formaEnviament">
                            {{ data.formaEnviament }}
                        </div>
                    </template>
                </Column>
                <Column field="denominacio" :style="{width:'120px'}" style="max-width: 120px">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Denominacio')"
                            :showHelp="!focusedClients" :help="'Ctrl+3'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.denominacio">
                            {{ data.denominacio }}
                        </div>
                    </template>
                </Column>
                <Column field="codiProveidor" :header="$t('ModalAjudaArticleClient.Codi proveidor')" :style="{width:'100px'}" style="max-width: 100px;">
                    <div class="ellipsis" v-tooltip="data.codiProveidor">
                            {{ data.codiProveidor }}
                        </div>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Nivell tecnic')" field="nivellTecnic" :style="{width:'100px'}">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.nivellTecnic">
                            {{ data.nivellTecnic }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Partida aranzelaria')" :style="{width:'150px'}" style="max-width: 150px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;" class="ellipsis" v-tooltip="`${data.partidaArantzelariaCodi} - ${data.partidaArantzelariaDescripcio}`">
                            {{ `${data.partidaArantzelariaCodi} - ${data.partidaArantzelariaDescripcio}` }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Preu')" :style="{width:'110px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                            {{ `${$n(data.preu)} ${data.divisa}` }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Stock')" field="stock" :style="{width:'80px'}" style="max-width: 80px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                            {{ $n(data.stock) }}
                        </div>
                    </template>
                </Column>
                <Column field="codiEmpresa" :header="$t('ModalAjudaArticleClient.Empresa')" :style="{width:'80px'}" style="max-width: 80px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="$empresa(data.codiEmpresa)">
                            {{ $empresa(data.codiEmpresa) }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Fabrica')" :style="{width:'80px'}" style="max-width: 80px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="$fabrica(data.codiFabrica)">
                            {{ $fabrica(data.codiFabrica) }}
                        </div>
                    </template>
                </Column>
                <Column field="flag" :style="{width:'70px'}" style="max-width: 70px;">
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
import { ref, watch, nextTick, toRef, computed, getCurrentInstance, onMounted, inject } from 'vue';
import ComandesService from '@/services/comandes.service';
import MagatzemService from '@/services/magatzem.service';
import debounce from 'debounce';
import ColumnaOrdenacio from '@/components/ColumnaOrdenacio.vue';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { avPag, arrowDown, home, rePag, arrowUp, end, scrollCenter } from '@/utils/datetableUtils.js';
import { useI18n } from 'vue-i18n';
import { saveAs } from 'file-saver';
import { carrega } from '@/services/loader';
import DetallOrdresFabricacio from '@/components/ordresFabricacio/DetallOrdreFabricacio.vue';
import AjudaStocks from './AjudaStocks.vue';
import ModalMissatgesEDIArticleClient from './ModalMissatgesEDIArticleClient.vue';
import { usePermisosStore } from '@/stores/permisos';
import CrearEditarEmbalatgeExpedicio from './CrearEditarEmbalatgeExpedicio.vue';
import ModalHistoricMoviments from './ModalHistoricMoviments.vue';

export default {
    name : 'AjudaArticleClientByClient',
    components : {
        ColumnaOrdenacio,
        DetallOrdresFabricacio,
        AjudaStocks,
        InfoTaulaBuida,
        ModalMissatgesEDIArticleClient,
        CrearEditarEmbalatgeExpedicio,
        ModalHistoricMoviments,
    },
    props : {
        seleccioCallback : Function,
        seleccioCallbackArtIntCliCod : Function,
        visible : Boolean,
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const contextMenu = ref();
        const refVisible = toRef(props, 'visible');
        const permisosStore = usePermisosStore();
        const provFabrica = inject('fabrica');
        // Article-client
        const inputFiltreArticle = ref();
        const valorFiltreArticleclient = ref('');
        const valorFiltreArticleInactius = ref(false);
        const valorFiltreResponsables = ref('');
        const articlesclient = ref();
        const selectedArticleClient = ref();
        const selectedIndexArticleClient = ref(-1);
        const colOrderArticleclient = ref('1');
        const orderAscArticleclient = ref(true);
        const visibleDialogDetallOF = ref(false);
        const visibleStocks = ref(false);
        const visibleMissatgesEDI = ref(false);
        const visibleCrearEditarEmbalatgeExpedicio = ref(false);
        const visibleHistoricMoviments = ref(false);
        let ordenacionsArticleclient = {
                'referencia': '1',
                'article': '2',
                'denominacio': '3'
        };
        let abortControllerArticles;
        // Focus de seleccions
        const focusedClients = ref(true);
        const usuariAntic = ref(permisosStore.teUsuariAntic());
        const { appContext } = getCurrentInstance();
        const responsablesLogistica = appContext.config.globalProperties.$responsablesLogistica;
        const usuariActual = ref();

        const elementArticleClient = () => document.getElementById('articlesclientByArticle');

        onMounted(() => {
            if (usuariAntic.value) {
                usuariActual.value = responsablesLogistica.find(u => u.nom === usuariAntic.value);
            }
            if (localStorage.getItem('valorFiltreResponsablesArticleClient')) {
                let seleccionats = localStorage.getItem('valorFiltreResponsablesArticleClient');
                valorFiltreResponsables.value = seleccionats.split(',').filter(r => responsablesLogistica.some(rl => rl.nom === r));
            } else {
                localStorage.setItem('valorFiltreResponsablesArticleClient', []);
            }
        });

        watch(refVisible, () => {
            if (refVisible.value) {
                document.addEventListener("keydown", handler);
                nextTick(() => {
                    inputFiltreArticle.value.$el.focus();
                    inputFiltreArticle.value.$el.select();
                    scrollCenter(elementArticleClient(), selectedIndexArticleClient);
                });
            } else {
                document.removeEventListener("keydown", handler);
            }

            if (localStorage.getItem('valorFiltreResponsablesArticleClient')) {
                let seleccionats = localStorage.getItem('valorFiltreResponsablesArticleClient');
                valorFiltreResponsables.value = seleccionats.split(',').filter(r => responsablesLogistica.some(rl => rl.nom === r));
            } else {
                localStorage.setItem('valorFiltreResponsablesArticleClient', []);
                valorFiltreResponsables.value = [];
            }
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

        watch(valorFiltreResponsables, () => {
            localStorage.setItem('valorFiltreResponsablesArticleClient', 
                valorFiltreResponsables.value
            );
            performSearchArticles();
        });

        const performSearchArticles = debounce(async() => {
            if (abortControllerArticles && !abortControllerArticles.aborted) {
                abortControllerArticles.abort();
            }
            abortControllerArticles = new AbortController();
            if (valorFiltreArticleclient.value.length >= 3) {
                articlesclient.value = await ComandesService.articlesClient(valorFiltreArticleclient.value,
                    valorFiltreResponsables.value, valorFiltreArticleInactius.value, colOrderArticleclient.value, 
                    orderAscArticleclient.value, abortControllerArticles);
                home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else {
                articlesclient.value = [];
                selectedArticleClient.value = null;
            }
        }, 100);

        const modalVisible = computed(() => {
            return visibleDialogDetallOF.value
            || visibleStocks.value
            || visibleMissatgesEDI.value
            || visibleStocks.value
            || visibleCrearEditarEmbalatgeExpedicio.value
            || visibleHistoricMoviments.value;
        });

        const handler = (ev) => {
            if (modalVisible.value) { 
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
                home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='End') {
                ev.preventDefault();
                end(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='0') {
                ev.preventDefault();
                valorFiltreArticleInactius.value = !valorFiltreArticleInactius.value;
            } else if (ev.ctrlKey && ev.key=='1') {
                ev.preventDefault();
                orderColumnArticleclient('referencia');
            } else if (ev.ctrlKey && ev.key=='2') {
                ev.preventDefault();
                orderColumnArticleclient('article');
            } else if (ev.ctrlKey && ev.key=='3') {
                ev.preventDefault();
                orderColumnArticleclient('denominacio');
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
            arrowDown(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerArrowUp = () => {
            arrowUp(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const avansaPagina = () => {
            avPag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const tornaPagina = () => {
            rePag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerEnter = () => {
            if (selectedArticleClient.value){
                props.seleccioCallback?.(artCli.value);
                props.seleccioCallbackArtIntCliCod?.(artIntCliCod.value);
            }
        }

        const artCli = computed(() => {
            return selectedArticleClient.value.article + selectedArticleClient.value.codiClient;
        })

        const artIntCliCod = computed(() => {
            let artIntCliCod = {
                artInt: selectedArticleClient.value.artInt,
                cliCod: selectedArticleClient.value.codiClient,
                articleClient: selectedArticleClient.value.article + selectedArticleClient.value.codiClient,
                nomClient: selectedArticleClient.value.nomClient,
                referencia: selectedArticleClient.value.referencia,
                fabrica: provFabrica(selectedArticleClient.value.codiFabrica),
                tipus: selectedArticleClient.value.tipus
            };
            return artIntCliCod;
        })


        const hide = () => {
            emit('update:carregat', false);
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
            result.push({label: `${t('historicMoviments.titol')}`, icon: 'pi pi-history', command: () => {
                visibleHistoricMoviments.value = true;
            }});
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Trasabilitat')}`, class:'p-button-text', icon: 'pi pi-list', command: async () => {
                await descarregaTrasabilitat();
            }});
            result.push({label: ()=>  `${t('ModalAjudaArticleClient.Localitzacio')}`, class:'p-button-text', icon: 'pi pi-map-marker', command: async () => {
                await descarregaLocalitzacio();
            }});
            result.push({label: `${t('OF.Veure detall OF')}`, icon: 'pi pi-eye',
                command: () => {
                    emit('veureDetallOF', selectedIndexArticleClient.value);
                    visibleDialogDetallOF.value = true;
                }
            });
            result.push({label: `${t('Comandes.Veure stock')}`, icon: 'pi pi-box', command: () => {
                visibleStocks.value = true;
            }});
            result.push({label: () => t('ModalMissatgesEDI.Titol'), icon: 'pi pi-file-pdf', command: () => {
                visibleMissatgesEDI.value = true;
            }});
            result.push({label: `${t('ModalAjudaArticleClient.Embalatge expedicio')}`, icon: 'pi pi-truck', command: () => {
                visibleCrearEditarEmbalatgeExpedicio.value = true;
            }});
            return result;
        });

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndexArticleClient.value;
            selectedIndexArticleClient.value = articlesclient.value.findIndex(l => l.articleClient == selectedArticleClient.value.articleClient);
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
            emit,
            refVisible,
            hide,
            props,
            inputFiltreArticle,
            valorFiltreArticleclient,
            valorFiltreArticleInactius,
            valorFiltreResponsables,
            colOrderArticleclient, orderAscArticleclient, orderColumnArticleclient, ordenacionsArticleclient,
            articlesclient,
            selectedArticleClient,
            artCli,
            selectedIndexArticleClient,
            classArticleClientFocused,
            handlerEnter,
            getSeverityFlag,
            showContextMenu,
            actionHandler,
            contextMenu,
            menuModel,
            descarregaLocalitzacio,
            descarregaTrasabilitat,
            artIntCliCod,
            visibleDialogDetallOF,
            visibleStocks,
            performSearchArticles,
            usuariActual,
            usuariAntic,
            visibleMissatgesEDI,
            visibleCrearEditarEmbalatgeExpedicio,
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

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
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