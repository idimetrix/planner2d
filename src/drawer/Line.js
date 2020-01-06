import go from 'gojs'

const line = (type, width, height) => go.GraphObject.make(go.Node, type,
  { locationSpot: go.Spot.Center },
  go.GraphObject.make(go.TextBlock, { margin: 2, editable: true }, new go.Binding('text', 'key')),
  new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
  go.GraphObject.make(go.Shape, { strokeWidth: 0, width, height }, new go.Binding('fill', 'colorLine'), new go.Binding('width', 'size'))
)

export const lineVert = line('Horizontal', 2, 100000)

export const lineHoriz = line('Vertical', 100000, 2)
