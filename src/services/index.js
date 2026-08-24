import axios from 'axios';
import Swal from 'sweetalert2';
import i18n from '@/i18n/i18n'
import keycloak from '@/keycloak/keycloak';
import moment from 'moment';

const { locale } = i18n.global;

function createInstance(baseURL) {
    const instance = axios.create({
        baseURL,
        timeout: 45000,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // REQUEST INTERCEPTOR
    instance.interceptors.request.use(async config => {
        await keycloak?.updateToken();

        config.headers['Accept-Language'] = locale.value;
        config.headers['usuari'] = keycloak.idTokenParsed.username;
        config.headers['nom_usuari'] = keycloak.idTokenParsed.name;
        config.headers['email'] = keycloak.idTokenParsed.email;
        config.headers['Authorization'] = 'Bearer ' + keycloak.token;
        config.headers['DataLocal'] = moment().format('YYYY-MM-DD HH:mm:ss');

        return config;
    });

    // RESPONSE INTERCEPTOR
    instance.interceptors.response.use(
        response => response.data,
        error => {
            // En cas que s'indiqui que no es vol gestionar l'error, no mostrar el Swal
            if (error.config?.errorHandle !== false) {
                handleError(error);
            }
            return Promise.reject(error);
        }
    );

    return instance;
}

// Función para mostrar errores
function handleError(error) {
    const { t } = i18n.global;

    if (error.response) {
        if (error.response.data instanceof Blob) {
            error.response.data.text().then(resp => {
                showSwalError(JSON.parse(resp).message);
            });
        } else {
            if (error.response.data.message) {
              showSwalError(error.response.data.message.replace(/(?:\r\n|\r|\n)/g, '<br>'));
            } else {
              showSwalError("Internal server error: " + error.response.data.stackTraceError.substring(0, 200));
            }
        }
    } else if (error.request) {
        if (error.name !== 'CanceledError')
            showSwalError(error.message, t('App.Error Peticio'));
    } else {
        showSwalError(error.message, t('App.Error Peticio'));
    }
}

function showSwalError(text, title = '') {
    Swal.fire({
        allowOutsideClick: false,
        didOpen: () => Swal.getConfirmButton().focus(),
        icon: 'error',
        title,
        text
    });
}

export const apiComercial = createInstance(process.env.VUE_APP_API_URL);
export const apiOrganigrama = createInstance(process.env.VUE_APP_API_URL_ORGANIGRAMA);