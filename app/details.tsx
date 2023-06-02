import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'
import NlwLogo from '../src/assets/nlw-spacetime-logo.svg'
import { useState, useEffect } from 'react'
import Icon from '@expo/vector-icons/Feather'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'

interface Memory {
  content: string
  coverUrl: string
  id: string
  createdAt: string
  dateEvent: string
}

export default function Details() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { id } = params
  const { bottom, top } = useSafeAreaInsets()
  const [memory, setMemory] = useState<Memory>()

  async function loadMemory(id) {
    const token = await SecureStore.getItemAsync('token')
    const response = await api.get(`/memories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemory(response.data)
  }

  function handleEdit() {
    router.push({
      pathname: '/edit',
      params: {
        id,
      },
    })
  }

  useEffect(() => {
    loadMemory(id)
  }, [id])

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="flex-1 items-center px-8">
        {/* HEADER */}
        <View className="my-4 w-full flex-row items-center justify-between">
          <NlwLogo />
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleEdit}
              className="h-10 w-10 items-center justify-center rounded-full bg-orange-400"
            >
              <Icon name="edit" size={16} color="#FFF" />
            </TouchableOpacity>
            <Link href="/memories" asChild>
              <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                <Icon name="arrow-left" size={16} color="#FFF" />
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* DETAILS */}
        {memory && (
          <View className="flex flex-col gap-4">
            <Text className="self-center font-body text-sm text-gray-100">
              Memória de{' '}
              {dayjs(memory.dateEvent).format('DD[ de ]MMMM[ de ]YYYY')}
            </Text>
            <Image
              source={{
                uri: memory.coverUrl,
              }}
              alt="Memory Image"
              className="aspect-video w-full rounded-lg"
            />
            <Text className="text-justify text-base leading-relaxed text-gray-100">
              {memory.content}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
