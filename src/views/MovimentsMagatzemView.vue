<template>
  <AjudaArticleClientByClient
    :visible="visibleAjudaByClient"
    @update:carregat="visibleAjudaByClient = false"
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackSeleccio" />
  <AjudaArticleClientByArticle
    :visible="visibleAjudaByArticle"
    @update:carregat="visibleAjudaByArticle = false"
    @switch="switchAjuda"
    :seleccioCallbackArtIntCliCod="callbackSeleccio" />
  <AjudaArticleClient
    :visible="visibleAjudaArticles"
    @update:carregat="visibleAjudaArticles = false"
    :client="clicod"
    :seleccioCallback="callbackArtcliSeleccionat" />
  <AjudaClientsConsumeixenArticle
    :visible="visibleAjudaClients"
    @update:carregat="visibleAjudaClients = false"
    :artint="artint" :article="aclfab"
    :seleccioCallback="callbackArtcliSeleccionat" />

  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-warehouse" style="font-size: 1.25rem" />
      {{ $t('App.MovimentsMagatzem') }}
      <ButtonShortcut v-if="artint" @click="showAjuda()"
        style="margin-left: 15px;" icon="fa-solid fa-filter"
        :literal="$t('movimentsMagatzem.canviarArticleClient')" :shortcut="'[Ctrl+0]'" />
      <ButtonShortcut v-if="artint" @click="visibleAjudaArticles = true"
        style="margin-left: 35px;" icon="fa-solid fa-shapes"
        :literal="$t('Comandes.Articles del client')" :shortcut="'[Ctrl+1]'" />
      <ButtonShortcut v-if="artint" @click="visibleAjudaClients = true"
        style="margin-left: 35px;" icon="fa-solid fa-user-gear"
        :literal="$t('Comandes.Clients consumeixen article')" :shortcut="'[Ctrl+2]'" />
    </h5>
    <div class="card-body">
      <div v-if="!artint" style="width: 100%; text-align: center;">
        <div>
          <font-awesome-icon icon="fa-solid fa-info" style="font-size: 2.5rem;" />
        </div>
        <div style="margin-top: 5px;">
          <span style="font-size: larger; font-weight: 400;">{{ $t('movimentsMagatzem.informacioInici') }}</span>
          <div style="margin-top: 5px;">
            <ButtonShortcut @click="showAjuda()" icon="fa-solid fa-filter"
              :literal="$t('movimentsMagatzem.canviarArticleClient')" :shortcut="'[Ctrl+0]'" />
          </div>
        </div>
      </div>
      <HistoricMoviments v-if="artint" :key="`${artint}-${clicod}`"
        :artint="artint" :clicod="clicod" @aclfab="v => aclfab = v" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import HistoricMoviments from '@/components/inventari/HistoricMoviments.vue';
import AjudaArticleClientByClient from '@/views/modals/AjudaArticleClientByClient.vue';
import AjudaArticleClientByArticle from '@/views/modals/AjudaArticleClientByArticle.vue';
import AjudaArticleClient from '@/views/modals/AjudaArticleClient.vue';
import AjudaClientsConsumeixenArticle from '@/views/modals/AjudaArticlesClientConsumeixenArticle.vue';
import ComandesService from '@/services/comandes.service';
import { carrega } from '@/services/loader';

export default {
  name: 'MovimentsMagatzemView',
  components: {
    ButtonShortcut,
    HistoricMoviments,
    AjudaArticleClientByClient,
    AjudaArticleClientByArticle,
    AjudaArticleClient,
    AjudaClientsConsumeixenArticle,
  },
  setup() {
    const artint = ref(null);
    const clicod = ref(null);
    const aclfab = ref(null);
    const visibleAjudaByClient = ref(false);
    const visibleAjudaByArticle = ref(false);
    const visibleAjudaArticles = ref(false);
    const visibleAjudaClients = ref(false);

    const anyModalOpen = () =>
      visibleAjudaByClient.value || visibleAjudaByArticle.value ||
      visibleAjudaArticles.value || visibleAjudaClients.value;

    const showAjuda = () => {
      visibleAjudaByArticle.value = true;
    };

    const switchAjuda = () => {
      if (visibleAjudaByClient.value) {
        visibleAjudaByClient.value = false;
        visibleAjudaByArticle.value = true;
      } else {
        visibleAjudaByArticle.value = false;
        visibleAjudaByClient.value = true;
      }
    };

    const callbackSeleccio = ({ artInt, cliCod }) => {
      visibleAjudaByClient.value = false;
      visibleAjudaByArticle.value = false;
      artint.value = artInt;
      clicod.value = cliCod;
      aclfab.value = null;
    };

    const callbackArtcliSeleccionat = async (artcliParam) => {
      visibleAjudaArticles.value = false;
      visibleAjudaClients.value = false;
      const resp = await carrega(ComandesService.obtenirArticleClient(artcliParam));
      if (resp) {
        artint.value = resp.artint;
        clicod.value = resp.codiClient;
        aclfab.value = resp.aclfab;
      }
    };

    const keyHandler = (ev) => {
      if (anyModalOpen()) return;
      if (ev.ctrlKey && ev.key === '0') {
        ev.preventDefault();
        showAjuda();
      } else if (ev.ctrlKey && ev.key === '1') {
        ev.preventDefault();
        if (artint.value) visibleAjudaArticles.value = true;
      } else if (ev.ctrlKey && ev.key === '2') {
        ev.preventDefault();
        if (artint.value) visibleAjudaClients.value = true;
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', keyHandler);
      showAjuda();
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', keyHandler);
    });

    return {
      artint, clicod, aclfab,
      visibleAjudaByClient, visibleAjudaByArticle,
      visibleAjudaArticles, visibleAjudaClients,
      showAjuda, switchAjuda, callbackSeleccio, callbackArtcliSeleccionat,
    };
  },
};
</script>
