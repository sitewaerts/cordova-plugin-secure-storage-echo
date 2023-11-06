// Type definitions for Apache Cordova Secure Storage Echo plugin
// Project: https://github.com/sitewaerts/cordova-plugin-secure-storage-echo
// Definitions by: Microsoft Open Technologies Inc. <http://msopentech.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// Copyright (c) Microsoft Open Technologies Inc
// Licensed under the MIT license

interface SecureStorageOptionsOSSpecific {

}

interface SecureStorageOptionsAndroid extends SecureStorageOptionsOSSpecific {

}

interface SecureStorageOptionsElectron extends SecureStorageOptionsOSSpecific {

}

interface SecureStorageOptionsIOS extends SecureStorageOptionsOSSpecific {

}

interface SecureStorageOptionsWindows extends SecureStorageOptionsOSSpecific {

}

interface SecureStorageOptions {
    android?: SecureStorageOptionsAndroid
    electron?: SecureStorageOptionsElectron
    ios?: SecureStorageOptionsIOS
    windows?: SecureStorageOptionsWindows
}

interface SecureStorage {

    get: (success: (value: string) => void, error: (error: any) => void, key: string) => void

    set: (success: (key: string) => void, error: (error: any) => void, key: string, value: string | null) => void

    remove: (success: (key: string) => void, error: (error: any) => void, key: string) => void

    keys: (success: (keys: Array<string>) => void, error: (error: any) => void) => void

    clear: (success: () => void, error: (error: any) => void) => void
}

interface CordovaPlugins {
    SecureStorage: new (success: () => void, error: (error: any) => void, service: string, options?: SecureStorageOptions) => SecureStorage
}
