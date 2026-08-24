<template>
  <span style="display: inline-flex; gap: 15px;">
    <Tag v-if="props.numTot" :style="{'background-color': rules.TOT.color}" :icon="rules.TOT.icon" :value="rules.TOT.value" />
    <Tag v-if="props.numParcial" :style="{'background-color': rules.PARCIAL.color}" :icon="rules.PARCIAL.icon" :value="rules.PARCIAL.value" />
    <Tag v-if="props.numCap" :style="{'background-color': rules.RES.color}" :icon="rules.RES.icon" :value="rules.RES.value" />
  </span>
</template>

<script>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name : 'ColumnaServible',
  props : {
    numTot : Number,
    numParcial : Number,
    numCap : Number,
  },
  setup(props) {
    const { t } = useI18n();

    const rules = computed(() => ({
      RES: {icon: 'pi pi-times', color: '#ff3333', value: `${t('Propostes.Res')} ${props.numCap}`},
      PARCIAL: {icon: 'pi pi-exclamation-triangle', color: '#FFA64E', value: `${t('Propostes.Parcial')} ${props.numParcial}`},
      TOT: {icon: 'pi pi-check', color: ' #6cb35a', value: `${t('Propostes.Tot')} ${props.numTot}`},
    }));

    return {
      props,
      rules
    }

  }
}
</script>