import go from 'gojs'
import { NODE, VALUE_FOR_DRAWER } from './dataDefault'

export class Selection {
  constructor (_, width, height, options) {
    this._ = _
    this.width = width
    this.height = height
    this.options = options
  }

  makeButton (source, actions = {}) {
    return this._('Button',
      { ...actions, margin: new go.Margin(0, -15, 0, 0), isClipping: true },
      this._(go.Picture, { source, desiredSize: new go.Size(50, 50) }, new go.Binding('desiredSize', 'sizeBtnIcon'))
    )
  }

  exec () {
    return {
      selectionAdornmentTemplate: this._(go.Adornment, 'Auto',
        this._(go.Panel, 'Vertical',
          this._(go.Panel, 'Horizontal',
            { alignment: go.Spot.TopRight, alignmentFocus: go.Spot.Center, margin: new go.Margin(0, 30, 5, 0) },
            this.makeButton('src/img/icons/1.png', { click: this.visibleLabels.bind(this) }),
            this.makeButton('src/img/icons/2.png', { click: this.deleteNode.bind(this) }),
            this.makeButton('src/img/icons/5.png', { click: this.bringToFont.bind(this) }),
            this.makeButton('src/img/icons/4.png', { click: this.sendToBack.bind(this) }),
            this.makeButton('src/img/icons/6.png', { click: this.drawLink.bind(this), actionMove: this.drawLink.bind(this) }),
            this.makeButton('src/img/icons/7.png', { click: this.clickNewNode.bind(this), actionMove: this.dragNewNode.bind(this), _dragData: { zOrder: 0 } }),
            new go.Binding('margin', 'mrgnSelectHoriz')),
          this._(go.Panel, 'Auto',
            this._(go.Shape, { fill: 'transparent', stroke: 'transparent', width: this.width, height: this.height }),

            this._(go.Panel, 'Horizontal',
              { margin: new go.Margin(0, 40, 55, 0), alignment: go.Spot.BottomRight },
              this._('Button',
                {
                  alignment: go.Spot.Bottom,
                  isClipping: true
                },
                this._(go.Picture, {
                  source: 'src/img/icons/11.png',
                  desiredSize: new go.Size(30, 48),
                  margin: 0
                }, new go.Binding('desiredSize', 'sizeBtnNote'))
              ),

              this._(go.Panel, 'Vertical',
                // this._(go.Panel, 'Spot', { margin: new go.Margin(0, 0, -6, 0), visible: true, alignment: go.Spot.Center },
                //   this._(go.Shape, 'Circle', {
                //     fill: 'red',
                //     width: 20,
                //     height: 20,
                //     strokeWidth: this.options.strokeWidth,
                //     stroke: this.options.strokeColor
                //   },
                //     new go.Binding('width', 'widthCircle'),
                //     new go.Binding('height', 'heightCircle')
                //   ),
                //   this._(go.TextBlock, {
                //     text: '1',
                //     stroke: 'white',
                //     font: this.options.fontSize + this.options.fontFamily
                //   },
                //     new go.Binding('text', 'amountFiles'),
                //     new go.Binding('font', 'fontAmountNote').makeTwoWay()
                //   ),
                //   new go.Binding('visible', 'isAmountFiles').makeTwoWay()
                // ),
                this._('Button',
                  {
                    isClipping: true
                  },
                  this._(go.Picture, {
                    source: 'src/img/icons/12.png',
                    desiredSize: new go.Size(20, 48)
                  }, new go.Binding('desiredSize', 'sizeBtnFile'))
                )
              )
            )
          )
        ), this._(go.Placeholder)
      )
    }
  }

  createNodeAndLink (data, fromnode) {
    const diagram = fromnode.diagram
    const model = diagram.model
    let nodedata = {}
    const {
      srcBackgroundRed,
      srcBackgroundBlue,
      srcBackgroundGreen,
      srcBackgroundYellow,
      srcBackgroundSmoke
    } = { ...VALUE_FOR_DRAWER }

    const properties = {}

    switch (fromnode.data.source) {
      case srcBackgroundRed: {
        nodedata = { ...NODE }
        break
      }
      case srcBackgroundBlue: {
        nodedata = { ...NODE }
        break
      }
      case srcBackgroundGreen: {
        nodedata = { ...NODE }
        break
      }
      case srcBackgroundYellow: {
        nodedata = { ...NODE }
        break
      }
      case srcBackgroundSmoke: {
        nodedata = { ...NODE }
        break
      }
      default: {
        break
      }
    }

    // if (fromnode.data.category === 'groupe2') {
    //   nodedata = { ...NODE }
    // } else {
    //   nodedata = { ...NODE }

    // }

    model.addNodeData(nodedata)
    properties.key = Math.random() * 100000000
    properties.source = fromnode.data.source
    properties.category = fromnode.data.category

    for (const prop in properties) {
      model.setDataProperty(nodedata, prop, properties[prop])
    }

    const newnode = diagram.findNodeForData(nodedata)

    const linkdata = model.copyLinkData({})
    model.setFromKeyForLinkData(linkdata, model.getKeyForNodeData(fromnode.data))
    model.setToKeyForLinkData(linkdata, model.getKeyForNodeData(newnode.data))
    model.addLinkData(linkdata)
    diagram.select(newnode)
    newnode.position = new go.Point(fromnode.position.x + 50, fromnode.position.y + 50)

    return newnode
  }

  drawLink (e, button) {
    const node = button.part.adornedPart
    const tool = e.diagram.toolManager.linkingTool
    tool.startObject = node.port
    e.diagram.currentTool = tool
    tool.doActivate()
  }

  clickNewNode (e, button) {
    if (!button._dragData) return
    e.diagram.startTransaction('Create Node and Link')
    const fromnode = button.part.adornedPart
    // const newnode = this.createNodeAndLink(button._dragData, fromnode)
    this.createNodeAndLink(button._dragData, fromnode)
    e.diagram.commitTransaction('Create Node and Link')
  }

  dragNewNode (e, button) {
    const tool = e.diagram.toolManager.draggingTool
    if (tool.isBeyondDragSize()) {
      const data = button._dragData
      if (!data) return
      e.diagram.startTransaction('button drag')
      const newnode = this.createNodeAndLink(data, button.part.adornedPart)
      newnode.position = e.diagram.lastInput.documentPoint
      tool.currentPart = newnode
      e.diagram.currentTool = tool
      tool.doActivate()
    }
  }

  deleteNode (e, button) {
    // const key = button.part.adornedPart.data.key
    // const data = [{ key: key, part: 'NodeAndGroup' }]

    // vueStore.state.drawer.fire('SELECTION_DELETING', data)

    e.diagram.remove(button.part.adornedPart)
  }

  bringToFont (e, button) {
    // this.changeZOrder(e.diagram, button.part.adornedPart, vueStore.state.drawer.zorderFromNode('max'))
  }

  sendToBack (e, button) {
    // this.changeZOrder(e.diagram, button.part.adornedPart, vueStore.state.drawer.zorderFromNode('min'))
  }

  changeZOrder (diagram, obj, value = 0) {
    diagram.startTransaction('modified zOrder')
    diagram.model.setDataProperty(obj.data, 'zOrder', value)
    diagram.commitTransaction('modified zOrder')

    // vueStore.state.drawer.fire('CHANGE_LAYOUT', { key: obj.data.key, Zorder: value })
  }

  showNotes () {
    // state.show.notesShow = true
    // state.show.settingShow = false
    // state.show.filesShow = false
  }

  showFiles () {
    // state.show.filesShow = true
    // state.show.notesShow = false
    // state.show.settingShow = false
  }

  visibleLabels (e, button) {
    const datanode = button.part.adornedPart.data
    const model = e.diagram.model

    console.log(datanode.visibleLbl)
    model.setDataProperty(datanode, 'visibleLbl', !datanode.visibleLbl)
  }

}

