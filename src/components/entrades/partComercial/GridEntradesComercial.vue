<template>
<AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient" 
    @update:carregat="visibleAjudaArticleClientByClient = false" 
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
<AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle" 
      @update:carregat="visibleAjudaArticleClientByArticle = false" 
      @switch="switchAjuda"
      :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
<ModalModificarOf v-if="visibleModificarOf" :carregat="visibleModificarOf"  @update:carregat="visibleModificarOf = $event"
      :ofAntiga="registreSeleccionat.of" @ofModificada="onOfModificada" />
<EditorComentaris v-if="visibleModalContingutMissatge" :carregat="visibleModalContingutMissatge" @update:carregat="visibleModalContingutMissatge = $event;"
    :text="contSelectedEntrada" :potEditar="false"/>
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="entrades" class="p-datatable-sm-petita"
            v-model:selection="selectedEntrada"
            selectionMode="single"
            dataKey="id"
            contextMenu
            showGridlines
            :scrollable="true" scrollDirection="both" scrollHeight="50vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @rowContextmenu="contextMenu.show($event.originalEvent)"
            @row-select="selectedIndex = $event.index;">
            <!-- @dblclick="window?.getSelection()?.removeAllRanges(); showDetall()" -->
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('AjudaArticlesNormalitzats.EmptyArticles')" />
                </div>
            </template>
            <Column v-if="permisosStore.tePermis('ENTRADES', 'REPROCESSAR')" :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="id_entrada_fabrica" :header="$t('EntradesComercial.Id entrada')" :style="{width:'100px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.idEntradaFabrica}` }}
              </template>
            </Column>
            <Column field="article" :header="$t('EntradesComercial.Article')" :style="{width:'60px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.article}` }}
              </template>
            </Column>
            <Column field="client" :header="$t('EntradesComercial.Client')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.client}` }}
              </template>
            </Column>
            <Column field="magatzem" :header="$t('EntradesComercial.Magatzem')" :style="{width:'70px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.magatzem}` }}
              </template>
            </Column>
            <Column field="fabrica" :header="$t('Entrades.Fabrica')" :style="{width:'50px'}" style="max-width: 25%;">
              <template #body="{data}">
                {{ `${data.fabrica}` }}
              </template>
            </Column>
            <Column field="quantitat" :header="$t('Entrades.Quantitat')" :style="{width:'60px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.quantitat) }}
              </template>
            </Column>
            <Column field="quantitat_caixa" :header="$t('Entrades.Quantitat caixa')" :style="{width:'130px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.quantitatCaixa) }}
              </template>
            </Column>
            <Column field="of" :header="$t('Entrades.of')" :style="{width:'110px'}" style="max-width: 25%; justify-content: end;">
              <template #body="{data}">
                {{ $n(data.of) }}
              </template>
            </Column>
            <Column field="pes_premsat" :header="$t('Entrades.Pes premsat')" :style="{width:'85px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.pesPremsat) }}
                </template>
            </Column>
            <Column field="pes_final" :header="$t('Entrades.Pes final')" :style="{width:'60px'}" style="max-width: 25%; justify-content: end;">
                <template #body="{data}">
                    {{ $n(data.pesFinal) }}
                </template>
            </Column>
            <Column field="data_alta" :header="$t('Entrades.Data registre')" :style="{width:'120px'}" style="max-width: 25%;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataAlta), 'long') }}
                </template>
            </Column>
            <Column field="data_processat" :header="$t('Entrades.Data processament')" :style="{width:'160px'}" style="max-width: 25%;">
                <template #body="{data}">
                  <span v-if="data.dataProcessat">
                    {{ $d($toDate(data.dataProcessat), 'long') }}
                  </span>
                </template>
            </Column>
            <Column field="error" :header="$t('EntradesComercial.Error')" :style="{width:'250px'}" style="max-width: 25%;">
                <template #body="{data}">
                    <span v-if="data.msgError">
                        {{ mostrarErrorEntrada(data.msgError) }}
                    </span>
                </template>
            </Column>
        </DataTable>
    </div>
    <div v-if="entrades?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <span style="white-space: nowrap;">{{ $t('App.Resultats', [entrades.length]) }}</span>
        <transition name="slide-fade">
            <span v-if="entrades?.length >= 100" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [entrades.length]) }}
            </span>
        </transition>
    </div>
</div>
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import entradesService from "@/services/entrades.service.js";
import { carrega } from '@/services/loader';
import { home, controlDataTable } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import { useI18n } from 'vue-i18n';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import Swal from 'sweetalert2';
import ModalModificarOf from './ModalModificarOf.vue';
import { usePermisosStore } from '@/stores/permisos';
import { useToast } from 'primevue/usetoast';
import { ExcelExporter } from '@/utils/ExcelExporter';

export default {
    name : 'GridEntradesComercial',
    components : {
        InfoTaulaBuida,
        EditorComentaris,
        AjudaArticleClientByClient,
        AjudaArticleClientByArticle,
        ModalModificarOf,
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
        gridEntrades : Object,
        buscar: Function,
    },
    setup(props, { emit }) {
        const permisosStore = usePermisosStore();
        const { t } = useI18n();
        const toast = useToast();
        const entrades = ref();
        const selectedEntrada = ref();
        const contSelectedEntrada = ref();
        const contextMenu = ref();
        const registreSeleccionat = ref();
        const selectedIndex = ref(-1);
        const visibleModalContingutMissatge = ref(false);
        const visibleAjudaArticleClientByClient = ref(false);
        const visibleAjudaArticleClientByArticle = ref(false);
        const ultimaAjudaVisibleByClient = ref();
        const visibleModificarOf = ref(false);

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
            selectedEntrada.value = entrades.value[selectedIndex.value];
        });

        const performSearch = (comandesInput) => {
            entrades.value = comandesInput;
            if (registreSeleccionat.value) {
                selectedEntrada.value = registreSeleccionat.value
            } else {
                selectedIndex.value = -1;
            }
            home(elementTaula(), selectedIndex, entrades);
        };

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (props.modalParentObert) return;
            // Si no està el focus al grid
            if (!props.focused) return
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, entrades);

        }

        const showDetall = async () => {
            contSelectedEntrada.value = await carrega(entradesService.carregaContingutMissatge(selectedEntrada.value.id));
            nextTick(() => {
                visibleModalContingutMissatge.value = true;
            })
        }

        const mostrarErrorEntrada = (msg) => {
            switch (msg) {
                case 'ARTICLE_CLIENT_NO_EXISTEIX':
                    return t("Entrades.article o el client no existeix")

                case 'ARTICLE_CLIENT_NO_ACTIU':
                    return t("Entrades.article o el client no actiu")

                case 'CAP_OF':
                    return t("Entrades.no of assignada")
            
                default:
                    return t("Entrades.Error desconegut")
            }
        }

        // const actionHandler = (ev, action) => {
        //     ev.preventDefault();
        //     action();
        // }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedEntrada.value, quantitat, data, dataPrevistaSortida);
        }

        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('EntradesComercial.torna a processar')}`, class: 'p-button-text', icon: 'pi pi-sync', command: () => reprocessarEntrada(registreSeleccionat.value.id) });
            result.push({ label: () => `${t('EntradesComercial.article-client reprocessar')}`, class: 'p-button-text', icon: 'pi pi-sync', command: () => canviArticleClient(registreSeleccionat.value.id) });
            result.push({ label: () => `${t('EntradesComercial.Canviar of')}`, class: 'p-button-text', icon: 'pi pi-sync', command: () => canviOf() });
            return result;
        });

        const reprocessarEntrada = async (id) => {
            await carrega(entradesService.reprocessarEntradaComercial(id));
            emit('recarrega');
        }

        const callbackAjudaArticleClientByClient = async (artCli) => {
            const id = registreSeleccionat.value.id
            const cliCod = artCli.cliCod;
            const artCod = artCli.articleClient.replace(cliCod, '');
            let request = {
                client: cliCod,
                article: artCod
            }
            const error = await carrega(entradesService.canviArticleClient(id, request));

            visibleAjudaArticleClientByClient.value = false;
            visibleAjudaArticleClientByArticle.value = false;
            
            if (error) {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'warning',
                    title: t('App.Atencio'),
                    text: mostrarErrorEntrada(error)
                });
            } else {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'success',
                    title: t('App.Processat'),
                    text: t('EntradesComercial.processat correctament')
                });

                emit('recarrega');
            }
        }

        const canviArticleClient = () => {
            ultimaAjudaVisibleByClient.value = localStorage.getItem('ComandesEspUltimaAjudaVisibleClient') === null
                ? true
                : JSON.parse(localStorage.getItem('ComandesEspUltimaAjudaVisibleClient'));
            ultimaAjudaVisibleByClient.value
                ? visibleAjudaArticleClientByClient.value = true
                : visibleAjudaArticleClientByArticle.value = true
        }

        const switchAjuda = () => {
            if (visibleAjudaArticleClientByClient.value) {
                visibleAjudaArticleClientByClient.value = false; 
                visibleAjudaArticleClientByArticle.value = true; 
                ultimaAjudaVisibleByClient.value = false;
            } else {
                visibleAjudaArticleClientByArticle.value = false; 
                visibleAjudaArticleClientByClient.value = true; 
                ultimaAjudaVisibleByClient.value = true;
            }
            localStorage.setItem('ComandesEspUltimaAjudaVisibleClient', ultimaAjudaVisibleByClient.value);
        }

        const canviOf = () => {
            visibleModificarOf.value = true;
        }

        const onOfModificada = async (novaOf) => {
            const id = registreSeleccionat.value.id
            let request = {
                of: novaOf
            }
            visibleModificarOf.value = false
            const error = await carrega(entradesService.canviOf(id, request));

            
            if (error) {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'warning',
                    title: t('App.Atencio'),
                    text: mostrarErrorEntrada(error)
                });
            } else {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'success',
                    title: t('App.Processat'),
                    text: t('EntradesComercial.processat correctament')
                });

                emit('recarrega');
            }
        }

        const exportarTaula = () =>{
            if (entrades.value === null || entrades.value.length === 0) {
                toast.add({severity:'warn', summary: t('Entrades.error exportar taula buida'), life: 5000});
            } else {
                const configuracioExcel = {
                dades: entrades.value,
                columnes: [
                    { titol: t('EntradesComercial.Id entrada'), valor: entrada => entrada.idEntradaFabrica ?? '', width: 15 },
                    { titol: t('EntradesComercial.Article'), valor: entrada => entrada.article ?? '', width: 15 },
                    { titol: t('EntradesComercial.Client'), valor: entrada => entrada.client ?? '', width: 15 },
                    { titol: t('EntradesComercial.Magatzem'), valor: entrada => entrada.magatzem ?? '', width: 15 },
                    { titol: t('Entrades.Fabrica'), valor: entrada => entrada.fabrica ?? '', width: 15 },
                    { titol: t('Entrades.Quantitat'), valor: entrada => entrada.quantitat ?? '', width: 20 },
                    { titol: t('Entrades.Quantitat caixa'), valor: entrada => entrada.quantitatCaixa ?? '', width: 20 },
                    { titol: t('Entrades.of'), valor: entrada => entrada.of ?? '', width: 15 },
                    { titol: t('Entrades.Pes premsat'), valor: entrada => entrada.pesPremsat ?? '', width: 15 },
                    { titol: t('Entrades.Pes final'), valor: entrada => entrada.pesFinal ?? '', width: 15 },
                    { titol: t('Entrades.Data registre'), valor: entrada => entrada.dataAlta ?? '', width: 20 },
                    { titol: t('Entrades.Data processament'), valor: entrada => entrada.dataProcessat ?? '', width: 20 },
                    { titol: t('EntradesComercial.Error'), valor: entrada => entrada.msgError ?? '', width: 15 },
                ]
                };

                ExcelExporter.export({
                filename:  t('Entrades.entrades Comercial arxiu') + '.xlsx',
                configuracioExcel
                });
            }
        };
        
        return {
            permisosStore,
            entrades,
            props,
            emit,
            uniqueId,
            selectedEntrada,
            selectedIndex,
            callbackLinia,
            performSearch,
            showDetall,
            visibleModalContingutMissatge,
            contSelectedEntrada,
            mostrarErrorEntrada,
            menuModel,
            contextMenu,
            registreSeleccionat,
            visibleAjudaArticleClientByClient,
            visibleAjudaArticleClientByArticle,
            callbackAjudaArticleClientByClient,
            switchAjuda,
            visibleModificarOf,
            onOfModificada,
            exportarTaula
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