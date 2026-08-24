<template>
  <div style="width: 100%; text-align: center;">
    <div>
      <font-awesome-icon icon='fa-solid fa-face-frown-open' style="font-size: 2.5rem;" />
    </div>
    <div style="margin-top: 5px;">
      <span style="font-size: larger; font-weight: 400;">{{ $t('App.No permisos') }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name : 'ErrorPermisos',
    setup() {
    }
  }
</script>

