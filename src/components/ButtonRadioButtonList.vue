<template>
  <label v-for="(label, value) in options" :key="value" class="block-radio-button" :class="{selected: value === modelValue}">
    <input type="radio" :value="value" :checked="value === modelValue" @change="$emit('update:modelValue', $event.target.value)" v-show="false"/>{{label}}
  </label>
</template>

<script>
export default {
  props: {
    options: Object,
    modelValue: {
      required: true,
    },
  },
}
</script>

<style scoped>
.block-radio-button {
  margin: 0 0.125em;
  padding: 0.25em;
  cursor: pointer;
  color: var(--theme-color-text-dark);
}

.block-radio-button.selected {
  border-radius: 0.25em;
  color: aqua;
  box-shadow: inset 0 0 0.25em rgba(255, 255, 255, 0.25);
  background-color: rgba(255, 255, 255, 0.125);
}
</style>