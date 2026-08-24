<template>
  <div style="width: 100%; text-align: center;">
    <div>
      <font-awesome-icon :icon="props.icon" style="font-size: 2.5rem;" />
    </div>
    <div style="margin-top: 5px;">
      <span style="font-size: larger; font-weight: 400;">{{ props.literal }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name : 'ColumnaTipusComanda',
  props : {
    icon : String,
    literal : String,
  },
  setup(props) {
    return {
      props,
    }
  }
}
</script>