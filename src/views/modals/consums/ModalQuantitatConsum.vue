<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false"
    :draggable="false" :header="$t('Consums.afegirPeca')" :style="{ width: '480px' }">
    <form @submit.prevent="afegir">
      <div class="camp">
        <label>{{ $t('Consums.article') }}</label>
        <div class="valor">{{ peca.aclfab }}{{ peca.clicod }}<span v-if="peca.referencia"> — {{ peca.referencia }}</span></div>
      </div>
      <div class="camp">
        <label>{{ $t('Consums.stock') }}</label>
        <div class="valor">{{ $n(disponible) }}</div>
      </div>
      <div class="camp">
        <label>{{ $t('Consums.quantitat') }}</label>
        <LocalizedInputNumber ref="inputQuantitat" v-model="state.quantitat" :maxFractionDigits="0" :min="0"
          :class="{ 'p-invalid': v.quantitat.$error }" @input="state.quantitat = $event.value" @keypress.enter="afegir" />
        <small v-if="v.quantitat.$error" class="p-error">{{ errorQuantitat }}</small>
      </div>
      <div class="camp">
        <label>{{ $t('Consums.identificadorOpcional') }}</label>
        <InputText v-model="state.identificador" style="width: 100%;" />
      </div>
      <div class="botons">
        <Button :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('Consums.afegir')" icon="pi pi-plus" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minValue, maxValue } from '@vuelidate/validators';
import { useI18n } from 'vue-i18n';

export default {
  name: 'ModalQuantitatConsum',
  props: {
    peca: { type: Object, required: true },
    disponible: { type: Number, required: true }
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const visible = ref(true);
    const inputQuantitat = ref();

    const state = reactive({
      quantitat: null,
      identificador: ''
    });

    onMounted(() => {
      document.addEventListener('keydown', handler);
      // Focus a la quantitat en obrir el modal
      nextTick(() => {
        const input = inputQuantitat.value?.$el?.querySelector('input');
        input?.focus();
      });
    });

    onUnmounted(() => {
      document.removeEventListener('keydown', handler);
    });

    const handler = (e) => {
      if (e.key === 'Escape') {
        hide();
      }
    };
    const rules = {
      quantitat: { required, min: minValue(1), max: maxValue(props.disponible) }
    };
    const v = useVuelidate(rules, state);

    const errorQuantitat = computed(() => {
      if (!v.value.quantitat.required.$invalid && v.value.quantitat.max.$invalid) {
        return t('Consums.quantitatSuperaStock', [props.disponible]);
      }
      return t('App.Valor requerit');
    });

    const hide = () => emit('update:carregat', false);

    const afegir = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error) return;
      emit('pecaAfegida', {
        quantitat: state.quantitat,
        identificador: state.identificador ? state.identificador.trim() : null
      });
    };

    return { visible, state, v, errorQuantitat, inputQuantitat, hide, afegir };
  }
};
</script>

<style scoped>
.camp {
  margin-bottom: 12px;
}
.camp > label {
  display: block;
  font-weight: 600;
}
.camp > .valor {
  padding: 2px 0;
}
.botons {
  margin-top: 15px;
  text-align: right;
}
</style>
