/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

const {Buffer} = require('buffer');
const path = require('path');
const {app, safeStorage} = require('electron');

const Store = require('electron-store');




/**
 * @typedef {Object} SecureStorageOptions
 */

/**
 *
 * @type {Record<string, Store>}
 */
const instances = {}

// public plugin api
const secureStoragePlugin = {

    /**
     *
     * @param {string} storeName
     * @param {SecureStorageOptions} opts
     * @param {CallbackContext} callbackContext
     * @void
     */
    init: ([storeName, opts], callbackContext)=>{
        if(instances[storeName])
        {
            delete instances[storeName];
        }
        const store = instances[storeName] = new Store({
            cwd: _appPackageName,
            name: "cdv-secure-storage-" + storeName,
            encryptionKey : 'MLCr3tikB9zpijaAiaiM' // this is not for security, just for obfuscation. see https://www.npmjs.com/package/electron-store#encryptionkey
        });
        callbackContext.success(store);
    },

    /**
     *
     * @param {string} storeName
     * @param {string} key
     * @param {CallbackContext} callbackContext
     * @void
     */
    get: ([storeName, key], callbackContext) => {
        const store = instances[storeName];
        if(!store)
            return callbackContext.error("store '" + storeName + "' not initialized");

        let value = store.get(key);
        if(value)
            value = safeStorage.decryptString(Buffer.from(value, 'hex')); // string to buffer
        callbackContext.success(value);
    },

    /**
     *
     * @param {string} storeName
     * @param {string} key
     * @param {string} value
     * @param {CallbackContext} callbackContext
     * @void
     */
    set: ([storeName, key, value], callbackContext) => {
        const store = instances[storeName];
        if(!store)
            return callbackContext.error("store '" + storeName + "' not initialized");
        if(!value)
            store.delete(key);
        else
            store.set(key, safeStorage.encryptString(value).toString('hex')); // buffer to string
        callbackContext.success(key);
    },

    /**
     *
     * @param {string} storeName
     * @param {string} key
     * @param {CallbackContext} callbackContext
     * @void
     */
    remove: ([storeName, key], callbackContext) => {
        const store = instances[storeName];
        if(!store)
            return callbackContext.error("store '" + storeName + "' not initialized");

        store.delete(key);
        callbackContext.success(key);
    },

    /**
     * @param {string} storeName
     * @param {CallbackContext} callbackContext
     * @void
     */
    keys: function ([storeName], callbackContext) {
        const store = instances[storeName];
        if(!store)
            return callbackContext.error("store '" + storeName + "' not initialized");

        const keys = [];
        for(const key of store){
            keys.push(key)
        }
        callbackContext.success(keys);
    },

    /**
     * @param {string} storeName
     * @param {CallbackContext} callbackContext
     * @void
     */
    clear: function ([storeName], callbackContext) {
        const store = instances[storeName];
        if(!store)
            return callbackContext.error("store '" + storeName + "' not initialized");
        store.clear();
        callbackContext.success();
    }
};

// util api for use in dependent plugins
const secureStoragePluginUtil = {

}

/**
 * cordova electron plugin api
 * @param {string} action
 * @param {Array<any>} args
 * @param {CallbackContext} callbackContext
 * @returns {boolean} indicating if action is available in plugin
 */
const plugin = function (action, args, callbackContext)
{
    if (!secureStoragePlugin[action])
        return false;
    try
    {
        secureStoragePlugin[action](args, callbackContext)
    } catch (e)
    {
        console.error(action + ' failed', e);
        callbackContext.error({message: action + ' failed', cause: e});
    }
    return true;
}

let _appPackageName;
/**
 * @param {Record<string, string>} variables
 * @param {(serviceName:string)=>Promise<any>} serviceLoader
 * @returns {Promise<void>}
 */
plugin.init = async (variables, serviceLoader)=>{
    _appPackageName = variables['PACKAGE_NAME']
}

plugin.util = secureStoragePluginUtil;

module.exports = plugin;

