import {UserProvider} from "../context";

export default function AppProvider({children}) {
    // her yeni provider olayında iç içe yazmanız gerekiyor
    return (
        <UserProvider>
            {children}
        </UserProvider>
    )
}
