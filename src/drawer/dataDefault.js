import go from 'gojs'

export const VALUE_FOR_DRAWER = {
  redColor: '#ff99aa',
  greenColor: '#99ff33',
  blueColor: '#99ffff',
  yellowColor: '#FFFF00',
  smokeColor: '#eaeaea',
  srcBackgroundRed: 'src/img/patterns/cPink.png',
  srcBackgroundBlue: 'src/img/patterns/cBlue.png',
  srcBackgroundGreen: 'src/img/patterns/cGreen.png',
  srcBackgroundYellow: 'src/img/patterns/cYellow.png',
  srcBackgroundSmoke: 'src/img/patterns/cWhite.png',
  colorLine: '#FF4500',
  linkColorSelect: '#5F9EA0',
  groupOne: 'groupe1Full',
  groupOneHalf: 'groupe1NotFull',
  groupTwo: 'groupe2',
  groupOptim: 'groupOptim',
  menuWidth: 100,
  menuHeight: 20,
  typePrePlanner: 'pre-planner',
  typePlanner: 'planner',
  categoryLine: 'lineVert',
  token: Math.random() * 100000
}

export const VALUE_FOR_NODES = {
  columns: 5,
  borderColor: 'black',
  columnColor: 'white',
  fontSize: '18px ',
  fontFamily: 'PermanentMarker',
  strokeWidth: 0,
  strokeColor: 'white',
  rowsNumber: 6,
  limScaleForSizeSelection: 0.4297
}

export const NODE = {
  zOrder: 0,
  misColor: '#FFFFFF',
  funColor: '#FFFFFF',
  jurisColor: '#FFFFFF',
  idColor: '#FFFFFF',
  deptColor: '#FFFFFF',
  visibleLbl: true,
  source: VALUE_FOR_DRAWER.srcBackgroundBlue,
  lastCategory: VALUE_FOR_DRAWER.groupOneHalf,

  amountFiles: 2,
  isAmountFiles: true,
  sizeBtnIcon: new go.Size(50, 50),
  mrgnSelectHoriz: new go.Margin(0, 30, 5, 0),
  sizeBtnNote: new go.Size(30, 48),
  sizeBtnFile: new go.Size(20, 48),
  widthCircle: 20,
  heightCircle: 20,
  fontAmountNote: '16px PermanentMarker',
  bounds: new go.Rect(0, 0, 447, 264),

  ID: 'ID',
  misText: 'mission',
  funText: 'function',
  jurisText: 'Jurisdiction',
  deptText: 'Department',

  Position: 'Position',
  Resources: 'Resources',
  ResourcesNotes: ' add notes',
  SumText: 'Summary text',
  messages: [],
  files: []
}

export const NODE_DATA_ARRAY = []

for (let i = 0; i < 1000; i++) {
  NODE_DATA_ARRAY.push({
    key: i,
    ...{ ...NODE },
    category: 'groupe2'
  })
}

export const LINK_DATA_ARRAY = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 }
]

// {
//   author: '007',
//     link: '00',
//   type: 'PNG',
//   date: '14/05/15'
// }
// {
//   author: 'John',
//     message: 'Fear',
//   date: '13/01/1966'
// },
