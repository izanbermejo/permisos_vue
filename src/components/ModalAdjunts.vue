<template>
  <Dialog v-model:visible="visible" :header="titolProps ? titolProps : $t('ModalAdjunts.Titol')" @hide="hide()" modal
    :closable="true" style="width: 820px" @drop="dropHandler" @dragover="dragOverHandler">
      <div class="file-drop-area">
        <i class="pi pi-cloud-upload" style="font-size: 1.75rem"></i>
        <span class="file-msg">{{ $t('ModalAdjunts.Instruccions pujar') }}</span>
        <input class="file-input" type="file" @change="pujarFitxersDialeg" ref="fitxersSeleccionats" multiple>
      </div>
      <DataTable :value="adjunts" class="p-datatable-sm" 
              contextMenu v-model:contextMenuSelection="fitxer" @rowContextmenu="contextMenu.show($event.originalEvent)"
              v-model:selection="fitxer" selectionMode="single"
              :scrollable="true" scrollDirection="both" scrollHeight="200px"
              :resizableColumns="true" columnResizeMode="expand"
              stripedRows showGridlines
              :rowClass="estilRow"
              sortField="data" :sortOrder="-1"
              style="margin-top: 15px; max-height: 200px">
          <template #empty>
              {{ $t('ModalAdjunts.Cap adjunt') }}
          </template>
          <Column :style="{width:'35px'}" :reorderableColumn="false">
            <template #body="{data}">
              <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable" @click="fitxer = data; contextMenu.show($event)" />
              </div>
            </template>
          </Column>
          <Column :header="$t('ModalAdjunts.Fitxer')" :style="{width:'350px'}" >
            <template #body="{data}">
              <a class="enllas" @click="descarregarFitxer(data)">{{ data.nom }}</a>
            </template>
          </Column>
          <Column :header="$t('ModalAdjunts.Data')" :style="{width:'140px'}" bodyStyle="justify-content: right;" >
            <template #body="{data}">
              {{ $d(data.data, 'long') }}
          </template>
          </Column>
          <Column :header="$t('ModalAdjunts.Usuari')" :style="{width:'230px'}" >
            <template #body="{data}">
              {{ data.usuari.toUpperCase() }}
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
  </Dialog>
</template>

<script>
import { onMounted, ref, toRef } from 'vue';
//import FormacioService from '@/services/formacio.service.js';
/* import { carrega } from '@/services/loader';
import {saveAs} from 'file-saver'; */
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
//import { useToast } from 'primevue/usetoast';
//import Swal from 'sweetalert2';

export default {
  name : 'ModalAlumnesInscrits',
  props: {
    carregat: Boolean,
    codiCurs: Number,
    titol: String,
  },
  emits: ['update:carregat', 'update:numAdjunts'],
  setup(props, { emit }) {

    const visible = ref(true);
    const { t } = useI18n();
    //const toast = useToast();
    const confirm = useConfirm();
    const curs = ref();
    const adjunts = ref();
    const fitxersSeleccionats = ref();
    const fitxer = ref();
    const titolProps = toRef(props, 'titol');
    const contextMenu = ref();

    const menuModel = ref([
      {label: ()=>  t('ModalAdjunts.Descarregar'), class:'p-button-text', icon: 'pi pi-download', action: () => clickOpcioDescarregar()},
      {label: ()=>  t('ModalAdjunts.Eliminar'), class:'p-button-text p-button-danger', icon: 'pi pi-trash', action: () => clickOpcioEliminar()},
    ]);

    onMounted(async () => {
/*       try {
        adjunts.value = await carrega(FormacioService.obtenirAdjunts(props.codiCurs));
      } catch {
        emit('update:carregat', false);
      } */
    })

    const dropHandler = async (ev) => {
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();

      let files = [];
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item) => {
          // If dropped items aren't files, reject them
          if (item.kind === "file") {
            let file = item.getAsFile();
            files.push(file);
          }
        });
      }

      //pujarFitxersServidor(files);
    }

    const pujarFitxersDialeg = async () => {
      //pujarFitxersServidor(Array.from(fitxersSeleccionats.value.files));
    }

    const clickOpcioDescarregar = () => {
      //descarregarFitxer(fitxer.value);
    }

    const clickOpcioEliminar = async () => {
      confirm.require({
        header: t('App.Confirmacio'),
        acceptClass: 'p-button-danger',
        message: t('ModalAdjunts.Confirma Elimina Adjunt'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          eliminarFitxer();
        }
      });
    }

    const eliminarFitxer = async () => {
/*       await carrega(FormacioService.eliminarAdjunt(props.codiCurs, fitxer.value.codiFitxer));
      adjunts.value = await carrega(FormacioService.obtenirAdjunts(props.codiCurs));
      toast.add({severity:'success', summary: t('ModalAdjunts.Fitxer eliminat OK'), life: 3000});
      emit('update:numAdjunts', adjunts.value?.length); */
    }

/*    const pujarFitxersServidor = async (files) => {
       let filesUploads = files.map(f => FormacioService.pujarAdjunt(props.codiCurs, f)
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
            title: t('ModalAdjunts.Error Pujant Fitxers'),
            html: missatge
        });
      }
      if (fitxersOk.length) {
        fitxersOk.forEach(item => {
          let nomFitxer = item.value.source;
          toast.add({severity:'success', summary: t('ModalAdjunts.Fitxer pujat OK', [nomFitxer]), life: 3000});
        })
        // Algun dels fitxers ha pujat OK per tant es carrega de nou la llista
        adjunts.value = await carrega(FormacioService.obtenirAdjunts(props.codiCurs));
        emit('update:numAdjunts', adjunts.value?.length);
      } 
    }*/

/*    const descarregarFitxer = async (dataFitxer) => {
       let resp = await carrega(FormacioService.descarregarAdjunt(props.codiCurs, dataFitxer.codiFitxer));
      saveAs(new Blob([resp]), dataFitxer.nom); 
    }
*/
    const dragOverHandler = (ev) => {
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    }

    const open = async (cursParam) => {
      curs.value = cursParam;
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
      curs,
      open,
      adjunts,
      titolProps,
      dropHandler,
      dragOverHandler,
      pujarFitxersDialeg,
      contextMenu,
      menuModel,
      fitxer,
      clickOpcioDescarregar,
      clickOpcioEliminar,
      fitxersSeleccionats,
      //pujarFitxersServidor,
      //descarregarFitxer,
      estilRow,
    }
  }
}
</script>

<style scoped>
.alert {
    padding: 8px;
}

.file-drop-area {
  margin-top: 1px;
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

.break {
    flex-basis: 100%;
    height: 0;
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

</style>
