<template>
  <div class="list-box">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ListBox',
  props: {
  }
}
</script>

<style scoped>
.list-box {
  display: flex;
  flex-direction: column;
}
</style>
