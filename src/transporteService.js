
export class TransporteService {
    constructor(contract) {
        this.contract = contract;
    }

    async comprarPasaje(pasajeIndex, from, value) {
        return this.contract.comprarPasaje(pasajeIndex, { from, value });
    }

    async getPasajes() {
        let total = await this.getTotalPasajes();
        let pasajes = [];
        for (var i = 0; i < total; i++) {
            let pasaje = await this.contract.pasajes(i);
            pasajes.push(pasaje);
        }

        return this.mapPasajes(pasajes);
    }

    async getCustomerPasajes(account) {

        let customerTotalPasajes = await this.contract.customerTotalPasajes(account);
        let pasajes = [];
        for (var i = 0; i < customerTotalPasajes.toNumber(); i++) {
            let pasaje = await this.contract.customerPasajes(account, i);
            pasajes.push(pasaje);
        }

        return this.mapPasajes(pasajes);
    }

    async getTotalPasajes() {
        return (await this.contract.totalPasajes()).toNumber();
    }

    getReembolsoEther(from) {
        return this.contract.getReembolsoEther({ from });
    }

    canjearPuntosFidelidad(from) {
        return this.contract.canjearPuntosFidelidad({ from });
    }

    mapPasajes(pasajes) {
        return pasajes.map(pasaje => {
            return {
                nombre: pasaje[0],
                precio: pasaje[1].toNumber()
            }
        });
    }
}