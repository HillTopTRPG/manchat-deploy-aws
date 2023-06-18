import {AuthOptions, createAuthLink} from 'aws-appsync-auth-link'
import {ApolloClient, ApolloLink, InMemoryCache} from '@apollo/client/core'
import {createSubscriptionHandshakeLink} from 'aws-appsync-subscription-link'
import {InjectionKey, reactive} from 'vue'
import {
  Room,
  User,
  InitMutationResult,
  GetRoomQueryResult,
  GetUserQueryResult,
  GetRoomsQueryResult,
  AddRoomMutationResult,
  EntryRoomMutationResult,
  SignUpMutationResult,
  SignInMutationResult,
  Mutations,
  Queries,
} from "@/views/graphql/schema";

function makeGraphQlClient(endPointUrl: string, region: string, getAuthToken: () => string) {
  const auth: AuthOptions = {
    type: 'AWS_LAMBDA',
    token: getAuthToken
  }
  const link = ApolloLink.from([
    createAuthLink({url: endPointUrl, region, auth}),
    createSubscriptionHandshakeLink({url: endPointUrl, region, auth})
  ])
  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  })
}

const DEFAULT_URL = 'https://ni7c4yvt6rbhjiqt4hmsqkkybi.appsync-api.ap-northeast-1.amazonaws.com/graphql'
const DEFAULT_REGION = 'ap-northeast-1'

export default function useGraphQl(
  connectionId: string,
  roomToken: string,
  userToken: string,
  graphQlUrl: string = DEFAULT_URL,
  region: string = DEFAULT_REGION
) {
  // 状態
  const state = reactive<{
    ready: boolean;
    connectionId: string;
    roomId: string;
    roomToken: string;
    userId: string;
    userToken: string;
    rooms: Room[]
    users: User[]
  }>({
    ready: false,
    connectionId,
    roomId: '',
    roomToken,
    userId: '',
    userToken,
    rooms: [],
    users: []
  })

  // ロジック
  let appSyncClient = makeGraphQlClient(graphQlUrl, region, getAuthToken)

  function getAuthToken(): string {
    if (!state.connectionId) {
      return '1'
    }
    // console.log(JSON.stringify({ authorize }))
    return [state.connectionId, state.roomToken, state.userToken].filter(s => s).join('/')
  }

  async function initialize() {
    state.roomId = ''
    state.userId = ''
    state.rooms = []
    state.users = []
    state.ready = false

    if (appSyncClient) {
      await appSyncClient.clearStore()
      appSyncClient.stop()
    }

    const result = await fetch('/api')
    console.log(JSON.stringify(result, null, 2))

    if (!state.connectionId) {
      const initResult = await appSyncClient.mutate<InitMutationResult>({ mutation: Mutations.initMutation })
      state.connectionId = initResult.data?.init.connectionId || ''
      console.log(initResult)
      history.replaceState(null, '', `/${getAuthToken()}`)
    }

    if (state.roomToken) {
      const getRoomResult = await appSyncClient.query<GetRoomQueryResult>({
        query: Queries.getRoomQuery,
        variables: {
          roomToken: state.roomToken
        },
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getRoomResult.data, null, 2))
      state.roomId = getRoomResult.data.getRoom.id || null
      state.users = getRoomResult.data.getRoom.users || null
    } else {
      const getRoomsResult = await appSyncClient.query<GetRoomsQueryResult>({
        query: Queries.getRoomsQuery,
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getRoomsResult.data, null, 2))
      state.rooms = getRoomsResult?.data?.getRooms || []
    }

    if (state.userToken) {
      const getUserResult = await appSyncClient.query<GetUserQueryResult>({
        query: Queries.getUserQuery,
        variables: {
          userToken: state.userToken
        },
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getUserResult.data, null, 2))
      state.userId = getUserResult.data.getUser.id || null
    }

    state.ready = true
  }
  initialize().then()

  async function addRoom(roomName: string, roomPassword: string) {
    if (!appSyncClient) return
    const addRoomResult = await appSyncClient.mutate<AddRoomMutationResult>({
      mutation: Mutations.addRoomMutation,
      variables: { roomName, roomPassword }
    })
    console.log(JSON.stringify(addRoomResult.data, null, 2))
    state.roomId = addRoomResult?.data?.addRoom.id || ''
    state.roomToken = addRoomResult?.data?.addRoom.token || ''
    history.replaceState(null, '', `/${getAuthToken()}`)
  }

  async function entryRoom(id: string, password: string) {
    if (!appSyncClient) {
      return
    }
    const entryRoomResult = await appSyncClient!.mutate<EntryRoomMutationResult>({
      mutation: Mutations.entryRoomMutation,
      variables: {
        roomId: id,
        roomPassword: password
      },
      fetchPolicy: 'no-cache'
    })
    console.log(JSON.stringify(entryRoomResult.data, null, 2))
    state.roomId = entryRoomResult.data?.entryRoom.id || ''
    state.roomToken = entryRoomResult.data?.entryRoom.token || ''
    state.users = entryRoomResult.data?.entryRoom.users || []
    history.replaceState(null, '', `/${getAuthToken()}`)
    console.log(JSON.stringify(state.users, null, 2))
  }

  async function signUp(userName: string, userPassword: string) {
    if (!appSyncClient) return
    const signUpResult = await appSyncClient!.mutate<SignUpMutationResult>({
      mutation: Mutations.signUpMutation,
      variables: { userName, userPassword }
    })
    console.log(JSON.stringify(signUpResult.data, null, 2))
    state.userId = signUpResult.data?.signUp.id || ''
    state.userToken = signUpResult.data?.signUp.token || ''
    history.replaceState(null, '', `/${getAuthToken()}`)
  }

  async function signIn(userId: string, userPassword: string) {
    if (!appSyncClient) return
    const signInResult = await appSyncClient!.mutate<SignInMutationResult>({
      mutation: Mutations.signInMutation,
      variables: { userId, userPassword }
    })
    console.log(JSON.stringify(signInResult.data, null, 2))
    state.userId = signInResult.data?.signIn.id || ''
    state.userToken = signInResult.data?.signIn.token || ''
    history.replaceState(null, '', `/${getAuthToken()}`)
  }

  return {
    state,
    addRoom,
    entryRoom,
    signUp,
    signIn
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore')
