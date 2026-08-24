import { apiComercial } from '@/services/index.js';
import { CanceledError } from 'axios';

class MagatzemService {
    
    async abortingCall(call) {
        try {
        return await call();
        } catch (e) {
        if (e instanceof CanceledError) return Promise.resolve([]);
        }
    }

    reportLocalitzacio(artInt, codClient) {
        let urlParams = new URLSearchParams();
        urlParams.append('artInt', artInt);
        urlParams.append('codClient', codClient);

        return apiComercial.get('ext/magatzem/localitzacio', {
            params: urlParams,
            responseType: 'blob',
        });
    }

    reportTrasabilitat(artInt, codClient) {
        let urlParams = new URLSearchParams();
        urlParams.append('artInt', artInt);
        urlParams.append('codClient', codClient);

        return apiComercial.get('ext/magatzem/trasabilitat', {
            params: urlParams,
            responseType: 'blob',
        });
    }

}

export default new MagatzemService();