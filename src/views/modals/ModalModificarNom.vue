<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('ModalAdjuntsComandes.Canviar nom')" style="width: 500px">
      <div class="form">
        <div class="element-form">
          <label>{{ $t('Comandes.Nom Actual')}}</label>
          <InputText :modelValue="props.nom" style="width: 450px; background-color: var(--surface-b);" readonly/>
          <label>{{ $t('Comandes.Nom Nou')}}</label>
          <InputText ref="inputNom" v-model="inputNomValue" style="width: 450px" />
        </div>
        <div class="break" />
        <div style="margin-left: auto; margin-right: 0; margin-top:10px">
          <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
          <ButtonShortcut type="submit" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;" @click="guarda"/>
        </div>
      </div>
  </Dialog>
</template>

<script>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { isContextMenuKey } from '@/utils/contextmenuUtils.js';

export default {
  name : 'ModalModificarNom',
  props: {
    carregat: Boolean,
    nom: String,
    callback : Function,
    empresa: String,
    clicod: String
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const inputNom = ref();
    const inputNomValue = ref("");
    const nomActual = ref(props.nom);
    const confirmVisible = ref(false);

    onMounted(() => {
      document.addEventListener("keydown", handler);

      nextTick(() => {
        if (!inputNom.value || !inputNom.value.$el) return;
        const inputEl = inputNom.value.$el;
        inputEl.focus();
        const value = inputEl.value;
        const dotIndex = value.lastIndexOf('.');
        if (dotIndex > 0) {
          inputEl.setSelectionRange(0, dotIndex);
        } else {
          inputEl.select();
        }
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

     const modalVisible = computed(() => {
      return confirmVisible.value;
    });

    const handler = (key) => {
      if (isContextMenuKey(key))  return;
      // Si no hi ha cap modal obert
      if (modalVisible.value) return;
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      } else if (key.key === 'Enter') {
        key.preventDefault();
        guarda();
      }
    }


    const guarda = async () => {
      confirmVisible.value = true;
      await props.callback(inputNomValue.value);
      confirmVisible.value = false;
    }

    const hide = () => {
      emit('update:carregat', false);
    }

    return {
      visible,
      hide,
      inputNom,
      nomActual,
      inputNomValue,
      guarda,
      props
    }
  }
}
</script>

<style scoped>
  .form {
    margin-top: 2px;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px 30px;
  }

  .element-form > label {
    display: block;
  }

  .element-form > small {
    display: block;
  }

  .break {
    flex-basis: 100%;
    height: 0;
  }
</style>
