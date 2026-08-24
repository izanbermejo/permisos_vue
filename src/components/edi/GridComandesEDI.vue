<template>
<AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient" 
    @update:carregat="visibleAjudaArticleClientByClient = false" 
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
<AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle" 
    @update:carregat="visibleAjudaArticleClientByArticle = false" 
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
<EditorComentaris v-if="visibleModalContingutTXT" :carregat="visibleModalContingutTXT" @update:carregat="visibleModalContingutTXT = $event;"
    :text="contingutTXT" :potEditar="false"/>
<AjudaComandesEDIByClient v-if="visibleModalComandesClient" :carregat="visibleModalComandesClient" @update:carregat="visibleModalComandesClient = $event;" :codiClient="selectedLinia.codiClient" :nomClient="selectedLinia.client" :responsable="selectedLinia.responsable" />
<AjudaComandesEDIByArticleClient v-if="visibleModalComandesArticleClient" :carregat="visibleModalComandesArticleClient" @update:carregat="visibleModalComandesArticleClient = $event;" :artCli="selectedLinia.articleClient"/>
<AjudaComandesEDIByMissatge v-if="visibleModalComandesMissatge" :carregat="visibleModalComandesMissatge" @update:carregat="visibleModalComandesMissatge = $event;"  :codiMissatge="selectedLinia.idMissatge" />
<ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
<ProcessarComandaEdi v-if="visibleProcessarComandaEdi && selectedLinia" :carregat="visibleProcessarComandaEdi" @update:carregat="visibleProcessarComandaEdi = $event"
    :codiMissatge="selectedLinia.idMissatge" :artCliSeleccionat="selectedLinia.articleClient" :estrategia="selectedLinia.estrategia" @comandaProcessada="isComandaProcessada = $event"/>
<div>
    <div :id="uniqueId" style="border: 0.25px solid #dbdbdb;">
        <DataTable :value="liniesEDI" class="p-datatable-sm-petita"
            v-model:selection="selectedLinia"
            selectionMode="single"
            dataKey="clauComanda"
            showGridlines
            contextMenu
            :scrollable="true" scrollDirection="both" scrollHeight="70vh"
            :resizableColumns="true" columnResizeMode="expand"
            :rowClass="() => 'estilRow'"
            @rowContextmenu="showContextMenu($event)"
            @dblclick="window?.getSelection()?.removeAllRanges(); mostraProcessarComandaEdiDblClick()"
            @row-select="selectedIndex = $event.index;">
            <template #empty>
                <div style="width:100%; height: 35vh; text-align: center; padding-top: 30px;">
                    <InfoTaulaBuida :icon="'fa-solid fa-face-frown-open'" :literal="$t('ComandesEDI.EmptyEDI')" />
                </div>
            </template>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-content: center;">
                  <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="registreSeleccionat = data; contextMenu.show($event)" />
                </div>
              </template>
            </Column>
            <Column field="tipus" :header="$t('ComandesEDI.taula_comandesEDI.tipus')" :style="{width:'100%'}" style="max-width: 5%;">
              <template #body="{data}">
                {{ `${data.tipus}` }}
              </template>
            </Column>
            <Column field="estrategia" :header="$t('ComandesEDI.Estrategia')" :style="{width:'100%'}" style="max-width: 6%;">
              <template #body="{data}">
                <span v-if="data.client && data.tipus">
                    {{ $n(data.estrategia) }}
                </span>
                <span v-else>-</span>
              </template>
            </Column>
            <Column field="dataArribada" sortable :header="$t('ComandesEDI.taula_comandesEDI.data')" :style="{width:'100%'}" style="max-width: 9%;">
                <template #body="{data}">
                    {{ $d($toDate(data.dataArribada), 'long') }}
                </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 100%; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.error" style="width: 100%; height: 100%; border: none; align-items: center; display: flex; justify-content: center;"
                        v-tooltip="errors[data.error]">
                        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.10rem" color="orange" />
                    </span>
                </div>
              </template>
            </Column>
            <Column field="responsable" :header="$t('ComandesEDI.taula_comandesEDI.usuari')" :style="{width:'100%'}" style="max-width: 10%;">
                <template #body="{data}">
                    <span v-if="data.responsable">
                        {{ `${data.responsable}` }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column field="client" sortable sortField="client" :header="$t('Comandes.Client')" :style="{width:'100%'}" style="max-width: 34%;">
                <template #body="{data}">
                    <div v-if="data.client" class="ellipsis" v-tooltip="data.nad02">
                        <a class="enllas " @click.stop="mostraProcessarComandaEdi(data)">
                            {{ `${data.codiClient} - ${data.client}` }}
                        </a>
                    </div>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column field="articleClient" :header="$t('Comandes.Articleclient')" :style="{width:'100%'}" style="max-width: 10%;">
                <template #body="{data}">
                    <span v-if="data.articleClient">
                        <a class="enllas text-overflow-ellipsis" @click.stop="mostrarComandesByArticleClient(data)">
                            {{ data.articleClient }}
                        </a>
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column field="numeroDocument" :header="$t('ComandesEDI.taula_comandesEDI.missatge')" :style="{width:'100%'}" style="max-width: 8%;">
                <template #body="{data}">
                    <a class="enllas text-overflow-ellipsis" @click.stop="mostrarComandesByMissatge(data)">
                        {{ data.numeroDocument }}
                    </a>
                </template>
            </Column>
            <Column field="referenciaClient" :header="$t('ComandesEDI.taula_comandesEDI.article')" >
                <template #body="{data}">
                    <span v-if="data.referenciaClient">
                        {{ `${data.referenciaClient}` }}
                    </span>
                    <span v-else>-</span>
                </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.tePdf" 
                        v-tooltip="$t('ComandesEDI.mostrar pdf')"
                        @click="selectedLinia = data, descarregarPDF()">
                        <font-awesome-icon icon="fa-solid fa-file-pdf" style="font-size: 1.10rem"/>
                    </span>
                </div>
              </template>
            </Column>
            <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
              <template #body="{ data }">
                <div style="width: 100%; height: 35px; align-items: center; display: flex; justify-content: center;">
                    <span v-if="data.tePdf" 
                        v-tooltip="$t('ComandesEDI.mostrar pdf AMES')"
                        @click="selectedLinia = data, clickDescarregaFormatPdf()">
                        <font-awesome-icon icon="fa-solid fa-file-pdf" style="font-size: 1.10rem"/>
                    </span>
                </div>
              </template>
            </Column>
        </DataTable>
    </div>
    <div v-if="liniesEDI?.length" style="margin-top: 10px; display: flex; align-items: center; width: 100%;">
        <span style="white-space: nowrap;">{{ $t('App.Resultats', [liniesEDI.length]) }}</span>
        <transition name="slide-fade">
            <span v-if="liniesEDI?.length >= 150" class="missatgeLimit" style="display: inline-flex; align-items: center; justify-content: center; flex-grow: 1;">
                <font-awesome-icon icon="fa-solid fa-info" style="margin-right: 5px;" />
                {{ $t('App.Nomes es mostren els primers resultats', [liniesEDI.length]) }}
            </span>
        </transition>
    </div>
</div>
<input ref="fileInput" type="file" @change="handleFileChange" style="display: none;" />
</template>

<script>
import InfoTaulaBuida from '@/components/InfoTaulaBuida.vue';
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { home, controlDataTable, scrollCenter } from '@/utils/datetableUtils.js';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import AjudaComandesEDIByClient from '@/views/modals/AjudaComandesEDIByClient.vue';
import AjudaComandesEDIByArticleClient from '@/views/modals/AjudaComandesEDIByArticleClient.vue';
import AjudaComandesEDIByMissatge from '@/views/modals/AjudaComandesEDIByMissatge.vue';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import ProcessarComandaEdi from '@/views/modals/ProcessarComandaEdi.vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { carrega } from '@/services/loader';
import ediService from '@/services/edi.service';
import Swal from 'sweetalert2';
import { usePermisosStore } from '@/stores/permisos';
import { saveAs } from 'file-saver';

export default {
    name : 'GridComandesEDI',
    components : {
        InfoTaulaBuida,
        EditorComentaris,
        AjudaComandesEDIByClient,
        AjudaComandesEDIByArticleClient,
        AjudaComandesEDIByMissatge,
        AjudaArticleClientByClient,
        AjudaArticleClientByArticle,
        ProcessarComandaEdi
    },
    props : {
        modalParentObert : Boolean,
        focused : Boolean,
        gridEntrades : Object
    },
    setup(props, { emit }) {
        const { t } = useI18n();
        const permisosStore = usePermisosStore();
        const toast = useToast();
        const liniesEDI = ref();
        const registreSeleccionat = ref();
        const selectedLinia = ref();
        //const usuariAntic = permisosStore.teUsuariAntic();
        const contingutTXT = ref();
        const contextMenu = ref();
        const selectedIndex = ref(-1);
        const visibleModalContingutTXT = ref(false);
        const visibleModalComandesClient = ref(false);
        const visibleModalComandesArticleClient = ref(false);
        const visibleModalComandesMissatge = ref(false);
        const visibleAjudaArticleClientByClient = ref(false);
        const visibleAjudaArticleClientByArticle = ref(false);
        const visibleProcessarComandaEdi = ref(false);
        const ultimaAjudaVisibleByClient = ref();
        const fileInput = ref();
        const isComandaProcessada = ref(false);
        const nextSelectedKey = ref(null);

        const uniqueId = computed(() => {
            const randomPart = Math.random().toString(36).substr(2, 9);
            const timeStamp = Date.now();
            return `grid-${randomPart}-${timeStamp}`;
        });

        const elementTaula = () => document.getElementById(uniqueId.value);

        const errors = {
            'CONFIGURACIOEDI_NO_TROBADA': t('ComandesEDI.CONFIGURACIOEDI_NO_TROBADA'),
            'ARTICLE_NO_TROBAT': t('ComandesEDI.ARTICLE_NO_TROBAT'),
            'VARIS_ARTICLES_TROBATS': t('ComandesEDI.VARIS_ARTICLES_TROBATS'),
        }

        onMounted(() => {
            document.addEventListener("keydown", handler);
        });

        onUnmounted(() => {
            document.removeEventListener("keydown", handler);
        });

        watch(selectedIndex, () => {
            selectedLinia.value = liniesEDI.value[selectedIndex.value];
        });

        watch(registreSeleccionat, () => {
            selectedLinia.value = registreSeleccionat.value;
        });

        watch(isComandaProcessada, async (newValue) => {
            if (newValue) {
                isComandaProcessada.value = false;
                const currentIndex = selectedIndex.value;
                const nextRow = liniesEDI.value?.[currentIndex + 1] || liniesEDI.value?.[currentIndex - 1] || null;
                const targetIndex = nextRow
                    ? (currentIndex < liniesEDI.value.length - 1 ? currentIndex : currentIndex - 1)
                    : -1;

                nextSelectedKey.value = nextRow?.clauComanda ?? null;
                selectedIndex.value = targetIndex;
                selectedLinia.value = nextRow;
                scrollCenter(elementTaula(), selectedIndex);
                visibleProcessarComandaEdi.value = false;
                emit('update:carrega', true);
                await nextTick();
                if (nextRow) {
                    mostraProcessarComandaEdi(nextRow);
                }
            }
        });

        const performSearch = (linies) => {
            const clauSeleccionada = nextSelectedKey.value || selectedLinia.value?.clauComanda;
            liniesEDI.value = linies;
            home(elementTaula(), selectedIndex, liniesEDI);

            if (clauSeleccionada) {
                const index = linies.findIndex(l => l.clauComanda === clauSeleccionada);
                if (index !== -1) {
                    selectedIndex.value = index;
                    selectedLinia.value = linies[index];
                } else {
                    // Ja no existeix → si el modal està obert no resetejem
                    if (!visibleProcessarComandaEdi.value) {
                        selectedIndex.value = -1;
                        selectedLinia.value = null;
                    }
                }
            }

            nextSelectedKey.value = null;
            scrollCenter(elementTaula(), selectedIndex);
        };

        const modalVisible = computed(() => {
            return visibleModalContingutTXT.value
            || visibleModalComandesClient.value
            || visibleModalComandesArticleClient.value
            || visibleModalComandesMissatge.value
            || props.modalParentObert
            || visibleAjudaArticleClientByClient.value
            || visibleAjudaArticleClientByArticle.value
            || visibleProcessarComandaEdi.value;
        });

        const handler = (ev) => {
            // No processem l'event en cas que es produeixi des d'un ContextMenu
            if (isContextMenuKey(ev))  return;
            // Si no hi ha cap modal obert
            if (modalVisible.value) return;
            // Si no està el focus al grid
            if (!props.focused) return
            // Controls de la taula
            controlDataTable(ev, elementTaula(), selectedIndex, liniesEDI);
            // Controls
            if (ev.key === 'Enter' && selectedLinia.value) {
                actionHandler(ev, () => mostraProcessarComandaEdi(selectedLinia.value));
            }
        }

        const mostrarContingutTXT = async () => {
            let response = await(carrega(ediService.obtenirContingutTXT(selectedLinia.value.idMissatge)));
            contingutTXT.value = response[0]?.contingut || '';
            nextTick(() => {
                visibleModalContingutTXT.value = true;
            })
        }

        const descarregarPDF = async () => {
            let params = new URLSearchParams();
            params.append('pathPDF', selectedLinia.value.pathPDF ? selectedLinia.value.pathPDF : '');

            let response = await(carrega(ediService.descarregaPDF(selectedLinia.value.idMissatge, params)));
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        }

        const clickDescarregaFormatPdf = async () => {
            let resp = await (carrega(ediService.descarregaFormatPdfAmesEdi2(selectedLinia.value.idMissatge)));
            saveAs(new Blob([resp]), selectedLinia.value.numeroDocument + '.pdf');
        }
        
        const openFileInput = () => {
            if (selectedLinia.value?.tePdf) {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'warning',
                    title: t('App.Atencio'),
                    text: t('ComandesEDI.avis ja te pdf'),
                    showDenyButton: true,
                    reverseButtons: true,
                    confirmButtonText: t('App.Si'),
                    denyButtonText: t('App.No')
                }).then((result) => {
                    if (result.isConfirmed) {
                        fileInput.value.click();
                    }
                });
            } else {
                fileInput.value.click();
            }
        }

        const handleFileChange = async (event) => {
            const files = event.target.files;
            await carrega(ediService.pujarPDF(selectedLinia.value.idMissatge, files[0]));
            emit('update:carrega', true);
        }

        const reprocessarComanda = async () => {
            let error = await carrega(ediService.reprocessarComandaEdi(selectedLinia.value.idMissatge, selectedLinia.value.idComanda));

            if (error) {
                toast.add({severity:'error', summary: errors[error], life: 3000});
            } else {
                toast.add({severity:'success', summary: t('ComandesEDI.comanda lligada correctament'), life: 3000});
            }
            emit('update:carrega', true);
        }


        const mostrarComandesByClient = async (data) => {
            document.activeElement.blur();
            selectedLinia.value = data;
            nextTick(() => {
                visibleModalComandesClient.value = true;
                elementTaula()?.blur();
            })
        }

        const mostrarComandesByArticleClient = async (data) => {
            selectedLinia.value = data;
            nextTick(() => {
                visibleModalComandesArticleClient.value = true;
            })
        }

        const mostrarComandesByMissatge = async (data) => {
            selectedLinia.value = data;
            nextTick(() => {
                visibleModalComandesMissatge.value = true;
            })
        }

        const mostraProcessarComandaEdi = async (data) => {
            /* if (selectedLinia.value.responsable === usuariAntic) {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'warning',
                    title: t('App.Atencio'),
                    text: t('ComandesEDI.Responsable equivocat')
                });
            } */
            const index = liniesEDI.value.findIndex(l => l.clauComanda === data.clauComanda);
            if (index !== -1) {
                selectedIndex.value = index;
            }
            selectedLinia.value = data;
            nextTick(() => {
                visibleProcessarComandaEdi.value = true;
            })
        }

         const mostraProcessarComandaEdiDblClick = async () => {
            /* if (selectedLinia.value.responsable === usuariAntic) {
                Swal.fire({
                    allowOutsideClick : false,
                    didOpen: () => Swal.getConfirmButton().focus(),
                    icon: 'warning',
                    title: t('App.Atencio'),
                    text: t('ComandesEDI.Responsable equivocat')
                });
            } */
            nextTick(() => {
                visibleProcessarComandaEdi.value = true;
            })
        }

        const callbackAjudaArticleClientByClient = async (artCli) => {
            let request = {
                idMissatge: selectedLinia.value.idMissatge,
                idComanda: selectedLinia.value.idComanda,
                artInt: artCli.artInt,
                cliCod: artCli.cliCod,
            }

            let error = await carrega(ediService.canviArticleClient(request));

            if (error) {
                toast.add({severity:'error', summary: errors[error], life: 3000});
            } else {
                toast.add({severity:'success', summary: t('ComandesEDI.artcli canviat correctament'), life: 3000});
            }
            emit('update:carrega', true);

            visibleAjudaArticleClientByClient.value = false;
            visibleAjudaArticleClientByArticle.value = false;
            
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

        const actionHandler = (ev, action) => {
            ev.preventDefault();
            action();
        }

        const callbackLinia = (quantitat, data, dataPrevistaSortida) => {
            props.seleccioCallback(selectedLinia.value, quantitat, data, dataPrevistaSortida);
        }

        const esborrarLiniaEDI = () => {
            ediService.esborrarLiniaEDI(selectedLinia.value.idMissatge, selectedLinia.value.idComanda)
                .then(() => {
                    toast.add({severity:'success', summary: t('ComandesEDI.linia esborrada correctament'), life: 3000});
                    emit('update:carrega', true);
                })
                .catch(() => {
                    toast.add({severity:'error', summary: t('ComandesEDI.error esborrant linia'), life: 3000});
                });
        }
        
        const menuModel = computed(() => {
            let result = [];
            result.push({ label: () => `${t('ComandesEDI.Processar comanda')}`, class: 'p-button-text', icon: 'pi pi-cog', command: () => mostraProcessarComandaEdi(selectedLinia.value) });
            result.push({ label: () => `${t('ComandesEDI.mostra contingut txt')}`, class: 'p-button-text', icon: 'pi pi-file', command: () => [selectedLinia.value = registreSeleccionat.value, mostrarContingutTXT()] });
            result.push({ label: () => `${t('ComandesEDI.mostrar pdf')}`, class: 'p-button-text', icon: 'pi pi-file-pdf', command: () => [selectedLinia.value = registreSeleccionat.value, descarregarPDF()] });
            result.push({ label: () => `${t('ComandesEDI.pujar pdf')}`, class: 'p-button-text', icon: 'pi pi-file-import', command: () => [selectedLinia.value = registreSeleccionat.value, openFileInput()] });
            result.push({ label: () => `${t('ComandesEDI.menuregistre.esborrar')}`, class: 'p-button-text', icon: 'pi pi-trash', command: () => [selectedLinia.value = registreSeleccionat.value, esborrarLiniaEDI()] });
            if (registreSeleccionat.value?.error)
                result.push({ label: () => `${t('ComandesEDI.intentar lligar comanda')}`, class: 'p-button-text', icon: 'pi pi-refresh', command: () => [selectedLinia.value = registreSeleccionat.value, reprocessarComanda()] });
            if (permisosStore.tePermis('COMANDES_EDI', 'CANVIAR_ARTICLE_CLIENT'))
                result.push({ label: () => `${t('ComandesEDI.canviar article client')}`, class: 'p-button-text', icon: 'pi pi-pencil', command: () => canviArticleClient() });
            return result;
        });

        const showContextMenu = (ev) => {
            registreSeleccionat.value = ev.data;
            const newIndex = liniesEDI.value.findIndex(l => l.clauComanda == ev.data.clauComanda);
            if (newIndex !== selectedIndex.value) {
                selectedIndex.value = newIndex;
            } else {
                selectedLinia.value = liniesEDI.value[newIndex];
            }
            contextMenu.value.show(ev.originalEvent);
        }
        
        return {
            liniesEDI,
            props,
            emit,
            uniqueId,
            registreSeleccionat,
            selectedLinia,
            selectedIndex,
            callbackLinia,
            performSearch,
            mostrarContingutTXT,
            descarregarPDF,
            visibleModalContingutTXT,
            visibleModalComandesClient,
            visibleModalComandesArticleClient,
            visibleModalComandesMissatge,
            visibleAjudaArticleClientByClient,
            visibleAjudaArticleClientByArticle,
            visibleProcessarComandaEdi,
            contingutTXT,
            menuModel,
            contextMenu,
            mostrarComandesByClient,
            mostrarComandesByArticleClient,
            mostrarComandesByMissatge,
            showContextMenu,
            handleFileChange,
            callbackAjudaArticleClientByClient,
            switchAjuda,
            fileInput,
            errors,
            isComandaProcessada,
            mostraProcessarComandaEdi,
            mostraProcessarComandaEdiDblClick,
            clickDescarregaFormatPdf
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

    .ellipsis {
        white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
        overflow: hidden;         /* Oculta el texto que no cabe */
        text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
        width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
    }
   
</style>