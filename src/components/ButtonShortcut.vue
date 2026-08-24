<template>
  <Button :class="props.class" style="padding: 5px 5px;">
    <font-awesome-icon :icon="props.icon" />
    <span style="text-align: center; margin-left: 5px;">
      {{ props.literal }}
    </span>
    <span style="margin-left:5px; font-size: 11px; position: relative; display: inline-block; top: 5px;">
      {{ props.shortcut }}
    </span>
  </Button>
</template>

<script>

export default {
  name : 'ColumnaTipusComanda',
  props : {
    icon : String,
    literal : String,
    shortcut : String,
    class: { type: String, default: 'p-button-sm' },
  },
  setup(props, {emit}) {
    return {
      props,
      emit,
    }
  }
}
</script>