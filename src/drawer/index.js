import go from 'gojs'
import Nodes from './Nodes'
import {NODE, VALUE_FOR_DRAWER, VALUE_FOR_NODES, NODE_DATA_ARRAY, LINK_DATA_ARRAY} from './dataDefault'
import {lineVert, lineHoriz} from './Line'

const pick = (o, fields) => {
  return fields.reduce((obj, x) => {
    if (o.hasOwnProperty(x)) obj[x] = o[x]
    return obj
  }, {})
}

const FileSaver = require('file-saver')

export default class Drawer {
  on (name, callback, scope = this) {
    this.events[name] = this.events[name] || []
    this.events[name].push({ scope, callback })
  }

  off (scope, name) {
    this.events[name] && this.events[name].filter(e => e.scope !== scope)
  }

  fire (name, data) {
    this.events[name] && this.events[name].forEach(e => e.callback.call(e.scope, { data: data, token: this.token }))
  }

  constructor (selector) {
    const self = this
    const {
      redColor,
      greenColor,
      blueColor,
      yellowColor,
      smokeColor,
      srcBackgroundRed,
      srcBackgroundBlue,
      srcBackgroundGreen,
      srcBackgroundYellow,
      srcBackgroundSmoke,
      linkColorSelect,
      colorLine,
      menuWidth,
      menuHeight,
      groupOne,
      groupTwo,
      categoryLine,
      token
    } = { ...VALUE_FOR_DRAWER }

    this.token = token
    let posCopyNode = []
    this.tamplate = ''
    this.events = []

    const _ = this._ = go.GraphObject.make
    const stage = this.stage = _(go.Diagram, selector,
      {
        initialContentAlignment: go.Spot.Center,
        initialDocumentSpot: go.Spot.TopCenter,
        initialViewportSpot: go.Spot.TopCenter,
        allowDrop: true,
        initialScale: 0.7,
        // fixedBounds: new go.Rect(100, -100, 5000, 5000),
        'linkingTool.isEnabled': false,
        'linkingTool.direction': go.LinkingTool.ForwardsOnly,
        'grid.visible': true,
        'grid.gridCellSize': new go.Size(40, 40),
        'groupTemplate.ungroupable': true,
        'draggingTool.gridSnapCellSize': new go.Size(20, 20),
        'commandHandler.archetypeGroupData': { text: 'Group', isGroup: true, color: 'blue' },
        'undoManager.isEnabled': true,
        'resizingTool.isGridSnapEnabled': true,
        'clickCreatingTool.archetypeNodeData': {
          key: '1',
          colorLine: colorLine,
          size: 2,
          category: categoryLine,
          'animationManager.isEnabled': false
        }
      })

    // let wholeModel = this.wholeModel = _(go.Model)
    // stage.model = _(go.Model)
    // this.myRemoveTimer = null

    // wholeModel.nodeDataArray = this.load()

    stage.addDiagramListener('ViewportBoundsChanged', (e) => {
      // this.onViewportChanged(e)

      if (this.tamplate !== 'isOptim') {
        if (e.diagram.scale < 0.3) { // change the tamplate Nodes
          this.tamplate = 'isOptim'
          this.tamplateOptim(true)
        }
      }

      if (this.tamplate === 'isOptim') {
        if (e.diagram.scale > 0.3) {  // change the tamplate Nodes
          this.tamplate = ''
          this.tamplateOptim(false)
        }
      }
      // const collectCard = this.findNodesFromDiagram
      // const it = collectCard.iterator
      //
      // while (it.next()) {
      //   const part = it.value
      //   this.changeSizeSelection(part)
      // }
    })

    stage.addDiagramListener('LinkDrawn', (e) => {
      return
      const linkdata = e.subject.data

      self.fire('LINK_DRAWN', { __gohashid: linkdata.__gohashid, from: linkdata.from, to: linkdata.to })
    })

    stage.addDiagramListener('SelectionMoved', (e) => {
      // e.diagram.fixedBounds = this.setFixedBounds()
      return
      const selectObj = self.stage.selection
      const diagram = e.diagram
      const keyAndPos = []
      const Index = { n: 0 }

      e.diagram.animationManager.stopAnimation()

      const bounds = this.setFixedBounds(diagram)       // changed fixedBounds for diagram

      selectObj.each((part) => {
        if (part instanceof go.Node) {
          keyAndPos[Index.n] = {
            position: new go.Point(part.position.x, part.position.y),
            key: part.data.key,
            part: 'Node'
          }
          Index.n++
        }
        if (part instanceof go.Group) {
          const members = part.memberParts
          if (members) {
            this.membersInPodGroup(members, keyAndPos, Index)
          }
          keyAndPos[Index.n] = {
            position: new go.Point(part.position.x, part.position.y),
            key: part.data.key,
            part: 'Group'
          }
          Index.n++
          // rightPointNode = part.position.x + part.naturalBounds.width
        }
        // const scale = diagram.scale
        // const defScale = 0.7
        // const distance = Math.abs(e.diagram.position.x - rightPointNode)
        // const stepDistanceMacro = 100
        // let stepDistanceMicro = 90
        // let lessStepMacro = 0.0015
        // let lessStepMicro = 0.001
        // let defStepMicro = 0.03333333333333333
        // let defStepMacro = 0.035
        // let rightCurtain = 2064
        // let presentStep = defScale
        //
        // for (let i = 0; scale < presentStep; i++) {
        //   presentStep = presentStep - defStepMicro
        //   rightCurtain += stepDistanceMacro + 5 * i
        //   lessStepMacro = lessStepMacro - 0.0001
        //   defStepMicro = defStepMicro - lessStepMacro
        // }
        // if (scale > defScale) {
        //   for (let i = 0; scale > presentStep; i++) {
        //     stepDistanceMicro = stepDistanceMicro - i
        //     presentStep = presentStep + defStepMacro
        //     rightCurtain = rightCurtain - stepDistanceMicro
        //     lessStepMicro = lessStepMicro + 0.001
        //     defStepMacro = defStepMacro + lessStepMicro
        //   }
        // }
        //
        // if (distance > rightCurtain) {
        //   diagram.position.x += Math.abs(distance - rightCurtain)
        // }
      })
      self.fire('SELECTION_MOVED', { data: keyAndPos, bounds: bounds })
    })

    stage.addDiagramListener('SelectionDeleting', (e) => {
      return
      const selectObj = self.stage.selection
      const keyAndPart = []
      let i = 0

      selectObj.each((part) => {
        const isNodeOrGroup = part instanceof go.Node || part instanceof go.Group
        const isLink = part instanceof go.Link

        isNodeOrGroup ? keyAndPart[i] = { key: part.data.key, part: 'NodeAndGroup' }
          : isLink ? keyAndPart[i] = { key: part.data, part: 'Link' } : console.log('This element do not can to move!')

        i++
      })

      self.fire('SELECTION_DELETING', keyAndPart)
    })

    stage.addDiagramListener('SelectionDeleted', (e) => {
      e.diagram.fixedBounds = this.setFixedBounds(this.stage)
    })

    stage.addDiagramListener('SelectionGrouped', (e) => {
      return
      const model = e.diagram.model
      const data = e.subject.part.data
      const memberParts = e.subject.memberParts
      const keyNode = []

      model.setDataProperty(e.subject.part.data, 'zOrder', 0)

      let i = 0
      while (memberParts.next()) {
        const part = memberParts.value

        if (part instanceof go.Node) {
          keyNode[i] = { key: part.data.key, part: 'Node' }
          i++
        }
        if (part instanceof go.Group) {
          keyNode[i] = { key: part.data.key, part: 'Group' }
          i++
        }
      }

      self.fire('SELECTION_GROUP', { data: keyNode, keyGroup: data.key, isGroup: data.group })
    })

    stage.addDiagramListener('SelectionUngrouped', (e) => {
      return
      const model = e.diagram.model
      const selectGroups = e.subject

      selectGroups.each((part) => {
        const nodesData = model.nodeDataArray
        const keyGroup = part.data.key
        const supGroup = part.data.group
        const keyNode = []
        let i = 0

        for (const n in nodesData) {
          if (nodesData[n].group === supGroup) {
            keyNode[i] = { key: nodesData[n].key, group: supGroup }
            i++
          }
        }

        self.fire('SELECTION_UNGROUP', { keyGroup: keyGroup, supGroup: supGroup, keyNode: keyNode })
      })
    })

    stage.addDiagramListener('TextEdited', function (e) {
      const { groupOne, groupOneHalf } = { ...VALUE_FOR_DRAWER }

      const datanode = e.subject.part.data
      const { misText, funText, ID, jurisText, deptText, Position, Resources, ResourcesNotes, SumText, category } = datanode
      const property = { misText, funText, ID, jurisText, deptText, Position, Resources, ResourcesNotes, SumText, category }

      const key = datanode.key

      if (datanode.category === groupOne || datanode.category === groupOneHalf) {
        if (self.setGroupe1NotFull(datanode)) {
          property.category = groupOneHalf
        } else {
          property.category = groupOne
        }
      }

      console.log('TextEdited-------------', datanode.key)
      self.fire('TEXT_EDITED', { data: { key: key, property: property } })
    })

    stage.addDiagramListener('PartCreated', (e) => {
      return
      e.diagram.model.setDataProperty(e.subject.data, 'category', categoryLine)
    })

    stage.addDiagramListener('ChangingSelection', (e) => {
      return
      const select = self.stage.selection

      select.each(part => {
        const { groupOne, groupTwo, groupOneHalf } = { ...VALUE_FOR_DRAWER }
        const category = part.data.category
        const model = e.diagram.model

        self.colorFocusForLink(part, e.diagram.model, { colorLink: 'black', widthLink: 2, fillLink: 'black' })

        if (category === groupOne || category === groupOneHalf || category === groupTwo) {
          if (part.data.files.length) {
            model.setDataProperty(part.data, 'amountFiles', part.data.files.length)
            model.setDataProperty(part.data, 'isAmountFiles', true)
          } else {
            model.setDataProperty(part.data, 'isAmountFiles', false)
          }
        }
      })
    })

    stage.addDiagramListener('ChangedSelection', (e) => {
      return
      const { groupOne, groupTwo, groupOneHalf } = { ...VALUE_FOR_DRAWER }
      const select = self.stage.selection

      // const isNode = (select.first() instanceof go.Node && !(select.first() instanceof go.Group))

      select.each(part => {
        const category = part.data.category
        const model = e.diagram.model
        const isNode = category === groupOne || category === groupOneHalf || category === groupTwo

        self.colorFocusForLink(part, model, { colorLink: linkColorSelect, widthLink: 3, fillLink: linkColorSelect })

        if (isNode) { this.bringToFont() }
      })
    })

    stage.addDiagramListener('ClipboardChanged', (e) => {
      return
      posCopyNode = []
      let i = 0

      e.subject.each((part) => {
        if (part instanceof go.Node && !(part instanceof go.Group)) {
          posCopyNode[i] = new go.Point(part.position.x, part.position.y)
          i++
        }
      })
    })

    stage.addDiagramListener('ExternalObjectsDropped', (e) => {
      e.diagram.fixedBounds = this.setFixedBounds(e.diagram)
      return
      e.subject.each((part) => {
        const { groupOne, groupOneHalf } = { ...VALUE_FOR_DRAWER }
        const datanode = part.data
        let data
        const isCategoryOne = datanode.category === groupOne || datanode.category === groupOneHalf

        isCategoryOne ? data = NODE : data = NODE

        data.key = datanode.key
        data.source = datanode.source

        for (const prop in data) {
          e.diagram.model.setDataProperty(datanode, prop, data[prop])
        }
        console.log('ExternalObjectsDropped')
        const posNewNode = new go.Point(part.position.x, part.position.y)

        this.setFixedBounds(e.diagram)  // changed FixedBounds for diagram
        this.changeSizeSelection(part)

        self.fire('COPY_NODE', { data: data, position: posNewNode })
      })
    })

    stage.addDiagramListener('ClipboardPasted', (e) => {
      e.diagram.fixedBounds = this.setFixedBounds()
      return
      const sel = e.subject
      let iGr = -1
      let iNode = -1
      let iLink = -1
      const groups = []
      const nodes = []
      const links = []

      sel.each((part) => {
        if (part instanceof go.Group) {
          iGr++
          groups[iGr] = { key: part.data.key, isGroup: true, group: part.data.group }
        }

        if (part instanceof go.Node && !(part instanceof go.Group)) {
          iNode++

          const selectpart = part
          selectpart.position = posCopyNode[iNode]
          self.positionCopyNode(selectpart)

          const { key, group, zOrder, color, misText, funText, ID, jurisText, deptText, Position, Resources, ResourcesNotes, SumText, category, source, files, messages } = selectpart.data
          const m = { key, group, zOrder, color, misText, funText, ID, jurisText, deptText, Position, Resources, SumText, ResourcesNotes, category, source, files, messages }

          nodes[iNode] = { data: m, pos: new go.Point(selectpart.position.x, selectpart.position.y) }
        }

        if (part instanceof go.Link) {
          iLink++
          links[iLink] = { gohashid: part.data.__gohashid, from: part.data.from, to: part.data.to }
        }
      })

      const allNodes = stage.model.nodeDataArray
      self.fire('PASTED_GROUP', { groups: groups, nodes: nodes, links: links })
    })

    this.cmd = stage.commandHandler

    const entity = new Nodes(447, 264)
    const templArray = [
      { name: 'lineHoriz', value: lineHoriz },
      { name: 'lineVert', value: lineVert },
      { name: 'groupe1Full', value: entity.nodeGroup1 },
      { name: 'groupe1NotFull', value: entity.nodeGroup1Emp },
      { name: 'groupe2', value: entity.nodeGroup2 },
      { name: 'groupOptim', value: entity.nodeGroupOptim }
    ]
    const templmap = new go.Map('string', go.Node)

    for (const index in templArray) {
      templmap.add(templArray[index].name, templArray[index].value)
    }
    stage.nodeTemplateMap = templmap

    const templmapPallete = new go.Map('string', go.Node)
    templmapPallete.add('groupe1Full', entity.nodeGroup1)
    templmapPallete.add('groupe2', entity.nodeGroup2)

    const myPalette = this.myPalette = _(go.Palette, 'myPaletteDiv',
      {
        nodeTemplateMap: templmapPallete,
        initialScale: 0.3
      }
    )

    myPalette.model.nodeDataArray = [
      { key: 'Red Node', ...NODE, category: groupTwo, source: srcBackgroundRed },
      { key: 'Blue Node', ...NODE, category: groupTwo, source: srcBackgroundBlue },
      { key: 'Green Node', ...NODE, category: groupTwo, source: srcBackgroundGreen },
      { key: 'Yellow Node', ...NODE, category: groupOne, source: srcBackgroundYellow },
      { key: 'Smoke Node', ...NODE, category: groupOne, source: srcBackgroundSmoke }
    ]

    stage.contextMenu =
      _(go.Adornment, 'Vertical',
        _('ContextMenuButton',
          _(go.Shape, { height: menuHeight, width: menuWidth, fill: redColor }),
          _(go.TextBlock, 'Event'),
          {
            click: function (e) {
              const properties = { source: srcBackgroundRed }
              self.newColorNode(properties, true)
            }
          }),
        _('ContextMenuButton',
          _(go.Shape, { height: menuHeight, width: menuWidth, fill: blueColor }),
          _(go.TextBlock, 'Decision'),
          {
            click: function (e) {
              const properties = { source: srcBackgroundBlue }
              self.newColorNode(properties, true)
            }
          }),
        _('ContextMenuButton',
          _(go.Shape, { height: menuHeight, width: menuWidth, fill: greenColor }),
          _(go.TextBlock, 'Goal'),
          {
            click: function (e) {
              const properties = { source: srcBackgroundGreen }
              self.newColorNode(properties, true)
            }
          }),
        _('ContextMenuButton',
          _(go.Shape, { height: menuHeight, width: menuWidth, fill: yellowColor }),
          _(go.TextBlock, 'Objective'),
          {
            click: function (e) {
              const properties = { source: srcBackgroundYellow }
              self.newColorNode(properties, true)
            }
          }),
        _('ContextMenuButton',
          _(go.Shape, { height: menuHeight, width: menuWidth, fill: smokeColor }),
          _(go.TextBlock, 'Activity'),
          {
            click: function (e) {
              const properties = {
                source: srcBackgroundSmoke
              }
              self.newColorNode(properties, true)
            }
          })
      )

    stage.linkTemplate =
      _(go.Link,
        {
          toShortLength: 6,
          toEndSegmentLength: 20
        },
        _(go.Shape, { strokeWidth: 2, stroke: 'black' },
          new go.Binding('strokeWidth', 'widthLink'),
          new go.Binding('stroke', 'colorLink')
        ),
        _(go.Shape, { toArrow: 'Triangle', stroke: null, scale: 1.5, fill: 'black' },
          new go.Binding('stroke', 'colorFrontLink'),
          new go.Binding('fill', 'fillLink')
        )
      )

    stage.model = new go.GraphLinksModel(NODE_DATA_ARRAY, LINK_DATA_ARRAY)
    this.stage.fixedBounds = this.setFixedBounds()

    this.overview = _(go.Overview, 'myOverviewDiv', {
      observed: stage,
      contentAlignment: go.Spot.Center
      // fixedBounds: new go.Rect(0, 0, 500, 500)
    })

    this.settingPrePlanner()
  }

  get labels2 () {
    return [
      'ID', 'Jurisdiction', 'Department', 'Mission', 'Position', 'Function', 'Resources', 'Notes', 'Summary', 'Size'
    ]
  }

  get labels () {
    return pick(this.hasSelection ? this.selection.first().data : {}, [
      'ID', 'jurisText', 'deptText', 'misText', 'Position', 'funText', 'Resources', 'ResourcesNotes', 'SumText', 'size'
    ])
  }

  get MandF2 () {
    return [
      'Jurisdiction', 'Department', 'Line', 'Mission', 'Function', 'ID'
    ]
  }

  get MandF () {
    return pick(this.hasSelection ? this.selection.first().data : {}, [
      'jurisColor', 'deptColor', 'colorLine', 'misColor', 'funColor', 'idColor'
    ])
  }

  get nodeDataArrayInfo () {
    const { srcBackgroundRed, srcBackgroundBlue, srcBackgroundGreen, srcBackgroundYellow, srcBackgroundSmoke } = { ...VALUE_FOR_DRAWER }

    if (!this.hasSelection) {
      const allParts = this.stage.model.nodeDataArray
      const propertes = {
        iLines: 0,
        iGroup: 0,
        iRedNodes: 0,
        iBlueNodes: 0,
        iGreenNodes: 0,
        iYellowNodes: 0,
        iSmokeNodes: 0
      }

      for (let i = 0; i < allParts.length; i++) {
        const part = this.stage.findPartForKey(allParts[i].key)

        if (part instanceof go.Node) {
          switch (allParts[i].source) {
            case srcBackgroundRed: {
              propertes.iRedNodes++
              break
            }
            case srcBackgroundBlue: {
              propertes.iBlueNodes++
              break
            }
            case srcBackgroundGreen: {
              propertes.iGreenNodes++
              break
            }
            case srcBackgroundYellow: {
              propertes.iYellowNodes++
              break
            }
            case srcBackgroundSmoke: {
              propertes.iSmokeNodes++
              break
            }
            default : {
              if (allParts[i].category) {
                propertes.iLines++
              }
              if (allParts[i].isGroup) {
                propertes.iGroup++
              }
              break
            }
          }
        }
      }
      const data = []
      let i = 0
      for (const prop in propertes) {
        data[i] = { name: prop, amount: propertes[prop] }
        i++
      }
      return data
    } else {
      return {}
    }
  }

  get findNodesFromDiagram () {
    const { groupOne, groupTwo, groupOneHalf, groupOptim } = { ...VALUE_FOR_DRAWER }
    const allParts = this.stage.nodes
    const collectCards = new go.List()
    const it = allParts.iterator

    while (it.next()) {
      const part = it.value
      if (part instanceof go.Node) {
        const isCard = (part.category === groupOne) || (part.category === groupOneHalf) || (part.category === groupTwo) || (part.category === groupOptim)
        if (isCard) {
          collectCards.add(part)
        }
      }
    }

    return collectCards
  }

  get messages () {
    return (this.hasSelection ? this.selection.first().data.messages : {})
  }

  get files () {
    return (this.hasSelection ? this.selection.first().data.files : {})
  }

  get selection () {
    return this.stage.selection
  }

  get hasSelection () {
    return this.selection && this.selection.count
  }

  get isNode () {
    return this.stage.model.NODE_DATA_ARRAY.length
  }

  get canUndo () {
    return this.cmd.canUndo()
  }

  get canRedo () {
    return this.cmd.canRedo()
  }

  get canUngroup () {
    this.cmd.canUngroupSelection()
  }

  get canCopy () {
    return this.cmd.canCopySelection()
  }

  get canPaste () {
    return this.cmd.canPasteSelection()
  }

  colorFocusForLink (part, model, ObjParam) {
    let linksFrom

    if (part instanceof go.Node) {
      linksFrom = part.findLinksOutOf()

      while (linksFrom.next()) {
        for (const param in ObjParam) {
          model.setDataProperty(linksFrom.value.data, param, ObjParam[param])
        }
      }
    }
  }

  changeSizeSelection (part) {
    const { limScaleForSizeSelection } = { ...VALUE_FOR_NODES }
    const scale = this.stage.scale

    if (scale > limScaleForSizeSelection && scale <= 0.7) {
      this.changeSizeBatton(part, scale)
    } else {
      if (scale > 0.7) {
        this.changeSizeBatton(part, 0.7)
      } else {
        this.changeSizeBatton(part, limScaleForSizeSelection)
      }
    }
  }

  changeSizeBatton (part, scale) {
    const diagram = this.stage
    const defBtnIcon = 50
    const defBtnNoteW = 30
    const defBtnNoteH = 48
    const defBtnFileW = 20
    const defBtnFileH = 48
    const defDCircle = 20

    const percent = 1 - scale / 0.7
    const sizeBtnIcon = (defBtnIcon + defBtnIcon * percent)
    const k = percent * percent
    const sizeBtnIconK = new go.Size(sizeBtnIcon + sizeBtnIcon * k, sizeBtnIcon + sizeBtnIcon * k)

    const BtnNoteW = (defBtnNoteW + defBtnNoteW * percent)
    const BtnNoteH = (defBtnNoteH + defBtnNoteH * percent)
    const sizeBtnNote = new go.Size(BtnNoteW + BtnNoteW * k, BtnNoteH + BtnNoteH * k)

    const BtnFileW = (defBtnFileW + defBtnFileW * percent)
    const BtnFileH = (defBtnFileH + defBtnFileH * percent)
    const sizeBtnFile = new go.Size(BtnFileW + BtnFileW * k, BtnFileH + BtnFileH * k)

    const DCircle = defDCircle + defDCircle * percent
    const DCircleK = DCircle + DCircle * k

    const marginBottom = (5 + 5 * percent)
    const marginBottomK = new go.Margin(0, 30, marginBottom + marginBottom * percent, 0)

    diagram.model.setDataProperty(part.data, 'sizeBtnIcon', sizeBtnIconK)
    diagram.model.setDataProperty(part.data, 'mrgnSelectHoriz', marginBottomK)
    diagram.model.setDataProperty(part.data, 'sizeBtnNote', sizeBtnNote)
    diagram.model.setDataProperty(part.data, 'sizeBtnFile', sizeBtnFile)
    diagram.model.setDataProperty(part.data, 'widthCircle', DCircleK)
    diagram.model.setDataProperty(part.data, 'heightCircle', DCircleK)
    diagram.model.setDataProperty(part.data, 'fontAmountNote', '16px PermanentMarker')

    if (scale > 0.566 && scale <= 0.666) {
      diagram.model.setDataProperty(part.data, 'fontAmountNote', '18px PermanentMarker')
    }
    if (scale > 0.466 && scale <= 0.566) {
      diagram.model.setDataProperty(part.data, 'fontAmountNote', '21px PermanentMarker')
    }
    if (scale > 0.366 && scale <= 0.49) {
      diagram.model.setDataProperty(part.data, 'fontAmountNote', '24px PermanentMarker')
    }
  }

  newColorNode (data, isContextMenu = false, defaultX = 0, defaultY = 0, isSocet = true) {
    const { groupOne } = { ...VALUE_FOR_DRAWER }

    const diagram = this.stage
    const isContext = isContextMenu
    const dataNodes = data

    const presGroupOne = groupOne
    const presGroupTwo = groupOne

    let paramFloat = {}

    console.log('dataNodes', dataNodes)

    if (this.isOneCategory(dataNodes.source)) {
      paramFloat = { ...NODE }
      paramFloat.category = presGroupOne
    } else {
      paramFloat = { ...NODE }
      paramFloat.category = presGroupTwo
    }

    paramFloat.key = Math.random() * 100000000

    for (const property in dataNodes) {
      paramFloat[property] = dataNodes[property]
    }

    diagram.startTransaction('new node')
    const dataNode = { ...paramFloat }
    diagram.model.addNodeData(dataNode)
    const newPart = diagram.findPartForData(dataNode)

    if (isContext) {
      newPart.position = diagram.toolManager.contextMenuTool.mouseDownPoint
    } else {
      if (defaultX === 0 && defaultY === 0) {
        newPart.position = new go.Point(defaultX, defaultY)
        this.positionCopyNode(newPart)
      } else {
        newPart.position = new go.Point(defaultX, defaultY)
      }
    }

    for (const prop in paramFloat) {
      diagram.model.setDataProperty(dataNode, prop, paramFloat[prop])
    }

    this.changeSizeSelection(newPart)
    diagram.commitTransaction('new node')

    // const bounds = this.setFixedBounds(diagram)  // changed FixedBounds for diagram
    // console.log('new color: bounds', bounds)

    // if (isSocet) {
    //   diagram.select(newPart)
    //   this.fire('NEW_NODE', {
    //     source: data.source,
    //     position: { x: newPart.position.x, y: newPart.position.y },
    //     key: paramFloat.key
    //   })
    // }
  }

  undo () {
    this.cmd.undo()
  }

  redo () {
    this.cmd.redo()
  }

  clearSelection () {
    this.stage.clearSelection()
  }

  clearAll () {
    this.cmd.selectAll()
    this.cmd.deleteSelection()
  }

  selectAll () {
    this.cmd.selectAll()
  }

  cut () {
    this.cmd.cutSelection()
  }

  copy () {
    this.cmd.copySelection()
  }

  paste () {
    this.cmd.pasteSelection()
  }

  delete () {
    this.cmd.deleteSelection()
  }

  deleteNode () {
    const obj = this.stage.selection.first()
    this.stage.remove(obj.part)

    this.fire('SELECTION_DELETING', [{ key: obj.part.data.key, part: 'NodeAndGroup' }])
  }

  group () {
    this.cmd.groupSelection()
  }

  ungroup () {
    this.cmd.ungroupSelection()
  }

  zoomIn () {
    this.cmd.increaseZoom()
  }

  zoomOut () {
    this.cmd.decreaseZoom()
  }

  zoomOriginal () {
    this.cmd.resetZoom(0.7)
  }

  grid () {
    this.stage.grid.visible = !this.stage.grid.visible
  }

  changeSelectionProperty (key, value) {
    const { groupOne, groupOneHalf } = { ...VALUE_FOR_DRAWER }
    if (!this.hasSelection) return

    const diagram = this.stage

    diagram.startTransaction('change value')

    this.selection.each((node) => {
      diagram.model.setDataProperty(node.data, key, value)
      if (node.data.category === groupOne || node.data.category === groupOneHalf) {
        this.setGroupe1NotFull(node.data)
      }

      this.fire('CHANGE_MISandFUN', {
        key: node.data.key,
        category: node.data.category,
        value: value,
        property: key
      })
    })
    diagram.commitTransaction('change value')
  }

  changeSelectionPropertyInArray (array, key, property, value, propInArray) {
    if (!this.hasSelection) return

    const model = this.stage.model
    array[key][property] = value

    model.startTransaction('change value')
    this.selection.each(node => {
      model.setDataProperty(node.data, propInArray, array)

      this.fire('CHANGE_MISandFUN', {
        key: node.data.key,
        category: node.data.category,
        value: array,
        property: propInArray
      })
    })
    model.commitTransaction('change value')
  }

  refresh () {
  }

  new () {
    this.cmd.selectAll()
    this.cmd.deleteSelection()

    this.stage.undoManager.clear()
    this.stage.initialScale = 1
    this.stage.initialPosition = new go.Point(0, 0)
  }

  bringToFont () {
    this.changeZOrder(this.selection, this.zorderFromNode('max'))
  }

  sendToBack () {
    this.changeZOrder(this.selection, this.zorderFromNode('min'))
  }

  bringToFontNode () {
    this.changeZOrder(this.selection.first(), this.zorderFromNode('max'))
  }

  sendToBackNode () {
    this.changeZOrder(this.selection.first(), this.zorderFromNode('min'))
  }

  addMessAndFile (property) {
    const fulldata = this.selection.first().data
    const data = this.selection.first().data[property]
    const keynode = this.selection.first().data.key

    data.splice(data.length, 0, { author: '', message: '', date: '' })
    this.fire('CHANGE_MISandFUN', {
      key: keynode,
      category: fulldata.category,
      value: data,
      property: property
    })
  }

  removeMessAndFile (property, key) {
    const fulldata = this.selection.first().data
    const data = this.selection.first().data[property]
    const keynode = this.selection.first().data.key

    if (fulldata.files.length) {
      this.stage.model.setDataProperty(fulldata, 'amountFiles', fulldata.files.length)
      this.stage.model.setDataProperty(fulldata, 'isAmountFiles', true)
    } else {
      this.stage.model.setDataProperty(fulldata, 'isAmountFiles', false)
    }

    this.stage.requestUpdate()

    console.log('data', data)
    console.log('fulldata', fulldata)
    console.log('keynode', keynode)

    data.splice(key, 1)
    this.fire('CHANGE_MISandFUN', {
      key: keynode,
      category: fulldata.category,
      value: data,
      property: property
    })
  }

  changeZOrder (obj, value = 0) {
    const self = this
    // const array = []
    self.stage.startTransaction('modified zOrder')

    if (obj instanceof go.Node || obj instanceof go.Group) {
      this.funChangeZOrder(obj, value)
    } else {
      obj.each(
        (part) => {
          this.funChangeZOrder(part, value)
        })
    }

    this.stage.commitTransaction('modified zOrder')
  }

  funChangeZOrder (part, value) {
    if (part instanceof go.Node) {
      this.stage.model.setDataProperty(part.data, 'zOrder', value)
      this.fire('CHANGE_LAYOUT', { key: part.data.key, Zorder: value })
    }

    if (part instanceof go.Group) {
      this.stage.model.setDataProperty(part.data, 'zOrder', value)
      this.fire('CHANGE_LAYOUT', { key: part.data.key, Zorder: value })

      const members = part.memberParts
      console.log('CLIENT: members', members)

      if (members) {
        while (members.next()) {
          const partGroup = members.value
          console.log('CLIENT: partGroup.Data', partGroup.data)

          this.stage.model.setDataProperty(partGroup.data, 'zOrder', value)

          this.fire('CHANGE_LAYOUT', { key: partGroup.data.key, Zorder: value })
        }
      }
    }
  }

  drawLinkNode () {
    const diagram = this.stage
    const node = this.selection.first()
    const tool = diagram.toolManager.linkingTool

    tool.startObject = node.port
    diagram.currentTool = tool
    tool.doActivate()
  }

  resize () {
    this.stage.requestUpdate()
  }

  NewNodeFromNode () {
    const diagram = this.stage
    const datanode = this.selection.first()

    diagram.startTransaction('Create Node and Link')
    this.createNodeAndLink(datanode)
    diagram.commitTransaction('Create Node and Link')
  }

  setFixedBounds () {
    const collectCard = this.findNodesFromDiagram
    console.log('collectCard', collectCard)
    const rect = this.stage.computePartsBounds(collectCard)

    console.log('rect for diagram', rect)
    return rect
  }

  createNodeAndLink (parent) {
    // const {
    //   srcBackgroundRed,
    //   srcBackgroundBlue,
    //   srcBackgroundGreen,
    //   srcBackgroundYellow,
    //   srcBackgroundSmoke
    //   // groupOne,
    //   // groupOneHalf
    //   // groupTwo
    // } = { ...VALUE_FOR_DRAWER }

    const diagram = this.stage
    const model = diagram.model
    const parentData = parent.data
    let nodedata = {}
    const properties = {}

    if (this.isOneCategory(parentData.source)) {
      nodedata = { ...NODE }
    } else {
      nodedata = { ...NODE }
    }

    properties.key = Math.random() * 100000000
    properties.source = parentData.source
    properties.category = parentData.category
    model.addNodeData(nodedata)

    for (const prop in properties) {
      model.setDataProperty(nodedata, prop, properties[prop])
    }

    const newnode = diagram.findNodeForData(nodedata)
    this.changeSizeSelection(newnode)
    const linkdata = model.copyLinkData({})
    model.setFromKeyForLinkData(linkdata, model.getKeyForNodeData(parentData))
    model.setToKeyForLinkData(linkdata, model.getKeyForNodeData(newnode.data))
    model.addLinkData(linkdata)
    diagram.select(newnode)

    console.log('parentData', parent)
    newnode.position = new go.Point(parent.position.x + 50, parent.position.y + 50)

    this.fire('NEW_NODE', {
      source: nodedata.source,
      position: { x: newnode.position.x, y: newnode.position.y }
    })
    this.fire('LINK_DRAWN', {
      __gohashid: linkdata.__gohashid,
      from: linkdata.from,
      to: linkdata.to
    })

    return newnode
  }

  import (data) {
    const {
      typePrePlanner,
      typePlanner
    } = { ...VALUE_FOR_DRAWER }
    const model = JSON.parse(data.model)
    const typeProject = data.typeProject
    const selectObj = data.selectObj
    const diagram = this.stage

    diagram.model = new go.GraphLinksModel(model.NODE_DATA_ARRAY, model.LINK_DATA_ARRAY)
    diagram.initialScale = data.zoom
    diagram.initialPosition = new go.Point(data.position.x, data.position.y)
    console.log('data', data.fix)
    diagram.fixedBounds = new go.Rect(data.fix.x, data.fix.y, data.fix.width, data.fix.height)

    switch (typeProject) {
      case typePrePlanner: {
        this.settingPrePlanner()
        break
      }
      case typePlanner: {
        this.settingPlanner()
        break
      }
      default: {
        break
      }
    }

    for (let i = 0; i < selectObj.length; i++) {
      const partSelect = diagram.findPartForKey(selectObj[i])
      partSelect.isSelected = true
      console.log('isSelected', partSelect.isSelected)
    }
  }

  export (showPalette, showOverView, nameProject) {
    const { typePrePlanner } = { ...VALUE_FOR_DRAWER }

    const dateSave = Date.now()
    const array = []
    let i = 0

    this.selection.each(part => {
      array[i] = part.data.key
      i++
    })

    return {
      model: this.stage.model.toJson(),
      zoom: this.stage.scale,
      position: this.stage.position,
      showPalette: showPalette,
      showOverView: showOverView,
      selectObj: array,
      dateSave: dateSave,
      fix: this.stage.fixedBounds,
      typeProject: typePrePlanner,
      nameProject: nameProject
    }
  }

  selectedMoved (data) {
    const diagram = this.stage
    const objData = data.data.data.data
    const tokenMessage = data.data.data.token
    const bounds = data.data.data.bounds
    const myToken = this.token
    console.log('SERVER: objData', objData)
    console.log('bounds on server: ', bounds)

    for (let i = 0; i < objData.length; i++) {
      if (objData[i].part) {
        const part = diagram.findPartForKey(objData[i].key)

        if (tokenMessage !== myToken) {
          part.position = new go.Point(objData[i].position.x, objData[i].position.y)
        }
      }
    }

    diagram.fixedBounds = new go.Rect(bounds.x, bounds.y, bounds.width, bounds.height)
    diagram.requestUpdate()
  }

  selectionDeleted (data) {
    const netData = data.data
    const tokenMessage = netData.token
    const myToken = this.token
    // const bounds = this.setFixedBounds(this.stage)

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const objData = netData.data
      console.log('objData', objData)

      for (let i = 0; i < objData.length; i++) {
        switch (objData[i].part) {
          case 'NodeAndGroup': {
            const part = diagram.findPartForKey(objData[i].key)
            diagram.remove(part)
            break
          }
          case 'Link': {
            const linkdata = objData[i].key
            const link = diagram.findLinkForData(linkdata)

            if (!link) break

            diagram.model.removeLinkData(linkdata)
            diagram.remove(link)
            break
          }
        }
      }
    }
    this.setFixedBounds(this.stage)
  }

  selectionGroup (data) {
    const netData = data.data
    const tokenMessage = netData.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const keyGroup = netData.data.keyGroup
      const objData = netData.data.data
      const isGroup = netData.data.isGroup

      this.createGroup(keyGroup, isGroup)

      for (let i = 0; i < objData.length; i++) {
        switch (objData[i].part) {
          case 'Node': {
            const part = diagram.findPartForKey(objData[i].key)
            diagram.model.setDataProperty(part.data, 'group', keyGroup)
            break
          }
          case 'Group': {
            const PodGroupPart = diagram.findPartForKey(objData[i].key)
            diagram.model.setDataProperty(PodGroupPart.data, 'group', keyGroup)
            break
          }
          default: {
            break
          }
        }
      }
    }
  }

  selectionUngroup (data) {
    const netData = data.data
    const tokenMessage = netData.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const supGroup = netData.data.supGroup
      const keyGroup = netData.data.keyGroup
      const keyNode = netData.data.keyNode
      const part = diagram.findPartForKey(keyGroup)

      diagram.model.removeNodeData(part.data)
      if (keyNode.length) {
        for (let i = 0; i < keyNode.length; i++) {
          const part = diagram.findPartForKey(keyNode[i].key)
          diagram.model.setDataProperty(part.data, 'group', supGroup)
        }
      }
    }
  }

  linkCreate (data) {
    const diagram = this.stage
    const linkdata = data.data.data

    const tokenMessage = data.data.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      diagram.startTransaction('Create Link')
      diagram.model.addLinkData(linkdata)
      diagram.commitTransaction('Create Link')
    }
  }

  textEdited (data) {
    const netData = data.data.data
    const tokenMessage = netData.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const property = netData.data.property
      const key = netData.data.key

      const part = diagram.findPartForKey(key)

      for (const prop in property) {
        diagram.model.setDataProperty(part.data, prop, property[prop])
      }
    }
  }

  newNode (data) {
    const dataNode = data.data.data
    const tokenMessage = data.data.token
    const myToken = this.token

    const posX = dataNode.position.x
    const posY = dataNode.position.y
    if (tokenMessage !== myToken) {
      this.newColorNode({ source: dataNode.source, key: dataNode.key }, false, posX, posY, false)
    }
  }

  copyNode (data) {
    const dataNode = data.data.data
    const tokenMessage = data.data.token
    const myToken = this.token
    const position = dataNode.position

    console.log('---------------')
    console.log('tokenMessage', tokenMessage)
    console.log('myToken', myToken)
    console.log('dataNode', dataNode)
    console.log('position', position)

    if (tokenMessage !== myToken) {
      console.log('SERVER: dataNodes', dataNode)

      this.newColorNode(dataNode.data, false, position.x, position.y, false)
    }
  }

  changeLayout (data) {
    const netData = data.data.data
    const tokenMessage = netData.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const key = netData.key
      const Zorder = netData.Zorder

      const part = diagram.findPartForKey(key)
      if (part instanceof go.Node) {
        diagram.model.startTransaction('modified zOrder')
        diagram.model.setDataProperty(part.data, 'zOrder', Zorder)
        diagram.model.commitTransaction('modified zOrder')
      }
    }
  }

  changeMisandFun (data) {
    const netData = data.data.data
    const tokenMessage = netData.token
    const myToken = this.token

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const key = netData.key
      const property = netData.property
      const value = netData.value
      const category = netData.category

      const part = diagram.findPartForKey(key)
      diagram.model.setDataProperty(part.data, property, value)

      console.log('category', category)
      console.log('part.data.category', part.data.category)

      diagram.model.setDataProperty(part.data, 'category', category)
    }
  }

  makeImg (type) {
    const diagram = this.stage
    const svg = diagram.makeImageData({ scale: 1, showGrid: diagram.grid.visible })

    const blob = dataURItoBlob(svg)
    FileSaver.saveAs(blob, `diagram.${type.type}`)

    function dataURItoBlob (dataURI) {
      const byteString = dataURI.split(',')[0].indexOf('base64') >= 0 ? window.atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1])
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      const ia = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new window.Blob([ia], { type: mimeString })
    }
  }

  createGroup (keyGroup, keySupGroup) {
    const diagram = this.stage

    diagram.model.addNodeData({ key: keyGroup, isGroup: true })
    const groupPart = diagram.findPartForKey(keyGroup)
    diagram.model.setDataProperty(groupPart.data, 'text', 'Group')

    if (keySupGroup) {
      diagram.model.setDataProperty(groupPart.data, 'group', keySupGroup)
    }
  }

  pastedGroup (data) {
    const netData = data.data.data
    const tokenMessage = data.data.token
    const myToken = this.token

    console.log('tokenMessage', tokenMessage)
    console.log('myToken', myToken)

    if (tokenMessage !== myToken) {
      const diagram = this.stage
      const groups = netData.groups
      const nodes = netData.nodes
      const links = netData.links

      for (let i = 0; i < groups.length; i++) {
        const supGroup = groups[i].group
        const keyGroup = groups[i].key

        this.createGroup(keyGroup, supGroup)
        console.log('SERVER: the group created: ', { key: keyGroup, isGroup: true, group: supGroup })
      }
      for (let i = 0; i < nodes.length; i++) {
        const posX = nodes[i].pos.x
        const posY = nodes[i].pos.y

        this.newColorNode(nodes[i].data, false, posX, posY, false)

        if (nodes[i].group) {
          const part = diagram.findPartForKey(nodes[i].key)
          diagram.model.setDataProperty(part.data, 'group', nodes[i].group)
        }
      }
      for (let i = 0; i < links.length; i++) {
        diagram.startTransaction('Create Link')
        diagram.model.addLinkData({ __gohashid: links[i].gohashid, from: links[i].from, to: links[i].to })
        diagram.commitTransaction('Create Link')
      }
    }
  }

  saveAsJson (filename, data) {
    const dataJson = JSON.stringify(data)
    const blob = new window.Blob([dataJson], { type: 'json' })

    FileSaver.saveAs(blob, `${filename}.json`)
  }

  loadFromJson (f) {
    const reader = new window.FileReader()
    let data
    let ready = false
    const self = this

    const check = function () {
      if (ready === true) {
        self.import(data)

        return
      }
      setTimeout(check, 1000)
    }

    check()

    reader.onload = function (e) {
      data = JSON.parse(e.target.result)
      ready = true
    }

    reader.readAsText(f.file)
  }

  filter (color) {
    const diagram = this.stage
    const property = []
    let i = 0

    for (const prop in color) {
      if (color[prop].is === true) {
        property[i] = color[prop].source
        i++
      }
    }

    const nodes = diagram.model.NODE_DATA_ARRAY
    for (let i = 0; i < nodes.length; i++) {
      const part = diagram.findPartForKey(nodes[i].key)

      for (let j = 0; j < property.length; j++) {
        if (nodes[i].source === property[j]) {
          part.isSelected = true
          break
        }
        part.isSelected = false
      }
    }
  }

  searchByAuthor (data) {
    const diagram = this.stage
    const isMessages = data.isMessages
    const isFiles = data.isFiles
    const author = data.author

    const nodes = diagram.model.nodeDataArray
    for (let i = 0; i < nodes.length; i++) {
      const part = diagram.findPartForKey(nodes[i].key)
      part.isSelected = false

      if (isMessages) {
        for (let j = 0; j < nodes[i].messages.length; j++) {
          if (nodes[i].messages[j].author === author) {
            part.isSelected = true
          }
        }
      } else {
        if (isFiles) {
          for (let j = 0; j < nodes[i].files.length; j++) {
            if (nodes[i].files[j].author === author) {
              part.isSelected = true
            }
          }
        }
      }
    }
  }

  positionCopyNode (selectpart) {
    this.stage.nodes.each((part) => {
      if (selectpart.position.x === part.position.x && selectpart.position.y === part.position.y) {
        if (part.data.key !== selectpart.data.key) {
          selectpart.position.x += 30
          selectpart.position.y += 30
        }
      }
    })
  }

  visibleLabels () {
    const diagram = this.stage
    const data = diagram.selection.first().data
    console.log('data', data)

    diagram.model.setDataProperty(data, 'visibleLbl', !data.visibleLbl)
  }

  isSelectedNode () {
    const part = this.stage.selection.first()
    const isGroup = part instanceof go.Group
    const isNode = part instanceof go.Node

    return isNode && !isGroup ? 1 : 0
  }

  settingPrePlanner () {
    const { groupOne, groupTwo, groupOneHalf } = { ...VALUE_FOR_DRAWER }
    const array = ['Yellow Node', 'Smoke Node']

    const collectNodes = this.findNodesFromDiagram
    const it = collectNodes.iterator

    while (it.next()) {
      const partdata = it.value.data
      // console.log('partdata', partdata)

      if (partdata.category === groupOne || partdata.category === groupOneHalf) {
        this.stage.model.setDataProperty(partdata, 'category', groupTwo)
      }
    }

    this.changeCategoryFromPalette(groupTwo, array)
  }

  settingPlanner () {
    const { groupOne, srcBackgroundYellow, srcBackgroundSmoke } = { ...VALUE_FOR_DRAWER }
    const array = ['Yellow Node', 'Smoke Node']

    const collectNodes = this.findNodesFromDiagram
    const it = collectNodes.iterator

    while (it.next()) {
      const partdata = it.value.data
      // console.log('partdata', partdata)

      if (partdata.source === srcBackgroundYellow || partdata.source === srcBackgroundSmoke) {
        this.setGroupe1NotFull(partdata)
      }
    }

    this.changeCategoryFromPalette(groupOne, array)
  }

  tamplateOptim (optim) {
    const { groupOptim } = { ...VALUE_FOR_DRAWER }
    const collectNodes = this.findNodesFromDiagram
    const it = collectNodes.iterator

    while (it.next()) {
      const partdata = it.value.data

      if (optim) {
        this.stage.model.setDataProperty(partdata, 'lastCategory', partdata.category)
        this.stage.model.setDataProperty(partdata, 'category', groupOptim)
      } else {
        this.stage.model.setDataProperty(partdata, 'category', partdata.lastCategory)
      }
    }
  }

  zorderFromNode (operation) {
    const array = []

    const it = this.findNodesFromDiagram.iterator

    while (it.next()) {
      array[it.key] = it.value.data.zOrder
    }

    return {max: Math.max.apply(Math, array) + 1, min: Math.min.apply(Math, array) - 1}[operation]
  }

  setGroupe1NotFull (datanode) {
    const { groupOne, groupOneHalf } = { ...VALUE_FOR_DRAWER }

    if (datanode.Position || datanode.Resources) {
      this.stage.model.setDataProperty(datanode, 'category', groupOne)
      return 0
    } else {
      this.stage.model.setDataProperty(datanode, 'category', groupOneHalf)
      return 1
    }
  }

  changeCategoryFromPalette (category, array) {
    const { srcBackgroundYellow, srcBackgroundSmoke } = { ...VALUE_FOR_DRAWER }
    const src = [srcBackgroundYellow, srcBackgroundSmoke]

    for (let i = 0; i < array.length; i++) {
      const partdata = this.myPalette.model.findNodeDataForKey(array[i])
      this.myPalette.model.removeNodeData(partdata)
      this.myPalette.model.addNodeData({
        key: array[i],
        ...NODE,
        category: category,
        source: src[i]
      }
      )
    }
  }

  isOneCategory (source) {
    const { srcBackgroundRed, srcBackgroundBlue, srcBackgroundGreen } = { ...VALUE_FOR_DRAWER }
    const isTwo = source === srcBackgroundRed || source === srcBackgroundBlue || source === srcBackgroundGreen
    if (isTwo) {
      return 0
    }

    return 1
  }

  membersInPodGroup (members, keyAndPos, Index) {
    while (members.next()) {
      console.log('Index:', Index.n)
      const thisPart = members.value

      if (thisPart instanceof go.Node) {
        keyAndPos[Index.n] = { key: thisPart.data.key, position: new go.Point(thisPart.position.x, thisPart.position.y), part: 'Node' }
        Index.n++
        console.log('ON CLIENT: PodgroupPartsKey', thisPart.data.key)
      }

      if (thisPart instanceof go.Link) {
        console.log('ON CLIENT: Link')
      }

      if (thisPart instanceof go.Group) {
        keyAndPos[Index.n] = { key: thisPart.data.key, position: new go.Point(thisPart.position.x, thisPart.position.y), part: 'Group' }
        Index.n++
        const members = thisPart.memberParts
        if (members) {
          console.log('ON CLIENT: New PodGroup:------------------', members)
          this.membersInPodGroup(members, keyAndPos, Index)
        }
      }
    }
  }

  load () {
    return NODE_DATA_ARRAY
  }

  onViewportChanged (e) {
    const self = this
    let diagram = e.diagram

    let viewb = diagram.viewportBounds
    let model = diagram.model

    let oldskips = diagram.skipsUndoManager
    diagram.skipsUndoManager = true

    let b = new go.Rect()
    let ndata = this.wholeModel.nodeDataArray
    for (let i = 0; i < ndata.length; i++) {
      let n = ndata[i]
      if (!n.bounds) continue
      if (n.bounds.intersectsRect(viewb)) {
        model.addNodeData(n)
      }
    }

    diagram.skipsUndoManager = oldskips

    if (this.myRemoveTimer === null) {
      this.myRemoveTimer = setTimeout(function () { self.removeOffScreen(diagram) }, 3000)
    }

    this.updateCounts()

    console.log('onViewportChanged')
  }

  removeOffScreen (diagram) {
    this.myRemoveTimer = null

    let viewb = diagram.viewportBounds
    let model = diagram.model
    let remove = []
    let it = diagram.nodes
    while (it.next()) {
      let n = it.value
      let d = n.data
      if (d === null) continue
      if (!n.actualBounds.intersectsRect(viewb) && !n.isSelected) {
        if (!n.linksConnected.any(function (l) { return l.actualBounds.intersectsRect(viewb) })) {
          remove.push(d)
        }
      }
    }

    if (remove.length > 0) {
      let oldskips = diagram.skipsUndoManager
      diagram.skipsUndoManager = true
      model.removeNodeDataCollection(remove)
      diagram.skipsUndoManager = oldskips
    }

    this.updateCounts()
  }

  updateCounts () {
    // document.getElementById("myMessage1").textContent = myWholeModel.nodeDataArray.length;
    // document.getElementById("myMessage2").textContent = myDiagram.nodes.count;
    // document.getElementById("myMessage4").textContent = myDiagram.links.count;
    console.log('------------------------------')
    console.log('WholeModel amount:', this.wholeModel.nodeDataArray.length)
    console.log('Diagram amount:', this.stage.nodes.count)
    console.log('Links amount:', this.stage.links.count)
  }

  // setFixedBounds(model) {
  //
  //   let b = new go.Rect(0,0,5000,5000)
  //   // let ndata = model.nodeDataArray;
  //   // for (let i = 0; i < ndata.length; i++) {
  //   //   let d = ndata[i];
  //   //   const obj =
  //   //   console.log('d', d.bounds.position);
  //   //   if (!d.bounds) continue;
  //   //   if (i === 0) {
  //   //     b.set(d.bounds);
  //   //   } else {
  //   //     b.unionRect(d.bounds);
  //   //   }
  //   // }
  //   // console.log('b', b);
  //   return b;
  // }

}
