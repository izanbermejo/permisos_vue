<template>
  <InputNumber
    ref="inputNumber"
    v-bind="attrs"
    v-model="internalValue"
    :mode="'decimal'"
    :useGrouping="true"
    :locale="locale"
    @update:modelValue="handleUpdate"
    @keydown="onKeydown"
    @focus="$event.originalTarget.select()"
  />
</template>

<script>
import { ref, watch } from 'vue';
import { useAttrs } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'LocalizedInputNumber',
  props: {
    modelValue: [Number, String],
  },
  setup(props, { emit }) {
    const attrs = useAttrs();
    const { locale } = useI18n();
    const internalValue = ref(props.modelValue);

    const handleUpdate = (val) => {
      if (val === null || val === '' || typeof val === 'undefined') {
        emit('update:modelValue', '');
        internalValue.value = '';
        return;
      }

      if (typeof val === 'number' && !isNaN(val)) {
        emit('update:modelValue', val);
      } else {
        emit('update:modelValue', String(val));
      }

      internalValue.value = val;
    };

    watch(() => props.modelValue, (newVal) => {
      internalValue.value = newVal;
    });

    const onKeydown = (event) => {
      const decimalSeparator = (1.1)
        .toLocaleString(locale.value)
        .replace(/\d/g, '')[0];

      const isDecimalKey =
        event.code === 'NumpadDecimal' ||
        event.key === '.' ||
        event.key === ',';

      if (!isDecimalKey) return;

      // 👉 Leer maxFractionDigits desde attrs
      const maxFractionDigits = attrs?.maxFractionDigits ?? 20; // fallback por si no está definido

      // 👉 Si no se permiten decimales, prevenir la escritura del separador
      if (Number(maxFractionDigits) === 0) {
        event.preventDefault();
        return;
      }

      const inputEl = event.target;
      const currentValue = inputEl.value;

      if (currentValue.includes(decimalSeparator)) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;

      const newValue =
        currentValue.slice(0, start) + decimalSeparator + currentValue.slice(end);

      inputEl.value = newValue;
      inputEl.setSelectionRange(start + 1, start + 1);

      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    return {
      attrs,
      internalValue,
      handleUpdate,
      onKeydown,
      locale,
    };
  },
};
</script>
