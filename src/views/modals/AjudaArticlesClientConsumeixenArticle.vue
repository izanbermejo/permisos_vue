<template>
    <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaArticleClient.TitolClientsConsumeixenArticle', [refArticle]) }}</span>
            <button tabindex="-1" style="float: right;" @click="hide"
                class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
                <span class="p-dialog-header-close-icon pi pi-times"></span>
            </button>
        </div>
    </template>
    <div class="card">
        <div class="card-header filtre">
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText ref="inputFiltre" v-model="valorFiltre"  
                    :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreClients')"
                    style="width: 275px"
                    @keydown.tab="$event.preventDefault()" />
                <!-- <label style="position: absolute; right: 2px; bottom: 0.1px; color: grey; font-size: 0.7rem;">ctrl + 0</label> -->
            </span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="valorFiltreInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar inactius') }} </label>
                <label style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
        </div>
        <div id="clientsByArticle" class="card-body bodyfocused" style="min-height: 38vh; max-height: 38vh;">
            <DataTable :value="articlesclient" class="p-datatable-sm-petita" 
                    v-model:selection="selectedArticleClient"
                    selectionMode="single"
                    dataKey="articleClient"
                    showGridlines
                    :scrollable="true" scrollDirection="both" scrollHeight="36vh"
                    :resizableColumns="true" columnResizeMode="expand"
					@row-dblclick="window?.getSelection()?.removeAllRanges(); handlerEnter()"
                    @row-select="selectedIndexArticleClient = $event.index; inputFiltre.$el.focus();">
                <template #empty>
                    <div style="width:100%; height: 55vh; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida v-if="valorFiltreArticleclient?.length >=3" :icon="'fa-solid fa-face-frown-open'" :literal="$t('ModalAjudaArticleClient.EmptyArticlesClient')" />
                        <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('ModalAjudaArticleClient.InfoBusquedaArticleClientArticle')" />
                    </div>
                </template>
                <Column field="referencia" :style="{width:'170px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Referencia')"
                            :help="'Ctrl+1'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="articleClient" :style="{width:'150px'}" style="max-width: 150px">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Articleclient')"
                            :help="'Ctrl+2'"
                            :order="colOrderArticleclient===ordenacionsArticleclient[column.props.field]" :orderAsc="orderAscArticleclient"/>
                    </template>
                </Column>
                <Column field="nomClient" :style="{width:'140px'}" :header="$t('ModalAjudaArticleClient.Nom client')">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.nomClient">
                        {{ data.nomClient }}
                        </div>
                    </template>
                </Column>
                <Column field="aliasClient" :style="{width:'140px'}" :header="$t('ModalAjudaArticleClient.Alias client')">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="data.aliasClient">
                            {{ data.aliasClient }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Form envio')" field="formaEnviament" :style="{width:'80px'}"></Column>
                <Column field="denominacio" :style="{width:'100px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumnArticleclient(column.props.field)" :literal="$t('ModalAjudaArticleClient.Denominacio')"
                            :help="'Ctrl+3'"
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
                <Column :header="$t('ModalAjudaArticleClient.Nivell tecnic')" field="nivellTecnic" :style="{width:'80px'}"></Column>
                <Column :header="$t('ModalAjudaArticleClient.Preu')" :style="{width:'110px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                            {{ `${$n(data.preu)} ${data.divisa}` }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Stock')" field="stock" :style="{width:'90px'}" style="max-width: 100px;">
                    <template #body="{data}">
                        <div style="width: 100%; text-align: right;">
                            {{ $n(data.stock) }}
                        </div>
                    </template>
                </Column>
                <Column field="codiEmpresa" :header="$t('ModalAjudaArticleClient.Empresa')" :style="{width:'125px'}" style="max-width: 125px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="$empresa(data.codiEmpresa)">
                            {{ $empresa(data.codiEmpresa) }}
                        </div>
                    </template>
                </Column>
                <Column :header="$t('ModalAjudaArticleClient.Fabrica')" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div class="ellipsis" v-tooltip="$fabrica(data.codiFabrica)">
                            {{ $fabrica(data.codiFabrica) }}
                        </div>
                    </template>
                </Column>
                <Column field="flag" :style="{width:'90px'}" style="max-width: 90px;">
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
import { ref, watch, nextTick, toRef } from 'vue';
import ComandesService from '@/services/comandes.service';
import debounce from 'debounce';
import ColumnaOrdenacio from '@/components/ColumnaOrdenacio.vue';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { avPag, arrowDown, home, rePag, arrowUp, end, scrollCenter } from '@/utils/datetableUtils.js';
import { carrega } from '@/services/loader';

export default {
    name : 'AjudaArticlesClientConsumeixenArticle',
    components : {
        ColumnaOrdenacio,
        InfoTaulaBuida,
    },
    props : {
        artint : String,
        article : String,
        seleccioCallback : Function,
        visible : Boolean,
    },
    setup(props, { emit }) {
        const refVisible = toRef(props, 'visible');
        // Client
        const inputFiltre = ref();
        const valorFiltreInactius = ref(false);
        const valorFiltre = ref('');
        const articlesclient = ref();
        const selectedArticleClient = ref();
        const selectedIndex = ref(-1);
        const colOrder = ref('1');
        const orderAsc = ref(true);
        let ordenacionsArticleclient = {
                'codi': '1',
                'nom': '2',
                'alias': '3'
        };
        let abortController;
        let isInicialitzat = false;
        const refArticle = toRef(props, 'article');
        const refArtint = toRef(props, 'artint');

        const elementClient = () => document.getElementById('clientsByArticle');

        watch(refVisible, () => {
            if (refVisible.value) {
                document.addEventListener("keydown", handler);
                performSearchInicial();
                nextTick(() => {
                    inputFiltre.value.$el.focus();
                    scrollCenter(elementClient(), selectedIndex);
                });
            } else {
                document.removeEventListener("keydown", handler);
            }
        });

        watch(refArtint, () => {
            isInicialitzat = false;
        })

        watch(selectedIndex, () => {
            selectedArticleClient.value = articlesclient.value[selectedIndex.value];
        });

        watch(articlesclient, () => {
            if (articlesclient.value.length){
                nextTick(() => {
                    selectedIndex.value = 0;
                    selectedArticleClient.value = articlesclient.value[selectedIndex.value];
                });
            }
        });

        watch([valorFiltre, valorFiltreInactius], async() => {
            performSearch();
        });

        const performSearch = debounce(async() => {
            if (abortController && !abortController.aborted) {
                abortController.abort();
            }
            abortController = new AbortController();
            articlesclient.value = await ComandesService.articlesClientByArticle(refArtint.value, valorFiltre.value, valorFiltreInactius.value,
                colOrder.value, orderAsc.value, abortController);
            home(elementClient(), selectedIndex, articlesclient);
        }, 150);

        const performSearchInicial = async() => {
            if (!isInicialitzat) {
                articlesclient.value = await carrega(ComandesService.articlesClientByArticle(refArtint.value, valorFiltre.value, valorFiltreInactius.value,
                    colOrder.value, orderAsc.value));
                home(elementClient(), selectedIndex, articlesclient);
            }
            isInicialitzat = true;
        }

        const handler = (ev) => {
            if (ev.key === 'Escape') {
                hide();
            }
            if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                arrowDown(elementClient(), selectedIndex, articlesclient);
            } else if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                arrowUp(elementClient(), selectedIndex, articlesclient);
            } else if (ev.key === 'Enter') {
                ev.preventDefault();
                handlerEnter();
            } else if (ev.key == 'PageDown') {
                ev.preventDefault();
                avPag(elementClient(), selectedIndex, articlesclient);
            } else if (ev.key == 'PageUp') {
                ev.preventDefault();
                rePag(elementClient(), selectedIndex, articlesclient);
            } else if (ev.ctrlKey && ev.key=='Home') {
                ev.preventDefault();
                home(elementClient(), selectedIndex, articlesclient)
            } else if (ev.ctrlKey && ev.key=='End') {
                ev.preventDefault();
                end(elementClient(), selectedIndex, articlesclient)
            } else if (ev.ctrlKey && ev.key=='0') {
                ev.preventDefault();
                valorFiltreInactius.value = !valorFiltreInactius.value
            } else if (ev.ctrlKey && ev.key=='1') {
                ev.preventDefault();
                orderColumn('codi');
            } else if (ev.ctrlKey && ev.key=='2') {
                ev.preventDefault();
                orderColumn('nom');
            } else if (ev.ctrlKey && ev.key=='3') {
                ev.preventDefault();
                orderColumn('alias');
            }
        }

        const orderColumn = (col) => {
            if (colOrder.value ===  ordenacionsArticleclient[col]) {
                orderAsc.value = !orderAsc.value;
            } else {
                colOrder.value = ordenacionsArticleclient[col];
                orderAsc.value = true;
            }
            performSearch();
        }

        const handlerEnter = () => {
            if (selectedArticleClient.value)
                props.seleccioCallback(selectedArticleClient.value.articleClient);
        }

        const hide = () => {
            emit('update:carregat', false);
        }

        const getSeverityFlag = (flag) => {
            if (flag === 'A') return 'success';
            if (flag === 'E') return 'danger';
            if (flag === 'I') return 'warning';
        }
        
        return {
            emit,
            refVisible,
            refArticle,
            articlesclient,
            inputFiltre,
            valorFiltreInactius,
            valorFiltre,
            hide,
            props,
            selectedArticleClient,
            selectedIndex,  
            colOrder, orderAsc, orderColumn, ordenacionsArticleclient,
            getSeverityFlag,
            handlerEnter,
        }
    },
}
</script>
<style scoped >

    .bodyfocused {
        border: 3px solid #b0daf8;
        padding: 2px;
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
</style>