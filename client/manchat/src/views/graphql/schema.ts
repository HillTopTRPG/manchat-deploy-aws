import gql from 'graphql-tag'

const initMutation = gql(`
mutation Init {
  init {
    connectionId
  }
}
`)
export type InitMutationResult = {
  init: {
    connectionId: string
  }
}
const addRoomMutation = gql(`
mutation AddRoom($roomName: String!, $roomPassword: String!) {
  addRoom(input: {name: $roomName, password: $roomPassword}) {
    id
    token
    name
  }
}
`)
export type AddRoomMutationResult = {
  addRoom: {
    id: string,
    token: string,
    name: string
  }
}
const entryRoomMutation = gql(`
mutation EntryRoom($roomPassword: String!, $roomId: String!) {
  entryRoom(input: {roomId: $roomId, password: $roomPassword}) {
    id
    token
    name
    users {
      id
      name
      type
      createdAt
      lastLoggedIn
      connection {
        id
      }
    }
  }
}
`)
export type EntryRoomMutationResult = {
  entryRoom: {
    id: string,
    token: string,
    name: string,
    users: User[]
  }
}
const signUpMutation = gql(`
mutation SignUp($userName: String!, $userPassword: String!) {
  signUp(input: {name: $userName, password: $userPassword}) {
    id
    token
    name
    lastLoggedIn
    lastLoggedOut
  }
}
`)
const signInMutation = gql(`
mutation SignIn($userId: String!, $userPassword: String!) {
  signIn(input: {userId: $userId, password: $userPassword}) {
    id
    token
    name
    lastLoggedIn
    lastLoggedOut
  }
}
`)
export type SignUpMutationResult = {
  signUp: {
    id: string,
    token: string,
    name: string
  }
}
export type SignInMutationResult = {
  signIn: {
    id: string,
    token: string,
    name: string
  }
}
const getRoomsQuery = gql(`
query GetRooms {
  getRooms {
    id
    name
    createdAt
    users {
      id
      name
      type
      createdAt
      lastLoggedIn
    }
  }
}
`)
const getRoomQuery = gql(`
query GetRoom($roomToken: String!) {
  getRoom(roomToken: $roomToken) {
    id
    name
    createdAt
    users {
      id
      name
      type
      createdAt
      lastLoggedIn
    }
  }
}
`)
export type Room = {
  id: string,
  name: string,
  createdAt: number,
  users: {
    id: string,
    name: string,
    type: string,
    createdAt: number,
    lastLoggedIn: number
  }[]
}
export type GetRoomsQueryResult = {
  getRooms: Room[]
}
export type GetRoomQueryResult = {
  getRoom: Room
}
export type GetUserQueryResult = {
  getUser: User
}

// const getUsersQuery = gql(`
// query GetUsers($roomId: ID!) {
//   getUsers(roomId: $roomId) {
//     id
//     name
//     createdAt
//     lastLoggedIn
//   }
// }
// `)
const getUserQuery = gql(`
query GetUser($userToken: String!) {
  getUser(userToken: $userToken) {
    id
    name
    type
    connections {
      id
    }
  }
}
`)
export type User = {
  id: string,
  name: string,
  type: string,
  createdAt: number,
  lastLoggedIn: number,
  connection: {
    id
  }
}

export type Chat = {
  id: string,
  raw: string,
  owner: string,
  createdAt: number
}

export const Mutations = {
  initMutation,
  addRoomMutation,
  entryRoomMutation,
  signUpMutation,
  signInMutation
}

export const Queries = {
  getRoomsQuery,
  getRoomQuery,
  getUserQuery,
}


export interface UserTypeSelection {
  title: string
  value: string
  hint: string
}

export const userTypeSelection: UserTypeSelection[] = [
  {
    title: 'マスター',
    value: 'master',
    hint : '特別な操作が許可されます。',
  }, {
    title: 'プレイヤー',
    value: 'player',
    hint : '',
  }, {
    title: '見学者',
    value: 'visitor',
    hint : '閲覧のみ許可されます。',
  },
]
