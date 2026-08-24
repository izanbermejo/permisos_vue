<template>
    <Dialog v-model:visible="refVisible" modal @hide="hide" :closable="false" :closeOnEscape="false" :draggable="false" style="width: 90%;">
    <template #header>
        <div style="width: 100%;">
            <span style="font-size: larger; font-weight: 600; float: left;">{{ $t('ModalAjudaClient.TitolClient') }}</span>
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
                    @focus="$event.originalTarget.select()"
                    :placeholder="$t('ModalAjudaArticleClient.PlaceholderFiltreClients')"
                    style="width: 275px" />
            </span>
            <span style="display: flex; column-gap: 5px; align-items: center;">
                <Checkbox v-model="valorFiltreClientsInactius" :binary="true" tabindex="-1"/>
                <label> {{ $t('ModalAjudaArticleClient.Mostrar clients inactius') }} </label>
                <label style="color: grey; font-size: 0.8rem; vertical-align: bottom">[Ctrl + 0]</label>
            </span>
        </div>
        <div id="ajudaClients" class="card-body bodyfocused" style="min-height: 28vh; max-height: 28vh;">
            <DataTable :value="clients" class="p-datatable-sm-petita"
                    v-model:selection="selectedClient"
                    selectionMode="single"
                    dataKey="codi"
                    showGridlines
                    :scrollable="true" scrollDirection="both" scrollHeight="26vh"
                    :resizableColumns="true" columnResizeMode="expand"
                    @row-dblclick="seleccioCallback(selectedClient)"
                    @row-select="selectedIndex = $event.index; inputFiltreClients.$el.focus();">
                <template #empty>
                    <div style="width:100%; height: 23vh; text-align: center; padding-top: 30px;">
                        <InfoTaulaBuida v-if="valorFiltre?.length >=3" :icon="'fa-solid fa-face-frown-open'" :literal="$t('ModalAjudaArticleClient.EmptyClients')" />
                        <InfoTaulaBuida v-else :icon="'fa-solid fa-info'" :literal="$t('ModalAjudaArticleClient.InfoBusquedaClient')" />
                    </div>
                </template>
                <Column field="codi" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Codi')"
                            :help="'Ctrl+1'"
                            :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc"/>
                    </template>
                </Column>
                <Column field="nom" :style="{width:'200px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Nom')"
                            :help="'Ctrl+2'"
                            :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc"/>
                    </template>
                </Column>
                <Column field="alias" :style="{width:'200px'}">
                    <template #header="{column}">
                        <ColumnaOrdenacio @click="orderColumn(column.props.field)" :literal="$t('ModalAjudaArticleClient.Alias')"
                            :help="'Ctrl+3'"
                            :order="colOrder===ordenacionsClient[column.props.field]" :orderAsc="orderAsc"/>
                    </template>
                </Column>
                <Column field="responsableLogis" :header="$t('ModalAjudaClient.pais')" :style="{width:'180px'}" style="max-width: 180px;">
                    <template #body="{data}">
                        {{ `${data.nomPais}` }}
                    </template>
                </Column>
                <Column field="nif" :header="$t('Comandes.NIF')" :style="{width:'160px'}" style="max-width: 160px;">
                    <template #body="{data}">
                        {{ data.nif }}
                    </template>
                </Column>
                <Column field="codiEmpresa" :header="$t('ModalAjudaArticleClient.Empresa')" :style="{width:'350px'}" style="max-width: 350px;">
                    <template #body="{data}">
                        {{ $empresa(data.codiEmpresa) }}
                    </template>
                </Column>
                <Column field="responsableLogis" :header="$t('ModalAjudaArticleClient.responsable logistic')" :style="{width:'180px'}" style="max-width: 180px;">
                    <template #body="{data}">
                        {{ `${data.usulogis}` }}
                    </template>
                </Column>
                <Column field="impagament" :style="{width:'120px'}" style="max-width: 120px;">
                    <template #body="{data}">
                        <div v-if="data.isImpagament" style="width: 100%; text-align: center;">
                            <Tag :value="$t(`ModalAjudaArticleClient.Impagament`)" severity="danger" />
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
import { ref, watch, nextTick, toRef } from 'vue';
import ComandesService from '@/services/comandes.service';
import debounce from 'debounce';
import ColumnaOrdenacio from '@/components/ColumnaOrdenacio.vue';
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { avPag, arrowDown, home, rePag, arrowUp, end, scrollCenter } from '@/utils/datetableUtils.js';

export default {
    name : 'AjudaArticleClientByClient',
    components : {
        ColumnaOrdenacio,
        InfoTaulaBuida,
    },
    props : {
        seleccioCallback : Function,
        visible : Boolean,
    },
    setup(props, { emit }) {
        const refVisible = toRef(props, 'visible');
        // Client
        const inputFiltreClients = ref();
        const valorFiltreClientsInactius = ref(false);
        const valorFiltre = ref('');
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

        const elementClient = () => document.getElementById('ajudaClients');

        watch(refVisible, () => {
            if (refVisible.value) {
                nextTick(() => {
                    inputFiltreClients.value.$el.focus();
                    inputFiltreClients.value.$el.select();
                    scrollCenter(elementClient(), selectedIndex);
                    // Es posa el listener amb un timeout ja que si s'obre el modal des d'un
                    // ContextMenu pot interferir l'Enter de la opció seleccionada
                    setTimeout(() => document.addEventListener("keydown", handler), 200);
                });
            } else {
                document.removeEventListener("keydown", handler);
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
            }
        });

        watch([valorFiltre, valorFiltreClientsInactius], async() => {
            performSearch();
        });

        const performSearch = debounce(async() => {
            if (abortController && !abortController.aborted) {
                abortController.abort();
            }
            abortController = new AbortController();
            if (valorFiltre.value.length >= 3) {
                // Quan es busca per normalitzats no s'aplica el filtre de responsables i per tant es passa com a buit per no afectar a la consulta
                let valorFiltreResponsables = '';
                clients.value = await ComandesService.queryClients(valorFiltre.value, valorFiltreResponsables, valorFiltreClientsInactius.value,
                    colOrder.value, orderAsc.value, abortController);
                home(elementClient(), selectedIndex, clients);
            } else {
                clients.value = [];
                selectedClient.value = null;
            }
        }, 150);

        const handler = (ev) => {
            if (ev.key === 'Escape') {
                hide();
            } else if (ev.key === 'ArrowDown') {
                ev.preventDefault();
                arrowDown(elementClient(), selectedIndex, clients);
            } else if (ev.key === 'ArrowUp') {
                ev.preventDefault();
                arrowUp(elementClient(), selectedIndex, clients);
            } else if (ev.key === 'Enter') {
                ev.preventDefault();
                if (selectedClient.value)
                    props.seleccioCallback(selectedClient.value);
            } else if (ev.key == 'PageDown') {
                ev.preventDefault();
                avPag(elementClient(), selectedIndex, clients);
            } else if (ev.key == 'PageUp') {
                ev.preventDefault();
                rePag(elementClient(), selectedIndex, clients);
            } else if (ev.ctrlKey && ev.key=='Home') {
                ev.preventDefault();
                home(elementClient(), selectedIndex, clients);
            } else if (ev.ctrlKey && ev.key=='End') {
                ev.preventDefault();
                end(elementClient(), selectedIndex, clients);
            } else if (ev.ctrlKey && ev.key=='0') {
                ev.preventDefault();
                valorFiltreClientsInactius.value = !valorFiltreClientsInactius.value;
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
            if (colOrder.value ===  ordenacionsClient[col]) {
                orderAsc.value = !orderAsc.value;
            } else {
                colOrder.value = ordenacionsClient[col];
                orderAsc.value = true;
            }
            performSearch();
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
            refVisible,
            clients,
            inputFiltreClients,
            valorFiltreClientsInactius,
            valorFiltre,
            hide,
            props,
            selectedClient,
            selectedIndex,
            colOrder, orderAsc, orderColumn, ordenacionsClient,
            getSeverityFlag,

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