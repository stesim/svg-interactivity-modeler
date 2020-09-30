<template>
  <div class="main">
    <list-box class="left-panel">
      <file-upload-button accept=".svg" @change="onFileSelected" />

      <h1>Available Elements</h1>
      <select class="element-list" size="10" v-model="selectedElementIndex" @keyup.enter="onElementAccepted" :disabled="playbackInterval">
        <option class="element-item" v-for="(element, index) in elements" :key="index" :value="index">
          {{displayName(element, index)}}
        </option>
      </select>

      <h1>Element Order</h1>
      <select class="element-list" size="10" v-model="selectedElementIndex" :disabled="playbackInterval">
        <option class="element-item" v-for="(elementId, index) in elementOrder" :key="index" :value="elementId">
          {{orderedDisplayName(elements[elementId], index)}}
        </option>
      </select>

      <button @click="togglePlayback">{{!playbackInterval ? 'Play' : 'Stop'}}</button>
    </list-box>
    <div ref="svgContainer" class="canvas"></div>
  </div>
</template>

<script>
import ListBox from './ListBox.vue'
import FileUploadButton from './FileUploadButton.vue'

export default {
  name: 'MainComponent',

  components: {
    ListBox,
    FileUploadButton,
  },

  props: {
  },

  data: () => ({
    svg: null,
    selectedElementIndex: null,
    selectionPreview: null,
    elementOrder: [],
    playbackInterval: null,
  }),

  watch: {
    svg(value, previous) {
      this.reset();
      if (previous) {
        previous.remove();
      }
      this.$refs.svgContainer.appendChild(value);
      this.$refs.svgContainer.style.backgroundColor = value.style.backgroundColor;
    },

    selectedElement(value) {
      this.selectionPreview = value.cloneNode();
      this.selectionPreview.style.strokeWidth = 4 * (this.selectionPreview.style.strokeWidth || 1);
    },

    selectionPreview(value, previous) {
      if (previous) {
        previous.remove();
      }
      this.svg.appendChild(value);
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

    selectedElement() {
      return this.elements[this.selectedElementIndex];
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

    onElementAccepted(evt) {
      this.elementOrder.push(evt.target.value);
    },

    displayName(element, index) {
      return `${element.tagName} [${index}]`;
    },

    orderedDisplayName(element, position) {
      return `${position + 1}.) ${this.displayName(element, this.elements.indexOf(element))}`;
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
            this.selectedElementIndex = this.elementOrder[i];
            ++i;
          } else {
            cancel();
          }
        }, 1000);
      }
    },

    reset() {
      this.selectedElementIndex = null;
      this.selectionPreview = null;
      this.elementOrder = [];
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    },
  },
}
</script>

<style scoped>
.main {
  display: grid;
  grid-template-columns: 20em 1fr;
  grid-template-rows: 100vh;
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
  font-size: 125%;
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
  justify-content: center;
  align-items: center;
}
</style>
