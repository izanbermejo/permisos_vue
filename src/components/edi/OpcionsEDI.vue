<template>
  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-inbox" style="font-size: 1.25rem" />
      {{ $t('App.Entrades') }}
    </h5>
    <section class="flexcontainer">
      <div class="flexchild" @click="emit('update:opcio', 'ContingutEDI')">
        <div>
          <font-awesome-icon icon="fa-solid fa-comments" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('ComandesEDI.Contingut EDI') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 1]</span>
      </div>
      <div class="flexchild" @click="emit('update:opcio', 'ComandesEDI')">
        <div>
          <font-awesome-icon icon="fa-solid fa-indent" style="font-size: 2.5rem;" />
        </div>
        <span style="font-size: larger; font-weight: 400; display: block;">{{ $t('ComandesEDI.Comandes EDI') }}</span>
        <span style="font-size: larger; font-weight: 300;">[Ctrl + 2]</span>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { usePermisosStore } from '@/stores/permisos';

export default {
  // eslint-disable-next-line  
  name: 'OpcionsEDI',
  components : {
  },
  setup ( props, {emit} ) {

    const permisosStore = usePermisosStore();

    onMounted(() => {
      document.addEventListener("keydown", handler);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (ev) => {
      if (ev.ctrlKey && ev.key=="1") { // Ctrl + 1
        actionHandler(ev, () => emit('update:opcio', 'ContingutEDI'));
      }
      if (ev.ctrlKey && ev.key=="2") { // Ctrl + 2
        actionHandler(ev, () => emit('update:opcio', 'ComandesEDI'));
      }
    }
  
    const actionHandler = (ev, action) => {
      ev.preventDefault();
      action();
    }

    return {
      props,
      emit,
      permisosStore
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