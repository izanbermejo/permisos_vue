<template>
    <Tag v-if="props.servida" style="background-color: #00939b" icon="pi pi-truck" :value="$t('Comandes.Servit')"></Tag>
    <Tag v-else :style="{'background-color': rules[props.reservable].color}" :icon="rules[props.reservable].icon" :value="rules[props.reservable].value"></Tag>
    <span v-if="mostrarStock()" style="margin-left: 5px; font-weight: 600;">
      {{ `(${$n(props.stock)})` }}
    </span>
  </template>
  
  <script>
  import { computed } from "vue";
import { useI18n } from "vue-i18n";
  
  export default {
    name : 'DetallClient',
    props : {
      reservable : String,
      quantitatReservada : Number,
      quantitatPendent : Number,
      servida : Boolean,
      stock : Number,
    },
    setup(props) {
      const { t, n } = useI18n();
    
      const rules = computed(() => ({
        RES: {color: '#ff3333', value: '0'},
        PARCIAL: {color: '#FFA64E', value: `${n(props.quantitatReservada)} / ${n(props.quantitatPendent)}`},
        TOT: {color: ' #6cb35a', value: `${n(props.quantitatReservada)}`},
        NO: {icon: 'pi pi-calendar', color: '#9970ff', value: t('Comandes.Supera dies reserva')},
        NO_APLICA: {icon: 'pi pi-cog', color: '#9f9f9f', value: t('Comandes.No aplica')}
      }));

      const mostrarStock = () => {
        return "PARCIAL" === props.reservable || "RES" === props.reservable;
      }
  
      return {
        props,
        rules,
        mostrarStock
      }
  
    }
  }
  </script>