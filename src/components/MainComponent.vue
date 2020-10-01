<template>
  <div class="main" @keydown.c.exact="setMode(SelectionMode.connect)" @keyup.s.exact="setMode(SelectionMode.select)">
    <list-box class="left-panel">
      <file-upload-button accept=".svg" @change="onFileSelected" />

      <h1>Available Elements</h1>
      <select class="element-list" multiple size="10" v-model="selectedElementIndices" @keyup.enter="onElementAccepted" :disabled="playbackInterval">
        <option class="element-item" v-for="(element, index) in elements" :key="index" :value="index">
          {{displayName(element, index)}}
        </option>
      </select>

      <h1>Sequence</h1>
      <select class="element-list" multiple size="10" v-model="selectedElementIndices" :disabled="playbackInterval">
        <option class="element-item" v-for="(elementId, index) in elementOrder" :key="index" :value="elementId">
          {{orderedDisplayName(elements[elementId], index)}}
        </option>
      </select>

      <label>Tick interval (ms) <input type="number" min="100" v-model="tickInterval" :disabled="playbackInterval" /></label>
      <button @click="togglePlayback">{{!playbackInterval ? 'Play' : 'Stop'}}</button>
    </list-box>
    <div ref="svgContainer" class="canvas" @keyup.enter="onElementAccepted" @mouseup="onElementClick" tabindex="0"></div>
    <div class="status-bar">
      <span>{{selectionMode}}</span>
    </div>
  </div>
</template>

<script>
import ListBox from './ListBox.vue'
import FileUploadButton from './FileUploadButton.vue'

const SelectionMode = Object.freeze({
  select: 'SELECT',
  connect: 'CONNECT',
  target: 'TARGET',
});

export default {
  name: 'MainComponent',

  components: {
    ListBox,
    FileUploadButton,
  },

  props: {
  },

  data() { return {
    SelectionMode,

    svg: null,
    selectedElementIndices: [],
    elementOrder: [],
    tickInterval: 500,
    playbackInterval: null,
    selectionMode: SelectionMode.select,

    onElementClick: (evt) => {
      const target = evt.target.original || evt.target;
      const targetIndex = this.elements.indexOf(target);
      if (!evt.ctrlKey) {
        this.selectedElementIndices = (targetIndex >= 0 ? [targetIndex] : []);
      } else if (targetIndex >= 0) {
        if (this.selectedElementIndices.includes(targetIndex)) {
          this.selectedElementIndices = this.selectedElementIndices.filter((index) => index !== targetIndex);
        } else {
          this.selectedElementIndices = [...this.selectedElementIndices, targetIndex];
        }
      }
    },
  }},

  watch: {
    svg(value, previous) {
      this.reset();
      if (previous) {
        previous.remove();
      }
      if (value) {
        value.style.margin = 'auto';
        this.$refs.svgContainer.appendChild(value);
        this.$refs.svgContainer.style.backgroundColor = value.style.backgroundColor;
      }
    },

    selectedElementPreviews(value, previous) {
      previous.forEach((preview) => preview.replaceWith(preview.original));
      value.forEach((preview) => preview.original.replaceWith(preview));
    },
  },

  computed: {
    elements() {
      const elementTypes = ['path', 'circle', 'ellipse', 'rect', 'image'];
      return (this.svg
        ? [...this.svg.querySelectorAll('*')].filter(
            (element) => elementTypes.includes(element.tagName))
        : []);
    },

    selectedElements() {
      return this.selectedElementIndices.map((index) => this.elements[index]);
    },

    selectedElementPreviews() {
      return this.selectedElements.map((element) => this.createPreview(element));
    },
  },

  methods: {
    onFileSelected(evt) {
      const {files} = evt.target;
      files[0].text().then((svgString) => {
        const svg = new DOMParser().parseFromString(svgString, 'image/svg+xml');
        this.svg = svg.rootElement;
      });
    },

    onElementAccepted() {
      this.elementOrder.push(...this.selectedElementIndices);
    },

    displayName(element, index) {
      return `${element.tagName} [${index}]`;
    },

    orderedDisplayName(element, position) {
      return `${position + 1}.) ${this.displayName(element, this.elements.indexOf(element))}`;
    },

    createPreview(element) {
      const preview = element.cloneNode()
      preview.original = element;

      if (preview.getAttribute('stroke-width') !== null) {
        preview.setAttribute(
          'stroke-width',
          +preview.getAttribute('stroke-width') + 5);
      } else if (preview.style.strokeWidth !== undefined) {
        preview.style.strokeWidth += 5;
      } else {
        preview.strokeWidth = 5;
      }

      const stroke = preview.getAttribute('stroke') || preview.style.stroke;
      if (!stroke || stroke === 'none') {
        preview.setAttribute('stroke', 'black');
      }

      return preview;
    },

    setMode(mode) {
      this.selectionMode = mode;
    },

    togglePlayback() {
      const cancel = () => {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      };
      if (this.playbackInterval) {
        cancel();
      } else {
        let i = 0;
        this.playbackInterval = setInterval(() => {
          if (i < this.elementOrder.length) {
            this.selectedElementIndices = [this.elementOrder[i]];
            ++i;
          } else {
            cancel();
          }
        }, this.tickInterval);
      }
    },

    reset() {
      this.selectedElementIndices = [];
      this.elementOrder = [];
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    },
  },
}
</script>

<style scoped>
.main {
  height: 100vh;
  display: grid;
  grid-template-columns: 20em 1fr;
  grid-template-rows: 1fr 2em;
}

.left-panel {
  background-color: #023;
  align-items: stretch;
}

.left-panel > input {
  align-self: center;
  margin: 1em;
}

.left-panel h1 {
  font-size: 112.5%;
  text-align: center;
  background-color: #012;
  margin: 0.25em 0;
  padding: 0.25em 0;
}

.element-list, .element-list:focus {
  appearance: none;
  margin: 0.5em;
  padding: 0.5em;
  background-color: #012;
  overflow: auto;
  color: inherit;
}

.element-item {
  padding: 0.25em;
}

.canvas {
  overflow: auto;
  display: flex;
  box-shadow: inset 0 0 0.5em rgba(0, 0, 0, 0.5);
}

.status-bar {
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  padding: 0.5em;
}
</style>
