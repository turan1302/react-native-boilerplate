import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {navigationRef} from '../common/NavigationService';
import {useNetInfo} from "@react-native-community/netinfo";
import {Alert, BackHandler} from "react-native";
import Home from "../screens/Home";

const Stack = createNativeStackNavigator();

const Routes = () => {
    const NetInfo = useNetInfo();
    useEffect(() => {
        bagliMi();
    }, [NetInfo.isConnected,NetInfo.isWifiEnabled]);

    const bagliMi = () => {
        if (NetInfo.isConnected===false){
            Alert.alert('Uyarı', 'İnternet Bağlantısı Gereklidir !', [
                {text: 'Tamam', onPress: () => BackHandler.exitApp()},
            ]);
        }
    }

    const handleRouteChange = async ()=>{
        // her rotasyonda çalışacak işlemi seçebilirsiniz
    }

    return (
        <NavigationContainer onStateChange={handleRouteChange} ref={navigationRef}>
            <Stack.Navigator id={"1"} initialRouteName={'Home'} screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
            }}>
                <Stack.Screen name={'Home'} component={Home}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;
