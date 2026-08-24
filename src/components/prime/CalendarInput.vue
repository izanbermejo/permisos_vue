<template>
  <Calendar ref="refCal" manualInput v-model="value" :placeholder="$t('Primevue.dateFormatPlaceholder')"
    :class="{ 'p-invalid' : props.invalid }"
    :showOnFocus="false"
    :showIcon="true"
    @keypress.enter="enter" @blur="blur"
    @focus="$event.originalTarget.select()" style="width: 140px;"/>
</template>

<script>
import moment from 'moment';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name : 'CalendarInput',
  props : {
    modelValue : Object,
    invalid : Boolean,
  },
  emits : ["update:modelValue"],
  setup(props, {emit}) {
    const { t } = useI18n();
    const value = ref();
    const refCal = ref();

    onMounted(() => {
      value.value = props.modelValue;
      nextTick(() => {
        const calendarEl = refCal.value.$el;
        const iconButton = calendarEl?.querySelector('.p-datepicker-trigger');
        if (iconButton) {
          iconButton.setAttribute('tabindex', '-1');
        }
      });
    });

    watch(value, (newValue, oldValue) => {
      if (!compareSameDate(newValue, oldValue)) {
        emit('update:modelValue', value);
      }
    });

    const enter = (e) => {
      var valor = e.srcElement.value;
      var d = moment(valor, t('Primevue.dateFormatPlaceholder'));
      if (d.isValid()) {
        if (d.toDate()!=value.value) {
          value.value = changeYearBefore(valor, d);
        }
      } else {
        value.value = valor;
      }
      emit('enter-confirmed', value);
    }

    const blur = (e) => {
      var valor = e.originalEvent.srcElement.value;
      var d = moment(valor, t('Primevue.dateFormatPlaceholder'));
      if (d.isValid()) {
        if (!d.isSame(value.value, 'day')) {
          value.value = changeYearBefore(valor, d);
        }
      } else {
        value.value = valor;
      }
      emit('blur-confirmed', value);
    }

    function hasYear(text) {
      // Primero, manejamos el caso donde no hay separadores, como "030492"
      // Si la fecha es "DDMMYY", lo convertimos en "DD/MM/YY"
      if (!text.includes("/")) {
        text = text.replace(/(\d{2})(\d{2})(\d{2})/, '$1/$2/$3'); // Convierte "030492" en "03/04/92"
      }

      // Ahora, utilizamos una expresión regular para comprobar si la fecha tiene un año explícito (2 o 4 dígitos)
      const regex = /\d{1,2}\/\d{1,2}\/\d{2,4}/;

      // Comprobamos si el texto tiene una fecha con formato válido
      if (regex.test(text)) {
        const date = moment(text, t('Primevue.dateFormatPlaceholder')); // Usamos Moment.js para validar la fecha
        return date.isValid(); // Si es válida, devuelve true
      }

      // Si no tiene un formato válido, devolver false
      return false;
    }

    function changeYearBefore(valor, dateMoment) {
      if (hasYear(valor))
        return dateMoment.toDate();
      if (dateMoment.isBefore(moment(), 'day')) {
        return dateMoment.add(1, 'year').toDate();
      }
      return dateMoment.toDate();
    }

    const compareSameDate = (newValue, oldValue) => {
      if (newValue === oldValue)
        return true;
      var dNewValue = moment(newValue);
      var dOldValue = moment(oldValue);
      if (dNewValue.isValid() && dOldValue.isValid() && dNewValue.isSame(dOldValue, 'day'))
        return true;
      return false;
    }

    return {
      props,
      value,
      enter,
      blur,
      refCal
    }
  }
}
</script>