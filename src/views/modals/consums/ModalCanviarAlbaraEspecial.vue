<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="$t('Consums.canviarAlbaraEspecial')" :style="{ width: '420px' }">
    <form @submit.prevent="desar">
      <div class="camp">
        <label>{{ $t('Consums.albaraEspecial') }}</label>
        <InputText ref="input" v-model="state.valor" style="width: 100%;"
          :class="{ 'p-invalid': v.valor.$error }" />
        <small v-if="v.valor.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
      </div>

      <div class="botons">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Desa')" icon="pi pi-check" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';

export default {
  name: 'ModalCanviarAlbaraEspecial',
  emits: ['update:carregat', 'desar'],
  props: {
    // Número actual de l'albarà especial
    valor: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const input = ref();
    const state = reactive({ valor: props.valor || '' });
    const v = useVuelidate({ valor: { required } }, state);

    onMounted(() => {
      nextTick(() => input.value?.$el?.focus());
    });

    const hide = () => emit('update:carregat', false);

    // El pare persisteix el canvi (i hi fa la comprovació de duplicats); aquest modal només valida
    const desar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error) return;
      emit('desar', state.valor.trim());
    };

    return { visible, input, state, v, hide, desar };
  }
};
</script>

<style scoped>
.camp > label {
  display: block;
  font-weight: 600;
  margin-bottom: 2px;
}
.camp > small { display: block; }
.botons {
  margin-top: 18px;
  text-align: right;
}
</style>
