<template>
  <EditorComentaris v-if="visibleModalContingutTXT" :carregat="visibleModalContingutTXT" @update:carregat="visibleModalContingutTXT = $event;"
  :text="contingutTXT" :potEditar="false"/>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" :header="' '"
    style="width: 1000px">
    <template #header>
      <div style="font-size: larger; font-weight: 600; float: left;">
        <i class="pi pi-user"></i>
        <span style="margin-left: 10px;"> {{ `${$t('Comandes.comandes del client')} ${refClient} - ${nomClient} (Responsable: ${responsable})` }}</span>
      </div>
    </template>
    <GridComandesEDIByClient ref="gridComandesClient" :modalParentObert="modalVisible" style="margin-top: 10px;" @mostraTXT="mostrarContingutTXT($event)" @mostraPDF="descarregarPDF($event)" @pujaPDF="openFileInput($event)" @update:close="hide" @update:carrega="buscar()"/>
  </Dialog>
  <input ref="fileInput" type="file" @change="handleFileChange" style="display: none;" />
</template>
  
<script>
import { computed, nextTick, onMounted, ref, toRef } from "vue";
import { carrega } from "@/services/loader";
import ediService from "@/services/edi.service";
import GridComandesEDIByClient from "@/components/edi/GridComandesEDIByClient.vue";
import EditorComentaris from '@/views/modals/EditorComentaris.vue';
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
  
export default {
  name: "AjudaComandesEDIByClient",
  components: {
    GridComandesEDIByClient,
    EditorComentaris,
  },
  props: {
      codiClient : String,
      nomClient : String,
      responsable : String,
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const gridComandesClient = ref();
    const refClient = toRef(props, 'codiClient');
    const comandesClient = ref();
    const articleClient = ref();
    const visibleModalContingutTXT = ref(false);
    const contingutTXT = ref();
    const selectedLinia = ref();
    const fileInput = ref();

    onMounted(async () => {
      buscar();
    });

    const hide = () => {
      emit("update:carregat", false);
    };

    const modalVisible = computed(() => {
      return visibleModalContingutTXT.value;
    });

    const buscar = async () => {
      comandesClient.value = await carrega(ediService.obtenirComandesEdiByClient(refClient.value));
      gridComandesClient.value.performSearch(comandesClient.value);
      document.activeElement.blur();
    }

    const mostrarContingutTXT = async (registre) => {
      selectedLinia.value = registre;
      let response = await(carrega(ediService.obtenirContingutTXT(registre.idMissatge)));
      contingutTXT.value = response[0]?.contingut || '';
      nextTick(() => {
          visibleModalContingutTXT.value = true;
      })
    }

    const descarregarPDF = async (registre) => {
      selectedLinia.value = registre;
      let params = new URLSearchParams();
      params.append('pathPDF', selectedLinia.value.pathPDF ? selectedLinia.value.pathPDF : '');

      let response = await(carrega(ediService.descarregaPDF(selectedLinia.value.idMissatge, params)));
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }
    
    const openFileInput = (registre) => {
      selectedLinia.value = registre;
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
        buscar();
    }

    return {
      props,
      visible,
      hide,
      buscar,
      gridComandesClient,
      refClient,
      comandesClient,
      articleClient,
      visibleModalContingutTXT,
      contingutTXT,
      fileInput,
      mostrarContingutTXT,
      descarregarPDF,
      openFileInput,
      handleFileChange,
      modalVisible,
    }

  },
}
</script>
  
  
<style scoped>
  ::v-deep(.p-panel-header) {
    padding: 0.5rem;
  }

  ::v-deep(.p-panel .p-panel-content) {
    padding: 0rem 0.5rem 0.5rem 0.5rem;
  }

  .form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
  }

  .element-form > label {
    display: block;
    font-weight: 600;
    font-size: 1rem;
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  .flex-container {
    padding: 0px 5px; 
    display: flex;
    gap: 75px;
  }

  .label-detall {
    margin-right: 5px;
  }
</style>