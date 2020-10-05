<template>
  <svg
      style="svg-manipulator"
      :style="{backgroundColor: (svgNode ? svgNode.style.backgroundColor : '')}"
      @mouseup.left="onMouseUp"
      @contextmenu.prevent
      @pointerdown.right.prevent="startPanning"
      @pointerup.right.prevent="stopPanning"
      @pointermove="pan"
      @wheel.prevent="zoom"
      >
    <g ref="external-svg-container" :transform="transform"/>
    <slot></slot>
  </svg>
</template>

<script>
import { computed, onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

export default {
  props: {
    svgNode: {
      type: SVGSVGElement,
      required: true
    },
    viewport: {
      type: Object,
      default: reactive({
        x: 0,
        y: 0,
        zoom: 1,
      }),
    },
  },

  setup(props, {emit}) {
    // INITIALIZATION
    const externalSvgContainer = ref(null);

    const mountSvgNode = (node) => externalSvgContainer.value.appendChild(node);
    const unmountSvgNode = (node) => {
      if (node.parentElement === externalSvgContainer.value) {
        node.remove();
      }
    };

    onMounted(() => mountSvgNode(props.svgNode));
    onUnmounted(() => unmountSvgNode(props.svgNode));

    onActivated(() => mountSvgNode(props.svgNode));
    onDeactivated(() => unmountSvgNode(props.svgNode));

    watch(() => props.svgNode, (newNode, prevNode) => {
        unmountSvgNode(prevNode);
        mountSvgNode(newNode);
    });

    // SELECTION
    const onMouseUp = ({target}) => {
      emit('element-click', target);
    };

    // VIEWING
    let previousPanPosition;
    const startPanning = ({offsetX, offsetY, target, pointerId}) => {
      target.setPointerCapture(pointerId);
      previousPanPosition = [offsetX, offsetY];
    };

    const stopPanning = ({target, pointerId}) => {
      previousPanPosition = undefined;
      target.releasePointerCapture(pointerId);
    };

    const pan = ({offsetX, offsetY}) => {
      if (previousPanPosition) {
        const currentPosition = [offsetX, offsetY];
        const {zoom, x, y} = props.viewport;
        emit('update:viewport', {
          zoom: zoom,
          x: x + (currentPosition[0] - previousPanPosition[0]),
          y: y + (currentPosition[1] - previousPanPosition[1]),
        });
        previousPanPosition = currentPosition;
      }
    };

    const ZOOM_IN_FACTOR = Math.SQRT2;
    const ZOOM_OUT_FACTOR = 1 / ZOOM_IN_FACTOR;
    const zoom = ({deltaY, offsetX, offsetY}) => {
      const zoomFactor = (deltaY < 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR);
      const translateFactor = (zoomFactor - 1);
      const {zoom, x, y} = props.viewport;
      emit('update:viewport', {
        zoom: zoom * zoomFactor,
        x: x + (x - offsetX) * translateFactor,
        y: y + (y - offsetY) * translateFactor,
      });
    };


    const transform = computed(() => {
      const {zoom, x, y} = props.viewport;
      return `translate(${x}, ${y}) scale(${zoom})`;
    });

    return {
      'external-svg-container': externalSvgContainer,

      onMouseUp,

      startPanning,
      stopPanning,
      pan,
      zoom,
      transform,
    };
  },
}
</script>

<style scoped>
.svg-manipulator {
  box-shadow: inset 0 0 0.5em rgba(0, 0, 0, 0.5);
}
</style>
