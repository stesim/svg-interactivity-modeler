<template>
  <svg-manipulator class="manipulator" :svgNode="svg" @element-click="onElementClicked">
    <svg-element-stroke-highlight
      v-for="element in markedElements"
      :key="getSvgElementKey(element)"
      :originalElement="element"
      />
  </svg-manipulator>
</template>

<script>
import { inject } from 'vue';
import SvgElementStrokeHighlight from './SvgElementStrokeHighlight.vue'
import SvgManipulator from './SvgManipulator.vue'

export default {
  components: {
    SvgElementStrokeHighlight,
    SvgManipulator,
  },

  props: {
    svg: SVGSVGElement,
    markedElements: Array,
  },

  setup(props, {emit}) {
    const SELECTABLE_ELEMENTS = ['path', 'circle', 'ellipse', 'rect', 'image'];
    const onElementClicked = (element) => {
      if (!SELECTABLE_ELEMENTS.includes(element.tagName)) {
        return;
      }
      if (props.markedElements.includes(element)) {
        emit('unmark-element', element);
      } else {
        emit('mark-element', element);
      }
    };

    return {
      getSvgElementKey: inject('getSvgElementKey'),

      onElementClicked,
    };
  }
}
</script>

<style scoped>
.manipulator {
  width: 100%;
  height: 100%;
}
</style>
