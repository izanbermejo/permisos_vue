<template>
  <BuscadorOrdresFabricacio 
    @update:articleClient="handleUpdateArticle"
    @update:modalObert="handleUpdateModalObert"
  />
  <CapçaleraOrdresFabricacio 
    v-if="articleClient" 
    :articleClient="articleClient"
    :modalAjudaisOpen="modalAjudaisOpen"
  />
</template>

<script>
import BuscadorOrdresFabricacio from '@/components/ordresFabricacio/BuscadorOrdresFabricacio.vue';
import CapçaleraOrdresFabricacio from '@/components/ordresFabricacio/CapçaleraOrdresFabricacio.vue';
import { ref } from 'vue';

export default {
  name: 'OrdresFabricacioView',
  components: {
    BuscadorOrdresFabricacio,
    CapçaleraOrdresFabricacio
  },
  setup() {
    const articleClient = ref(null);
    const modalAjudaisOpen = ref(false);

    const handleUpdateArticle = (nuevoArticleClient) => {
      articleClient.value = nuevoArticleClient;
    };

    const handleUpdateModalObert = (isOpen) => {
      modalAjudaisOpen.value = isOpen;
    };

    return { 
      articleClient,
      modalAjudaisOpen,
      handleUpdateArticle,
      handleUpdateModalObert
    };
  }
};
</script>