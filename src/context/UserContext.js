import {createContext, useContext, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import cryptoJS from "react-native-crypto-js";
import RestClient from "../RestAPI/RestClient";
import AppUrl from "../RestAPI/AppUrl";
import * as NavigationService from "../common/NavigationService";


const UserContext = createContext({
    appState: '',
    saveToken: () => {
    },
    getToken: () => {
    },
    getAccessToken: () => {
    },
    removeToken: () => {
    },
    redirectControl: () => {
    },
    tokenControl: () => {
    },
});

export const UserProvider = ({children}) => {
    const [appState, setAppState] = useState('Mobile Lab');


    const saveToken = async (token) => {
        try {
            const encryptedState = cryptoJS.AES.encrypt(JSON.stringify(appState), "key").toString();
            await AsyncStorage.setItem("appState", encryptedState);
            setAppState(appState);
        } catch (e) {
            console.log("Error saving token:", e);
        }
    }

    const getAccessToken = async () => {
        try {
            const appStateData = await AsyncStorage.getItem("appState");

            if (appStateData) {
                const bytes = cryptoJS.AES.decrypt(appStateData, "key");
                const originalText = bytes.toString(cryptoJS.enc.Utf8);
                setAppState(JSON.parse(originalText));
            } else {
                setAppState(null);
            }
        } catch (e) {
            console.log("Error retrieving access token:", e);
        }
    };

    const getToken = async () => {
        try {
            await getAccessToken();
            redirectControl();
        } catch (e) {
            console.log("Error getting token:", e);
        }
    };

    const removeToken = async () => {
        try {
            await logoutServer();
            await AsyncStorage.removeItem("appState");
            setAppState(null);
            redirectControl();
        } catch (e) {
            console.log("Error removing token:", e);
        }
    };

    const logoutServer = async () => {
        try {
            await getAccessToken();
            const token = this.appState?.user?.access_token;

            await RestClient.getRequest(AppUrl.logout, {
                headers: {
                    "Authorization": "Bearer " + token,
                },
            });
        } catch (err) {
            console.log("Token control error:", err);
            return false;
        }
    };

    const redirectControl = () => {
        if (!this.appState) {
            NavigationService.navigate("Login");
            return false;
        } else {
            tokenControl().then((result) => {
                if (result) {
                    NavigationService.navigate("HomeNavigator");
                }
            });
        }
    };

    const tokenControl = async () => {
        try {
            await getAccessToken();
            const token = this.appState?.user?.access_token;

            if (!token) {
                await removeToken();
                return false;
            }

            const res = await RestClient.getRequest(AppUrl.check, {
                headers: {
                    "Authorization": "Bearer " + token,
                },
            });

            const result = res.data;

            if (result.data.isLoggedIn !== true) {
                await removeToken();
                return false;
            } else {
                let userData = {
                    id: result.data.id,
                    c_code: result.data.c_code,
                    c_name: result.data.c_name,
                    c_surname: result.data.c_surname,
                    email: result.data.email,
                    access_token: result.data.access_token,
                };

                let appStateData = {
                    isLoggedIn: true,
                    user: userData,
                };

                await saveToken(appStateData);
                return true;
            }
        } catch (err) {
            console.log("Token control error:", err);
            await removeToken();
            return false;
        }
    };

    const values = {
        appState,
        saveToken,
        getAccessToken,
        getToken,
        removeToken,
        logoutServer,
        redirectControl,
    }

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
}


export const useUser = () => {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
