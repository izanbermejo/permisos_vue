<template>
  <div style="width: 100%; text-align: center;">  
    <span v-if="refTipus == 'ESPECIAL'" v-tooltip="$t('TipusArticleClient.ESPECIAL')">
      <font-awesome-icon icon="fa-solid fa-gear" style="font-size: 1.10rem" />
    </span>
    <span v-else-if="refTipus == 'NORMALITZAT'" v-tooltip="$t('TipusArticleClient.SELFOIL')">
      <font-awesome-icon icon="fa-solid fa-ring" style="font-size: 1.10rem" />
    </span>
    <span v-else-if="refTipus == 'FILTRE'" v-tooltip="$t('TipusArticleClient.FILTRE')">
      <font-awesome-icon icon="fa-solid fa-hourglass-half" style="font-size: 1.10rem" />
    </span>
    <span v-else-if="refTipus == 'MARKETING'" v-tooltip="$t('TipusArticleClient.MARKETING')">
      <font-awesome-icon icon="fa-solid fa-map" style="font-size: 1.10rem" />
    </span>
    <span v-else-if="refTipus == 'MEDICAL'" v-tooltip="$t('TipusArticleClient.MEDICAL')">
      <font-awesome-icon icon="fa-solid fa-suitcase-medical" style="font-size: 1.10rem" />
    </span>
    <span v-else-if="refTipus == 'IBINSA'" v-tooltip="$t('TipusArticleClient.IBINSA')">
      <font-awesome-icon icon="fa-solid fa-italic" style="font-size: 1.10rem" />
    </span>
  </div>
</template>

<script>
import { toRef } from 'vue';

export default {
  name : 'ColumnaTipusArticleClient',
  props : {
    tipus : String,
  },
  setup(props) {
    const refTipus = toRef(props, 'tipus');
    return {
      refTipus,
    }
  }
}
</script>