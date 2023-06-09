import { TouchableOpacity, View, ScrollView, Image, Text } from 'react-native'
import Icon from '@expo/vector-icons/Feather'
import * as SecureStore from 'expo-secure-store'

import NlwLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'

dayjs.locale(ptBr)

interface MemoriesProps {
  content: string
  coverUrl: string
  id: string
  createdAt: string
  dateEvent: string
}

export default function Memories() {
  const [memories, setMemories] = useState<MemoriesProps[]>([])

  const { bottom, top } = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams()
  const { id = 0 } = params

  async function handleSignOut() {
    await SecureStore.deleteItemAsync('token')
    router.push('/')
  }

  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token')

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemories(response.data)
  }

  function handleDetails(id: string) {
    router.push({
      pathname: '/details',
      params: {
        id,
      },
    })
  }

  useEffect(() => {
    loadMemories()
  }, [id])

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: bottom + 50, paddingTop: top }}
    >
      {/* HEADER */}
      <View className="mt-4 flex-row items-center justify-between px-8">
        <NlwLogo />

        <View className="flex-row gap-2">
          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            onPress={handleSignOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      {/* BODY */}
      <View className="mt-6 space-y-10">
        {memories.length === 0 ? (
          <View className="mx-10 mt-20 h-screen items-center">
            <Text className="font-body text-base leading-relaxed text-gray-100">
              Você ainda não registrou nenhuma lembrança. Comece cadastrando a
              sua primeira.
            </Text>
          </View>
        ) : (
          memories.map((memory) => {
            return (
              <View key={memory.id} className="space-y-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-px w-5 bg-gray-50" />
                  <Text className="font-body text-xs text-gray-100">
                    {dayjs(memory.dateEvent).format('DD[ de ]MMMM[ de ]YYYY')}
                  </Text>
                </View>
                <View className="space-y-4 px-8">
                  <Image
                    alt="Imagem da Lembrança"
                    className="aspect-video w-full rounded-lg"
                    source={{
                      uri: memory.coverUrl,
                    }}
                  />
                  <Text className="text-justify font-body text-base leading-relaxed text-gray-100">
                    {memory.content}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDetails(memory.id)}
                    className="flex-row items-center justify-end gap-2"
                  >
                    <Text className="font-body text-sm text-gray-200">
                      Ler mais{' '}
                    </Text>
                    <Icon name="arrow-right" size={16} color="#9e9ea0" />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}
