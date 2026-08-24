<template>
  <span style="display: inline-flex; gap: 15px;">
    <Tag v-if="props.numTraspassosAmbStockTot" :style="{'background-color': rules['TOT'].color}" :icon="rules['TOT'].icon" :value="rules['TOT'].value" />
    <Tag v-if="props.numTraspassosAmbStockParcial" :style="{'background-color': rules['PARCIAL'].color}" :icon="rules['PARCIAL'].icon" :value="rules['PARCIAL'].value" />
    <Tag v-if="props.numTraspassosAmbStockCap" :style="{'background-color': rules['RES'].color}" :icon="rules['RES'].icon" :value="rules['RES'].value" />
  </span>
</template>

<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name : 'ColumnaServible',
  props : {
    numTraspassos : Number,
    numTraspassosAmbStockTot : Number,
    numTraspassosAmbStockParcial : Number,
    numTraspassosAmbStockCap : Number,
  },
  setup(props) {
    const { t } = useI18n();

    const textStockTot = computed(() => {
      return props.numTraspassosAmbStockTot + '/' + props.numTraspassos;
    });

    const textStockParcial = computed(() => {
      return props.numTraspassosAmbStockParcial + '/' + props.numTraspassos;
    });

    const textStockCap = computed(() => {
      return props.numTraspassosAmbStockCap + '/' + props.numTraspassos;
    });

    const rules = {
      RES: {icon: 'pi pi-times', color: '#ff3333', value: `${t('Propostes.Res')} ${textStockCap.value}`},
      PARCIAL: {icon: 'pi pi-exclamation-triangle', color: '#FFA64E', value: `${t('Propostes.Parcial')} ${textStockParcial.value}`},
      TOT: {icon: 'pi pi-check', color: ' #6cb35a', value: `${t('Propostes.Tot')} ${textStockTot.value}`},
    }

    return {
      props,
      rules
    }

  }
}
</script>