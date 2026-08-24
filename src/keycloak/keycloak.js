import Keycloak from 'keycloak-js'

let initOptions = {
    url: process.env.VUE_APP_KEYCLOAK_URL,
    realm: process.env.VUE_APP_KEYCLOAK_REALM, 
    clientId: process.env.VUE_APP_KEYCLOAK_CLIENT
}

const keycloak = new Keycloak(initOptions);

export function nomUsuari() {
    return keycloak?.idTokenParsed?.name.toUpperCase();
}

export function usuari() {
    return keycloak?.idTokenParsed?.username;
}

export function email() {
    return keycloak?.idTokenParsed?.email;
}

export default keycloak