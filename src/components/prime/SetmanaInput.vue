<template>
  <InputNumber v-model="value" mode="decimal" :maxFractionDigits="0" min="1" :max="53"
    @keypress.enter="enter" @blur="blur"
    @focus="$event.originalTarget.select()" inputStyle="width: 35px;"
    showButtons/>
</template>

<script>
import { onMounted, ref, watch } from 'vue';

export default {
  name : 'SetmanaInput',
  props : {
    modelValue : Object,
    invalid : Boolean,
  },
  emits : ["update:modelValue"],
  setup(props, {emit}) {
    const value = ref();

    onMounted(() => {
      value.value = props.modelValue;
    });

    watch(value, (newValue, oldValue) => {
      if (newValue !== oldValue)
        emit('update:modelValue', value);
    });

    const enter = (e) => {
      var valor = e.srcElement.value;
      // Comprovar si es un valor enter
      var valorEntero = parseInt(valor, 10); 
      if (!isNaN(valorEntero) && valorEntero.toString() === valor) {
        value.value = valorEntero;
      }
      emit('enter-confirmed', value);
    }

    const blur = (e) => {
      var valor = e.originalEvent.srcElement.value;
      // Comprovar si es un valor enter
      var valorEntero = parseInt(valor, 10); 
      if (!isNaN(valorEntero) && valorEntero.toString() === valor) {
        value.value = valorEntero;
      }
      emit('blur-confirmed', value);
    }

    return {
      props,
      value,
      enter,
      blur
    }
  }
}
</script>