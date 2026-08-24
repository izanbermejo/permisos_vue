<template>
  <CrearEditarLiniaConfiguracioAviExp v-if="visibleCrearEditarLiniaConfiguracioEDI" @update:carregat="visibleCrearEditarLiniaConfiguracioEDI = $event" 
    :isEdicio="false" @configuracioGuardada="visibleCrearEditarLiniaConfiguracioEDI = false; buscar()"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('ComandesEDI.Veure configuracio Avi/Exp')" style="width: 1200px">
      <div class="card" style="margin-top: 10px;">
        <div class="card-header filtre" ref="formWrapper" style="width: 100%; justify-content: space-between;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
            <div class="element-filtre">
              <InputText ref="inputFiltre" v-model="valorFiltre" style="width: 280px;" 
                :placeholder="$t('ComandesEDI.Cerca')"
                @focus="$event.originalTarget.select()" />
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <Button @click="exportarConfiguracions" :label="$t('ComandesEDI.Exportar configuracio AviExp')" icon="pi pi-download" class="p-button-sm"/>
            <Button v-if="permisosStore.tePermis('COMANDES_EDI', 'WRITE_CONFIG')" @click="visibleCrearEditarLiniaConfiguracioEDI = true" :label="$t('ComandesEDI.Afegir configuracio')" icon="pi pi-plus" class="p-button-sm"/>
          </div>
        </div>
        <div ref="card-body gridWrapper">
          <GridConfiguracioAviExp ref="gridEDI" :modalParentObert="modalVisible" @showDetall="showDetallEntrada" @update:close="hide" 
          @configuracioGuardada="visibleCrearEditarLiniaConfiguracioEDI = false; buscar()" @modalObert="modalObert = true"/>
        </div>
      </div>
  </Dialog>
</template>

<script>
import { ref, nextTick, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { carrega } from '@/services/loader';
import { isContextMenuKey } from "@/utils/contextmenuUtils";
import GridConfiguracioAviExp from '@/components/edi/GridConfiguracioAviExp.vue';
import CrearEditarLiniaConfiguracioAviExp from "@/views/modals/CrearEditarLiniaConfiguracioAviExp.vue";
import ediService from "@/services/edi.service";
//import CrearEditarLiniaConfiguracioEDI from "./CrearEditarLiniaConfiguracioEDI.vue";
import { saveAs } from 'file-saver';
import { usePermisosStore } from "@/stores/permisos";
import debounce from "debounce";

  export default {
    name: "ModalConfiguracioAVIEXP",
    components: {
      GridConfiguracioAviExp,
      CrearEditarLiniaConfiguracioAviExp,
      //CrearEditarLiniaConfiguracioEDI,
    },
    props: {
      carregat: Boolean,
    },
    setup(props, { emit }) {
      const { t } = useI18n();
      const permisosStore = usePermisosStore();
      const gridEDI = ref();
      const inputFiltre = ref();
      const valorFiltre = ref('');
      const formWrapper = ref();
      const gridWrapper = ref();
      const modalObert = ref(false);
      const visible = ref(props.carregat ?? false);
      const visibleCrearEditarLiniaConfiguracioEDI = ref(false);
      let isExportant = false;

      onMounted(() => {
        try {
          buscar();
        } catch (e) {
          hide();
        }
        document.addEventListener("keydown", handler);
        nextTick(() => {
          inputFiltre.value.$el.focus();
        });
      });

      onUnmounted(() => {
        document.removeEventListener("keydown", handler);
      });
      
      const buscar = debounce( async () => {
        let params = new URLSearchParams();
        params.append('filtre', valorFiltre.value);
        let resultat = await ediService.obtenirConfiguracionsAviExp(params)
        if (!gridEDI.value) return;
        gridEDI.value.performSearch(resultat);
      }, 150)

      watch(valorFiltre, async() => {
        buscar();
      });

      const exportarConfiguracions = async () => {
        if (isExportant) return;

        isExportant = true;

        const resp = await carrega(ediService.exportarConfiguracionsAviExp());
        saveAs(new Blob([resp]), `Configuracions_aviexp.xlsx`);

        isExportant = false;
      }

      const modalVisible = computed(() => {
        return visibleCrearEditarLiniaConfiguracioEDI.value;
      });

      const handler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        if (modalVisible.value) return;
        if (modalObert.value) return;
        if (ev.key=='Escape') {
          actionHandler(ev, hide);
        } 
      }
  
      const actionHandler = (ev, action) => {
        ev.preventDefault();
        action();
      }

      const hide = () => {
        if (visibleCrearEditarLiniaConfiguracioEDI.value) {
          return
        } 
        emit("update:carregat", false);
      };
    
      return {
        permisosStore,
        props,
        emit,
        valorFiltre,
        inputFiltre,
        buscar,
        gridEDI,
        formWrapper,
        gridWrapper,
        opcionsTipus : [
          {valor: null, clau: t('App.Totes')},
          {valor: 'PROGRAMA', clau: t('Comandes.Especials')},
          {valor: 'NORMALITZAT', clau: t('Comandes.Normalitzats')},
        ],
        visible,
        visibleCrearEditarLiniaConfiguracioEDI,
        hide,
        modalVisible,
        exportarConfiguracions,
        modalObert,
      };
  
    },
  };
</script>
  
  <style scoped>
    .card-body {
      padding: 10px 10px;
    }

    .filtre {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 5px 30px;
    }

    .element-filtre>label {
      display: block;
    }

    .enllas {
        cursor: pointer;
    }
  </style>
  