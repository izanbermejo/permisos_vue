<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('Propostes.Canviar quantitat')">
    <form @submit.prevent="guarda">
    <div class="form">
      <div class="element-form">
        <label>{{ $t('Propostes.Quantitat')}}</label>
        <InputNumber ref="inputQuantitat" v-model="state.quantitat" mode="decimal" :maxFractionDigits="3"
          @focus="$event.originalTarget.select()"
          @input="state.quantitat = $event.value"
          :class="{ 'p-invalid' : v.quantitat.$errors.length }"
          @keypress.enter="guarda" :locale="locale" />
        <label style="display: inline; margin-left: 5px;">{{ state.divisa }}</label>
          <small v-if="(v.quantitat.$errors.length)" class="p-error text-nowrap">
            {{ esRequerit ? $t('App.Valor requerit') : $t('Propostes.Quantitat entre 1 i max', { max: $n(max) }) }}
          </small>
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
import { maxValue, minValue, required } from '@vuelidate/validators';
import { ref, onMounted, onUnmounted, reactive, computed, nextTick } from "vue";

export default {
  name: "ModalModificarQuantitat",
  props: {
    quantitat: Number,
    // Valor màxim permès (opcional). Si es defineix, no es podrà desar una quantitat superior.
    max: {
      type: Number,
      default: null,
    },
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const inputQuantitat = ref();

    const state = reactive({
      quantitat: props.quantitat,
    });
    const rules = computed(() => {
      // El valor ha de ser com a mínim 1; el màxim són les peces pendents de la línia (props.max).
      const r = { quantitat: { required, min: minValue(1) } };
      if (props.max != null) {
        r.quantitat.max = maxValue(props.max);
      }
      return r;
    });
    const v = useVuelidate(rules, state);

    // Cert quan l'error és per valor buit (required); la resta d'errors són per fora de rang [1, màxim].
    const esRequerit = computed(() => v.value.quantitat.$errors.some((e) => e.$validator === 'required'));

    onMounted(async () => {
      document.addEventListener("keydown", handler);
      nextTick(() => {
        inputQuantitat.value.$el.firstChild.focus();
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
      await v.value.$validate();
      if (!v.value.$error) {
        emit("quantitatModificada", state.quantitat);
      }
    }

    return {
      visible,
      props,
      state,
      v,
      esRequerit,
      inputQuantitat,
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