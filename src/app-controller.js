const { reactive, readonly, watch } = require('vue');

export default class AppController {
  constructor() {
    this._state = reactive({
      diagram: null,

      nodeElements: [],
      connectorElements: [],
      nodeAssociations: [],
      sequences: [],
    });
    this._readOnlyState = readonly(this._state);

    this._elementToIdMap = new Map();
    this._elementIdCounter = 0;
    watch(() => this._state.diagram, () => {
      this._state.nodeElements.splice(0);
      this._state.connectorElements.splice(0);
      this._state.nodeAssociations.splice(0);
      this._state.sequences.splice(0);

      this._elementToIdMap.clear();
      this._elementIdCounter = 0;
    });
  }

  get state() {
    return this._readOnlyState;
  }

  get diagram() {
    return this._state.diagram;
  }

  set diagram(value) {
    this._state.diagram = value;
  }

  getElementId(element) {
    let id = this._elementToIdMap.get(element);
    if (id === undefined) {
      id = this._elementIdCounter++;
      this._elementToIdMap.set(element, id);
    }
    return id;
  }

  markNode(element) {
    if (!this._state.nodeElements.includes(element)) {
      this._state.nodeElements.push(element);
    } else {
      throw new Error('element is already a node');
    }
  }

  unmarkNode(element) {
    if (this._state.nodeElements.includes(element)) {
      this._state.nodeElements.splice(
        this._state.nodeElements.indexOf(element),
        1);
    } else {
      throw new Error('element is not a node');
    }
  }

  isNode(element) {
    return this._state.nodeElements.includes(element);
  }

  markConnector(element) {
    if (!this._state.connectorElements.includes(element)) {
      this._state.connectorElements.push(element);
    } else {
      throw new Error('element is already a connector');
    }
  }

  unmarkConnector(element) {
    if (this._state.connectorElements.includes(element)) {
      this._state.connectorElements.splice(
        this._state.connectorElements.indexOf(element),
        1);
    } else {
      throw new Error('element is not a connector');
    }
  }

  isConnector(element) {
    return this._state.connectorElements.includes(element);
  }

  addNodeAssociation(connection) {
    if (connection.length < 3) {
      throw new Error('node association must span at least start and end node and a connector');
    }
    if (!this.isNode(connection[0]) ||
        !this.isNode(connection[connection.length - 1])) {
      throw new Error('first and last element of association must be nodes');
    }
    if (connection.slice(1, -1).some((element) => !this.isConnector(element))) {
      throw new Error('all but first and last element of association must be connectors');
    }
    this._state.nodeAssociations.push([...connection]);
  }

  getNodeAssociation(from, to) {
    return this._state.nodeAssociations.find(
      (connection) => (connection[0] === from && connection[connection.length - 1] === to));
  }

  addSequence(sequence) {
    if (!this.isNode(sequence[0]) ||
        !this.isNode(sequence[sequence.length - 1])) {
      throw new Error('first and last element of sequence must be nodes');
    }
    // TODO: check for consecutive nodes
    this._state.sequences.push([...sequence]);
  }
}
