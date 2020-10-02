<template>
  <div class="main" @keyup.esc.exact="setMode(Mode.SELECT)" @keydown.n.exact="setMode(Mode.NODES)" @keydown.c.exact="setMode(Mode.CONNECTORS)" @keydown.a.exact="setMode(Mode.ASSOCIATE)" @keydown.s.exact="setMode(Mode.SEQUENCE)">
    <div class="left-panel">
      <input type="file" accept=".svg" @change="onFileSelected" />

      <h1>Nodes</h1>
      <select class="element-list" multiple size="6" v-model="selectedElementIndices" :disabled="playbackInterval">
        <option class="element-item" v-for="index in nodeElementIndices" :key="index" :value="index">
          {{elementDisplayName(elements[index], index)}}
        </option>
      </select>

      <h1>Connections</h1>
      <select class="element-list" multiple size="6" v-model="selectedElementIndices" :disabled="playbackInterval">
        <option class="element-item" v-for="index in connectorElementIndices" :key="index" :value="index">
          {{elementDisplayName(elements[index], index)}}
        </option>
      </select>

      <h1>Associations</h1>
      <select class="element-list" size="6" :disabled="playbackInterval" @change="selectAssociation(elementAssociations[$event.target.value])">
        <option class="element-item" v-for="(association, index) in elementAssociations" :key="index" :value="index">
          {{associationDisplayName(association)}}
        </option>
      </select>

      <label>Tick interval (ms) <input type="number" min="100" v-model="tickInterval" :disabled="playbackInterval" /></label>
      <button @click="togglePlayback">{{!playbackInterval ? 'Play' : 'Stop'}}</button>
    </div>
    <div ref="svgContainer" class="canvas" @keyup.enter="onElementAccepted" @mouseup="onElementClick" tabindex="0"></div>
    <div class="status-bar">
      <div class="status-label">{{sequenceDisplayName(sequenceSelectionIndices)}}</div>
      <div>
        <label v-for="mode in Mode" :key="mode" :class="{'mode-button': true, selected: currentMode === mode}">
          <input type="radio" :value="mode" v-model="currentMode" class="hidden" />{{mode}}
        </label>
      </div>
    </div>
  </div>
</template>

<script>
const Mode = Object.freeze({
  SELECT: 'SELECT',
  NODES: 'NODES',
  CONNECTORS: 'CONNECTORS',
  ASSOCIATE: 'ASSOCIATE',
  SEQUENCE: 'SEQUENCE',
});

function toggleInArray(array, value) {
  return (array.includes(value)
    ? array.filter((element) => element !== value)
    : [...array, value]);
}

export default {
  name: 'MainComponent',

  components: {
  },

  props: {
  },

  data() { return {
    Mode,

    svg: null,
    tickInterval: 500,
    playbackInterval: null,
    currentMode: Mode.SELECT,

    selectedElementIndices: [],
    nodeElementIndices: [],
    connectorElementIndices: [],
    associationSelectionIndices: [],
    elementAssociations: [],
    sequenceSelectionIndices: [],
    sequences: [],
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

    highlightElements(value, previous) {
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

    highlightedElementIndices() {
      if (this.currentMode === Mode.SELECT) {
        return this.selectedElementIndices;
      } else if (this.currentMode === Mode.NODES) {
        return this.nodeElementIndices;
      } else if (this.currentMode === Mode.CONNECTORS) {
        return this.connectorElementIndices;
      } else if (this.currentMode === Mode.ASSOCIATE) {
        return this.associationSelectionIndices;
      } else if (this.currentMode === Mode.SEQUENCE) {
        return this.sequenceSelectionIndices;
      } else {
        return undefined;
      }
    },

    highlightedElements() {
      return this.highlightedElementIndices.map((index) => this.elements[index]);
    },

    highlightElements() {
      return this.highlightedElements.map((element) => this.createPreview(element));
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

    onElementClick(evt) {
      const target = evt.target.original || evt.target;
      const targetIndex = this.elements.indexOf(target);
      if (this.currentMode === Mode.SELECT) {
        if (!evt.ctrlKey) {
          this.selectedElementIndices = (targetIndex >= 0 ? [targetIndex] : []);
        } else if (targetIndex >= 0) {
          this.selectedElementIndices = toggleInArray(this.selectedElementIndices, targetIndex);
        }
      } else if (targetIndex >= 0) {
        if (this.currentMode === Mode.NODES) {
          this.nodeElementIndices = toggleInArray(this.nodeElementIndices, targetIndex);
        } else if (this.currentMode === Mode.CONNECTORS) {
          this.connectorElementIndices = toggleInArray(this.connectorElementIndices, targetIndex);
        } else if (this.currentMode === Mode.ASSOCIATE) {
          if (this.associationSelectionIndices.length === 0) {
            if (this.isNode(targetIndex)) {
              this.associationSelectionIndices = [targetIndex];
            }
          } else if (targetIndex !== this.associationSelectionIndices[0]) {
            if (this.isConnector(targetIndex)) {
              this.associationSelectionIndices = toggleInArray(this.associationSelectionIndices, targetIndex);
            } else if (this.isNode(targetIndex)) {
              if (this.associationSelectionIndices.length > 1) {
                this.associationSelectionIndices.push(targetIndex);
                this.elementAssociations = [
                  ...this.elementAssociations,
                  this.associationSelectionIndices];
                this.associationSelectionIndices =
                  [this.associationSelectionIndices[this.associationSelectionIndices.length - 1]];
              } else {
                this.associationSelectionIndices = [targetIndex];
              }
            }
          } else {
            this.associationSelectionIndices = [];
          }
        } else if (this.currentMode === Mode.SEQUENCE) {
          if (this.sequenceSelectionIndices.length === 0) {
            if (this.elementAssociations.some(([start]) => start === targetIndex)) {
              this.sequenceSelectionIndices = [targetIndex];
            }
          } else if (!this.sequenceSelectionIndices.includes(targetIndex)) {
            const previousElement = this.sequenceSelectionIndices[this.sequenceSelectionIndices.length - 1];
            const association = this.elementAssociations.find(
              (association) => (association[0] === previousElement && association[association.length - 1] === targetIndex));
            if (association) {
              this.sequenceSelectionIndices = [...this.sequenceSelectionIndices, ...association.slice(1)];
            }
          } else {
            const currentIndex = this.sequenceSelectionIndices.indexOf(targetIndex);
            for (let i = currentIndex - 1; i >= 0; --i) {
              if (this.isNode(this.sequenceSelectionIndices[i])) {
                this.sequenceSelectionIndices = this.sequenceSelectionIndices.slice(0, i + 1);
                return;
              }
            }
            this.sequenceSelectionIndices = [];
          }
        }
      }
    },

    onElementAccepted() {
      // ?
    },

    isNode(elementIndex) {
      return this.nodeElementIndices.includes(elementIndex);
    },

    isConnector(elementIndex) {
      return this.connectorElementIndices.includes(elementIndex);
    },

    elementDisplayName(element, index) {
      return `${element.tagName} [${index}]`;
    },

    elementDisplayNameByIndex(index) {
      return this.elementDisplayName(this.elements[index], index);
    },

    associationDisplayName(association) {
      return this.sequenceDisplayName(association);
    },

    sequenceDisplayName(sequence) {
      return sequence
        .filter((element) => this.isNode(element))
        .map((element) => this.elementDisplayNameByIndex(element))
        .join(' → ');
    },

    selectAssociation(association) {
      this.selectedElementIndices = association;
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
      this.currentMode = mode;
    },

    togglePlayback() {
      if (this.currentMode !== Mode.SELECT) {
        this.currentMode = Mode.SELECT;
      }

      const cancel = () => {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      };
      if (this.playbackInterval) {
        cancel();
      } else {
        let i = 0;
        this.playbackInterval = setInterval(() => {
          if (i < this.sequenceSelectionIndices.length) {
            this.selectedElementIndices = [this.sequenceSelectionIndices[i]];
            ++i;
          } else {
            cancel();
          }
        }, this.tickInterval);
      }
    },

    reset() {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
      this.currentMode = Mode.SELECT;

      this.selectedElementIndices = [];
      this.nodeElementIndices = [];
      this.connectorElementIndices = [];
      this.associationSelectionIndices = [];
      this.elementAssociations = [];
      this.sequenceSelectionIndices = [];
      this.sequences = [];
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
  display: flex;
  flex-direction: column;
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
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 0.5em;
}

.status-label {
  overflow: hidden;
  height: 100%;
  color: #bbb;
  font-size: 0.875em;
}

.hidden {
  display: none;
}

.mode-button {
  margin: 0 0.125em;
  padding: 0.25em;
  cursor: pointer;
}

.mode-button.selected {
  color: aqua;
  box-shadow: inset 0 0 0.25em #000;
  border-radius: 0.25em;
  background-color: rgba(0, 0, 0, 0.125);
}
</style>
