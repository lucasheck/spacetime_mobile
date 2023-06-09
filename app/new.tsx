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
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function New() {
  const router = useRouter()
  const { bottom, top } = useSafeAreaInsets()

  const [isPublic, setIsPublic] = useState(false)
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState('')
  const [dateEvent, setDateEvent] = useState(new Date()) // 28/05/2023
  const [show, setShow] = useState(false)

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (result.assets[0]) {
        setPreview(result.assets[0].uri)
      }
    } catch {}
  }

  async function handleCreateMemory() {
    const token = await SecureStore.getItemAsync('token')

    let coverUrl = ''

    if (preview) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', {
        name: 'image.jpg',
        type: 'image/jpeg',
        uri: preview,
      } as any)

      try {
        const uploadResponse = await api.post('/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        coverUrl = uploadResponse.data.fileUrl
      } catch (error) {
        console.log(error)
      }

      const memory = await api.post(
        '/memories',
        {
          content,
          isPublic,
          coverUrl,
          dateEvent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      let id = ''
      if (memory.status === 200) {
        id = memory.data.id
      }

      router.push({
        pathname: '/memories',
        params: { id },
      })
    }
  }

  const onChangeDatePicker = (event, selectedDate) => {
    const currentDate = selectedDate
    setShow(false)
    setDateEvent(currentDate)
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NlwLogo />
        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>
      <View className="mt-6 space-y-6">
        <View className="flex-row items-center gap-2">
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
            trackColor={{ false: '#767577', true: '#372560' }}
          ></Switch>
          <Text className="font-body text-base text-gray-200">
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
            Data do evento: {dateEvent.getDate()}/{dateEvent.getMonth() + 1}/
            {dateEvent.getFullYear()}
          </Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            display="calendar"
            testID="dateTimePicker"
            value={dateEvent}
            is24Hour={true}
            onChange={onChangeDatePicker}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity
          onPress={openImagePicker}
          className="h-32 items-center justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              alt="Image Selected"
              className="h-full w-full rounded-lg object-cover"
            ></Image>
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="image" color="#fff" />
              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou vídeo de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          multiline
          textAlignVertical="top"
          className="pt-0 font-body text-lg text-gray-50"
          onChangeText={setContent}
          placeholderTextColor="#56565a"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        />

        <TouchableOpacity
          className="items-center rounded-full bg-green-500 px-5 py-3"
          activeOpacity={0.7}
          onPress={handleCreateMemory}
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
