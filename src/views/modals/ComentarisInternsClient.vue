<template>
  <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" @focus="contextMenu.onArrowDownKey($event)"/>
  <EditorComentaris v-if="visibleComentarisComanda" :carregat="visibleComentarisComanda"
    @update:carregat="visibleComentarisComanda = $event;"
    :text="editingType === 'client' ? comentarisInternComanda : comentarisInternArticle"
    :callback="updateComentarisComanda" 
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"/>
  <Dialog v-model:visible="visible" modal :closable="false" :closeOnEscape="false" :draggable="false" @hide="hide"
    style="width: 600px; max-width: 95%; border-radius: 10px;">
    <template #header>
      <div style="width: 100%; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" style="font-size: 1.25rem; color: orange;" />
              <h4 style="font-weight: bold;">{{ $t('App.Comentaris informatius del client') }}</h4>
          </div>
          <button tabindex="-1" @click="hide" class="p-dialog-header-icon p-dialog-header-close p-link" aria-label="Close" type="button">
              <span class="p-dialog-header-close-icon pi pi-times"></span>
          </button>
      </div>
    </template>
    <div style="padding: 10px;">
      <div style="position: relative;">
        <strong>{{ $t('App.Comentaris client') }}</strong>
        <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')"
          @click="editar('client')"
          icon="fa-solid fa-pencil"
          class="icona-boto p-button-sm"
          :literal="$t('App.Edita')"/>
        <div class="comentari-wrapper">
          {{ textRef() }}
        </div>
      </div>
      <div v-if="props.artcli" style="position: relative;">
        <strong>{{ $t('App.Comentaris article') }}</strong>
        <ButtonShortcut v-if="permisosStore.tePermis('COMANDES', 'WRITE')"
          @click="editar('article')"
          icon="fa-solid fa-pencil"
          class="icona-boto p-button-sm"
          :literal="$t('App.Edita')"/>
        <div class="comentari-wrapper">
          {{ textRefArticle() }}
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
        <ButtonShortcut :literal="$t('App.Tanca')" icon="fa-solid fa-xmark" @click="hide" class="p-button-secondary p-button-sm" />
      </div>
    </div>
  </Dialog>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import EditorComentaris from './EditorComentaris.vue';
import comandesService from "@/services/comandes.service";
import { carrega, isLoading } from '@/services/loader';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';
import { usePermisosStore } from '@/stores/permisos';

export default {
  name: 'ComentarisInternsClient',
  props: {
    clicod: String,
    artcli: String,
    text: String,
    textArticle: String,
    callback: Function,
  },
  components: { EditorComentaris },
  emits: ['update:carregat'],

  setup(props, { emit }) {
    const permisosStore = usePermisosStore();
    const visible = ref(true);
    const visibleComentarisComanda = ref(false);
    const comentarisInternComanda = ref(props.text);
    const comentarisInternArticle = ref(props.textArticle || '');
    const textRef = () => comentarisInternComanda.value;
    const textRefArticle = () => comentarisInternArticle.value;
    const editingType = ref('client');
    const contextMenu = ref();
    const confirmVisible = ref(false);

    watch(() => props.text, v => comentarisInternComanda.value = v);
    watch(() => props.textArticle, v => comentarisInternArticle.value = v);

    onMounted(async () => {
      document.addEventListener("keydown", keyHandler);
    });

    const editar = (type) => {
      editingType.value = type;
      visibleComentarisComanda.value = true;
    };

    const hide = () => {
      visible.value = false;
      emit('update:carregat', false);
    };

    const updateComentarisComanda = async (text) => {
      if (editingType.value === 'client') {
        await carrega(comandesService.actualitzarComentariInternClient(props.clicod, text.trim()));
        await props.callback(props.clicod);
      }
      else if (editingType.value === 'article') {
        await carrega(comandesService.actualitzarComentariInternArticle(props.clicod, props.artcli, text.trim()));
        await props.callback();
      }
    };

    const keyHandler = (ev) => {
        // No processem l'event en cas que es produeixi des d'un ContextMenu
        if (isContextMenuKey(ev))  return;
        // Si no hi ha cap modal obert
        if (modalVisible.value) return;

        // No processem l'event en cas que s'estigui mostrant la càrrega
        if (isLoading.value) {
          ev.preventDefault();
          return;
        }

        // Tornar enrere
        if (ev.key=='Escape') {
          actionHandler(ev, () => hide());
        }
    };

    const actionHandler = (ev, action) => {
        ev.preventDefault();
        if (contextMenu?.value)
          contextMenu.value.visible = false;
        action();
      }

    const modalVisible = computed(() => {
        return confirmVisible.value || visibleComentarisComanda.value
    });

    return {
      visible,
      hide,
      editar,
      visibleComentarisComanda,
      textRef,
      textRefArticle,
      updateComentarisComanda,
      comentarisInternComanda,
      comentarisInternArticle,
      props,
      editingType,
      modalVisible,
      confirmVisible,
      contextMenu,
      permisosStore
    };
  }
};
</script>

<style scoped>
.icona-boto {
  position: absolute;
  top: -5px;
  right: 10px;
  z-index: 2;
  cursor: pointer;
}

.comentari-wrapper{
  background-color: #eef3ff;
  border-radius: 6px;
  padding: 15px;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
  color: #222;
  margin-bottom: 20px;
  position: relative;
  white-space: pre-wrap;
  margin-top: 10px;
}
</style>
