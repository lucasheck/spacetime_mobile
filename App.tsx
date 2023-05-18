import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'

export default function App() {
  return (
    <View className="h-full w-full  flex-1 items-center justify-center bg-black">
      <Text className="pt-10 text-5xl font-bold text-zinc-50">Lucas Heck!</Text>
      <StatusBar style="light" translucent />
    </View>
  )
}
