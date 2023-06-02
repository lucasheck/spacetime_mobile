import {
  Switch,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
} from 'react-native'
import Icon from '@expo/vector-icons/Feather'

import NlwLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import DateTimePicker from '@react-native-community/datetimepicker'
import dayjs from 'dayjs'

interface Memory {
  content: string
  coverUrl: string
  id: string
  createdAt: string
  dateEvent: string
  isPublic: boolean
}

export default function Edit() {
  const defaultMemory: Memory = {
    content: '',
    coverUrl: '',
    id: '',
    createdAt: '',
    dateEvent: '',
    isPublic: true,
  }
  const router = useRouter()
  const params = useLocalSearchParams()
  const { id } = params
  const { bottom, top } = useSafeAreaInsets()

  const [memory, setMemory] = useState<Memory>(defaultMemory)
  const [show, setShow] = useState(false)

  async function loadMemory(id) {
    const token = await SecureStore.getItemAsync('token')
    const response = await api.get(`/memories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemory(response.data)
  }

  useEffect(() => {
    loadMemory(id)
  }, [])

  async function handleUpdateMemory() {
    const token = await SecureStore.getItemAsync('token')
    const { content, isPublic, dateEvent, coverUrl } = memory
    const dateFormated = dayjs(dateEvent)
      .format('YYYY-MM-DD')
      .concat('T12:00:00.000Z')
    console.log(dateFormated)
    await api.put(
      `/memories/${id}`,
      {
        content,
        isPublic,
        dateEvent,
        coverUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    router.push({
      pathname: '/memories',
      params: { id },
    })
  }

  const onChangeDatePicker = (event, selectedDate) => {
    const currentDate = selectedDate
    setShow(false)
    setMemory({ ...memory, dateEvent: currentDate })
  }

  return (
    <ScrollView
      className="px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      {/* HEADER */}
      <View className="my-4 flex-row items-center justify-between">
        <NlwLogo />
        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>

      {/* BODY */}
      <View className="h-full w-full flex-col items-start gap-2">
        {memory.coverUrl !== '' && (
          <Image
            source={{
              uri: memory.coverUrl,
            }}
            alt="Memory Image"
            className="aspect-video w-full rounded-lg"
          />
        )}

        <View className="flex flex-row items-center gap-2">
          <Switch
            value={memory.isPublic}
            onValueChange={(value) => setMemory({ ...memory, isPublic: value })}
            thumbColor={memory.isPublic ? '#9b79ea' : '#9e9ea0'}
            trackColor={{ false: '#767577', true: '#372560' }}
          />
          <Text className="font-body text-base text-gray-200">
            {' '}
            Tornar memória pública
          </Text>
        </View>

        <TouchableOpacity
          className="flex-row items-center gap-2 pl-2"
          onPress={() => setShow(true)}
        >
          <Icon size={20} name="calendar" color="#9e9ea0" />
          <Text
            id="txtDateEvent"
            className="pl-5 font-body text-base text-gray-200"
          >
            Data do evento: {dayjs(memory.dateEvent).format('DD/MM/YYYY')}
          </Text>
        </TouchableOpacity>

        <TextInput
          multiline
          textAlignVertical="top"
          className="pb-3 pt-3 font-body text-lg text-gray-50"
          onChangeText={(text) => setMemory({ ...memory, content: text })}
          defaultValue={memory.content}
          placeholderTextColor="#56565a"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        />

        <TouchableOpacity
          className="w-full items-center rounded-full bg-green-500 px-5 py-3"
          activeOpacity={0.7}
          onPress={handleUpdateMemory}
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>

      {show && (
        <DateTimePicker
          display="calendar"
          testID="dateTimePicker"
          value={new Date(memory.dateEvent)}
          is24Hour={true}
          onChange={onChangeDatePicker}
          maximumDate={new Date()}
        />
      )}
    </ScrollView>
  )
}
