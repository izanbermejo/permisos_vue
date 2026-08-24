<template>
  <!-- Laboral / No laboral / Reglat -->
  <div v-if="refTipus == 'FERM' || refTipus == 'F'" class="div-contenidor" :class="classServidaFerm()">
    <img :src="require('@/assets/okcheck.png')" height="22"  v-tooltip="$t(`Comandes.Ferm`)">
  </div>
  <div v-else-if="refTipus == 'ORIENTATIU' || refTipus == 'O'" class="div-contenidor" :class="classServidaOrientatiu()">
    <img :src="require('@/assets/bruixola.png')" height="20"  v-tooltip="$t(`Comandes.Orientatiu`)">
  </div>
  <div v-else-if="refTipus == 'INVENT' || refTipus == 'I'" class="div-contenidor" :class="classServidaInvent()">
    <img :src="require('@/assets/bombeta.png')" height="20"  v-tooltip="$t(`Comandes.Invent`)">
  </div>
  <div v-else-if="refTipus == 'STOCK_SEG_CLIENT' || refTipus == 'STOCK_SEG_AMES'" class="div-contenidor fons-taronja">
    <img :src="require('@/assets/lockedpackage.png')" height="20"  v-tooltip="$t(`Comandes.Stock seguretat`)">
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'ColumnaTipusComanda',
  props : {
    tipus : String,
    servida : Boolean,
  },
  setup(props) {
    const refTipus = toRef(props, 'tipus');

    const classServidaFerm = () => {
      return !props.servida ? 'fons-verd' : '';
    }

    const classServidaOrientatiu = () => {
      return !props.servida ? 'fons-blau' : '';
    }

    const classServidaInvent = () => {
      return !props.servida ? 'fons-groc' : '';
    }
    
    return {
      refTipus,
      classServidaFerm,
      classServidaOrientatiu,
      classServidaInvent
    }
  }
}
</script>

<style>
.div-contenidor {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fons-groc {
  background-color: #ffcf03;
  padding: 1px;
}

.fons-verd {
  background-color: #5ac257;
  padding: 1px;
}

.fons-blau {
  background-color: #91bcfc;
  padding: 1px;
}

.fons-taronja {
  background-color: #ff7300;
  padding: 1px;
}
</style>