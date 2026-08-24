import { apiComercial } from '@/services/index.js';
import { CanceledError } from 'axios';

class OFService {
    
    async abortingCall(call) {
        try {
        return await call();
        } catch (e) {
        if (e instanceof CanceledError) return Promise.resolve([]);
        }
    }

    obtenirInfoCapsalera(artInt, cliCod, articleClient) {
        let urlParams = new URLSearchParams();
        urlParams.append("artInt", artInt);
        urlParams.append("cliCod", cliCod);
        return apiComercial.get(`ofs/historic/${articleClient}`, { params: urlParams });
    }

    obtenirOFByArtCli(artInt, cliCod) {
        return apiComercial.get(`ofs/artcli/${artInt}/${cliCod}`);
    }

    obtenirOFByNumOF(numOF) {
        return apiComercial.get(`ofs/${numOF}`);
    }

    anularOF(numero) {
        return apiComercial.put(`ofs/${numero}/anular`);
    }

}

export default new OFService();