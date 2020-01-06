import go from 'gojs'
import { VALUE_FOR_NODES } from './dataDefault'
import { Selection } from './Selection'
import Node from './Node'

export default class Nodes {
  constructor (width, height, options = {}) {
    const { borderColor, columnColor, fontSize, fontFamily, rowsNumber } = { ...VALUE_FOR_NODES, ...options }

    const _ = this._ = go.GraphObject.make

    const item1From5Width = Math.floor(width / 5)
    const WidthOne = Math.floor(width / 5) - 7
    const widthSelectNode = 5 * WidthOne + 10

    const itemHeight = Math.floor(height / 6)
    const selectionHeight = (itemHeight + 1) * rowsNumber + itemHeight / 5 + 5 + 15

    const textOptions = {
      textAlign: 'center',
      isMultiline: false,
      editable: true,
      width: 0,
      stroke: borderColor,
      font: fontSize + fontFamily
    }
    const optionsNode = {
      ...VALUE_FOR_NODES,
      item1From5Width,
      WidthOne,
      widthSelectNode,
      itemHeight,
      fill: columnColor,
      stroke: null,
      textOptions: { ...textOptions }
    }

    const s = new Selection(_, width, selectionHeight, { ...optionsNode })
    const selection = s.exec()

    const group1 = new Node('categoryOne', _, width, height, { ...optionsNode }, selection)
    this.nodeGroup1 = group1.exec()

    const group11 = new Node('categoryOneNotFull', _, width, height, {...optionsNode}, selection)
    this.nodeGroup1Emp = group11.exec()

    const group2 = new Node('categoryTwo', _, width, height, { ...optionsNode }, selection)
    this.nodeGroup2 = group2.exec()

    const groupOptim = new Node('categoryOptim', _, width, height, { ...optionsNode }, selection)
    this.nodeGroupOptim = groupOptim.exec()
  }
}
