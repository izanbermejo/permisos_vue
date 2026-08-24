<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="true"
    :draggable="false" :header="$t('Consums.canviarDataConsum')" :style="{ width: '420px' }">
    <form @submit.prevent="desar">
      <div class="camp">
        <label>{{ $t('Consums.dataConsum') }}</label>
        <CalendarInput v-model="state.data" :invalid="v.data.$error" />
        <small v-if="v.data.$error" class="p-error">{{ $t('App.Valor requerit') }}</small>
      </div>

      <div class="botons">
        <Button tabindex="-1" :label="$t('App.Cancela')" icon="pi pi-undo" class="p-button-secondary p-button-sm" @click="hide" />
        <Button type="submit" :label="$t('App.Desa')" icon="pi pi-check" class="p-button-sm" style="margin-left: 10px;" />
      </div>
    </form>
  </Dialog>
</template>

<script>
import { ref, reactive } from 'vue';
import moment from 'moment';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import CalendarInput from '@/components/prime/CalendarInput.vue';

export default {
  name: 'ModalCanviarDataConsum',
  components: { CalendarInput },
  emits: ['update:carregat', 'desar'],
  props: {
    // Data actual del consum ('YYYY-MM-DD')
    valor: { type: String, required: true }
  },
  setup(props, { emit }) {
    const visible = ref(true);
    const state = reactive({ data: moment(props.valor, 'YYYY-MM-DD').toDate() });
    const rules = {
      // CalendarInput deixa el text tal qual si no és una data vàlida
      data: { required, valid: (valor) => valor instanceof Date },
    };
    const v = useVuelidate(rules, state);

    const hide = () => emit('update:carregat', false);

    // El pare persisteix el canvi (i confirma la propagació a moviments i traçabilitat)
    const desar = async () => {
      v.value.$reset();
      await v.value.$validate();
      if (v.value.$error) return;
      emit('desar', moment(state.data).format('YYYY-MM-DD'));
    };

    return { visible, state, v, hide, desar };
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
