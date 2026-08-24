<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('ModalAdjuntsComandes.Canviar nom')" style="width: 700px">
    <form @submit.prevent="guarda">
    <div class="form">
      <div class="element-form">
        <label>{{ $t('Comandes.Nom fitxer')}}</label>
          <InputText ref="inputNomFitxer" v-model="nomFitxerRef"  
                    style="width: 650px" />
          <!-- <small v-if="(v.dataSolicitada.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small> -->
      </div>
      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <ButtonShortcut tabindex="-1" :literal="$t('App.Cancela')" icon="fa-solid fa-undo" :shortcut="'[Esc]'"  class="p-button-secondary p-button-sm" @click="hide" />
        <ButtonShortcut type="submit" :literal="$t('App.Desa')" icon="fa-solid fa-save" :shortcut="'[Enter]'" style="margin-left: 10px;"/>
      </div>
    </div>
    </form>
  </Dialog>
</template>

<script>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

export default {
  name : 'ModalRenombrarAdjunt',
  props: {
    carregat: Boolean,
    nomFitxer: String,
    callback : Function,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const inputNomFitxer = ref();
    const nomFitxerRef = ref(props.nomFitxer);

    onMounted(() => {
      document.addEventListener("keydown", handler);

      nextTick(() => {
        const inputEl = inputNomFitxer.value.$el;

        if (inputEl) {
          inputEl.focus();

          const value = inputEl.value;
          const dotIndex = value.lastIndexOf('.');

          if (dotIndex > 0) {
            inputEl.setSelectionRange(0, dotIndex);
          } else {
            inputEl.select();
          }
        }

      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (key.key === 'Escape') {
        key.preventDefault();
        hide();
      }
    }

    const guarda = () => {
      props.callback(nomFitxerRef.value);
    }

    const hide = () => {
      emit('update:carregat', false);
    }

    return {
      visible,
      hide,
      inputNomFitxer,
      nomFitxerRef,
      guarda,
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
