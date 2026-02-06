import React from 'react'
import {Text, View} from "react-native";
import {useUser} from "../../context";

const Home = () => {
    // global state örneği
    const {appState} = useUser();

    return (
        <View>
            <Text>{appState}</Text>
        </View>
    )
}

export default Home
