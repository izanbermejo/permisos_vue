<template>
  <ModalExportarDadesComercial v-if="visibleExportarDadesComercial" :carregat="visibleExportarDadesComercial"  @update:carregat="visibleExportarDadesComercial = $event" />
  <ModalConfigurarEmailEnviament v-if="visibleConfigurarEmailEnviament" :carregat="visibleConfigurarEmailEnviament"  @update:carregat="visibleConfigurarEmailEnviament = $event" />
  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-inbox" style="font-size: 1.25rem" />
      {{ $t('App.Entrades') }}
    </h5>
    <section class="flexcontainer">
      <div class="flexchild" @click="emit('update:opcio', 'MissatgesRebuts')">
        <div>
          <font-awesome-icon icon="fa-solid fa-comments" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('Entrades.Missatges rebuts') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 1]</span>
      </div>
      <div class="flexchild" @click="emit('update:opcio', 'PartComercial')">
        <div>
          <font-awesome-icon icon="fa-solid fa-chart-bar" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('Entrades.Part comercial') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 2]</span>
      </div>
      <div class="flexchild" @click="emit('update:opcio', 'PartMagatzem')">
        <div>
          <font-awesome-icon icon="fa-solid fa-dolly" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('Entrades.Part magatzem') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 3]</span>
      </div>
      <div class="flexchild" @click="visibleExportarDadesComercial = true">
        <div>
          <font-awesome-icon icon="fa-solid fa-file-excel" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('Entrades.exportar dades entrades') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 4]</span>
      </div>
      <div v-if="permisosStore.tePermis('ENTRADES', 'REPROCESSAR')" class="flexchild" @click="visibleConfigurarEmailEnviament = true">
        <div>
          <font-awesome-icon icon="fa-solid fa-envelope" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('Entrades.correu notificacio error') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 5]</span>
      </div>
    </section>
  </div>
</template>
<script>
import { onMounted, onUnmounted, ref } from 'vue';
import { usePermisosStore } from '@/stores/permisos';
import ModalExportarDadesComercial from '@/views/modals/ModalExportarDadesComercial.vue';
import ModalConfigurarEmailEnviament from '@/views/modals/ModalConfigurarEmailEnviament.vue';

export default {
  // eslint-disable-next-line  
  name: 'OpcionsEntrades',
  components : {
    ModalExportarDadesComercial,
    ModalConfigurarEmailEnviament,
  },
  setup ( props, {emit} ) {

    const permisosStore = usePermisosStore();
    const visibleExportarDadesComercial = ref(false);
    const visibleConfigurarEmailEnviament = ref(false);

    onMounted(() => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
      if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
        actionHandler(ev, () => emit('update:opcio', 'MissatgesRebuts'));
      }
      if (ev.ctrlKey && ev.key=="2") { // Ctrl + 2
        actionHandler(ev, () => emit('update:opcio', 'PartComercial'));
      }
      if (ev.ctrlKey && ev.key=="3") { // Ctrl + 3
        actionHandler(ev, () => emit('update:opcio', 'PartMagatzem'));
      }
      if (ev.ctrlKey && ev.key=="4") { // Ctrl + 4
        actionHandler(ev, () => visibleExportarDadesComercial.value = true);
      }
      if (ev.ctrlKey && ev.key=="5") { // Ctrl + 5
        actionHandler(ev, () => visibleConfigurarEmailEnviament.value = true);
      }
    }
  
    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    return {
      props,
      emit,
      permisosStore,
      visibleExportarDadesComercial,
      visibleConfigurarEmailEnviament,
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

  .flexcontainer {
    margin: 20px;
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
    flex-direction: row;
    gap: 50px;
  }

  .flexchild {
    flex: 0 1 200px;
    text-align: center;
    border: solid 1px gray;
    background-color: #dbeefd;
    cursor: pointer;
    height: 100%;
    padding: 10px;
    border-radius: 25px;
  }

  .flexchild:hover {
    background-color: #aed7f8;
  }

</style>