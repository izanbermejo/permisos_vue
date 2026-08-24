<template>
  <AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient" 
    @update:carregat="visibleAjudaArticleClientByClient = false" 
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
  <AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle" 
    @update:carregat="visibleAjudaArticleClientByArticle = false" 
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackAjudaArticleClientByClient" />
  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" style="font-size: 1.25rem" />
      {{ $t('App.Buscador OF') }}
    </h5>
    <div class="card-body">
        <div class="filtre" ref="formWrapper">
          <div class="element-filtre">
            <label style="display: inline-block;">{{ $t('Comandes.Articleclient') }}</label>
            <Button @click="mostrarAjudaArticleClient()" v-tooltip="$t('App.Ajuda Article Client')" icon="pi pi-search" class="p-button-sm" style="height: 20px; width: 28px; margin-left: 5px; margin-bottom: 3px;" />
            <InputText v-model="state.articleClient" style="width: 220px; display: block;" />
          </div>
          <div class="element-filtre" style="padding-top: 5px;display:flex;justify-content:flex-end;align-items:flex-end">
            <Button @click="buscar(state.articleClient)" :label="$t('App.Busca')" icon="pi pi-search" class="p-button-sm" />
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { onActivated, onDeactivated, ref, computed, reactive, nextTick, onMounted, watch } from 'vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import moment from 'moment';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import comandesService from '@/services/comandes.service';
import { carrega } from '@/services/loader';

export default {
  name: 'BuscadorOrdresFabricacio',
  components: {
    AjudaArticleClientByClient,
    AjudaArticleClientByArticle,
  },
  setup ( props, {emit} ) {
    const gridComandes = ref();
    const inputFiltre = ref();
    const visibleAjudaArticleClientByClient = ref(false);
    const visibleAjudaArticleClientByArticle = ref(false);
    const visibleAjudaClients = ref(false);
    const state = reactive({
      articleClient : '',
      usuari : '',
      dataInici : moment().subtract(5, 'year').toDate(),
      dataFi : new Date(),
    });
    let inicialitzat = false;
    const focusedGrid = ref(false);
    const formWrapper = ref();
    const gridWrapper = ref();
    const infoCapçalera = ref();
    const confirmVisible = ref(false);

    onMounted(() => {
      visibleAjudaArticleClientByArticle.value = true;
    });

    onActivated(() => {
      document.addEventListener("keydown", handler);
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('click', handleClick);
      nextTick(() => {
        inputFiltre.value.$el.focus();
        focusedGrid.value = false;
        setTimeout(() => {
          inicialitzat = true;
        }, 50);
      });
    });

    watch(visibleAjudaArticleClientByArticle, (nouValor) => {
      emit('update:modalObert', nouValor);
    });

    watch(visibleAjudaArticleClientByClient, (nouValor) => {
      emit('update:modalObert', nouValor);
    });

    onDeactivated(() => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('click', handleClick);
      focusedGrid.value = false;
      inicialitzat = false;
    });

    const handler = (ev) => {
        if (isContextMenuKey(ev))  return;
        if (modalVisible.value) return;
        if (ev.key=='Escape') {
          actionHandler(ev, () => emit('update:opcio', 'OpcionsComandes'));
        } else if (ev.key === 'Enter' && !focusedGrid.value) {
          buscar();
        }
    }

    const modalVisible = computed(() => {
      return confirmVisible.value
        || visibleAjudaArticleClientByArticle.value
        || visibleAjudaClients.value;
    });

    const buscar = async (cliCodAclFabArtInt) => {
      let articleClient = await carrega(comandesService.obtenirArticleClient(cliCodAclFabArtInt));
      visibleAjudaArticleClientByClient.value = false;
      visibleAjudaArticleClientByArticle.value = false;
      let dadesClient = {
        artInt: articleClient?.artint,
        cliCod: articleClient?.codiClient,
        articleClient: cliCodAclFabArtInt,
        fabrica: articleClient?.codiFabrica + ' - ' + articleClient?.descFabrica,
        nomClient: articleClient?.nomClient,
        referencia: articleClient?.referencia,
        isNormalitzat: articleClient?.keyArticleClient.normalitzat
      };
      state.articleClient = dadesClient?.articleClient;
      emit('update:articleClient', dadesClient);
    }

    const handleClick = (event) => {
      if (!inicialitzat) return;
      const clickedInsideForm = formWrapper.value?.contains(event.target);
      focusedGrid.value = !clickedInsideForm;
    };

    const handleFocusIn = (event) => {
      if (!inicialitzat) return;
      const insideForm = formWrapper.value?.contains(event.target);
      focusedGrid.value = !insideForm;
    };

    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    const mostrarAjudaArticleClient = () => {
      visibleAjudaArticleClientByArticle.value = true;
    }

    const mostrarAjudaClient = () => {
      visibleAjudaClients.value = true;
    }

    const switchAjuda = () => {
      if (visibleAjudaArticleClientByClient.value) {
        visibleAjudaArticleClientByClient.value = false; 
        visibleAjudaArticleClientByArticle.value = true; 
      } else {
        visibleAjudaArticleClientByArticle.value = false; 
        visibleAjudaArticleClientByClient.value = true; 
      }
    }

    const callbackAjudaArticleClientByClient = async (cliCodAclFabArtInt) => {
      visibleAjudaArticleClientByClient.value = false;
      visibleAjudaArticleClientByArticle.value = false;
      state.articleClient = cliCodAclFabArtInt.articleClient;
      emit('update:articleClient', cliCodAclFabArtInt);
    }

    return {
      props,
      emit,
      state,
      inputFiltre,
      buscar,
      gridComandes,
      modalVisible,
      focusedGrid,
      formWrapper,
      gridWrapper,
      mostrarAjudaArticleClient,
      mostrarAjudaClient,
      visibleAjudaArticleClientByClient,
      visibleAjudaArticleClientByArticle,
      visibleAjudaClients,
      switchAjuda,
      callbackAjudaArticleClientByClient,
      infoCapçalera,
      confirmVisible
    }

  }
}
</script>

<style scoped>
  .icona-boto {
    margin-right: 15px;
    display: inline-block;
    border-radius: 5px;
    box-shadow: 0 0 2px #888;
    padding: 0.5em 0.6em;
    font-size:  0.8rem;
    cursor: pointer;
  }

  .filtre {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 5px 30px;
  }

  .enllas {
    cursor: pointer;
  }

  .element-filtre>label {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }

  ::v-deep(.p-multiselect) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton) {
    line-height: 13px;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight) {
    background: #60cc65;
    border-color: #60cc65;
  }

  ::v-deep(.p-selectbutton .p-button.p-highlight:hover) {
    background: rgb(85, 172, 89);
    border-color: rgb(85, 172, 89);
  }

  ::v-deep(.estilRow) {
    cursor: pointer;
  }

  .grid-focus {
    border: 3px solid #b0daf8;
    border-radius: 4px;
  }

  .grid-not-focused {
    border: 3px solid transparent;
    border-radius: 4px;
  }
  
</style>