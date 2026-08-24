<template>
  <ModalRenombrarAdjunt v-if="visibleModalRenombrar" :carregat="visibleModalRenombrar" @update:carregat="visibleModalRenombrar = $event;"
    :nomFitxer="fitxer.nomFitxer" :callback="renombrarAdjunt"/>
  <Dialog v-model:visible="visible" :header="`${$t('ModalAdjuntsClient.Titol')} ${props.nomClient} (${props.client})`" @hide="hide()" modal
    :closable="true" style="width: 1000px;" @drop="props.potEditar ? dropHandler : noPermisos()" @dragover="dragOverHandler"
    :closeOnEscape="false">
    <div class="filtre" ref="formWrapper">
      <div class="element-filtre">
        <label>{{ $t('ModalAdjuntsClient.nom fitxer') }}</label>
        <InputText ref="inputFiltre" v-model="filtreNomFitxer" style="width: 220px;" />
      </div>
    </div>
    <div class="tabs-container">
      <section class="tabs">
        <div class="tab"
            :class="{ selected: pestanyaSeleccionada === categories[0].clau }"
            @click="pestanyaSeleccionada = categories[0].clau;">
          {{ categories[0].valor }}
        </div>
        <div class="right-tabs">
          <div class="tab"
              :class="{ selected: pestanyaSeleccionada === categories[1].clau }"
              @click="pestanyaSeleccionada = categories[1].clau;">
            {{ categories[1].valor }}
          </div>
          <div class="tab"
              :class="{ selected: pestanyaSeleccionada === categories[2].clau }"
              @click="pestanyaSeleccionada = categories[2].clau;">
            {{ categories[2].valor }}
          </div>
        </div>
      </section>
      <div class="tab-content">
        <DataTable :value="adjunts" class="p-datatable-sm" 
              contextMenu v-model:contextMenuSelection="fitxer" @rowContextmenu="contextMenu.show($event.originalEvent)"
              v-model:selection="fitxer" selectionMode="single"
              :scrollable="true" scrollDirection="both" scrollHeight="200px"
              :resizableColumns="true" columnResizeMode="expand"
              stripedRows showGridlines
              @dblclick="clickOpcioDescarregar()"
              :rowClass="estilRow"
              sortField="data" :sortOrder="-1"
              style="max-height: 500px; min-height: 200px;"> 
          <template #empty>
            <div style="width:100%; height: 160px; text-align: center; padding-top: 30px;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('ModalAdjuntsComandes.Cap adjunt')" />
            </div>
          </template>
          <Column :style="{width:'35px'}" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{data}">
              <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="fitxer = data; contextMenu.show($event)" />
              </div>
            </template>
          </Column>
          <Column :header="$t('ModalAdjuntsComandes.Fitxer')" :style="{width:'350px'}" >
            <template #body="{data}">
              <div class="ellipsis">
                {{ data.nomFitxer }}
              </div>
            </template>
          </Column>
          <Column v-if="pestanyaSeleccionada === 0" :header="$t('ModalAdjuntsClient.Categoria')" :style="{width:'140px'}" >
            <template #body="{data}">
              {{ categories.find(c => c.clau === data.categoria)?.valor || data.categoria }}
            </template>
          </Column>
          <Column :header="$t('ModalAdjuntsComandes.Data')" :style="{width:'140px'}"  >
            <template #body="{data}">
              {{ $d(data.data, 'long') }}
            </template>
          </Column>
          <Column :header="$t('ModalAdjuntsComandes.Usuari')" :style="{width:'230px'}" >
            <template #body="{data}">
              {{ data.usuari }}
            </template>
          </Column>
        </DataTable>
        <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;">
          <template #item="{ item }">
            <div @click="item.action" style="cursor: pointer;">
              <Button :icon="item.icon" :label="item.label()" :class="item.class" v-if="!item?.hide?.()" />
            </div>
          </template>
        </ContextMenu>
      </div>
    </div>
    <div v-if="pestanyaSeleccionada !== 0" class="file-drop-area">
      <i class="pi pi-cloud-upload" style="font-size: 1.75rem"></i>
      <span class="file-msg">{{ $t('ModalAdjuntsComandes.Instruccions pujar') }}</span>
      <input class="file-input" type="file" @change="pujarFitxersDialeg" ref="fitxersSeleccionats" multiple>
    </div>
  </Dialog>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalRenombrarAdjunt from '@/views/modals/ModalRenombrarAdjunt.vue';
import { onUnmounted } from 'vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils';
import Swal from 'sweetalert2';
import ClientsService from '@/services/clients.service';
import debounce from 'debounce';
import { carrega } from '@/services/loader';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { saveAs } from 'file-saver';
import { nextTick } from 'vue';

export default {
  name : 'ModalAlumnesInscrits',
  components : {
    ModalRenombrarAdjunt,
  },
  props: {
    carregat: Boolean,
    client: String,
    nomClient: String,
  },
  emits: ['update:carregat', 'update:numAdjunts'],
  setup(props, { emit }) {
    const visible = ref(true);
    const { t } = useI18n();
    const toast = useToast();
    const confirm = useConfirm();
    const adjunts = ref();
    const fitxer = ref();
    const contextMenu = ref();
    const visibleModalRenombrar = ref(false);
    const filtreNomFitxer = ref('');
    const pestanyaSeleccionada = ref(0);
    const fitxersSeleccionats = ref();
    const inputFiltre = ref();

    const categories = ref([
      { clau: 0, valor: t('App.Tots') },
      { clau: 1, valor: t('ModalAdjuntsClient.Comandes') },
      { clau: 2, valor: t('ModalAdjuntsClient.Informacio') },
    ])

    const menuModel = ref([
      {label: ()=>  t('ModalAdjuntsComandes.Descarregar'), class:'p-button-text', icon: 'pi pi-download', action: () => clickOpcioDescarregar()},
      {label: ()=>  t('ModalAdjuntsComandes.Canviar nom'), class:'p-button-text', icon: 'pi pi-pencil', action: () => visibleModalRenombrar.value = true},
      {label: ()=>  t('ModalAdjuntsComandes.Eliminar'), class:'p-button-text p-button-danger', icon: 'pi pi-trash', action: () => clickOpcioEliminar()},
    ]);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      if (localStorage.getItem('pestanyaAdjuntsSeleccionada')) {
          pestanyaSeleccionada.value = parseInt(localStorage.getItem('pestanyaAdjuntsSeleccionada'));
      } else {
          localStorage.setItem('pestanyaAdjuntsSeleccionada', pestanyaSeleccionada.value);
      }
      await carregarAdjunts();

      nextTick(() => {
        inputFiltre.value.$el.focus();
        inputFiltre.value.$el.select();
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });
    
    watch(filtreNomFitxer, async () => {
      await carregarAdjunts();
    });
    
    watch(pestanyaSeleccionada, async () => {
      localStorage.setItem('pestanyaAdjuntsSeleccionada', pestanyaSeleccionada.value);
      await carregarAdjunts();
    });

    const modalVisible = computed(() => {
      return visibleModalRenombrar.value;
    });
    
    const carregarAdjunts = debounce (async () => {
      let params = new URLSearchParams();
      params.append('categoria', pestanyaSeleccionada.value !== 0 ? pestanyaSeleccionada.value : '');
      params.append('nomFitxer', filtreNomFitxer.value);
      let resposta = await ClientsService.obtenirAdjuntsClient(props.client, params);

      adjunts.value = resposta;
    }, 150);

    const pujarFitxersDialeg = async () => {
      pujarFitxersServidor(Array.from(fitxersSeleccionats.value.files));
    }

    const clickOpcioDescarregar = () => {
      descarregarFitxer(fitxer.value);
    }

    const clickOpcioEliminar = async () => {
      confirm.require({
        header: t('App.Confirmacio'),
        acceptClass: 'p-button-danger',
        message: t('ModalAdjuntsComandes.Confirma Elimina Adjunt'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          eliminarFitxer();
        }
      });
    }

    const pujarFitxersServidor = async (files) => {
      let filesUploads = files.map(f => ClientsService.pujarAdjunt(props.client, pestanyaSeleccionada.value, f)
        .then((reqResult) => {
          return {
            source: f.name,
            value: reqResult
          }
        }).catch((reqResult) => {
          throw {
            source: f.name,
            value: reqResult
          }
        })
      );
      let resultatsCarrega = await carrega(Promise.allSettled(filesUploads));

      let fitxersAmbError = resultatsCarrega.filter(f => f.status==="rejected");
      let fitxersOk = resultatsCarrega.filter(f => f.status==="fulfilled");
      if (fitxersAmbError.length) {
        // Ha ocurregut algun error (mostrar missatge d'error)
        let missatge = '';
        fitxersAmbError.forEach(item => {
          let nomFitxer = item.reason.source;
          let missatgeServidor = item.reason.value.response.data?.message;
          missatge += `<p><b>${nomFitxer}</b>: ${missatgeServidor}</p>`;
        });
        Swal.fire({
            icon: 'error',
            title: t('ModalAdjuntsComandes.Error Pujant Fitxers'),
            html: missatge
        });
      }
      if (fitxersOk.length) {
        fitxersOk.forEach(item => {
          let nomFitxer = item.value.source;
          toast.add({severity:'success', summary: t('ModalAdjuntsComandes.Fitxer pujat OK', [nomFitxer]), life: 3000});
        })
        await carregarAdjunts();
      }
    }
    
    const handler = (key) => {
      // No processem l'event en cas que es produeixi des d'un ContextMenu o Dropdown
      if (isContextMenuKey(key)) return;
      // En cas que hagi un modal visible
      if (modalVisible.value) return;
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      }
    }

    const descarregarFitxer = async (dataFitxer) => {
      let resp = await carrega(ClientsService.descarregarAdjunt(props.client, dataFitxer.codi));
      saveAs(new Blob([resp]), dataFitxer.nomFitxer);
    }

    const renombrarAdjunt = async (nouNomFitxer) => {
      await carrega(ClientsService.renombrarAdjunt(props.client, fitxer.value.codi, nouNomFitxer));
      await carregarAdjunts();
      visibleModalRenombrar.value = false;
    }

    const eliminarFitxer = async () => {
      await carrega(ClientsService.eliminarAdjunt(props.client, fitxer.value.codi));
      await carregarAdjunts();
      toast.add({severity:'success', summary: t('ModalAdjuntsComandes.Fitxer eliminat OK'), life: 3000});
    }

    const hide = () => {
      emit('update:carregat', false);
    }

    const estilRow = () => {
      return 'estilRow';
    }

    return {
      visible,
      hide,
      adjunts,
      contextMenu,
      menuModel,
      fitxer,
      estilRow,
      visibleModalRenombrar,
      props,
      filtreNomFitxer,
      pestanyaSeleccionada,
      categories,
      carregarAdjunts,
      fitxersSeleccionats,
      inputFiltre,
      pujarFitxersDialeg,
      renombrarAdjunt,
      clickOpcioDescarregar,
    }
  }
}
</script>

<style scoped>
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

.filtre {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px 30px;
  margin-bottom: 10px;
}

.enllas {
  cursor: pointer;
}

.element-filtre>label {
  display: block;
}

.tabs-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #ccc;
  gap: 1rem;
}

.right-tabs {
  display: flex;
  margin-left: auto; /* Esto empuja el grupo a la derecha */
  gap: 10px; /* Espaciado entre las dos pestañas derechas */
}

.tab {
  position: relative;
  padding: 10px 24px;
  cursor: pointer;
  color: #3366cc; /* azul neutro */
  background-color: #f0f4ff;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  font-weight: 500;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s, color 0.3s;
}

.tab:hover:not(.selected) {
  background-color: #dde8ff;
}

.tab.selected {
  color: #003366; /* azul oscuro */
  background-color: white;
  border-color: #ccc;
  border-bottom: 2px solid white; /* “levantada” */
  font-weight: 700;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.tab-content {
  /* padding: 10px; */
  border: 1px solid #ccc;
  border-top: none;
  background-color: white;
  border-radius: 0 6px 6px 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  min-height: 200px; /* Ajusta a tu contenido */
}

.ellipsis {
  white-space: nowrap;      /* Impide que el texto se divida en varias líneas */
  overflow: hidden;         /* Oculta el texto que no cabe */
  text-overflow: ellipsis;  /* Muestra los puntos suspensivos cuando el texto se corta */
  width: 100%;              /* Asegura que el texto ocupe todo el ancho disponible */
}

.file-drop-area {
  margin-top: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content:center;
  max-width: 100%;
  padding: 8px;
  border: 2px dashed rgba(0, 0, 0, 0.6);
  border-radius: 3px;
  transition: 0.2s;
  &.is-active {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.file-msg {
  margin-left: 10px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  opacity: 0;
  &:focus {
    outline: none;
  }
}

.p-button-text {
  width: 100%;
}

</style>
