import { nextTick, ref } from 'vue';
import propostesService from '@/services/propostes.service';
import { carrega } from '@/services/loader';
import moment from 'moment';

/**
 * Composable per obtenir les propostes d'un client
 * Reutilitzable en tots els components de propostes
 */
export function useObtaPropostesClient() {
  const dataPropostes = ref(null);
  const visibleModalPropostaClient = ref(false);

  /**
   * Obté totes les propostes d'un client del servidor
   * @param {Object} client - Client seleccionat amb clientCodi i empresa
   * @param {Object} infoBusqueda - Paràmetres de cerca (magatzem, dates)
   * @returns {Promise<Object>} - Tot l'objecte resposta del servidor
   */
  const obtenirPropostesClient = async (client, infoBusqueda) => {
    
    let params = new URLSearchParams();
    params.append('magatzem', infoBusqueda.magatzem);
    
    if (infoBusqueda.dataPrevistaInici) {
      params.append('dataPrevistaInici', moment(infoBusqueda.dataPrevistaInici).format('YYYY-MM-DD'));
    }
    
    if (infoBusqueda.dataPrevistaFi) {
      params.append('dataPrevistaFi', moment(infoBusqueda.dataPrevistaFi).format('YYYY-MM-DD'));
    }
    
    // Obtenim TOTA la resposta del servidor
    const resposta = await carrega(
      propostesService.obtenirPropostesClient(
        client.clientCodi,
        client.empresa,
        params
      )
    );
  
    nextTick(() => {
      dataPropostes.value = resposta;
      visibleModalPropostaClient.value = true;
    });
    
    return resposta;
  };

  return {
    dataPropostes,
    visibleModalPropostaClient,
    obtenirPropostesClient
  };
}
