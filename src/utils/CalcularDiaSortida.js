import moment from "moment";

function calcularDiaSortida(dataSolicitada, diesTransit, diesSortida = "") {
    let resultat = moment(dataSolicitada);

    if (diesTransit < 0) {
        // En cas que els dies de transit sigui negatiu no s'han de restar
        // els caps de setmana (es a dir només son dies hàbils)
        let diesRestats = 0;
        while (diesRestats < Math.abs(diesTransit)) {
            resultat = resultat.subtract(1, 'days');
            const dayOfWeek = resultat.isoWeekday();
            if (dayOfWeek !== 6 && dayOfWeek !== 7) {
                diesRestats++;
            }
        }
    } else {
        resultat.subtract(diesTransit, 'days');
    }

    // En cas que no estigui informat per defecte es serveix de dilluns a divendres, en cas que estigui informat
    // es normalitzi per a que es representi de dilluns a diumenge ja que està emmagatzemat de diumenge a dissabte ( XXXXX )
    let diesSortidaNorm = diesSortida.trim() === "" ? "XXXXX  " : diesSortida.substring(1).padEnd(7, " ");

    // Cal buscar el primer dia en que hi ha servei
    let isValidDate = diesSortidaNorm.charAt(resultat.isoWeekday() - 1) !== ' ';
    while (!isValidDate) {
        resultat = resultat.subtract(1, 'days');
        isValidDate = diesSortidaNorm.charAt(resultat.isoWeekday() - 1) !== ' ';
    }

    // En cas que la data calculada sigui anterior al dia d'avui es retorna el dia d'avui
    const avui = moment().startOf("day");
    if (resultat.isBefore(avui))
        return avui;

    return resultat;
}

export { calcularDiaSortida }