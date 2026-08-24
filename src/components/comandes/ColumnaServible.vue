<template>
  <Tag v-if="props.reservable" :style="{'background-color': rules[props.reservable].color}" :icon="rules[props.reservable].icon" :value="rules[props.reservable].value"></Tag>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name : 'ColumnaServible',
  props : {
    reservable : String,
  },
  setup(props) {
    const { t } = useI18n();

    const rules = {
      RES: {icon: 'pi pi-times', color: '#ff3333', value: t('Comandes.Cap')},
      PARCIAL: {icon: 'pi pi-exclamation-triangle', color: '#FFA64E', value: t('Comandes.Parcial')},
      TOT: {icon: 'pi pi-check', color: ' #6cb35a', value: t('Comandes.Tot')},
      NO: {icon: 'pi pi-calendar', color: '#9970ff', value: t('Comandes.Supera dies reserva')},
      NO_APLICA: {icon: 'pi pi-cog', color: '#9f9f9f', value: t('Comandes.No aplica')}
    }

    return {
      props,
      rules
    }

  }
}
</script>