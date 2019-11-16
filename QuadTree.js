import vec2 from './vec2.js';
import Utils from './Utils.js';

class Node {
  get isLeaf() { return this.nodes == null; }

  constructor(parent, width, height, pos, depth) {
    this.nodes = null;
    this.objects = [];
    this.width = width;
    this.height = height;
    this.pos = pos;
    this.depth = depth;
    this.parent = parent;
  }

  contains(pos) {
    return Utils.rectContains(this.pos, this.pos.add(this.width, this.height), pos);
  }

  forEach(callback) {
    if (this.isLeaf) {
      this.objects.forEach(object => callback(object, this));
      return;
    }
    this.nodes.forEach(node => {
      if (node != null) {
        node.forEach(callback);
      }
    });
  }

  initNodes(minSize) {
    let dimensionToSplit = this.depth % 2;
    // 0 -> x, 1 -> y
    if ((dimensionToSplit === 0 && this.width / 2 < minSize)
    || (dimensionToSplit === 1 && this.height / 2 < minSize)) {
      return;
    }
    let newWidth  = dimensionToSplit === 0 ? this.width / 2 : this.width;
    let newHeight = dimensionToSplit === 1 ? this.height / 2 : this.height;
    let splitPos = dimensionToSplit === 0
      ? this.pos.add(newWidth, 0)
      : this.pos.add(0, newHeight)
    ;
    this.nodes = [
      new Node(this, newWidth, newHeight, this.pos.clone(), this.depth + 1),
      new Node(this, newWidth, newHeight, splitPos, this.depth + 1)
    ];
    this.nodes.forEach(node => node.initNodes(minSize));
  }

  addObject(object) {
    if (this.isLeaf) {
      this.objects.push(object);
      return;
    }

    let nodeFound = false;

    for (let node of this.nodes) {
      if (node.contains(object.pos)) {
        node.addObject(object);
        nodeFound = true;
        break;
      }
    }

    if (!nodeFound) {
      console.error("Quadtree doesnt contain position: ", object.pos, this);
    }
  }

  backtrackingRemove(object, callees) {
    if (this.isLeaf) {
      let index = this.objects.indexOf(object);
      if (index === -1) {
        return false;
      }
      this.objects.splice(index, 1);
      return true;
    }
    for(let node of this.nodes) {
      if (callees.includes(node)) {
        continue;
      }
      if (node.backtrackingRemove(object, callees.concat(this))) {
        return true;
      }
    }
    return this.parent.backtrackingRemove(object, callees.concat(this));
  }

  removeObject(object) {
    if (this.isLeaf) {
      let index = this.objects.indexOf(object);
      if (index === -1) {
        return this.parent.backtrackingRemove(object, [this]);
      }
      this.objects.splice(index, 1);
      return true;
    }
    for (let node of this.nodes) {
      if (node.contains(object.pos)) {
        node.removeObject(object);
      }
    }
  }

  getNode(object, notIncluded) {
    if (this.isLeaf) {
      if (!notIncluded && !this.objects.includes(object)) {
        console.warn("Object is not in quadtree", object, this);
      }
      return this;
    }
    for (let node of this.nodes) {
      if (node.contains(object.pos)) {
        return node.getNode(object, notIncluded);
      }
    }
    console.error("Quadtree doesnt contain position: ", object.pos);
  }
}

export default class QuadTree {
  constructor(minSize, width, height) {
    this.minSize = minSize;
    this.width = width;
    this.height = height;
    this.initTree();
  }

  initTree() {
    this.root = new Node(null, this.width, this.height, new vec2(0,0), 0);
    this.root.initNodes(this.minSize);
  }

  forEach(callback) {
    this.root.forEach(callback);
  }

  addObject(object) {
    this.root.addObject(object);
  }

  removeObject(object) {
    this.root.removeObject(object);
  }

  findNodeOfObject(object, notIncluded) {
    return this.root.getNode(object, notIncluded);
  }

  updateObject(object) {
    this.removeObject(object);
    this.addObject(object);
  }

  getObjectsNearby(object, notIncluded) {
    let node = this.findNodeOfObject(object, notIncluded);
    if (node == null || node.parent == null || node.parent.parent == null) {
      console.error("Cannot get objects in near space due to quadtree error.");
      console.error("No node, parent nor greatparent found of object node", object, this);
      return [];
    }
    let greatParent = node.parent.parent;
    let objectList = [];
    greatParent.forEach(object => {
      objectList.push(object);
    });
    return objectList;
  }
};
