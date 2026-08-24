<template>
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="comandes" class="p-datatable-sm-petita"
            v-model:selection="selectedComanda"
            selectionMode="single"
            dataKey="comanda"
            showGridlines
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()"
            @row-select="selectedIndex = $event.index;">
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
                </div>
            </template>
            <Column field="comanda" :header="$t('Comandes.Comanda')" :style="{width:'100px'}" style="max-width: 100px;"/>
            <Column :header="$t('Comandes.Tipus')" :style="{width:'50px'}" style="max-width: 50px; text-align: center;">
            <template #body="{data}">
                <div style="width: 100%; text-align: center;">  
                    <span v-if="data.tipus == 'PROGRAMA'" v-tooltip="$t('TipusArticleClient.ESPECIAL')">
                        <font-awesome-icon icon="fa-solid fa-gear" style="font-size: 1.10rem" />
                    </span>
                    <span v-else v-tooltip="$t('Comandes.NORMALITZAT')">
                        <font-awesome-icon icon="fa-solid fa-ring" style="font-size: 1.10rem" />
                    </span>
                </div>
            </template>
            </Column>
            <Column field="dataAlta" :header="$t('Comandes.Recepcio')" :style="{width:'110px'}" style="max-width: 110px;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataAlta), 'short') }}
                </template>
            </Column>
            <Column field="client" :header="$t('Comandes.Client')" :style="{width:'350px'}" style="max-width: 350px;">
                <template #body="{data}">
                    <span v-tooltip="data.nomClient">{{ `${data.codiClient} - ${data.nomClient}` }}</span>
                </template>
            </Column>
            <Column field="empresa" :header="$t('Comandes.Empresa')" :style="{width:'35px'}" style="max-width: 35px;">
                <template #body="{data}">
                    {{ `${data.empresa}` }}
                </template>
            </Column>
            <Column field="comandaClient" :header="$t('Comandes.Comanda client')" :style="{width:'130px'}"/>
            <Column field="programa" :header="$t('Comandes.Programa')" :style="{width:'130px'}"/>
            <Column field="servida" :header="$t('Comandes.Servida')" :style="{width:'100px'}" style="max-width: 100px;">
                <template #body="{data}">
                    <div style="width: 100%; text-align: center;">  
                        <Tag v-if="data.servida" style="background-color: #00939b" icon="pi pi-truck" :value="$t('Comandes.Servit')"></Tag>
                        <Tag v-else style="background-color: #f0bd3c" icon="pi pi-clock" :value="$t('Comandes.Pendent')"></Tag>
                    </div>
                </template>
            </Column>
            <Column :header="$t('Comandes.Servible comanda')" :style="{width:'125px'}" style="max-width: 125px;">
            <template #body="{data}">
                <div style="width: 100%; text-align: center;">  
                <ColumnaServible :reservable="data.servible"/>
                </div>
            </template>
            </Column>
            <Column :header="$t('Comandes.Adjunts')" :style="{ width: '65px' }" style="max-width: 65px;" bodyStyle="justify-content: center;">
            <template #body="{ data }">
                <a class="enllas" @click="selectedComanda = data; emit('mostrarAdjunts', data.comanda)">
                {{ data.numAdjunts }}
                </a>
            </template>
            </Column>
            <Column field="usuari" :header="$t('Comandes.Usuari')" :style="{width:'190px'}" style="max-width: 190px;"/>
        </DataTable>
    </div>
    <div v-if="comandes?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <span style="white-space: nowrap;">{{ $t('App.Resultats', [comandes.length]) }}</span>
        <transition name="slide-fade">
            <span v-if="comandes?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [comandes.length]) }}
            </span>
        </transition>
    </div>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import ColumnaServible from '@/components/comandes/ColumnaServible.vue';

export default {
    name : 'GridNormalitzats',
    components : {
        InfoTaulaBuida,
        ColumnaServible
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
    },
    setup(props, { emit }) {
        const comandes = ref();
        const selectedComanda = ref();
        const selectedIndex = ref(-1);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const elementTaula = () => document.getElementById(uniqueId.value);

        onMounted(() => {
            document.addEventListener("keydown", handler);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            selectedComanda.value = comandes.value[selectedIndex.value];
        });

        const performSearch = (comandesInput) => {
            comandes.value = comandesInput;
            selectedIndex.value = -1;
            home(elementTaula(), selectedIndex, comandes);
        };

        const updateAdjunts = (numAdjunts) => {
            selectedComanda.value.numAdjunts = numAdjunts;
        }

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Si no està el focus al grid
            if (!props.focused) return
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, comandes);
            // Controls
            if (ev.key === 'Enter' && selectedComanda.value) {
                actionHandler(ev, () => showDetall());
            }
        }

        const showDetall = () => {
            emit('showDetall', selectedComanda.value.comanda, selectedComanda.value.tipus === 'NORMALITZAT');
        }

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedComanda.value, quantitat, data, dataPrevistaSortida);
        }
        
        return {
            comandes,
            props,
            emit,
            uniqueId,
            selectedComanda,
            selectedIndex,
            callbackLinia,
            performSearch,
            updateAdjunts,
            showDetall
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

    .missatgeLimit {
      background-color: rgb(201, 227, 189);
      border: 1px solid rgb(52, 136, 68);
      border-radius: 10px;
      padding: 2px;
      display: inline-block;
      margin-left: 20px;
      width: 100%;
    }
   
    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: opacity 1s ease;
    }

    .slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-to es para la salida */ {
        opacity: 0;
    }
   
</style>