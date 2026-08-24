<template>
  {{ diesCalculat }}
</template>

<script>
import i18n from '@/i18n/i18n';
import { diaMomentDilluns } from '@/utils/dateUtils.js';
import { computed } from 'vue';

export default {
  name : 'InformacioDiesTransitClient',
  props : {
    diesServei : String,
    diesTransit : Number,
  },
  setup(props) {
    const { tm } = i18n.global;

    const setmanaComensaDilluns = () => {
      return 'en-US' === localStorage.getItem('idioma');
    }

    const diesCalculat = computed(() => {
      var result = ' ';
      for (var i = 0; i < 7; i++) {
        if (serveix(i))
          result += diaSetmana(i) + ' - ';
      }
      result = result.substring(0, result.length-3).trim();
      return result ? '[' + result + ']' : '';
    });

    const serveix = (dia) => {
      let diaCalc = setmanaComensaDilluns() ? diaMomentDilluns(dia) : dia;
      return "X" === props.diesServei.charAt(diaCalc);
    }

    const diaSetmana = (dia) => {
      let diaCalc = setmanaComensaDilluns() ? diaMomentDilluns(dia) : dia;
      return tm('Primevue.dayNamesMin')[diaCalc];
    }

    return {
      props,
      diesCalculat,
      serveix,
      diaSetmana,
    }
  }
}
</script>

<style>
</style>