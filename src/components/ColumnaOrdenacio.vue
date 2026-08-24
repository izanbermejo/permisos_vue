<template>
  <div>
      {{ props.literal }}
      <span v-if="props.order" style="margin-right: 5px;">
          <span v-if="props.orderAsc">▲</span>
          <span v-else>▼</span>
      </span>
      <label v-if="props.showHelp" style="font-size: 0.7rem;">{{ `[${props.help}]` }}</label>
  </div>
</template>

<script>
// import { toRef } from 'vue';

export default {
  name : 'ColumnaOrdenacio',
  props : {
    literal : String,
    order: Boolean,
    orderAsc: Boolean,
    showHelp: {
      type: Boolean,
      default: true
    },
    help: String,
  },
  setup(props) {

    return {
      props,
    }

  }
}
</script>