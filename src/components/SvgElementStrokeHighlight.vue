<template>
  <slot></slot>
</template>

<script>
import { onActivated, onDeactivated, onMounted, onUnmounted, watch } from 'vue'
export default {
  props: {
    originalElement: {
      type: SVGElement,
      required: true,
    },
  },

  setup(props) {
    const strokeWidthStyle = (element) => element.style.strokeWidth;
    let originalStrokeWidth = strokeWidthStyle(props.originalElement);

    const highlight = (element) => {
      originalStrokeWidth = strokeWidthStyle(element);
      const actualStrokeWidth =
        +(element.style.strokeWidth || element.getAttribute('stroke-width')) || 1;
      element.style.strokeWidth = actualStrokeWidth + 4;
    };

    const undoHighlight = (element) => {
      element.style.strokeWidth = originalStrokeWidth;
    };

    onMounted(() => highlight(props.originalElement));
    onUnmounted(() => undoHighlight(props.originalElement));

    onActivated(() => highlight(props.originalElement));
    onDeactivated(() => undoHighlight(props.originalElement));

    watch(() => props.originalElement, (element, prevElement) => {
      undoHighlight(prevElement);
      highlight(element);
    });
  },
}
</script>