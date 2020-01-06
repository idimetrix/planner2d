import go from 'gojs'

export default class Node {
  constructor (category, _, width, height, options, selection) {
    const CATEGORY_1 = 'categoryOne'
    const CATEGORY_1_NOT_FULL = 'categoryOneNotFull'
    const CATEGORY_2 = 'categoryTwo'
    const CATEGORY_OPTIM = 'categoryOptim'

    this._ = _
    this.selection = selection
    this.width = width
    this.height = height
    this.options = options

    let minSize, maxSize

    if (category === CATEGORY_1 || category === CATEGORY_1_NOT_FULL) {
      minSize = maxSize = new go.Size(this.options.WidthOne, this.options.itemHeight)

      // this.blockOne = this._(go.Panel, 'Horizontal',
      //   this.podBlockSpot('misColor'),
      //   this.podBlockSpot('funColor'),
      //   this.podBlockSpot('idColor'),
      //   this.podBlockSpot('jurisColor'),
      //   this.podBlockSpot('deptColor')
      // )

      this.blockOne = {}

      this.blockTwo = this._(go.Panel, 'Horizontal',
        this._(go.Panel, 'Auto', { maxSize },
          this.textBlockSmall('MA', 'misText')
        ),
        // this.shapeBlockVert(),
        this._(go.Panel, 'Auto', { maxSize },
          this.textBlockSmall('FUNC', 'funText')
        ),
        // this.shapeBlockVert(),
        this._(go.Panel, 'Auto', { maxSize },
           this.textBlockSmall('ID', 'ID')
        ),
        // this.shapeBlockVert(),
        this._(go.Panel, 'Auto', { maxSize },
           this.textBlockSmall('JURIS', 'jurisText')
        ),
        // this.shapeBlockVert(),
        this._(go.Panel, 'Auto', { maxSize },
           this.textBlockSmall('DEPT', 'deptText')
        )
      )

      if (category === CATEGORY_1) {
        const defaultWidthPanel = this.options.WidthOne
        const defaultHeightPanel = this.options.itemHeight
        minSize = maxSize = new go.Size(5 * defaultWidthPanel, defaultHeightPanel)

        this.blockThree = this._(go.Panel, 'Horizontal', { minSize, maxSize },
          this._(go.Panel, 'Vertical',
            this._(go.Panel, 'Horizontal', { maxSize: new go.Size(3 * defaultWidthPanel + 2, defaultHeightPanel - 2) },
               this.textBlockMid('text', 'Position', defaultHeightPanel - 10, 3 * defaultWidthPanel - 5),
              // this.shapeBlockVert()
            ),
            // this.shapeBlockHotiz(3 * defaultWidthPanel + 2)
          ),
           this.textBlockMid('text', 'Resources', defaultHeightPanel - 10, 5 * defaultWidthPanel - 3 * defaultWidthPanel),
        )

        // this.blockShapeTwo = this.shapeBlockHotiz()
        this.blockShapeTwo = {}

        this.blockFour = this._(go.Panel, 'Horizontal', { alignment: go.Spot.Left, minSize, maxSize },
           this.textBlockMid('text', 'ResourcesNotes', defaultHeightPanel - 10, 5 * defaultWidthPanel),
          this._(go.Shape, {
            fill: '#eaeaea',
            stroke: null,
            height: defaultHeightPanel,
            width: 1
          }, new go.Binding('fill', 'color'))
        )

        this.blockFive = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel, 2 * defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel, 2 * defaultHeightPanel)
        },
           this.textBlockMid('text', 'SumText', 2 * defaultHeightPanel - 10, 5 * defaultWidthPanel),
        )

        this.blockSix = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel / 2, defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel / 2, 2 * defaultHeightPanel)
        })

        this.blockShapeThree = {}
      } else {
        const defaultWidthPanel = this.options.WidthOne
        const defaultHeightPanel = this.options.itemHeight

        // this.blockShapeThree = this.shapeBlockHotiz()
        this.blockShapeThree = {}
        this.blockThree = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel, 4 * defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel, 4 * defaultHeightPanel)
        },
           this.textBlockMid('text', 'SumText', 4 * defaultHeightPanel - 10, 5 * defaultWidthPanel),
        )

        this.blockFour = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel / 2, defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel / 2, 2 * defaultHeightPanel)
        })

        this.blockShapeTwo = {}
        this.blockFive = {}
        this.blockSix = {}
      }
    } else {
      if (category === CATEGORY_2) {
        const defaultWidthPanel = this.options.WidthOne
        const defaultHeightPanel = this.options.itemHeight

        // this.blockOne = this._(go.Panel, 'Horizontal',
        //   this._(go.Panel, 'Auto', { maxSize: new go.Size(defaultWidthPanel, defaultHeightPanel / 6) },
        //     this.shapeBlockRectangle('idColor')
        //   ),
        //   this._(go.Panel, 'Auto', { maxSize: new go.Size(2 * defaultWidthPanel + 2, defaultHeightPanel / 6) },
        //     this.shapeBlockRectangle('jurisColor', 2 * defaultWidthPanel)
        //   ),
        //   this._(go.Panel, 'Auto', { maxSize: new go.Size(2 * defaultWidthPanel, defaultHeightPanel / 6) },
        //     this.shapeBlockRectangle('deptColor', 2 * defaultWidthPanel)
        //   )
        // )

        this.blockOne = {}

        this.blockTwo = this._(go.Panel, 'Horizontal',
          this._(go.Panel, 'Auto', { maxSize: new go.Size(defaultWidthPanel, defaultHeightPanel) },
             this.textBlockSmall('ID #', 'ID')
          ),
          // this.shapeBlockVert(),
          this._(go.Panel, 'Auto', { maxSize: new go.Size(2 * defaultWidthPanel + 2, defaultHeightPanel) },
             this.textBlockSmall('JURIS', 'jurisText', 2 * defaultWidthPanel)
          ),
          // this.shapeBlockVert(),
          this._(go.Panel, 'Auto', { maxSize: new go.Size(2 * defaultWidthPanel, defaultHeightPanel) },
             this.textBlockSmall('DEPT', 'deptText', 2 * defaultWidthPanel)
          ),
        )

        this.blockThree = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel, 4 * defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel, 4 * defaultHeightPanel)
        },
           this.textBlockMid('Indicate', 'SumText', 4 * defaultHeightPanel, 5 * defaultWidthPanel)
        )

        this.blockFour = this._(go.Panel, 'Horizontal', {
          minSize: new go.Size(5 * defaultWidthPanel / 2, defaultHeightPanel),
          maxSize: new go.Size(5 * defaultWidthPanel / 2, 2 * defaultHeightPanel)
        })

        this.blockShapeTwo = {}
        this.blockFive = {}
        this.blockSix = {}
        this.blockShapeThree = {}
      } else {
        if (category === CATEGORY_OPTIM) {
          this.blockOne = {}
          this.blockTwo = {}
          this.blockShapeThree = {}
          this.blockThree = {}
          this.blockFour = {}
          this.blockShapeTwo = {}
          this.blockFive = {}
          this.blockSix = {}
        }
      }
    }
  }

  exec () {
    return this._(go.Node, 'Auto',
      this.selection,
      new go.Binding('zOrder'),
      {
        linkConnected: function (node, link, port) {
          if (link.fromNode !== null) link.fromNode.invalidateConnectedLinks()
          if (link.toNode !== null) link.toNode.invalidateConnectedLinks()
        },
        linkDisconnected: function (node, link, port) {
          if (link.fromNode !== null) link.fromNode.invalidateConnectedLinks()
          if (link.toNode !== null) link.toNode.invalidateConnectedLinks()
        },
        locationSpot: go.Spot.Center
      },
      new go.Binding('location', 'location', go.Point.parse).makeTwoWay(go.Point.stringify),
      this._(go.Panel, 'Auto',
        this._(go.Picture, {
          source: 'src/img/patterns/grey.png',
          column: 0,
          margin: 0
        }, new go.Binding('source', 'source')),
        this._(go.Shape, 'Rectangle', {
          fill: 'transparent',
          width: 5 * this.options.item1From5Width,
          height: 6 * this.options.itemHeight + this.options.itemHeight / 6,
          strokeWidth: this.options.strokeWidth,
          stroke: this.options.strokeColor
        }),
        this._(go.Shape, 'Rectangle', {
          margin: new go.Margin(0, 0, 20, -25),
          name: 'SHAPE',
          fill: 'transparent',
          width: this.options.widthSelectNode,
          height: 6 * this.options.itemHeight,
          strokeWidth: this.options.strokeWidth,
          stroke: this.options.strokeColor,
          portId: '',
          fromSpot: go.Spot.AllSides,
          fromLinkable: true,
          fromLinkableDuplicates: true,
          fromLinkableSelfNode: true,
          toSpot: go.Spot.AllSides,
          toLinkable: true,
          toLinkableDuplicates: true,
          toLinkableSelfNode: true
        }),
        this._(go.Panel, 'Vertical', { alignment: go.Spot.Left, margin: new go.Margin(0, 0, 0, 0) },
          this.blockOne,
          this.blockTwo,
          // this.shapeBlockHotiz(),
          this.blockShapeThree,
          this.blockThree,
          this.blockFour,
          this.blockShapeTwo,
          this.blockFive,
          this.blockSix,
          new go.Binding('visible', 'visibleLbl')
        ),
        { margin: new go.Margin(27, 0, 0, 0) }
      )
    )
  }

  podBlockSpot (value) {
    return this._(go.Panel, 'Auto', { maxSize: new go.Size(this.options.WidthOne, this.options.itemHeight / 6) },
      this._(go.Shape, 'Rectangle', {
        width: this.options.WidthOne,
        height: this.options.itemHeight / 6,
        margin: new go.Margin(0, 0, 0, 0),
        fill: null
      }, new go.Binding('fill', value))
    )
  }

  textBlockSmall (text, value, width = this.options.WidthOne) {
    return this._(go.TextBlock, text, {
      ...this.options.textOptions,
      width: width,
      margin: new go.Margin(15, 0, 0, 0),
      isMultiline: false
    }, new go.Binding('text', value).makeTwoWay())
  }

  textBlockMid (text, value, height, width) {
    return this._(go.TextBlock, text, {
      ...this.options.textOptions,
      height: height,
      width: width,
      textAlign: 'left',
      margin: new go.Margin(5, 5, 5, 5)
    }, new go.Binding('text', value).makeTwoWay())
  }

  shapeBlockVert () {
    return this._(go.Shape, {
      fill: this.options.fill,
      stroke: this.options.stroke,
      height: this.options.itemHeight,
      width: 1
    })
  }

  shapeBlockHotiz (width = 5 * this.options.WidthOne + 4) {
    return this._(go.Shape, {
      fill: this.options.fill,
      stroke: this.options.stroke,
      height: 1,
      width: width
    })
  }

  shapeBlockRectangle (valueFill, width = this.options.WidthOne) {
    return this._(go.Shape, 'Rectangle', {
      width: width,
      height: this.options.itemHeight / 6,
      margin: new go.Margin(0, 0, 0, 0),
      fill: null
    }, new go.Binding('fill', valueFill))
  }

}
