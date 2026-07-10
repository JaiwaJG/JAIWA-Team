/* ==========================================================
   JAIWA Team
   File : assets/js/storage.js
   Purpose : Storage Manager
   Version : 1.0.0
========================================================== */

"use strict";

//Namespace

const Storage = {};

//Local Storage

Storage.save = function(key, value){

    try{
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    }

    catch(error){
        console.error(error);
        return false;
    }

};


Storage.get = function(key){

    try{
        const value = localStorage.getItem(key);
        return value
            ? JSON.parse(value)
            : null;

    }

    catch(error){
        console.error(error);
        return null;

    }

};

Storage.remove = function(key){
    localStorage.removeItem(key);

};

Storage.saveRefreshToken = function(token){
    Storage.save(
        CONFIG.REFRESH_TOKEN_KEY,
        token
    );

};

Storage.getRefreshToken = function(){

    return Storage.get(
        CONFIG.REFRESH_TOKEN_KEY
    );

};

Storage.removeRefreshToken = function(){
    Storage.remove(
        CONFIG.REFRESH_TOKEN_KEY
    );

};

Storage.clear = function(){
    localStorage.clear();

};

//Session Storage

Storage.saveSession = function(key, value){
    sessionStorage.setItem(
        key,
        JSON.stringify(value)

    );

};


Storage.getSession = function(key){
    const value =
        sessionStorage.getItem(key);
    return value
        ? JSON.parse(value)
        : null;

};


Storage.removeSession = function(key){
    sessionStorage.removeItem(key);

};


Storage.clearSession = function(){
    sessionStorage.clear();

};

//Authentication

/*Storage.saveToken = function(token){
    Storage.save(
        CONFIG.TOKEN_KEY,
        token

    );

};*/

//chyam 
Storage.saveToken = function(token){

    Storage.save(
        CONFIG.TOKEN_KEY,
        token
    );

    console.log(
        "Saved =",
        localStorage.getItem(CONFIG.TOKEN_KEY)
    );

};

Storage.saveRefreshToken = function(token){
    Storage.save(
        CONFIG.REFRESH_TOKEN_KEY,
        token
    );

};

Storage.getRefreshToken = function(){
    return Storage.get(
        CONFIG.REFRESH_TOKEN_KEY
    );

};


Storage.removeRefreshToken = function(){
    Storage.remove(
        CONFIG.REFRESH_TOKEN_KEY
    );

};

Storage.getToken = function(){
    return Storage.get(
        CONFIG.TOKEN_KEY

    );

};


Storage.removeToken = function(){
    Storage.remove(
        CONFIG.TOKEN_KEY

    );

};

Storage.saveUser = function(user){
    Storage.save(
        CONFIG.USER_KEY,
        user

    );

};

Storage.getUser = function(){
    return Storage.get(
        CONFIG.USER_KEY

    );

};

Storage.removeUser = function(){
    Storage.remove(
        CONFIG.USER_KEY

    );

};