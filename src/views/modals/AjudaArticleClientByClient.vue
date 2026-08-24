<template>
    <DetallOrdresFabricacio v-if="visibleDialogDetallOF" :carregat="visibleDialogDetallOF"
    @update:carregat="visibleDialogDetallOF = $event;" :articleClient="artIntCliCod.articleClient" :artInt="artIntCliCod.artInt" :cliCod="artIntCliCod.cliCod" :fabrica="artIntCliCod.fabrica" />
    <AjudaStocks v-if="visibleStocks" :carregat="visibleStocks"  @update:carregat="visibleStocks = $event"
      :artint="selectedArticleClient.artInt" :clicod="selectedArticleClient.codiClient" />
    <ModalExportarDetallComandesClient v-if="visibleModalExportarDetallComandesClient" :carregat="visibleModalExportarDetallComandesClient" @update:carregat="visibleModalExportarDetallComandesClient = $event;" :client="selectedClient.codi"/>
    <ModalAdjuntsClient v-if="visibleModalAdjuntsClient" :carregat="visibleModalAdjuntsClient" @update:carregat="visibleModalAdjuntsClient = $event;" :client="selectedClient.codi" :nomClient="selectedClient.nom"/>
    <ModalMissatgesEDIArticleClient v-if="visibleMissatgesEDI" :carregat="visibleMissatgesEDI"
        :cliCod="selectedArticleClient?.codiClient" :artInt="selectedArticleClient?.artInt"
        @update:carregat="visibleMissatgesEDI = $event" />
    <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaArticleClient.TitolClient') }}</span>
            <ButtonShortcut :literal="$t('ModalAjudaArticleClient.TitolArticle')" :shortcut="'[Ctrl+B]'" @click="emit('switch')"
                icon="fa-solid fa-file" style="margin-left: 125px;"/>
            <button tabindex="-1" style="float: right;" @click="hide"
                class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                <span class="p-dialog-header-close-icon pi pi-times"></span>
            </button>
        </div>
    </template>
    <div class="card" style="margin-top: 10px;">
        <div class="card-header filtre">
            <span style="font-size: larger; font-weight: 600;">{{ $t('ModalAjudaArticleClient.Clients') }}</span>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText ref="inputFiltreClients" v-model="valorFiltre"  
                    :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreClients')"
                    style="width: 275px" @focus="focusedClients = true" 
                    @keydown.tab="$event.preventDefault();inputFiltreArticle.$el.focus()" />
                <!-- <label style="position: absolute; right: 2px; bottom: 0.1px; color: grey; font-size: 0.7rem;">ctrl + 0</label> -->
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
                <Checkbox v-model="valorFiltreClientsInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar clients inactius') }} </label>
                <label v-if="focusedClients" style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
        </div>
        <ContextMenu ref="contextMenuClient" :model="menuModelClient" style="width: auto;" @focus="contextMenuClient.onArrowDownKey($event)"/>
        <div id="clientsByClient" class="card-body" style="min-height: 28vh; max-height: 28vh;" :class="classClientFocused()">
            <DataTable :value="clients" class="p-datatable-sm-petita"
                    v-model:selection="selectedClient"
                    selectionMode="single"
                    dataKey="codi"
                    showGridlines
                    contextMenu v-model:contextMenuSelection="selectedClient" @rowContextmenu="showContextMenuClient($event)"
                    :scrollable="true" scrollDirection="both" scrollHeight="26vh"
                    :resizableColumns="true" columnResizeMode="expand"
                    :rowClass="() => 'estilRow'"
                    @row-select="selectedIndex = $event.index; inputFiltreClients.$el.focus();"
                    @row-dblclick="inputFiltreArticle.$el.focus()">
                <template #empty>
                    <div style="width:100%; height: 23vh; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida v-if="valorFiltre?.length >=3" :icon="'fa-solid fa-face-frown-open'" :literal="$t('ModalAjudaArticleClient.EmptyClients')" />
                        <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('ModalAjudaArticleClient.InfoBusquedaClient')" />
                    </div>
                </template>
                <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
                    <template #body="{data}">
                        <div style="width: 100%;">
                            <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="selectedClient = data; contextMenuClient.show($event)" />
                        </div>
                    </template>
                </Column>
                <Column field="codi" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Codi')"
                            :showHelp="focusedClients" :help="'Ctrl+1'"
                            :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc"/>
                    </template>
                </Column>
                <Column field="nom" :style="{width:'200px'}">
                    <template #header="{column}">
                        <div class="ellipsis">
                            <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Nom')"
                                :showHelp="focusedClients" :help="'Ctrl+2'"
                                :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc" class="ellipsis"/>
                        </div>
                    </template>
                </Column>
                <Column field="alias" :style="{width:'200px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Alias')"
                            :showHelp="focusedClients" :help="'Ctrl+3'"
                            :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc"/>
                    </template>
                </Column>
                <Column field="responsableLogis" :header="$t('ModalAjudaClient.pais')" :style="{width:'180px'}" style="max-width: 180px;">
                    <template #body="{data}">
                        {{ `${data.nomPais}` }}
                    </template>
                </Column>
                <Column field="codiProveidor" :header="$t('ModalAjudaArticleClient.Codi proveidor')" :style="{width:'150px'}" style="max-width: 150px;">
                    <template #body="{data}">
                        {{ data.codiProveidor }}
                    </template>
                </Column>
                <Column field="codiEmpresa" :header="$t('ModalAjudaArticleClient.Empresa')" :style="{width:'150px'}" style="max-width: 150px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="`${data.codiEmpresa} - ${$empresa(data.codiEmpresa)}`">
                            {{ `${data.codiEmpresa} - ${$empresa(data.codiEmpresa)}` }}
                        </div>
                    </template>
                </Column>
                <Column field="usulogis" :header="$t('ModalAjudaArticleClient.responsable logistic')" :style="{width:'180px'}" style="max-width: 180px;">
                    <template #body="{data}">
                        {{ `${data.usulogis}` }}
                    </template>
                </Column>
                <Column field="flag" :style="{width:'100px'}" style="max-width: 100px;">
                    <template #body="{data}">
                        <div v-if="data.isImpagament" style="width: 100%; text-align: center;">
                            <Tag :value="$t(`ModalAjudaArticleClient.Impagament`)" severity="danger" />
                        </div>
                    </template>
                </Column>
                <Column field="flag" :style="{width:'100px'}" style="max-width: 100px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: center;">
                            <Tag :value="$t(`ModalAjudaArticleClient.${data.flag}`)" :severity="getSeverityFlag(data.flag)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <div class="card" style="margin-top: 30px;">
        <div class="card-header filtre">
            <span style="font-size: larger; font-weight: 600;">{{ $t('ModalAjudaArticleClient.Articles-client') }}</span>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText ref="inputFiltreArticle" v-model="valorFiltreArticleclient"  style="width: 250px" 
                :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreArticleclient')"
                @focus="focusedClients = false" 
                @keydown.tab="$event.preventDefault(); inputFiltreClients.$el.focus()" />
            </span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="valorFiltreArticleInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar articles-clients inactius') }} </label>
                <label v-if="!focusedClients" style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
            <div v-if="articlesclient?.length == 100" class="infolimit">
                <font-awesome-icon icon="fa-solid fa-circle-info" style="font-size: 1rem;" />
                {{ $t('App.Nomes es mostren els primers resultats', [articlesclient.length]) }}
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
                    @row-dblclick="handlerEnter()"
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
                <Column :header="$t('ModalAjudaArticleClient.Nivell tecnic')" field="nivellTecnic" :style="{width:'150px'}"></Column>
                <Column :header="$t('ModalAjudaArticleClient.Partida aranzelaria')" :style="{width:'150px'}" style="max-width: 150px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;" class="ellipsis" v-tooltip="`${data.partidaArantzelariaCodi} - ${data.partidaArantzelariaDescripcio}`">
                            {{ `${data.partidaArantzelariaCodi} - ${data.partidaArantzelariaDescripcio}` }}
                        </div>
                    </template>
                </Column>
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
                        <div style="width: 100%;" class="ellipsis" v-tooltip="`${data.codiFabrica} - ${$fabrica(data.codiFabrica)}`">
                        {{ `${data.codiFabrica} - ${$fabrica(data.codiFabrica)}` }}
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
import { ref, watch, nextTick, toRef, computed, getCurrentInstance, onMounted } from 'vue';
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
import { usePermisosStore } from '@/stores/permisos';
import ModalExportarDetallComandesClient from './ModalExportarDetallComandesClient.vue';
import ModalAdjuntsClient from '@/views/modals/ModalAdjuntsClient.vue';
import ModalMissatgesEDIArticleClient from './ModalMissatgesEDIArticleClient.vue';
    
export default {
    name : 'AjudaArticleClientByClient',
    components : {
        ColumnaOrdenacio,
        InfoTaulaBuida,
        DetallOrdresFabricacio,
        AjudaStocks,
        ModalExportarDetallComandesClient,
        ModalAdjuntsClient,
        ModalMissatgesEDIArticleClient,
    },
    props : {
        seleccioCallback : Function,
        seleccioCallbackArtIntCliCod : Function,
        visible : Boolean,
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const refVisible = toRef(props, 'visible');
        const permisosStore = usePermisosStore();
        // Client
        const inputFiltreClients = ref();
        const valorFiltreClientsInactius = ref(false);
        const valorFiltre = ref('');
        const valorFiltreResponsables = ref('');
        const clients = ref();
        const selectedClient = ref();
        const selectedIndex = ref(-1);
        const colOrder = ref('1');
        const orderAsc = ref(true);
        let ordenacionsClient = {
                'codi': '1',
                'nom': '2',
                'alias': '3'
        };
        let abortController;
        // Article-client
        const inputFiltreArticle = ref();
        const valorFiltreArticleclient = ref('');
        const valorFiltreArticleInactius = ref(false);
        const articlesclient = ref();
        const selectedArticleClient = ref();
        const selectedIndexArticleClient = ref(-1);
        const colOrderArticleclient = ref('1');
        const orderAscArticleclient = ref(true);
        const visibleDialogDetallOF = ref(false);
        const visibleStocks = ref(false);
        const visibleModalExportarDetallComandesClient = ref(false);
        const visibleMissatgesEDI = ref(false);
        const visibleModalAdjuntsClient = ref(false);
        let ordenacionsArticleclient = {
                'referencia': '1',
                'article': '2',
                'denominacio': '3'
        };
        let abortControllerArticles;
        const contextMenu = ref();
        const contextMenuClient = ref();
        // Focus de seleccions
        const focusedClients = ref(true);
        const usuariAntic = ref(permisosStore.teUsuariAntic());
        const { appContext } = getCurrentInstance();
        const responsablesLogistica = appContext.config.globalProperties.$responsablesLogistica;
        const usuariActual = ref();

        const elementClient = () => document.getElementById('clientsByClient');
        const elementArticleClient = () => document.getElementById('articlesclientByClient');

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
                    inputFiltreClients.value.$el.focus();
                    inputFiltreClients.value.$el.select();
                    scrollCenter(elementClient(), selectedIndex);
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

        watch(selectedIndex, () => {
            selectedClient.value = clients.value[selectedIndex.value];
        });

        watch(clients, () => {
            if (clients.value.length){
                nextTick(() => {
                    selectedIndex.value = 0;
                    selectedClient.value = clients.value[selectedIndex.value];
                });
            } else {
                articlesclient.value = [];
            }
        });

        watch(selectedClient, () => {
            performSearchArticles();
        })

        watch([valorFiltre, valorFiltreClientsInactius], async() => {
            performSearch();
        });

        watch(focusedClients, () => {
            focusedClients.value ?  inputFiltreClients.value.$el.focus() : inputFiltreArticle.value.$el.focus();
        });

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
            performSearch();
        });

        const canviarResponsables = () => {
            
        }

        const performSearchArticles = debounce(async() => {
            if (abortControllerArticles && !abortControllerArticles.aborted) {
                abortControllerArticles.abort();
            }
            abortControllerArticles = new AbortController();
            if (selectedClient.value) {
                let codiClient = selectedClient.value.codi;
                articlesclient.value = await ComandesService.articlesClientByClient(codiClient, valorFiltreArticleclient.value,
                    valorFiltreArticleInactius.value, colOrderArticleclient.value, orderAscArticleclient.value, abortControllerArticles);
                home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            }
        }, 100);

        const performSearch = debounce(async() => {
            if (abortController && !abortController.aborted) {
                abortController.abort();
            }
            abortController = new AbortController();
            if (valorFiltre.value.length >= 3) {
                clients.value = await ComandesService.queryClients(valorFiltre.value, valorFiltreResponsables.value, valorFiltreClientsInactius.value,
                    colOrder.value, orderAsc.value, abortController);
                home(elementClient(), selectedIndex, clients);
            } else {
                clients.value = [];
                selectedClient.value = null;
            }
        }, 150);

        const modalVisible = computed(() => {
            return visibleDialogDetallOF.value
            || visibleStocks.value
            || visibleModalAdjuntsClient.value
            || visibleMissatgesEDI.value;
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
                focusedClients.value
                    ? home(elementClient(), selectedIndex, clients)
                    : home(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='End') {
                ev.preventDefault();
                focusedClients.value
                    ? end(elementClient(), selectedIndex, clients)
                    : end(elementArticleClient(), selectedIndexArticleClient, articlesclient);
            } else if (ev.ctrlKey && ev.key=='0') {
                ev.preventDefault();
                focusedClients.value 
                    ? valorFiltreClientsInactius.value = !valorFiltreClientsInactius.value
                    : valorFiltreArticleInactius.value = !valorFiltreArticleInactius.value;
            } else if (ev.ctrlKey && ev.key=='1') {
                ev.preventDefault();
                focusedClients.value ? orderColumn('codi') : orderColumnArticleclient('referencia');
            } else if (ev.ctrlKey && ev.key=='2') {
                ev.preventDefault();
                focusedClients.value ? orderColumn('nom') : orderColumnArticleclient('article');
            } else if (ev.ctrlKey && ev.key=='3') {
                ev.preventDefault();
                focusedClients.value ? orderColumn('alias') : orderColumnArticleclient('denominacio');
            }
        }

        const orderColumn = (col) => {
            if (colOrder.value ===  ordenacionsClient[col]) {
                orderAsc.value = !orderAsc.value;
            } else {
                colOrder.value = ordenacionsClient[col];
                orderAsc.value = true;
            }
            performSearch();
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
                ? arrowDown(elementClient(), selectedIndex, clients)
                : arrowDown(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerArrowUp = () => {
            focusedClients.value 
                ? arrowUp(elementClient(), selectedIndex, clients)
                : arrowUp(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const avansaPagina = () => {
            focusedClients.value 
                ? avPag(elementClient(), selectedIndex, clients)
                : avPag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const tornaPagina = () => {
            focusedClients.value 
                ? rePag(elementClient(), selectedIndex, clients)
                : rePag(elementArticleClient(), selectedIndexArticleClient, articlesclient);
        }

        const handlerEnter = () => {
            if (focusedClients.value && selectedClient.value) {
                focusedClients.value = false;
            } else if (!focusedClients.value && selectedArticleClient.value) {
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
                fabrica: selectedArticleClient.value.codiFabrica + " - " + selectedArticleClient.value.nomFabrica,
                tipus: selectedArticleClient.value.tipus
            };
            return artIntCliCod;
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
            result.push({label: `${t('OF.Veure detall OF')}`, icon: 'pi pi-eye',
                command: () => {
                    emit('veureDetallOF', selectedIndex.value);
                    visibleDialogDetallOF.value = true;
                }
            });
            result.push({label: `${t('Comandes.Veure stock')}`, icon: 'pi pi-box', command: () => {
                visibleStocks.value = true;
            }});
            result.push({label: () => t('ModalMissatgesEDI.Titol'), icon: 'pi pi-file-pdf', command: () => {
                visibleMissatgesEDI.value = true;
            }});
            return result;
        });

        const menuModelClient = computed(() => {
            let result = [];
            result.push({label: ()=>  `${t('Comandes.Exportar detall comandes client')}`, class:'p-button-text', icon: 'pi pi-file-excel', command: () => {
                visibleModalExportarDetallComandesClient.value = true;
            }});
            result.push({ label: ()=> t('ModalAdjuntsClient.Titol'), icon: 'pi pi-paperclip', command: () => visibleModalAdjuntsClient.value = true });
            return result;
        });

        const showContextMenu = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = articlesclient.value.findIndex(l => l.referencia == selectedArticleClient.value.referencia);
            if (selectedOld === selectedIndex.value) {
                selectedArticleClient.value = articlesclient.value[selectedIndex.value];
            }
            contextMenu.value.show(ev.originalEvent);
        }

        const showContextMenuClient = (ev) => {
            let selectedOld = selectedIndex.value;
            selectedIndex.value = clients.value.findIndex(l => l.referencia == selectedClient.value.referencia);
            if (selectedOld === selectedIndex.value) {
                selectedClient.value = clients.value[selectedIndex.value];
            }
            contextMenuClient.value.show(ev.originalEvent);
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            if (contextMenu?.value)
            contextMenu.value.visible = false;
            if (contextMenuClient?.value)
            contextMenuClient.value.visible = false;
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
            clients,
            inputFiltreClients,
            valorFiltreClientsInactius,
            valorFiltre,
            valorFiltreResponsables,
            hide,
            props,
            selectedClient,
            selectedIndex,
            inputFiltreArticle,
            valorFiltreArticleclient,
            valorFiltreArticleInactius,
            colOrder, orderAsc, orderColumn, ordenacionsClient,
            colOrderArticleclient, orderAscArticleclient, orderColumnArticleclient, ordenacionsArticleclient,
            articlesclient,
            selectedArticleClient,
            selectedIndexArticleClient,
            artCli,
            focusedClients,
            classClientFocused,
            classArticleClientFocused,
            getSeverityFlag,
            showContextMenu,
            showContextMenuClient,
            actionHandler,
            contextMenu,
            contextMenuClient,
            menuModel,
            menuModelClient,
            descarregaLocalitzacio,
            descarregaTrasabilitat,
            artIntCliCod,
            visibleDialogDetallOF,
            visibleStocks,
            visibleModalExportarDetallComandesClient,
            visibleModalAdjuntsClient,
            handlerEnter,
            performSearch,
            usuariActual,
            usuariAntic,
            canviarResponsables,
            visibleMissatgesEDI,
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

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
</style>