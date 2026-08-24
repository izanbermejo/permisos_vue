<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="`${$t('EntradesComercial.Canviar of')} (${$t('App.actual')}: ${props.ofAntiga})`">
    <form @submit.prevent="guarda">
    <div class="form">
      <div class="element-form">
        <label>{{ $t('Entrades.of nova')}}</label>
        <InputNumber ref="inputNovaOf" v-model="state.ofEntrada" mode="decimal" :maxFractionDigits="3"
          @focus="$event.originalTarget.select()"
          @input="state.ofEntrada = $event.value"
          :class="{ 'p-invalid' : v.ofEntrada.$errors.length }"
          @keypress.enter="guarda" :locale="locale" />
          <small v-if="(v.ofEntrada.$errors.length)" class="p-error text-nowrap">{{$t('App.Valor requerit')}}</small>
      </div>
      <div class="break" />
      <div style="margin-left: auto; margin-right: 0; margin-top:10px">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Desa')" icon="pi pi-save" class="p-button-sm" style="margin-left: 10px;"/>
      </div>
    </div>
    </form>
  </Dialog>
</template>

<script>
import useVuelidate from "@vuelidate/core";
import { minValue, required } from '@vuelidate/validators';
import { ref, onMounted, onUnmounted, reactive, nextTick } from "vue";

export default {
  name: "ModalModificarQuantitat",
  props: {
    ofAntiga: Number,
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const inputNovaOf = ref();

    const state = reactive({
      ofEntrada: props.ofAntiga,
    });
    const rules = {
      ofEntrada : { required, min: minValue(0) }
    }
    const v = useVuelidate(rules, state);

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      nextTick(() => {
        inputNovaOf.value.$el.firstChild.focus();
      });
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    const handler = (key) => {
      if (key.key === 'Escape')
        hide();
    }

    const hide = () => {
      emit("update:carregat", false);
    };

    const guarda = async () => {
      // Validació
      v.value.$reset();
      await v.value.$validate()
      if (!v.value.$error) {
        emit("ofModificada", state.ofEntrada);
      }
    }

    return {
      visible,
      props,
      state,
      v,
      inputNovaOf,
      guarda,
      hide,
    };

  },
};
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