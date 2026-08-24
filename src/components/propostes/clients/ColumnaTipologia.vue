<template>
  <span
    v-for="(tipus, index) in props.tipusArticles"
    :key="index"
    v-tooltip="$t(tipusConfig[tipus].tooltip)"
    style="margin: 0 7px;"
  >
    <font-awesome-icon
      :icon="tipusConfig[tipus].icon"
      style="font-size: 1.1rem"
    />
  </span>
</template>

<script>

export default {
  name : 'ColumnaTipologia',
  props : {
    tipusArticles : Array,
  },
  setup(props) {

    const tipusConfig = {
      ESPECIAL: {
        icon: "fa-solid fa-gear",
        tooltip: "TipusArticleClient.ESPECIAL",
      },
      NORMALITZAT: {
        icon: "fa-solid fa-ring",
        tooltip: "TipusArticleClient.SELFOIL",
      },
      FILTRE: {
        icon: "fa-solid fa-hourglass-half",
        tooltip: "TipusArticleClient.FILTRE",
      },
      MARKETING: {
        icon: "fa-solid fa-map",
        tooltip: "TipusArticleClient.MARKETING",
      },
      IBINSA : {
        icon: "fa-solid fa-italic",
        tooltip: "TipusArticleClient.IBINSA",
      },
      MEDICAL: {
        icon: "fa-solid fa-suitcase-medical",
        tooltip: "TipusArticleClient.MEDICAL",
      },
    };

    return {
      props,
      tipusConfig
    }

  }
}
</script>